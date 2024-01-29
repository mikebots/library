import { ModelInterface, ModelSettings } from "../types";
import Util from "./Util";
export default class Model implements ModelInterface {
  _id: string;
  _lm: string;
  _s: number;
  _doc: string;
  _pid: string;
  _n: string;
  [key: string]: any;
  constructor(settings: ModelSettings) {
    this._id = settings.id;
    this._doc = settings.doc;
    this._lm = settings.lm;
    this._s = this.get_size();
    this._pid = settings.page_id;
    this._n = settings.name;
  }
  get_size() {
    return Util.getObjectSizeInBytes(this);
  }
  save(data: any, overwrite: boolean = false) {
    for (const key of Object.keys(data)) {
      if (["_id", "_doc", "_lm", "_s", "_pid", "_n", "_rpage_id", "_rbook_id"].includes(key)) {
        if(!overwrite) throw new Error("Cannot save a reserved key");
        
      }
      this[key] = data[key];
    }
    this._lm = new Date(Date.now()).toISOString();
    this._s = this.get_size();
    return this;
  }
  delete(key: string) {
    if (["_id", "_doc", "_lm", "_s", "_pid", "_n", "_rpage_id", "_rbook_id"].includes(key)) {
     throw new Error("Cannot delete a reserved key");
   
    }
    delete this[key];
    this._lm = new Date(Date.now()).toISOString();
    return this;
  }
  toJSONString() {
    return JSON.stringify(this);
  }
  static modelFromJSON(json: any){
    return new Model({
      id: json._id,
      doc: json._doc,
      lm: json._lm,
      page_id: json._pid,
      name: json._n,
    }).save(json, true);
  }
}
