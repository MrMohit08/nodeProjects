const CartModel = require('../Models/cartModel');
const ProductModel = require('../Models/productModel');
const validator = require('../Validations/validation');
const UserModel = require("../Models/userModel")

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
          status: false, message: "cartId is invalid" });
}
  const findCart = await CartModel.findById(cartId);
    if (!findCart) {
       return res.status(404).send({
         status: false, message: 'cart not found.' });
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
 // we neeed to check if the item already exist in my item's list or NOT!!
 let index = -1;
 for (let i = 0; i < cart.items.length; i++) {
     if (findCart.items[i].productId == productId) {
         index = i
         break
     }
 }
 //add items in my item's
 if (index >= 0) {
    if (findCart.items[index].quantity < removeProduct) return res.status(400).send({
        status: false, message: `Can't remove, please provide removeProduct <= ${findCart.items[index].quantity} !` })
} else {
    return res.status(400).send({
        status: false, message: `this item you trying to remove is does't exist in your cart`})
}



  
  


} 
  catch(err){

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

module.exports.createCart = createCart
module.exports.updateCart = updateCart
module.exports.getCart = getCart
module.exports.deleteCart = deleteCart