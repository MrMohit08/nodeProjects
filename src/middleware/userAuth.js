const jwt = require('jsonwebtoken')

const tokenValidator = async function (req, res, next) {
    try {
        let token = req.headers["y-Api-key"] // we pass y-Api-key in postman headers and it stores in token variable
        if (!token) token = req.headers["y-api-key"] // if y-Api-key is not present in headers than pass y-api-key in header

        if (!token) return res.status(403).send({
             status: false,
              msg: "Missing authentication token in request" }) // if token is not present it gives 400 http code in response with alert message
    
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


module.exports.tokenValidator = tokenValidator
