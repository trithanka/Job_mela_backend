const QueryM={
    addMela: `INSERT INTO nw_jobmela_mela_dtl (venue_name, address, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)`,

    getMelas: `SELECT 
            mela.*, 
            COUNT(applicant.pklApplicantId) AS totalParticipent 
          FROM nw_jobmela_mela_dtl mela
          LEFT JOIN nw_jobmela_applicant_dtl applicant 
            ON mela.pklMelaId = applicant.fklMelaId
          WHERE mela.pklMelaId = ?
          GROUP BY mela.pklMelaId `,

    getAllMelas: `SELECT mela.* ,
          count(distinct job.fklEmployerId) as companyCount
          FROM nw_jobmela_mela_dtl mela 
          left join nw_jobmela_job_dtl job on job.fklMelaId=mela.pklMelaId
          where 1=1 and mela.bActive = 1 `,

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

  //   jobDetails: `SELECT c.*,m.vsVenueName , emp.vsDescription as comDesc ,job.post_name, job.job_id, job.vacancy ,job.vsSelectionProcedure, qual.vsQualification,job.min_fklqualificationId
  //       ,m.vsDistrict as district,m.dtStartDate as start_date,m.dtEndDate as end_date
  //   FROM ds.nw_jobmela_company_dtl c
	// left join ds.nw_jobmela_mela_dtl m on c.fklmela_no=m.pklMelaId
  //   left join nw_jpms_employers emp on c.fklEmployerId = emp.pklEmployerId
  //   left join nw_jobmela_job_details job on c.sl_no = job.fkl_Company_slno
  //   left join nw_mams_qualification qual on qual.pklQualificationId = job.min_fklqualificationId
  //   where 1=1 and c.fklmela_no = ?`,
jobDetails: `SELECT 
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

WHERE job.fklMelaId = ?	

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
  pd.participation_dates;
`,
candidateDetails: `SELECT 
  job.pklJobId AS job_id,
  job.vsPostName AS post_name,
  job.iVacancy AS vacancy,
  job.vsSelectionProcedure,
  job.fklMelaId AS fklmela_no,
  job.fklMinQalificationId as min_fklqualificationId,
  
  entity.vsEntityName AS company_name,
  entity.pklEntityId AS fklEmployerId,
  emp.vsArea AS companyAddress,
  emp.vsPINCode AS companyPinCode,
  emp.dtModifiedDate AS createdAt,

  qual.vsQualification,
  applicant.fklCandidateId AS candidateId,
  pd.participation_dates,
   COUNT(DISTINCT applicant.pklApplicantId) AS total_applicants,

  -- 1. Applied Flag
  CASE 
    WHEN applicant.pklApplicantId IS NOT NULL THEN 1
    ELSE 0
  END AS isApplied,

  -- 2. Eligibility Flag
  CASE 
    WHEN job.fklMinQalificationId IS NULL THEN 1
    WHEN job.fklMinQalificationId <= cand_qual.fklQualificationId THEN 1
    ELSE 0
  END AS isEligible

FROM nw_jobmela_job_dtl job

LEFT JOIN nw_enms_entity entity 
  ON job.fklEmployerId = entity.pklEntityId

LEFT JOIN nw_emms_employer_details emp 
  ON emp.fklENtityId = entity.pklEntityId

LEFT JOIN nw_mams_qualification qual 
  ON qual.pklQualificationId = job.fklMinQalificationId

LEFT JOIN nw_jobmela_applicant_dtl applicant 
  ON applicant.fklJobId = job.pklJobId 
 AND applicant.fklCandidateId = ?

LEFT JOIN ds.nw_candidate_qualification_dtl cand_qual 
  ON cand_qual.fklCandidateId = ?

LEFT JOIN ds.nw_candidate_basic_dtl cand_basic 
  ON cand_basic.pklCandidateId = cand_qual.fklCandidateId

  LEFT JOIN (
  SELECT 
    fklJobID, 
    GROUP_CONCAT(DISTINCT DATE_FORMAT(dtParticipationDate, '%Y-%m-%d') ORDER BY dtParticipationDate SEPARATOR ', ') AS participation_dates
  FROM nw_jobmela_company_day_map
  GROUP BY fklJobID
) pd ON pd.fklJobID = job.pklJobId

WHERE job.fklMelaId = ?
GROUP BY
  job.pklJobId,
  job.vsPostName,
  job.iVacancy,
  job.vsSelectionProcedure,
  job.fklMelaId,
  job.fklMinQalificationId,
  entity.vsEntityName,
  entity.pklEntityId,
  emp.vsArea,
  emp.vsPINCode,
  emp.dtModifiedDate,
  qual.vsQualification,
  applicant.fklCandidateId,
  pd.participation_dates,
  isApplied,
  isEligible
;`
}

module.exports=QueryM