const express=require("express");
const { loginUser, allCandidate, jobDetail, jobApply, allCompany, allJob, checkIn } = require("../../controllers/cCenter/centerController");
// const { verifyToken } = require("../../../utils/jwtValidator");

const router=express.Router();



//center login
router.post("/login",loginUser)

//all candidate
router.post("/candidate",allCandidate)

//all company
router.post("/company",allCompany)

//get job detail by candidateId
router.post("/eligibleJob",jobDetail)

//all job
router.post("/allJob",allJob)

//apply job
router.post("/jobApply",jobApply)

//check in
router.post("/checkIn",checkIn)

module.exports=router