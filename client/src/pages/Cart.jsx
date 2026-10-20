import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { money } from '../api';

export default function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <div className="empty">
        <p>Your cart is empty.</p>
        <Link to="/shop" className="btn">Go to Shop</Link>
      </div>
    );
  }

  return (
    <>
      <h2>Shopping Cart</h2>
      <div className="cart">
        <div>
          {items.map((i) => (
            <div key={i.key} className="cart-row">
              {i.image ? <img src={i.image} alt="" /> : <div className="noimg sm" />}
              <div className="grow">
                <Link to={`/product/${i.product}`}><strong>{i.name}</strong></Link>
                {i.size && <small className="muted"> · Size {i.size}</small>}
                <div>{money(i.price)}</div>
              </div>
              <div className="qty">
                <button onClick={() => setQty(i.key, i.qty - 1)}>−</button>
                <span>{i.qty}</span>
                <button onClick={() => setQty(i.key, i.qty + 1)}>+</button>
              </div>
              <strong className="line">{money(i.price * i.qty)}</strong>
              <button className="link-btn danger" onClick={() => remove(i.key)}>Remove</button>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h3>Summary</h3>
          <div className="srow"><span>Items total</span><b>{money(subtotal)}</b></div>
          <small className="muted">Delivery charges are calculated at checkout.</small>
          <button className="btn full" onClick={() => nav('/checkout')}>Proceed to Checkout</button>
        </aside>
      </div>
    </>
  );
}
