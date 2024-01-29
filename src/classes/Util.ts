import fs from "fs";
import path from "path";
import readline from "readline";
import { exec, execSync } from "child_process";

import {
  PageInterface,
  PageSettings,
  Pages,
  BookInterface,
  Books,
  ValidRuleType,
  RulesType,
  ModelInterface,
  defaultBookPathSettings,
  defaultDatabasePathSettings,
} from "../types";
import Page from "./Page";
import Model from "./Model";
import Book from "./Book";
import Database from "./Database";
import axios from "axios";

export default class Util {
  static writeFile(filePath: string, data?: any) {
    fs.writeFileSync(filePath, data || "{}");
  }
  static deleteFile(filePath: string) {
    fs.unlinkSync(filePath);
  }

  static deleteFolder(folderPath: string) {
    fs.rmdirSync(folderPath);
  }
  static mkdir(folderPath: string) {
    fs.mkdirSync(folderPath);
  }
  static listFiles(folderPath: string) {
    return fs.readdirSync(folderPath);
  }
  static listFolders(parentPath: string) {
    return fs.readdirSync(parentPath).filter((file) => {
      return fs.statSync(path.join(parentPath, file)).isDirectory();
    });
  }
  static getFileOrFolderName(filePath: string) {
    return path.basename(filePath);
  }
  static getFileData(filePath: string) {
    return fs.readFileSync(filePath);
  }
  static readJSON(filePath: string) {
    return JSON.parse(this.getFileData(filePath).toString());
  }
  static calculateSize(filePath: string) {
    // return size in bytes
    return fs.statSync(filePath).size;
  }
  static exists(filePath: string) {
    return fs.existsSync(filePath);
  }
  static getObjectSizeInBytes(data: any): number {
    const serializedData = JSON.stringify(data);
    const sizeInBytes = Buffer.byteLength(serializedData, "utf8");
    return sizeInBytes;
  }
  static runCommand(command: string, path?: string, log = false) {
    return new Promise<void>((resolve, reject) => {
      const options = path ? { cwd: path } : undefined;
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          if (log) {
            console.log(stdout);
            console.error(stderr);
          }
          resolve();
        }
      });
    });
  }
  static input(query: string) {
    const rl = readline.createInterface({
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
  static generateId(ids: string[], date: Date): string {
    const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseLetters = lowercaseLetters.toUpperCase();
    const letters = lowercaseLetters + uppercaseLetters;
    const numbers = "0123456789";
    let id = "";

    const genLowercase = () => {
      return lowercaseLetters[
        Math.floor(Math.random() * lowercaseLetters.length)
      ];
    };
    const genUppercase = () => {
      return uppercaseLetters[
        Math.floor(Math.random() * uppercaseLetters.length)
      ];
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
      } else {
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
  static searchModel(page: Page, id: string) {
    const modelMap = new Map<string, Model>();

    // Populate the map with models using the desired property as the key
    for (const model of page._models) {
      modelMap.set(model._id, model);
    }

    // Perform the search
    const foundModel = modelMap.get(id);

    // delete modelMap;
    modelMap.clear();
    return foundModel ? Model.modelFromJSON(foundModel) : null;
  }
  static modelMatchesData(model: Model, data: any) {
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
  static searchModels(page: Page, data: any) {
    // return a list of models that match the data
    const models: Model[] = [];
    for (const model of page._models) {
      if (this.modelMatchesData(model, data)) {
        models.push(model);
      }
    }
    return models;
  }
  static filterModels(page: Page, fn: (model: Model) => boolean) {
    const models: Model[] = [];
    for (const model of page._models) {
      if (fn(model)) {
        models.push(model);
      }
    }
    return models;
  }
  static defaultBookSettings(book: Book) {
    let settings = defaultBookPathSettings;
    settings.path = book._path;
    settings.model_name = book.model_name;
    settings.doc = new Date(Date.now()).toISOString();
    settings.lm = new Date(Date.now()).toISOString();
    return settings;
  }
  static defaultDatabasePathSettings(database: Database) {
    return {
      ...defaultDatabasePathSettings,
      path: database._path,
      doc: new Date(Date.now()).toISOString(),
      lm: new Date(Date.now()).toISOString(),
      id: database._id,
    };
  }
  static async request(url: string, method: string, data?: any) 
  {

      const options: any = {
        url,
        method,
        json: true,
      };
      if (data) {
        options["body"] = data;
      }
      //use axios to make the request
      const request = await axios({
        url,
        method,
        data

      })
      return request.data;

      
  }
}
