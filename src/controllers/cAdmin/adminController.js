const connection = require("../../../DATABASE/mysqlConnection");
const aQuery = require("../../queries/adminQuery/adminQuery");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//register admin////
const registerAdmin = async (req, res) => {
    let mysqlDB = await connection.getDB();
    if (!mysqlDB) {
        throw new Error("Error connecting to db");
    }

    const { username, email, password, type, phone_no,fklmela_no } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await connection.query(mysqlDB, aQuery.addAdmin, [username, email, hashedPassword, type, phone_no, fklmela_no]);
        res.status(201).send({
            status: true,
            message: "Admin registered successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: false,
            message: "Internal Server Error while registering admin"
        });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
};

//admin login
const loginAdmin = async (req, res) => {
    let mysqlDB = await connection.getDB();
    if (!mysqlDB) {
        throw new Error("Error connecting to db");
    }

    const { email, password} = req.body;

    try {
        const rows = await connection.query(mysqlDB, aQuery.getAdminByEmail, [email]);

        if (rows.length === 0) {
            return res.status(400).send({
                status: false,
                message: "Invalid email or password"
            });
        }

        const admin = rows[0];
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(400).send({
                status: false,
                message: "Invalid email or password"
            });
        }

        //generate token
        const token = jwt.sign({ admin_id: admin.admin_id, email: admin.email, admin_type: admin.admin_type}, process.env.SECERET_TOKEN, { expiresIn: '30d' });

        res.status(200).send({
            status: true,
            message: "Login successful",
	    type: admin.admin_type,
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
};

const getAllAdmin=async(req,res)=>{
    let mysqlDB = await connection.getDB();
    if (!mysqlDB) {
        throw new Error("Error connecting to db");
    }
    try {
        const admin=await connection.query(mysqlDB, aQuery.getAll);
        res.status(201).send({
            status: true,
            data:admin
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: false,
            message: "Internal Server Error while registering admin"
        });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }


}

const updateStatus=async(req,res)=>{
    let mysqlDB = await connection.getDB();
    if (!mysqlDB) {
        throw new Error("Error connecting to db");
    }
    const {bActive,admin_id}=req.body
    try {
        const result = await connection.query(mysqlDB, aQuery.updateStatus, [bActive, admin_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, message: "admin not found" });
        }
        res.status(200).json({ status: true, message: "admin status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }finally {
        if (mysqlDB) mysqlDB.release();
    }
}

module.exports={registerAdmin,loginAdmin,getAllAdmin,updateStatus}
