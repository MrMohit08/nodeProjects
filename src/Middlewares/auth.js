const jwt = require('jsonwebtoken')
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
         req.bearerToken = decoded //Attribute to store the value of decoded token
          next()
    }
})
} 
  catch(err){
    console.log("this error is from token validation", err.message)
    res.status(500).send({ msg: err.message })
  }
}

//==============================================Authorization=============================//


const authorization = async function(req,res,next){
    try{
        let userLoggedIn = req.bearerToken.userId   //Accessing userId from token attribute
        let userID = req.params.userId  // pass buser id in path params
     //check if user id is valid or not 
     if (!validator.isValidObjectId(userID)) {
        return res.status(400).send({
          status: false, message: `${userID} is invalid`})
 }

    let userAccessing = await UserModel.findById(userID)
        if (!userAccessing) {
            return res.status(404).send({
                status: false, message: "Error! Please check userid and try again"})
        }
 
    if (userAccessing.userId != userLoggedIn) {
        return res.status(403).send({
            status: false, msg: "Error, authorization failed"})
    }

    next()

    }
    catch (err) {
        res.status(500).send({ 
            status: false, error: err.message })
      }
}


module.exports.aunthetication = aunthetication
module.exports.authorization = authorization

