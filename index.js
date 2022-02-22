require('dotenv').config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { initialiseDBConnection } = require("./db/db.connect.js")


const users = require('./routes/users.router');
const socialProfiles = require('./routes/social-profile.router');
const posts = require('./routes/posts.router');

const  authVerify  = require("./middlewares/auth-handler.middleware")
const { errorHandler } = require("./middlewares/error-handler.middleware")
const { routeNotFound } = require("./middlewares/route-not-found.middleware")


const PORT = process.env.PORT || 5000;

const app = express();

// app.use(bodyParser.json());
app.use(express.json());
app.use(cors({origin: "*"}));

initialiseDBConnection();

app.get('/', (req, res) => {
  res.json({hello: 'Welcome to Coral-gram'});
});

app.use('/users', users);

app.use('/social-profiles', socialProfiles);
app.use('/posts', posts);

app.use(authVerify);

app.use(errorHandler);
app.use(routeNotFound);

app.listen(PORT , () => {
  console.log("Listening on Port:", PORT)
})

