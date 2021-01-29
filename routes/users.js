const express = require('express'); //express framework
const router = require("express").Router(); //izvuci Router tj mogucnost rutiranja iz expressa
const User = require("../models/User"); //User model 
const Book = require("../models/Book"); //Book model 
const bcrypt = require("bcrypt");//za hasovanje pasvorda
const passport = require("passport");
const { checkAuthentication } = require("../config/auth");
const { userPermission } = require("../config/userAuth");
const { adminPermission } = require("../config/authAdmin");
const uploadsFolder = require("../app");
const fs = require("fs");
const calculateEarnings = require("../services/calculateEarnings");

//All Users
router.get('/', async (req, res) => {
    const allUsers = await User.find({ role: 0 }).sort({ createdAt: -1 });
    res.render("allUsers.hbs", {
        users: allUsers
    });
});

//Show One User
router.get("/show/:userName", userPermission, async (req, res) => {
    const user = await User.findOne({ name: req.params.userName });
    const books = await User.findOne({ name: req.params.userName })
        .populate('book')
        .exec();
    let totalPossibleEarnings = await calculateEarnings(books.book);
    if (books.book.length === 0) {
        totalPossibleEarnings = 0;
    }
    let role = "Basic User";
    if (user.role === 1) {
        role = "Admin";
    }
    const numberOfBooksByUser = books.book.length;
    res.render("oneUser.hbs", {
        userName: user.name,
        userEmail: user.email,
        userRole: role,
        books: books.book,
        numOfBooks: numberOfBooksByUser,
        possibleEarnings: totalPossibleEarnings
    });
});

//Update User Info Get
router.get("/update/:userName", checkAuthentication, async (req, res) => {
    const updateUserInfo = await User.findOne({ name: req.params.userName });
    res.render("updateUserForm.hbs", {
        inputUserName: updateUserInfo.name,
        inputUserEmail: updateUserInfo.email,

    });
});

//Update User Info Post
router.post("/update/:userName", async (req, res) => {
    const checkUserName = await User.findOne({ name: req.body.nameUpdate }); //Mozda ovo treba da se makne nadji drugi nacin
    if (checkUserName) {
        req.flash("error_msg", "Username and Email must be unique! Try again.");
        res.redirect(`/users/update/${req.params.userName}`);
    } else {
        await User.findOneAndUpdate({ name: req.params.userName }, {
            name: req.body.nameUpdate,
            email: req.body.emailUpdate
        });
        const redirectUser = await User.findOne({ name: req.body.nameUpdate });
        req.flash("success_msg", "Profile Updated!");
        res.redirect(`/users/show/${redirectUser.name}`);
    }
});

//Login Get
router.get('/login', (req, res) => {
    if (req.user) {
        if (req.user.role === 0) {
            res.render('dashboard.hbs', {
                user: req.user.name,
            });
        } else {
            res.redirect("/users/admin");
        }
    }
    else {
        res.render('login.hbs');
    }
});

//Register Get
router.get('/register', (req, res) => {
    if (req.user) {
        res.render('dashboard.hbs', {
            user: req.user.name,
        });
    }
    else {
        res.render('register.hbs');
    }
});

//Register Post
router.post('/register', async (req, res) => {
    const { name, email, password, password2, role } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2 || !role) {
        errors.push({ msg: "Please fill in all fields." })
    }
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match." })
    }
    if (password.length < 5) {
        errors.push({ msg: "Password should be at least 5 characters." })
    }
    if (errors.length > 0) {
        res.render("register.hbs", {
            errors
        });
    } else {
        const user = await User.findOne({ email: email });
        if (user) {
            errors.push({ msg: "User already exists in database." });
            res.render("register.hbs", {
                errors
            });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await User.create({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                role: req.body.role
            });
            req.flash("success_msg", "You are now registered.Feel free to login anytime !");
            res.redirect("/users/login");
        }
    }
});

//Login post
//U login post-u dodajemo passport.authenticate koji kao prvi parametar prihvata dje se vrsi autentikacija kod nas je lokalno
//kao drugi prihvata objekat sa kljucevima ako je autentikacija dobro prosla tamo u passport.js smo poslali user-a koji je loginovan
//e sad on biva proslijedjen i kroz successRedirect naravno uz redirect na stranicu /dashboard ,failureRedirect ce se aktivirati ako nije 
//autentikacija dobro prosla a failureFlash:true stavljamo da bi prikazali poruke za npr los pasvord ili nepostojeceg user-a 
router.post("/login", (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true,
        successFlash: true
    })(req, res, next);
});

//Logout
router.post("/logout", (req, res) => {
    req.logOut();
    req.flash('success_msg', "You just logged out.");
    res.redirect("/users/login");
});

router.get("/admin", checkAuthentication, adminPermission, async (req, res) => {
    const users = await User.find({ role: 0 }).sort({ createdAt: -1 });
    const numberOfUsers = await User.countDocuments({ role: 0 });
    res.render("adminPanel.hbs", {
        users: users,
        numberOfUsers: numberOfUsers,
    });
});

//Kad admin izabere da obrise odredjenog basic korisnika dugme DELETE u admin paneli od korisnika
//ga dovodi na router.post("/delete/:userId") dje je :userId id od user-a kojeg smo odlucili da obrisemo
//stavljamo asinhronu funkciju jer zeleimo da koristimo await tj promise
//prvo sto radimo jeste u const user stavljamo user-a kojeg smo odabrali da obrisemo jer nam je to potrebno
//da bi obrisali sve knjige koje je taj user postavio to brisanje knjiga radimo kroz await Book.deleteMany
//ta mongoose funkcija brise sve Book kojima se id poklapa sa array user.book tj sa ajdijevima korsinkovih knjiga
//sljedeca stvar jeste da u userBooksObject smjestimo sve korisnikove knjige tu dobijamo objekte knjiga i userov objekat
//nama treba njihov key pod imenom img: koji je u stvari path do knjige ../images/ime.jpg
//nakon toga u userBooks mapiramo userBooksObject.book (da bi pristupili knjigama jer nam ne treba user object)
//mapiramo pojedinacno elemente i uz svaki dodajemo glavnu putanju + path book.img (micemo ../ pomocu substring i lastindexOf)
//i dobijamo niz full-path-ova do odredjene slike 
//Sto se tice brisanja usera to je jednostavna funkcija ona i ova deleteMany books su mogle da idu zajedno 
//ali posto nama treba asinhrono brisanje svih slika iz foldera images (slika koje su povezane sa knjigama koje brisemo)
//mi pravimo funkciju rekurzivnu koja ce brisati jedan po jedan element iz niza userBooks sve dok ne naidje na undefiend tj
//dok ne zavrsi kad se to desi proslijedili smo callback funkciju koja poziva brisanje user-a i svih knjiga i koja redirektuje na 
//admin panel uz success_msg (flash poruka)
router.post("/delete/:userId", async (req, res) => {
    const user = await User.findOne({ _id: req.params.userId });
    const userBooksObject = await User.findOne({ _id: req.params.userId })
                                      .populate('book')
                                      .exec();
    const userBooks = userBooksObject.book.map((book) => {
        return uploadsFolder + book.img.substring(book.img.lastIndexOf("/") + 1);
    });
    deleteImages(userBooks, async () => {
        await User.findOneAndDelete({ _id: req.params.userId });
        await Book.deleteMany({ _id: { $in: user.book } });
        req.flash("success_msg", "User and his books successfully deleted!");
        res.redirect("/users/admin");
    });
});

function deleteImages(images, callback) {
    var image = images.pop();
    if (image == undefined) {
        callback();
    } else {
        fs.unlink(image, err => {
            if (err) throw err;
            console.log(`${image}.csv was deleted`);
        });
        deleteImages(images, callback);
    }
}

module.exports = router;
