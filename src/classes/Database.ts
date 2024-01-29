import Util from "./Util";
import Page from "./Page";
import Rules from "./Rules";
import Book from "./Book";
import Model from "./Model";
import {
  BookInterface,
  BookSettings,
  Pages,
  DatabaseInterface,
  DatabaseType,
  Books,
  DatabaseSettings,
  DatabasePathSettings,
  BookPathSettings,
} from "../types";
import path from "path";
import fs from "fs";

export default class Database implements DatabaseInterface {
  _id: string;
  _path: string;
  settings: DatabasePathSettings;
  private _error: any;

  constructor(settings: DatabaseSettings) {
    this._id = settings.id;
    this._path = settings.path;
    this.settings = settings.settings as DatabasePathSettings;
    this.init();
  }
  get settings_path(): string {
    return path.join(this._path, "settings.json");
  }
  get _settings(): DatabasePathSettings {
    return Util.readJSON(this.settings_path);
  }
  updateSettings(settings: any) {
    this.settings = { ...this._settings, ...settings };
    let lm = new Date(Date.now()).toISOString();
    this.settings.lm = lm;
    Util.writeFile(this.settings_path, JSON.stringify(this.settings));
  }
  init() {
    if (!Util.exists(this._path) || !Util.exists(this.settings_path)) {
      // create the database folder
      if (!Util.exists(this._path)) Util.mkdir(this._path);
      // create the settings file

      Util.writeFile(
        this.settings_path,
        JSON.stringify({
          ...Util.defaultDatabasePathSettings(this),
          ...this.settings,
        })
      );
    } else {
      this.updateSettings(this.settings);
    }
    this.audit();
  }
  get _doc() {
    return this._settings.doc;
  }
  get _lm() {
    return this._settings.lm;
  }
  update(data?: any) {
    this.updateSettings(data);
  }
  getBookSettings(bookId?: string) {
    return bookId
      ? this._books.find((book) => book._id === bookId)?._settings
      : this._books.map((b) => b._settings);
  }
  get _books() {
    let books: Books = [];
    // loop through every book folder
    for (const bookFolder of Util.listFolders(this._path)) {
      //   get book settings path
      let bookSettingsPath = path.join(this._path, bookFolder, "settings.json");
      if (!Util.exists(bookSettingsPath))
        throw new Error(
          `Book settings file for book '${bookFolder}' does not exist`
        );
      let bookSettings = Util.readJSON(bookSettingsPath) as BookSettings;
      let book = new Book({ ...bookSettings, id: bookFolder });
      books.push(book);
    }
    return books;
  }
  get _s() {
    return this._books.reduce((acc, book) => acc + book._s, 0);
  }
  get _type() {
    return this._settings.type;
  }
  get bookIds() {
    return this._books.map((book) => book._id);
  }
  createBook(model_name: string) {
    if(this.hasModel(model_name)) throw new Error(`Book with model name '${model_name}' already exists`)
    let id = Util.generateId(this.bookIds, new Date(Date.now()));
    let book = new Book({
      id,
      model_name,
      path: path.join(this._path, id),
    });
    return book;
  }
  getBook(bookId: string) {
    return this._books.find((book) => book._id === bookId);
  }
  getBookFromModel(model_name: string) {
    return this._books.find((book) => book.model_name === model_name);
  }
  save_data(data: any, model_name: string) {
    let book = this.getBookFromModel(model_name);
    if (!book) book = this.createBook(model_name);
    book.save_data(data);
    this.update();
  }
  hasModel(model_name: string) {
    return this.getBookFromModel(model_name) ? true : false;
  }
  getRules(model_name: string) {
    let book = this.getBookFromModel(model_name);
    if (!book) return null;
    return book.rules;
  }
  deleteBook(bookId: string) {
    let book = this.getBook(bookId);
    if (!book) return;
    Util.deleteFolder(book._path);
    this.update();
    return true;
  }
  delete_data(model_id: string, model_name: string) {
    let book = this.getBookFromModel(model_name);
    if (!book) return;
    this.update();
    return book.deleteModel(model_id);
  }
  getData(model_id: string, model_name: string) {
    let book = this.getBookFromModel(model_name);
    if (!book) return null;
    return book.getModel(model_id);
  }
  search(query: any, model_name?: string) {
    if (model_name) {
      let book = this.getBookFromModel(model_name);
      if (!book) return null;
      return book.findAll(query);
    } else {
      let results = [];
      for (const book of this._books) {
        results.push(...book.findAll(query));
      }
      return results;
    }
  }
  editData(model_id: string, model_name: string, data: any) {
    let book = this.getBookFromModel(model_name);
    if (!book) return null;
    this.update();
    return book.updateModel(model_id, data);
  }
  deletePage(pageId: string, bookId: string) {
    let book = this.getBook(bookId);
    if (!book) return;
    this.update();
    return book.delete_page(pageId);
  }
  destroy() {
    Util.deleteFolder(this._path);
  }
  setError(em: any) {
    this._error = em;
  }
  audit() {
    /**
     * Check if the database is valid
     *
     * steps:
     * 1. check if the database folder exists
     * 2. check if the settings file exists
     * 3. check if the settings file is valid and has all the required fields
     * 4. validate the size of the database, make sure its not over the maxsize
     *  5. get all books and audit them.
     */
    if (!Util.exists(this._path))
      throw new Error(
        "Database folder does not exist. Please fix this manually."
      );
    if (!Util.exists(this.settings_path))
      throw new Error(
        "Database settings file does not exist. Please fix this manually."
      );
    let settings = this._settings;
    console.log("SETTINGS: ", settings);
    // ["path", "doc", "lm", "maxSize", "type", "id"]
    //step 3
    let requiredFields = ["path", "doc", "lm", "maxSize", "type", "id"];

    for (const field of requiredFields) {
      if (settings[field as keyof DatabasePathSettings] == undefined)
        throw new Error(
          `Database settings file is missing the '${field}' field. Please fix this manually.`
        );
    }
    if (settings.path !== this._path)
      throw new Error(
        `Database path in the settings file (${settings.path}) does not match the actual database path (${this._path}). Please fix this manually.`
      );
    // now the dates
    let settings_lm = new Date(settings.lm);
    let settings_doc = new Date(settings.doc);
    let difference = settings_lm.getTime() - settings_doc.getTime();
    if (difference < 0)
      throw new Error(
        `The last modified date (${settings_lm.toISOString()}) is before the date of creation (${settings_doc.toISOString()}). Please fix this manually.`
      );
    if (settings.id !== this._id)
      throw new Error(
        `Database id in the settings file (${settings.id}) does not match the actual database id (${this._id}). Please fix this manually.`
      );

    // step 4
    if (this._s > this._settings.maxSize && this._settings.maxSize != 0)
      throw new Error(
        `Database size (${this._s}) is greater than the max size (${
          this._settings.maxSize
        }) by a difference of ${
          this._s - this._settings.maxSize
        }. Please fix this manually.`
      );
    //step 5
    for (const book of this._books) {
      book.audit();
    }
  }
}
