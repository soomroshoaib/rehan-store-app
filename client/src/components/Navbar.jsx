import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [q, setQ] = useState('');

  const search = (e) => {
    e.preventDefault();
    nav(`/shop?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="nav">
      <div className="container nav-in">
        <Link to="/" className="brand">Rehan<span>Store</span></Link>
        <form onSubmit={search} className="nav-search">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search creams, shoes, body sprays..." />
        </form>
        <nav className="nav-links">
          <NavLink to="/shop">Shop</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          {user && <NavLink to="/orders">My Orders</NavLink>}
          <NavLink to="/cart" className="cart-link">Cart{count > 0 && <b className="badge">{count}</b>}</NavLink>
          {user ? (
            <button className="link-btn" onClick={() => { logout(); nav('/'); }}>Logout ({user.name.split(' ')[0]})</button>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
