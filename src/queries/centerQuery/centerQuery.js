const uQuery={
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
        left JOIN 
            nw_jobmela_candidate_apply AS app ON can.candidate_id = app.candidate_id
        left JOIN 
            nw_mams_qualification q ON can.fklqualificationId = q.pklQualificationId
        left JOIN 
            nw_jobmela_job_details AS job ON app.job_id = job.job_id
       left JOIN 
            nw_jobmela_company_dtl AS com ON job.fkl_Company_slno = com.sl_no
        left join nw_jobmela_mela_dtl as m on can.fklmela_no=m.sl_no
        where can.fklmela_no=? 
        `,
        mela:`select venue_name,start_date,end_date from nw_jobmela_mela_dtl where sl_no=?;`,
        //total applicant in a mela
        totalApplicant:`SELECT COUNT(*) as total FROM nw_jobmela_candidate_dtl where fklmela_no=? `,
        melaCompanyjob:`SELECT c.company_name,c.registration_no,m.venue_name, job.post_name,job.vacancy,job.job_id FROM ds.nw_jobmela_company_dtl c
        left join
	        ds.nw_jobmela_mela_dtl m on c.fklmela_no=m.sl_no
		left join 
			nw_jobmela_job_details job on c.sl_no=fkl_Company_slno
            where c.fklmela_no=3`,
        melaCompany:`SELECT c.*,m.venue_name FROM ds.nw_jobmela_company_dtl c
        left join
	        ds.nw_jobmela_mela_dtl m on c.fklmela_no=m.sl_no
            where c.fklmela_no=?`,
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
                        where job.job_id=? And com.isVarified=1 `
        
}

module.exports=uQuery