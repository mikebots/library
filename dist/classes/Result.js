"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Result {
    constructor(result, page_id, book_id) {
        for (const key in result) {
            this[key] = result[key];
        }
        this._rpage_id = page_id;
        this._rbook_id = book_id;
    }
}
exports.default = Result;
