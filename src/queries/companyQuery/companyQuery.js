const cQuery = {
    checkCom:`SELECT COUNT(*) as count FROM nw_jobmela_company_dtl WHERE registration_no = ? AND fklmela_no = ?;`,
    checkVerified:`SELECT isVarified FROM nw_jobmela_company_dtl WHERE fklEmployerId = ? AND fklmela_no = ?  AND isVarified = 1;`,

    getCompanyById: `SELECT * FROM nw_jpms_employers WHERE vsPhoneNumber = ?`,
    check: `SELECT * FROM nw_jpms_employers WHERE vsPhoneNumber = ? and isVarified=1`,
    addCompany: `
        INSERT INTO ds.nw_jobmela_company_dtl (company_name, registration_no, phone_no, email, address, fklmela_no,fklEmployerId)
        VALUES (?, ?, ?, ?, ?, ?,?)
    `,
    com_sl:`select sl_no from nw_jobmela_company_dtl where registration_no=? and fklmela_no=?`,

    updateCompany:`UPDATE nw_jobmela_company_dtl SET company_name = ?, phone_no = ?, email = ?, address = ?, fklmela_no=? WHERE registration_no = ?`,
    getCompany:`select 
    pklEmployerId,
	vsName as company_name,
    vsCRN as registration_no,
    vsPhoneNumber as phone_no,
    vsEmail as email,
    vsAddress as address,
    isVarified as isVarified
from nw_jpms_employers 
where vsPhoneNumber=? and isVarified=1`,
    comData:`SELECT 
    c.company_name,
    c.registration_no,
    c.sl_no,
    c.phone_no,
    c.email,
    c.address,
    c.fklmela_no,
    j.job_id,
    mela.venue_name,
    mas.vsQualification as min_qualification,
    j.min_fklqualificationId,
    j.vacancy,
    j.post_name
    FROM 
        nw_jobmela_company_dtl c
    LEFT JOIN 
        nw_jobmela_job_details j ON c.sl_no = j.fkl_Company_slno
    join
        nw_mams_qualification mas on j.min_fklqualificationId=mas.pklQualificationId
	join
		nw_jobmela_mela_dtl mela on c.fklmela_no=mela.sl_no
    WHERE 
        c.sl_no =  ?;`,
    addJob:`INSERT INTO nw_jobmela_job_details (fkl_Company_slno, min_fklqualificationId, vacancy, post_name)
    VALUES (?,?,?,?);`,
    deleteJobsByCompany: `DELETE FROM nw_jobmela_job_details WHERE registration_no = ?`,


    getAllCompanies: `
        SELECT c.*,m.venue_name FROM ds.nw_jobmela_company_dtl c
left join
	ds.nw_jobmela_mela_dtl m on c.fklmela_no=m.sl_no
    `,
    getJobportal:`
    select 
    com.pklEmployerId,
	com.vsName as company_name,
    com.vsSectors,
    com.vsDescription,
    com.iTurnover as Turnover,
    com.vsSpoc as spocName,
    com.vsContactNumber as spocContactNo,
    com.vsEmailAddress as spocEmaail,
    com.vsCRN as registration_no,
    com.vsPhoneNumber as phone_no,
    com.vsEmail as email,
    com.vsAddress as address,
    CASE
        WHEN isVarified = 1 THEN 'Verified'
        WHEN isVarified = 0 THEN 'Rejected'
        ELSE 'Null' -- Optional, for handling other values or nulls
    END as isVarified,
    com.remarks,
    com.verifiedAt as verify_date
    from nw_jpms_employers com
    where com.vsPhoneNumber=?
    `,
    jobDetails:`
    SELECT
    c.fklmela_no,
    mela.venue_name,
    mela.start_date,
    mela.end_date,
    GROUP_CONCAT(
        CONCAT(
            '{',
            '"job_id":', j.job_id,
            ',"min_qualification":"', mas.vsQualification,
            '","min_fklqualificationId":', j.min_fklqualificationId,
            ',"vacancy":', j.vacancy,
            ',"post_name":"', j.post_name,
            '"}'
        )
        ORDER BY j.job_id SEPARATOR ','
    ) AS job
FROM 
    nw_jobmela_company_dtl c
LEFT JOIN 
    nw_jobmela_job_details j ON c.sl_no = j.fkl_Company_slno
JOIN
    nw_mams_qualification mas ON j.min_fklqualificationId = mas.pklQualificationId
JOIN
    nw_jobmela_mela_dtl mela ON c.fklmela_no = mela.sl_no
WHERE 
    c.phone_no = ?
GROUP BY 
    c.fklmela_no, mela.venue_name;
    `,
    // jobDetails:`
    // select
    // c.fklmela_no,
    // j.job_id,
    // mela.venue_name,
    // mas.vsQualification as min_qualification,
    // j.min_fklqualificationId,
    // j.vacancy,
    // j.post_name
    // FROM 
    //     nw_jobmela_company_dtl c
    // LEFT JOIN 
    //     nw_jobmela_job_details j ON c.sl_no = j.fkl_Company_slno
    // join
    //     nw_mams_qualification mas on j.min_fklqualificationId=mas.pklQualificationId
	// join
	// 	nw_jobmela_mela_dtl mela on c.fklmela_no=mela.sl_no
    // WHERE c.phone_no=?
    // `,
    getCompanies: `
        SELECT 
    c.company_name,
    c.registration_no,
    c.phone_no,
    c.email,
    c.address,
    c.fklmela_no,
    j.job_id,
    mela.venue_name,
    mas.vsQualification as min_qualification,
    j.min_fklqualificationId,
    j.vacancy,
    j.post_name
    FROM 
        nw_jobmela_company_dtl c
    LEFT JOIN 
        nw_jobmela_job_details j ON c.sl_no = j.fkl_Company_slno
    join
        nw_mams_qualification mas on j.min_fklqualificationId=mas.pklQualificationId
	join
		nw_jobmela_mela_dtl mela on c.fklmela_no=mela.sl_no
    WHERE c.phone_no=?
    `,
    getbyRegNo:`SELECT c.company_name, c.registration_no, c.phone_no, c.email, c.address, 
    j.min_qualification, j.vacancy, j.post_name
    FROM ds.nw_jobmela_company_dtl c
    JOIN ds.nw_jobmela_job_details j ON c.registration_no = j.registration_no
    WHERE c.registration_no = ?;
`
};

module.exports = cQuery;

