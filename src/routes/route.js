const express = require('express');
const { sentotp, validateOtp, sentotpCom } = require('../controllers/otpController');
const { valid } = require('joi');
const router = express.Router();

//candidate 
router.use("/candidate",require("./rCandidate/candidateRoute"))

//mela config
router.use("/mela",require("./rMela/melaRoute"))

//company config
router.use("/company",require("./rCompany/companyRouter"))

//admin
router.use("/admin",require("./rAdmin/adminRoute"))

//employer
router.use("/employer",require("./rEmployer/employerRoute"))

//final selector
router.use("/final",require("./rFinal/finalRouter"))

//center user
router.use("/center",require("./rcenter/centerRouter"))

//otp
router.post("/otp",sentotp)

//otp
router.post("/otp/company",sentotpCom)

//otp verify
router.post("/verify",validateOtp)


module.exports=router