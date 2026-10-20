import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=4').then((d) => setFeatured(d.items)).catch(() => {});
    api.get('/products?sort=newest&limit=8').then((d) => setLatest(d.items)).catch(() => {});
    api.get('/products/categories').then(setCats).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Everything in one place</h1>
        <p>Creams, shoes, body sprays and much more, delivered to your door. Pay with Cash on Delivery, Easypaisa or JazzCash.</p>
        <Link to="/shop" className="btn">Start Shopping</Link>
      </section>

      <section>
        <h2>Categories</h2>
        <div className="chips">
          {cats.map((c) => (
            <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="chip">{c}</Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section>
          <h2>Featured Products</h2>
          <div className="grid">{featured.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </section>
      )}

      <section>
        <h2>New Arrivals</h2>
        {latest.length === 0 ? <p className="empty">No products yet.</p> : (
          <div className="grid">{latest.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </section>
    </>
  );
}
