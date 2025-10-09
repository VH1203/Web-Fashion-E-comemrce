
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export function isValidPassword(pw) {
  return PASSWORD_REGEX.test(pw);
}

export function isEmail(val) {
  return /.+@.+\..+/.test(val);
}

export function normalizeIdentifier(identifier) {
  const trimmed = String(identifier).trim();
  if (isEmail(trimmed))
    return { type: "email", value: trimmed.toLowerCase() };
  if (/^\d{8,15}$/.test(trimmed))
    return { type: "phone", value: trimmed };
  return { type: "username", value: trimmed.toLowerCase() };
}
