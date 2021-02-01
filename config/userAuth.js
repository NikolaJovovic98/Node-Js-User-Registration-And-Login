const User = require("../models/User"); 
const calculateEarnings = require("../services/calculateEarnings");

module.exports = {
    userPermission: async (req, res, next) => {
        if (req.isAuthenticated()) {
            if (req.params.userName === req.user.name) {
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
                return res.render("oneUser.hbs", {
                    userName: user.name,
                    userEmail: user.email,
                    userRole: role,
                    books: books.book,
                    possibleEarnings: totalPossibleEarnings,
                    numOfBooks: numberOfBooksByUser,
                    canEdit:true
                });
            }
        }
        return next();
    }
}