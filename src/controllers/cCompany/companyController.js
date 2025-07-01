const cQuery = require("../../queries/companyQuery/companyQuery");
const connection = require("../../../DATABASE/mysqlConnection");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

const applyForJobs = async (candidateId, qualification, res) => {
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }

    const jobQuery = `
        SELECT j.job_id, j.registration_no, c.fklmela_no
        FROM ds.nw_jobmela_job_details j
        JOIN ds.nw_jobmela_company_dtl c ON j.registration_no = c.registration_no
        WHERE j.min_fklqualificationId <= ? AND c.fklmela_no = (SELECT fklmela_no FROM ds.nw_jobmela_candidate_dtl WHERE candidate_id = ?);
    `;

    const checkApplyQuery = ` 
        SELECT COUNT(*) as count 
        FROM ds.nw_jobmela_candidate_apply 
        WHERE candidate_id = ? AND job_id = ?;
    `;

    const applyQuery = `
        INSERT INTO ds.nw_jobmela_candidate_apply (candidate_id, job_id, application_date)
        VALUES (?, ?, NOW());
    `;

    try {
        const jobs = await connection.query(mysqlDB, jobQuery, [qualification, candidateId]);
        if (jobs.length > 0) {
            for (const job of jobs) {
                const existingApplication = await connection.query(mysqlDB, checkApplyQuery, [candidateId, job.job_id]);
                if (existingApplication[0].count === 0) {
                    await connection.query(mysqlDB, applyQuery, [candidateId, job.job_id]);
                }
            }
        }
    } catch (error) {
        console.error("Error applying for jobs:", error);
        throw new Error('Internal Server Error during job application');
    } finally {
        if (mysqlDB) mysqlDB.release();
    }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const verifyPassword = async function (password, hashedPassword) {
    return new Promise((resolve, reject) => {
      let salt = process.env.SALT;
      crypto.pbkdf2(password, salt, 10000, 64, "sha256", (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey.toString("hex") === hashedPassword);
        }
      });
    });
  };
//login
const loginCompany= async(req, res)=>{
    let mysqlDB = await connection.getDB();
    if (!mysqlDB) {
        throw new Error("Error connecting to db");
    }
    const {phone_no,password}=req.body;
    if(! phone_no || !password){
        return res.status(200).send({
            status: false,
            message: "Enter contact number and password"
        });
    }

    try {
        const rows = await connection.query(mysqlDB, cQuery.getCompanyById, [phone_no]);

        if (rows.length === 0) {
            return res.status(200).send({
                status: false,
                message: "Invalid contact number or password"
            });
        }
        const check = await connection.query(mysqlDB, cQuery.check, [phone_no]);
        if (check.length === 0) {
            return res.status(200).send({
                status: false,
                message: "Company is Not Verified"
            });
        }

        const com = rows[0];
        const isPasswordValid = await verifyPassword(password, com.vsPassword);

        if (!isPasswordValid) {
            return res.status(200).send({
                status: false,
                message: "Wrong password"
            });
        }

        //generate token
        
        const token = jwt.sign({ registration_no:com.registration_no }, process.env.SECERET_TOKEN, { expiresIn: '30d' });

        res.status(200).send({
            status: true,
            message: "Login successful",
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: false,
            message: "Internal Server Error while logging in admin"
        });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}

//add company data
const addCompany = async (req, res) => {
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }

        const { company_name, registration_no, phone_no, email, address, jobs, fklmela_no,pklEmployerId} = req.body;

        // Input validation
        if (!company_name || !registration_no || !phone_no || !email || !address || !fklmela_no || !pklEmployerId) {
            return res.status(400).json({ status: false, message: "All fields are required" });
        }

        //check company for multiple meal registration
        const checkCompany=await connection.query(mysqlDB, cQuery.checkCom, [registration_no,fklmela_no]);
        if(checkCompany[0].count >0){
            return res.status(400).json({ status: false, message: "You are Already registered in this job mela" });
        }
        //check company if it verified
        // const checkVerified=await connection.query(mysqlDB, cQuery.checkVerified, [pklEmployerId,fklmela_no]);
        // if(checkVerified.length == 0){
        //     return res.status(400).json({ status: false, message: "Your Company is Not verified for the job mela" });
        // }

        // Start a transaction
        // await mysqlDB.beginTransaction();

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Insert company data
        await connection.query(mysqlDB, cQuery.addCompany, [company_name, registration_no, phone_no, email, address, fklmela_no,pklEmployerId]);

        // Get the company sl no
        const com = await connection.query(mysqlDB, cQuery.com_sl, [registration_no, fklmela_no]);
        if (!com || com.length === 0) {
            throw new Error("Company not found after insertion");
        }
        // console.log(com.sl_no);
        const companySlNo = com[0].sl_no;

        // Insert job details
        if (Array.isArray(jobs) && jobs.length > 0) {
            for (let job of jobs) {
                await connection.query(mysqlDB, cQuery.addJob, [companySlNo, job.minQualification, job.vacancy, job.postName]);
            }
        }

        // Commit the transaction
        // await mysqlDB.commit();

        // Get the company data which was just added
        const comData = await connection.query(mysqlDB, cQuery.comData, [companySlNo]);

        // Organize the data
        const companyData = {
            company_name: comData[0].company_name,
            company_slno: comData[0].sl_no,
            registration_no: comData[0].registration_no,
            phone_no: comData[0].phone_no,
            email: comData[0].email,
            address: comData[0].address,
            fklmela_no: comData[0].fklmela_no,
            venue_name: comData[0].venue_name,
            jobs: comData.filter(row => row.job_id).map(row => ({
                job_id: row.job_id,
                min_qualification: row.min_qualification,
                min_fklqualificationId: row.min_fklqualificationId,
                vacancy: row.vacancy,
                post_name: row.post_name
            }))
        };

        // // Apply candidates to new jobs if they match the mela ID
        // const applyCandidatesQuery = `
        //     SELECT candidate_id, fklqualificationId
        //     FROM ds.nw_jobmela_candidate_dtl
        //     WHERE fklmela_no = ?;
        // `;
        
        // const candidates = await connection.query(mysqlDB, applyCandidatesQuery, [fklmela_no]);
        
        // if (candidates.length > 0) {
        //     for (const candidate of candidates) {
        //         await applyForJobs(candidate.candidate_id, candidate.fklqualificationId, res);
        //     }
        // }

        // Send response
        res.status(201).send({
            status: true,
            message: "Company and jobs added successfully",
            data: companyData
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        if (mysqlDB) await mysqlDB.rollback();
        console.error(error);
        res.status(500).send({
            status: false,
            message: "Internal Server Error while adding company and jobs",
            error: error.message
        });
    } finally {
        if (mysqlDB) mysqlDB.release();
    }
};

//update company
const updateCompany=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            throw new Error("Error connecting to db");
        }

        const { company_name, registration_no, phone_no, email, address, jobs, fklmela_no} = req.body;

        // Start a transaction
        await connection.beginTransaction(mysqlDB);


        // Update company data
        await connection.query(mysqlDB, cQuery.updateCompany, [company_name, phone_no, email, address,fklmela_no, registration_no]);

        // Delete existing job details for the company
        await connection.query(mysqlDB, cQuery.deleteJobsByCompany, [registration_no]);

        // Insert new job details
        if (Array.isArray(jobs) && jobs.length > 0) {
            for (let job of jobs) {
                await connection.query(mysqlDB, cQuery.addJob, [registration_no, job.minQualification, job.vacancy, job.postName]);
            }
        }

        // Commit the transaction
        await connection.commit(mysqlDB);

        // Get the updated company data along with jobs
        const rows = await connection.query(mysqlDB, cQuery.comData, [registration_no]);

        // Organize the data
        const companyData = {
            company_name: rows[0].company_name,
            registration_no: rows[0].registration_no,
            phone_no: rows[0].phone_no,
            email: rows[0].email,
            address: rows[0].address,
            fklmela_no:rows[0].fklmela_no,
            venue_name:rows[0].venue_name,
            jobs: rows.filter(row => row.job_id).map(row => ({
                job_id: row.job_id,
                min_qualification: row.min_qualification,
                min_fklqualificationId: row.min_fklqualificationId,
                vacancy: row.vacancy,
                post_name: row.post_name
            }))
        };
        // Apply candidates to new jobs if they match the mela ID
        const applyCandidatesQuery = `
            SELECT candidate_id, fklqualificationId
            FROM ds.nw_jobmela_candidate_dtl
            WHERE fklmela_no = ?;
        `;
        
        const candidates = await connection.query(mysqlDB, applyCandidatesQuery, [fklmela_no]);
        
        if (candidates.length > 0) {
            for (const candidate of candidates) {
                await applyForJobs(candidate.candidate_id, candidate.fklqualificationId, res);
            }
        }

        res.status(200).send({
            status: true,
            message: "Company and jobs updated successfully",
            data: companyData
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        if (mysqlDB) {
            await connection.rollback(mysqlDB);
        }
        console.error(error);
        res.status(500).send({
            status: false,
            message: "Internal Server Error while updating company and jobs",
            error: error.message
        });
    } finally {
        if (mysqlDB) mysqlDB.release();
    }
}

const getCompany= async(req,res)=>{
    
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
    const{phone_no}=req.body
    try {
        
    
    const company=await connection.query(mysqlDB, cQuery.getCompany, [phone_no]);

    if(company.length==0){
        return res.status(200).json({
            status:false,
            message:"no company found"
        })
    }else{
        return res.status(200).json({
            status:true,
            message: "Success",
            data:company
        })
    }} catch (error) {
        return res.status(400).json({
            status:false,
            message:error
        })
    }finally {
        if (mysqlDB) mysqlDB.release();
    }

}
//get all company 
const getAllCompanies = async (req, res) => {
    let mysqlDB = await connection.getDB();
    if (!mysqlDB) {
        throw new Error("Error connecting to db");
    }
    const {phone_no,district,qualification_id,fklmela_no,interview_mode}=req.body
    try {
        let companyData;
        let jobs;
        let comData;
        let rows;
        if(phone_no){
            comData = await connection.query(mysqlDB, cQuery.getJobportal,[phone_no]);
            jobs = await connection.query(mysqlDB, cQuery.jobDetails,[phone_no]);
            // const comData = await connection.query(mysqlDB, cQuery.getCompanies,[phone_no]);
            if (!comData || comData.length === 0) {
                return res.status(404).json({ status: false, message: "No company found with provided phone number" });
            }
            // companyData = {
            //     company_name: comData[0].company_name,
            //     registration_no: comData[0].registration_no,
            //     phone_no: comData[0].phone_no,
            //     email: comData[0].email,
            //     address: comData[0].address,
            //     fklmela_no:comData[0].fklmela_no,
            //     venue_name:comData[0].venue_name,
            //     jobs: comData.filter(row => row.job_id).map(row => ({
            //         job_id: row.job_id,
            //         min_qualification: row.min_qualification,
            //         min_fklqualificationId: row.min_fklqualificationId,
            //         vacancy: row.vacancy,
            //         post_name: row.post_name
            //     }))
            // };
        }else{
            let query=cQuery.getAllCompanies
            let params=[]
            //filter by district
            if(district){
                query+=` and m.district = ?`;
                params.push(district)
            }
            //filter by qualification
            if(qualification_id){
                query+=` and job.min_fklqualificationId = ?`;
                params.push(qualification_id)
            }
            //filter by interview mode
            if(interview_mode){
                query+=` and job.vsSelectionProcedure = ?`;
                params.push(interview_mode)
            }
            //filter by fklmela_no
            if(fklmela_no){
                query+=` and c.fklmela_no = ?`;
                params.push(fklmela_no)
            }
            rows = await connection.query(mysqlDB, query,params);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ status: false, message: "No companies found" });
            }
        }
         
        res.status(200).send({
            status: true,
            message: "Companies retrieved successfully",
            data: rows,
            company:comData,
            jobs:jobs
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: false,
            message: "Internal Server Error while retrieving companies"
        });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
};


module.exports = { addCompany, getAllCompanies, updateCompany, loginCompany ,getCompany}
