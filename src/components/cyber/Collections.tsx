import { Link } from 'react-router-dom';
import { ArrowUpRight, Braces } from 'lucide-react';
import { products } from '../../data/products';
import { Reveal } from './Reveal';

export function Collections() {
  return (
    <section className="cyber-collections cyber-container" id="cyber-collections">
      <Reveal className="cyber-section-heading">
        <div>
          <span className="cyber-eyebrow">01 / THE NEXT CHAPTER</span>
          <h2>
            No sigas una tendencia.
            <br />
            <em>Escribe tu propia versión.</em>
          </h2>
        </div>
        <p>
          Distintas formas de pensar.
          <br />
          Un mismo lenguaje: crear.
        </p>
      </Reveal>
      <div className="cyber-collection-grid">
        {[
          {
            name: 'Hello, World',
            heading: (
              <>
                HELLO,
                <br />
                WORLD.
              </>
            ),
            product: products[1],
            number: '01',
            label: 'TODO EMPIEZA CON UNA IDEA.',
          },
          {
            name: 'First Commit',
            heading: (
              <>
                FIRST
                <br />
                COMMIT.
              </>
            ),
            product: products[8],
            number: '02',
            label: 'DA EL SIGUIENTE GRAN PASO.',
          },
        ].map((collection, index) => (
          <Reveal key={collection.name} delay={index * 0.1}>
            <Link
              to={`/catalogo?coleccion=${encodeURIComponent(collection.name)}`}
              className={`cyber-collection-card collection-${index}`}
            >
              <div className="collection-card-head">
                <span>COLLECTION / {collection.number}</span>
                <Braces size={19} />
              </div>
              <span className="collection-line-art" aria-hidden="true" />
              <div className="collection-card-copy">
                <span>{collection.label}</span>
                <h3>{collection.heading}</h3>
                <span className="collection-card-count">
                  {
                    products.filter(
                      (product) => product.published && product.collection === collection.name,
                    ).length
                  }{' '}
                  piezas de concepto
                </span>
              </div>
              <img
                src={collection.product.images[0].src}
                alt={collection.product.images[0].alt}
                loading="lazy"
              />
              <span className="collection-open">
                <ArrowUpRight size={25} />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
