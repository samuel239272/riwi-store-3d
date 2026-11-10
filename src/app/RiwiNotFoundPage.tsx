import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
export default function NotFoundPage() { usePageMeta('Página no encontrada', 'Esta página no existe. Vuelve al catálogo de RIWI 360°.'); return <section className="not-found page-width"><span className="eyebrow">ERROR 404 / BRANCH NOT FOUND</span><h1>Esta ruta aún<br/>no está escrita.</h1><p>Volvamos a un lugar con buenas ideas.</p><Link to="/catalogo" className="button primary">Explorar la tienda →</Link></section>; }
