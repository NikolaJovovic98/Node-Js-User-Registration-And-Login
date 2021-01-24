const User = require("../models/User"); 
const Book = require("../models/Book"); 

module.exports = {
    userPermission: async (req, res, next) => {
        if (req.isAuthenticated()) {
            if (req.params.userName === req.user.name) {
                const user = await User.findOne({ name: req.params.userName });
                const booksTest = await User.findOne({ name: req.params.userName })
                                            .populate('book')
                                            .exec();
                let role = "Basic User";
                if (user.role === 1) {
                    role = "Admin";
                }
                return res.render("oneUser.hbs", {
                    userName: user.name,
                    userEmail: user.email,
                    userRole: role,
                    books: booksTest.book,
                    canEdit:true
                });
            }
        }
        return next();
    }
}