const express=require("express");
const { registerCanditate, getByNumber, updateCandidate, getAllCandidate, master, asdmTrained, appliedJob,portalCan} = require("../../controllers/cCandidate/candidateController");
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


module.exports=router
