const ProductModel = require("../Models/productModel");
const validator = require('../Validations/validation');
const aws = require('../AWS/s3Helper')

const createProduct = async function(req, res){
    try{
         let data = req.body;
         let { title,description,price,currencyId,currencyFormat,style,availableSizes,installments} = data;
//Validate body 
    if (!validator.isValidBody(data)) {
      return res.status(400).send({
         status: false, msg: "Please provide details" });
 }
//validate title
    if(!validator.isValid(title)) {
       return res.status(400).send({
         status: false, message: "Title must be present" })
}
    const titleInUse = await ProductModel.findOne({ title: title })
      if (titleInUse) {
        return res.status(400).send({
           status: false, message: "enter different Title" })
}
//validate Description field
    if(!validator.isValid(description)) {
      return res.status(400).send({
          status: false, message: "Description must be present" })
}
//validate Price field
    if(!price || (typeof(price) != number)){
        return res.status(400).send({
            status: false, message: "price details must be present and it should be in number"})
}
    if (!/^([0-9]{0,2}((.)[0-9]{0,2}))$/.test(price)) {
        return res.status(400).send({ status: false, message: "Please Provide Valid Price" })
}
//validate Currency ID field
    if(!validator.isValid(currencyId)) {
       return res.status(400).send({
         status: false, message: "currencyId must be present" })
}
    if(currencyId !== "INR") {
      res.status(400).send({
        status: false,message: "currencyId should be in INR format only"});
}
//validate Currency Format field
    if(!validator.isValid(currencyFormat)) {
       return res.status(400).send({
         status: false, message: "currency format must be present" })
} 
    if(currencyFormat !== "₹") {
       res.status(400).send({
         status: false,message: "currency format should be in INR format only"});
}
//validation for style field
    if(!validator.isValid(style)) {
      return res.status(400).send({
        status: false, message: "Style must be present" })
}   
//validation for available sizes field
    if(availableSizes) {
      if (!isValidSize(availableSizes)) {
         return res.status(400).send({
            status: false, message: "Please Provide Available Sizes from S,XS,M,X,L,XXL,XL",});
    }
}
//validations for installments
    if(!installments || (typeof(installments) != number)){
       return res.status(400).send({
           status: false, message: "Installments details must be present and it should be in number"})
}
    if (!/^(0|[1-9][0-9]*)$/.test(installments)) {
    return res.status(400).send({ status: false, message: "Please Provide Valid details" })
}
let files = req.files;
    if (files && files.length > 0) {
        let uploadedFileURL = await aws.uploadFile(files[0]);
          console.log(uploadedFileURL)
            data.productImage = uploadedFileURL
}
        else{
            res.status(400).send({message: "no file found"})
    }
// After passing all the validation create document for product  
let Product = await ProductModel.create(data);
return res.status(201).send({
  status: true,message: "Product saved successfully",data: Product}); 
}
    catch(err){
        res.status(500).send({
            message: "Error", error: err.message})
    }
}

//-------------------------------------------Get Products(not deleted)================================//

const getProduct = async function(req, res){
    try{
        let filterQuery = req.query;
        filterQuery.isDeleted = false;

        let queryDataSize = filterQuery.size;  
         


    }
    catch(err){
        res.status(500).send({
            message: "Error", error: err.message})
    }
}