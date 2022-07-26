const UserModel = require("../Models/userModel")
const emailValidator = require("email-validator")
const pv = require("pincode-validator");
const jwt=require('jsonwebtoken')
const validator = require('../Validations/validation');
const aws = require('../AWS/s3Helper')
const bcrypt = require("bcrypt");

const createUser = async function(req, res){
  try{
       let data = req.body;
    
//Validate body 
  if (!validator.isValidBody(data)) {
       return res.status(400).send({
         status: false, msg: "Please provide details" });
    }
//validate first name
   if(!validator.isValid(data.fname)) {
      return res.status(400).send({
         status: false, message: "fname must be present" })
}
   if(!validator.isValidName(data.fname)) {
      return res.status(400).send({
         status: false, msg: "Invalid fname" })
}
//validate last name
   if (!validator.isValid(data.lname)) {
      return res.status(400).send({
         status: false, message: "lname must be present" })
}
   if (!validator.isValidName(data.lname)) {
      return res.status(400).send({
         status: false, msg: "Invalid lname" })
}
//validate email
   if (!validator.isValid(data.email)) {
      return res.status(400).send({
         status: false, message: "email must be present" })
}
//validate email is in correct format 
   if (!emailValidator.validate(data.email)) {
    return res.status(400).send({
        status: false, message: "Email-Id is invalid"})
}
//Checks For Unique Email Id
  let email = data.email.toLowerCase()
        let checkEmail = await UserModel.findOne({ email });
        if (checkEmail) {
            return res.status(400).send({
              status: false, message: ` ${email} mail is already registered` })
        }
// Validate phone
   if (!validator.isValid(data.phone)) {
      return res.status(400).send({
        status: false, message: "phone must be present" })
}
// Validation of phone number
   if (!validator.isValidMobileNo(data.phone)) {
       return res.status(400).send({
         status: false, message: "Invalid phone number" })
}
//check for unique phone no
   let duplicatePhone = await UserModel.findOne({phone: data.phone});
     if (duplicatePhone) {
       return res.status(400).send({
         status: false, message: `${phone} phone is already used` })
}
//validation for password
   if (!validator.isValid(data.password)) {
       return res.status(400).send({
         status: false, message: "password must be present" })
}
   if (!validator.isValidPassword(data.password)) {
       return res.status(400).send({
          status: false, message: "Invalid password" })
}
// encrypted password
  let encryptPassword = await bcrypt.hash(data.password, 12)
  data.password = encryptPassword;

//validation for Address
if (data.address) {
  let address = JSON.parse(data.address);
 
if(address.shipping){
//Validate street, city, pincode of shipping
     if (!validator.isValid(address.shipping.street && address.shipping.city && address.shipping.pincode)) {
        return res.status(400).send({
          status: false, message: "Shipping address details is/are missing" })
}
// Validate shipping pincode
    if (!pv.validate(address.shipping.pincode)) {
        return res.status(400).send({
           status: false, message: "Pincode is invalid"})
}
}
  if(address.billing){
   //Validate street, city, pincode of billing
     if (!validator.isValid(address.billing.street && address.billing.city && address.billing.pincode)) {
          return res.status(400).send({
            status: false, message: "Billing address details is/are missing" })
}
// Validate billing pincode
if (!pv.validate(address.billing.pincode)) {
    return res.status(400).send({
       status: false, message: "Pincode is invalid"})
}
  }
}
   let files = req.files;
    if (files && files.length > 0) {
        let uploadedFileURL = await aws.uploadFile(files[0]);
          console.log(uploadedFileURL)
            data.profileImage = uploadedFileURL
        }
        else{
            res.status(400).send({message: "no file found"})
        }
       
//After passing all the validation create user data
    let savedData = await UserModel.create(data)
        return res.status(201).send({
          status: true, message: "User created successfully", data: savedData })
    }
    catch(err) {
        console.log("Erorr From Create User :", err.message)
        res.status(500).send({
            status: false, message: err.message})
    }
}
//===================================================User Login===================================//

const userLogin = async function(req,res){
   try{
     let data = req.body
     const {email, password} = data;

//Validate body 
  if (!validator.isValidBody(data)) {
    return res.status(400).send({
      status: false, message: "Please provide details" });
 }
//if email id and username is not present  
  if (!email || !password) {
      return res.status(400).send({
        status: false, message: "please enter username or password"})
}
//validate mail
   if (!emailValidator.validate(email)) {
       return res.status(400).send({
          status: false, message: "Email-Id is invalid"})
}
//validate password
   if (!validator.isValidPassword(password)) {
        return res.status(400).send({
           status: false, message: "Invalid password" })
}

let userData = await UserModel.findOne({email});
if (!userData)
    return res.status(400).send({
        status: false, message: "invalid login mail"})
    
 const match  = await bcrypt.compare(password, userData.password);
 if (!match) {
     return res.status(400).send({
        status: false, message: "Plz Enter Valid Password !!!" });
 }  
 
 let token = jwt.sign({   //sign method is used to generate or create token
    userId : userData._id,  //_id contains an entire payload of userData 
       iat : Math.floor(Date.now() /1000), // issued current date
       exp : Math .floor(Date.now() /1000) * 24 * 60 * 60 // expired will be after 24 hour
   },
   "My name is Mohit"   // secret key 
)
res.setHeader("x-api-key", token); 
res.status(200).send({
    status: true, message: "user login successful", data: { userId: userData._id, token: token }})
}
catch (err) {
    res.status(500).send({
         status: false, msg: err.message});
}
}
//========================================GET USER==================================================//
const getUser = async function(req, res){
    try{
        let userLoggedIn = req.tokenData.userId //Accessing user from token attribute
        let userIdfromParams = req.params.userId //Accessing userId from params

//validate userId
    if (!validator.isValid(userIdfromParams)) {
       return res.status(400).send({ 
         status: false, message: "Please Provide User Id" })
}
     if (!(validator.isValidObjectId(userIdfromParams))) {
         return res.status(400).send({
            status: false, message: "invalid userId"})
}
if (userIdfromParams != userLoggedIn) {
    return res.status(403).send({
        status: false, msg: "Error, authorization failed"})
}
let checkData = await UserModel.findOne({ _id: userIdfromParams})

if (!checkData) {
    return res.status(404).send({ status: false, message: "User not Found" })
}
 return res.status(200).send({ status: true, message: "Success", data: checkData})

}
catch(error){
    return res.status(500).send({
      status: false, message: error.message })
}
}

//===============================================UpdateUser==================================//

const updateUser = async function (req, res){
    try{
        const data = req.body
    //Validate body 
      if (!validator.isValidBody(data)) {
         return res.status(400).send({
           status: false, message: "Please provide details" });
    }
    
     let userID= req.params.userId

    //checks if user id is coming in request or not
      if(!userID){
          return res.send({
             status:false, message:"Error! Please give user id"})
    }
    //check if userid is valid
       if (!validator.isValidObjectId(userID)) {
           return res.status(400).send({
             status: false, message: `${userID} is invalid`})
    }

    const userFound = await UserModel.findOne({ _id: userID})
        if (!userFound) {
            return res.status(404).send({
                 status: false, message: "User does not exist" })
        }

     let updatedData = {}
    //validation for fname
        if (validator.isValid(data.fname)) {
            if (!validator.isValidName(data.fname)) {
                return res.status(400).send({ status: false, msg: "Invalid fname" })
            }
            updatedData.fname = data.fname
        }
    //validation for lname
    if (validator.isValid(data.lname)) {
        if (!validator.isValidName(data.lname)) {
            return res.status(400).send({ status: false, msg: "Invalid lname" })
        }
        updatedData.lname = data.lname
    }
    //validation for mail
    if (validator.isValid(data.email)) {
        if (!emailValidator.validate(data.email)) {
            return res.status(400).send({ status: false, message: "Invalid email id" })
        }
    const duplicatemail = await UserModel.findOne({ email: data.email })
        if (duplicatemail) {
            return res.status(400).send({ status: false, message: "email id already exist" })
        }
        updatedData.email = data.email
    }
    //Updating of phone
    if (validator.isValid(data.phone)) {
        if (!validator.isValidMobileNo(data.phone)) {
            return res.status(400).send({ status: false, message: "Invalid phone number" })
        }
   
    const duplicatePhone = await UserModel.findOne({ phone: data.phone })
    if (duplicatePhone) {
        return res.status(400).send({ status: false, message: "phone number already exist" })
    }
    updatedData.phone = data.phone
}
    // Updating of password
    if (data.password) {
        if (!validator.isValid(data.password)) {
            return res.status(400).send({
              status: false, message: 'password is required' })
        }
        if (!validator.isValidPassword(data.password)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 character and max 15 " })
        }
        const encrypt = await bcrypt.hash(data.password, 10)
        updatedData.password = encrypt
    }
    //update profile Image
      let files = req.files;
       if (files && files.length > 0) {
       let uploadedFileURL = await aws.uploadFile(files[0]);
       if (uploadedFileURL) {
            updatedData.profileImage = uploadedFileURL
        }
    }
    //update address
    if (data.address) {
      let address = JSON.parse(data.address)
        if(address.shipping) {
            if (address.shipping.street) {
                if (!validator.isValid(address.shipping.street)) {
                    return res.status(400).send({ status: false, message: 'Please provide street' })
                }
                updatedData.address.shipping.street = address.shipping.street
            }
            if(address.shipping.city) {
                if (!validator.isValid(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: 'Please provide city' })
                }
                updatedData.address.shipping.city = address.shipping.city
            }
            if (address.shipping.pincode) {
                if (typeof address.shipping.pincode !== 'number') {
                    return res.status(400).send({ status: false, message: 'Please provide pincode in number format'})
                }
            // Validate shipping pincode
            if (!pv.validate(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, msg: "Invalid Shipping pincode" })
                }
                updatedData.address.shipping.pincode = address.shipping.pincode
            }
        }
        if (address.billing) {
            if (address.billing.street) {
                if (!validator.isValid(address.billing.street)) {
                    return res.status(400).send({ status: false, message: 'Please provide street' })
                }
                updatedData.address.billing.street = address.billing.street
            }
            if (address.billing.city) {
                if (!validator.isValid(address.billing.city)) {
                    return res.status(400).send({ status: false, message: 'Please provide city' })
                }
                updatedData.address.billing.city = address.billing.city
            }
            if (address.billing.pincode) {
                if (typeof address.billing.pincode !== 'number') {
                    return res.status(400).send({ status: false, message: 'Please provide pincode in number format' })
                }
                // Validate billing pincode
                if (!pv.validate(address.billing.pincode)) {
                    return res.status(400).send({ status: false, msg: "Invalid billing pincode" })
                }
                updatedData.address.billing.pincode = address.billing.pincode
            }
        }
    }
     const updated = await UserModel.findOneAndUpdate({ _id: userID}, updatedData, { new: true })
        return res.status(200).send({
             status: true, data: updated}) 
}
    catch(err) {
        res.status(500).send({
         message: "Error", error: err.message})
    }
}

module.exports.createUser = createUser
module.exports.userLogin = userLogin
module.exports.getUser = getUser
module.exports.updateUser = updateUser


