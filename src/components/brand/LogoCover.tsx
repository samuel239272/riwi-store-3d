import { useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Code2, Play, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { assetUrl } from '../../utils/assets';

export function LogoCover() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] });
  const stageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const [replay, setReplay] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const pointerStyle = { '--pointer-x': `${pointer.x}px`, '--pointer-y': `${pointer.y}px` } as CSSProperties;
  return <section ref={root} className="logo-cover" aria-label="Bienvenido a RIWI 360°" onPointerMove={event => {
    if (event.pointerType !== 'mouse' || reduced) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({ x: (event.clientX / bounds.width - .5) * 18, y: ((event.clientY - bounds.top) / bounds.height - .5) * 18 });
  }} onPointerLeave={() => setPointer({ x: 0, y: 0 })} style={pointerStyle}>
    <div className="cover-grid" aria-hidden="true" />
    <div className="cover-top"><span><Code2 size={17}/> RIWI <b> / </b> 360°</span><span><i className="status-dot"/> CREATIVITY IS ONLINE</span></div>
    <div className="cover-content">
      <div className="cover-copy">
        <span className="cover-kicker"><span>01</span> / EL UNIVERSO DE LOS QUE CREAN</span>
        <h1>Tu código.<br/><em>Tu estilo.</em><span className="cover-period">_</span></h1>
        <p>Las ideas no se quedan en la pantalla. Descubre una colección creada para quienes construyen su propio mundo.</p>
        <div className="cover-actions"><Link className="cover-button" to="/catalogo">Explorar la tienda <ArrowUpRight size={19}/></Link><button className="cover-secondary" type="button" onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })}>Descubrir más <ArrowDown size={16}/></button></div>
        <div className="cover-community"><span className="cover-community-icon">&lt;/&gt;</span><span>Hecho para mentes que crean<small>BE A CODER. CHANGE YOUR WORLD.</small></span></div>
      </div>
      <motion.div className="cover-art" style={{ y: reduced ? 0 : stageY }}>
        <div className="cover-orbit orbit-a" aria-hidden="true"/><div className="cover-orbit orbit-b" aria-hidden="true"/>
        <div className="code-window" key={replay}>
          <div className="code-window-bar"><div className="window-dots"><i/><i/><i/></div><span>identity.tsx</span><button type="button" onClick={() => setReplay(value => value + 1)} aria-label="Repetir animación del logo"><RotateCcw size={15}/></button></div>
          <div className="code-window-body"><div className="code-lines" aria-hidden="true"><span>01</span><code><b>import</b> {'{ creativity }'} <b>from</b> <i>'@riwi'</i>;</code><span>02</span><code></code><span>03</span><code><b>const</b> future = {'{'}</code><span>04</span><code> &nbsp; passion: <i>'build'</i>,</code><span>05</span><code> &nbsp; community: <i>'RIWI'</i></code><span>06</span><code>{'}'};</code><span>07</span><code className="code-command">&gt; build your world<span className="code-cursor">_</span></code></div>
            <div className="logo-reveal"><img src={assetUrl('/logos/riwi-coder.png')} alt="RIWI. Be a coder, change your world" /></div>
          </div>
          <div className="code-window-footer"><span><i className="status-dot"/> ALL SYSTEMS CREATIVE</span><span><Play size={10} fill="currentColor"/> READY TO CREATE</span></div>
        </div>
        <span className="floating-token token-one" aria-hidden="true">{'{ }'}</span><span className="floating-token token-two" aria-hidden="true">&lt;/&gt;</span>
      </motion.div>
    </div>
    <div className="cover-bottom"><span>DESIGNED FOR THE NEXT GENERATION</span><button type="button" onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })}>SCROLL PARA EXPLORAR <ArrowDown size={15}/></button><span>CREATED FOR CODERS</span></div>
  </section>;
}

