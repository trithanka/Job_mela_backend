const connection = require("../../../DATABASE/mysqlConnection");
const Query = require("../../queries/candidateReQuery/candidateRegisterQuery");

//password hashed
// hashPassword = async function (password) {
//     try {
//       const salt = process.env.SALT;
//       const derivedKey = await pbkdf2Promise(password, salt, 10000, 64, "sha256");
//       return derivedKey.toString("hex");
//     } catch (err) {
//       throw err;
//     }
// };
const getMatchingJobs = async (candidateId, qualification) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      throw new Error("Error connecting to db");
    }
  } catch (error) {
    throw new Error("Error connecting to db: " + error.message);
  }

  const jobQuery = `
        SELECT j.job_id, c.registration_no, j.min_fklqualificationId,c.company_name, j.vacancy, j.post_name
        FROM ds.nw_jobmela_job_details j
        JOIN ds.nw_jobmela_company_dtl c ON j.fkl_Company_slno = c.sl_no
        WHERE j.min_fklqualificationId <= ? 
        AND c.fklmela_no = (SELECT fklmela_no FROM ds.nw_jobmela_candidate_dtl WHERE candidate_id = ?);
    `;

  try {
    const jobs = await connection.query(mysqlDB, jobQuery, [
      qualification,
      candidateId,
    ]);
    if (jobs.length > 0) {
      return jobs;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error(
      "Internal Server Error during job fetching: " + error.message
    );
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};

const applyForJobs = async (candidateId, qualification, res) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to db" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Error connecting to db",
        error: error.message,
      });
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
    const jobs = await connection.query(mysqlDB, jobQuery, [
      qualification,
      candidateId,
    ]);
    if (jobs.length > 0) {
      for (const job of jobs) {
        const existingApplication = await connection.query(
          mysqlDB,
          checkApplyQuery,
          [candidateId, job.job_id]
        );
        if (existingApplication[0].count === 0) {
          await connection.query(mysqlDB, applyQuery, [
            candidateId,
            job.job_id,
          ]);
        }
      }
    }
  } catch (error) {
    console.error("Error applying for jobs:", error);
    throw new Error("Internal Server Error during job application");
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};

// const applyForJobs = async (candidateId, qualification, res) => {
//     let mysqlDB;
//     try {
//         mysqlDB = await connection.getDB();
//         if (!mysqlDB) {
//             return res.status(500).json({ status: false, message: "Error connecting to db" });
//         }
//     } catch (error) {
//         return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
//     }

//     const jobQuery = `
//         SELECT job_id
//         FROM ds.nw_jobmela_job_details
//         WHERE min_fklqualificationId <= ?;
//     `;

//     const checkApplyQuery = `
//         SELECT COUNT(*) as count
//         FROM ds.nw_jobmela_candidate_apply
//         WHERE candidate_id = ? AND job_id = ?;
//     `;

//     const applyQuery = `
//         INSERT INTO ds.nw_jobmela_candidate_apply (candidate_id, job_id, application_date)
//         VALUES (?, ?, NOW());
//     `;

//     try {
//         const jobs = await connection.query(mysqlDB, jobQuery, [qualification]);
//         if (jobs.length > 0) {
//             for (const job of jobs) {
//                 const existingApplication = await connection.query(mysqlDB, checkApplyQuery, [candidateId, job.job_id]);
//                 if (existingApplication[0].count === 0) {
//                     await connection.query(mysqlDB, applyQuery, [candidateId, job.job_id]);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Error applying for jobs:", error);
//         throw new Error('Internal Server Error during job application');
//     } finally {
//         if (mysqlDB) mysqlDB.release();
//     }
// };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const asdmTrained = async (req, res) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to db" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Error connecting to db",
        error: error.message,
      });
  }
  const { contactNumber, fklmela_no, dob } = req.body;

  try {
    try {
      const contactCheck = await connection.query(
        mysqlDB,
        Query.checkCandidateasdm,
        [contactNumber, dob]
      );

      if (contactCheck.length == 0) {
        return res
          .status(400)
          .json({ status: false, message: "Phone number is not Registered" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: false,
          message: "Internal Server Error contact",
          error: error.message,
        });
    }
    //job mela check
    try {
      const contactCheck = await connection.query(
        mysqlDB,
        Query.checkCandidateMela,
        [contactNumber]
      );
      if (contactCheck.length > 0) {
        return res
          .status(400)
          .json({
            status: false,
            message: "Phone number already exists in Job Mela",
          });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: false,
          message: "Internal Server Error contact",
          error: error.message,
        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////
    try {
      let insertData;
      const mydata = await connection.query(mysqlDB, Query.checkCandidateAsdm, [
        contactNumber,
      ]);
      if (req.body.insert) {
        try {
          //generate date,id
          const registrationDate = new Date();
          const formattedDate = registrationDate
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");
          let candidateId = "";

          try {
            const [rows] = await connection.query(mysqlDB, Query.count, [
              registrationDate,
            ]);

            if (rows && rows.length === 0) {
              // Handle the case when no records are found for the registration date
              const paddedId = "0001";
              candidateId = `${formattedDate}${paddedId}`;
            } else {
              const countC = rows.count;
              const paddedId = String(countC + 1).padStart(4, "0"); // Pad auto_id with leading zeros
              candidateId = `${formattedDate}${paddedId}`;
            }
          } catch (error) {
            return res
              .status(500)
              .json({
                status: false,
                message: "Internal Server Error count",
                error: error.message,
              });
          }

          //insert data
          insertData = await connection.query(mysqlDB, Query.addCandidateAsdm, [
            candidateId,
            mydata[0].fullName,
            mydata[0].contactNumber,
            mydata[0].emailAddress,
            mydata[0].fklQualificationId,
            mydata[0].dob,
            mydata[0].area,
            mydata[0].city,
            mydata[0].state,
            mydata[0].pinCode,
            registrationDate,
            1,
            fklmela_no,
            mydata[0].pklCandidateId,
          ]);

          // // Apply for jobs that match the candidate's qualification
          // await applyForJobs(candidateId, mydata[0].qualification);

          // Retrieve the inserted candidate data
          const getCandidate = await connection.query(
            mysqlDB,
            Query.getCandidate,
            [contactNumber]
          );

          res.status(201).send({
            status: true,
            message: "successfully inserted",
            data: getCandidate,
          });
        } catch (error) {
          return res
            .status(500)
            .json({
              status: false,
              message: "Internal Server Error contact",
              error: error.message,
            });
        }
      }
      return res.status(201).json({ status: true, data: mydata });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: false,
          message: "Internal Server Error contact",
          error: error.message,
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Internal Server Error dbinsert",
        error: error.message,
      });
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};
const portalCan = async (req, res) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to db" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Error connecting to db",
        error: error.message,
      });
  }
  const { contactNumber, dob } = req.body;
  if (!contactNumber) {
    return res
      .status(400)
      .json({ status: false, message: "Enter a valid phone number" });
  }

  try {
    try {
      const contactCheck = await connection.query(
        mysqlDB,
        Query.checkCandidatePor,
        [contactNumber, dob]
      );

      if (contactCheck.length == 0) {
        return res
          .status(400)
          .json({
            status: false,
            message: "Phone number Or DOB Is Not Matched",
          });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: false,
          message: "Internal Server Error contact",
          error: error.message,
        });
    }
    try {
      // let insertData;
      const mydata = await connection.query(
        mysqlDB,
        Query.checkCandidatePortal,
        [contactNumber]
      );
      // if(req.body.insert){
      //     try {
      //         //generate date,id
      //         const registrationDate = new Date();
      //         const formattedDate = registrationDate.toISOString().slice(0, 10).replace(/-/g, "");
      //         let candidateId = "";

      //         try {
      //             const [rows] = await connection.query(mysqlDB, Query.count, [registrationDate]);

      //             if (rows && rows.length === 0) {
      //                 // Handle the case when no records are found for the registration date
      //                 const paddedId = '0001';
      //                 candidateId = `${formattedDate}${paddedId}`;
      //             } else {
      //                 const countC = rows.count;
      //                 const paddedId = String(countC + 1).padStart(4, '0'); // Pad auto_id with leading zeros
      //                 candidateId = `${formattedDate}${paddedId}`;
      //             }
      //         } catch (error) {
      //             return res.status(500).json({ status: false, message: "Internal Server Error count", error: error.message });
      //         }
      //         //insert data
      //         insertData=await connection.query(mysqlDB, Query.addCandidateAsdm, [candidateId, mydata[0].fullName, mydata[0].fatherName, mydata[0].contactNumber, mydata[0].emailAddress, mydata[0].fklQualificationId, mydata[0].dob, mydata[0].area, mydata[0].city, mydata[0].state, mydata[0].pinCode, registrationDate,1,fklmela_no]);

      //         // Apply for jobs that match the candidate's qualification
      //         await applyForJobs(candidateId, mydata[0].qualification);

      //         // Retrieve the inserted candidate data
      //         const getCandidate = await connection.query(mysqlDB, Query.getCandidate, [contactNumber]);

      //         res.status(201).send({
      //             status: true,
      //             message: "successfully inserted",
      //             data:getCandidate
      //         })

      //     } catch (error) {
      //         return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
      //     }

      // }
      return res.status(201).json({ status: true, data: mydata });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: false,
          message: "Internal Server Error contact",
          error: error.message,
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Internal Server Error dbinsert",
        error: error.message,
      });
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// const registerCanditate = async (req, res) => {
//     let mysqlDB;
//     let jobPortal;
//     try {
//         mysqlDB = await connection.getDB();
//         if (!mysqlDB) {
//             return res.status(500).json({ status: false, message: "Error connecting to db" });
//         }
//     } catch (error) {
//         return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
//     }

//     let { firstName, middleName, lastName, contactNumber, emailAddress, qualification, dob, area, city, state, pinCode, fklmela_no ,fklCandidateId,asdmTrained,asdmCheck} = req.body;
//     if (emailAddress === "") {
//         emailAddress = null;
//     }
//     let fullName =firstName+" "+ middleName+" "+ lastName
//     // console.log(fullName)
//     // console.log(firstName,contactNumber,qualification,dob,fklmela_no,asdmTrained);

//     if(!firstName || !contactNumber || !qualification || !dob || !fklmela_no ||!asdmTrained || asdmTrained ==="undefined" ){
//         return res.status(200).json({
//             status:false,
//             message:"All Fields are Required"
//         })
//     }

//     //check if phone number already exist
//     // try {
//     //     const contactCheck = await connection.query(mysqlDB, Query.checkCandidate, [contactNumber]);
//     //     if (contactCheck.length > 0) {
//     //         return res.status(400).json({ status: false, message: "Phone number already exists in ASDM" });
//     //     }
//     // } catch (error) {
//     //     return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
//     // }
//     //check if phone number already exist
//     try {
//         const contactCheck = await connection.query(mysqlDB, Query.checkCandidateMela, [contactNumber]);
//         if (contactCheck.length > 0) {
//             return res.status(400).json({ status: false, message: "Phone number already exists in Job Mela" });
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ status: false, message: "Internal Server Error contact", error: error.message });
//     }

//     // Convert the dob to YYYY-MM-DD format
//     // console.log("dob",dob)
//     const formattedDob = new Date(dob).toISOString().slice(0, 10);

//     //generate date,id
//     const registrationDate = new Date();
//     const formattedDate = registrationDate.toISOString().slice(0, 10).replace(/-/g, "");
//     let candidateId = "";

//     try {
//         const [rows] = await connection.query(mysqlDB, Query.count, [registrationDate]);

//         if (rows && rows.length === 0) {
//             // Handle the case when no records are found for the registration date
//             const paddedId = '0001';
//             candidateId = `${formattedDate}${paddedId}`;
//         } else {
//             const countC = rows.count;
//             const paddedId = String(countC + 1).padStart(4, '0'); // Pad auto_id with leading zeros
//             candidateId = `${formattedDate}${paddedId}`;
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ status: false, message: "Internal Server Error count", error: error.message });
//     }
//     //insert into job portal
//     if (asdmCheck === "0"){
//         try {
//             //basic detail
//             console.log(asdmTrained);
//             let checkjobportal = await connection.query(mysqlDB, Query.checkjobportal, [contactNumber]);

//             if (checkjobportal.length > 0){
//                 return res.status(400).json({ status: false, message: "Alreadry Register in Job Portal", error: error.message });
//             }

//             jobPortal= await connection.query(mysqlDB, Query.addCandidateJobportal, [ fullName,formattedDob, contactNumber,0,0,registrationDate, asdmTrained, emailAddress]);

//             //insert qualification
//             await connection.query(mysqlDB, Query.addCandidateEdu, [jobPortal.insertId,qualification]);

//             //INSERT ADDRESS
//             await connection.query(mysqlDB, Query.addCandidateAdd, [jobPortal.insertId,area, city, state]);

//         } catch (error) {
//             console.log(error);
//             return res.status(500).json({ status: false, message: "Internal Server while addning JP", error: error.message });
//         }
//         if(!fklCandidateId){
//             fklCandidateId=jobPortal.insertId
//         }
//     }
//     //insert candidate data
//     try {
//         // console.log("here1");

//         await connection.query(mysqlDB, Query.addCandidate, [candidateId, fullName, contactNumber, emailAddress, qualification, formattedDob, area, city, state, pinCode, registrationDate,asdmTrained,fklmela_no,fklCandidateId]);
//         // console.log("here2");
//         // Apply for jobs that match the candidate's qualification
//         // await applyForJobs(candidateId, qualification);

//         const showJob=await getMatchingJobs(candidateId,qualification)
//         // console.log("here3");
//         // Retrieve the inserted candidate data
//         const getCandidate = await connection.query(mysqlDB, Query.getCandidate, [contactNumber]);
//         // console.log("here4");
//         res.status(201).send({
//             status: true,
//             message: "success",
//             data: getCandidate,
//             jobs:showJob
//         })

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ status: false, message: "Internal Server Error dbinsert", error: error.message });
//     }finally {
//         if (mysqlDB) mysqlDB.release();
//     }
// }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const registerCanditate = async (req, res) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to db" });
    }

    // Begin transaction
    await connection.beginTransaction(mysqlDB);

    let { candidateId, melaID, applications } = req.body;

    if (!candidateId || !melaID || !Array.isArray(applications) || applications.length === 0) {
      await connection.rollback(mysqlDB);
      return res.status(200).json({
        status: false,
        message: "All Fields are Required (candidateId, melaID, applications)"
      });
    }

    for (const app of applications) {
      const { jobId, companyId } = app;
      if (!jobId || !companyId) {
        throw new Error("Missing jobId or companyId in one of the applications");
      }
      // Check for duplicate
      const existing = await connection.query(mysqlDB, Query.checkCandidateApply, [candidateId, jobId]);
      if (existing[0].count > 0) {
        throw new Error(`Candidate already applied for jobId: ${jobId}`);
      }
      // Insert
      await connection.query(mysqlDB, Query.insertCandidateApply, [candidateId, melaID, jobId, companyId]);
    }

    await connection.commit(mysqlDB);
    return res.status(201).json({
      status: true,
      message: "All candidate applications processed successfully"
    });
  } catch (error) {
    if (mysqlDB) {
      try { await connection.rollback(mysqlDB); } catch (e) {}
    }
    return res
      .status(500)
      .json({
        status: false,
        message: error.message || "Internal Server Error dbinsert"
      });
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};

//Retrieve by number
const getByNumber = async (req, res) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to db" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Error connecting to db",
        error: error.message,
      });
  }

  const { contactNumber } = req.params;

  try {
    const candidateData = await connection.query(mysqlDB, Query.getCandidate, [
      contactNumber,
    ]);
    if (candidateData.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Candidate Not found" });
    }
    res.status(200).json({ status: true, data: candidateData });
  } catch (error) {
    res
      .status(500)
      .json({
        status: false,
        message: "Internal Server Error",
        error: error.message,
      });
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};
//appliedJob
const appliedJob = async (req, res) => {
  // let mysqlDB;
  // try {
  //     mysqlDB = await connection.getDB();
  //     if (!mysqlDB) {
  //         return res.status(500).json({ status: false, message: "Error connecting to db" });
  //     }
  // } catch (error) {
  //     return res.status(500).json({ status: false, message: "Error connecting to db", error: error.message });
  // }

  const { candidate_id, qualification } = req.body;
  try {
    const showJob = await getMatchingJobs(candidate_id, qualification);

    res.status(201).send({
      status: true,
      message: "success",
      jobs: showJob,
    });
  } catch (error) {
    res.status(401).send({
      status: false,
      message: "not found",
    });
  }

  // try {
  //     const candidateData = await connection.query(mysqlDB, Query.appliedJob, [contact_number]);
  //     if (candidateData.length === 0) {
  //         return res.status(200).json({ status: false, message: "Not Eligible for job" });
  //     }
  //     res.status(200).json({ status: true, data: candidateData });
  // } catch (error) {
  //     res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
  // }finally {
  //     if (mysqlDB) mysqlDB.release();
  // }
};

//update candidate
const updateCandidate = async (req, res) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to db" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Error connecting to db",
        error: error.message,
      });
  }

  const { contactNumber } = req.params;
  let {
    fullName,
    emailAddress,
    qualification,
    dob,
    area,
    city,
    state,
    pinCode,
    fklmela_no,
    fklCandidateId,
  } = req.body;
  if (emailAddress === "") {
    emailAddress = null;
  }

  // Convert the dob to YYYY-MM-DD format
  const formattedDob = new Date(dob).toISOString().slice(0, 10);

  try {
    const candidateData = await connection.query(mysqlDB, Query.getCandidate, [
      contactNumber,
    ]);
    if (candidateData.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Candidate not found" });
    }
    //update in job portal table//////////////////////////////////////////////////////////////////////
    await connection.query(mysqlDB, Query.updateCandidatejp, [
      fullName,
      emailAddress,
      formattedDob,
      fklCandidateId,
    ]);
    //update address
    await connection.query(mysqlDB, Query.updateCandidatejpAdd, [
      area,
      city,
      state,
      fklCandidateId,
    ]);
    //update education
    await connection.query(mysqlDB, Query.updateCandidatejpEdu, [
      qualification,
      fklCandidateId,
    ]);
    /////////////////////////////////////////////////////////////////////////////////////////////////

    //update in job mela table
    await connection.query(mysqlDB, Query.updateCandidate, [
      fullName,
      emailAddress,
      qualification,
      formattedDob,
      area,
      city,
      state,
      pinCode,
      fklmela_no,
      contactNumber,
    ]);

    const updatedCandidateData = await connection.query(
      mysqlDB,
      Query.getCandidate,
      [contactNumber]
    );
    // Apply for jobs based on the updated qualification
    // await applyForJobs(updatedCandidateData[0].candidate_id, qualification, res);
    const showJob = await getMatchingJobs(
      updatedCandidateData[0].candidate_id,
      qualification
    );

    res
      .status(200)
      .json({
        status: true,
        message: "Candidate updated successfully",
        data: updatedCandidateData,
        jobs: showJob,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        status: false,
        message: "Internal Server Error",
        error: error.message,
      });
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};

//get all candidate
const getAllCandidate = async (req, res) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to db" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Error connecting to db",
        error: error.message,
      });
  }

  try {
    let candidateData;
    if (req.body.type == "placed") {
      candidateData = await connection.query(
        mysqlDB,
        Query.selectedCandidateAll
      );
    } else {
      candidateData = await connection.query(mysqlDB, Query.getAll, []);
      if (candidateData.length === 0) {
        return res
          .status(404)
          .json({ status: false, message: "Candidate not found" });
      }
    }

    res.status(200).json({ status: true, data: candidateData });
  } catch (error) {
    res
      .status(500)
      .json({
        status: false,
        message: "Internal Server Error",
        error: error.message,
      });
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};
//master

const master = async (req, res) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to db" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Error connecting to db",
        error: error.message,
      });
  }

  try {
    // Query for total candidates
    const totalCandidates = await connection.query(
      mysqlDB,
      Query.totalCandidate
    );
    //total registered company
    const totalCompany = await connection.query(mysqlDB, Query.totalCompany);
    const allCompany = await connection.query(mysqlDB, Query.allCompany);
    //mela info
    const melaInfo = await connection.query(mysqlDB, Query.melaInfo);
    //Query for Approve applicant and candidaate
    const appliedApplicant = await connection.query(
      mysqlDB,
      Query.appliedApplicant
    );
    const appliedCandidate = await connection.query(
      mysqlDB,
      Query.appliedCandidate
    );
    //Query for selected applicant and candidaate
    const selectedApplicant = await connection.query(
      mysqlDB,
      Query.selectedApplicant
    );
    const selectedCandidate = await connection.query(
      mysqlDB,
      Query.selectedCandidate
    );
    //Query for rejected applicant and candidaate
    const rejectedApplicant = await connection.query(
      mysqlDB,
      Query.rejectedApplicant
    );
    const rejectedCandidate = await connection.query(
      mysqlDB,
      Query.rejectedCandidate
    );
    //qualification
    const qualification = await connection.query(mysqlDB, Query.qualification);
    //mela
    const mela = await connection.query(mysqlDB, Query.mela);
    //state
    const state = await connection.query(mysqlDB, Query.state);
    //district
    const district = await connection.query(mysqlDB, Query.district);

    // Query for pending candidates
    //  const [pendingCandidates] = await connection.query(mysqlDB, "SELECT COUNT(*) AS pending FROM nw_jobmela_candidate_selection WHERE status = 'pending'");

    //  // Query for approved candidates
    //  const [approvedCandidates] = await connection.query(mysqlDB, "SELECT COUNT(*) AS approved FROM nw_jobmela_candidate_selection WHERE status = 'approved'");

    //  // Query for rejected candidates
    //  const [rejectedCandidates] = await connection.query(mysqlDB, "SELECT COUNT(*) AS rejected FROM nw_jobmela_candidate_selection WHERE status = 'rejected'");

    return res.status(200).json({
      status: true,
      data: {
        totalCandidates: totalCandidates[0].total,
        totalCompany: totalCompany[0].total,
        appliedApplicant: appliedApplicant[0].appliedApplicant,
        appliedCandidate: appliedCandidate[0].appliedCandidate,
        selectedApplicant: selectedApplicant[0].selectedApplicant,
        selectedCandidate: selectedCandidate[0].selectedCandidate,
        rejectedApplicant: rejectedApplicant[0].rejectedApplicant,
        rejectedCandidate: rejectedCandidate[0].rejectedCandidate,
        qualification: qualification,
        company: allCompany,
        mela: mela,
        state: state,
        district: district,
        melaInfo: melaInfo,
        //  pending: pendingCandidates[0].pending,
        //  approved: approvedCandidates[0].approved,
        //  rejected: rejectedCandidates[0].rejected
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        status: false,
        message: "Internal Server Error",
        error: error.message,
      });
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};

//get asdm candidate by phone number.
const getAsdmCandidate = async (req, res) => {
  let mysqlDB;
  try {
    mysqlDB = await connection.getDB();
    if (!mysqlDB) {
      return res
        .status(500)
        .json({ status: false, message: "Error connecting to db" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Error connecting to db",
        error: error.message,
      });
  }
  const { contactNumber } = req.body;
  console.log(contactNumber);
  try {
    // Get basic candidate info using new query
    const basicInfo = await connection.query(
      mysqlDB,
      Query.getAsdmCandidateData,
      [contactNumber]
    );
    if (basicInfo.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Candidate Not found" });
    }

    // Get addresses for the candidate
    const addresses = await connection.query(mysqlDB, Query.getAsdmAddresses, [
      basicInfo[0].pklCandidateId,
    ]);

    // Combine the results
    const response = {
      ...basicInfo[0],
      addresses: addresses,
    };

    res.status(200).json({ status: true, data: response });
  } catch (error) {
    res
      .status(500)
      .json({
        status: false,
        message: "Internal Server Error",
        error: error.message,
      });
  } finally {
    if (mysqlDB) mysqlDB.release();
  }
};

module.exports = {
  registerCanditate,
  getByNumber,
  updateCandidate,
  getAllCandidate,
  master,
  asdmTrained,
  appliedJob,
  portalCan,
  getAsdmCandidate,
};
