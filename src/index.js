const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer")
const bodyParser = require("body-parser")
const route = require("./Routes/route.js");
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use( multer().any()) //accepts all files that comes over the wire.

mongoose.connect("mongodb+srv://mohit08:BMqbHFaOsEjDesmP@cluster0.btwze.mongodb.net/Project-04", {
    useNewUrlParser: true
})
.then( () => console.log("WELCOME Mr. Mohit , MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});