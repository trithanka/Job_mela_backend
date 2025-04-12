const express=require("express");
const { registerAdmin, loginAdmin, getAllAdmin, updateStatus } = require("../../controllers/cAdmin/adminController");
const adminRegisterValidator = require("../../validator/adminValidator/adminValidator");
const adminLoginValidator = require("../../validator/adminValidator/adminLoginValidator");
const { verifyToken } = require("../../../utils/jwtValidator");
const router=express.Router();


//create admin
router.post("/register",adminRegisterValidator,registerAdmin)

// admin login
router.post("/login",adminLoginValidator,loginAdmin)

//admin view
router.get("/getAll",verifyToken,getAllAdmin)

//status update
router.post("/statusUpdate",verifyToken,updateStatus)


module.exports=router;