const Book = require("../models/Book");

async function calculateEarnings(books) {
    return new Promise((resolve, reject) => {
        try {
            let totalPossibleEarnings = 0;
            books.forEach(book => {
                totalPossibleEarnings += book.possibleEarnings;
            });
            resolve(totalPossibleEarnings);
        } catch (error) {
            console.log("There was error: " + error);
            resolve(false);
        }
    });
}

module.exports = calculateEarnings;

