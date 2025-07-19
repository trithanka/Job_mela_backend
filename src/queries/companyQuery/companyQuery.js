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
    mela.vsVenueName as venue_name,
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
		nw_jobmela_mela_dtl mela on c.fklmela_no=mela.pklMelaId
    WHERE 
        c.sl_no =  ?;`,
    addJob:`INSERT INTO nw_jobmela_job_details (fkl_Company_slno, min_fklqualificationId, vacancy, post_name)
    VALUES (?,?,?,?);`,
    deleteJobsByCompany: `DELETE FROM nw_jobmela_job_details WHERE registration_no = ?`,


    getAllCompanies: `
        SELECT
            entity.pklEntityId,
            ANY_VALUE(entity.vsEntityName) AS companyName,
            ANY_VALUE(entity.fklRoleId) AS roleId,
            ANY_VALUE(entity.vsEmail1) AS companyEmail,
            ANY_VALUE(entity.vsMobile1) AS companyMobile,
            ANY_VALUE(entity.fklOrganizationTypeId) AS organizationTypeId,
            ANY_VALUE(orgType.vsOrganizationTypeName) AS organizationTypeName,
            ANY_VALUE(login.vsLoginName) AS userName,
            ANY_VALUE(emp.fklEmployerType) AS empTypeId,
            ANY_VALUE(empType.vsEmployerType) AS empTypeName,
            ANY_VALUE(emp.vsArea) AS companyAddress,
            ANY_VALUE(emp.vsPINCode) AS companyPinCode,
            ANY_VALUE(emp.dtModifiedDate) AS createdAt,
            ANY_VALUE(emp.vsOrganisationDescription) AS comDesc,
            MAX(jobmela.fklMelaid) AS latestMelaId,
            count(distinct jobmela.fklMelaId) as melaCount,
            GROUP_CONCAT(DISTINCT jobmela.vsSelectionProcedure) AS selectionProcedure
    FROM nw_enms_entity entity 
            LEFT JOIN nw_mams_organization_type orgType 
                ON entity.fklOrganizationTypeId = orgType.pklOrganizationTypeId
            LEFT JOIN nw_loms_login login 
                ON entity.fklLoginId = login.pklLoginId
            LEFT JOIN nw_emms_employer_details emp 
                ON entity.pklEntityId = emp.fklENtityId
            LEFT JOIN nw_mams_employer_type empType 
                ON emp.fklEmployerType = empType.pklEmployerId
            INNER JOIN nw_jobmela_job_dtl jobmela 
                ON entity.pklEntityId = jobmela.fklEmployerId
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
            job.pklJobId AS job_id,
            job.vsPostName AS post_name,
            job.iVacancy AS vacancy,
            job.vsSelectionProcedure,
            job.fklMelaId AS fklmela_no,
            job.fklMinQalificationId as min_fklqualificationId,
            mela.vsVenueName,
            qual.vsQualification,
            entity.vsEntityName AS company_name,
            entity.pklEntityId AS fklEmployerId,
            emp.vsArea AS companyAddress,
            emp.vsPINCode AS companyPinCode,
            emp.dtModifiedDate AS createdAt,
            pd.participation_dates,
            COUNT(DISTINCT applicant.pklApplicantId) AS total_applicants

            FROM nw_jobmela_job_dtl job

            LEFT JOIN nw_enms_entity entity 
            ON job.fklEmployerId = entity.pklEntityId

            LEFT JOIN nw_emms_employer_details emp 
            ON emp.fklENtityId = entity.pklEntityId

            LEFT JOIN nw_mams_qualification qual 
            ON qual.pklQualificationId = job.fklMinQalificationId

            LEFT JOIN nw_jobmela_mela_dtl mela 
            ON job.fklMelaId = mela.pklMelaId

            -- ✅ Subquery joined here to avoid duplicate dates
            LEFT JOIN (
            SELECT 
                fklJobID, 
                GROUP_CONCAT(DISTINCT DATE_FORMAT(dtParticipationDate, '%Y-%m-%d') ORDER BY dtParticipationDate SEPARATOR ', ') AS participation_dates
            FROM nw_jobmela_company_day_map
            GROUP BY fklJobID
            ) pd ON pd.fklJobID = job.pklJobId

            LEFT JOIN nw_jobmela_applicant_dtl applicant 
            ON job.pklJobId = applicant.fklJobId

            WHERE entity.vsMobile1 = ?
            GROUP BY 
            job.pklJobId,
            job.vsPostName,
            job.iVacancy,
            job.vsSelectionProcedure,
            job.fklMelaId,
            job.fklMinQalificationId,
            mela.vsVenueName,
            qual.vsQualification,
            entity.vsEntityName,
            entity.pklEntityId,
            emp.vsArea,
            emp.vsPINCode,
            emp.dtModifiedDate,
            pd.participation_dates `,
    getCompanies: `
        SELECT 
    c.company_name,
    c.registration_no,
    c.phone_no,
    c.email,
    c.address,
    c.fklmela_no,
    j.job_id,
    mela.vsVenueName as venue_name,
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
		nw_jobmela_mela_dtl mela on c.fklmela_no=mela.pklMelaId
    WHERE c.phone_no=?
    `,
    getbyRegNo:`SELECT c.company_name, c.registration_no, c.phone_no, c.email, c.address, 
    j.min_qualification, j.vacancy, j.post_name
    FROM ds.nw_jobmela_company_dtl c
    JOIN ds.nw_jobmela_job_details j ON c.registration_no = j.registration_no
    WHERE c.registration_no = ?;`,
    insertJobQuery:`INSERT INTO nw_jobmela_job_dtl (fklEmployerId, iVacancy, vsPostName, fklMinQalificationId, iInterviewDurationMin, dtInterviewStartTime, dtInterviewEndTime,vsSelectionProcedure, fklMelaId, dtCreatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?,?, ?, NOW())`,
    insertParticipationQuery:`INSERT INTO nw_jobmela_company_day_map (fklJobId, dtParticipationDate,dtCreatedAt)
    VALUES (?, ?, NOW())`
};

module.exports = cQuery;

