"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = __importDefault(require("./Util"));
const Page_1 = __importDefault(require("./Page"));
const path_1 = __importDefault(require("path"));
const Rules_1 = __importDefault(require("./Rules"));
const Result_1 = __importDefault(require("./Result"));
class Book {
    constructor(settings) {
        this._id = settings.id;
        this._path = settings.path;
        this.settings_path = path_1.default.join(this._path, "settings.json");
        this.model_name = settings.model_name;
        this.settings = settings.settings;
        this.init();
    }
    init() {
        if (!Util_1.default.exists(this._path) || !Util_1.default.exists(this.settings_path)) {
            // create the book folder
            if (!Util_1.default.exists(this._path))
                Util_1.default.mkdir(this._path);
            // create the settings file
            Util_1.default.writeFile(this.settings_path, JSON.stringify(Object.assign(Object.assign({}, Util_1.default.defaultBookSettings(this)), this.settings)));
        }
        else {
            this.updateSettings(this.settings);
        }
        this.audit();
    }
    get _settings() {
        return Util_1.default.readJSON(this.settings_path);
    }
    updateSettings(settings) {
        this.settings = Object.assign(Object.assign({}, this._settings), settings);
        let lm = new Date(Date.now()).toISOString();
        this.settings.lm = lm;
        Util_1.default.writeFile(this.settings_path, JSON.stringify(this.settings));
    }
    get _pages() {
        let pages = [];
        let files = Array.from(Util_1.default.listFiles(this._path).filter((file) => file !== "settings.json"));
        if (files.length === 0)
            return pages;
        for (const file of files) {
            let pageFileName = file.split(".")[0];
            let pageSettings = this._settings.pages.find((page) => page.id === pageFileName);
            let page = new Page_1.default({
                id: pageFileName,
                path: this._path + "/" + file,
                doc: pageSettings.doc,
                lm: pageSettings.lm,
                book_id: this._id,
                maxSize: pageSettings.maxSize,
            });
            pages.push(page);
        }
        return pages;
    }
    get _s() {
        return this._pages.reduce((acc, page) => acc + page._s, 0);
    }
    get _full() {
        const size = this._s;
        return this._settings.maxSize == 0 ? false : size >= this._settings.maxSize;
    }
    get _rules() {
        return this._settings.rules;
    }
    get _doc() {
        return this._settings.doc;
    }
    checkIfFull(data, page_id) {
        if (this._full)
            throw new Error("Book is full");
        if (data) {
            if (page_id) {
                let pageSettings = this.getPageSettings(page_id);
                if (!pageSettings)
                    throw new Error("Page not found");
                let page = this.getPage(page_id);
                if (!page)
                    throw new Error("Page not found");
                if (page._full)
                    throw new Error("Page is full");
                if (Util_1.default.getObjectSizeInBytes(data) + page._s > pageSettings.maxSize &&
                    pageSettings.maxSize != 0)
                    throw new Error("Data is too big for page - " + JSON.stringify(data));
            }
        }
    }
    getPageSettings(page_id) {
        return this._settings.pages.find((page) => page.id === page_id);
    }
    create_page() {
        this.checkIfFull();
        let id = Util_1.default.generateId(this._pages.map((page) => page._id), new Date(Date.now()));
        let page_path = path_1.default.join(this._path, id + ".json");
        let page = new Page_1.default({
            id,
            path: page_path,
            doc: new Date(Date.now()).toISOString(),
            lm: new Date(Date.now()).toISOString(),
            book_id: this._id,
            maxSize: this._settings.pageMaxSize,
        });
        let pages = this._settings.pages;
        pages.push(page.toSettings());
        this.updateSettings({ pages });
        return page;
    }
    delete_page(page_id) {
        let page = this.getPage(page_id);
        if (page) {
            // step 1, remove from settings
            let pages = this._settings.pages.filter((page) => page.id !== page_id);
            this.updateSettings({ pages });
            // step 2, remove from file system
            Util_1.default.deleteFile(page._path);
            return true;
        }
        return false;
    }
    edit_page(page_id, data) {
        let page = this.getPage(page_id);
        if (page) {
            this.checkIfFull(data, page_id);
            page.update(data);
            this.updatePageInSettings(page_id);
            this.audit();
            return true;
        }
        return false;
    }
    get rules() {
        return new Rules_1.default(this._settings.rules);
    }
    getPage(page_id) {
        return this._pages.find((page) => page._id === page_id);
    }
    updatePageSetting(page_id, settings) {
        let pages = this._settings.pages;
        let page = this.getPageSettings(page_id);
        if (page) {
            page = Object.assign(Object.assign({}, page), settings);
            this.updateSettings({
                pages: [...pages.filter((p) => p.id != page_id), page],
            });
            this.updatePageInSettings(page_id);
        }
        this.audit();
    }
    updatePageInSettings(page_id) {
        let pages = this._settings.pages;
        let page = pages.find((page) => page.id === page_id);
        if (page) {
            page.lm = new Date(Date.now()).toISOString();
            this.updateSettings({
                pages: [...pages.filter((p) => p.id != page_id), page],
            });
        }
    }
    save_data(data) {
        this.checkIfFull(data);
        let page = this._pages.find((p) => {
            if (p._maxSize == 0) {
                if (this._settings.pageMaxSize == 0)
                    return true;
                else
                    return (Util_1.default.getObjectSizeInBytes(data) + p._s <=
                        this._settings.pageMaxSize);
            }
            else
                return Util_1.default.getObjectSizeInBytes(data) + p._s <= p._maxSize;
        }) || this.create_page();
        let validation = this.rules.validate(data, true);
        if (!validation.success)
            throw new Error(validation.message);
        let id = Util_1.default.generateId(this.getModelIDS(), new Date(Date.now()));
        page.addModel(data, id, this._settings.model_name);
        this.updatePageInSettings(page._id);
        return page;
    }
    update_data(id, data, page_id) {
        var _a;
        let model = page_id ? (_a = this.getPage(page_id)) === null || _a === void 0 ? void 0 : _a.getModel(id) : this.getModel(id);
        if (model) {
            this.checkIfFull(data, model._pid);
            let validation = this.rules.validate(data, true);
            if (!validation.success)
                throw new Error(validation.message);
            model.save(data);
            this.updatePageInSettings(model._pid);
            return true;
        }
        return false;
    }
    getModelIDS() {
        let pages = this._pages;
        let ids = [];
        for (const page of pages) {
            ids = [...ids, ...page._models.map((model) => model._id)];
        }
        return ids;
    }
    findAll(query) {
        let pages = this._pages;
        let models = [];
        for (const page of pages) {
            let found = page.getModels(query);
            for (const foundModel of found) {
                let result = new Result_1.default(foundModel, page._id, this._id);
                models.push(result);
            }
        }
        return models;
    }
    findOne(query) {
        let pages = this._pages;
        for (const page of pages) {
            let found = page.getModels(query);
            if (found.length > 0)
                return new Result_1.default(found[0], page._id, this._id);
        }
        return null;
    }
    getModel(id) {
        let pages = this._pages;
        for (const page of pages) {
            let found = page.getModel(id);
            if (found)
                return found;
        }
        return null;
    }
    deleteModel(id) {
        let pages = this._pages;
        for (const page of pages) {
            let found = page.getModel(id);
            if (found) {
                page.deleteModel(id);
                this.updatePageInSettings(page._id);
                return true;
            }
        }
        return false;
    }
    updateModel(id, data) {
        let pages = this._pages;
        for (const page of pages) {
            let found = page.getModel(id);
            if (found) {
                data = Object.assign(Object.assign({}, found), data);
                let validation = this.rules.validate(data, true);
                if (!validation.success)
                    throw new Error(validation.message);
                found.save(data);
                page.update([...page._models.filter((m) => m._id != id), found]);
                this.updatePageInSettings(page._id);
                return true;
            }
        }
    }
    setRules(rules) {
        this.updateSettings({ rules });
    }
    setMaxSize(maxSize) {
        this.updateSettings({ maxSize });
    }
    setPageMaxSize(page_id, maxSize) {
        let pages = this._settings.pages;
        let page = pages.find((page) => page.id === page_id);
        if (page) {
            this.updatePageSetting(page_id, { maxSize });
            return true;
        }
        return false;
    }
    setAllPagesMaxSize(maxSize) {
        this.updateSettings({ pageMaxSize: maxSize });
    }
    audit() {
        /**
         * Check if the book is valid.
         *
         * steps:
         * 1. check if the book is full and if the size exceeds the max size. (database storing error)
         * 2. fetch all page files inside path and check if they match up to book settings. (internal error)
         * 3. check if the book is valid by checking if all models are valid -> check with rules. (data error)
         * 4. check if a page is full and if the size exceeds the max size. (database storing error)
         * step 5. check if all dates are correct
         * step 6. check if all settings properties are correct with page properties and also book properties
         */
        //step 2.1, manually check if all pages are in the settings
        let files = Util_1.default.listFiles(this._path).filter((file) => file != "settings.json");
        for (const file of files) {
            // check if the file is in the pages settings
            let nameWithoutJSON = file.split(".json")[0];
            if (!this._settings.pages.find((pageSetting) => pageSetting.id == nameWithoutJSON))
                throw new Error(`Page (${nameWithoutJSON}) is not in the settings of book (${this._id}). Please manually fix this error.`);
        }
        let size = this._s;
        let maxSize = this._settings.maxSize;
        if (maxSize != 0 && size > maxSize)
            throw new Error(`Book (${this._id}) is full and exceeds max size by ${size - maxSize}. Please manually fix this error.`);
        //step 2.2
        let pages = this._pages;
        let pageSettings = this._settings.pages;
        //step 2.1 check if all setting pages are the only pages in the book
        for (const pageSetting of pageSettings) {
            if (!pages.find((page) => page._id == pageSetting.id))
                throw new Error(`Page (${pageSetting.id}) is missing from book (${this._id}). Please manually fix this error.`);
        }
        //step 2.2 check if all pages in the book are in the settings
        for (const page of pages) {
            if (!pageSettings.find((pageSetting) => pageSetting.id == page._id))
                throw new Error(`Page (${page._id}) is not in the settings of book (${this._id}). Please manually fix this error.`);
        }
        for (const page of pages) {
            let size = page._s;
            let maxSize = page._maxSize;
            if (maxSize != 0 && size > maxSize)
                throw new Error(`Page (${page._id}) is full and exceeds max size by ${size - maxSize}. Please manually fix this error.`);
        }
        //step 3
        for (const page of pages) {
            // validate each piece of data with the rules.
            for (const model of page._models) {
                let validation = this.rules.validate(model, true);
                if (!validation.success)
                    throw new Error(`Model (${model._id}) in page (${page._id}) of book (${this._id}) is invalid. Please manually fix this error.\nError Message: ${validation.message}`);
                // also check if all properties match up with page and book properties
                // we need _id, _doc, _lm, _s, _pid, _n -> these are model properties
                let required = ["_id", "_doc", "_lm", "_s", "_pid", "_n"];
                for (const prop of required) {
                    if (!model.hasOwnProperty(prop))
                        throw new Error(`Model (${model._id}) in page (${page._id}) of book (${this._id}) is missing property (${prop}). Please manually fix this error.`);
                }
                //now check if they're correct, first start with the dates
                let doc = new Date(model._doc);
                let lastModified = new Date(model._lm);
                //check if dates are valid ISO strings
                if (doc.toISOString() == "Invalid Date")
                    throw new Error(`Model (${model._id}) in page (${page._id}) of book (${this._id}) has an invalid date of creation (${model._doc}). Please manually fix this error.`);
                // get difference in milliseconds
                let diff = lastModified.getTime() - doc.getTime();
                if (diff < 0)
                    throw new Error(`Model (${model._id}) in page (${page._id}) of book (${this._id}) has a date of creation (${doc.toISOString()}) that is further ahead than the last modification date (${lastModified.toISOString()}). Please manually fix this error.`);
                //now check if the size is correct
                let size = model._s;
                let objectSize = Util_1.default.getObjectSizeInBytes(model);
                if (size != objectSize) {
                    // we will fix this ourselves
                    let newmodel = model.save({});
                    this.edit_page(page._id, [
                        ...page._models.filter((m) => m._id != model._id),
                        newmodel,
                    ]);
                }
                //now check if the page id is correct
                let pid = model._pid;
                if (pid != page._id)
                    throw new Error(`Model (${model._id}) in page (${page._id}) of book (${this._id}) has a page id (${pid}) that does not match the actual page id (${page._id}). Please manually fix this error.`);
                //now check if the name is correct
                let name = model._n;
                if (name != this.model_name)
                    throw new Error(`Model (${model._id}) in page (${page._id}) of book (${this._id}) has a name (${name}) that does not match the actual name (${this.model_name}). Please manually fix this error.`);
            }
        }
        //step 5, check if any date of creation are further ahead than the last modification date.
        for (const page of pages) {
            let doc = new Date(page._doc);
            let lastModified = new Date(page._lm);
            // get difference in milliseconds
            let diff = lastModified.getTime() - doc.getTime();
            if (diff < 0)
                throw new Error(`Page (${page._id}) has a date of creation (${doc.toISOString()}) that is further ahead than the last modification date (${lastModified.toISOString()}). Please manually fix this error.`);
            for (const model of page._models) {
                // do the same for each model
                let doc = new Date(model._doc);
                let lastModified = new Date(model._lm);
                // get difference in milliseconds
                let diff = lastModified.getTime() - doc.getTime();
                if (diff < 0)
                    throw new Error(`Model (${model._id}) in page (${page._id}) of book (${this._id}) has a date of creation (${doc.toISOString()}) that is further ahead than the last modification date (${lastModified.toISOString()}). Please manually fix this error.`);
            }
        }
        //step 6.1 check if page settings are correct with the page properties
        for (const page of pages) {
            let pageSetting = pageSettings.find((pageSetting) => pageSetting.id == page._id);
            if (!pageSetting)
                throw new Error(`Page (${page._id}) is not in the settings of book (${this._id}). Please manually fix this error.`);
            //["book_id", "doc", "id", "lm", "maxSize", "path"];
            if (pageSetting.book_id != this._id)
                throw new Error(`Page (${page._id}) has a book id (${pageSetting.book_id}) that does not match the book id (${this._id}). Please manually fix this error.`);
            if (page._doc != pageSetting.doc)
                throw new Error(`Page (${page._id}) has a date of creation (${page._doc}) that does not match the date of creation (${pageSetting.doc}) in the settings. Please manually fix this error.`);
            if (page._lm != pageSetting.lm)
                throw new Error(`Page (${page._id}) has a last modification date (${page._lm}) that does not match the last modification date (${pageSetting.lm}) in the settings. Please manually fix this error.`);
            if (page._maxSize != pageSetting.maxSize) {
                // we will fix this ourselves
                console.log("doing 2 something");
                this.setPageMaxSize(page._id, page._maxSize);
            }
            if (page._path != pageSetting.path)
                throw new Error(`Page (${page._id}) has a path (${page._path}) that does not match the path (${pageSetting.path}) in the settings. Please manually fix this error.`);
        }
        //step 6.2 check if book settings are correct with the book properties
        if (this._s > this._settings.maxSize && this._settings.maxSize != 0)
            throw new Error(`Book (${this._id}) is full and exceeds max size by ${this._s - this._settings.maxSize}. Please manually fix this error.`);
        if (this._doc != this._settings.doc)
            throw new Error(`Book (${this._id}) has a date of creation (${this._doc}) that does not match the date of creation (${this._settings.doc}) in the settings. Please manually fix this error.`);
        if (this._id != Util_1.default.getFileOrFolderName(this._path))
            throw new Error(`Book (${this._id}) has a path (${this._path}) that does not match the id (${Util_1.default.getFileOrFolderName(this._path)}) in the settings. Please manually fix this error.`);
        if (this._path != this._settings.path)
            throw new Error(`Book (${this._id}) has a path (${this._path}) that does not match the path (${this._settings.path}) in the settings. Please manually fix this error.`);
        if (this.model_name != this._settings.model_name)
            throw new Error(`Book (${this._id}) has a model name (${this.model_name}) that does not match the model name (${this._settings.model_name}) in the settings. Please manually fix this error.`);
        return true;
    }
    getPageBySettings(pageSettings) {
        return new Page_1.default(pageSettings);
    }
}
exports.default = Book;
