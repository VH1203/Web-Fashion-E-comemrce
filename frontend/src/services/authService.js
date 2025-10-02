export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


export async function post(path, body) {
const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const data = await res.json();
if (!res.ok) throw new Error(data.message || 'Request failed');
return data;
}


export const authApi = {
registerRequestOTP: (payload) => post('/auth/register/request-otp', payload),
registerVerify: (payload) => post('/auth/register/verify', payload),
login: (payload) => post('/auth/login', payload),
forgotRequest: (payload) => post('/auth/forgot-password/request', payload),
forgotVerify: (payload) => post('/auth/forgot-password/verify', payload)
};