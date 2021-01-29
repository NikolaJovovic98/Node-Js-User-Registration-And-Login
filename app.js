require("dotenv").config(); //Citanje podataka iz .env fajla
const express = require("express"); //Server
const app = express();
const session = require("express-session"); //Express sesija
const hbs = require("hbs"); //handlebars 
const flash = require("connect-flash"); //Fles poruke
const passport = require("passport"); //Passport za autentikaciju 
const mongoose = require("mongoose"); // Baza podataka
const bodyParser = require("body-parser"); //Uzimanje podataka sa forme 
require("./config/passport")(passport); //U config/passport.js imamo citavu konfiguraciju za passport 
//i predajemo passport varijablu koju smo gore napravili da bi radilo
const expressFileUpload = require("express-fileupload");
app.use(expressFileUpload());

const pathToUpload = __dirname + "/public/images/";
module.exports = pathToUpload;

//Postavljamo view engine na hbs
//Postavljamo da je static fajl public
//Postavljamo da aplikacija koristi bodyParser za uzimanje podataka iz formi
//I stavljamo da su views u public/viewst
app.set("view engine", "hbs");
app.use(express.static('public'));
app.use(express.static('public/images'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('views', "public/views");

//Express Session
//Ovo je express sesija 
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Flash
//Ovo je connect-flash tj kratkorocne fles poruke
//Koje idu odlicno u kombinaciji sa res.redirect znaci one se salju
//kad se salje poruka neka tipa uspjesna registracija ili pogresna lozinka kod login-a
//Stavljamo app.use flash da bi mogli koristiti req.flash(...)
app.use(flash());

//Global Vars Middleware 
//Odje pravimo Middleware od nekoliko res.locals varijabli koje cemo kasnije koristiti
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


//Routes
//Rutiranje ne bi trebalo raditi u app.js zbog nagomilavanja i lakseg citanja to treba odvojiti
//u folder routes i u njega odrediti rute npr rute koje sluze za prikazivanje pocetne stranice
//i dashboarda znaci kazemo app.use i kao prvi parametar rutu "/" i drugi parametar odakle uzimamo 
//lokalni modul za rutiranje u tom slucaju routes/index i sad ce svaka ruta koja pocinje sa / i ima nastavak
//neke rute iz ovoga routes/index da radi isto vazi i za /users u routes/users kao rutu ne trebamo da stavljamo
//npr router.get("/users/login") vec samo router.get("/login") jer se koristi u app ono ce imati ovo /users
//jer smo ga dodali odje dolje
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/books", require("./routes/books"));


port = process.env.PORT || 3000;

hbs.registerPartials(__dirname + "/public/views/components");
hbs.registerPartials(__dirname + "/public/images");

//Const function to connect do database
const connect = () => {
    return mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
}

//Database promise connection and connecting to server 
//Konektovanje na bazu podataka pa nakon toga na server 
connect()
    .then(async connection => {
        console.log("Successfully connected to database");
        app.listen(port, () => { console.log("Server is running properly on port " + port + "."); })
    }).catch(err => {
        console.log("Error Ocurred in connecting to database: " + err);
    });

