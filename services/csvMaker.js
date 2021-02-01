const {createObjectCsvWriter} = require('csv-writer');

//Prvo npm install csv-writer onda kreiramo ovaj createObjectCsvWriter
//onda u module.exports eksportujemo funkciju koja ce da stvori novi csv fajl u zeljenom folderu
//sa posavljenim imenom kao dolje ovo id treba da se poklopi sa key-jevima iz objekta kojeg prebacamo u csv
//dok ovo title ce da bude naslov tih polja posto u books.js u /add zelimo da dodamo csv sa info o toj knjizi
//moramo ovdje staviti ispred funkcije async kako bi tamo koristili await ovaj modul csv-writer 
//mora da primi niz objekata! dakle npr const data = [{prvi objekat},{drugi objekat}...] dakle ne moze
//da upise u csv fajl podatke ako samo proslijedimo objekat a ne niz objekata!

module.exports = (async(bookObject) => {
    let pathToCsv = __dirname + `/csv/${bookObject[0].name}.csv`;
    if(bookObject.length>1){
        pathToCsv = __dirname + `/csv/AllBooks.csv`
    }
    const csvWriter = createObjectCsvWriter({
        path: pathToCsv,
        header: [
            { id: 'name', title: 'NAME' },
            { id: 'description', title: 'DESCRIPTION' },
            { id: 'price', title: 'PRICE' },
            { id: 'quantity', title: 'QUANTITY' },
            { id: 'pages', title: 'PAGES' },
        ]
    });

     csvWriter.writeRecords(bookObject).then(()=>{
         console.log("CSV created");
     });
});


