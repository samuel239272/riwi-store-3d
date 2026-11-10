import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, ShoppingBag, Search, Terminal } from 'lucide-react';
import { useCart } from '../cart/CartProvider';
import { LogoCover } from '../brand/LogoCover';
import { assetUrl } from '../../utils/assets';

export function Brand() {
  return <Link to="/" className="brand" aria-label="RIWI 360°, inicio"><span className="brand-mark"><img src={assetUrl('/logos/riwi-coder.png')} width="132" height="48" alt="RIWI" /></span><span className="brand-edition">360°<small>THE MERCH STORE</small></span></Link>;
}
export function Layout() {
  const [menu, setMenu] = useState(false);
  const { count, notice } = useCart();
  const location = useLocation();
  useEffect(() => { setMenu(false); window.scrollTo({ top: 0, behavior: 'instant' }); if (location.pathname !== '/') document.getElementById('main-content')?.focus({ preventScroll: true }); }, [location.pathname]);
  return <>
    <a href="#main-content" className="skip-link" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Saltar al contenido</a>
    {location.pathname === '/' && <LogoCover />}
    <header className="site-header"><div className="header-inner page-width">
      <Brand />
      <nav id="main-navigation" className={`main-nav ${menu ? 'open' : ''}`} aria-label="Navegación principal"><NavLink to="/" end>Inicio</NavLink><NavLink to="/catalogo">Explorar tienda</NavLink><NavLink to="/colecciones">Colecciones <span className="nav-new">NEW</span></NavLink><NavLink to="/experiencia">Estudio 360°</NavLink><NavLink to="/probador">Probador virtual</NavLink></nav>
      <div className="header-actions"><Link to="/catalogo?q=" className="icon-button header-search" aria-label="Buscar productos"><Search size={20} /></Link><Link to="/carrito" className="cart-link" aria-label={`Carrito, ${count} artículos`}><ShoppingBag size={19}/><span className="cart-text">Mi carrito</span><span className="cart-count">{count}</span></Link><button type="button" className="icon-button mobile-menu" aria-controls="main-navigation" aria-expanded={menu} aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button></div>
    </div></header>
    <main id="main-content" tabIndex={-1}><Outlet /></main><div className="cart-notice" role="status" aria-live="polite">{notice}</div>
    <footer className="site-footer"><div className="page-width"><div className="footer-top"><div><Brand/><p>Be a coder. Change your world.<br/>Lleva tu próxima idea puesta.</p></div><div className="footer-links"><span className="eyebrow">EXPLORA EL UNIVERSO</span><Link to="/catalogo">Todas las prendas <ArrowUpRight size={16}/></Link><Link to="/colecciones">Colecciones <ArrowUpRight size={16}/></Link><Link to="/experiencia">El estudio 360° <ArrowUpRight size={16}/></Link><Link to="/probador">Probador virtual <ArrowUpRight size={16}/></Link></div><div className="footer-code"><Terminal size={18}/><code>const future = <span>you.build();</span></code><small>Diseñado para una comunidad que no deja de crear.</small></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RIWI 360°</span><span>Catálogo de muestra · Pagos aún no habilitados</span><span><i className="status-dot"/> BUILT WITH CURIOSITY</span></div></div></footer>
  </>;
}


