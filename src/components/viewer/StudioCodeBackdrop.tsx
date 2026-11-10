import { memo, useEffect, useState } from 'react';

// TypeScript code snippets
const TS_SNIPPETS = [
  `interface GarmentSpec {
  readonly id: "RI-HD-001";
  readonly name: "Hoodie Compile";
  material: ShaderMaterial;
  polyCount: 42_800;
  wireframe: false;
}

export function compileStudio(
  spec: GarmentSpec
): HologramPipeline {
  return new HologramPipeline({
    target: spec.id,
    glow: "#7c3aed",
    pbr: true,
  });
}`,
  `type CameraPreset = "front" | "rear" | "360";

interface StudioController {
  fov: 35;
  orbitSpeed: 0.45;
  activePreset: CameraPreset;
  lighting: "studio" | "cyber";
}

export const useRiwiStudio = (
  garmentId: string
): StudioController => {
  return initEngine(garmentId, {
    dpr: 1.5,
    toneMapping: "ACESFilmic",
  });
}`,
];

// JavaScript code snippets
const JS_SNIPPETS = [
  `const scene = new THREE.Scene();
const camera = new PerspectiveCamera(35);
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  modelGroup.rotation.y += delta * 0.45;
  renderer.render(scene, camera);
}

export function initStudio() {
  setupStudioLighting(scene);
  animate();
  console.log("Riwi 3D Studio Online");
}`,
  `const uniforms = {
  uTime: { value: 0 },
  uGradient: { value: new THREE.Color("#ec4899") },
  uFresnelBias: { value: 0.18 },
  uAlpha: { value: 0.95 }
};

function updateShader(delta) {
  uniforms.uTime.value += delta;
  applySubsurfaceScatter(uniforms);
}

window.addEventListener("resize", () => {
  resizeStudioViewport(window.innerWidth);
});`,
];

type Phase = 'delayed' | 'typing' | 'pausing-full' | 'erasing' | 'pausing-empty';

function useCodeTypewriter(
  snippets: string[],
  options: {
    typingSpeed?: number;
    eraseSpeed?: number;
    pauseFull?: number;
    pauseEmpty?: number;
    startDelay?: number;
  } = {},
) {
  const {
    typingSpeed = 34,
    eraseSpeed = 16,
    pauseFull = 2500,
    pauseEmpty = 650,
    startDelay = 0,
  } = options;

  const [snippetIndex, setSnippetIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<Phase>(startDelay > 0 ? 'delayed' : 'typing');

  const currentSnippet = snippets[snippetIndex] || '';
  const totalChars = currentSnippet.length;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'delayed') {
      timer = setTimeout(() => {
        setPhase('typing');
      }, startDelay);
    } else if (phase === 'typing') {
      if (charCount < totalChars) {
        timer = setTimeout(() => {
          setCharCount((prev) => Math.min(prev + 1, totalChars));
        }, typingSpeed);
      } else {
        setPhase('pausing-full');
      }
    } else if (phase === 'pausing-full') {
      timer = setTimeout(() => {
        setPhase('erasing');
      }, pauseFull);
    } else if (phase === 'erasing') {
      if (charCount > 0) {
        timer = setTimeout(() => {
          setCharCount((prev) => Math.max(0, prev - 2));
        }, eraseSpeed);
      } else {
        setPhase('pausing-empty');
      }
    } else if (phase === 'pausing-empty') {
      timer = setTimeout(() => {
        setSnippetIndex((prev) => (prev + 1) % snippets.length);
        setPhase('typing');
      }, pauseEmpty);
    }

    return () => clearTimeout(timer);
  }, [
    phase,
    charCount,
    totalChars,
    typingSpeed,
    eraseSpeed,
    pauseFull,
    pauseEmpty,
    startDelay,
    snippets.length,
  ]);

  return {
    text: currentSnippet.slice(0, charCount),
    phase,
    charCount,
    totalChars,
  };
}

const KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'return',
  'export',
  'import',
  'from',
  'interface',
  'type',
  'new',
  'async',
  'await',
  'class',
  'readonly',
  'default',
  'true',
  'false',
]);

const TYPES = new Set([
  'GarmentSpec',
  'ShaderMaterial',
  'HologramPipeline',
  'CameraPreset',
  'StudioController',
  'Vector3',
  'THREE',
  'PerspectiveCamera',
  'Clock',
  'Scene',
  'Color',
  'string',
  'number',
  'boolean',
]);

interface Token {
  text: string;
  cls: string;
}

function tokenizeLine(line: string): Token[] {
  if (!line) return [];
  const commentIdx = line.indexOf('//');
  let code = line;
  let comment = '';
  if (commentIdx !== -1) {
    code = line.slice(0, commentIdx);
    comment = line.slice(commentIdx);
  }

  const tokens: Token[] = [];
  const regex =
    /("[^"]*"?|'[^']*'?)|([a-zA-Z_$][a-zA-Z0-9_$]*)|([0-9]+(?:_[0-9]+)?(?:\.[0-9]+)?)|([{}();:,.<>=+*\-\/|&!]+)|(\s+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    const [raw, str, word, num, op, space] = match;
    if (str) {
      tokens.push({ text: raw, cls: 'token-str' });
    } else if (num) {
      tokens.push({ text: raw, cls: 'token-num' });
    } else if (op) {
      tokens.push({ text: raw, cls: 'token-op' });
    } else if (space) {
      tokens.push({ text: raw, cls: 'token-space' });
    } else if (word) {
      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, cls: 'token-kw' });
      } else if (TYPES.has(word)) {
        tokens.push({ text: word, cls: 'token-typ' });
      } else {
        tokens.push({ text: word, cls: 'token-ident' });
      }
    }
  }

  if (comment) {
    tokens.push({ text: comment, cls: 'token-com' });
  }

  return tokens;
}

function CodeTerminal({
  lang,
  filename,
  badgeBg,
  badgeText,
  statusLabel,
  statusClass,
  lines,
}: {
  lang: 'ts' | 'js';
  filename: string;
  badgeBg: string;
  badgeText: string;
  statusLabel: string;
  statusClass: string;
  lines: string[];
}) {
  return (
    <div
      className={`studio-code-window studio-code-${lang}`}
      role="region"
      aria-label={`Pantalla de código ${lang.toUpperCase()}`}
    >
      <div className="studio-window-header">
        <div className="studio-window-dots">
          <span className="window-dot dot-red" />
          <span className="window-dot dot-yellow" />
          <span className="window-dot dot-green" />
        </div>
        <div className="studio-window-tab">
          <span className="studio-lang-badge" style={{ backgroundColor: badgeBg }}>
            {badgeText}
          </span>
          <span className="studio-filename">{filename}</span>
        </div>
        <div className={`studio-status-pill ${statusClass}`}>
          <span className="status-indicator-dot" />
          <span>{statusLabel}</span>
        </div>
      </div>

      <div className="studio-window-body">
        <div className="studio-code-content">
          {lines.map((line, idx) => {
            const isLast = idx === lines.length - 1;
            const tokens = tokenizeLine(line);
            return (
              <div key={idx} className="studio-code-line">
                <span className="line-num">{String(idx + 1).padStart(2, '0')}</span>
                <span className="line-code">
                  {tokens.length === 0 && line.length === 0 ? '\u00A0' : null}
                  {tokens.map((tok, tIdx) => (
                    <span key={tIdx} className={tok.cls}>
                      {tok.text}
                    </span>
                  ))}
                  {isLast && <span className={`studio-cursor cursor-${lang}`} />}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const StudioCodeBackdrop = memo(function StudioCodeBackdrop() {
  // TypeScript terminal with 0ms delay
  const ts = useCodeTypewriter(TS_SNIPPETS, {
    typingSpeed: 32,
    eraseSpeed: 15,
    pauseFull: 2600,
    pauseEmpty: 600,
    startDelay: 100,
  });

  // JavaScript terminal with offset delay so they don't type in robotic lockstep
  const js = useCodeTypewriter(JS_SNIPPETS, {
    typingSpeed: 36,
    eraseSpeed: 16,
    pauseFull: 2800,
    pauseEmpty: 700,
    startDelay: 1300,
  });

  const getStatusInfo = (phase: Phase) => {
    switch (phase) {
      case 'typing':
        return { label: 'TYPING…', cls: 'is-typing' };
      case 'pausing-full':
        return { label: 'READY', cls: 'is-ready' };
      case 'erasing':
        return { label: 'ERASING…', cls: 'is-erasing' };
      case 'pausing-empty':
      case 'delayed':
      default:
        return { label: 'SYNC', cls: 'is-sync' };
    }
  };

  const tsStatus = getStatusInfo(ts.phase);
  const jsStatus = getStatusInfo(js.phase);

  const tsLines = ts.text.length > 0 ? ts.text.split('\n') : [''];
  const jsLines = js.text.length > 0 ? js.text.split('\n') : [''];

  return (
    <div className="studio-code-backdrop" aria-hidden="true">
      {/* Center RIWI Logo with vibrant gradient and atmospheric halo */}
      <div className="studio-center-logo-container">
        <div className="studio-logo-glow-halo" />
        <svg
          className="studio-center-riwi-logo"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1468 422"
          role="img"
          aria-label="RIWI"
        >
          <defs>
            <linearGradient
              id="riwiStudioBackdropGrad"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="1468"
              y2="422"
            >
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="22%" stopColor="#8b5cf6" />
              <stop offset="48%" stopColor="#c026d3" />
              <stop offset="74%" stopColor="#ec4899" />
              <stop offset="92%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="riwiLogoBackdropGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* < */}
          <path
            fill="url(#riwiStudioBackdropGrad)"
            d="M162,124L176,124L182,130L184,166L182,166L182,174L180,174L178,182L170,190L166,190L164,194L160,194L160,196L132,208L132,210L126,210L126,212L122,212L122,214L118,214L118,216L110,218L110,220L106,220L106,222L102,222L102,224L74,236L74,238L70,238L70,240L66,240L66,242L80,248L80,250L84,250L84,252L88,252L88,254L92,254L92,256L96,256L96,258L100,258L100,260L104,260L104,262L108,262L108,264L112,264L112,266L116,266L116,268L120,268L120,270L124,270L124,272L128,272L128,274L132,274L132,276L136,276L136,278L140,278L140,280L144,280L144,282L148,282L148,284L152,284L152,286L156,286L156,288L160,288L160,290L164,290L164,292L168,292L180,304L182,316L184,316L184,348L182,348L180,356L174,358L174,360L158,358L158,356L154,356L154,354L150,354L150,352L146,352L146,350L142,350L142,348L138,348L138,346L134,346L134,344L130,344L130,342L122,340L122,338L114,336L114,334L110,334L110,332L106,332L106,330L102,330L102,328L98,328L98,326L90,324L90,322L86,322L86,320L82,320L82,318L54,306L54,304L50,304L50,302L46,302L46,300L42,300L42,298L38,298L38,296L34,296L34,294L30,294L30,292L26,292L22,286L18,286L10,278L10,274L4,268L2,254L0,254L0,230L2,230L4,216L20,196L24,196L26,192L30,192L30,190L58,178L60,174L64,174L64,172L68,172L68,170L72,170L72,168L80,166L80,164L84,164L84,162L88,162L88,160L92,160L92,158L96,158L96,156L104,154L104,152L108,152L108,150L112,150L112,148L140,136L140,134L144,134L144,132L148,132L148,130L152,130L152,128L156,128L156,126L162,126L162,124Z"
          />
          {/* / */}
          <path
            fill="url(#riwiStudioBackdropGrad)"
            d="M362,0L400,0L400,2L406,2L406,4L412,6L414,16L412,16L410,32L408,32L406,44L404,44L404,50L402,50L398,70L396,70L394,82L392,82L392,90L390,90L388,102L386,102L386,108L384,108L382,120L380,120L380,128L378,128L376,140L374,140L374,146L372,146L370,158L368,158L368,166L366,166L364,178L362,178L362,184L360,184L358,196L356,196L356,204L354,204L346,234L344,234L344,240L342,240L342,248L340,248L332,278L330,278L330,284L328,284L328,292L326,292L324,304L322,304L322,310L320,310L318,322L316,322L316,328L314,328L312,340L310,340L310,348L308,348L308,354L306,354L304,366L302,366L302,372L300,372L298,384L296,384L296,390L294,390L292,402L290,402L290,406L286,408L286,412L282,416L278,416L274,420L268,420L268,422L230,422L230,420L224,420L218,414L218,400L220,400L224,378L226,378L228,366L230,366L230,360L232,360L234,346L236,346L238,334L240,334L240,326L242,326L244,314L246,314L248,302L250,302L250,294L252,294L254,282L256,282L258,270L260,270L260,262L262,262L264,250L266,250L268,238L270,238L270,230L272,230L274,218L276,218L276,212L278,212L280,200L282,200L282,192L284,192L286,180L288,180L288,174L290,174L292,162L294,162L294,154L296,154L298,142L300,142L300,136L302,136L304,124L306,124L306,116L308,116L310,104L312,104L312,98L314,98L316,86L318,86L318,78L320,78L322,66L324,66L324,60L326,60L328,48L330,48L334,28L336,28L338,18L342,16L342,12L350,4L362,2L362,0Z"
          />
          {/* R */}
          <path
            fill="url(#riwiStudioBackdropGrad)"
            d="M454,20L498,24L498,26L520,30L520,32L540,40L544,46L548,46L562,60L562,64L566,66L566,70L570,72L570,76L576,84L580,104L582,104L584,140L586,140L584,172L582,172L582,182L580,182L576,202L574,202L568,218L564,220L564,224L548,240L544,240L540,246L536,246L536,248L520,254L520,256L508,258L508,264L512,266L514,274L518,276L518,280L526,288L526,292L534,300L534,304L538,306L538,310L546,318L546,322L550,324L550,328L558,336L558,340L562,342L562,346L570,354L572,362L576,364L576,368L584,376L584,380L588,382L590,394L592,394L588,402L580,402L580,404L532,404L532,402L522,402L522,400L516,400L514,396L510,396L494,380L494,376L486,368L486,364L478,356L478,352L470,344L470,340L466,338L464,330L456,322L456,318L448,310L448,306L444,304L444,300L436,292L436,288L432,286L432,282L426,276L426,272L422,270L422,266L378,264L376,258L374,258L374,246L376,246L376,240L378,240L378,232L380,232L382,220L384,220L386,208L388,208L392,196L396,196L398,192L476,190L476,188L482,188L488,182L492,182L498,176L498,172L504,164L506,130L504,130L504,122L502,122L500,112L490,102L486,102L478,96L434,94L428,86L428,78L430,78L430,72L432,72L432,64L434,64L436,52L438,52L440,40L442,40L444,28L446,28L448,22L454,22L454,20Z"
          />
          {/* I */}
          <path
            fill="url(#riwiStudioBackdropGrad)"
            d="M648,106L698,106L708,114L708,120L710,120L710,242L712,242L710,388L708,388L706,398L700,400L700,402L694,402L694,404L654,404L654,402L646,402L638,394L638,386L636,386L636,120L638,120L638,114L648,106Z"
          />
          {/* W */}
          <path
            fill="url(#riwiStudioBackdropGrad)"
            d="M786,104L790,104L790,106L810,106L810,108L818,110L818,114L822,116L824,126L826,126L830,176L832,176L832,198L834,198L834,218L836,218L836,238L838,238L838,260L840,260L840,280L842,280L842,300L844,300L844,318L846,318L848,330L856,330L858,324L860,324L876,150L878,150L882,130L894,114L898,114L906,108L912,108L912,106L930,106L932,104L932,106L948,106L948,108L960,110L962,114L966,114L974,122L974,126L976,126L980,138L982,138L982,146L984,146L988,198L990,198L990,218L992,218L992,240L994,240L994,260L996,260L996,282L998,282L998,302L1000,302L1000,320L1002,320L1004,330L1012,330L1014,322L1016,322L1036,122L1038,122L1040,114L1050,106L1088,106L1098,114L1100,142L1098,142L1098,164L1096,164L1096,184L1094,184L1094,204L1092,204L1092,224L1090,224L1090,242L1088,242L1088,262L1086,262L1080,332L1078,332L1078,344L1076,344L1076,352L1074,352L1074,360L1070,364L1070,370L1068,370L1066,378L1062,380L1062,384L1052,394L1048,394L1040,400L1034,400L1034,402L1026,402L1026,404L994,404L994,402L986,402L986,400L976,398L958,380L956,370L952,366L952,360L950,360L948,340L946,340L934,202L928,202L928,206L926,206L926,228L924,228L924,250L922,250L922,272L920,272L920,292L918,292L914,346L912,346L912,356L910,356L908,368L906,368L900,384L888,396L884,396L876,402L868,402L868,404L834,404L834,402L826,402L826,400L820,400L820,398L812,396L810,392L806,392L800,386L800,382L796,380L796,376L794,376L790,364L788,364L788,356L786,356L786,350L784,350L784,340L782,340L782,328L780,328L780,310L778,310L778,292L776,292L776,274L774,274L774,254L772,254L772,234L770,234L770,214L768,214L768,194L766,194L766,174L764,174L764,154L762,154L762,128L760,128L762,126L762,116L768,108L786,106L786,104Z"
          />
          {/* I */}
          <path
            fill="url(#riwiStudioBackdropGrad)"
            d="M1162,106L1212,106L1224,118L1224,230L1226,230L1224,390L1222,390L1218,400L1206,402L1206,404L1168,404L1168,402L1158,400L1152,394L1152,386L1150,386L1150,122L1152,122L1154,112L1162,106Z"
          />
          {/* dot */}
          <path
            fill="url(#riwiStudioBackdropGrad)"
            d="M1186,0L1222,0L1222,2L1230,2L1236,8L1236,22L1234,22L1234,28L1232,28L1232,36L1230,36L1228,48L1226,48L1226,54L1222,58L1218,58L1218,60L1162,60L1154,54L1154,38L1156,38L1158,26L1160,26L1164,14L1174,4L1186,2L1186,0Z"
          />
          {/* > */}
          <path
            fill="url(#riwiStudioBackdropGrad)"
            d="M1294,124L1312,126L1312,128L1316,128L1316,130L1320,130L1320,132L1324,132L1324,134L1328,134L1328,136L1332,136L1332,138L1340,140L1340,142L1348,144L1348,146L1352,146L1352,148L1356,148L1356,150L1360,150L1360,152L1364,152L1364,154L1372,156L1372,158L1376,158L1376,160L1380,160L1380,162L1408,174L1408,176L1412,176L1412,178L1416,178L1416,180L1420,180L1420,182L1424,182L1424,184L1428,184L1428,186L1432,186L1432,188L1436,188L1438,192L1446,194L1450,200L1456,202L1456,206L1462,210L1462,214L1466,218L1466,226L1468,226L1468,258L1466,258L1464,270L1460,272L1460,276L1446,290L1438,292L1436,296L1432,296L1432,298L1428,298L1428,300L1424,300L1424,302L1420,302L1420,304L1412,306L1412,308L1408,308L1408,310L1404,310L1404,312L1376,324L1376,326L1372,326L1372,328L1368,328L1368,330L1364,330L1364,332L1360,332L1360,334L1356,334L1356,336L1328,348L1328,350L1324,350L1324,352L1318,352L1310,358L1304,358L1304,360L1294,360L1286,350L1286,312L1288,312L1290,302L1298,294L1306,292L1308,288L1312,288L1312,286L1324,282L1324,280L1330,280L1330,278L1334,278L1334,276L1338,276L1338,274L1342,274L1342,272L1346,272L1346,270L1354,268L1354,266L1358,266L1358,264L1362,264L1362,262L1390,250L1390,248L1394,248L1394,246L1398,246L1398,244L1402,244L1404,240L1400,240L1400,238L1396,238L1396,236L1376,228L1376,226L1370,226L1370,224L1366,224L1366,222L1362,222L1362,220L1358,220L1358,218L1354,218L1354,216L1346,214L1346,212L1342,212L1342,210L1338,210L1338,208L1310,196L1310,194L1306,194L1306,192L1302,192L1300,188L1296,188L1292,184L1292,180L1286,172L1286,154L1284,154L1284,150L1286,150L1286,134L1288,134L1290,126L1294,126L1294,124Z"
          />
        </svg>
      </div>

      {/* Left Screen: TypeScript Terminal Window */}
      <CodeTerminal
        lang="ts"
        filename="garment.types.ts"
        badgeBg="#3178c6"
        badgeText="TS"
        statusLabel={tsStatus.label}
        statusClass={tsStatus.cls}
        lines={tsLines}
      />

      {/* Right Screen: JavaScript Terminal Window */}
      <CodeTerminal
        lang="js"
        filename="riwi.shader.js"
        badgeBg="#f7df1e"
        badgeText="JS"
        statusLabel={jsStatus.label}
        statusClass={jsStatus.cls}
        lines={jsLines}
      />
    </div>
  );
});
