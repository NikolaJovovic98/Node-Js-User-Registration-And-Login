const Book = require("../models/Book");

module.exports = {
    checkQuantity: async (req, res, next) => {
        const book = await Book.findOne({ name: req.params.bookName });
        const result = req.url.split("/");
        if (result[1] === "inc") {
            if (book.quantity === 10) {
                req.flash("error_msg", "Maximum amount of books is 10");
                res.redirect(`/books/show/${book.name}`);
            } else {
                return next();
            }
        } else {
            if (book.quantity === 1) {
                req.flash("error_msg", "Minimum amount of books is 1");
                res.redirect(`/books/show/${book.name}`);
            } else {
                return next();
            }
        }
    }
}
