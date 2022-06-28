const express = require('express');
const router = express.Router();

const AuthorController= require("../controllers/AuthorController")

const BlogController=require("../controllers/blogsController")

const MidController = require("../Middleware/Auth")




//-----------Create Authors APi----------//
router.post("/authors", AuthorController.authors)

//------------Create blogs APIS---------//
router.post("/blogs",MidController.jwtValidation ,MidController.authoriseCreate,BlogController.createBlog)

//-----------Display Blogs API---------//
router.get("/blogs",MidController.jwtValidation,BlogController.displayBlog)

//-----------Update Blog API----------//
router.put("/blogs/:blogId", MidController.jwtValidation, MidController.authoriseByPath, BlogController.updateBlog) 

//---------Delete Blogs Using Blog Id----------//
router.delete("/blogs/:blogId",MidController.jwtValidation, MidController.authoriseByPath, BlogController.deleteBlogs) 

//====================Delete by Query====================//
router.delete("/blogs",MidController.jwtValidation, MidController.authoriseByQuery, BlogController.deleteByQuery)

//=====================LOGIN USER========================//
router.post("/login",AuthorController.login)



module.exports = router;