"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Library_1 = __importDefault(require("./classes/Library"));
// const server = new ServerWrapper();
// Util.request("http://localhost:3002/test", "POST", {testing: true}).then((res: any) => {
//     console.log(res);
// });
const databases = {
    "test_database": "1234567890" // database name: database id
};
const d_id = databases["test_database"];
const library = new Library_1.default("/Users/ali/local_library");
const database = library.createDatabase(d_id);
// // console.log(library.databases);
// // database.save_data({test: true, id:12}, "testingdata")
// // database.save_data({test: true, id:13}, "testingdata")
// console.log("books",  database._books)
// console.log("hello this", database.search({id: 12}))
