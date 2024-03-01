"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Model_1 = __importDefault(require("./Model"));
const Util_1 = __importDefault(require("./Util"));
class Page {
    constructor(settings) {
        this._bid = settings.book_id;
        this._doc = settings.doc;
        this._id = settings.id;
        this._lm = settings.lm;
        this._path = settings.path;
        this._maxSize = settings.maxSize > 0 ? settings.maxSize : 18e3;
        this.init();
    }
    get _models() {
        return Util_1.default.readJSON(this._path).map((m) => Model_1.default.modelFromJSON(m));
    }
    get _s() {
        return Util_1.default.calculateSize(this._path);
    }
    get _full() {
        const size = this._s;
        return this._maxSize == 0 ? false : size >= this._maxSize;
    }
    init() {
        if (!Util_1.default.exists(this._path))
            Util_1.default.writeFile(this._path, "[]");
        const models = Util_1.default.readJSON(this._path);
        for (const model of models) {
            if (!this._full)
                this._models.push(new Model_1.default(model));
            else
                break;
        }
    }
    update(models) {
        Util_1.default.writeFile(this._path, JSON.stringify(models));
        this._lm = new Date(Date.now()).toISOString();
    }
    addModel(data, id, name) {
        if (this._full)
            return false;
        const model = new Model_1.default({
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
    deleteModel(id) {
        const model = Util_1.default.searchModel(this, id);
        if (!model)
            return false;
        const models = this._models;
        models.splice(this._models.indexOf(model), 1);
        // update the file
        this.update(models);
    }
    getModel(id) {
        return Util_1.default.searchModel(this, id);
    }
    updateModel(id, data) {
        const model = Util_1.default.searchModel(this, id);
        if (!model)
            return false;
        model.save(data);
        this.update(this._models);
        return true;
    }
    getModels(data) {
        return Util_1.default.searchModels(this, data);
    }
    filterModels(fn) {
        return Util_1.default.filterModels(this, fn);
    }
    deleteModels(data) {
        const models = Util_1.default.searchModels(this, data);
        for (const model of models) {
            this.deleteModel(model._id);
        }
    }
    toJSONString() {
        return JSON.stringify(this._models);
    }
    toSettings() {
        return {
            book_id: this._bid,
            doc: this._doc,
            id: this._id,
            lm: this._lm,
            maxSize: this._maxSize,
            path: this._path,
        };
    }
}
exports.default = Page;
