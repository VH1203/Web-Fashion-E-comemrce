const jwt = require('jsonwebtoken');


const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';


function signAccessToken(payload) {
return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}


function verifyAccessToken(token) {
return jwt.verify(token, process.env.JWT_SECRET);
}


module.exports = { signAccessToken, verifyAccessToken };