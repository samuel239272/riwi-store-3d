import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/RebornLayout';
import { CartProvider } from './components/cart/CartProvider';
import { ExperienceProvider } from './components/digital/Experience';
import { RebornExperience } from './components/reborn/RebornExperience';
import HomePage from './app/RebornHome';
const FittingPage = lazy(() => import('./app/FittingPage'));
const CatalogPage = lazy(() => import('./app/CatalogPage'));
const ProductPage = lazy(() => import('./app/ProductPage'));
const CartPage = lazy(() => import('./app/CartPage'));
const ExperiencePage = lazy(() => import('./app/RiwiExperiencePage'));
const CollectionsPage = lazy(() => import('./app/CollectionsPage'));
const NotFoundPage = lazy(() => import('./app/RiwiNotFoundPage'));
export default function App() {
  return (
    <ExperienceProvider>
      <CartProvider>
        <RebornExperience>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="probador" element={<FittingPage />} />
              <Route path="catalogo" element={<CatalogPage />} />
              <Route path="producto/:id" element={<ProductPage />} />
              <Route path="carrito" element={<CartPage />} />
              <Route path="colecciones" element={<CollectionsPage />} />
              <Route path="experiencia" element={<ExperiencePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </RebornExperience>
      </CartProvider>
    </ExperienceProvider>
  );
}
