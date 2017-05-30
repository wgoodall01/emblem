const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const httpErrors = require("httperrors");
const fs = require("fs");
const path = require("path");

const gcloudDatastore = require("@google-cloud/datastore");
const gcloudTrace = require("@google-cloud/trace-agent");
const gcloudDebug = require("@google-cloud/debug-agent");

// Some configuration stuff
global.DEV = process.env.NODE_ENV !== "production";
const PORT = parseInt(process.env.PORT) || 8080;
const SPA_ROOT = path.resolve("./client/build");

// Stackdriver agents for prod
if(!DEV){
	const traceAgent = gcloudTrace.start();
	const debugAgent = gcloudDebug.start({ allowExpressions: true });
}

// Connect to Datastore
const db = gcloudDatastore({
	projectId: process.env.DATASTORE_PROJECT_ID
});

// Setup Express app
const app = express();

if(DEV){
	app.use(morgan("dev"));
}else{
	app.use(morgan("combined"));
}

// Make sure it can find the SPA
const indexPath = path.resolve(SPA_ROOT, "index.html");
if(!DEV && indexPath){
	console.log(`SPA index at: ${indexPath}`)
	if(!fs.existsSync(indexPath)){
		console.error("Can't find SPA static files. Exiting.");
		process.exit(1);
	}
}

// Parse body JSON
app.use(bodyParser.json())

// Serve API
const api = require("./api.js");
app.use("/api", api(db));

// Serve SPA files
app.use(express.static(SPA_ROOT));

app.get("*", (req, res, next)=>{
	res.sendFile(SPA_ROOT + "/index.html");
});


// Start the server
console.log(`Listening on http://localhost:${PORT}/`);
app.listen(PORT);
