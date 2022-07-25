const jwt = require('jsonwebtoken')
const mongoose = require("mongoose");
const UserModel = require("../Models/userModel")

const aunthetication = async function(req,res,next){
    try{
        let bearerHeader = req.headers["authorization"]
        if(!bearerHeader){
            return res.status(400).send({
              status: false, Error: "Enter Token In BearerToken !!!" })
      }

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        if(!bearerToken){
           return res.status(403).send({
              status: false, message: "invalid token" })
}
   // To verify the token, we are using error handling callback function
   jwt.verify(bearerToken, "My name is Mohit", (err, decoded) => {     
       if (err) {
          return res.status(401).send({
            status: false, message: "Authentication Failed"})
}
      else {
         req.token = decoded //Attribute to store the value of decoded token
          next()
    }
})
} 
  catch(err){
    console.log("this error is from token validation", err.message)
    res.status(500).send({ msg: err.message })
  }
}

module.exports.aunthetication = aunthetication

