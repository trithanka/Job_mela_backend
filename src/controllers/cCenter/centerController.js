const connection = require("../../../DATABASE/mysqlConnection");
const uQuery = require("../../queries/centerQuery/centerQuery");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginUser=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }

    const{username,password}=req.body
    if(!username || !password){
        return res.status(200).send({
            status: false,
            message: "all fields are required"
        });
    }

    try {
        const user=await connection.query(mysqlDB,uQuery.getAdmin , [username]);
        if(user.length === 0){
            return res.status(200).send({
                status: false,
                message: "No User Found or User is Not Active"
            });
        }
        const admin = user[0];
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(200).send({
                status: false,
                message: "Incorrect Password"
            });
        }
         //generate token
         const token = jwt.sign({ mela: admin.fklmela_no, username: admin.username}, process.env.SECERET_TOKEN, { expiresIn: '30d' });

         res.status(200).send({
            status: true,
            message: "Login successful",
            token: token
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}
//all company
const allCompany=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
    try {
        const {melaId}=req.body
        const melaCompany= await connection.query(mysqlDB, uQuery.melaCompany, [melaId]);
        if(melaCompany.length==0){
            return res.status(200).json({status:false,message:"No Company Registered"})
        }
        // const melaComJob=await connection.query(mysqlDB, uQuery.melaCompanyjob, [melaId]);
        res.status(200).json({
            status:true,
            message:"success",
            company:melaCompany,
            // jobs:melaComJob
        })
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}
//all candidate
const allCandidate=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
    const {candidate_id,company_name,full_name,registration_no,appliedCan,mela_id}=req.body
    try {
        //req.user.mela is the decoded token
        // const params = [req.user.mela];
        if(!mela_id){
            return res.status(500).json({ status: false, message: "mela_id is required", error: "mela_id is required" });
        }
        let query = uQuery.allCandidate;
        const params = [mela_id];
        if(appliedCan){
            query=uQuery.appliedCan
        }
        // if (company_name) {
        //     query += ' and com.company_name LIKE ?';
        //     params.push(`%${company_name}%`);
        // }
        // if (registration_no) {
        //     query += ' and com.registration_no = ?';
        //     params.push(registration_no);
        // }
        // if (candidate_id) {
        //     console.log("inside");
        //     query += ' and app.candidate_id = ?';
        //     params.push(candidate_id);
        // }
        if (full_name) {
            query += ' and basic.vsCertName like ?';
             params.push(`%${full_name}%`);
        }
        // if (phone_no) {
        //     query += ' WHERE com.phone_no = ?';
        //     params.push(phone_no);
        // }
        //mela info
        const mela = await connection.query(mysqlDB, uQuery.mela, [mela_id]);
        const companyData = await connection.query(mysqlDB, query, params);
        //total applicant count
        const totalApplicant= await connection.query(mysqlDB, uQuery.totalApplicant, [mela_id]);
        // //applied applicant
        // const appliedApplicant= await connection.query(mysqlDB, uQuery.appliedApplicant, [req.user.mela]);
        
        return  res.status(201).send({
            status: true,
            message: "success",
            totalApplicant:totalApplicant[0].total,
            // appliedApplicant:appliedApplicant[0].total,
            mela:mela[0],
            data: companyData
        })
       
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}

//get eligible job detail by id

const jobDetail=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
    const {candidate_id}=req.body
    
    try {
        //eligible job 
        const eligibleData = await connection.query(mysqlDB, uQuery.eligibleJobs, [candidate_id,candidate_id,candidate_id]);
        //check if already applied , if not then then show eligible job
        // const check

        //check already applied job
        let applied;
        applied= await connection.query(mysqlDB, uQuery.appliedJOb, [candidate_id]);
        if (eligibleData.length > 0) {
            return  res.status(201).send({
                status: true,
                message: "success",
                data: eligibleData,
                appliedJob:applied
            })
        }else{
            return res.status(200).json({
                status:true,
                message:"Not Eligible for Job",
                appliedJob:applied
            })
        }

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}

const jobApply=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
    const{candidate_id,job_id}=req.body
    const admin_name=req.user.username
    if (!candidate_id || !job_id || !admin_name){
        return res.status(400).send({
            status: false,
            message: "all fields are required"
        });
    }
    try {
        //check if already applied
        const checkApply=await connection.query(mysqlDB, uQuery.applyData, [candidate_id,job_id]);
        if (checkApply.length > 0){
            return res.status(200).json({
                status:false,
                message:"Already Applied For This Job"
            })
        }
        //check if company is not verified 
        const checkCompany=await connection.query(mysqlDB, uQuery.checkCompanyStatus, [job_id]);
        if (checkCompany.length === 0){
            return res.status(400).json({
                status:false,
                message:"Company is Not Verified"
            })
        }
        //apply job 
        const applyJob=await connection.query(mysqlDB, uQuery.jobApply, [candidate_id,job_id,admin_name]);

        if(applyJob.length === 0){
            return res.status(500).json({ status: false, message: "failed to apply", error: error.message });
        }
        const applyData=await connection.query(mysqlDB, uQuery.applyData, [candidate_id,job_id]);
        if(applyData.length === 0){
            return res.status(500).json({ status: false, message: "failed to get", error: error.message });
        }
        return res.status(200).json({
            status:true,
            message:"Job Applied Successfully",
            status:applyData
        })
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}

//all job
const allJob=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
    try {
        const {melaId}=req.body
        const melaJob= await connection.query(mysqlDB, uQuery.melaJob, [melaId]);
        if(melaJob.length==0){
            return res.status(200).json({status:false,message:"No Job Available"})
        }
        res.status(200).json({
            status:true,
            message:"success",
            job:melaJob,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}
module.exports={loginUser,allCandidate,jobDetail,jobApply,allCompany,allJob}