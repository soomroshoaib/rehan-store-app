import { useEffect, useState } from 'react';
import { api, money } from '../../api';
import { STATUS_LABEL, PAY_LABEL, METHOD_LABEL } from '../MyOrders';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    const qs = filter ? `?paymentStatus=${filter}` : '';
    api.get('/admin/orders' + qs).then(setOrders).catch((e) => setErr(e.message));
  };
  useEffect(load, [filter]);

  const patch = async (id, body) => {
    setErr('');
    try {
      await api.patch('/admin/orders/' + id, body);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <>
      <div className="toolbar">
        <h2>Orders</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All orders</option>
          <option value="awaiting_verification">Awaiting payment verification</option>
          <option value="paid">Paid</option>
          <option value="pending">COD pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {err && <p className="error">{err}</p>}
      {orders.length === 0 && <p className="empty">No orders.</p>}

      {orders.map((o) => (
        <div key={o._id} className="order">
          <div className="order-head">
            <b>#{o._id.slice(-6).toUpperCase()}</b>
            <span className={`pill ${o.status}`}>{STATUS_LABEL[o.status]}</span>
            <small className="muted">{new Date(o.createdAt).toLocaleString()}</small>
          </div>
          <div className="cols">
            <div>
              <b>{o.shipping.fullName}</b> · {o.shipping.phone}<br />
              {o.shipping.address}, {o.shipping.city}<br />
              <small className="muted">{o.user?.email}</small>
            </div>
            <div>
              {o.items.map((i, k) => <div key={k}>{i.name}{i.size && ` (${i.size})`} × {i.qty}</div>)}
              <b>Total: {money(o.total)}</b>
            </div>
            <div>
              <div>{METHOD_LABEL[o.paymentMethod]}</div>
              <span className={`pill pay-${o.paymentStatus}`}>{PAY_LABEL[o.paymentStatus]}</span>
              {o.transactionId && <div>TID: <b>{o.transactionId}</b></div>}
              {o.paymentStatus === 'awaiting_verification' && (
                <div className="row">
                  <button className="btn sm" onClick={() => patch(o._id, { paymentStatus: 'paid' })}>Payment received</button>
                  <button className="btn sm ghost" onClick={() => patch(o._id, { paymentStatus: 'rejected' })}>Reject</button>
                </div>
              )}
            </div>
          </div>
          <label>Order status:{' '}
            <select value={o.status} onChange={(e) => patch(o._id, { status: e.target.value })} disabled={o.status === 'cancelled'}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
      ))}
    </>
  );
}
