import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [info, setInfo] = useState(null);
  const [method, setMethod] = useState('COD');
  const [tid, setTid] = useState('');
  const [f, setF] = useState({ fullName: user?.name || '', phone: user?.phone || '', address: '', city: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => { api.get('/orders/payment-info').then(setInfo).catch(() => {}); }, []);

  if (done) {
    return (
      <div className="empty">
        <h2>Thank you! Your order has been placed ✓</h2>
        <p>Order #{done._id.slice(-6).toUpperCase()}. Total: <b>{money(done.total)}</b></p>
        {done.paymentMethod !== 'COD' && <p>Your order will be confirmed once your payment is verified.</p>}
        <Link to="/orders" className="btn">My Orders</Link>
      </div>
    );
  }
  if (items.length === 0) return <p className="empty">Your cart is empty. <Link to="/shop">Shop</Link></p>;

  const fee = info ? (subtotal >= info.freeDeliveryAbove ? 0 : info.deliveryFee) : 0;
  const total = subtotal + fee;
  const acct = method === 'EASYPAISA' ? info?.easypaisa : method === 'JAZZCASH' ? info?.jazzcash : null;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const order = await api.post('/orders', {
        items: items.map((i) => ({ product: i.product, qty: i.qty, size: i.size })),
        shipping: f,
        paymentMethod: method,
        transactionId: tid,
      });
      clear();
      setDone(order);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const bind = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }), required: true });

  return (
    <form className="cart" onSubmit={submit}>
      <div>
        <h2>Delivery Details</h2>
        <div className="form">
          <label>Full name<input {...bind('fullName')} /></label>
          <label>Phone number<input {...bind('phone')} placeholder="03XX-XXXXXXX" /></label>
          <label>Address<textarea rows="3" {...bind('address')} /></label>
          <label>City<input {...bind('city')} /></label>
        </div>

        <h2>Payment Method</h2>
        <div className="pay">
          {[['COD', 'Cash on Delivery'], ['EASYPAISA', 'Easypaisa'], ['JAZZCASH', 'JazzCash']].map(([v, l]) => (
            <label key={v} className={`payopt ${method === v ? 'active' : ''}`}>
              <input type="radio" name="pm" checked={method === v} onChange={() => setMethod(v)} /> {l}
            </label>
          ))}
        </div>

        {acct && (
          <div className="note">
            <p>
              Please send <b>{money(total)}</b> to this account first:<br />
              <b>{acct.number}</b> (Title: {acct.title})
            </p>
            <label>Transaction ID (found in the SMS after payment)
              <input value={tid} onChange={(e) => setTid(e.target.value)} required placeholder="e.g. 1234567890" />
            </label>
            <small className="muted">We will verify the transaction and confirm your order.</small>
          </div>
        )}
      </div>

      <aside className="summary">
        <h3>Order Summary</h3>
        {items.map((i) => (
          <div key={i.key} className="srow"><span>{i.name}{i.size && ` (${i.size})`} × {i.qty}</span><b>{money(i.price * i.qty)}</b></div>
        ))}
        <hr />
        <div className="srow"><span>Items</span><b>{money(subtotal)}</b></div>
        <div className="srow"><span>Delivery</span><b>{fee === 0 ? 'Free' : money(fee)}</b></div>
        <div className="srow total"><span>Total</span><b>{money(total)}</b></div>
        {info && fee > 0 && <small className="muted">Delivery is free for orders above {money(info.freeDeliveryAbove)}.</small>}
        {err && <p className="error">{err}</p>}
        <button className="btn full" disabled={busy}>{busy ? 'Please wait...' : 'Place Order'}</button>
      </aside>
    </form>
  );
}
