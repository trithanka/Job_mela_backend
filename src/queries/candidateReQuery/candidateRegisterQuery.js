const Query={
    count:`SELECT COUNT(*) AS count 
    FROM nw_jobmela_candidate_dtl`,
    checkjobportal:`SELECT *
    FROM nw_jpms_candidates where vsContactNumber=?`,
    addCandidateJobportal:`INSERT INTO nw_jpms_candidates 
    (vsName, DOB, vsContactNumber, iStatus, iRole, dtCreatedAt, isAsdmTrained, vsEmail) 
    VALUES(?,?,?,?,?,?,?,?)`,
    addCandidateEdu:`INSERT INTO nw_jpms_candidate_edu_details (fklCandidateId,dtCreatedAt,fklQualificationId)
    VALUES(?,CURDATE(),?)`,
    addCandidateAdd:`INSERT INTO nw_jpms_candidate_details (fklCandidateId,vsPermanentAddress,vsPermanentDistrict,vsPermanentState) VALUES(?,?,?,?)`,
    addCandidate:`INSERT INTO nw_jobmela_candidate_dtl 
    (candidate_id, full_name, contact_number, email, fklqualificationId, dob, area, city, state, pin_code, registration_date,isAsdmTrained,fklmela_no,fklCandidateId) 
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    checkCandidateApply:`SELECT COUNT(*) as count FROM ds.nw_jobmela_applicant_dtl WHERE fklCandidateId = ? AND fklJobId = ?`,
    insertCandidateApply:`INSERT INTO ds.nw_jobmela_applicant_dtl (fklCandidateId, fklMelaId, fklJobId, fklEmployerId, dtCreatedDate) VALUES (?, ?, ?, ?, NOW())`,
    addCandidateAsdm:`INSERT INTO nw_jobmela_candidate_dtl 
    (candidate_id, full_name, contact_number, email, fklqualificationId, dob, area, city, state, pin_code, registration_date,isAsdmTrained,fklmela_no,fklCandidateId) 
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,

    checkCandidate:`SELECT fklCandidateId
    FROM ds.nw_candidate_contact_dtl
    WHERE vsPrimaryMobileNo = ?;`,

    checkCandidateMela:`SELECT candidate_id
    FROM ds.nw_jobmela_candidate_dtl
    WHERE contact_number = ?;`,

    checkCandidatePor:`SELECT pklCandidateId
    FROM ds.nw_jpms_candidates
    WHERE vsContactNumber = ? and DOB=? ;`,

    checkCandidateasdm:`SELECT pklCandidateId
    FROM ds.nw_jpms_candidates
    WHERE vsContactNumber = ? and DOB=? and and isAsdmTrained=1;`,


    getCandidate:`SELECT 
    c.candidate_id,
    c.fklCandidateId,
    c.full_name AS fullName,
    c.contact_number AS contactNumber,
    c.email AS emailAddress,
    c.fklmela_no,
    m.venue_name,
    m.address,
    m.start_date,
    m.end_date,
    m.district,
    c.fklqualificationId,
    q.vsQualification as qualification,
    c.dob,
    c.area,
    c.city,
    c.state,
    c.pin_code AS pinCode,
    c.registration_date,
    c.isAsdmTrained
FROM 
    ds.nw_jobmela_candidate_dtl c
JOIN 
    ds.nw_mams_qualification q ON c.fklqualificationId = q.pklQualificationId
left join
	ds.nw_jobmela_mela_dtl m on c.fklmela_no=m.sl_no
WHERE 
    c.contact_number =?;
`,

appliedJob:`SELECT  
    dtl.post_name,
    dtl.vacancy,
    dtl.min_fklqualificationId,
    com.company_name,
    job.status
    FROM ds.nw_jobmela_candidate_apply job
    join
    nw_jobmela_job_details dtl on job.job_id=dtl.job_id
    join nw_jobmela_company_dtl com on dtl.registration_no=com.registration_no
    join nw_jobmela_candidate_dtl can on job.candidate_id=can.candidate_id
    where can.contact_number=?;`,
checkCandidateAsdm:`WITH LatestEducation AS (
    SELECT 
        fklCandidateId,
        vsDegree,
        fklQualificationId,
        dtUpdatedAt,
        ROW_NUMBER() OVER (PARTITION BY fklCandidateId ORDER BY dtUpdatedAt DESC) AS rn
    FROM 
        nw_jpms_candidate_edu_details
)
SELECT 
    candidate.vsName AS fullName,
    candidate.vsContactNumber AS contactNumber,
    detail.vsEmail AS emailAddress,
    edu.vsDegree AS qualification,
    edu.fklQualificationId,
    detail.vsPermanentAddress AS area,
    detail.vsPermanentDistrict AS city,
    detail.vsPermanentState AS state,
    candidate.pklCandidateId
FROM 
    nw_jpms_candidates candidate
LEFT JOIN 
    nw_jpms_candidate_details detail ON candidate.pklCandidateId = detail.fklCandidateId
LEFT JOIN 
    LatestEducation edu ON candidate.pklCandidateId = edu.fklCandidateId AND edu.rn = 1
WHERE
    candidate.vsContactNumber =?`,

    updateCandidate:`UPDATE nw_jobmela_candidate_dtl
    SET full_name = ?,  email = ?, fklqualificationId = ?, dob = ?, area = ?, city = ?, state = ?, pin_code = ?, fklmela_no=?
    WHERE contact_number = ?;`,

    updateCandidatejp:`UPDATE nw_jpms_candidates
    SET vsName = ?, vsEmail = ?, DOB = ?
    WHERE pklCandidateId = ?;`,
    updateCandidatejpEdu:`UPDATE nw_jpms_candidate_edu_details
    SET fklQualificationId = ?
    WHERE fklCandidateId = ?;`,
    updateCandidatejpAdd:`UPDATE nw_jpms_candidate_details
    SET vsPermanentAddress = ?, vsPermanentDistrict = ?, vsPermanentState = ?
    WHERE fklCandidateId = ?;`,

    // addCandidateEdu:`INSERT INTO nw_jpms_candidate_edu_details (fklCandidateId,dtCreatedAt,fklQualificationId)
    // VALUES(?,CURDATE(),?)`,
    // addCandidateAdd:`INSERT INTO nw_jpms_candidate_details (fklCandidateId,vsPermanentAddress,vsPermanentDistrict,vsPermanentState) VALUES(?,?,?,?)`,
    getAsdmAddresses: `
    SELECT 
        addressCan.vsAddressType as addressType,
        district.vsDistrictName as district,
        state.vsStateName as state,
        addressCan.vsPinCode as pin,
        addressCan.vsCityName as city,
        addressCan.vsPostOffice as postOffice,
        addressCan.vsPoliceStation as policeStation,
        const.vsConstituencyName as loksabha,
        asse.vsConstituencyName as assemble
    FROM 
        nw_candidate_address_dtl addressCan
    LEFT JOIN 
        nw_mams_district district ON addressCan.fklDistrictId = district.pklDistrictId
    LEFT JOIN 
        nw_mams_state state ON addressCan.fklStateId = state.pklStateId
    LEFT JOIN 
        nw_mams_constituency_loksabha const ON addressCan.fklLoksabhaConstituencyId = const.pklLoksabhaConstituencyId
    LEFT JOIN 
        nw_mams_constituency_assembly asse ON addressCan.fklAssemblyConstituencyId = asse.pklAssemblyConstituencyId
    WHERE 
        addressCan.fklCandidateId = ?`,
    getAsdmCandidateData: `
    SELECT 
        basic.vsFirstName as firstName,
        basic.vsMiddleName as middleName,
        basic.vsLastName as lastName,
        basic.dtDOB as dob,
        basic.vsGender as gender,
        religion.vsReligionName as religion,
        caste.vsCasteName as caste,
        qual.vsQualification as qualification,
        contact.vsPrimaryMobileNo as mobile,
        basic.pklCandidateId
    FROM 
        nw_candidate_basic_dtl basic
    LEFT JOIN 
        nw_mams_religion religion ON basic.fklRelegionId = religion.pklReligionId
    LEFT JOIN 
        nw_candidate_caste_dtl candidateCaste ON candidateCaste.fklCandidateId = basic.pklCandidateId 
    LEFT JOIN 
        nw_mams_caste caste ON candidateCaste.fklCasteCategoryId = caste.pklCasteId
    LEFT JOIN 
        nw_candidate_qualification_dtl candidateQual ON candidateQual.fklCandidateId = basic.pklCandidateId
    LEFT JOIN 
        nw_mams_qualification qual ON qual.pklQualificationId = candidateQual.fklQualificationId
    LEFT JOIN 
        nw_candidate_contact_dtl contact ON contact.fklCandidateId = basic.pklCandidateId
    WHERE 
        contact.vsPrimaryMobileNo = ?`,
    checkCandidatePortal:`
    SELECT 
    SUBSTRING_INDEX(candidate.vsName, ' ', 1) AS firstName,
    CASE 
        WHEN LENGTH(candidate.vsName) - LENGTH(REPLACE(candidate.vsName, ' ', '')) > 1
        THEN SUBSTRING_INDEX(SUBSTRING_INDEX(candidate.vsName, ' ', 2), ' ', -1)
        ELSE NULL
    END AS middleName,
    CASE 
        WHEN LENGTH(candidate.vsName) - LENGTH(REPLACE(candidate.vsName, ' ', '')) > 0
        THEN SUBSTRING_INDEX(candidate.vsName, ' ', -1)
        ELSE NULL
    END AS lastName,
    candidate.vsName as fullName,
    candidate.vsContactNumber AS contactNumber,
    detail.vsEmail AS emailAddress,
    edu.vsDegree AS qualification,
    edu.fklQualificationId,
    detail.vsPermanentAddress AS area,
    detail.vsPermanentDistrict AS city,
    detail.vsPermanentState AS state,
    candidate.pklCandidateId,
    candidate.isAsdmTrained,
    candidateMela.pin_code,
    mela.venue_name
FROM 
    nw_jpms_candidates candidate
LEFT JOIN 
    nw_jpms_candidate_details detail ON candidate.pklCandidateId = detail.fklCandidateId
LEFT JOIN 
    nw_jobmela_candidate_dtl candidateMela ON candidate.pklCandidateId = candidateMela.fklCandidateId
LEFT JOIN
	nw_jobmela_mela_dtl mela ON candidateMela.fklmela_no = mela.sl_no 
LEFT JOIN 
    (
        SELECT 
            fklCandidateId,
            vsDegree,
            fklQualificationId
        FROM 
            nw_jpms_candidate_edu_details edu1
        WHERE 
            dtUpdatedAt = (
                SELECT MAX(dtUpdatedAt) 
                FROM nw_jpms_candidate_edu_details edu2 
                WHERE edu1.fklCandidateId = edu2.fklCandidateId
            )
    ) edu ON candidate.pklCandidateId = edu.fklCandidateId
WHERE
    candidate.vsContactNumber = ?;
    `,
    // checkCandidatePortal:`
    // SELECT 
    //     candidate.vsName AS fullName,
    //     candidate.vsContactNumber AS contactNumber,
    //     detail.vsEmail AS emailAddress,
    //     edu.vsDegree AS qualification,
    //     edu.fklQualificationId,
    //     detail.vsPermanentAddress AS area,
    //     detail.vsPermanentDistrict AS city,
    //     detail.vsPermanentState AS state,
    //     candidate.pklCandidateId
    // FROM 
    //     nw_jpms_candidates candidate
    // LEFT JOIN 
    //     nw_jpms_candidate_details detail ON candidate.pklCandidateId = detail.fklCandidateId
    // LEFT JOIN 
    //     (
    //         SELECT 
    //             fklCandidateId,
    //             vsDegree,
    //             fklQualificationId
    //         FROM 
    //             nw_jpms_candidate_edu_details edu1
    //         WHERE 
    //             dtUpdatedAt = (
    //                 SELECT MAX(dtUpdatedAt) 
    //                 FROM nw_jpms_candidate_edu_details edu2 
    //                 WHERE edu1.fklCandidateId = edu2.fklCandidateId
    //             )
    //     ) edu ON candidate.pklCandidateId = edu.fklCandidateId
    // WHERE
    //     candidate.vsContactNumber = ?;
    // `,
//     checkCandidatePortal:`
// WITH LatestEducation AS (
//     SELECT 
//         fklCandidateId,
//         vsDegree,
//         fklQualificationId,
//         dtUpdatedAt,
//         ROW_NUMBER() OVER (PARTITION BY fklCandidateId ORDER BY dtUpdatedAt DESC) AS rn
//     FROM 
//         nw_jpms_candidate_edu_details
// )
// SELECT 
//     candidate.vsName AS fullName,
//     candidate.vsContactNumber AS contactNumber,
//     detail.vsEmail AS emailAddress,
//     edu.vsDegree AS qualification,
//     edu.fklQualificationId,
//     detail.vsPermanentAddress AS area,
//     detail.vsPermanentDistrict AS city,
//     detail.vsPermanentState AS state,
//     candidate.pklCandidateId
// FROM 
//     nw_jpms_candidates candidate
// LEFT JOIN 
//     nw_jpms_candidate_details detail ON candidate.pklCandidateId = detail.fklCandidateId
// LEFT JOIN 
//     LatestEducation edu ON candidate.pklCandidateId = edu.fklCandidateId AND edu.rn = 1
// WHERE
//     candidate.vsContactNumber = ?;
// `,

    getAll:`SELECT 
    c.*, 
    q.vsQualification as qualification
    FROM 
    nw_jobmela_candidate_dtl c
    JOIN 
    nw_mams_qualification q 
    ON 
    c.fklqualificationId = q.pklQualificationId;`,

    totalCandidate:`SELECT COUNT(*) as total FROM nw_jobmela_candidate_dtl`,
    // totalCandidate:`SELECT COUNT(*) as total FROM nw_jobmela_candidate_apply`,
    totalCompany:`SELECT COUNT(*) as total FROM nw_jobmela_company_dtl`,
    allCompany:`SELECT registration_no, MIN(company_name) AS company_name, MIN(phone_no) AS phone_no, MIN(email) AS email, MIN(address) AS address
FROM nw_jobmela_company_dtl
GROUP BY registration_no;`,
    appliedApplicant:`select count(candidate_id)as appliedApplicant from ds.nw_jobmela_candidate_apply where status="APPLIED";`,
    appliedCandidate:`select count(distinct candidate_id)as appliedCandidate from ds.nw_jobmela_candidate_apply where status="APPLIED";`,
    selectedApplicant:`select count(candidate_id) as selectedApplicant from ds.nw_jobmela_candidate_apply where status="SELECTED";`,
    selectedCandidate:`select count(distinct candidate_id) as selectedCandidate from ds.nw_jobmela_candidate_apply where status="SELECTED";`,
    rejectedApplicant:`select count(candidate_id)as rejectedApplicant from ds.nw_jobmela_candidate_apply where status="REJECTED";`,
    rejectedCandidate:`select count(distinct candidate_id) as rejectedCandidate from ds.nw_jobmela_candidate_apply where status="REJECTED";`,
    qualification:`SELECT pklQualificationId,vsQualification FROM ds.nw_mams_qualification where pklQualificationId<9`,

    mela:`SELECT pklMelaId as sl_no, vsVenueName as venue_name 
        FROM nw_jobmela_mela_dtl 
        WHERE bActive = 1 AND (dtEndDate > CURDATE() OR dtEndDate IS NULL);`,

    melaInfo:`SELECT 
  pklMelaId AS melaId,
  vsVenueName AS venueName,
  vsAddress AS address,
  dtStartDate AS startDate,
  dtEndDate AS endDate,
  vsDistrict AS district,
  bActive AS isActive,
  iMaxCapacity AS maxCapacity,
  dtSlotStartTime AS slotStartTime,
  dtSlotEndTime AS slotEndTime,
  dtCreatedAt AS createdAt,
  dtUpdatedAt AS updatedAt,
  vsDescription AS melaDesc
FROM nw_jobmela_mela_dtl
WHERE bActive = 1 AND (dtEndDate > CURDATE() OR dtEndDate IS NULL);`,

    state:`SELECT pklStateId,vsStateName FROM nw_mams_state;`,
    district:`SELECT pklDistrictId,fklStateId,vsDistrictName FROM nw_mams_district;`,

    selectedCandidateAll:`SELECT
    c.auto_id,
    c.candidate_id,
    c.full_name,
    c.father_name,
    c.contact_number,
    c.email,
    q.vsQualification as qualification,
    c.dob,
    c.area,
    c.city,
    c.state,
    c.pin_code,
    c.registration_date,
    cs.selection_id,
    cs.job_id,
    cs.registration_no,
    cs.selection_date,
    cs.final_selection,
    cs.final_selection,
    j.post_name,
    -- j.min_qualification,
    j.vacancy

FROM
    nw_jobmela_candidate_selection cs
JOIN
    nw_jobmela_candidate_dtl c ON cs.candidate_id = c.candidate_id
JOIN
    nw_jobmela_job_details j ON cs.job_id = j.job_id
JOIN 
    nw_mams_qualification q ON c.fklqualificationId = q.pklQualificationId
WHERE
    cs.final_selection = '1'; -- Assuming 'Yes' indicates a placed candidate `,
    getJob:`SELECT 
            job.pklJobId AS job_id,
            job.vsPostName AS post_name,
            job.iVacancy AS vacancy,
            job.vsSelectionProcedure,
            job.fklMelaId AS fklmela_no,
            job.fklMinQalificationId AS min_fklqualificationId,

            entity.vsEntityName AS company_name,
            entity.pklEntityId AS fklEmployerId,
            emp.vsArea AS companyAddress,
            emp.vsPINCode AS companyPinCode,
            emp.dtModifiedDate AS createdAt,
            qual.vsQualification,
            applicant.fklCandidateId AS candidateId,
            basic.vsCertName as candidateName

            FROM nw_jobmela_applicant_dtl applicant

            INNER JOIN nw_jobmela_job_dtl job ON applicant.fklJobId = job.pklJobId
            LEFT JOIN nw_enms_entity entity ON job.fklEmployerId = entity.pklEntityId
            LEFT JOIN nw_emms_employer_details emp ON emp.fklENtityId = entity.pklEntityId
            LEFT JOIN nw_mams_qualification qual ON qual.pklQualificationId = job.fklMinQalificationId
            left join nw_candidate_basic_dtl basic on applicant.fklCandidateId = basic.pklCandidateId
            WHERE applicant.fklCandidateId = ?
            AND job.fklMelaId = ? `
}




module.exports=Query

