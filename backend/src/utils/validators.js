const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;


function isValidPassword(pw) { return PASSWORD_REGEX.test(pw); }


function isEmail(val) { return /.+@.+\..+/.test(val); }


function normalizeIdentifier(identifier) {
const trimmed = String(identifier).trim();
if (isEmail(trimmed)) return { type: 'email', value: trimmed.toLowerCase() };
if (/^\d{8,15}$/.test(trimmed)) return { type: 'phone', value: trimmed };
return { type: 'username', value: trimmed.toLowerCase() };
}


module.exports = { isValidPassword, isEmail, normalizeIdentifier };