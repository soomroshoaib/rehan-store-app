import { useEffect, useState } from 'react';
import { api, money } from '../api';

export const STATUS_LABEL = { placed: 'Placed', confirmed: 'Confirm', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
export const PAY_LABEL = { pending: 'Pending (COD)', awaiting_verification: 'Awaiting verification', paid: 'Paid', rejected: 'Rejected' };
export const METHOD_LABEL = { COD: 'Cash on Delivery', EASYPAISA: 'Easypaisa', JAZZCASH: 'JazzCash' };

export default function MyOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => { api.get('/orders/mine').then(setOrders).catch(() => setOrders([])); }, []);

  if (!orders) return <p className="empty">Loading...</p>;
  if (orders.length === 0) return <p className="empty">You have no orders yet.</p>;

  return (
    <>
      <h2>My Orders</h2>
      {orders.map((o) => (
        <div key={o._id} className="order">
          <div className="order-head">
            <b>#{o._id.slice(-6).toUpperCase()}</b>
            <span className={`pill ${o.status}`}>{STATUS_LABEL[o.status]}</span>
            <span className={`pill pay-${o.paymentStatus}`}>{METHOD_LABEL[o.paymentMethod]}: {PAY_LABEL[o.paymentStatus]}</span>
            <small className="muted">{new Date(o.createdAt).toLocaleString()}</small>
          </div>
          {o.items.map((i, k) => (
            <div key={k} className="srow"><span>{i.name}{i.size && ` (${i.size})`} × {i.qty}</span><b>{money(i.price * i.qty)}</b></div>
          ))}
          <div className="srow total"><span>Total</span><b>{money(o.total)}</b></div>
        </div>
      ))}
    </>
  );
}
