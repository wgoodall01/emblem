const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const httpErrors = require("httperrors");
const fs = require("fs");
const path = require("path");

// Some configuration stuff
global.DEV = process.env.NODE_ENV !== "production";
const PORT = parseInt(process.env.PORT) || 8080;
const SPA_ROOT = path.resolve("./client/build");

const app = express();

// Make sure it can find the SPA
const indexPath = path.resolve(SPA_ROOT, "index.html");
if(!DEV && indexPath){
	console.log(`SPA index at: ${indexPath}`)
	console.error("Can't find SPA static files. Exiting.");
	process.exit(1);
}

// Serve API
const api = require("./api.js");
app.use("/api", api);

// Serve SPA files
app.use(express.static(SPA_ROOT));

app.get("*", (req, res, next)=>{
	res.sendFile(SPA_ROOT + "/index.html");
});


// Start the server
console.log(`Listening on http://localhost:${PORT}/`);
app.listen(PORT);
