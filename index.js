const express = require("express");
const fs = require("fs");
const path = require('path');

app = express();

obGlobal = {
    obErori: null,
    obImagini: null
};

foldere = ["temp", "temp1"];

for (let folder of foldere) {
    let cale = path.join(__dirname, folder);

    if (!fs.existsSync(cale))
        fs.mkdirSync(cale);
}

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));

app.use(/^\/resurse(\/(?=[a-zA-Z0-9])+[a-zA-Z0-9]*)*/, function(req, res) {
    afisEroare(res, 403);
});

app.use(function(req, res, next) {
    if (req.url.endsWith('/') && req.url !== '/') {
        const redirectUrl = req.url.slice(0, -1);
        res.redirect(301, redirectUrl);
    } else
        next();
});

app.get(["/index", "/", "/home"], function(req, res) {
    console.log("request " + req.url);
    res.render("pagini/index");
});

app.get("/favicon.ico", function(req, res) {
    console.log("request " + req.url);
    res.sendFile(__dirname + "/resurse/ico/favicon.ico");
});

app.get("/*.ejs", function(req, res) {
    console.log("request " + req.url);
    afisEroare(res, 400);
});

function initErori() {
    var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8");
    var obErori = JSON.parse(continut);

    for (let eroare of obErori.info_erori) {
        eroare.imagine = "/" + obErori.cale_baza + "/" + eroare.imagine;
    }

    obGlobal.obErori = obErori;
}

initErori();

function afisEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find(function(elemErr) {
        return elemErr.identificator == identificator;
    });

    if (eroare) {
        let titlu1 = titlu || eroare.titlu;
        let text1 = text || eroare.text;
        let imagine1 = imagine || eroare.imagine;

        if (eroare.status)
            res.status(eroare.identificator).render("pagini/eroare", { titlu: titlu1, text: text1, imagine: imagine1 });
        else
            res.render("pagini/eroare", { titlu: titlu1, text: text1, imagine: imagine1 });
    } else {
        res.render("pagini/eroare", {
            titlu: obGlobal.obErori.eroare_default.titlu,
            text: obGlobal.obErori.eroare_default.text,
            imagine: obGlobal.obErori.eroare_default.imagine
        });
    }
}

app.listen(8080);
console.log("Serverul a pornit");
