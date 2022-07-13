const jwt = require('jsonwebtoken')
const mongoose = require("mongoose");
const BookModel = require("../Models/bookModel")

const tokenValidator = async function (req, res, next) {
    try {
        let token = req.headers["y-Api-key"] //get the token from the header if present
        if (!token){
             token = req.headers["y-api-key"] // if y-Api-key is not present than get y-api-key from header
        }
        if (!token) return res.status(403).send({
             status: false,
              msg: "Authentication Token is missing" }) // //if no token found, return response
    
    // To verify the token, we are using error handling callback function
     jwt.verify(token, "My name is Mohit", (err, decoded) => {     
        //Only if token validation Fails
        if (err) {
            return res.status(401).send({
                status: false,
                msg: "Authentication Failed"
            })
        }
        //If token validaion Passes it goes to the else condition
        else {
            req.token = decoded //Attribute to store the value of decoded token
            next()
        }
    })
}
catch (err) {
    console.log("this error is from token validation", err.message)
    res.status(500).send({ msg: err.message })
}
}

//==================================Authorization for create user================================//

const ownerAuth = async function (req, res, next) {
    try {
        
        let userLoggedIn = req.token.userId   //Accessing user from token attribute
        let userAccessing = req.body.userId //userId coming in request body
     
        //checks if user id is coming in request or not
    if(!userAccessing){
        return res.send({
            status:false,
            msg:"Error! Please check user id and try again"
        })}

       //check if userid is valid or not 
       let isValiduserID = mongoose.Types.ObjectId.isValid(userAccessing); // here we use mongoose "isValid" method
       if (!isValiduserID) {
            return res.status(400).send({
             status: false, message: "Enter a valid user Id"});

      }
        if (userAccessing != userLoggedIn) {
            return res.status(403).send({
                status: false, msg: "Error, authorization failed"})
        }

        next()
    }
    catch (err) {
        console.log("this error is from user create ", err.message)
        res.status(500).send({ msg: err.message })
    }
}

//====================================Authorization for params path====================================//

const authorization = async function(req,res,next){
    try{
        let userLoggedIn = req.token.userId   //Accessing userId from token attribute
        let BookId = req.params.bookId  // pass book id in path params
     //check if book id is valid or not 
        let isValidbookID = mongoose.Types.ObjectId.isValid(BookId); // here we use mongoose "isValid" method
        if (!isValidbookID) {
             return res.status(400).send({
              status: false, message: "Enter a valid book id"}); 
    }
    let bookAccessing = await BookModel.findById(BookId)
        if (!bookAccessing) {
            return res.status(404).send({
                status: false, message: "Error! Please check book id and try again"})
        }
 
    if (bookAccessing.userId != userLoggedIn) {
        return res.status(403).send({
            status: false, msg: "Error, authorization failed"})
    }

    next()

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
      }
}




module.exports.tokenValidator = tokenValidator
module.exports.ownerAuth = ownerAuth
module.exports.authorization = authorization
