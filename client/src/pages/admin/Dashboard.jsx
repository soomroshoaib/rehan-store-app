import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../../api';
import { STATUS_LABEL } from '../MyOrders';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then(setS).catch(() => {}); }, []);
  if (!s) return <p className="empty">Loading...</p>;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        <div className="stat"><small>Total Revenue</small><b>{money(s.revenue)}</b></div>
        <div className="stat"><small>Orders</small><b>{s.orders}</b></div>
        <div className="stat"><small>Products</small><b>{s.products}</b></div>
        <div className="stat"><small>Customers</small><b>{s.customers}</b></div>
        <div className={`stat ${s.pendingPayments ? 'alert' : ''}`}>
          <small>Payments awaiting verification</small><b>{s.pendingPayments}</b>
          {s.pendingPayments > 0 && <Link to="/admin/orders">View</Link>}
        </div>
      </div>

      <h3>Low-stock products</h3>
      {s.lowStock.length === 0 ? <p className="muted">All good.</p> : (
        <ul className="plain">{s.lowStock.map((p) => <li key={p._id}>{p.name} <b className="bad">({p.stock} left)</b></li>)}</ul>
      )}

      <h3>Recent orders</h3>
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {s.recent.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-6).toUpperCase()}</td>
              <td>{o.user?.name || '-'}</td>
              <td>{money(o.total)}</td>
              <td>{STATUS_LABEL[o.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
