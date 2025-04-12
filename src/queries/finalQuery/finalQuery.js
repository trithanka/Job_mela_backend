const fQuery={
    
    pendingApplicant:`SELECT COUNT(*) AS count
    FROM ds.nw_jobmela_candidate_apply AS ca
    JOIN ds.nw_jobmela_job_details AS jd ON ca.job_id = jd.job_id
    WHERE ca.status = "APPLIED" AND jd.registration_no = ?;`,
    approveApplicant:`SELECT COUNT(*) AS count
    FROM ds.nw_jobmela_candidate_apply AS ca
    JOIN ds.nw_jobmela_job_details AS jd ON ca.job_id = jd.job_id
    WHERE ca.status = "SELECTED" AND jd.registration_no = ?;`,
    rejectApplicant:`SELECT COUNT(*) AS count
    FROM ds.nw_jobmela_candidate_apply AS ca
    JOIN ds.nw_jobmela_job_details AS jd ON ca.job_id = jd.job_id
    WHERE ca.status = "REJECTED" AND jd.registration_no = ?;`,
    totalApplicant:`SELECT COUNT(*) AS count
    FROM ds.nw_jobmela_candidate_apply AS ca
    JOIN ds.nw_jobmela_job_details AS jd ON ca.job_id = jd.job_id
    WHERE jd.registration_no = ?;`,
    /////////////////////////////////////////////////////////////
    pendingApplicantAll:`SELECT COUNT(*) AS count
    FROM ds.nw_jobmela_candidate_apply AS ca
    JOIN ds.nw_jobmela_job_details AS jd ON ca.job_id = jd.job_id
    WHERE ca.status = "APPLIED" ;`,
    approveApplicantAll:`SELECT COUNT(*) AS count
    FROM ds.nw_jobmela_candidate_apply AS ca
    JOIN ds.nw_jobmela_job_details AS jd ON ca.job_id = jd.job_id
    WHERE ca.status = "SELECTED" ;`,
    rejectApplicantAll:`SELECT COUNT(*) AS count
    FROM ds.nw_jobmela_candidate_apply AS ca
    JOIN ds.nw_jobmela_job_details AS jd ON ca.job_id = jd.job_id
    WHERE ca.status = "REJECTED" ;`,
    totalApplicantAll:`SELECT COUNT(*) AS count
    FROM ds.nw_jobmela_candidate_apply AS ca
    JOIN ds.nw_jobmela_job_details AS jd ON ca.job_id = jd.job_id;`,

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
    `,

    getByCompany:`with ct AS (
        select app.apply_id,
        app.candidate_id,
        app.job_id,
        app.status,
        can.full_name,
        can.contact_number,
        q.vsQualification as qualification,
        can.registration_date,
        can.email
        from nw_jobmela_candidate_apply AS app
        INNER JOIN nw_jobmela_candidate_dtl as can
        on app.candidate_id = can.candidate_id
        JOIN 
            nw_mams_qualification q 
        ON 
            can.fklqualificationId = q.pklQualificationId
        where app.status="APPLIED"
        )
        
        select 
        ct.apply_id,
        ct.candidate_id,
        ct.full_name,
        ct.status,
        ct.contact_number,
        ct.qualification,
        ct.registration_date,
        ct.email,
        ct.job_id,
        job.post_name,
        com.company_name,
        com.registration_no,
        job.fkl_Company_slno
        from ct 
        INNER JOIN nw_jobmela_job_details as job
        ON ct.job_id = job.job_id
        join 
            nw_jobmela_company_dtl com on job.fkl_Company_slno=com.sl_no
        `,
    
    getAllCompany:`with ct AS (
        select app.apply_id,
        app.candidate_id,
        app.job_id,
        app.status,
        can.full_name,
        can.contact_number,
        q.vsQualification as qualification,
        can.registration_date,
        can.email 
        from nw_jobmela_candidate_apply AS app
        INNER JOIN nw_jobmela_candidate_dtl as can
        on app.candidate_id = can.candidate_id
        JOIN 
            nw_mams_qualification q 
        ON 
            can.fklqualificationId = q.pklQualificationId
        where app.status="APPLIED"
        )
        
        select 
        ct.apply_id,
        ct.full_name,
        ct.status,
        ct.contact_number,
        ct.qualification,
        ct.registration_date,
        ct.email,
        ct.job_id,
        job.post_name,
        job.registration_no
        from ct 
        INNER JOIN nw_jobmela_job_details as job
        ON ct.job_id = job.job_id`,

    updateStatus:`UPDATE nw_jobmela_candidate_apply
    SET status = ?, update_date = CURDATE()
    WHERE apply_id = ?;
    `,
    
    statusR:`select status from nw_jobmela_candidate_apply where apply_id=?`,
    getApplicationById:`
        SELECT 
        ca.candidate_id, 
        ca.job_id, 
        cmp.sl_no
        FROM 
        ds.nw_jobmela_candidate_apply ca
        join
            nw_jobmela_job_details jd on ca.job_id=jd.job_id
        join
            nw_jobmela_company_dtl cmp on jd.fkl_Company_slno=cmp.sl_no
        WHERE apply_id =?;
    `,
    getByCandidate:`SELECT 
    ca.apply_id,
    ca.candidate_id,
    cd.full_name,
    cd.father_name,
    cd.contact_number,
    cd.email,
    q.vsQualification as qualification,
    cd.dob,
    cd.registration_date,
    jd.post_name,
    mq.vsQualification as min_qualification,
    ca.status,
    ca.application_date,
    cmp.company_name,
    jd.job_id,
    cmp.registration_no
    FROM 
        nw_jobmela_candidate_apply ca
    JOIN 
        nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
    JOIN 
        nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
    JOIN 
        nw_jobmela_job_details jd ON ca.job_id = jd.job_id
    JOIN 
        nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
    join
        nw_jobmela_company_dtl cmp on jd.registration_no=cmp.registration_no
    WHERE 
        ca.candidate_id = ?;`,
    countAll:`
    SELECT COUNT(*) AS total
    FROM 
        nw_jobmela_candidate_apply ca
    JOIN 
        nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
    JOIN 
        nw_jobmela_job_details jd ON ca.job_id = jd.job_id
    JOIN 
        nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
    JOIN 
        nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
    JOIN
        nw_jobmela_company_dtl cmp ON jd.fkl_Company_slno = cmp.sl_no
    LEFT JOIN 
        nw_jobmela_mela_dtl mela ON cmp.fklmela_no = mela.sl_no
    WHERE 
        cmp.phone_no = ?;
    `,
    countPending:`
    SELECT COUNT(*) AS total
    FROM 
        nw_jobmela_candidate_apply ca
    JOIN 
        nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
    JOIN 
        nw_jobmela_job_details jd ON ca.job_id = jd.job_id
    JOIN 
        nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
    JOIN 
        nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
    JOIN
        nw_jobmela_company_dtl cmp ON jd.fkl_Company_slno = cmp.sl_no
    LEFT JOIN 
        nw_jobmela_mela_dtl mela ON cmp.fklmela_no = mela.sl_no
    WHERE 
        ca.status="APPLIED" and cmp.phone_no = ?;
    `,
    countReject:`
    SELECT COUNT(*) AS total
    FROM 
        nw_jobmela_candidate_apply ca
    JOIN 
        nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
    JOIN 
        nw_jobmela_job_details jd ON ca.job_id = jd.job_id
    JOIN 
        nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
    JOIN 
        nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
    JOIN
        nw_jobmela_company_dtl cmp ON jd.fkl_Company_slno = cmp.sl_no
    LEFT JOIN 
        nw_jobmela_mela_dtl mela ON cmp.fklmela_no = mela.sl_no
    WHERE 
        ca.status="REJECTED" and cmp.phone_no = ?;
    `,
    countApproved:`
    SELECT COUNT(*) AS total
    FROM 
        nw_jobmela_candidate_apply ca
    JOIN 
        nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
    JOIN 
        nw_jobmela_job_details jd ON ca.job_id = jd.job_id
    JOIN 
        nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
    JOIN 
        nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
    JOIN
        nw_jobmela_company_dtl cmp ON jd.fkl_Company_slno = cmp.sl_no
    LEFT JOIN 
        nw_jobmela_mela_dtl mela ON cmp.fklmela_no = mela.sl_no
    WHERE 
        ca.status = "SELECTED" and cmp.phone_no = ?;
    `,
    getAllCandidate:`SELECT 
    ca.apply_id,
    ca.candidate_id,
    cd.full_name,
    cd.contact_number,
    cd.email,
    q.vsQualification as qualification,
    cd.dob,
    cd.registration_date,
    jd.post_name,
    mq.vsQualification as min_qualification,
    ca.status,
    ca.application_date,
    cmp.company_name,
    jd.job_id,
    cmp.registration_no,
    mela.venue_name
    FROM 
        nw_jobmela_candidate_apply ca
    JOIN 
        nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
    JOIN 
        nw_jobmela_job_details jd ON ca.job_id = jd.job_id
    JOIN 
        nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
    JOIN 
        nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
    join
        nw_jobmela_company_dtl cmp on jd.fkl_Company_slno=cmp.sl_no

    left join nw_jobmela_mela_dtl mela on cmp.fklmela_no=mela.sl_no
    where cmp.phone_no= ? 
    `,
    getAllApprovedCandidate:`
SELECT 
    ca.apply_id,
    ca.candidate_id,
    cd.full_name,
    cd.contact_number,
    cd.email,
    q.vsQualification as qualification,
    cd.dob,
    cd.registration_date,
    jd.post_name,
    mq.vsQualification as min_qualification,
    ca.status,
    ca.application_date,
    cmp.company_name,
    jd.job_id,
    cmp.registration_no,
    mela.venue_name
FROM 
    nw_jobmela_candidate_apply ca
JOIN 
    nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
JOIN 
    nw_jobmela_job_details jd ON ca.job_id = jd.job_id
JOIN
    nw_jobmela_company_dtl cmp ON jd.fkl_Company_slno = cmp.sl_no
JOIN 
    nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
JOIN 
    nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
left join nw_jobmela_mela_dtl mela on cmp.fklmela_no=mela.sl_no
LEFT JOIN 
    (
        SELECT candidate_id
        FROM nw_jobmela_candidate_selection
        WHERE final_selection = 1
        GROUP BY candidate_id
    ) sel ON ca.candidate_id = sel.candidate_id
WHERE
    ca.status = "SELECTED" AND cmp.phone_no=? AND sel.candidate_id IS NULL

`,

    getAllPendingCandidate:`SELECT 
    ca.apply_id,
    ca.candidate_id,
    cd.full_name,
    cd.contact_number,
    cd.email,
    q.vsQualification as qualification,
    cd.dob,
    cd.registration_date,
    jd.post_name,
    mq.vsQualification as min_qualification,
    ca.status,
    ca.application_date,
    cmp.company_name,
    jd.job_id,
    cmp.registration_no,
    mela.venue_name
    FROM 
        nw_jobmela_candidate_apply ca
    JOIN 
        nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
    JOIN 
        nw_jobmela_job_details jd ON ca.job_id = jd.job_id
    join
        nw_jobmela_company_dtl cmp on jd.fkl_Company_slno=cmp.sl_no
    JOIN 
        nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
    JOIN 
        nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
    left join nw_jobmela_mela_dtl mela on cmp.fklmela_no=mela.sl_no
    where
    ca.status="APPLIED" and cmp.phone_no= ?
    `,
    getAllRejectedCandidate:`SELECT 
    ca.apply_id,
    ca.candidate_id,
    cd.full_name,
    cd.contact_number,
    cd.email,
    q.vsQualification as qualification,
    cd.dob,
    cd.registration_date,
    jd.post_name,
    mq.vsQualification as min_qualification,
    ca.status,
    ca.application_date,
    cmp.company_name,
    jd.job_id,
    cmp.registration_no,
    mela.venue_name
    FROM 
        nw_jobmela_candidate_apply ca
    JOIN 
        nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
    JOIN 
        nw_jobmela_job_details jd ON ca.job_id = jd.job_id
    join
        nw_jobmela_company_dtl cmp on jd.fkl_Company_slno=cmp.sl_no
    JOIN 
        nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
    JOIN 
        nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
    left join nw_jobmela_mela_dtl mela on cmp.fklmela_no=mela.sl_no
    where
    ca.status="REJECTED" and cmp.phone_no= ?`,
    joined:`SELECT 
    ca.apply_id,
    ca.candidate_id,
    cd.full_name,
    cd.contact_number,
    cd.email,
    q.vsQualification as qualification,
    cd.dob,
    cd.registration_date,
    jd.post_name,
    mq.vsQualification as min_qualification,
    ca.status,
    ca.application_date,
    cmp.company_name,
    jd.job_id,
    cmp.registration_no
    FROM 
        nw_jobmela_candidate_apply ca
    JOIN 
        nw_jobmela_candidate_dtl cd ON ca.candidate_id = cd.candidate_id
    JOIN 
        nw_jobmela_job_details jd ON ca.job_id = jd.job_id
    join
        nw_jobmela_company_dtl cmp on jd.registration_no=cmp.registration_no
    JOIN 
        nw_mams_qualification q ON cd.fklqualificationId = q.pklQualificationId
    JOIN 
        nw_mams_qualification mq ON jd.min_fklqualificationId = mq.pklQualificationId
    JOIN
        nw_jobmela_candidate_selection sel on ca.candidate_id=sel.candidate_id
    where
    sel.final_selection=1 and cmp.phone_no= ?`,

    viewStatus:`SELECT 
    c.company_name,
    j.post_name,
    cdt.full_name,
    cdt.father_name,
    cdt.dob,
    a.candidate_id,
    cs.final_selection,
    a.job_id,
    cs.selection_date,
    a.status,
    cs.selection_id
    FROM 
        nw_jobmela_candidate_apply a
    INNER JOIN 
        nw_jobmela_job_details j ON a.job_id = j.job_id
    INNER JOIN 
        nw_jobmela_company_dtl c ON j.registration_no = c.registration_no
    INNER JOIN 
        nw_jobmela_candidate_dtl cdt ON a.candidate_id = cdt.candidate_id
    LEFT JOIN 
        nw_jobmela_candidate_selection cs ON a.candidate_id = cs.candidate_id AND a.job_id = cs.job_id
    WHERE 
        a.candidate_id = ?
        AND a.status = ?
        AND j.registration_no = ?;`,
    statusF:`update nw_jobmela_candidate_selection
    set final_selection=? where job_id=? AND 
    candidate_id=?
    `,
    showStatus:`select final_selection from nw_jobmela_candidate_selection where job_id=? AND 
    candidate_id=? `

}

module.exports=fQuery