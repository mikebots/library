import { DatabasePathSettings } from "../types";
import Database from "./Database";
import Util from "./Util";
import path from "path";
//library class - a collection of Database objects
export default class Library {
  path: string;

  constructor(path: string) {
    this.path = path;
    this.init();
  }
  setPath(path: string) {
    this.path = path;
    console.log("PATH1", this.path)
    this.init();
  }
  init() {
    console.log("PATH2", this.path)
    if (!Util.exists(this.path)) {
      Util.mkdir(this.path);
    }
    this.audit();
  }
  audit() {
    let s: any = true;
    for (let database of this.databases) {
      try {
        database.audit();
        s = true;
      } catch (error) {
        s = error;
      }
    }
    return s;
  }
  get databases() {
    console.log("PATH", this.path)
    //loop through each folder in our path, then create database object for each database inside
    let databases: Database[] = [];
    let folders = Util.listFolders(this.path);
    for (let folder of folders) {
      let database = new Database({
        id: folder,
        path: path.join(this.path, folder),
      });
      databases.push(database);
    }

    return databases;
  }
  getDatabase(id: string) {
    return this.databases.find((database) => database._id === id);
  }
  createDatabase(id: string) {
    let database = new Database({
      id,
      path: path.join(this.path, id),
    });
    return database;
  }
  findOrCreateDatabase(id: string) {
    let database = this.getDatabase(id);
    if (!database) {
      database = this.createDatabase(id);
    }
    return database;
  }
  deleteDatabase(id: string) {
    let database = this.getDatabase(id);
    if (database) {
      Util.deleteFolder(database._path);
    }
  }
  findDatabase(query: any) {
    return this.databases.find((database) => {
      for (let key in query) {
        if (
          database._settings[key as keyof DatabasePathSettings] !== query[key]
        ) {
          return false;
        }
      }
      return true;
    });
  }
  findAllDatabases(query: any) {
    return this.databases.filter((database) => {
      for (let key in query) {
        if (
          database._settings[key as keyof DatabasePathSettings] !== query[key]
        ) {
          return false;
        }
      }
      return true;
    });
  }
  filterDatabases(query: any) {
    return this.databases.filter((database) => {
      for (let key in query) {
        if (database[key as keyof Database] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }
  getAllDatabasesWithModel(model_name: string) {
    return this.databases.filter((database) => {
      return database.hasModel(model_name);
    });
  }
}
