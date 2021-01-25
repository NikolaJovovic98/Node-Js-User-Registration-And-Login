//Eksportujemo checkAuthentication koji sadrzi funckiju tj middleware
//Koji ce da provjeri da li je korisnik autentifikovan tj da li je loginovan
//provjeravamo ukoliko jeste return next u prevodu idi na sljedeci middlewer
//ako nije ispisi fles poruku i redirektuj na users/login
module.exports = {
    checkAuthentication: (req,res,next)=>{
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error_msg","Please login to view this resource");
        res.redirect("/users/login");
    }   
}