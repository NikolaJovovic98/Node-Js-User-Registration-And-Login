const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");


//done(error tj null,user tj false ili user,poruka tj {message:"..."});

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: "No such user in database." });
        }
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            return done(null, false, { message: "Incorrect password." });
        } else {
            return done(null, user);
        }
    }));

    passport.serializeUser( (user, done)=> {
        done(null, user.id);
    });

    passport.deserializeUser( (id, done)=> {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};