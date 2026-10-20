import { useEffect, useState } from 'react';
import { api, money } from '../../api';

const empty = { name: '', description: '', category: 'Cosmetics', price: '', discountPrice: '', stock: '', sizes: '', featured: false, active: true };

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(null); // null = closed, object = open
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');

  const load = () => api.get('/admin/products').then(setList).catch(() => {});
  useEffect(() => { load(); api.get('/products/categories').then(setCats); }, []);

  const openNew = () => { setForm(empty); setEditId(null); setFile(null); setErr(''); };
  const openEdit = (p) => {
    setForm({ ...p, discountPrice: p.discountPrice ?? '', sizes: (p.sizes || []).join(', ') });
    setEditId(p._id); setFile(null); setErr('');
  };

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    const fd = new FormData();
    ['name', 'description', 'category', 'price', 'discountPrice', 'stock', 'sizes'].forEach((k) => fd.append(k, form[k] ?? ''));
    fd.append('featured', form.featured);
    fd.append('active', form.active);
    if (file) fd.append('image', file);
    try {
      if (editId) await api.putForm('/admin/products/' + editId, fd);
      else await api.postForm('/admin/products', fd);
      setForm(null);
      load();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`"${p.name}" Delete this product?`)) return;
    await api.del('/admin/products/' + p._id);
    load();
  };

  const bind = (k, type = 'text') => ({ type, value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <>
      <div className="toolbar"><h2>Products</h2><button className="btn" onClick={openNew}>+ New product</button></div>

      {form && (
        <form className="form panel" onSubmit={save}>
          <h3>{editId ? 'Edit product' : 'New product'}</h3>
          <label>Name<input {...bind('name')} required /></label>
          <label>Category
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <div className="row">
            <label className="grow">Price<input {...bind('price', 'number')} min="0" required /></label>
            <label className="grow">Discount price (optional, must be lower than Price)<input {...bind('discountPrice', 'number')} min="0" /></label>
            <label className="grow">Stock<input {...bind('stock', 'number')} min="0" required /></label>
          </div>
          <label>Sizes (for shoes, separated by commas)<input {...bind('sizes')} placeholder="40, 41, 42" /></label>
          <label>Description<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label>Image (JPG/PNG/WEBP, up to 3MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0])} /></label>
          <label className="check"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured product (show on home page)</label>
          <label className="check"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Show in store</label>
          {err && <p className="error">{err}</p>}
          <div className="row"><button className="btn">Save</button><button type="button" className="btn ghost" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}

      <table>
        <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {list.map((p) => (
            <tr key={p._id}>
              <td>{p.image ? <img className="mini" src={p.image} alt="" /> : <div className="noimg mini" />}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.discountPrice && p.discountPrice < p.price ? <><b>{money(p.discountPrice)}</b> <s className="muted">{money(p.price)}</s></> : money(p.price)}</td>
              <td className={p.stock <= 5 ? 'bad' : ''}>{p.stock}</td>
              <td>{p.active ? 'Live' : 'Hidden'}</td>
              <td className="actions">
                <button className="link-btn" onClick={() => openEdit(p)}>Edit</button>
                <button className="link-btn danger" onClick={() => del(p)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
