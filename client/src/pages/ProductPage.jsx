import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, money, finalPrice } from '../api';
import { useCart } from '../context/CartContext';
import { Thumb } from '../components/ProductCard';

export default function ProductPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get('/products/' + id).then(setP).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <p className="empty">{err}</p>;
  if (!p) return <p className="empty">Loading...</p>;

  const needsSize = p.sizes?.length > 0;
  const sale = p.discountPrice && p.discountPrice < p.price;

  const addToCart = (goCart) => {
    if (needsSize && !size) return setErr('Please select a size first');
    setErr('');
    add(p, qty, size);
    if (goCart) nav('/cart');
    else { setAdded(true); setTimeout(() => setAdded(false), 1500); }
  };

  return (
    <div className="detail">
      <div className="detail-img"><Thumb product={p} /></div>
      <div>
        <small className="muted">{p.category}</small>
        <h1>{p.name}</h1>
        <div className="price big">
          <strong>{money(finalPrice(p))}</strong>
          {sale && <s>{money(p.price)}</s>}
        </div>
        <p>{p.description}</p>
        <p className={p.stock > 0 ? 'ok' : 'bad'}>{p.stock > 0 ? `In stock (${p.stock})` : 'Out of stock'}</p>

        {needsSize && (
          <div className="sizes">
            {p.sizes.map((s) => (
              <button key={s} className={`chip ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
        )}

        {err && <p className="error">{err}</p>}

        {p.stock > 0 && (
          <>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
            </div>
            <div className="row">
              <button className="btn ghost" onClick={() => addToCart(false)}>{added ? 'Added ✓' : 'Add to Cart'}</button>
              <button className="btn" onClick={() => addToCart(true)}>Buy Now</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
