import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await register(f);
      nav('/');
    } catch (e2) {
      setErr(e2.message);
    }
  };
  const bind = (k, type = 'text') => ({ type, value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  return (
    <form className="form auth" onSubmit={submit}>
      <h2>Create Account</h2>
      <label>Name<input {...bind('name')} required /></label>
      <label>Email<input {...bind('email', 'email')} required /></label>
      <label>Phone<input {...bind('phone')} placeholder="03XX-XXXXXXX" /></label>
      <label>Password (at least 6 characters)<input {...bind('password', 'password')} minLength={6} required /></label>
      {err && <p className="error">{err}</p>}
      <button className="btn full">Register</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}
