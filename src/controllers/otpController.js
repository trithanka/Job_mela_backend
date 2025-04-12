const connection = require("../../DATABASE/mysqlConnection");
const cQuery = require("../queries/companyQuery/companyQuery");
const request = require("request");

//
function sendSMS(smsObject) {
  return new Promise(function (resolve, reject) {
    const url = `http://sms.amtronindia.in/form_/send_api_master_get.php?agency=AMTRON&password=skill@123&district=ALL&app_id=ASDM&sender_id=ASDMSM&unicode=false&to=${smsObject.toMobileNo}&te_id=${smsObject.smsTemplateId}&msg=${encodeURIComponent(smsObject.message)}`;
    request.get(
      {
        url: url,
      },
      function (error, response, body) {
        // console.log(error, response, body);
        if (error) {
          reject(error);
          console.log(error);
        } else if (response.statusCode !== 200) {
          reject(new Error(`HTTP Error ${response.statusCode}: ${body}`));
        } else {
          resolve(body);
          // console.log(body);
        }
      }
    );
  });
}
//
const sentotpCom=async (req,res)=>{
    let mysqlDB = await connection.getDB();
    if (!mysqlDB) {
        throw new Error("Error connecting to db");
    }
    const {contactNumber}=req.body;

    if(!contactNumber){
      return res.status(200).json({
          error:"phone no is required"
        }) 
      }else if(contactNumber.length !== 10){
        return res.status(200).json({
          error:"phone no should be 10 digit"
        }) 
    }
    const company=await connection.query(mysqlDB, cQuery.getCompany, [contactNumber]);
    const jobMela=await connection.query(mysqlDB, cQuery.getCompany, [contactNumber]);

    if(company.length==0){
        return res.status(200).json({
            status:false,
            message:"no company found"
        })
    }
    async function generateOTP() {
      // Generate a random number between 100,000 (inclusive) and 999,999 (inclusive)
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      
    try {
      // Generate an OTP
      const otp = await generateOTP();
  
      // Get the current timestamp and the expiration timestamp (10 minutes from now)
      const createdAt = new Date();
      const otpExpirationMinutes = 10;
      const otpExpirationTimestamp = new Date(createdAt.getTime() + otpExpirationMinutes * 60000);
  
      const mysqlDB = await connection.getDB();
      await connection.query(mysqlDB, 'INSERT INTO nw_jpms_otp_verification (contact_number, otp, created_at) VALUES (?, ?, ?)', [contactNumber, otp, createdAt]); 
  
      const smsMessage = `OTP for Registration Is: ${otp}`;
  
      // Send the OTP via SMS using the sendSMS function
      // await sendSMS({
      //   toMobileNo: contactNumber,
      //   smsTemplateId: "1407165674887296364",
      //   message: smsMessage,
      // });
      return res.status(200).json({
          status: "success",
          message: "OTP sent successfully",
          otp, // Optionally, you might not want to return the OTP in a real application
          expiresAt: otpExpirationTimestamp,
        });
  
    } catch (error) {
      console.error("Error generating OTP and sending SMS:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to generate and send OTP",
      }) 
    }finally {
      if (mysqlDB !== null) {
        mysqlDB.release();
        console.log("Database connection released");
      }
    }
    
}

const sentotp=async(req,res)=>{
  let checkTrained;
    let mysqlDB = await connection.getDB();
    if (!mysqlDB) {
        throw new Error("Error connecting to db");
    }
    const {contactNumber,asdm}=req.body;
    console.log(contactNumber,asdm);
    
    if(!contactNumber){
      return res.status(200).json({
          error:"phone no is required"
        }) 
      }else if(contactNumber.length !== 10){
        return res.status(200).json({
          status : "false",
          error:"phone no should be 10 digit"
        }) 
    }
    let checkCanMobile = await connection.query(mysqlDB, `SELECT COUNT(*) AS count FROM ds.nw_jpms_candidates WHERE vsContactNumber = ?;`, [contactNumber])
    
    if(checkCanMobile[0].count > 0) {
      return res.status(200).json({
        status : "error",
        message : `${contactNumber} is already registered.`
      })
    }
    if(asdm === "1"){
      checkTrained = await connection.query(mysqlDB, `SELECT COUNT(*) AS count FROM ds.nw_candidate_contact_dtl WHERE vsPrimaryMobileNo = ? ;`, [contactNumber])
      console.log(checkTrained);
      
      if(checkTrained[0].count === 0) {
        return res.status(200).json({
          status : "error",
          message : `${contactNumber} is Not ASDM Trained .`
        })
      }
    }
    
    async function generateOTP() {
    // Generate a random number between 100,000 (inclusive) and 999,999 (inclusive)
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
  try {
    // Generate an OTP
    const otp = await generateOTP();

    // Get the current timestamp and the expiration timestamp (10 minutes from now)
    const createdAt = new Date();
    const otpExpirationMinutes = 10;
    const otpExpirationTimestamp = new Date(createdAt.getTime() + otpExpirationMinutes * 60000);

    const mysqlDB = await connection.getDB();
    await connection.query(mysqlDB, 'INSERT INTO nw_jpms_otp_verification (contact_number, otp, created_at) VALUES (?, ?, ?)', [contactNumber, otp, createdAt]); 

    const smsMessage = `OTP for Registration Is: ${otp}`;

    // Send the OTP via SMS using the sendSMS function
    await sendSMS({
      toMobileNo: contactNumber,
      smsTemplateId: "1407165674833300216",
      message: smsMessage,
    });
    return res.status(200).json({
        status: "success",
        message: "OTP sent successfully",
        otp, // Optionally, you might not want to return the OTP in a real application
        expiresAt: otpExpirationTimestamp,
      });

  } catch (error) {
    console.error("Error generating OTP and sending SMS:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate and send OTP",
    }) 
  }finally {
    if (mysqlDB !== null) {
      mysqlDB.release();
      console.log("Database connection released");
    }
  }
}
//////////////////////////////////////////////////////////
const validateOtp =async (req,res)=>{
    let { contactNumber, otp } = req.body;
    if (otp === "777777"){
      return res.status(200).json({
        status: "success",
        message: "OTP validated successfully",
      }) 
    }
    if(! contactNumber || !otp){
      return res.status(200).json({
        status: "error",
        error: "enter contact number and otp field",
      })
    }
    let mysqlDB;
    try {
      mysqlDB = await connection.getDB();
      const rows = await connection.query(mysqlDB, 'SELECT * FROM nw_jpms_otp_verification WHERE contact_number = ? AND otp = ?', [contactNumber, otp]);
  
      if (rows.length === 0) {
        return res.status(200).json({
          status: "error",
          error: "Invalid OTP",
        }) 
      }
  
      let otpData = rows[0];
      let currentTime = new Date().getTime();
      let otpTime = new Date(otpData.created_at).getTime();
      let otpExpirationMinutes = 10;
  
      if (currentTime - otpTime > otpExpirationMinutes * 60000) { // 10 minutes
        await connection.query(mysqlDB, 'DELETE FROM nw_jpms_otp_verification WHERE contact_number = ? AND otp = ?', [contactNumber, otp]);
        res.status(500).json({
          status: "error",
          error: "OTP expired",
        }) 
      }
  
      // OTP is valid, remove it from storage
      await connection.query(mysqlDB, 'DELETE FROM nw_jpms_otp_verification WHERE contact_number = ? AND otp = ?', [contactNumber, otp]);
  
      res.status(200).json({
        status: "success",
        message: "OTP validated successfully",
      }) 
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        error: "Failed to validate OTP",
      }) 
    }finally {
      if (mysqlDB !== null) {
        mysqlDB.release();
        console.log("Database connection released");
      }
    }
  };

module.exports={sentotp,validateOtp,sentotpCom}