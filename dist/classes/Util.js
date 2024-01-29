"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const child_process_1 = require("child_process");
const types_1 = require("../types");
const Model_1 = __importDefault(require("./Model"));
const axios_1 = __importDefault(require("axios"));
class Util {
    static writeFile(filePath, data) {
        fs_1.default.writeFileSync(filePath, data || "{}");
    }
    static deleteFile(filePath) {
        fs_1.default.unlinkSync(filePath);
    }
    static deleteFolder(folderPath) {
        fs_1.default.rmdirSync(folderPath);
    }
    static mkdir(folderPath) {
        fs_1.default.mkdirSync(folderPath);
    }
    static listFiles(folderPath) {
        return fs_1.default.readdirSync(folderPath);
    }
    static listFolders(parentPath) {
        return fs_1.default.readdirSync(parentPath).filter((file) => {
            return fs_1.default.statSync(path_1.default.join(parentPath, file)).isDirectory();
        });
    }
    static getFileOrFolderName(filePath) {
        return path_1.default.basename(filePath);
    }
    static getFileData(filePath) {
        return fs_1.default.readFileSync(filePath);
    }
    static readJSON(filePath) {
        return JSON.parse(this.getFileData(filePath).toString());
    }
    static calculateSize(filePath) {
        // return size in bytes
        return fs_1.default.statSync(filePath).size;
    }
    static exists(filePath) {
        return fs_1.default.existsSync(filePath);
    }
    static getObjectSizeInBytes(data) {
        const serializedData = JSON.stringify(data);
        const sizeInBytes = Buffer.byteLength(serializedData, "utf8");
        return sizeInBytes;
    }
    static runCommand(command, path, log = false) {
        return new Promise((resolve, reject) => {
            const options = path ? { cwd: path } : undefined;
            (0, child_process_1.exec)(command, options, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    if (log) {
                        console.log(stdout);
                        console.error(stderr);
                    }
                    resolve();
                }
            });
        });
    }
    static input(query) {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve, reject) => {
            rl.question(query, (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }
    static generateId(ids, date) {
        const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
        const uppercaseLetters = lowercaseLetters.toUpperCase();
        const letters = lowercaseLetters + uppercaseLetters;
        const numbers = "0123456789";
        let id = "";
        const genLowercase = () => {
            return lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];
        };
        const genUppercase = () => {
            return uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
        };
        const genNumber = () => {
            return numbers[Math.floor(Math.random() * numbers.length)];
        };
        const genLetter = () => {
            return letters[Math.floor(Math.random() * letters.length)];
        };
        /**
         *  2 lowercase letters at the front, 3 random letters with any casing, 2 numbers that don’t repeat each other and 3 random letters or numbers, finally (make sure to add a date parameter) and add the day month and year in the form of -ddmmyy. so an example would be ‘stGHJ13xY8-110122’ (jan 11th 2022). also take in a parameter that is a list of strings, the strings are session ids. make sure the session id you make isn’t. duplicate.
         */
        //step 1  2 lowercase letters at the front
        id += genLowercase() + genLowercase();
        //step 2 3 random letters with any casing
        id += genLetter() + genLetter() + genLetter();
        //step 3 2 numbers that don’t repeat each other
        let num1 = genNumber();
        let num2 = genNumber();
        while (num1 == num2) {
            num2 = genNumber();
        }
        id += `${num1}${num2}`;
        //step 4 3 random letters or numbers
        for (let i = 0; i < 3; i++) {
            if (Math.random() > 0.5) {
                id += genLetter();
            }
            else {
                id += genNumber();
            }
        }
        //step 5 add the day month and year in the form of -ddmmyy year is last 2 digits of the year, month is 2 digits, day is 2 digits. example for jan 11th 2022 would be -110122
        id += `-${date.getDate()}${date.getMonth()}${date
            .getFullYear()
            .toString()
            .slice(2)}`;
        //step 6 make sure the session id you make isn’t. duplicate.
        while (ids.includes(id)) {
            id = this.generateId(ids, date);
        }
        return id;
    }
    static searchModel(page, id) {
        const modelMap = new Map();
        // Populate the map with models using the desired property as the key
        for (const model of page._models) {
            modelMap.set(model._id, model);
        }
        // Perform the search
        const foundModel = modelMap.get(id);
        // delete modelMap;
        modelMap.clear();
        return foundModel ? Model_1.default.modelFromJSON(foundModel) : null;
    }
    static modelMatchesData(model, data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                if (model[key] !== value) {
                    return false;
                }
            }
        }
        return true;
    }
    static searchModels(page, data) {
        // return a list of models that match the data
        const models = [];
        for (const model of page._models) {
            if (this.modelMatchesData(model, data)) {
                models.push(model);
            }
        }
        return models;
    }
    static filterModels(page, fn) {
        const models = [];
        for (const model of page._models) {
            if (fn(model)) {
                models.push(model);
            }
        }
        return models;
    }
    static defaultBookSettings(book) {
        let settings = types_1.defaultBookPathSettings;
        settings.path = book._path;
        settings.model_name = book.model_name;
        settings.doc = new Date(Date.now()).toISOString();
        settings.lm = new Date(Date.now()).toISOString();
        return settings;
    }
    static defaultDatabasePathSettings(database) {
        return Object.assign(Object.assign({}, types_1.defaultDatabasePathSettings), { path: database._path, doc: new Date(Date.now()).toISOString(), lm: new Date(Date.now()).toISOString(), id: database._id });
    }
    static request(url, method, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                url,
                method,
                json: true,
            };
            if (data) {
                options["body"] = data;
            }
            //use axios to make the request
            const request = yield (0, axios_1.default)({
                url,
                method,
                data
            });
            return request.data;
        });
    }
}
exports.default = Util;
