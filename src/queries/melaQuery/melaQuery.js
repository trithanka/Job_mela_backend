const QueryM={
    addMela: `INSERT INTO nw_jobmela_mela_dtl (venue_name, address, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)`,

    getMelas: `SELECT * FROM nw_jobmela_mela_dtl`,

    companyQ:`SELECT 
    c.company_name,
    c.registration_no,
    c.phone_no,
    c.email,
    c.address,
    c.fklmela_no,
    mela.venue_name
    FROM 
        nw_jobmela_company_dtl c
	join
		nw_jobmela_mela_dtl mela on c.fklmela_no=mela.sl_no
    WHERE 
        c.fklmela_no =  ?;`,
    
    updateMelaStatus: `UPDATE nw_jobmela_mela_dtl SET is_active = ? WHERE sl_no = ?`,
}

module.exports=QueryM