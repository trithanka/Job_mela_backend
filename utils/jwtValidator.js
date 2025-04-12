const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Extract token from headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(403).send({
            status: false,
            message: "No token provided."
        });
    }
    //verify the token
    jwt.verify(token, process.env.SECERET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(500).send({
                status: false,
                message: "Failed to authenticate token."
            });
        }
        req.user = decoded;
        next();
    });
};

const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (req.user.admin_type !== requiredRole && req.user.admin_type!=="superAdmin") {
            return res.status(403).send({
                status: false,
                message: "You do not have the required role to perform this action"
            });
        }
        next();
    };
};

module.exports = {verifyToken,authorizeRole};

