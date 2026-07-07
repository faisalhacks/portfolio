/* ============================================================
   MFP · RESEARCH — static site generator
   Usage: node build.js
   Generates all HTML pages from shared templates so nav/footer
   and the four findings exist in exactly one place.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;

/* Set to the production origin (no trailing slash) once deployed,
   e.g. "https://faisalparvez.dev" — used for og:image absolute URLs. */
const SITE = "";

const IDENT = {
  name: "Mohammed Faisal Parvez",
  role: "ML & Edge AI Engineer / Independent Researcher",
  email: "mohammedfaisalparvez@gmail.com",
  phone: "+91 8977287230",
  phonePretty: "+91 89772 87230",
  github: "https://github.com/faisalhacks",
  hf: "https://huggingface.co/Mohaaxa",
  linkedin: "https://www.linkedin.com/in/mohammed-faisal-parvez-621368241",
};

/* ---------------- findings (single source of truth) ---------------- */
const FINDINGS = [
  {
    slug: "selective-refusal",
    id: "F-01",
    status: "VLM Calibration · Modal A100",
    title: "Selective Refusal as Protective Calibration",
    metaDesc: "Which VLM should a safety-critical robot trust when it's uncertain? A six-pipeline benchmark shows failure modes are model-family-specific — the refusing family reaches ~2x precision and 5-10x recall.",
    abstract: "Which VLM should a safety-critical robot trust when it's uncertain?",
    method: 'Six-pipeline benchmark — <strong>Qwen2.5-VL 3B / 7B / 72B + InternVL2-2B</strong> — on Modal A100s over robot perception frames.',
    key: 'Failure modes are <strong>model-family-specific</strong>: one family refuses under uncertainty, another confabulates on identical inputs. The refusing family reaches <span class="acc">~2× precision</span> and <span class="acc">5–10× recall</span> on engaged frames.',
    implication: 'Refusal is calibration, not weakness — pick model families by <strong>failure mode</strong>, not leaderboard rank.',
    figcaption: "Fig. 1 — Precision / recall vs confabulating family",
    figure: `<svg viewBox="0 0 300 170" role="img" aria-label="Bar chart: on engaged frames the refusing model family reaches about 2 times the precision and 5 to 10 times the recall of the confabulating family.">
  <line x1="20" y1="140" x2="280" y2="140" stroke="rgba(242,240,234,.16)" stroke-width="1"/>
  <rect class="figbar" x="52" y="106" width="26" height="34" fill="rgba(242,240,234,.28)"/>
  <rect class="figbar" x="86" y="68" width="26" height="72" fill="#31e8ff" style="transition-delay:.1s"/>
  <text class="fig-mono" x="82" y="156" text-anchor="middle">precision</text>
  <text class="fig-lab fig-val fig-val--acc" x="99" y="58" text-anchor="middle">~2×</text>
  <rect class="figbar" x="186" y="127" width="26" height="13" fill="rgba(242,240,234,.28)" style="transition-delay:.2s"/>
  <rect class="figbar" x="220" y="36" width="26" height="104" fill="#31e8ff" style="transition-delay:.3s"/>
  <text class="fig-mono" x="216" y="156" text-anchor="middle">recall</text>
  <text class="fig-lab fig-val fig-val--acc" x="233" y="28" text-anchor="middle">5–10×</text>
  <text class="fig-mono" x="20" y="14">engaged frames · refusing family vs baseline</text>
</svg>`,
  },
  {
    slug: "prompt-priming",
    id: "F-02",
    status: "Benchmark Ablation",
    title: "Prompt Priming Masquerading as Visual Attribution",
    metaDesc: "An apparent visual-misattribution effect in detector-grounded VLM benchmarks was prompt-text priming: wording shifted results 9.4pp, visual markers ≤0.2pp. Benchmark conclusions can flip when input channels aren't isolated.",
    abstract: "An apparent visual-misattribution effect in detector-grounded VLM benchmarks.",
    method: '<strong>Marker × prompt ablation</strong> isolating the visual channel from the text channel.',
    key: 'The effect was prompt-text priming — wording shifted results <span class="acc">9.4pp</span>; visual markers <span class="acc">≤0.2pp</span>.',
    implication: 'Benchmark conclusions can <strong>flip</strong> when input channels aren\'t isolated.',
    figcaption: "Fig. 2 — Effect size by input channel",
    figure: `<svg viewBox="0 0 300 170" role="img" aria-label="Bar chart: prompt wording shifted benchmark outcomes by 9.4 percentage points while visual markers shifted them by at most 0.2 percentage points.">
  <line x1="40" y1="30" x2="40" y2="140" stroke="rgba(242,240,234,.16)" stroke-width="1"/>
  <text class="fig-mono" x="48" y="38">prompt text</text>
  <rect class="figbar-h" x="40" y="46" height="24" width="220" fill="#31e8ff"/>
  <text class="fig-lab fig-val fig-val--acc" x="268" y="62" text-anchor="end">9.4pp</text>
  <text class="fig-mono" x="48" y="98">visual marker</text>
  <rect class="figbar-h" x="40" y="106" height="24" width="6" fill="rgba(242,240,234,.3)" style="transition-delay:.15s"/>
  <text class="fig-lab fig-val" x="58" y="122">≤0.2pp</text>
  <text class="fig-mono" x="40" y="160">shift in benchmark outcome (percentage points)</text>
</svg>`,
  },
  {
    slug: "1bit-vision",
    id: "F-03",
    status: "1-bit VLMs · Edge",
    title: "Vision on 1-bit LLMs &amp; a Silent Training Failure",
    titlePlain: "Vision on 1-bit LLMs & a Silent Training Failure",
    metaDesc: "Grafting vision onto BitNet/Falcon3 1-bit LLMs surfaced a silent boundary-supervision failure — fixed with one line — and a CPU/GPU efficiency inversion: ~3x CPU speedup, ~6x lower memory vs 4-bit baselines.",
    abstract: "Can vision be grafted onto extreme-quantized (1-bit) language models?",
    method: 'Vision-grafting pipeline onto <strong>BitNet / Falcon3 1-bit LLMs</strong>.',
    key: 'Identified a previously-unnamed <strong>boundary-supervision failure</strong> — silent at train time, degenerate at inference — fixed with one line. Measured a CPU/GPU efficiency inversion: <span class="acc">~3× CPU speedup</span>, <span class="acc">~6× lower memory</span> vs 4-bit baselines.',
    implication: '1-bit VLMs are natively suited to <strong>CPU/ARM edge hardware</strong>.',
    figcaption: "Fig. 3 — 1-bit vs 4-bit baseline (CPU)",
    figure: `<svg viewBox="0 0 300 170" role="img" aria-label="Bar chart: versus a 4-bit baseline on CPU, the 1-bit model runs about 3 times faster and uses about 6 times less memory.">
  <line x1="20" y1="140" x2="280" y2="140" stroke="rgba(242,240,234,.16)" stroke-width="1"/>
  <rect class="figbar" x="52" y="104" width="26" height="36" fill="rgba(242,240,234,.28)"/>
  <rect class="figbar" x="86" y="32" width="26" height="108" fill="#31e8ff" style="transition-delay:.1s"/>
  <text class="fig-mono" x="82" y="156" text-anchor="middle">speed</text>
  <text class="fig-lab fig-val fig-val--acc" x="99" y="28" text-anchor="middle">~3×</text>
  <rect class="figbar" x="186" y="38" width="26" height="102" fill="rgba(242,240,234,.28)" style="transition-delay:.2s"/>
  <rect class="figbar" x="220" y="123" width="26" height="17" fill="#31e8ff" style="transition-delay:.3s"/>
  <text class="fig-mono" x="216" y="156" text-anchor="middle">memory</text>
  <text class="fig-lab fig-val fig-val--acc" x="233" y="112" text-anchor="middle">÷6</text>
  <text class="fig-mono" x="20" y="14">grey = 4-bit baseline · cyan = 1-bit</text>
</svg>`,
  },
  {
    slug: "sim-to-real",
    id: "F-04",
    status: "Manuscript in preparation",
    title: "The Sim-to-Real Gap in Indoor Segmentation",
    metaDesc: "Do synthetic validation scores predict real-world performance? SegFormer-B0 on 1,458 labeled real indoor images: 0.676 real mIoU — while a synthetic-trained counterpart scored 0.988 val mIoU yet failed on real footage.",
    abstract: "Do synthetic validation scores predict real-world performance?",
    method: '<strong>SegFormer-B0</strong> fine-tuned on a <strong>1,458-image</strong> labeled real indoor dataset.',
    key: '<span class="acc">0.676 mIoU</span> on real-frame validation — while a synthetic-trained counterpart scored <span class="acc">0.988 val mIoU</span> yet failed on real footage.',
    implication: 'Synthetic metrics can <strong>wildly overstate</strong> deployability.',
    figcaption: "Fig. 4 — Validation mIoU: sim vs real",
    figure: `<svg viewBox="0 0 300 170" role="img" aria-label="Two gauges: the synthetic-trained model scores 0.988 validation mIoU while the real-trained model scores 0.676 on real frames — the same architecture under different training realities.">
  <g transform="translate(78,96)">
    <path d="M -50 0 A 50 50 0 0 1 50 0" fill="none" stroke="rgba(242,240,234,.12)" stroke-width="8"/>
    <path class="f4-arc" d="M -50 0 A 50 50 0 0 1 50 0" fill="none" stroke="rgba(242,240,234,.45)" stroke-width="8" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="--off:1.2"/>
    <text class="f4-num fig-val" y="-12" text-anchor="middle" font-size="20" data-target="0.988">0.988</text>
    <text class="fig-mono" y="26" text-anchor="middle">sim (synthetic val)</text>
  </g>
  <g transform="translate(222,96)">
    <path d="M -50 0 A 50 50 0 0 1 50 0" fill="none" stroke="rgba(242,240,234,.12)" stroke-width="8"/>
    <path class="f4-arc" d="M -50 0 A 50 50 0 0 1 50 0" fill="none" stroke="#31e8ff" stroke-width="8" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="--off:32.4"/>
    <text class="f4-num fig-val fig-val--acc" y="-12" text-anchor="middle" font-size="20" data-target="0.676">0.676</text>
    <text class="fig-mono" y="26" text-anchor="middle">real (deployed)</text>
  </g>
  <text class="fig-mono" x="150" y="152" text-anchor="middle">same architecture · different training reality</text>
</svg>`,
  },
];

/* ---------------- shared fragments ---------------- */
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">`;

const FAVICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23050507'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='34' fill='%2331e8ff'%3EF.%3C/text%3E%3C/svg%3E">`;

const HEAD_BOOT = `<script>(function(){var d=document.documentElement;d.className=d.className.replace("no-js","js");try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!sessionStorage.getItem("mfpPre")){sessionStorage.setItem("mfpPre","1");d.classList.add("preload");}else{d.classList.add("ready");}}catch(e){d.classList.add("ready");}})();</script>`;

function head({ title, desc, prefix, url, extra = "" }) {
  const og = SITE ? SITE + "/assets/og.png" : "/assets/og.png";
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="author" content="${IDENT.name}">
<meta name="theme-color" content="#050507">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:site_name" content="Mohammed Faisal Parvez — Research">
${SITE ? `<meta property="og:url" content="${SITE}${url}">\n<link rel="canonical" href="${SITE}${url}">` : ""}
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${og}">
${FAVICON}
${HEAD_BOOT}
${FONTS}
<link rel="stylesheet" href="${prefix}assets/css/main.css">
<script defer src="${prefix}assets/js/main.js"></script>${extra ? "\n" + extra : ""}`;
}

function navHtml(active, prefix) {
  const links = [
    ["home", "Home", prefix || "./"],
    ["research", "Research", prefix + "research/"],
    ["about", "About", prefix + "about/"],
    ["models", "Models", prefix + "models/"],
  ];
  return `<header class="nav">
  <a href="${prefix || "./"}" class="nav-logo" aria-label="Home — MFP Research">MFP<b>·</b>RESEARCH</a>
  <nav class="nav-links" aria-label="Primary">
    ${links.map(([k, label, href]) =>
      `<a href="${href}"${k === active ? ' aria-current="page"' : ""}>${label}</a>`).join("\n    ")}
  </nav>
</header>`;
}

const PRELOADER = `<div class="preloader" id="preloader" aria-hidden="true">
  <div class="preloader-inner">
    <div class="pre-count"><span id="preNum">000</span><sup>%</sup></div>
    <div class="pre-log mono">
      <span class="lg-line" id="preLog">initializing runtime…</span>
      <span class="lg-line" style="color:var(--ivory-faint)">MFP / RESEARCH INDEX v3.0</span>
    </div>
  </div>
  <div class="pre-bar"><i id="preBar"></i></div>
</div>`;

function footerHtml(prefix) {
  return `<footer class="site-footer" id="contact">
  <h2 class="footer-big rv">Let's push models to the <em>edge</em>.</h2>
  <div class="footer-links rv">
    <a class="footer-email u-sweep" href="mailto:${IDENT.email}">${IDENT.email}</a>
    <div class="footer-secondary">
      <a class="u-sweep" href="tel:${IDENT.phone.replace(/\s/g, "")}">${IDENT.phonePretty}</a>
      <a class="u-sweep" href="${IDENT.github}" target="_blank" rel="noopener">GitHub ↗</a>
      <a class="u-sweep" href="${IDENT.hf}" target="_blank" rel="noopener">HuggingFace ↗</a>
      <a class="u-sweep" href="${IDENT.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
    </div>
  </div>
  <div class="footer-base">
    <span>© 2026 ${IDENT.name}</span>
    <span>Hyderabad, IN <span class="acc">·</span> 17.38°N 78.48°E</span>
    <span>Built with WebGL<span class="acc">_</span></span>
  </div>
</footer>`;
}

function shell({ lang = "en", headHtml, active, prefix, mainHtml, bodyExtra = "" }) {
  return `<!DOCTYPE html>
<html lang="${lang}" class="no-js">
<head>
${headHtml}
</head>
<body>
${PRELOADER}
<div class="grain" aria-hidden="true"></div>
<div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
<div id="top-sentinel" style="position:absolute;top:0;left:0;width:1px;height:80px;pointer-events:none" aria-hidden="true"></div>
${navHtml(active, prefix)}
<main id="main">
${mainHtml}
${footerHtml(prefix)}
</main>${bodyExtra ? "\n" + bodyExtra : ""}
</body>
</html>
`;
}

/* rows shared by index cards and detail pages */
function rowsHtml(f) {
  return `<dl class="rx-rows">
  <div class="rx-row"><dt>Abstract</dt><dd>${f.abstract}</dd></div>
  <div class="rx-row"><dt>Method</dt><dd>${f.method}</dd></div>
  <div class="rx-row rx-row--key"><dt>Key Result</dt><dd>${f.key}</dd></div>
  <div class="rx-row"><dt>Implication</dt><dd>${f.implication}</dd></div>
</dl>`;
}
function figHtml(f) {
  return `<figure class="rx-fig">
  <figcaption>${f.figcaption}</figcaption>
  <div class="fig-wrap">${f.figure}</div>
</figure>`;
}

/* ================================================================ HOME */
const jsonLd = `<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: IDENT.name,
  jobTitle: "ML & Edge AI Engineer",
  description: "Independent researcher: VLM reliability & calibration, extreme 1-bit quantization, edge inference, sim-to-real transfer.",
  email: "mailto:" + IDENT.email,
  telephone: IDENT.phone,
  address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" },
  alumniOf: "Lords Institute of Engineering & Technology (Osmania University)",
  sameAs: [IDENT.github, IDENT.hf, IDENT.linkedin],
}, null, 1)}
</script>`;

const FEATURED = [
  { f: FINDINGS[0], stat: "~2× precision · 5–10× recall" },
  { f: FINDINGS[2], stat: "~3× CPU speedup · ~6× less memory" },
];

const homeMain = `
<!-- HERO -->
<section class="hero" aria-label="Introduction">
  <canvas id="webgl" aria-hidden="true"></canvas>
  <div class="hero-fallback-glow" aria-hidden="true"></div>
  <div class="hero-inner">
    <div class="hero-meta-top hero-fade">
      <span>ML &amp; Edge AI Engineer <span class="acc">·</span> Independent Researcher</span>
      <span>17.38°N 78.48°E — Hyderabad, IN</span>
    </div>
    <h1 class="hero-name">
      <span class="h-line"><span>Mohammed</span></span>
      <span class="h-line"><span class="thin">Faisal</span></span>
      <span class="h-line"><span>Parvez<em class="accent-dot">.</em></span></span>
    </h1>
    <div class="hero-sub hero-fade">
      <p class="hero-statement">I study how vision-language models <em>fail</em> — and make them run where they shouldn't.</p>
      <p class="hero-interests">
        <b>Research interests</b><br>
        VLM reliability &amp; calibration · extreme quantization (1-bit) ·<br>
        edge inference · sim-to-real transfer
      </p>
    </div>
    <div class="hero-cta hero-fade">
      <a class="btn btn--accent" href="research/"><span>Read the Research</span><span class="arrow" aria-hidden="true">→</span></a>
      <a class="btn" href="assets/resume.pdf" download="Mohammed-Faisal-Parvez-Resume.pdf"><span>Download Resume (PDF)</span><span class="arrow" aria-hidden="true">↓</span></a>
      <a class="btn" href="${IDENT.github}" target="_blank" rel="noopener"><span>GitHub</span><span class="arrow" aria-hidden="true">↗</span></a>
      <a class="btn" href="${IDENT.hf}" target="_blank" rel="noopener"><span>HuggingFace</span><span class="arrow" aria-hidden="true">↗</span></a>
    </div>
  </div>
  <div class="hero-bottom hero-fade">
    <span class="scroll-hint"><span class="tick"></span> Scroll to explore</span>
    <span>Failure is data<span style="color:var(--accent)">_</span></span>
  </div>
</section>

<!-- MARQUEE -->
<div class="marquee" aria-hidden="true">
  <div class="marquee-track">
    ${`<div class="marquee-group">
      <span>PyTorch</span><i>◆</i><span>TensorRT</span><i>◆</i><span>BitNet</span><i>◆</i><span>llama.cpp</span><i>◆</i><span>ONNX</span><i>◆</i><span>Jetson</span><i>◆</i><span>Modal A100</span><i>◆</i><span>vLLM</span><i>◆</i>
    </div>`.repeat(2).replace("</div><div", "</div>\n    <div")}
  </div>
</div>

<!-- METRICS -->
<section class="metrics" aria-label="Key metrics">
  <div class="metrics-grid" data-rv-group>
    <div class="metric rv"><span class="metric-value"><span data-count="6">6</span></span><span class="metric-label">Pipelines benchmarked on A100s</span></div>
    <div class="metric rv"><span class="metric-value">~<span data-count="2">2</span><span class="unit">×</span>&thinsp;/&thinsp;<span data-count="5">5</span>–<span data-count="10">10</span><span class="unit">×</span></span><span class="metric-label">Precision / recall via selective refusal</span></div>
    <div class="metric rv"><span class="metric-value">~<span data-count="3">3</span><span class="unit">×</span>&thinsp;·&thinsp;<span data-count="6">6</span><span class="unit">×</span></span><span class="metric-label">CPU speedup · less memory @ 1-bit</span></div>
    <div class="metric rv"><span class="metric-value"><span data-count="0.676" data-decimals="3">0.676</span></span><span class="metric-label">Real-world mIoU · indoor seg</span></div>
    <div class="metric rv"><span class="metric-value"><span data-count="1458" data-comma>1,458</span></span><span class="metric-label">Images hand-labeled</span></div>
    <div class="metric rv"><span class="metric-value"><span data-count="97.3" data-decimals="1">97.3</span><span class="unit">%</span></span><span class="metric-label">CIFAR-10 ensemble accuracy</span></div>
  </div>
</section>

<!-- ABOUT (short) -->
<section style="padding-top:clamp(4rem,8vw,7rem)" aria-labelledby="about-h">
  <div class="sec-head">
    <span class="sec-num">01/</span>
    <h2 class="sec-title rv" id="about-h">About</h2>
  </div>
  <div class="prose rv">
    <p>Independent researcher in Hyderabad studying where modern perception stacks break: <strong>calibration under uncertainty, benchmark contamination, extreme quantization, and the sim-to-real gap</strong>.</p>
    <p>By day — lead of a 3-person perception &amp; edge-ML team at <strong>Cybertronix</strong>, owning the full stack from cloud A100 benchmarking down to ARM deployment on an autonomous indoor robot. <a class="u-sweep acc" href="about/">Full bio →</a></p>
  </div>
</section>

<!-- FEATURED RESEARCH -->
<section style="padding-top:clamp(4rem,8vw,7rem)" aria-labelledby="feat-h">
  <div class="sec-head">
    <span class="sec-num">02/</span>
    <h2 class="sec-title rv" id="feat-h">Featured Research</h2>
  </div>
  <div class="feat-grid" data-rv-group>
    ${FEATURED.map(({ f, stat }) => `<a class="feat-card rv" href="research/${f.slug}/">
      <span class="rx-id mono">${f.id}<span class="rx-status">${f.status}</span></span>
      <h3>${f.title}</h3>
      <p>${f.abstract}</p>
      <span class="feat-stat">${stat}</span>
      <span class="feat-link">Read finding →</span>
    </a>`).join("\n    ")}
  </div>
  <p class="rv" style="padding:2rem var(--pad) 0"><a class="btn" href="research/"><span>Full Research Index</span><span class="arrow" aria-hidden="true">→</span></a></p>
</section>`;

/* ============================================================ RESEARCH */
const researchMain = `
<section class="research" style="padding-top:clamp(2.5rem,6vw,4.5rem)" aria-labelledby="rx-h">
  <div class="sec-head">
    <span class="sec-num">01/</span>
    <h2 class="sec-title rv" id="rx-h">Research Index</h2>
  </div>
  <div class="prose rv" style="margin-bottom:clamp(2.5rem,5vw,4rem)">
    <p><span class="mono acc" style="font-size:11px;letter-spacing:.2em;text-transform:uppercase">Index of findings — F-01…F-04</span></p>
    <p style="margin-top:.8rem">Four studies on where modern perception stacks break: calibration under uncertainty, benchmark contamination, extreme quantization, and the sim-to-real gap. Each entry is a paper-style abstract — open a finding for its shareable permalink.</p>
  </div>
  <div class="rx-list">
    ${FINDINGS.map((f) => `<article class="rx-card rv" id="${f.slug}">
      <div class="rx-card-head">
        <span class="rx-id">${f.id}</span>
        <span class="rx-status">${f.status}</span>
      </div>
      <h3 class="rx-title"><a href="${f.slug}/">${f.title}</a></h3>
      <div class="rx-body">
        ${rowsHtml(f)}
        ${figHtml(f)}
      </div>
      <a class="rx-perma u-sweep" href="${f.slug}/">Permalink · /research/${f.slug} →</a>
    </article>`).join("\n    ")}
  </div>
</section>`;

/* ============================================================ FINDING PAGES */
function findingMain(f, i) {
  const prev = FINDINGS[i - 1], next = FINDINGS[i + 1];
  return `
<article class="paper">
  <nav class="paper-crumb" aria-label="Breadcrumb">
    <a href="../">Research Index</a><span aria-hidden="true">/</span><span class="acc">${f.id}</span><span>${f.status}</span>
  </nav>
  <h1 class="paper-title rv">${f.title}</h1>
  <p class="paper-status rv">${IDENT.name} · Hyderabad, IN</p>
  <div class="paper-grid">
    <div class="rv">${rowsHtml(f)}</div>
    <div class="rv">${figHtml(f)}</div>
  </div>
  <nav class="paper-nav" aria-label="Finding navigation">
    <span>${prev ? `<a href="../${prev.slug}/">← ${prev.id} ${prev.titlePlain || prev.title}</a>` : ""}</span>
    <a href="../">All findings</a>
    <span>${next ? `<a href="../${next.slug}/">${next.id} ${next.titlePlain || next.title} →</a>` : ""}</span>
  </nav>
</article>`;
}

/* ============================================================ ABOUT */
const aboutMain = `
<section style="padding-top:clamp(2.5rem,6vw,4.5rem)" aria-labelledby="bio-h">
  <div class="sec-head">
    <span class="sec-num">01/</span>
    <h2 class="sec-title rv" id="bio-h">About</h2>
  </div>
  <div class="prose rv">
    <p><strong>${IDENT.name}</strong> — ML &amp; Edge AI Engineer / Independent Researcher, Hyderabad, India.</p>
    <p>I study how vision-language models <span class="acc">fail</span> — and make them run where they shouldn't. My work sits at the intersection of <strong>VLM reliability &amp; calibration, extreme quantization (1-bit), edge inference, and sim-to-real transfer</strong>: benchmarking frontier vision-language pipelines on cloud A100s, then compressing what survives down to CPU/ARM edge hardware.</p>
    <p>The through-line: <strong>failure is data</strong>. Refusal behavior, silent training failures, and sim-to-real gaps are measurable, family-specific properties — and picking models by failure mode beats picking them by leaderboard rank.</p>
    <p style="margin-top:1.6rem"><a class="btn" href="../assets/resume.pdf" download="Mohammed-Faisal-Parvez-Resume.pdf"><span>Download Resume (PDF)</span><span class="arrow" aria-hidden="true">↓</span></a></p>
  </div>
</section>

<section style="padding-top:clamp(4rem,8vw,7rem)" aria-labelledby="xp-h">
  <div class="sec-head">
    <span class="sec-num">02/</span>
    <h2 class="sec-title rv" id="xp-h">Experience</h2>
  </div>
  <div class="xp-list" data-rv-group>
    <div class="xp-item rv">
      <div>
        <span class="xp-when">Nov 2024 — Present</span>
        <h3 class="xp-org">Cybertronix</h3>
        <span class="xp-role">ML &amp; Robotics Engineer</span>
      </div>
      <p class="xp-desc">Lead of a <strong>3-person perception &amp; edge-ML team</strong> for an autonomous indoor floor-cleaning robot. Owns the full stack — from <strong>cloud A100 benchmarking</strong> down to <strong>ARM deployment</strong>.</p>
    </div>
    <div class="xp-item rv">
      <div>
        <span class="xp-when">Aug — Sep 2023</span>
        <h3 class="xp-org">Huntmetrics</h3>
        <span class="xp-role">Cybersecurity Trainee</span>
      </div>
      <p class="xp-desc">Packet capture &amp; protocol analysis (<strong>TCP/IP, DNS, HTTP</strong>) with Wireshark on self-hosted labs.</p>
    </div>
  </div>
</section>

<section style="padding-top:clamp(4rem,8vw,7rem)" aria-labelledby="caps-h">
  <div class="sec-head">
    <span class="sec-num">03/</span>
    <h2 class="sec-title rv" id="caps-h">Capabilities</h2>
  </div>
  <dl class="caps-sheet rv">
    <div class="caps-sheet-head"><span>Spec sheet — MFP-2026</span><span>rev 3.0</span></div>
    <div class="caps-row"><dt>Core ML</dt><dd><b>Python · PyTorch · ONNX · TensorRT · HF Transformers · vLLM</b> — GPTQ / AWQ / 1-bit quantization, semantic segmentation, VLM benchmarking &amp; ablation design</dd></div>
    <div class="caps-row"><dt>Edge</dt><dd><b>llama.cpp · bitnet.cpp · Jetson Nano</b> — ARM inference · FP16 / INT8 / 1-bit</dd></div>
    <div class="caps-row"><dt>Cloud &amp; Tools</dt><dd><b>Modal (A100) · Docker · Linux</b> — Git, Bash, CVAT, Gazebo</dd></div>
    <div class="caps-row"><dt>Robotics &amp; Sim</dt><dd>ManiSkill · MuJoCo · PyBullet · Nav2</dd></div>
    <div class="caps-row"><dt>Languages</dt><dd>Python <b>(strong)</b> · C++ (basic) — English · Hindi · Urdu · Arabic</dd></div>
  </dl>
</section>

<section style="padding-top:clamp(4rem,8vw,7rem)" aria-labelledby="edu-h">
  <div class="sec-head">
    <span class="sec-num">04/</span>
    <h2 class="sec-title rv" id="edu-h">Education &amp; Recognition</h2>
  </div>
  <div class="edu-grid" data-rv-group>
    <div class="edu-cell rv">
      <span class="edu-k">Degree</span>
      <h3>B.E. — Artificial Intelligence &amp; Machine Learning</h3>
      <p>Lords Institute of Engineering &amp; Technology (Osmania University), 2025 · <span class="acc">CGPA 8.2/10</span></p>
    </div>
    <div class="edu-cell rv">
      <span class="edu-k">Certification</span>
      <h3>NPTEL Big Data Computing — <span class="acc">Elite Silver</span></h3>
      <p>Hadoop · Spark · Kafka</p>
    </div>
    <div class="edu-cell rv">
      <span class="edu-k">Certification</span>
      <h3>Responsible &amp; Safe AI Systems</h3>
      <p>IIIT-Hyderabad / IIT-Madras</p>
    </div>
    <div class="edu-cell rv">
      <span class="edu-k">Award</span>
      <h3><span class="acc">First Prize</span> — College Expo</h3>
      <p>ResNet-50 / VGG16 / Xception ensemble · 97.3% on CIFAR-10</p>
    </div>
    <div class="edu-cell rv">
      <span class="edu-k">Speaking</span>
      <h3>Speaker — Microsoft Student Club 2024</h3>
      <p>Introduction to Azure · 150+ attendees</p>
    </div>
    <div class="edu-cell rv">
      <span class="edu-k">Status</span>
      <h3>Open to research collaborations</h3>
      <p>VLM reliability · edge inference · quantization</p>
    </div>
  </div>
</section>`;

/* ============================================================ MODELS */
const modelsMain = `
<section style="padding-top:clamp(2.5rem,6vw,4.5rem)" aria-labelledby="models-h">
  <div class="sec-head">
    <span class="sec-num">01/</span>
    <h2 class="sec-title rv" id="models-h">Open Models</h2>
  </div>
  <a class="model-card rv" href="${IDENT.hf}" target="_blank" rel="noopener">
    <div>
      <span class="model-tag">huggingface.co/Mohaaxa ↗</span>
      <h3>Published GPTQ &amp; AWQ quantized Qwen2.5-1.5B — with model cards documenting calibration data &amp; methodology.</h3>
      <p>Benchmarked quantized SmolVLM on Jetson Nano via llama.cpp — real edge numbers, not extrapolations.</p>
      <div class="model-chips">
        <span class="chip">GPTQ</span><span class="chip">AWQ</span><span class="chip">Qwen2.5-1.5B</span><span class="chip">SmolVLM</span><span class="chip">Jetson Nano</span><span class="chip">llama.cpp</span>
      </div>
    </div>
    <span class="model-cta">Open weights →</span>
  </a>
  <div class="prose rv" style="margin-top:clamp(2rem,4vw,3rem)">
    <p>Every released quantization ships with a model card covering <strong>calibration data, method, and measured trade-offs</strong> — the same standard the research holds benchmarks to. Related reading: <a class="u-sweep acc" href="../research/1bit-vision/">F-03 · Vision on 1-bit LLMs</a>.</p>
  </div>
</section>`;

/* ============================================================ 404 */
const nfMain = `
<section class="nf" aria-labelledby="nf-h">
  <p class="nf-code" id="nf-h">4<em>0</em>4</p>
  <p class="nf-msg">Route not found — this path returned a null prediction.</p>
  <div style="display:flex;gap:.9rem;flex-wrap:wrap">
    <a class="btn btn--accent" href="/"><span>Home</span><span class="arrow" aria-hidden="true">→</span></a>
    <a class="btn" href="/research/"><span>Research Index</span><span class="arrow" aria-hidden="true">→</span></a>
  </div>
</section>`;

/* ============================================================ WRITE PAGES */
function write(rel, html) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html);
  console.log("wrote", rel, "(" + html.length + " bytes)");
}

write("index.html", shell({
  headHtml: head({
    title: "Mohammed Faisal Parvez — ML & Edge AI Researcher",
    desc: "I study how vision-language models fail — and make them run where they shouldn't. VLM reliability & calibration · extreme 1-bit quantization · edge inference · sim-to-real transfer. Hyderabad, India.",
    prefix: "", url: "/", extra: jsonLd,
  }),
  active: "home", prefix: "", mainHtml: homeMain,
}));

write("research/index.html", shell({
  headHtml: head({
    title: "Research Index — Mohammed Faisal Parvez",
    desc: "Four findings on where perception stacks break: selective refusal as calibration, prompt priming vs visual attribution, vision on 1-bit LLMs, and the sim-to-real segmentation gap.",
    prefix: "../", url: "/research/",
  }),
  active: "research", prefix: "../", mainHtml: researchMain,
}));

FINDINGS.forEach((f, i) => {
  write(`research/${f.slug}/index.html`, shell({
    headHtml: head({
      title: `${f.id} · ${f.titlePlain || f.title} — Mohammed Faisal Parvez`,
      desc: f.metaDesc,
      prefix: "../../", url: `/research/${f.slug}/`,
    }),
    active: "research", prefix: "../../", mainHtml: findingMain(f, i),
  }));
});

write("about/index.html", shell({
  headHtml: head({
    title: "About — Mohammed Faisal Parvez",
    desc: "ML & Edge AI Engineer at Cybertronix, independent researcher in Hyderabad. Experience, capabilities spec-sheet, education, awards, and languages.",
    prefix: "../", url: "/about/",
  }),
  active: "about", prefix: "../", mainHtml: aboutMain,
}));

write("models/index.html", shell({
  headHtml: head({
    title: "Open Models — Mohammed Faisal Parvez",
    desc: "Published GPTQ & AWQ quantized Qwen2.5-1.5B with documented calibration methodology; SmolVLM benchmarked on Jetson Nano via llama.cpp. Open weights on HuggingFace.",
    prefix: "../", url: "/models/",
  }),
  active: "models", prefix: "../", mainHtml: modelsMain,
}));

write("404.html", shell({
  headHtml: head({
    title: "404 — Mohammed Faisal Parvez",
    desc: "Page not found.",
    prefix: "/", url: "/404",
  }),
  active: "", prefix: "/", mainHtml: nfMain,
}));

/* ============================================================ OG IMAGE SOURCE */
write("assets/og-src.html", `<!DOCTYPE html>
<html><head><meta charset="utf-8">${FONTS}
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#050507;color:#f2f0ea;font-family:"Inter",sans-serif;overflow:hidden;position:relative;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(242,240,234,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(242,240,234,.04) 1px,transparent 1px);background-size:80px 80px}
.glow{position:absolute;top:-20%;right:-10%;width:700px;height:700px;background:radial-gradient(circle,rgba(49,232,255,.12) 0%,transparent 60%)}
.mono{font-family:"JetBrains Mono",monospace;font-size:18px;letter-spacing:.2em;text-transform:uppercase;color:rgba(242,240,234,.55)}
.mono b{color:#31e8ff;font-weight:400}
h1{font-family:"Space Grotesk",sans-serif;font-weight:600;font-size:104px;line-height:.95;letter-spacing:-.04em;text-transform:uppercase;position:relative}
h1 .thin{font-weight:300;color:rgba(242,240,234,.6)}
h1 em{font-style:normal;color:#31e8ff}
.st{font-family:"Space Grotesk",sans-serif;font-size:30px;font-weight:400;color:rgba(242,240,234,.8);max-width:30ch;position:relative}
.st em{font-style:normal;color:#31e8ff}
.bar{position:absolute;left:0;bottom:0;height:6px;width:100%;background:linear-gradient(90deg,#31e8ff,rgba(49,232,255,.2))}
.row{display:flex;justify-content:space-between;align-items:flex-end;position:relative}
</style></head><body>
<div class="grid"></div><div class="glow"></div>
<div class="mono">MFP<b>·</b>RESEARCH — VLM RELIABILITY · 1-BIT QUANTIZATION · EDGE INFERENCE</div>
<div>
  <h1>Mohammed<br><span class="thin">Faisal</span> Parvez<em>.</em></h1>
</div>
<div class="row">
  <div class="st">I study how vision-language models <em>fail</em> — and make them run where they shouldn't.</div>
  <div class="mono">Hyderabad, IN</div>
</div>
<div class="bar"></div>
</body></html>
`);

/* ============================================================ RESUME SOURCE */
write("assets/resume-src.html", `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Mohammed Faisal Parvez — Resume</title>${FONTS}
<style>
*{margin:0;box-sizing:border-box}
@page{size:A4;margin:0}
body{font-family:"Inter",sans-serif;font-size:9pt;line-height:1.45;color:#111;width:210mm;min-height:297mm;padding:10mm 14mm;font-weight:400}
.mono{font-family:"JetBrains Mono",monospace}
h1{font-family:"Space Grotesk",sans-serif;font-weight:600;font-size:23pt;letter-spacing:-.02em;line-height:1.05}
h1 span{color:#00b8cc}
.tag{font-family:"JetBrains Mono",monospace;font-size:8pt;letter-spacing:.12em;text-transform:uppercase;color:#555;margin-top:2mm}
.contact{font-family:"JetBrains Mono",monospace;font-size:7.5pt;color:#333;margin-top:2mm;letter-spacing:.02em}
.contact a{color:#00879c;text-decoration:none}
h2{font-family:"JetBrains Mono",monospace;font-size:7.5pt;letter-spacing:.22em;text-transform:uppercase;color:#00879c;border-bottom:1px solid #ddd;padding-bottom:1mm;margin:4.2mm 0 2.2mm}
.item{margin-bottom:2.2mm}
.item .hd{display:flex;justify-content:space-between;gap:4mm;align-items:baseline}
.item .hd b{font-family:"Space Grotesk",sans-serif;font-weight:600;font-size:10.5pt}
.item .hd span{font-family:"JetBrains Mono",monospace;font-size:7.5pt;color:#666;white-space:nowrap}
.item .sub{font-family:"JetBrains Mono",monospace;font-size:7.5pt;letter-spacing:.06em;text-transform:uppercase;color:#555}
.item p,li{color:#333}
ul{padding-left:4.5mm}
li{margin-bottom:.7mm}
li b{color:#111}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 8mm}
table{width:100%;border-collapse:collapse}
td{padding:1.4mm 0;vertical-align:top;border-bottom:1px solid #eee}
td:first-child{font-family:"JetBrains Mono",monospace;font-size:7.5pt;letter-spacing:.1em;text-transform:uppercase;color:#00879c;width:26mm;padding-right:4mm}
.summary{color:#333;max-width:170mm}
.summary b{color:#111}
</style></head><body>
<h1>Mohammed Faisal Parvez<span>.</span></h1>
<div class="tag">ML &amp; Edge AI Engineer · Independent Researcher — Hyderabad, India</div>
<div class="contact">${IDENT.email} · ${IDENT.phonePretty} · github.com/faisalhacks · huggingface.co/Mohaaxa · linkedin.com/in/mohammed-faisal-parvez-621368241</div>

<h2>Summary</h2>
<p class="summary">I study how vision-language models fail — and make them run where they shouldn't. Focus: <b>VLM reliability &amp; calibration, extreme quantization (1-bit), edge inference, sim-to-real transfer</b> — benchmarking frontier VLM pipelines on cloud A100s, then compressing what survives down to CPU/ARM edge hardware.</p>

<h2>Research Findings</h2>
<ul>
  <li><b>Selective Refusal as Protective Calibration</b> — six-pipeline VLM benchmark (Qwen2.5-VL 3B/7B/72B, InternVL2-2B) on Modal A100s; refusal-calibrated family reached <b>~2× precision, 5–10× recall</b> on engaged robot-perception frames.</li>
  <li><b>Prompt Priming Masquerading as Visual Attribution</b> — marker × prompt ablation showed a claimed visual effect was prompt-text priming: <b>9.4pp from wording vs ≤0.2pp from markers</b>.</li>
  <li><b>Vision on 1-bit LLMs</b> — grafted vision onto BitNet/Falcon3 1-bit LLMs; identified &amp; one-line-fixed a silent boundary-supervision failure; measured <b>~3× CPU speedup, ~6× lower memory</b> vs 4-bit baselines.</li>
  <li><b>The Sim-to-Real Gap in Indoor Segmentation</b> (manuscript in prep.) — SegFormer-B0 on a self-labeled 1,458-image real dataset: <b>0.676 real mIoU</b> vs a synthetic-trained counterpart's misleading 0.988 val mIoU.</li>
</ul>

<h2>Experience</h2>
<div class="item">
  <div class="hd"><b>Cybertronix — ML &amp; Robotics Engineer</b><span>Nov 2024 — Present</span></div>
  <p>Lead of a 3-person perception &amp; edge-ML team for an autonomous indoor floor-cleaning robot; own the full stack from cloud A100 benchmarking down to ARM deployment.</p>
</div>
<div class="item">
  <div class="hd"><b>Huntmetrics — Cybersecurity Trainee</b><span>Aug — Sep 2023</span></div>
  <p>Packet capture &amp; protocol analysis (TCP/IP, DNS, HTTP) with Wireshark on self-hosted labs.</p>
</div>

<h2>Open Models</h2>
<p class="summary">Published <b>GPTQ &amp; AWQ quantized Qwen2.5-1.5B</b> on HuggingFace (Mohaaxa) with model cards documenting calibration data &amp; methodology; benchmarked quantized SmolVLM on Jetson Nano via llama.cpp.</p>

<h2>Skills</h2>
<table>
  <tr><td>Core ML</td><td>Python, PyTorch, ONNX, TensorRT, HF Transformers, vLLM, GPTQ/AWQ/1-bit quantization, semantic segmentation, VLM benchmarking &amp; ablation design</td></tr>
  <tr><td>Edge</td><td>llama.cpp, bitnet.cpp, Jetson Nano, ARM inference, FP16/INT8/1-bit</td></tr>
  <tr><td>Cloud &amp; Tools</td><td>Modal (A100), Docker, Linux, Git, Bash, CVAT, Gazebo</td></tr>
  <tr><td>Robotics &amp; Sim</td><td>ManiSkill, MuJoCo, PyBullet, Nav2</td></tr>
  <tr><td>Languages</td><td>Python (strong), C++ (basic) · English, Hindi, Urdu, Arabic</td></tr>
</table>

<div class="grid2">
<div>
<h2>Education</h2>
<div class="item">
  <div class="hd"><b>B.E. — AI &amp; Machine Learning</b><span>2025</span></div>
  <div class="sub">Lords Institute of Engineering &amp; Technology (Osmania University) · CGPA 8.2/10</div>
</div>
</div>
<div>
<h2>Recognition</h2>
<ul>
  <li><b>First Prize, College Expo</b> — ResNet-50/VGG16/Xception ensemble, 97.3% on CIFAR-10</li>
  <li><b>NPTEL Big Data Computing</b> — Elite Silver (Hadoop, Spark, Kafka)</li>
  <li><b>Responsible &amp; Safe AI Systems</b> — IIIT-H / IIT-M</li>
  <li><b>Speaker</b>, Microsoft Student Club 2024 — Azure intro, 150+ attendees</li>
</ul>
</div>
</div>
</body></html>
`);

console.log("\nbuild complete.");
