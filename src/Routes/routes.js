const express = require('express');
const router = express.Router();
const userController = require("../Controllers/userController")
//const booksController = require("../controller/booksController")
//const reviewController = require("../controller/reviewController")
const middleware = require("../middleware/userAuth")
 


//UserModel APIs
router.post("/register",userController.createUser)
router.post('/Login', userController.userLogin)






module.exports=router;