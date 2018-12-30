#!/usr/bin/env node

const path = require("path");

// Some configuration stuff
global.DEV = process.env.NODE_ENV !== "production";
const PORT = parseInt(process.env.PORT) || 8080;
const SPA_ROOT = path.resolve("./client/build");
const gcloudCredentials = process.env.GCLOUD_CREDENTIALS
  ? JSON.parse(process.env.GCLOUD_CREDENTIALS)
  : undefined;

const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const httpErrors = require("httperrors");
const fs = require("fs");

const gcloudDatastore = require("@google-cloud/datastore");

// Connect to Datastore
const db = gcloudDatastore({
  projectId: process.env.DATASTORE_PROJECT_ID,
  credentials: gcloudCredentials
});

// Setup Express app
const app = express();

if (DEV) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Make sure it can find the SPA
const indexPath = path.resolve(SPA_ROOT, "index.html");
if (!DEV && indexPath) {
  console.log(`SPA index at: ${indexPath}`);
  if (!fs.existsSync(indexPath)) {
    console.error("Can't find SPA static files. Exiting.");
    process.exit(1);
  }
}

// Parse body JSON
app.use(bodyParser.json());

// Serve API
const api = require("./api.js");
app.use("/api", api(db));

// Serve SPA files
app.use(express.static(SPA_ROOT));

app.get("*", (req, res, next) => {
  res.sendFile(SPA_ROOT + "/index.html");
});

// Start the server
console.log(`Listening on http://localhost:${PORT}/`);
app.listen(PORT);
