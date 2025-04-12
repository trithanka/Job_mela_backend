const connection = require("../../../DATABASE/mysqlConnection");
const fQuery = require("../../queries/finalQuery/finalQuery");



const getByCompany=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
//phone_no for company

    const{registration_no,company_name,full_name,candidate_id,phone_no}=req.body;
    try {
        const params = [];
        let query = fQuery.getByCompany;

        if (registration_no) {
            query += ' WHERE job.fkl_Company_slno = ?';
            params.push(registration_no);
        }
        
        if (company_name) {
            if (registration_no) {
                query += ' OR com.company_name LIKE ?';
            } else {
                query += ' WHERE com.company_name LIKE ?';
            }
            params.push(`%${company_name}%`);
        }
        if (candidate_id) {
            query += ' WHERE ct.candidate_id = ?';
            params.push(candidate_id);
        }
        if (full_name) {
            query += ' WHERE ct.full_name like ?';
            params.push(full_name);
        }
        if (phone_no) {
            query += ' WHERE com.phone_no = ?';
            params.push(phone_no);
        }

        const companyData = await connection.query(mysqlDB, query, params);
        console.log("hi",companyData[0].registration_no)
        
        // console.log("hikk",companyData[0])
        // count
        const pendingApplicant = await connection.query(mysqlDB, fQuery.pendingApplicant, [companyData[0].registration_no]);
        const approveApplicant = await connection.query(mysqlDB, fQuery.approveApplicant, [companyData[0].registration_no]);
        const rejectApplicant = await connection.query(mysqlDB, fQuery.rejectApplicant, [companyData[0].registration_no]);
        const totalApplicant = await connection.query(mysqlDB, fQuery.totalApplicant, [companyData[0].registration_no]);
        if (companyData.length > 0) {
            return  res.status(201).send({
                status: true,
                totalApplicant:totalApplicant[0].count,
                pendingApplicant:pendingApplicant[0].count,
                approveApplicant:approveApplicant[0].count,
                rejectApplicant:rejectApplicant[0].count,
                message: "success",
                data: companyData
            })
        }else{
            return res.status(200).json({
                status:true,
                message:"no data found"
            })
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}

const updateStatus=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
    
    const {statusA,apply_id}=req.body;
    
    try {
        const statusData = await connection.query(mysqlDB, fQuery.updateStatus, [statusA,apply_id]);

        if (statusA === 'SELECTED') {
            // Fetch candidate_id, job_id, and company_id from the application
            const applicationData = await connection.query(mysqlDB, fQuery.getApplicationById, [apply_id]);
            const { candidate_id, job_id, sl_no } = applicationData[0];
            // console.log(applicationData[0]);
            console.log(candidate_id, job_id, sl_no);

            const registrationDate = new Date();
            const formattedDate = registrationDate.toISOString().slice(0, 10)
            console.log(formattedDate);
            // Add entry to the candidate selection table
            const selectionQuery = `
                INSERT INTO ds.nw_jobmela_candidate_selection (candidate_id, job_id, fkl_Company_slno, selection_date)
                VALUES (?, ?, ?, ?);
            `;
            await connection.query(mysqlDB, selectionQuery, [candidate_id, job_id, sl_no,formattedDate]);
        }
        const statusRecord=await connection.query(mysqlDB,fQuery.statusR,[apply_id])
        return res.status(200).json({ status: true, message: "status changed",status:statusRecord });
        
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }


}

//get all

const getAllCompany=async(req,res)=>{
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
        const companyData = await connection.query(mysqlDB, fQuery.getAllCompany);
        // count
        const pendingApplicantAll = await connection.query(mysqlDB, fQuery.pendingApplicantAll);
        const approveApplicantAll = await connection.query(mysqlDB, fQuery.approveApplicantAll);
        const rejectApplicantAll = await connection.query(mysqlDB, fQuery.rejectApplicantAll);
        const totalApplicantAll = await connection.query(mysqlDB, fQuery.totalApplicantAll);
        if (companyData.length > 0) {
            return  res.status(201).send({
                status: true,
                totalApplicantAll:totalApplicantAll[0].count,
                pendingApplicantAll:pendingApplicantAll[0].count,
                approveApplicantAll:approveApplicantAll[0].count,
                rejectApplicantAll:rejectApplicantAll[0].count,
                message: "success",
                data: companyData
            })
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }

}


module.exports={getByCompany,updateStatus,getAllCompany}