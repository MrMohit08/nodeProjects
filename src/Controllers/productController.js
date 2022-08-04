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
         status: false, message: "Please provide details" });
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
      return res.status(400).send({ status: false, message: "Description must be present" })
}
    if (!validator.isValidName(description)) {
       return res.status(400).send({ status: false, message: "Enter valid description" }) 
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
      return res.status(400).send({ status: false, message: "Style must be present" })
} 
    if(!validator.isValidName(style)) {
       return res.status(400).send({ status: false, message: "Enter valid style" })
}
//validation for available sizes field
    if(!validator.isValid(availableSizes)) {
       return res.status(400).send({
         status: false, message: "Available size must be present" })
}   
    if(!validator.isValidSize(availableSizes)) {
         return res.status(400).send({
            status: false, message: "Please Provide Available Sizes from S,XS,M,X,L,XXL,XL"});
    }
//validations for installments
    if(!installments || (typeof(installments) != number)){
       return res.status(400).send({
           status: false, message: "Installments details must be present and it should be in number"})
}
    if (!/^(0|[1-9][0-9]*)$/.test(installments)) {
    return res.status(400).send({ status: false, message: "Please Provide Valid details" })
}
//Validation for profile image
    let image = req.files;
     if (!(image && image.length)) {
       return res.status(400).send({ status: false, message: "Please Provide Product Image" })
}
     let uploadedFileURL = await aws.uploadFile(files[0]);
        console.log(uploadedFileURL)
        data.productImage = uploadedFileURL

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
      let query = {}
      let { size, name, priceGreaterThan, priceLessThan, priceSort } = filterQuery;
        
//validation for size
   if(size){       
     if(!validator.isValid(size)){
        return res.status(400).send({status: false, message:"Enter Size"})
   }
     if(!validator.isValidSize(size)) {
        return res.status(400).send({
           status: false, message: "Please Provide Available Sizes from S,XS,M,X,L,XXL,XL"});
   }
      query.availableSizes = size.toUpperCase()
}
//validation for name
   if(name){       
     if(!validator.isValid(name)){
       return res.status(400).send({status: false, message:" Enter Product name"})
  }  
     query.title = name   
}  
//validation for  price greater than
   if(priceGreaterThan) {
     if(!validator.isValid(priceGreaterThan)){
        return res.status(400).send({status: false, message:"Enter value for priceGreaterThan field"})
    }
    query.price = { '$gte': priceGreaterThan}
} 
//validation for  price greater than
   if(priceLessThan) {
     if(!validator.isValid(priceLessThan)){
        return res.status(400).send({status: false, message:"Enter value for priceLessThan field"})
   }
    query.price = { '$lte': priceLessThan}
}
  if(priceGreaterThan && priceLessThan){
    query.price= { '$gte': priceGreaterThan, '$lte': priceLessThan }
  }
  //sorting
  if (priceSort) {
    if (priceSort != '-1' && priceSort != '1') {
        return res.status(400).send({ status: false, message: "You can only use 1 for Ascending and -1 for Descending Sorting" })
    }
}
 
  let getAllProduct = await ProductModel.find({query,isDeleted:false}).sort({ price: priceSort })
   if (!(getAllProduct.length > 0)) {
      return res.status(404).send({ 
        status: false, message: "Products Not Found" })
}
return res.status(200).send({
     status: true, count: getAllProduct.length, message: "Success", data: getAllProduct })
}
catch(err){
    res.status(500).send({
       message: "Error", error: err.message})
    }
}

//==========================================getById=========================================//

const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId
    //check wheather objectId is valid or not--
         if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({
              status: false, message: "please enter valid productId" })
        }
        const searchProduct = await ProductModel.findOne({ _id: productId, isDeleted: false })
        if (!searchProduct){
             return res.status(404).send({ status: false, Message: '😩 prouct does not exists' })
 }
        res.status(200).send({ status: true, Message: '✅ Success', data: searchProduct })
    }
    catch(err){
        res.status(500).send({
            message: "Error", error: err.message})
    }
}

//-----------------------------------------delete product=================================//
 
const deleteProductById = async function(req,res){
    try {
        const productId = req.params.productId;
        //check wheather objectId is valid or not--
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({
              status: false, message: "please enter valid productId" })
        }
        const product = await ProductModel.findById(productId)
        if (!product){
             return res.status(404).send({ status: !true, Message: "😩 Product information unavailable!" })
         }
        if (product.isDeleted){ return res.status(400).send({ status: !true, Message: "😩 Product already deleted!" })
 }
   product.isDeleted = true;
   product.deletedAt = new Date();
   await product.save();
      res.status(200).send({ status: true, Message: "Product deleted successfully!" })
}
    catch(err){
        res.status(500).send({
            message: "Error", error: err.message})
    }
}

//==========================================Product update======================================//

const updateProduct = async function(req, res){
    try{
        const data = req.body
        const productId = req.params.productId
    //check if product is exist or not
        const product = await ProductModel.findById(productId);
        if(!product){
            return res.status(404).send({
             status: false, message: "Product not found"})
        }
    //check if product is deleted or not
    if (product.isDeleted == "true") {
        return res.status(404).send({
          status: false, message: "product is already deleted" })
    }
    //check valid product id 
    if (!validator.isValidObjectId(productId)) {
        return res.status(400).send({
          status: false, message: "please enter valid productId" })
    }
    //Validate req body to check if data is coming or not
     if (!validator.isValidBody(data)) {
       return res.status(400).send({
          status: false, message: "Insert Data : BAD REQUEST"  });
 }
const { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = data;
     
//validation for title
  if(title){
     if(!validator.isValidName(title)) {
        return res.status(400).send({ status: false, message: "wrong title"})}
     }
//check if title is already exist
    const isTitleAlreadyUsed = await ProductModel.findOne({title: title });
     if (isTitleAlreadyUsed){ 
        return res.status(400).send({status: false, Message: `title, ${title} already exist `})
     }
//validation for description
   if(description){
     if(!validator.isValidName(description)){
        return res.status(400).send({ status: false, message: "wrong description"})}
   }
//validation for price
   if(price){
     if(!validator.isValid(price)){
    return res.status(400).send({
        status: false, message: "price details must be present and it should be in number"})
     }
     if (!/^([0-9]{0,2}((.)[0-9]{0,2}))$/.test(price)) {
        return res.status(400).send({status: false, message: "Please Provide Valid Price" })
     } 
}
//validation for isFreeShipping attribute
    if (typeof isFreeShipping != 'undefined') {
       isFreeShipping = isFreeShipping.trim()
    if (!["true", "false"].includes(isFreeShipping)) { return res.status(400).send({ status: false, message: "isFreeshipping is a boolean type only" }) }
}
//validation for style
    if (style) {
      if (!isValidName(style)) {
         return res.status(400).send({ status: false, message: "style is missing" })}
}
//validation for currency ID
   if(currencyId){
    if (!validator.isValid(currencyId)) {
        return res.status(400).send({
          status: false, message: "curreny must be present" });
  }
    if (currencyId != "INR"){
       return res.status(400).send({
         status: false, message: "At this time only 'INR' currency is allowed",});
       }
}
//validation for installment
   if(installments){
    if (!validator.isValid(installments)) {
        return res.status(400).send({
          status: false, msg: "installments must be present" });
      }
    if (!/^(0|[1-9][0-9]*)$/.test(installments)){
        return res.status(400).send({status: false, message: "please enter proper installments"})
    }
}
//check if product image is missing
  if (data.productImage) {
     if (!validator.isValid(data.productImage)) {
        return res.status(400).send({ status: false, message: "ProfileImage is missing ! " }) }
}
//validation for product image
    let productImage = req.files;
    if (!(productImage && productImage.length)) {
         return res.status(400).send({ status: false, message: "Please Provide Profile Image" })
}
    if(!validator.acceptFileType(productImage[0], 'image/jpeg', 'image/png')){
          return res.status(400).send({
            status: false, Message: " we accept jpg, jpeg or png as product image only!" })
}
   let updateFileURL = await aws.uploadFile(productImage[0]);
   console.log(updateFileURL)
   data.productImage = updateFileURL
   
// validation for available sizez
   if(availableSizes) {
    if (!validator.isValidSize(availableSizes)) {
       return res.status(400).send({
          status: false, message: "Please Provide Available Sizes from S,XS,M,X,L,XXL,XL"});
  }
}
    let UpdateProductData = await ProductModel.findOneAndUpdate({ _id: productId }, data, { new: true })
    return res.status(201).send({ status: true, message: "product Updated", data: UpdateProductData })
}
    catch(err){
        res.status(500).send({
            message: "Error", error: err.message})
    }
}

module.exports.createProduct = createProduct
module.exports.getProduct = getProduct
module.exports.getProductById = getProductById
module.exports.deleteProductById = deleteProductById
module.exports.updateProduct = updateProduct 


