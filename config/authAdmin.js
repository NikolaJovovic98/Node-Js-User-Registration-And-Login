
module.exports = {
    adminPermission: (req, res, next) => {
        if (req.user.role === 1) {
            return next();
        } else {
            req.flash("error_msg","Not authorized to view this resource");
            res.redirect("/dashboard");
        }
    }
}

