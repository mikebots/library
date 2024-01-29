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
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use(require("body-parser").json());
app.use(require("cors")());
const Library_1 = __importDefault(require("./classes/Library"));
const Util_1 = __importDefault(require("./classes/Util"));
const ilibrary_path = Util_1.default.readJSON("server_settings.json");
let library = new Library_1.default(ilibrary_path.library_path);
app.get("/", (_, res) => {
    let s = library.audit();
    res.json(s ? {
        message: "Library audit successful",
        status: "ok",
        error: null,
        library_path: library.path
    } : {
        message: "Library audit failed",
        status: "error",
        error: s,
        library_path: library.path
    });
});
app.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ response: "ok" });
}));
app.post("/setpath", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("workign");
    library.setPath(req.body.path);
    console.log("workign2");
    Util_1.default.writeFile("server_settings.json", JSON.stringify(Object.assign(Object.assign({}, ilibrary_path), { library_path: req.body.path })));
    res.json({ path: library.path });
}));
app.post("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ response: "ok", body: req.body });
}));
app.get("/databases", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ databases: library.databases });
}));
app.get("/databases/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let database = library.getDatabase(req.params.id);
    if (database) {
        res.json({ database });
    }
    else {
        res.json({ error: "Database not found" });
    }
}));
app.post("/databases", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let database = library.createDatabase(req.body.id);
    res.json({ database });
}));
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
