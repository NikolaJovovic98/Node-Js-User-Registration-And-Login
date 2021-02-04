const Book = require("../models/Book");
const User = require("../models/User");
const Comment = require("../models/Comment");

module.exports = {
    bookPermission: async (req, res, next) => {
        if (req.isAuthenticated()) {
            const book = await Book.findOne({ name: req.params.bookName });
            const bookUserId = JSON.stringify(book.user);
            const loggedUserId = JSON.stringify(req.user.id);
            const userWhoAddedBook = await User.findOne({ _id: book.user });
            const comments = await Comment.find({book:book.name}).sort({ createdAt: -1 });
            if (bookUserId === loggedUserId) {
                return res.render("oneBook.hbs", {
                    book:book,
                    user: userWhoAddedBook,
                    comments:comments,
                    canEdit: true,
                    canComment: true,
                    loggedUser:req.user.name
                });
            }else{
                return res.render("oneBook.hbs", {
                    book:book,
                    user: userWhoAddedBook,
                    comments:comments,
                    canComment: true,
                    loggedUser:req.user.name
                });
            }
        }
        return next();
    }
}


