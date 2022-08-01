const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
const productController = require("../Controllers/productController");
const middleware = require("../Middlewares/auth");

// FEATURE-1 User APIs
router.post("/register", userController.createUser);
router.post("/login", userController.userLogin);
router.get("/user/:userId/profile", middleware.aunthetication, userController.getUser);
router.put("/user/:userId/profile", middleware.aunthetication, middleware.authorization, userController.updateUser);

// FEATURE-2 Product APIs
router.post("/products", productController.createProduct);
router.get("/products", productController.getProduct);





router.all("/*", async function (req, res) {
    res.status(404).send({ status: false, message: "Page Not Found!"})
});

module.exports = router;