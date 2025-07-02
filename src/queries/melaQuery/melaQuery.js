const QueryM={
    addMela: `INSERT INTO nw_jobmela_mela_dtl (venue_name, address, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)`,

    getMelas: `SELECT * FROM nw_jobmela_mela_dtl where 1=1 and pklMelaId = ? `,

    getAllMelas: `SELECT * FROM nw_jobmela_mela_dtl where 1=1 and bActive = 1`,

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

    jobDetails: `SELECT c.*,m.vsVenueName , emp.vsDescription as comDesc ,job.post_name, job.job_id, job.vacancy ,job.vsSelectionProcedure, qual.vsQualification,job.min_fklqualificationId
        ,m.vsDistrict as district,m.dtStartDate as start_date,m.dtEndDate as end_date
    FROM ds.nw_jobmela_company_dtl c
	left join ds.nw_jobmela_mela_dtl m on c.fklmela_no=m.pklMelaId
    left join nw_jpms_employers emp on c.fklEmployerId = emp.pklEmployerId
    left join nw_jobmela_job_details job on c.sl_no = job.fkl_Company_slno
    left join nw_mams_qualification qual on qual.pklQualificationId = job.min_fklqualificationId
    where 1=1 and c.fklmela_no = ?`,

    candidateDetails: `SELECT 
  c.*, 
  m.vsVenueName , 
  emp.vsDescription AS comDesc,
  job.post_name, 
  job.job_id, 
  job.vacancy,
  job.vsSelectionProcedure, 
  qual.vsQualification,
  job.min_fklqualificationId,
  m.vsDistrict AS district,
  m.dtStartDate AS start_date,
  m.dtEndDate AS end_date,
  applicant.fklCandidateId as candidateId,
  -- 1. Applied Flag
  CASE 
    WHEN applicant.pklApplicantId IS NOT NULL THEN 1
    ELSE 0
  END AS isApplied,

  -- 2. Eligibility Flag
  CASE 
    WHEN job.min_fklqualificationId IS NULL THEN 1
    WHEN job.min_fklqualificationId <= cand_qual.fklQualificationId THEN 1
    ELSE 0
  END AS isEligible

FROM ds.nw_jobmela_company_dtl c
LEFT JOIN ds.nw_jobmela_mela_dtl m 
  ON c.fklmela_no = m.pklMelaId
LEFT JOIN nw_jpms_employers emp 
  ON c.fklEmployerId = emp.pklEmployerId
LEFT JOIN nw_jobmela_job_details job 
  ON c.sl_no = job.fkl_Company_slno
LEFT JOIN nw_mams_qualification qual 
  ON qual.pklQualificationId = job.min_fklqualificationId
LEFT JOIN nw_jobmela_applicant_dtl applicant 
  ON job.job_id = applicant.fklJobId 
 AND applicant.fklCandidateId = ?
LEFT JOIN ds.nw_candidate_qualification_dtl cand_qual 
  ON cand_qual.fklCandidateId = ?
LEFT JOIN ds.nw_candidate_basic_dtl cand_basic 
  ON cand_basic.pklCandidateId = cand_qual.fklCandidateId

WHERE c.fklmela_no = ?;
`,
    }

module.exports=QueryM