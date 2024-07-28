const express = require("express");
const router = express.Router();
const login = require("../middleware/login")


const UserController = require("../controllers/user-controller")

router.post("/cadastro", UserController.signUp);

router.post("/login", UserController.login);

router.get("/",login.obrigatorio, UserController.getUserProfile)

module.exports = router;
