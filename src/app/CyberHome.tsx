import { CyberHero } from '../components/cyber/CyberHero';
import { Collections } from '../components/cyber/Collections';
import { Showroom } from '../components/cyber/Showroom';
import { Products } from '../components/cyber/Products';
import { Culture } from '../components/cyber/Culture';
import { Identity } from '../components/cyber/Identity';
import { usePageMeta } from '../hooks/usePageMeta';

export default function CyberHome() {
  usePageMeta(
    'CODE YOUR IDENTITY',
    'RIWI CYBER. Un universo donde código, cultura y moda se encuentran. Explora la colección, entra al showroom 3D y construye tu próxima versión.',
  );
  return (
    <div className="cyber-home">
      <CyberHero />
      <div className="cyber-manifesto-strip" aria-hidden="true">
        <span>HUMAN CREATIVITY</span>
        <i />
        <span>DIGITAL CULTURE</span>
        <i />
        <span>PHYSICAL IDENTITY</span>
        <i />
        <span>RIWI CYBER</span>
      </div>
      <Collections />
      <Showroom />
      <Products />
      <Culture />
      <Identity />
    </div>
  );
}
