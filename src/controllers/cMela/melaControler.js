const connection = require("../../../DATABASE/mysqlConnection");
const QueryM = require("../../queries/melaQuery/melaQuery");


//add mela
const addMela=async(req,res)=>{
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }

    const { venueName, address, startDate, endDate, isActive = true } = req.body;

    try {
        await connection.query(mysqlDB, QueryM.addMela, [venueName, address, startDate, endDate, isActive]);
        res.status(201).json({ status: true, message: "Mela created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}


//get all mela
const getMelas = async (req, res) => {
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
        const { sl_no, venue_name } = req.body;
        let query = QueryM.getMelas; // Default query
        const params = [];

        if (sl_no) {
            query += ' WHERE sl_no = ?';
            params.push(sl_no);
        } else if (venue_name) {
            query += ' WHERE venue_name LIKE ?';
            params.push(`%${venue_name}%`);
        }

        const melaData = await connection.query(mysqlDB, query.getMelas, params);
        let company;
        if(req.body){
            company=await connection.query(mysqlDB,QueryM.companyQ,[sl_no])
        }
        res.status(200).json({ status: true, data: melaData, company:company });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
};

//update mela status
const updateMelaStatus = async (req, res) => {
    let mysqlDB;
    try {
        mysqlDB = await connection.getDB();
        if (!mysqlDB) {
            return res.status(500).json({ status: false, message: "Error connecting to db" });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
    }

    const { slNo } = req.params;
    const { isActive } = req.body;

    try {
        const result = await connection.query(mysqlDB, QueryM.updateMelaStatus, [isActive, slNo]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, message: "Mela not found" });
        }
        res.status(200).json({ status: true, message: "Mela status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
};

//get mela by id
const getMelaById = async (req, res) => {
    const { melaId } = req.body;
    if(!melaId){
        return res.status(400).json({ status: false, message: "Mela ID is required" });
    }
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
        const mela = await connection.query(mysqlDB, QueryM.getMelas, [melaId]);
        if (!mela) {
            return res.status(404).send({ status: false, message: "Mela not found" });
        }
        const company=await connection.query(mysqlDB,QueryM.jobDetails,[melaId]);
        res.status(200).json({ status: true, message: "Mela found", data: {mela,company} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
};

module.exports={addMela,getMelas,updateMelaStatus,getMelaById}