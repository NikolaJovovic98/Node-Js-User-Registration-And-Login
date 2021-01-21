require("dotenv").config();
const express = require("express");
const session = require("express-session");
const hbs = require("hbs");
const flash = require("connect-flash");
const passport = require("passport");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("./config/passport")(passport);

const app = express();

app.set("view engine", "hbs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', "public/views");

//Express Session
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());

//Global Vars Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

port = process.env.PORT || 3000;

hbs.registerPartials(__dirname + "/public/views/components");
hbs.registerHelper("doesExist", (value) => {
    return value !== undefined;
});

//Const function to connect do database
const connect = () => {
    return mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
}

//Database promise connection and connecting to server 
connect()
    .then(async connection => {
        console.log("Successfully connected to database");
        app.listen(port, () => { console.log("Server is running properly on port " + port + "."); })
    }).catch(err => {
        console.log("Error Ocurred in connecting to database: " + err);
    });

