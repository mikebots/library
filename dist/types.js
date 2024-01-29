"use strict";
// database system, inspired by library
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultDatabasePathSettings = exports.defaultBookPathSettings = void 0;
exports.defaultBookPathSettings = {
    pages: [],
    rules: {},
    model_name: "",
    maxSize: 0,
    path: "",
    doc: "",
    lm: "",
    pageMaxSize: 0
};
exports.defaultDatabasePathSettings = {
    path: "",
    doc: "",
    lm: "",
    maxSize: 0,
    type: "local",
    id: ""
};
