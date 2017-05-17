const express = require("express");
const httpErrors = require("httperrors");

const api = new express.Router();
module.exports = api;

api.get("/test", (req, res, next)=>{
	res.json({yep:"the api works."})
})

api.get("/error", (req, res, next)=>{
	next(httpErrors.ImATeapot("ayy lmao"));
})

// 404 error for the API
api.use((req, res, next)=>{
	next(httpErrors.NotFound("Resource not found"));
})

// Handle all errors with JSON for the API
api.use((err, req, res, next) => {
	const status = parseInt(err.status) || 500;
	res.status(status).json({error:status, msg:err.message || err.msg})
})
