"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultDatabasePathSettings = exports.defaultBookPathSettings = exports.Rules = exports.Result = exports.Page = exports.Model = exports.Book = exports.Util = exports.Library = exports.Database = void 0;
// import ServerWrapper from "./classes/ServerWrapper";
const Database_1 = __importDefault(require("./classes/Database"));
exports.Database = Database_1.default;
const Library_1 = __importDefault(require("./classes/Library"));
exports.Library = Library_1.default;
const Util_1 = __importDefault(require("./classes/Util"));
exports.Util = Util_1.default;
const Book_1 = __importDefault(require("./classes/Book"));
exports.Book = Book_1.default;
const Model_1 = __importDefault(require("./classes/Model"));
exports.Model = Model_1.default;
const Page_1 = __importDefault(require("./classes/Page"));
exports.Page = Page_1.default;
const Result_1 = __importDefault(require("./classes/Result"));
exports.Result = Result_1.default;
const Rules_1 = __importDefault(require("./classes/Rules"));
exports.Rules = Rules_1.default;
const types_1 = require("./types");
Object.defineProperty(exports, "defaultBookPathSettings", { enumerable: true, get: function () { return types_1.defaultBookPathSettings; } });
Object.defineProperty(exports, "defaultDatabasePathSettings", { enumerable: true, get: function () { return types_1.defaultDatabasePathSettings; } });
const testlib = new Library_1.default("testlib");
const database = testlib.createDatabase("testdb");
const data = {
    name: "testbook",
};
database.save_data(data, "testbook");
