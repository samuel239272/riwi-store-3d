import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useExperience } from '../digital/Experience';
import {
  ArrowUpRight,
  Check,
  LoaderCircle,
  Minus,
  Plus,
  Rotate3D,
  RotateCcw,
  Ruler,
  Save,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import type { CameraCommand } from '../../types/viewer';
import {
  avatarStorageKey,
  bodyStorageKey,
  buildValue,
  defaultBody,
  measurementFields,
  readAvatar,
  referenceBody,
  validateBody,
  withBuild,
  type BodyModel,
  type BodyProfile,
} from '../../utils/bodyProfile';
import { supportsWebGL } from '../../utils/webgl';
import { useVisibility } from '../../hooks/useVisibility';
const FittingScene = lazy(() => import('../../scenes/FittingScene'));
const tones = [
  { name: 'Porcelana', hex: '#e3c8b5' },
  { name: 'Arena', hex: '#c8a281' },
  { name: 'Cobre', hex: '#9a684d' },
  { name: 'Ébano', hex: '#593c33' },
];
export function FittingStudio({
  product,
  initialColor,
}: {
  product: Product;
  initialColor?: string;
}) {
  const [stored] = useState(readAvatar);
  const [bodyModel, setBodyModel] = useState<BodyModel>(stored.model);
  const [profile, setProfile] = useState(stored.profile);
  const [dressed, setDressed] = useState(true);
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(profile).map(([k, v]) => [k, String(v)])),
  );
  const [color, setColor] = useState(
    initialColor && product.colors.some((c) => c.hex === initialColor)
      ? initialColor
      : product.colors[0].hex,
  );
  const [skin, setSkin] = useState(tones[0].hex),
    [fit, setFit] = useState<'regular' | 'relaxed'>('regular');
  const [notice, setNotice] = useState(''),
    [error, setError] = useState(''),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [retry, setRetry] = useState(0);
  const [rotate, setRotate] = useState(false),
    [view, setView] = useState('front');
  const [command, setCommand] = useState<CameraCommand>({
    id: 0,
    position: [0, 0.2, 7.2],
    target: [0, 0, 0],
  });
  const root = useRef<HTMLDivElement>(null),
    visible = useVisibility(root);
  const { stopped: reduced } = useExperience();
  const [webgl] = useState(supportsWebGL);
  const onReady = useCallback(() => setReady(true), []),
    onError = useCallback(() => setFailed(true), []);
  useEffect(() => {
    setReady(false);
    setFailed(false);
  }, [bodyModel, product.id, dressed]);
  useEffect(() => {
    setColor(
      initialColor && product.colors.some((c) => c.hex === initialColor)
        ? initialColor
        : product.colors[0].hex,
    );
  }, [product.id, initialColor]);
  const selectView = (value: string) => {
    setView(value);
    setRotate(false);
    setCommand((c) => ({
      id: c.id + 1,
      position:
        value === 'rear' ? [0, 0.2, -7.2] : value === 'side' ? [7.2, 0.2, 0] : [0, 0.2, 7.2],
      target: [0, 0, 0],
    }));
  };
  const build = () => {
    const next = Object.fromEntries(
      measurementFields.map((f) => [f.key, draft[f.key]?.trim() ? Number(draft[f.key]) : NaN]),
    ) as BodyProfile;
    const problem = validateBody(next);
    if (problem) {
      setError(problem);
      setNotice('');
      return;
    }
    setError('');
    setProfile(next);
    setNotice('Tu maniquí se ha actualizado con estas medidas.');
  };
  const applyProfile = (next: BodyProfile) => {
    setProfile(next);
    setDraft(Object.fromEntries(Object.entries(next).map(([k, v]) => [k, String(v)])));
    setError('');
  };
  const selectBody = (model: BodyModel) => {
    if (model === bodyModel) return;
    setBodyModel(model);
    applyProfile(referenceBody(model));
    setNotice(
      `Cuerpo ${model === 'male' ? 'masculino' : 'femenino'} cargado. Puedes ajustar su complexión y medidas.`,
    );
  };
  const changeBuild = (value: number) => {
    applyProfile(withBuild(profile, bodyModel, value));
    setNotice('Complexión actualizada. Puedes afinar cada medida.');
  };
  const save = () => {
    try {
      localStorage.setItem(bodyStorageKey, JSON.stringify(profile));
      localStorage.setItem(
        avatarStorageKey,
        JSON.stringify({ version: 2, model: bodyModel, profile }),
      );
      setNotice('Cuerpo y medidas guardados solo en este navegador.');
    } catch {
      setNotice('Este navegador no permite guardar las medidas. Puedes seguir usando el probador.');
    }
  };
  const clear = () => {
    try {
      localStorage.removeItem(bodyStorageKey);
      localStorage.removeItem(avatarStorageKey);
    } catch {
      /* Keep controls usable without storage. */
    }
    setBodyModel('male');
    applyProfile({ ...defaultBody });
    setNotice('Medidas borradas. Restablecimos el cuerpo de referencia.');
  };
  return (
    <div className="fitting-studio" ref={root}>
      <form
        className="body-panel"
        onSubmit={(e) => {
          e.preventDefault();
          build();
        }}
        noValidate
      >
        <div className="panel-heading">
          <span className="lab-step">01</span>
          <div>
            <span className="eyebrow">TU PUNTO DE PARTIDA</span>
            <h2>Hecho a tu medida.</h2>
          </div>
          <Ruler size={21} />
        </div>
        <p>Elige tu cuerpo, encuentra tu complexión y afina tus proporciones en 3D.</p>
        <fieldset className="avatar-model-choice">
          <legend>Modelo de cuerpo</legend>
          <div className="fit-choice">
            <button
              type="button"
              aria-pressed={bodyModel === 'male'}
              onClick={() => selectBody('male')}
            >
              Hombre
            </button>
            <button
              type="button"
              aria-pressed={bodyModel === 'female'}
              onClick={() => selectBody('female')}
            >
              Mujer
            </button>
          </div>
        </fieldset>
        <fieldset className="body-build">
          <legend>Complexión</legend>
          <div className="build-presets">
            {[
              [-65, 'Delgada'],
              [0, 'Media'],
              [85, 'Corpulenta'],
            ].map(([value, label]) => (
              <button
                key={label}
                type="button"
                aria-pressed={Math.abs(buildValue(profile, bodyModel) - Number(value)) < 8}
                onClick={() => changeBuild(Number(value))}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="build-slider">
            <span>Ajuste de complexión</span>
            <input
              type="range"
              min="-85"
              max="100"
              step="1"
              value={Math.max(-85, buildValue(profile, bodyModel))}
              onChange={(e) => changeBuild(Number(e.target.value))}
            />
            <span className="build-scale" aria-hidden="true">
              <span>Más delgada</span>
              <span>Más corpulenta</span>
            </span>
          </label>
          <button
            className="reset-body-shape"
            type="button"
            onClick={() => {
              applyProfile(referenceBody(bodyModel));
              setNotice('Restauramos las proporciones del modelo de referencia.');
            }}
          >
            Restaurar proporciones originales <RotateCcw size={12} />
          </button>
        </fieldset>
        <div className="measurement-grid">
          {measurementFields.slice(0, 2).map((f) => (
            <label key={f.key} className="measurement-field">
              <span>{f.label}</span>
              <div>
                <input
                  inputMode="decimal"
                  type="number"
                  min={f.min}
                  max={f.max}
                  step="1"
                  value={draft[f.key]}
                  onChange={(e) => setDraft((v) => ({ ...v, [f.key]: e.target.value }))}
                  aria-describedby="body-help"
                />
                <span>{f.unit}</span>
              </div>
            </label>
          ))}
        </div>
        <details className="body-details" open>
          <summary>
            Afina tus proporciones <Plus size={15} />
          </summary>
          <div className="measurement-grid">
            {measurementFields.slice(2).map((f) => (
              <label key={f.key} className="measurement-field">
                <span>{f.label}</span>
                <div>
                  <input
                    inputMode="decimal"
                    type="number"
                    min={f.min}
                    max={f.max}
                    step="1"
                    value={draft[f.key]}
                    onChange={(e) => setDraft((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                  <span>{f.unit}</span>
                </div>
              </label>
            ))}
          </div>
        </details>
        <p id="body-help" className="measure-help">
          Contornos en cm. Hombros: de extremo a extremo. Entrepierna: desde la ingle hasta el
          tobillo.
        </p>
        {error && (
          <p className="body-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary generate-body" type="submit">
          Actualizar mi maniquí <ArrowUpRight size={18} />
        </button>
        <div className="profile-actions">
          <button type="button" onClick={save}>
            <Save size={14} /> Guardar en este equipo
          </button>
          <button type="button" onClick={clear} aria-label="Borrar mis medidas">
            <Trash2 size={15} />
          </button>
        </div>
        <p className="privacy-note">
          Tus medidas se procesan en tu dispositivo. Solo se conservan si pulsas Guardar.
        </p>
        <p className="body-notice" role="status">
          {notice}
        </p>
      </form>
      <div
        className="fitting-stage"
        data-testid="fitting-viewer"
        data-model-status={!webgl || failed ? 'fallback' : ready ? 'ready' : 'loading'}
      >
        <div className="fitting-stage-head">
          <span>
            <i className="status-dot" /> VIRTUAL FIT / 360°
          </span>
          <span>
            {bodyModel === 'male' ? 'HOMBRE' : 'MUJER'} · {product.reference}
          </span>
        </div>
        <div className="fitting-mode fit-choice" role="group" aria-label="Vista del probador">
          <button aria-pressed={dressed} onClick={() => setDressed(true)}>
            Con prenda
          </button>
          <button aria-pressed={!dressed} onClick={() => setDressed(false)}>
            Solo cuerpo
          </button>
        </div>
        <div className="fit-watermark" aria-hidden="true">
          YOU.
        </div>
        <div
          className="fitting-canvas"
          role="region"
          tabIndex={webgl && !failed ? 0 : -1}
          aria-label="Probador 3D. Flechas para girar; más y menos para acercar."
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (['ArrowLeft', 'ArrowRight', '+', '-', '0'].includes(e.key)) e.preventDefault();
            if (e.key === 'ArrowLeft') selectView('side');
            if (e.key === 'ArrowRight') selectView('rear');
            if (e.key === '0') selectView('front');
            if (e.key === '+' || e.key === '-')
              setCommand((c) => ({ id: c.id + 1, zoom: e.key === '+' ? 0.85 : 1.15 }));
          }}
        >
          {!webgl || failed ? (
            <div className="fit-fallback">
              <img src={product.images[0].src} alt={product.name} />
              <p>No pudimos cargar el cuerpo o la prenda 3D. Tus medidas siguen disponibles.</p>
              {webgl && (
                <button
                  className="button light"
                  onClick={() => {
                    setFailed(false);
                    setReady(false);
                    setRetry((v) => v + 1);
                  }}
                >
                  Reintentar
                </button>
              )}
            </div>
          ) : (
            <>
              <Suspense fallback={null}>
                <FittingScene
                  key={retry}
                  product={product}
                  profile={profile}
                  bodyModel={bodyModel}
                  dressed={dressed}
                  color={color}
                  skin={skin}
                  fit={fit}
                  command={command}
                  rotate={rotate}
                  reduced={reduced}
                  visible={visible}
                  onReady={onReady}
                  onError={onError}
                />
              </Suspense>
              {!ready && (
                <span className="fit-loading" role="status">
                  <LoaderCircle className="spinner" /> Cargando cuerpo y prendas…
                </span>
              )}
            </>
          )}
        </div>
        {webgl && !failed && (
          <>
            <div className="fit-tools">
              <button
                onClick={() => setCommand((c) => ({ id: c.id + 1, zoom: 0.85 }))}
                aria-label="Acercar maniquí"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => setCommand((c) => ({ id: c.id + 1, zoom: 1.15 }))}
                aria-label="Alejar maniquí"
              >
                <Minus size={18} />
              </button>
              <button onClick={() => selectView('front')} aria-label="Restablecer maniquí">
                <RotateCcw size={18} />
              </button>
            </div>
            <div className="fit-views">
              {[
                ['front', 'Frente'],
                ['rear', 'Espalda'],
                ['side', 'Perfil'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  aria-pressed={view === id && !rotate}
                  onClick={() => selectView(id)}
                >
                  {label}
                </button>
              ))}
              <button
                aria-label="Girar maniquí automáticamente"
                disabled={reduced}
                aria-pressed={rotate && !reduced}
                onClick={() => setRotate((v) => !v)}
              >
                <Rotate3D size={16} />
              </button>
            </div>
          </>
        )}
        <div className="fit-readout">
          <span>
            {profile.height} <small>CM</small>
          </span>
          <span>
            {profile.weight} <small>KG</small>
          </span>
          <span>
            360<small>°</small>
          </span>
        </div>
        <span className="fitting-caption">Arrastra para girar · Acerca para ver los detalles</span>
      </div>
      <aside className="look-panel">
        <div className="panel-heading">
          <span className="lab-step">02</span>
          <div>
            <span className="eyebrow">LA PRENDA</span>
            <h2>Tu siguiente versión.</h2>
          </div>
        </div>
        <img className="look-thumbnail" src={product.images[0].src} alt={product.name} />
        <h3>{product.name}</h3>
        <p>{product.shortDescription}</p>
        <fieldset>
          <legend>Color de la prenda</legend>
          <div className="fit-swatches">
            {product.colors.map((c) => (
              <button
                key={c.name}
                aria-label={`Probar color ${c.name}`}
                aria-pressed={color === c.hex}
                style={{ background: c.hex }}
                onClick={() => setColor(c.hex)}
              >
                {color === c.hex && <Check size={16} />}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Tono de piel</legend>
          <div className="fit-swatches">
            {tones.map((t) => (
              <button
                key={t.name}
                aria-label={`Tono ${t.name}`}
                aria-pressed={skin === t.hex}
                style={{ background: t.hex }}
                onClick={() => setSkin(t.hex)}
              >
                {skin === t.hex && <Check size={16} />}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Holgura de la prenda</legend>
          <div className="fit-choice">
            <button aria-pressed={fit === 'regular'} onClick={() => setFit('regular')}>
              Regular
            </button>
            <button aria-pressed={fit === 'relaxed'} onClick={() => setFit('relaxed')}>
              Amplia
            </button>
          </div>
        </fieldset>
        <Link className="button light" to={`/producto/${product.id}`}>
          Ver la prenda <ArrowUpRight size={16} />
        </Link>
        <p className="fit-disclaimer">
          El peso y las medidas no determinan la forma exacta del cuerpo. Este modelo es
          orientativo; no predice la talla ni la caída real de la prenda.
        </p>
      </aside>
    </div>
  );
}
