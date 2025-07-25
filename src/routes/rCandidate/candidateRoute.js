const express=require("express");
const { registerCanditate, getByNumber, updateCandidate, getAllCandidate, master, appliedJob,portalCan,getAsdmCandidate,getJob} = require("../../controllers/cCandidate/candidateController");
const registerValidator = require("../../validator/candidateRegisterValidator/candidateRegisterValidator");
const updateCandidateValidator = require("../../validator/candidateRegisterValidator/updateCandidateValidator");
const {verifyToken,authorizeRole} = require("../../../utils/jwtValidator");
const router=express.Router();


//middleware /private
// router.use(verifyToken)

//getall candidate.
router.get("/getall",getAllCandidate);

//asdm candidate.
// router.post("/asdmTrained",asdmTrained);

//get asdm candidate by phone number.
router.post("/asdm",getAsdmCandidate)

//jobportal candidate.
router.post("/portalCan",portalCan);

//applied job.
router.post("/applied",appliedJob)

// master.
router.get("/master",master)

//create candidate.
router.post("/register",registerCanditate)

//get details.
router.get("/:contactNumber",getByNumber)

//update details.
router.post("/update/:contactNumber",updateCandidate)

//get job by mela id and candidate id
router.post("/job",getJob)


module.exports=router
