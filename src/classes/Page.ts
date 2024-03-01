import Model from "./Model";
import {
  Models,
  PageInterface,
  PageSettings,
} from "../types";
import Util from "./Util";

export default class Page implements PageInterface {
  _id: string;
  _path: string;
  _doc: string;
  _lm: string;
  _bid: string;

  _maxSize: number;
  constructor(settings: PageSettings) {
    this._bid = settings.book_id;
    this._doc = settings.doc;
    this._id = settings.id;
    this._lm = settings.lm;
    this._path = settings.path;

    this._maxSize = settings.maxSize > 0 ? settings.maxSize : 18e3;
    this.init();
  }
  get _models(): Models {
    return Util.readJSON(this._path).map((m: any)=> Model.modelFromJSON(m));
  }
  get _s() {
    return Util.calculateSize(this._path);
  }
  get _full() {
    const size = this._s;
    return this._maxSize == 0 ? false : size >= this._maxSize;
  }
  init() {
    if(!Util.exists(this._path)) Util.writeFile(this._path, "[]")
    const models = Util.readJSON(this._path);
    for (const model of models) {
      if (!this._full) this._models.push(new Model(model));
      else break;
    }
  }
  update(models: Models) {
    
    Util.writeFile(this._path, JSON.stringify(models));
    this._lm = new Date(Date.now()).toISOString();
  }
  addModel(data: any, id: string, name: string) {
    if (this._full) return false;
    const model = new Model({
      page_id: this._id,
      doc: new Date(Date.now()).toISOString(),
      lm: new Date(Date.now()).toISOString(),
      id,
      name,

    
    });
    model.save(data);
    const models = this._models;
    models.push(model);
    // update the file
    this.update(models);
    return true;
  }
  deleteModel(id: string) {
    const model = Util.searchModel(this, id);
    if (!model) return false;
    const models = this._models;
    models.splice(this._models.indexOf(model), 1);
    // update the file
    this.update(models);
  }
  getModel(id: string) {
    return Util.searchModel(this, id);
  }
  updateModel(id: string, data: any) {
    const model = Util.searchModel(this, id);
    if (!model) return false;
    model.save(data);
    this.update(this._models);
    return true;
  }
  getModels(data: any) {
    return Util.searchModels(this, data);
  }
  filterModels(fn: (model: Model) => boolean) {
    return Util.filterModels(this, fn);
  }
  deleteModels(data: any) {
    const models = Util.searchModels(this, data);
    for (const model of models) {
      this.deleteModel(model._id);
    }
  }
  toJSONString() {
    return JSON.stringify(this._models);
  }
  toSettings() : PageSettings {
    return {
      book_id: this._bid,
      doc: this._doc,
      id: this._id,
      lm: this._lm,
      maxSize: this._maxSize,
      path: this._path,
    }
  }

}
