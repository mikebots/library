"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = __importDefault(require("./Util"));
class Model {
    constructor(settings) {
        this._id = settings.id;
        this._doc = settings.doc;
        this._lm = settings.lm;
        this._s = this.get_size();
        this._pid = settings.page_id;
        this._n = settings.name;
    }
    get_size() {
        return Util_1.default.getObjectSizeInBytes(this);
    }
    save(data, overwrite = false) {
        for (const key of Object.keys(data)) {
            if (["_id", "_doc", "_lm", "_s", "_pid", "_n", "_rpage_id", "_rbook_id"].includes(key)) {
                if (!overwrite)
                    continue;
            }
            this[key] = data[key];
        }
        this._lm = new Date(Date.now()).toISOString();
        this._s = this.get_size();
        return this;
    }
    delete(key) {
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
    static modelFromJSON(json) {
        return new Model({
            id: json._id,
            doc: json._doc,
            lm: json._lm,
            page_id: json._pid,
            name: json._n,
        }).save(json, true);
    }
}
exports.default = Model;
