"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(require("./Database"));
const Util_1 = __importDefault(require("./Util"));
const path_1 = __importDefault(require("path"));
//library class - a collection of Database objects
class Library {
    constructor(path) {
        this.path = path;
        this.init();
    }
    setPath(path) {
        this.path = path;
        console.log("PATH1", this.path);
        this.init();
    }
    init() {
        console.log("PATH2", this.path);
        if (!Util_1.default.exists(this.path)) {
            Util_1.default.mkdir(this.path);
        }
        this.audit();
    }
    audit() {
        let s = true;
        for (let database of this.databases) {
            try {
                database.audit();
                s = true;
            }
            catch (error) {
                s = error;
            }
        }
        return s;
    }
    get databases() {
        console.log("PATH", this.path);
        //loop through each folder in our path, then create database object for each database inside
        let databases = [];
        let folders = Util_1.default.listFolders(this.path);
        for (let folder of folders) {
            let database = new Database_1.default({
                id: folder,
                path: path_1.default.join(this.path, folder),
            });
            databases.push(database);
        }
        return databases;
    }
    getDatabase(id) {
        return this.databases.find((database) => database._id === id);
    }
    createDatabase(id) {
        let database = new Database_1.default({
            id,
            path: path_1.default.join(this.path, id),
        });
        return database;
    }
    findOrCreateDatabase(id) {
        let database = this.getDatabase(id);
        if (!database) {
            database = this.createDatabase(id);
        }
        return database;
    }
    deleteDatabase(id) {
        let database = this.getDatabase(id);
        if (database) {
            Util_1.default.deleteFolder(database._path);
        }
    }
    findDatabase(query) {
        return this.databases.find((database) => {
            for (let key in query) {
                if (database._settings[key] !== query[key]) {
                    return false;
                }
            }
            return true;
        });
    }
    findAllDatabases(query) {
        return this.databases.filter((database) => {
            for (let key in query) {
                if (database._settings[key] !== query[key]) {
                    return false;
                }
            }
            return true;
        });
    }
    filterDatabases(query) {
        return this.databases.filter((database) => {
            for (let key in query) {
                if (database[key] !== query[key]) {
                    return false;
                }
            }
            return true;
        });
    }
    getAllDatabasesWithModel(model_name) {
        return this.databases.filter((database) => {
            return database.hasModel(model_name);
        });
    }
}
exports.default = Library;
