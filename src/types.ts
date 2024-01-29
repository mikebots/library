// database system, inspired by library

import Book from "./classes/Book";
import Model from "./classes/Model";
import Page from "./classes/Page";

export type DatabaseType = "local" | "mongo";

/**
 * Model represents the data being stored. The structure so that it can be stored in the database.
 */
export interface ModelInterface {
  /**
   * The id of the model
   */
  _id: string;
  /**
   * The date of creation of the model
   */
  _doc: string;
  /**
   * The date of last modification of the model
   */
  _lm: string;

  /**
   * The size of the model in bytes
   */
  _s: number;

  /**
   * the page id of the string
   */
  _pid: string;

  /**
   * the name of the model
   */
  _n: string;

  /**
   * The data of the model
   */
  [key: string]: any;
}
export type ModelSettings = {
  id: string;
  doc: string;
  lm: string;

  page_id: string;
  name: string;


}

/**
 * This will contain a list of a certain model and will store it in a json file. Think of it as the plural of Model.
 */
export type Models = Model[];
export interface PageInterface {
  /**
   * The id of the page (aka filename)
   */
  _id: string;

  /**
   * The file path of the page
   */
  _path: string;

  /**
   * The date of creation of the page
   *
   */
  _doc: string;

  /**
   * The date of last modification of the page
   */
  _lm: string;

  /**
   * The size of the page in bytes
   */
  _s: number;

  /**
   * the book id for the page
   */
  _bid: string;

  _maxSize: number;

  _models: Models;

  _full: boolean;
}
export type PageSettings = {
  id: string;
  path: string;
  doc: string;
  lm: string;

  book_id: string;
  maxSize: number;
 

}
export type ValidRuleType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "any";
export type Pages = Page[];
export type RulesType = {
  [key: string]: ValidRuleType;
};
export interface BookInterface {
  /**
   * The id of the book aka the folder name
   */
  _id: string;

  /**
   * the folder path of the book
   */
  _path: string;

  /**
   * The date of creation of the book
   */
  _doc: string;


  /**
   * The size of the book in bytes
   */
  _s: number;

  /**
   * the rules for the data being stored so it follows the model. (aka schema)
   */
  _rules: RulesType;

  /**
   * the pages for the book, aka files inside the book path
   */
  _pages: Pages;
   
  /**
   * the name of the book
   */
  model_name: string;

}
export type BookPathSettings = {
  pages: PageSettings[];
  rules: RulesType;
  model_name: string;
  maxSize: number;
  path: string;
  doc: string;
  lm: string;
  pageMaxSize: number;
}
export var defaultBookPathSettings: BookPathSettings = {
  pages: [],
  rules: {},
  model_name: "",
  maxSize: 0,
  path: "",
  doc: "",
  lm: "",
  pageMaxSize: 0

}
export type BookSettings = {
  id: string;
  path: string;

  model_name: string;

  settings?: BookPathSettings;
}
export type Books = Book[];

export type DatabasePathSettings = {
  
  path: string;
  doc: string;
  lm: string;
  maxSize: number;
  type: DatabaseType;
  id: string;
}
export type DatabaseSettings = {
  path: string;
  id: string;
  settings?: DatabasePathSettings;
}
export var defaultDatabasePathSettings: DatabasePathSettings = {

  path: "",
  doc: "",
  lm: "",
  maxSize: 0,
  type: "local",
  id: ""
}
//database - aka collection of books
export interface DatabaseInterface {
  /**
   * The id of the database
   */
  _id: string;
  /**
   * The path of database containing all the books etc
   */
  _path: string;

  /**
   * The date of creation of the database
   */
  _doc: string;
  /**
   * The date of last modification of the database
   */
  _lm: string;
  /**
   * The size of the database in bytes
   */
  _s: number;
  /**
   * The books inside the database
   */
  _books: Books;
  /**
   * The type of database, local or mongo
   */
  _type: DatabaseType;
}
