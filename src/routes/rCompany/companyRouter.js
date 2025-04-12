const express=require("express");
const { addCompany, getAllCompanies, updateCompany, loginCompany, getCompany } = require("../../controllers/cCompany/companyController");
// const companyRegisterValidator = require("../../validator/companyValidator/companyRegisterValidator");
const {verifyToken,authorizeRole} = require("../../../utils/jwtValidator");
const router=express.Router();

//middleware /private
// router.use(verifyToken)

//login
router.post("/login",loginCompany)

//add company mela
router.post("/add",addCompany)

//update company
router.post("/update",updateCompany)

//get all company 
router.post("/",getAllCompanies)

//jobportal 
router.post("/getCompany",getCompany)

module.exports=router
