const express=require("express");
const { addMela, getMelas, updateMelaStatus,getMelaById } = require("../../controllers/cMela/melaControler");
const addMelaValidator = require("../../validator/addMelaValidator/addMelaValidator");
const {verifyToken,authorizeRole} = require("../../../utils/jwtValidator");
const router=express.Router();


//middleware /private
// router.use(verifyToken)


//add mela
router.post("/add",addMelaValidator,addMela)

// Route to get all melas
router.post('/getMelas', getMelas);

//get mela by id
router.post("/",getMelaById)

// Route to update mela status
router.post('/updateStatus/:slNo',updateMelaStatus);



module.exports=router
