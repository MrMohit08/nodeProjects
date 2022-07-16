const express = require("express");
const mongoose = require("mongoose");
const route = require("./Routes/routes.js");
const bodyParser = require("body-parser");
const app = express();
const multer = require("multer") // multer is a middleware for handling multipart/form-data.

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( multer().any()) //accepts all files that comes over the wire. An array of files will be stored in req.files

mongoose.connect("mongodb+srv://mohit08:BMqbHFaOsEjDesmP@cluster0.btwze.mongodb.net/Project-03", {
    useNewUrlParser: true
})
.then( () => console.log("WELCOME Mr. Mohit , MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});

