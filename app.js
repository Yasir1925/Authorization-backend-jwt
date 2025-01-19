const express = require("express");
const app = express();
const mongoose = require("mongoose")
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require('dotenv').config();
const { connectdb } = require("./config/MongoDB")

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["*"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],

    optionsSuccessStatus: 204,
    credentials: true,
}));

// Routes
const userRouter = require("./routes/user.route")

// Mongo connection
connectdb(process.env.MONGO_URI);

app.use("/", userRouter)

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server listening at port ${port}`);
});