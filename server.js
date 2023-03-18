const express = require("express");
require("dotenv").config();

console.log(process.env.MONGO_URI);

const app = express();
