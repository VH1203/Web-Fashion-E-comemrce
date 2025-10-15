
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const USERNAME_REGEX = /^[a-z0-9]{3,30}$/;
export const FULLNAME_REGEX = /^[A-Za-zÀ-ỹ\s]+$/;

export function isValidPassword(pw) {
  return PASSWORD_REGEX.test(pw);
}

export function isValidUsername(username) {
  return USERNAME_REGEX.test(username);
}

export function isValidFullName(name) {
  if (!name) return false;
  const trimmed = name.trim();
  return FULLNAME_REGEX.test(trimmed);
}

export function isEmail(val) {
  return /.+@.+\..+/.test(val);
}

export function normalizeIdentifier(identifier) {
  if (!identifier || typeof identifier !== "string") {
    throw new Error("Thiếu identifier hoặc định dạng không hợp lệ");
  }
  const trimmed = identifier.trim();
  if (isEmail(trimmed))
    return { type: "email", value: trimmed.toLowerCase() };
  if (/^\d{8,15}$/.test(trimmed))
    return { type: "phone", value: trimmed };
  return { type: "username", value: trimmed.toLowerCase() };
}
