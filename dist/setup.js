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
//setup for database and library
const Util_1 = __importDefault(require("./classes/Util"));
let server_settingspath = "server_settings.json";
let server_settings = Util_1.default.readJSON(server_settingspath);
//setup for database and library
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Welcome to the setup for the database and library");
    console.log("Please enter the path for the library");
    const library_path = yield Util_1.default.input("Library path: ");
    console.log(`Library path set to ${library_path}`);
    server_settings.library_path = library_path;
    Util_1.default.writeFile(server_settingspath, JSON.stringify(server_settings));
    console.log("Thank you, your database is being hosted at http://localhost:3002 (please make sure to run it first)");
}))();
