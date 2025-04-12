const express=require("express");
const { getByCandidate, viewStatus, updateStatus, getAllCandidate } = require("../../controllers/cFinal/finalController");
const { verifyToken, authorizeRole } = require("../../../utils/jwtValidator");
const router=express.Router();

//middleware /private
router.use(verifyToken)

router.post("/GetByCandidate",getByCandidate)


router.post("/candidateDtl",getAllCandidate)

router.post("/viewStatus",viewStatus)

router.post("/updateStatus",updateStatus)


module.exports=router