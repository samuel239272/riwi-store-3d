import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, Fingerprint, Users } from 'lucide-react';
import { assetUrl } from '../../utils/assets';
import { Reveal } from './Reveal';

export function Culture() {
  return (
    <section className="cyber-culture" id="riwi-culture">
      <div className="cyber-container culture-grid">
        <Reveal className="culture-portrait">
          <img
            src={assetUrl('/media/riwi-cyber-final.webp')}
            alt="La mascota RIWI, con su identidad original, nos da la bienvenida al universo Cyber"
            loading="lazy"
          />
          <div className="culture-portrait-frame" />
          <span className="culture-portrait-caption">
            <i className="cyber-status-dot" /> THE CREATIVE SPIRIT / RIWI
          </span>
        </Reveal>
        <Reveal className="culture-copy">
          <span className="cyber-eyebrow">04 / CULTURE IS OUR OPERATING SYSTEM</span>
          <h2>
            EL FUTURO
            <br />
            NO SE ESPERA.
            <br />
            <em>SE CONSTRUYE.</em>
          </h2>
          <p>
            Para quienes ven una oportunidad donde otros ven una pantalla. Para quienes comparten
            una idea, resuelven un reto y siempre tienen una nueva pregunta.
          </p>
          <div className="culture-principles">
            <span>
              <Code2 size={17} /> Crea sin pedir permiso.
            </span>
            <span>
              <Users size={17} /> Crece en comunidad.
            </span>
            <span>
              <Fingerprint size={17} /> Conserva lo que te hace único.
            </span>
          </div>
          <Link className="cyber-text-button" to="/probador">
            Explora tu próxima versión <ArrowUpRight size={18} />
          </Link>
          <span className="culture-end-code">{'<Human creativity. No limits. />'}</span>
        </Reveal>
      </div>
    </section>
  );
}
