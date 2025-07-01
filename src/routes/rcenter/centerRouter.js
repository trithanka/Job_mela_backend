const express=require("express");
const { loginUser, allCandidate, jobDetail, jobApply, allCompany } = require("../../controllers/cCenter/centerController");
const { verifyToken } = require("../../../utils/jwtValidator");

const router=express.Router();



//center login
router.post("/login",loginUser)

//all candidate
router.post("/candidate",verifyToken,allCandidate)

//all company
router.post("/company",verifyToken,allCompany)

//get job detail by candidateId
router.post("/eligibleJob",jobDetail)

//apply job
router.post("/jobApply",verifyToken,jobApply)

module.exports=router