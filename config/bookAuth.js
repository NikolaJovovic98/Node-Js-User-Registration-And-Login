const Book = require("../models/Book");
const User = require("../models/User");

module.exports = {
    bookPermission: async (req, res, next) => {
        if (req.isAuthenticated()) {
            const book = await Book.findOne({ name: req.params.bookName });
            const bookUserId = JSON.stringify(book.user);
            const loggedUserId = JSON.stringify(req.user.id);
            const userWhoAddedBook = await User.findOne({ _id: book.user });
            if (bookUserId === loggedUserId) {
                return res.render("oneBook.hbs", {
                    bookName: book.name,
                    bookPrice: book.price,
                    bookQuant: book.quantity,
                    bookPages: book.pages,
                    bookDesc: book.description,
                    bookImg: book.img,
                    user: userWhoAddedBook.name,
                    canEdit: true
                });
            }
        }
        return next();
    }
}


