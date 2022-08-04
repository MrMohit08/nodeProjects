const CartModel = require('../Models/cartModel');
const ProductModel = require('../Models/productModel');
const validator = require('../Validations/validation');
const UserModel = require("../Models/userModel")

const creatCart = async function(req,res){
    try{
        let userId = req.params.userId
        const data = req.body
        let { productId, quantity } = data

    if(!validator.isValidObjectId(userId)){
            return res.status(404).send({ status: false, message: "Invalid UserId" })
    }
//checking userID from UserModel (DB CALL)
    let checkId = await UserModel.findById(userId)
    if (!checkId){
        return res.status(200).send({ status: true, msg: "User not found" })
    }
   //validate body
     if (!validator.isValidBody(data)) {
       return res.status(400).send({ status: false, msg: "please provide Cart details" });
}
//validate productID
     if (!validator.isValid(productId)) {
       return res.status(400).send({ status: false, messege: "please provide productId" })
}
     if (!validator.isValidObjectId(productId)) {
         return res.status(400).send({ status: false, message: "productId is invalid" });
}
    const findProduct = await ProductModel.findById(productId);
     if (!findProduct) {
       return res.status(404).send({ status: false, message: 'product not found.' });
}
    if (findProduct.isDeleted == true) {
        return res.status(400).send({ status: false, message: "product is deleted" });
}
// Validate Quantity
    if (!quantity) {
         quantity = 1
}
    if ((isNaN(Number(quantity)))) {
        return res.status(400).send({ status: false, message: 'quantity should be a valid number' })
}
    if (quantity < 0) {
       return res.status(400).send({ status: false, message: 'quantity can not be less than zero' })
}
//IF CART IS NOT CREATED OF A PARTICULAR USER
    const isOldUser = await CartModel.findOne({userId: userId});
    if (!isOldUser) {
        const newCart = {
            userId: userId,
            items: [{
                productId: productId,
                quantity: quantity
            }],
            totalPrice: (findProduct.price) * quantity,
            totalItems: 1
        }
      const createCart = await CartModel.create(newCart)
          return res.status(201).send({
            status: true, message: "cart created successfully", data: createCart })
    }
 //if Cart is already Created it will update the cart by items 
    if(isOldUser) {
        const newTotalPrice = (isOldUser.totalPrice) + ((findProduct.price) * quantity)
            let flag = 0;
            const items = isOldUser.items
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId.toString() === productId) {  //compare product ID 
                    
                    items[i].quantity += quantity
                    var newCartData = {
                        items: items,
                        totalPrice: newTotalPrice,
                        quantity: items[i].quantity
                    }
                    flag = 1
                    const saveData = await CartModel.findOneAndUpdate(
                        { userId: userId }, newCartData, { new: true })
                   return res.status(201).send({
                     status: true,message: "product added to the cart successfully", data: saveData
                    })
                }
            }
            if (flag === 0) {    
                
                let addItems = {
                    productId: productId,
                    quantity: quantity
                }
                const saveData = await CartModel.findOneAndUpdate(
                    { userId: userIdFromParams },
                    { $addToSet: { items: addItems }, $inc: { totalItems: 1, totalPrice: ((findProduct.price) * quantity) } },
                    { new: true }).select({ "items._id": 0 })
                return res.status(201).send({ status: true, message: "product added to the cart successfully", data: saveData })
            }
        }
    }
    catch(err){
        return res.status(500).json({ status: false, message: error.message });
    }
}

//=============================================Update Cart=======================================//

const updateCart = async function(req,res){
    try{
        let paramsuserId = req.params.userId
        if (!paramsuserId) {
            return res.status(400).send({ status: false, message: "userid is required" })
       }
       if (!validator.isValidObjectId(paramsuserId)) {
        return res.status(400).send({
          status: false, message: "please enter valid user Id" })
    }
     //if userid exist in user model
     let user = await UserModel.findById(paramsuserId)
     if (!user) {
         return res.status(400).send({ status: false, message: "user dont exist" });
     }

  let data = req.body
  let { productId, cartId, removeProduct } = data
  if (!validator.isValidBody(data)) {
    return res.status(400).send({
        status: false, message: "please provide Cart details" });
}
   if (!validator.isValid(productId)) {
        return res.status(400).send({
          status: false, messege: "please provide productId" })
}
   if (!validator.isValidObjectId(productId)) {
       return res.status(400).send({
          status: false, message: "productId is invalid" });
}
   const findProduct = await ProductModel.findById(productId);
   if (!findProduct) {
       return res.status(404).send({ status: false, message: 'product not found.' });
}
   if (findProduct.isDeleted == true) {
        return res.status(400).send({ status: false, msg: "product is deleted" });
}

//validation for cart ID
   if (!validator.isValid(cartId)) {
       return res.status(400).send({ 
        status: false, messege: "please provide cartId" })
}

    if (!validator.isValidObjectId(cartId)) {
        return res.status(400).send({
          status: false, message: "invalid cart ID" });
}
//check if the cart is already exist or not
  const findCart = await CartModel.findOne({ paramsuserId });
    if (!findCart) {
       return res.status(404).send({
         status: false, message: 'cart not found.' });
}
   if(findCart._id != cartId){ 
      return res.status(400).send({
        status: false, message: 'CartId does\'t belong to this user!'});
}
//validation for remove product
    if (!validator.isValid(removeProduct)) {
      return res.status(400).send({
        status: false, messege: "please provide items to delete" })
}
    if ((isNaN(Number(removeProduct)))) {
        return res.status(400).send({
          status: false, message: 'removeProduct should be a valid number' })
}
    if (removeProduct < 0 || removeProduct > 1){
        return res.status(400).send({
            status: false, message: 'removeProduct should be 0 or 1' })
}
 
let findQuantity = findCart.items.find(x => x.productId.toString() === productId)

if (removeProduct == 0) {
    let itemsarr = findCart.items
    if (itemsarr.length == []) {
        return res.status(400).send({ status: false, message: "No products to remove cart is empty" });
    }
    let totalAmount = findCart.totalPrice - (findProduct.price * findQuantity.quantity)
    let quantity = findCart.totalItems - 1
    let newCart = await CartModel.findOneAndUpdate(
        { _id: cartId },{
            $pull: { items: { productId: productId } },
            $set: { totalPrice: totalAmount, totalItems: quantity }}, { new: true })

    return res.status(200).send({
        status: true, message: 'the product has been removed from the cart', data: newCart})
}

if (removeProduct == 1) {
    let itemsarr = findCart.items
      if (itemsarr.length == []) {
          return res.status(400).send({ status: false, message: "No products found to reduce with given productid in cart" });
      }
    let totalAmount = findCart.totalPrice - findProduct.price
    let items = findCart.items
    for (let i = 0; i < items.length; i++) {
        if (items[i].productId.toString() === productId) {
            items[i].quantity = items[i].quantity - 1
            if (items[i].quantity == 0) {
                var noOfItems = findCart.totalItems - 1
                let newCart = await CartModel.findOneAndUpdate(
                    { _id: cartId },{ $pull: { items: { productId: productId } },
                        $set: { totalPrice: totalAmount, totalItems: noOfItems }}, { new: true })
                return res.status(200).send({
                    status: true,message: 'the product has been removed from the cart', data: newCart})
            }
        }
    }
       let updateddata = await CartModel.findOneAndUpdate(
            { _id: cartId },{ totalPrice: totalAmount, items: items }, { new: true })
                return res.status(200).send({
                   status: true,message: 'product in the cart updated successfully.', data: updateddata})
}
} 
  catch(err){
    res.status(500).send({ status: false, error: err.message })
  }
}

//===================================================GET CART API======================================//

const getCart = async function(req,res){
    try{
        let userId = req.params.userId
        if (!(validator.isValid(userId))) {
            return res.status(400).send({ status: false, message: "Please Provide User Id" })
        }

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "This is not a valid userId" })
        }

        let checkUser = await UserModel.findOne({ _id: userId })

        if (!checkUser) {
            return res.status(404).send({ status: false, message: " This User Does not exist" })
        }

     //checking if the cart exist with this userId or not   
        const checkCart = await CartModel.findOne({ userId: userId }) //.populate('items.productId')
        if (!checkCart) { 
            return res.status(404).send({ status: false, Message: 'cart not found' })
         }
          res.status(200).send({ status: true, Message: 'success', data: checkCart })

    }
     catch(err){
        res.status(500).send({ status: false, error: err.message })
     }
}

//=====================================================Delete Cart=================================//

const deleteCart = async function(req,res){
    try{
        let userId = req.params.userId;
        if (!(validator.isValid(userId))) {
            return res.status(400).send({ status: false, message: "Please Provide User Id" })
        }

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "This is not a Valid User Id" })
        }

        let checkUser = await UserModel.findOne({ _id: userId })
        if (!checkUser) {
            return res.status(404).send({ status: false, message: "This User is Not Exist" })
        }
        //checking if the cart exist with this userId or not
        let checkCart = await CartModel.findOne({ userId: userId })

        if (!checkCart) {
            return res.status(404).send({ status: false, message: "Cart does Not Exist With This User" })
        }
        //checking for an empty cart
        if (checkCart.items.length == 0){
             return res.status(400).send({ status: false, message: "Cart is already empty" });
        }
        let deleteCart = await CartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
           return res.status(200).send({ status: false, message: "Cart Successfully Deleted", data: deleteCart })
    }
    catch(err){
        res.status(500).send({ status: false, error: err.message })
    }
}

module.exports.creatCart = creatCart
module.exports.updateCart = updateCart
module.exports.getCart = getCart
module.exports.deleteCart = deleteCart