const connection = require("../../../DATABASE/mysqlConnection");
const fQuery = require("../../queries/finalQuery/finalQuery");

const getByCandidate=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
    const{candidate_id}=req.body;
    try {
        
        const candidateData = await connection.query(mysqlDB, fQuery.getByCandidate, [candidate_id]);
        
        if (candidateData.length > 0) {
            return  res.status(201).send({
                status: true,
                message: "success",
                data: candidateData
            })
        }else{
            return res.send({
                message: "No data found"
            })
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}


const getAllCandidate=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }
    const {phone_no,candidate_id,full_name,post_name}=req.body
    let query;
    const params = [phone_no];
    try {
        let candidateData;
        
        switch (req.body.type) {
            case "APPROVED":
                query = fQuery.getAllApprovedCandidate;
                break;
            case "PENDING":
                query = fQuery.getAllPendingCandidate;
                break;
            case "REJECTED":
                query = fQuery.getAllRejectedCandidate;
                break;
            case "JOIN":
                query = fQuery.joined;
                break;
            default:
                query = fQuery.getAllCandidate;
        }

        if (candidate_id) {
            query += " AND ca.candidate_id = ?";
            params.push(candidate_id);
        }
    
        if (full_name) {
            query += " AND cd.full_name LIKE ?";
            params.push(`%${full_name}%`);
        }
        if (post_name) {
            query += " AND jd.post_name LIKE ?";
            params.push(`%${post_name}%`);
        }
        candidateData = await connection.query(mysqlDB, query, params);

        if (!candidateData || candidateData.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No Candidate Found",
            });
        }

        const countAll=await connection.query(mysqlDB, fQuery.countAll, [phone_no]);
        const countpending=await connection.query(mysqlDB, fQuery.countPending, [phone_no]);
        const countreject=await connection.query(mysqlDB, fQuery.countReject, [phone_no]);
        const countapproved=await connection.query(mysqlDB, fQuery.countApproved, [phone_no]);
        
        if (candidateData.length > 0) {
            return  res.status(201).send({
                status: true,
                message: "success",
                countAll:countAll[0].total,
                countpending:countpending[0].total,
                countapproved:countapproved[0].total,
                countreject:countreject[0].total,
                data: candidateData
            })
        }
        if (candidateData.length == 0) {
            return  res.status(201).send({
                status: false,
                message: "No Candidate Found"
            })
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}



const viewStatus=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }

    const{candidate_id,status,registration_no}=req.body;

    try {
        const statusData = await connection.query(mysqlDB, fQuery.viewStatus, [candidate_id,status,registration_no]);
        if (statusData.length > 0) {
            return  res.status(201).send({
                status: true,
                message: "success",
                data: statusData
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

    const{final_selection,job_id,candidate_id}=req.body;

    try {
        await connection.query(mysqlDB, fQuery.statusF, [final_selection,job_id,candidate_id]);
        const statusData=await connection.query(mysqlDB, fQuery.showStatus, [job_id,candidate_id]);

        res.status(201).send({
            status: true,
            message: "success",
            data: statusData
        })
        
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}

module.exports={getByCandidate,viewStatus,updateStatus,getAllCandidate}