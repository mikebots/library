import express from "express";
import { config } from "dotenv";
config();
const app = express();
const PORT = process.env.PORT || 3002;
app.use(require("body-parser").json());
app.use(require("cors")());
import Library from "./classes/Library";
import Util from "./classes/Util";

const ilibrary_path = Util.readJSON("server_settings.json")
let library = new Library(ilibrary_path.library_path);

app.get("/", (_, res) => {
  let s = library.audit();
  res.json(s ? {
    message: "Library audit successful",
    status: "ok",
    error: null,
    library_path: library.path
  }: {
    message: "Library audit failed",
    status: "error",
    error: s,
    library_path: library.path
  });
});
app.get("/test", async (req, res) => {
  res.json({ response: "ok" });
});
app.post("/setpath", async (req, res) => {
  console.log("workign")
  library.setPath(req.body.path);
  console.log("workign2")
  Util.writeFile("server_settings.json", JSON.stringify({...ilibrary_path, library_path: req.body.path}))
  res.json({ path: library.path });
});
app.post("/test", async (req, res) => {
  res.json({ response: "ok", body: req.body });
});
app.get("/databases", async (req, res) => {
    res.json({ databases: library.databases });
});
app.get("/databases/:id", async (req, res) => {
    let database = library.getDatabase(req.params.id);
    if(database) {
        res.json({ database });
    } else {
        res.json({ error: "Database not found" });
    }
});
app.post("/databases", async (req, res) => {
    let database = library.createDatabase(req.body.id);
    res.json({ database });
});











app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
