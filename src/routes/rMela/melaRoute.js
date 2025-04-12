const express=require("express");
const { addMela, getMelas, updateMelaStatus } = require("../../controllers/cMela/melaControler");
const addMelaValidator = require("../../validator/addMelaValidator/addMelaValidator");
const {verifyToken,authorizeRole} = require("../../../utils/jwtValidator");
const router=express.Router();


//middleware /private
router.use(verifyToken)


//add mela
router.post("/add",authorizeRole("superAdmin"),addMelaValidator,addMela)

// Route to get all melas
router.get('/', getMelas);

// Route to update mela status
router.post('/updateStatus/:slNo', authorizeRole("superAdmin"),updateMelaStatus);



module.exports=router
