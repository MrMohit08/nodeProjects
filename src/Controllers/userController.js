const UserModel = require("../Models/userModel")
const validator = require("email-validator")
const pv = require("pincode-validator");
const jwt=require('jsonwebtoken')

const createUser = async function(req, res){
    try{
    // we create a variable named "data" and store req.body in the variable    
     let data = req.body // we passed the data through req.body in the postman
     const {title, name, phone, email, password} = data; //object destructuring
      
    // validation to check if data is coming or not in request body
    if(Object.keys(data).length == 0){
        return res.status(400).send({
         status: false,
         msg : "Please provide user details"
    })
 }
    //Validation for title
    if (!title || (typeof (title) != "string") || (title.trim().length==0)) {
        return res.status(400).send({
            status: false,
            msg: "Title is Missing or does not have a valid input"
        })
    }
    else {
        if (title != "Mr" && title != "Mrs" && title != "Miss") {
            return res.status(400).send({
                status: false,
                msg: "Title can only be Mr Mrs or Miss"
            })
        }
    }
     // validation for name
     if (!name || (typeof (name) != "string" || !name.trim().match(/^[a-zA-Z][a-zA-Z\s]+$/))) {
        return res.status(400).send({
            status: false,
            msg: "Name is Missing or should contain only alphabets"
        })
    }
    // validation for phone
    if (!phone) {
        return res.status(400).send({
          status: false, message: "Phone number is required" })
    }
    // create a function to validate, so that it comes in proper format
     const isValidMobile = function (number) {
        return /^[6-9]\d{9}$/.test(number)
}

   if (!isValidMobile(phone)) {
     return res.status(400).send({
       status: false,
       message: 'Mobile number is invalid, please enter 10 digit mobile number' 
   })
} 
   //check for unique phone number
   const isMobileAlreadyUsed = await UserModel.findOne({mobile : phone});
      if(isMobileAlreadyUsed) {
         return res.status(400).send({
         status: false,
         msg: "Mobile number is already Registred"
    })
}

   // validation for email 
   if (!email || (typeof (email) != "string") || (email.trim().length == 0)) {
    return res.status(400).send({
    status: false,
    msg: "Email is Missing or has invalid input"
})
}
//validation for proper email format
   if (!validator.validate(email)) {
    return res.status(400).send({
    status: false,
    msg: "Email-Id is invalid"
})
}
  //Checks For Unique Email Id
  let checkEmail = await UserModel.findOne({email : email})
  if(checkEmail) {
    return res.status(409).send({
    status: false,
    msg: "Email Id is already in use"
 })
}

  // validation for password 
    if (!password || (typeof (password) != "string") || (password.trim().length == 0)|| !password.
        match(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
            return res.status(400).send({
                status: false,
                msg: "password must be 8 charecter long with a number special charecter and should have both upper and lowercase alphabet"
            })
        }
    //password should be minimum length of 8 and should be max length of 15    
  if (password.length < 8 || password.length > 15){
        return res.status(400).send({
           message: "password length must be minimum of 8 and max of 15 character"
         })
}
 //------------------------------------ address----------------------------------------------------// 
 let street = data.address.street // we passed the street data in body through data.address in the postman
 let city = data.address.city 
 let pincode = data.address.pincode

//validation for city
 if (!city || (typeof (city) != "string" || !city.match(/^[A-Za-z]+$/))) {
    return res.status(400).send({
        status: false,
        msg: "Enter valid city name"
    })
}
 //validations for street
 if(street){
    let validateStreet = /^[a-zA-Z0-9]/
    if (!validateStreet.test(street)) {
        return res.status(400).send({
             status: false,
              message: "enter valid street name" 
       })
    }
}
//validations for pincode
if (!pincode) {
    return res.status(400).send({
    status: false,
    msg: "Pincode is Missing or has invalid input"
})
} // validate pincode in pin format
   if (!pv.validate(pincode)) {
    return res.status(400).send({
    status: false,
    msg: "Pincode is invalid"
})
}
//After passing all the validations it creates the user data 
const user = await UserModel.create(data)
   return res.status(201).send({
     status: true,
     message: "user created successfully", data: user})

}
catch (err) {
res.status(500).send({ status: false, message: err.message })
}
}

//------------------------------------------------userLogin-------------------------------//


const userLogin = async function(req,res){
    try {
       let userName = req.body.email; // we passed the username through req.body in the postman
       let password = req.body.password; // we passed the password through req.body in the postman

    // validation to check if data is coming or not in request body
    if(Object.keys(data).length == 0){
        return res.status(400).send({
         status: false,
         msg : "Please provide user details"
    })
 }
 // validation for email & password
 if (!userName || !password) {
    return res.status(400).send({
        status: false,
        msg: "please enter username or password"
    })
}

// validate that email is in valid format
if (!validator.validate(userName)) {
    return res.status(400).send({
    status: false,
    msg: "Email should be a valid email address"
})
}
// validate that password is in correct format
if (!password || (typeof (password) === 'string' &&  (password).trim().length === 0)|| !password.
        match(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
            return res.status(400).send({
                status: false,
                msg: "password must be 8 charecter long with a number, special charecter and should have both upper and lowercase alphabet"
            })
     }
    
     const user = await UserModel.findOne({ email : userName, password : password});

     if(!user){
        return res.status(400).send({
            status:false,
            message:`Invalid login credentials`
        });
    }
    //Token Validation
    let token = jwt.sign({   //jwt.sign method is used to generate or create token
        userId : user._id,  //_id contains an entire payload of userData 
           iat : Math.floor(Date.now() /1000), // issued current date
           exp : Math .floor(Date.now() /1000) + (60 * 60) // expired will be after 1 hour
       },
       "My name is Mohit"   // secret key 
    )
    res.setHeader("y-api-key", token);
    res.status(200).send({
        status: true,
        data: token
    })
}
catch (error) {
    res.status(500).send({
      status:false,
       message:error.message
    });
}

}
 

module.exports.createUser = createUser
module.exports.userLogin = userLogin

    
