//setup for database and library
import Util from "./classes/Util";
let server_settingspath = "server_settings.json";
let server_settings = Util.readJSON(server_settingspath);

//setup for database and library
(async () =>{
    console.log("Welcome to the setup for the database and library");
    console.log("Please enter the path for the library");
    const library_path = await Util.input("Library path: ");
    console.log(`Library path set to ${library_path}`);
    server_settings.library_path = library_path;
    Util.writeFile(server_settingspath, JSON.stringify(server_settings));
    console.log("Thank you, your database is being hosted at http://localhost:3002 (please make sure to run it first)");
    
})();