import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="side">
        <h3>Admin Panel</h3>
        <NavLink end to="/admin">Dashboard</NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
      </aside>
      <section className="admin-main"><Outlet /></section>
    </div>
  );
}
