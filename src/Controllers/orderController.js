const OrderModel = require("../Models/orderModel");
const UserModel = require("../Models/userModel");
const CartModel = require("../Models/cartModel");



const postOrder = async function (req, res) {
    try {
        const data = req.body;
        let { cancellable } = data;
//Validate body 
       if (!validator.isValidBody(data)) {
           return res.status(400).send({
              status: false, message: "Please provide details" });
   }

        const userId = req.params.userId;
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({
              status: false, message: "please enter valid userID" })
   }
        const userFind = await UserModel.findOne({ _id: userId });
        if (!userFind) {
            return res.status(404).send({ status: false, message: "User not found !!!" });
   }
        const cartId = req.body.cartId;
          if (!cartId) {
            return res.staus(400).send({ status: false, message: "Plz enter cartId in body !!!" });
   }
        if (!validator.isValidObjectId(cartId)) {
          return res.status(400).send({
             status: false, message: "please enter valid cartId" })
}
        const userCart = await CartModel.findOne({ _id: cartId, userId: userId }).select({ items: 1, totalPrice: 1, totalItems: 1 })
          if (!userCart) {
              return res.status(404).send({ status: false, message: "User does not have any cart !!!" });
}
       if(cancellable){
          if(!(cancellable==false || cancellable==true )){
              return res.status(400).send({status:false,message:"Enter Only true / false in cancellable"})}
}
        let checkTotalQuantity = 0;
         for (let i = 0; i < userCart.items.length; i++) {
            checkTotalQuantity = checkTotalQuantity + userCart.items[i].quantity;
        }

        const orderDetails = {
            userId: userId,
            items: userCart.items,
            totalPrice: userCart.totalPrice,
            totalItems: userCart.totalItems,
            totalQuantity: checkTotalQuantity,
            cancellable: data.cancellable
        }

        const saveData = await OrderModel.create(orderDetails);
        res.status(201).send({ status: true, message: 'Success', data: saveData });
    } catch (err) {
        res.status(500).send({ status: false, messageg: err.message });
    }
};

module.exports.postOrder = postOrder

