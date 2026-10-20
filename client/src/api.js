const BASE = '/api';

export const getToken = () => localStorage.getItem('rs_token');

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
  postForm: (p, form) => request(p, { method: 'POST', form }),
  putForm: (p, form) => request(p, { method: 'PUT', form }),
};

export const money = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-PK');
export const finalPrice = (p) => (p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price);
