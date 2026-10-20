import { Link } from 'react-router-dom';
import { money, finalPrice } from '../api';

export const imgOf = (p) => p.image || '';

export function Thumb({ product, className = '' }) {
  return product.image ? (
    <img src={product.image} alt={product.name} className={className} loading="lazy" />
  ) : (
    <div className={`noimg ${className}`}>{product.category || 'No image'}</div>
  );
}

export default function ProductCard({ product }) {
  const sale = product.discountPrice && product.discountPrice < product.price;
  return (
    <Link to={`/product/${product._id}`} className="card">
      <div className="card-img">
        <Thumb product={product} />
        {sale && <span className="tag">Sale</span>}
        {product.stock === 0 && <span className="tag out">Sold out</span>}
      </div>
      <div className="card-body">
        <small className="muted">{product.category}</small>
        <h3>{product.name}</h3>
        <div className="price">
          <strong>{money(finalPrice(product))}</strong>
          {sale && <s>{money(product.price)}</s>}
        </div>
      </div>
    </Link>
  );
}
