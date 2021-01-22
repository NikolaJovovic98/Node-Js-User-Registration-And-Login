const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");


//done(error tj null,user tj false ili user,poruka tj {message:"..."});
//Definisemo passport localStrategy to je glavno za autentikaciju kao prvi parametar unutar passport.use stavljamo tu strategiju
//u koju ubacamo koja ce se polja gledati za autentikaciju korisnika kazemo usernameField: "emailLogin" tj da cemo kao usernameField da koristimo
//emailLogin a emailLogin nije nista drugo vec name od inputa iz login forme dakle passport sam cita req.body.emailForm i dodaje ga isto vazi i 
//za password kao drugi parametar dodajemo te kreditacije + done funkciju provjeravamo da li postoji korisnik i da li se slaze pasvord
//sa onim iz baze ako je oboje okej onda se u done prosljedjuje user tj njegov model taj kasnije model moze da se pristupi pomocu
//req.user ako ne onda saljemo false za model a kao 3 parametar u done stavljamo flash poruku koja ce se pokazati kasnije na failureRedirect

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: "emailLogin", passwordField: "passwordLogin" }, async (email, password, done) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: "User does not exist. Register if you don't have an account." });
        }
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            return done(null, false, { message: "Incorrect password, try again." });
        } else {
            return done(null, user,{message:"Successful Login."});
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};