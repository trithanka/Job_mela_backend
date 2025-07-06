const getInterviewSlot = async (candidateId, mysqlCon) => {
    // 1. Fetch applicant record for this candidate
    const [applicant] = await mysqlCon.query(`
      SELECT fklJobId, pklApplicantId 
      FROM nw_jobmela_applicant_dtl 
      WHERE fklCandidateId = ?`, [candidateId]);
  
    if (!applicant) {
      throw new Error("Candidate not found or not applied to any job.");
    }
  
    const { fklJobId, pklApplicantId } = applicant;
  
    // 2. Count how many applicants applied before this one for the same job
    const [countResult] = await mysqlCon.query(`
      SELECT COUNT(*) AS queueNumber 
      FROM nw_jobmela_applicant_dtl 
      WHERE fklJobId = ? AND pklApplicantId < ?`, [fklJobId, pklApplicantId]);
  
    const queueNumber = countResult.queueNumber;
  
    // 3. Fetch job interview details
    const [job] = await mysqlCon.query(`
      SELECT 
        iInterviewDurationMin, 
        TIME_TO_SEC(dtInterviewStartTime) AS startTimeSec,
        TIME_TO_SEC(dtInterviewEndTime) AS endTimeSec 
      FROM nw_jobmela_job_dtl 
      WHERE pklJobId = ?`, [fklJobId]);
  
    if (!job) {
      throw new Error("Job not found.");
    }
  
    const { iInterviewDurationMin, startTimeSec, endTimeSec } = job;
    const durationSec = iInterviewDurationMin * 60;
  
    // 4. Calculate slot times
    const slotStartSec = startTimeSec + queueNumber * durationSec;
    const slotEndSec = slotStartSec + durationSec;
  
    if (slotEndSec > endTimeSec) {
      throw new Error("No available slot — day is overbooked.");
    }
  
    const toTime = sec => {
      const h = String(Math.floor(sec / 3600)).padStart(2, '0');
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      return `${h}:${m}`;
    };
  
    return {
      slotStartTime: toTime(slotStartSec),
      slotEndTime: toTime(slotEndSec),
      queueNumber
    };
  };
  