const aQuery = {
    getAdminById: `
        SELECT * FROM ds.nw_jobmela_admin WHERE admin_id = ?
    `,
    addAdmin: `
        INSERT INTO ds.nw_jobmela_admin (username, email, password, admin_type, phone_no, fklmela_no)
        VALUES (?, ?, ?, ?, ?, ?)
    `,
    getAdminByEmail: `SELECT * FROM ds.nw_jobmela_admin WHERE email = ?`,
    getAll:`SELECT * FROM ds.nw_jobmela_admin`,

    updateStatus:`UPDATE nw_jobmela_admin SET bActive = ? WHERE admin_id = ?`
};

module.exports = aQuery;

