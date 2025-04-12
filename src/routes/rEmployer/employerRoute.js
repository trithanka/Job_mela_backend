const express=require("express");
const { getByCompany, updateStatus, getAllCompany, getCompany } = require("../../controllers/cEmployer/employerController");
const { authorizeRole, verifyToken } = require("../../../utils/jwtValidator");
const router=express.Router();

//middleware /private
// router.use(verifyToken)


router.post("/getByCompany",getByCompany)
router.post("/status",updateStatus)
router.get("/getAll",getAllCompany)

module.exports=router