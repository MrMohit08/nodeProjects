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
      if (!validator.isValidSize(availableSizes)) {
         return res.status(400).send({
            status: false, message: "Please Provide Available Sizes from S,XS,M,X,L,XXL,XL"});
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
      let query = {}
      let { size, name, priceGreaterThen, priceLessThen, priceSort } = filterQuery;
        
//validation for size
   if(size){       
     if(!validator.isValid(size)){
        return res.status(400).send({status: false, message:"plz Enter Size"})
   }
     if(!validator.isValidSize(size)) {
        return res.status(400).send({
           status: false, message: "Please Provide Available Sizes from S,XS,M,X,L,XXL,XL"});
   }
      query.availableSizes = size
}
//validation for name
   if(name){       
     if(!validator.isValid(name)){
       return res.status(400).send({status: false, message:"plz Enter a valid name"})
  }  
     query.title = {$regex: name}   
}  
//validation for  price greater than
   if(priceGreaterThen) {
     if(!validator.isValid(priceGreaterThen)){
        return res.status(400).send({status: false, message:"plz Enter a value"})
    }
    query.price = { $gte: priceGreaterThen}
} 
//validation for  price greater than
   if(priceLessThen) {
     if(!validator.isValid(priceLessThen)){
        return res.status(400).send({status: false, message:"plz Enter a value"})
   }
    query.price = { $lte: priceLessThen}
}
  if(priceGreaterThen && priceLessThen){
    query.price= { '$gt': priceGreaterThen, '$lt': priceLessThen }
  }
  //sorting
  if (priceSort) {
    if (priceSort != '-1' && priceSort != '1') {
        return res.status(400).send({ status: false, message: "You can only use 1 for Ascending and -1 for Descending Sorting" })
    }
}
 
  let getAllProduct = await ProductModel.find(query).sort({ price: priceSort })
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
 
const deleteProductById=async function(req,res){
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
    //Validate body 
     if (!validator.isValidBody(data)) {
       return res.status(400).send({
          status: false, msg: "Please provide details" });
 }
const { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = data;
     
 //validation for title
  if(!validator.isValid(title)){
    const isTitleAlreadyUsed = await ProductModel.findOne({title: title });
            if (isTitleAlreadyUsed){ 
                return res.status(400).send({
                  status: false, Message: `title, ${title} already exist `})
     }
         product.title = title
  }
  //validation for description
   if(!validator.isValid(description)){
    product.description = description
   }
//validation for price
   if(price){
     if(!validator.isValid(price)){
    return res.status(400).send({
        status: false, message: "price details must be present and it should be in number"})
     }

    if (!/^([0-9]{0,2}((.)[0-9]{0,2}))$/.test(price)) {
        return res.status(400).send({
        status: false, message: "Please Provide Valid Price" })
     } 
       product.price = price
}
//validation for style
    if(!validator.isValid(style)){
         product.style = style
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
      product.currencyId = currencyId;
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
    product.installments = installments;
   }
  //validation for product image
     let files = req.files;
      if (files && files.length > 0){
        if(!validator.acceptFileType(productImage[0], 'image/jpeg', 'image/png')){
            return res.status(400).send({
              status: false, Message: " we accept jpg, jpeg or png as product image only!" })
        }
        const ProductPicture = await uploadFile(productImage[0])
        product.productImage = ProductPicture
      }
    //validation for available sizez
    if (!validator.isValid(availableSizes)) {
      let availableSizesobj = JSON.parse(availableSizes)
        if (!Array.isArray(availableSizesobj)) return res.status(400).send({
             status: false, Message: `☹️ in availableSizes, invalid array !` })
    }
    
   

    }
    catch(err){
        res.status(500).send({
            message: "Error", error: err.message})
    }
}