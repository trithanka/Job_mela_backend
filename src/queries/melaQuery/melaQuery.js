const QueryM={
    addMela: `INSERT INTO nw_jobmela_mela_dtl (venue_name, address, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)`,

    getMelas: `SELECT * FROM nw_jobmela_mela_dtl where 1=1 and pklMelaId = ? `,

    companyQ:`SELECT 
    c.company_name,
    c.registration_no,
    c.phone_no,
    c.email,
    c.address,
    c.fklmela_no,
    mela.vsVenueName as venue_name
    FROM 
        nw_jobmela_company_dtl c
	join
		nw_jobmela_mela_dtl mela on c.fklmela_no=mela.pklMelaId
    WHERE 
        c.fklmela_no = ?;`,
    
    updateMelaStatus: `UPDATE nw_jobmela_mela_dtl SET bActive = ? WHERE pklMelaId = ?`,

    jobDetails: `SELECT c.*,m.vsVenueName as venue_name, emp.vsDescription as comDesc ,job.post_name, job.job_id, job.vacancy ,job.vsSelectionProcedure, qual.vsQualification,job.min_fklqualificationId
        ,m.vsDistrict as district,m.dtStartDate as start_date,m.dtEndDate as end_date
    FROM ds.nw_jobmela_company_dtl c
	left join ds.nw_jobmela_mela_dtl m on c.fklmela_no=m.pklMelaId
    left join nw_jpms_employers emp on c.fklEmployerId = emp.pklEmployerId
    left join nw_jobmela_job_details job on c.sl_no = job.fkl_Company_slno
    left join nw_mams_qualification qual on qual.pklQualificationId = job.min_fklqualificationId
    where 1=1 and c.fklmela_no = ?`,
}

module.exports=QueryM