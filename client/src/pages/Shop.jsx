import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const q = params.get('q') || '';
  const category = params.get('category') || 'All';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);

  useEffect(() => { api.get('/products/categories').then(setCats).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ q, category, sort, page, limit: 12 }).toString();
    api.get('/products?' + qs).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [q, category, sort, page]);

  const set = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    if (k !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <>
      <div className="toolbar">
        <h2>{q ? `Results for "${q}"` : 'Shop'} <small className="muted">({data.total})</small></h2>
        <div className="filters">
          <select value={category} onChange={(e) => set('category', e.target.value === 'All' ? '' : e.target.value)}>
            <option>All</option>
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => set('sort', e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {loading ? <p className="empty">Loading...</p> : data.items.length === 0 ? <p className="empty">No products found.</p> : (
        <div className="grid">{data.items.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}

      {data.pages > 1 && (
        <div className="pager">
          <button className="btn ghost" disabled={page <= 1} onClick={() => set('page', page - 1)}>Previous</button>
          <span>{page} / {data.pages}</span>
          <button className="btn ghost" disabled={page >= data.pages} onClick={() => set('page', page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
