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

    let { fname, lname, email, password, phone, address } = data    
    
//validate first name
   if(!validator.isValid(fname)) {
      return res.status(400).send({
         status: false, message: "fname must be present" })
}
   if(!validator.isValidName(fname)) {
      return res.status(400).send({
         status: false, msg: "Invalid fname" })
}
//validate last name
   if (!validator.isValid(lname)) {
      return res.status(400).send({
         status: false, message: "lname must be present" })
}
   if (!validator.isValidName(lname)) {
      return res.status(400).send({
         status: false, msg: "Invalid lname" })
}
//validate email
   if (!validator.isValid(email)) {
      return res.status(400).send({
         status: false, message: "email must be present" })
}
//validate email is in correct format 
   if (!emailValidator.validate(email)) {
    return res.status(400).send({
        status: false, message: "Email-Id is invalid"})
}
//Checks For Unique Email Id
   email = email.toLowerCase().trim()
        let checkEmail = await UserModel.findOne({ email });
        if (checkEmail) {
            return res.status(400).send({
              status: false, message: ` ${email} mail is already registered` })
        }
// Validate phone
   if (!validator.isValid(phone)) {
      return res.status(400).send({
        status: false, message: "phone must be present" })
}
// Validation of phone number
   if (!validator.isValidMobileNo(phone)) {
       return res.status(400).send({
         status: false, message: "Invalid phone number" })
}
//check for unique phone no
   let duplicatePhone = await UserModel.findOne({ phone });
     if (duplicatePhone) {
       return res.status(400).send({
         status: false, message: `${phone} phone is already used` })
}
//validation for password
   if (!validator.isValid(password)) {
       return res.status(400).send({
         status: false, message: "password must be present" })
}
   if (!validator.isValidPassword(password)) {
       return res.status(400).send({
          status: false, message: "Invalid password" })
}
// encrypted password
  let encryptPassword = await bcrypt.hash(password, 12)

 let shippingAddress = address.shipping
 if(!shippingAddress){
    return res.status(400).send({
         status: false, message: "Shipping address is required" })
}
//Validate street, city, pincode of shipping
    if (!validator.isValid(shippingAddress.street && shippingAddress.city && shippingAddress.pincode)) {
        return res.status(400).send({
          status: false, message: "Shipping address details is/are missing" })
}
// Validate shipping pincode
    if (!pv.validate(pincode)) {
        return res.status(400).send({
           status: false, message: "Pincode is invalid"})
}
 
 let billingAddress = address.billing
  if(!billingAddress){
    return res.status(400).send({
        status: false, message: "billing address must be present" })
  }
//Validate street, city, pincode of billing
   if (!validator.isValid(billingAddress.street && billingAddress.city && billingAddress.pincode)) {
        return res.status(400).send({
          status: false, message: "Billing address details is/are missing" })
}
// Validate billing pincode
if (!pv.validate(pincode)) {
    return res.status(400).send({
       status: false, message: "Pincode is invalid"})
}
   let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0]);
            res.status(201).send({message: "file uploaded successfully", data:uploadedFileUrl})
        }
        else{
            res.status(400).send({message: "no file found"})
        }
      profileImage = uploadedFileURL
//After passing all the validation create user data
    let userData = { fname, lname, email, profileImage, phone, password: encryptPassword, address }

        let savedData = await UserModel.create(userData)
            return res.status(201).send({
              status: true, message: "User created successfully", data: savedData })
    }
    catch(err) {
        console.log("Erorr From Create Author :", err.message)
        res.status(500).send({
            status: false, message: err.message})
    }
}

const userLogin = async function(req,res){
   try{
     let data = req.body
     let userName = data.email
     let password = data.password

//Validate body 
  if (!validator.isValidBody(data)) {
    return res.status(400).send({
      status: false, msg: "Please provide details" });
 }
//if email id and username is not present  
  if (!userName || !password) {
      return res.status(400).send({
        status: false, message: "please enter username or password"})
}
//validate mail
   if (!emailValidator.validate(userName)) {
       return res.status(400).send({
          status: false, message: "Email-Id is invalid"})
}
//validate password
   if (!validator.isValidPassword(password)) {
        return res.status(400).send({
           status: false, message: "Invalid password" })
}

let userData = await AuthorModel.findOne({ email: userName, password: password});
if (!userData)
    return res.status(400).send({
        status: false, message: "invalid usename or password",})
    
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
res.status(200).send({
    status: true, message: "user login successful", data: { userId: userId, token: token }})
}
catch (err) {
    res.status(500).send({
         status: false, msg: err.message});
}
}
//========================================GET USER==================================================//
const getUser = async function(req, res){
    try{
        let userLoggedIn = req.token.userId //Accessing user from token attribute
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
    
     let userIdfromParams = req.params.userId

    //checks if user id is coming in request or not
      if(!userIdfromParams){
          return res.send({
             status:false, message:"Error! Please give user id"})
    }
    //check if userid is valid
       if (!validator.isValidObjectId(userIdfromParams)) {
           return res.status(400).send({
             status: false, message: `${userId} is invalid`})
    }

    const userFound = await UserModel.findOne({ _id: userIdfromParams})
        if (!userFound) {
            return res.status(404).send({
                 status: false, message: "User does not exist" })
        }

     let { fname, lname, email, phone, password, address, profileImage } = data;

     let updatedData = {}
    //validation for fname
        if (validator.isValid(fname)) {
            if (!validator.isValidName(fname)) {
                return res.status(400).send({ status: false, msg: "Invalid fname" })
            }
            updatedData['fname'] = fname
        }
    //validation for lname
    if (validator.isValid(lname)) {
        if (!validator.isValidName(lname)) {
            return res.status(400).send({ status: false, msg: "Invalid lname" })
        }
        updatedData['lname'] = lname
    }
    //validation for mail
    if (validator.isValid(email)) {
        if (!emailValidator.validate(email)) {
            return res.status(400).send({ status: false, msg: "Invalid email id" })
        }
    const duplicatemail = await UserModel.findOne({ email: email })
        if (duplicatemail) {
            return res.status(400).send({ status: false, msg: "email id already exist" })
        }
        updatedData['email'] = email
    }
    //Updating of phone
    if (validator.isValid(phone)) {
        if (!validator.isValidMobileNo(phone)) {
            return res.status(400).send({ status: false, msg: "Invalid phone number" })
        }
    // Duplicate phone
    const duplicatePhone = await UserModel.findOne({ phone: phone })
    if (duplicatePhone) {
        return res.status(400).send({ status: false, msg: "phone number already exist" })
    }
    updatedData['phone'] = phone
}
    //





    }
    catch(err) {
       
    }
}


