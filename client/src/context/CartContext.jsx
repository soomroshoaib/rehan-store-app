import { createContext, useContext, useEffect, useState } from 'react';
import { finalPrice } from '../api';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const keyOf = (id, size) => `${id}|${size || ''}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rs_cart')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => { localStorage.setItem('rs_cart', JSON.stringify(items)); }, [items]);

  const add = (product, qty = 1, size = '') => {
    setItems((cur) => {
      const k = keyOf(product._id, size);
      const found = cur.find((i) => i.key === k);
      if (found) return cur.map((i) => (i.key === k ? { ...i, qty: Math.min(product.stock, i.qty + qty) } : i));
      return [...cur, { key: k, product: product._id, name: product.name, image: product.image, price: finalPrice(product), stock: product.stock, size, qty }];
    });
  };
  const setQty = (key, qty) =>
    setItems((cur) => cur.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(i.stock, qty)) } : i)));
  const remove = (key) => setItems((cur) => cur.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, subtotal }}>{children}</CartContext.Provider>;
}
