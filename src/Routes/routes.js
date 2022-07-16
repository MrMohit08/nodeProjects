const express = require('express');
const router = express.Router();
const userController = require("../Controllers/userController")
const bookController = require("../Controllers/bookController")
const reviewController = require("../Controllers/reviewController")
const middleware = require("../middleware/userAuth")
const amazons3 = require("../s3Helper.js")
 


//User API
router.post("/register",userController.createUser)
router.post('/Login', userController.userLogin)

router.post("/write-file-aws" , amazons3.bookCover )


//Book API
router.post("/books", middleware.tokenValidator, middleware.ownerAuth, bookController.createBook)
router.get("/books", middleware.tokenValidator, bookController.getAllBooks)
router.get("/books/:bookId", middleware.tokenValidator, middleware.authorization, bookController.getBooksById)
router.put("/books/:bookId", middleware.tokenValidator, middleware.authorization, bookController.updateBook)
router.delete("/books/:bookId", middleware.tokenValidator, middleware.authorization, bookController.deleteBooks)

//Review API
router.post("/books/:bookId/review", reviewController.createReview)
router.put("/books/:bookId/review/:reviewId", reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview)


module.exports=router;