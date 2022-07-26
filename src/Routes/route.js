const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
const middleware = require("../Middlewares/auth");

// FEATURE-1 User APIs
router.post("/register", userController.createUser);
router.post("/login", userController.userLogin);
router.get("/user/:userId/profile", middleware.aunthetication, userController.getUser);
router.put("/user/:userId/profile", middleware.aunthetication, middleware.authorization, userController.updateUser);

module.exports = router;