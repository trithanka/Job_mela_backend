const uQuery={
    lastInterviewTime:`select 
            MAX(applicant.dtInterviewDateTime) as lastInterviewTime
        from nw_jobmela_applicant_dtl applicant
        where applicant.fklJobId =? `,
    availableJob:`select 
            job.pkljobId as jobId ,
            job.vsPostName,
            job.fklEmployerId as companyId,
            jobday.dtParticipationDate as participationDays,
            job.dtInterviewStartTime as interviewStartTime,
            job.iInterviewDurationMin as interviewDurationMin,
            job.dtInterviewEndTime as interviewEndTime
        from nw_jobmela_job_dtl job
        left join nw_jobmela_company_day_map jobday on job.pklJobId=jobday.fklJobId
        left join nw_jobmela_applicant_dtl applicant on applicant.fklJobId =job.pklJobId
        where job.fklMelaId = ? and applicant.fklCandidateId = ? and jobday.dtParticipationDate=? and applicant.dtCheckInTime is null;`,
    getAdmin:`select * from nw_jobmela_admin where username=? and bActive=1`,
    appliedCan:`
    SELECT 
            app.apply_id,
            can.candidate_id,
            can.full_name,
            app.status,
            can.contact_number,
            q.vsQualification AS qualification,
            can.registration_date,
            can.email,
            app.job_id,
            job.post_name,
            com.company_name,
            com.registration_no,
            app.application_date,
            job.fkl_Company_slno,
            m.venue_name,
            m.sl_no
        FROM 
            nw_jobmela_candidate_dtl AS can
        JOIN 
            nw_jobmela_candidate_apply AS app ON can.candidate_id = app.candidate_id
        left JOIN 
            nw_mams_qualification q ON can.fklqualificationId = q.pklQualificationId
        left JOIN 
            nw_jobmela_job_details AS job ON app.job_id = job.job_id
        left JOIN 
            nw_jobmela_company_dtl AS com ON job.fkl_Company_slno = com.sl_no
        join nw_jobmela_mela_dtl as m on can.fklmela_no=m.sl_no
        where can.fklmela_no=?
    `,
    allCandidate:`
        SELECT DISTINCT
    basic.vsFirstName AS firstName,
    basic.vsMiddleName AS middleName,
    basic.vsLastName AS lastName,
    basic.vsCertName as fullName,
    basic.dtDOB AS dob,
    basic.vsGender AS gender,
    religion.vsReligionName AS religion,
    caste.vsCasteName AS caste,
    qual.vsQualification AS qualification,
    contact.vsPrimaryMobileNo AS mobile,
    basic.pklCandidateId AS candidateId,
    job.fklMelaId AS melaId,
    mela.vsVenueName as melaName
FROM nw_jobmela_applicant_dtl applicant
INNER JOIN nw_jobmela_job_dtl job ON applicant.fklJobId = job.pklJobId
INNER JOIN nw_candidate_basic_dtl basic ON applicant.fklCandidateId = basic.pklCandidateId
LEFT JOIN nw_mams_religion religion ON basic.fklRelegionId = religion.pklReligionId
LEFT JOIN nw_candidate_caste_dtl candidateCaste ON candidateCaste.fklCandidateId = basic.pklCandidateId 
LEFT JOIN nw_mams_caste caste ON candidateCaste.fklCasteCategoryId = caste.pklCasteId
LEFT JOIN nw_candidate_qualification_dtl candidateQual ON candidateQual.fklCandidateId = basic.pklCandidateId
LEFT JOIN nw_mams_qualification qual ON qual.pklQualificationId = candidateQual.fklQualificationId
LEFT JOIN nw_candidate_contact_dtl contact ON contact.fklCandidateId = basic.pklCandidateId
LEFT JOIN nw_jobmela_mela_dtl mela ON job.fklMelaId= mela.pklMelaId

WHERE contact.vsPrimaryMobileNo IS NOT NULL
AND job.fklMelaId = ? 
        `,
        mela:`select vsVenueName,dtStartDate,dtStartDate,vsAddress from nw_jobmela_mela_dtl where pklMelaId=?;`,
        //total applicant in a mela
        totalApplicant:`SELECT COUNT(*) as total FROM nw_jobmela_applicant_dtl where fklMelaId=? `,
        melaCompanyjob:`SELECT c.company_name,c.registration_no,m.venue_name, job.post_name,job.vacancy,job.job_id FROM ds.nw_jobmela_company_dtl c
        left join
	        ds.nw_jobmela_mela_dtl m on c.fklmela_no=m.sl_no
		left join 
			nw_jobmela_job_details job on c.sl_no=fkl_Company_slno
            where c.fklmela_no=3`,
        melaCompany:`select distinct
            entity.vsEntityName as companyName,
            entity.pklEntityId,
            entity.fklRoleId as roleId,
            entity.vsEmail1 as companyEmail,
            entity.vsMobile1 as companyMobile,
            entity.fklOrganizationTypeId as organizationTypeId,
            orgType.vsOrganizationTypeName as organizationTypeName,
            login.vsLoginName as userName,
            emp.fklEmployerType as empTypeId,
            empType.vsEmployerType as empTypeName,
            emp.vsArea as companyAddress,
            emp.vsPINCode as companyPinCode,
            emp.dtModifiedDate as createdAt,
            jobmela.fklMelaid as melaId
        from nw_enms_entity entity 
        left join nw_mams_organization_type orgType on entity.fklOrganizationTypeId = orgType.pklOrganizationTypeId
        left join nw_loms_login login on entity.fklLoginId = login.pklLoginId
        left join nw_emms_employer_details emp on entity.pklEntityId = emp.fklENtityId
        left join nw_mams_employer_type empType on emp.fklEmployerType = empType.pklEmployerId
        inner join nw_jobmela_job_dtl jobmela on entity.pklEntityId = jobmela.fklEmployerId
        where jobmela.fklMelaId =? `,
        appliedApplicant:`SELECT COUNT(*) AS total
        FROM nw_jobmela_candidate_apply app
        JOIN nw_jobmela_candidate_dtl can ON app.candidate_id = can.candidate_id
        WHERE can.fklmela_no =? `,
        eligibleJobs:`
        SELECT 
        j.job_id, 
        c.registration_no, 
        j.min_fklqualificationId,
        mq.vsQualification as min_qualification,
        c.company_name,
        j.vacancy, 
        j.post_name
        FROM ds.nw_jobmela_job_details j
        JOIN 
            ds.nw_jobmela_company_dtl c ON j.fkl_Company_slno = c.sl_no
        JOIN 
            nw_mams_qualification mq ON j.min_fklqualificationId = mq.pklQualificationId
        
        WHERE j.min_fklqualificationId <= (SELECT fklqualificationId FROM ds.nw_jobmela_candidate_dtl WHERE candidate_id = ?)
        AND c.fklmela_no = (SELECT fklmela_no FROM ds.nw_jobmela_candidate_dtl WHERE candidate_id =?)
        AND j.job_id NOT IN (SELECT job_id FROM ds.nw_jobmela_candidate_apply WHERE candidate_id = ?);
        `,
        appliedJOb:`
            select 
            can.candidate_id,
            can.full_name,
            mq.vsQualification as min_qualification,
            can.fklmela_no,
            m.venue_name,
            app.job_id,
            job.post_name,
            com.company_name,
            app.status
            from nw_jobmela_candidate_dtl can 
            join
            nw_jobmela_candidate_apply app on can.candidate_id=app.candidate_id
            join
            nw_jobmela_job_details job on app.job_id=job.job_id
            join
            nw_jobmela_company_dtl com on job.fkl_Company_slno=com.sl_no
            join 
            nw_jobmela_mela_dtl m on com.fklmela_no=m.sl_no
            JOIN 
            nw_mams_qualification mq ON job.min_fklqualificationId = mq.pklQualificationId
            where can.candidate_id=?
    
        `,
        jobApply:`
        insert into nw_jobmela_candidate_apply (candidate_id,job_id,update_date,status,admin_name) VALUES (?,?, NOW(),"APPLIED",?)
        `,
        jobApply:`
        insert into nw_jobmela_candidate_apply (candidate_id,job_id,application_date,status,admin_name) VALUES (?,?, NOW(),"APPLIED",?)
        `,
        applyData:`select status from nw_jobmela_candidate_apply where candidate_id=? and job_id=?`,
        checkCompanyStatus:`select * from nw_jobmela_company_dtl com
                        left join 
                        nw_jobmela_job_details job on com.sl_no = job.fkl_Company_slno
                        where job.job_id=? And com.isVarified=1 `,
        melaJob:`SELECT 
                entity.vsEntityName AS companyName,
                jobmela.vsPostName AS jobName,
                jobmela.pklJobId AS jobId,
                jobmela.iVacancy AS vacancy,
                qual.vsQualification AS minimumQualification,
                jobmela.fklMinQalificationId AS qualificationId,
                jobmela.vsSelectionProcedure AS selectionProcedure,
                
                COUNT(DISTINCT applicant.fklCandidateId) AS appliedCandidateCount,

                entity.pklEntityId,
                entity.fklOrganizationTypeId AS organizationTypeId,
                orgType.vsOrganizationTypeName AS organizationTypeName,
                emp.fklEmployerType AS empTypeId,
                empType.vsEmployerType AS empTypeName,
                jobmela.fklMelaId AS melaId

            FROM nw_jobmela_job_dtl jobmela

            LEFT JOIN nw_enms_entity entity 
                ON jobmela.fklEmployerId = entity.pklEntityId

            LEFT JOIN nw_mams_organization_type orgType 
                ON entity.fklOrganizationTypeId = orgType.pklOrganizationTypeId

            LEFT JOIN nw_loms_login login 
                ON entity.fklLoginId = login.pklLoginId

            LEFT JOIN nw_emms_employer_details emp 
                ON entity.pklEntityId = emp.fklENtityId

            LEFT JOIN nw_mams_employer_type empType 
                ON emp.fklEmployerType = empType.pklEmployerId

            LEFT JOIN nw_mams_qualification qual 
                ON jobmela.fklMinQalificationId = qual.pklQualificationId

            LEFT JOIN nw_jobmela_applicant_dtl applicant 
                ON applicant.fklJobId = jobmela.pklJobId

            WHERE jobmela.fklMelaId = ?

            GROUP BY 
                jobmela.pklJobId,
                entity.vsEntityName,
                jobmela.vsPostName,
                jobmela.iVacancy,
                qual.vsQualification,
                jobmela.fklMinQalificationId,
                jobmela.vsSelectionProcedure,
                entity.pklEntityId,
                entity.fklOrganizationTypeId,
                orgType.vsOrganizationTypeName,
                emp.fklEmployerType,
                empType.vsEmployerType,
                jobmela.fklMelaId `
        
}

module.exports=uQuery