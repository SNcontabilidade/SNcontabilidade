// ═══ Layout moderno (v1.3.0) — carregado por index.html e admin.html, DEPOIS do app.js ═══════════════════════════
// Só apresentação: usa os mesmos números que o app já calcula e não altera nenhum dado.
//  (1) ícones: troca só a URL de ENTREGA do Cloudinary (tamanho, formato, cantos); nenhum arquivo original muda;
//  (2) cartão de Saldo do painel do cliente (snPainelHero, chamado por screenPainel no app.js);
//  (3) gráficos refeitos (Chart.js): envolve buildClientCharts/buildAdminCharts e restiliza o que elas criam.
// Se algo aqui falhar, o app continua funcionando (cada bloco é protegido) — só volta ao visual simples.

// ── (1) ícones ───────────────────────────────────────────────────────────────
(function () {
  const BANCOS = new Set(['CAIXA','ITAU','BRADESCO','SANTANDER','BANCO DO BRASIL','INTER','C6','NUBANK','MERCADO PAGO','CITIBANK','BTG','BGT']);
  const OPS = new Set(['receita','retirada','bens','estoque','despesa','aporte','investimento','emprestimo','entre_bancos','clientes','total_lanc','saldo','saldo_consol','operacoes','painel','novo','lista','historico','grafico','tipos']);
  // ícones com contorno PRETO: somem no tema escuro, ganham um halo claro bem leve
  const HALO = new Set(['estoque','painel','historico','grafico','tipos','lista','operacoes','total_lanc']);
  // 2x o tamanho exibido (telas retina), arredondado de 16 em 16, entre 64 e 256
  const largura = (px) => Math.min(256, Math.max(64, Math.ceil((px || 32) * 2 / 16) * 16));
  // devolve a URL otimizada, ou null se não for um ícone que a gente trate
  function melhorar(src, alt, px) {
    if (!src || !src.includes('res.cloudinary.com') || !src.includes('/upload/')) return null;
    const a = String(alt || ''), w = largura(px), r = Math.round(w * 0.22);
    let t;
    if (BANCOS.has(a.toUpperCase()))       t = `c_fill,ar_1:1,g_center,w_${w},r_${r},f_auto,q_auto`;           // quadrado, mesmo canto
    else if (a === 'bens')                 t = `c_fill,ar_1:1,w_${w},r_${r},f_auto,q_auto`;                    // era um quadrado duro
    else if (OPS.has(a))                   t = `e_trim/c_pad,ar_1:1,b_transparent,w_${w},f_auto,q_auto`;       // tira a margem e centraliza num quadrado
    else return null;
    return src.replace('/upload/', '/upload/' + t + '/');
  }
  try {
    const px = (img) => { const m = /width:\s*([\d.]+)px/.exec(img.getAttribute('style') || ''); return m ? parseFloat(m[1]) : 32; };
    const css = document.createElement('style');
    css.textContent = 'body:not(.light) img.sn-halo{filter:drop-shadow(0 0 1.2px rgba(255,255,255,.55)) drop-shadow(0 0 .4px rgba(255,255,255,.8))}' +
      'img.sn-banco,img.sn-bens{border-radius:0}';
    document.head.appendChild(css);
    const tratar = (img) => {
      if (img.dataset.snIc) return;
      const alt = img.getAttribute('alt'), novo = melhorar(img.getAttribute('src'), alt, px(img));
      if (!novo) return;
      img.dataset.snIc = '1';
      if (HALO.has(alt)) img.classList.add('sn-halo');
      img.src = novo;
    };
    const varrer = () => document.querySelectorAll('img[alt]').forEach(tratar);
    new MutationObserver(varrer).observe(document.documentElement, { childList: true, subtree: true });
    varrer();
  } catch (e) { console.warn('[layout] ícones', e && e.message); }
})();

// ── (2) cartão de Saldo + (3) gráficos ───────────────────────────────────────
(function () {
  const fmt = (v) => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const compacto = (v) => { const a = Math.abs(v); return 'R$ ' + (a >= 1e6 ? (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi' : a >= 1e3 ? (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : Math.round(v).toLocaleString('pt-BR')); };
  const claro = () => document.body.classList.contains('light');
  const cTxt = () => claro() ? '#6a7186' : '#8b92a5';
  const cGrade = () => claro() ? 'rgba(20,24,40,.07)' : 'rgba(255,255,255,.06)';

  // A legenda do saldo aparece ao abrir e some sozinha; o botão ⓘ mostra de novo (e ela some outra vez)
  const LEGENDA_MS = 7000;
  window.snHeroLegenda = function (mostrar) {
    const el = document.getElementById('sn-hero-sub'); if (!el) return;
    clearTimeout(window.__snLegT);
    if (mostrar) el.classList.remove('is-oculta');
    window.__snLegT = setTimeout(() => { const e = document.getElementById('sn-hero-sub'); if (e) e.classList.add('is-oculta'); }, LEGENDA_MS);
  };

  // Cartão de Saldo + cards menores (o app.js chama isto no lugar da grade de 6 cards)
  window.snPainelHero = function (d) {
    const nPend = d.txs.filter(isPend).length, somaPend = d.txs.filter(isPend).reduce((a, t) => a + t.valor, 0);
    // saldo acumulado dia a dia (mesma fórmula do card: só lançamentos pagos; fluxoSinal do app.js — receitas somam; despesas, compras e aplicações subtraem)
    // O gráfico é uma linha DIA A DIA: dia sem movimento repete o saldo do dia anterior. Antes só havia um ponto por dia com lançamento
    // pago, e com 0 ou 1 dia pago (tudo a pagar, por ex.) a linha tinha menos de 2 pontos e o gráfico sumia.
    const porDia = {};
    d.txs.filter((t) => !isPend(t)).forEach((t) => { const dia = (t.pagoEm || t.date || '').slice(0, 10); if (dia) porDia[dia] = (porDia[dia] || 0) + fluxoSinal(t.operation) * t.valor; });
    const datas = d.txs.map((t) => (t.date || '').slice(0, 10)).concat(Object.keys(porDia)).filter(Boolean).sort();
    const labels = [], data = [];
    if (datas.length) {
      const ms = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)), DIA = 86400000;
      let ini = ms(datas[0]); const fim = ms(datas[datas.length - 1]);
      if (fim === ini) ini -= DIA;                                  // um dia só: começa no dia anterior (saldo 0) para a linha ter 2 pontos
      let acc = 0;
      for (let t = ini; t <= fim; t += DIA) {
        const k = new Date(t).toISOString().slice(0, 10); acc += porDia[k] || 0;
        labels.push(k.slice(8) + '/' + k.slice(5, 7)); data.push(+acc.toFixed(2));
      }
    }
    window.__snSpark = { labels, data, positivo: d.saldo >= 0 };

    const ico = (u) => `<img src="${u}" alt="" style="width:30px;height:30px;object-fit:contain"/>`;
    const outrosIco = ico('https://res.cloudinary.com/dk10wezy9/image/upload/v1777141665/Outros_aebx7k.png');
    const mini = (cor, icone, val, lbl) => `<div class="sn-mini" style="--c:${cor}"><div class="sn-mini__ico">${icone}</div><div class="sn-mini__body"><div class="sn-mini__val" style="color:${cor}">${val}</div><div class="sn-mini__lbl">${lbl}</div></div></div>`;
    const pos = d.saldo >= 0;
    setTimeout(() => window.snHeroLegenda(false), 0);
    return `<section class="sn-hero ${pos ? 'is-pos' : 'is-neg'}">
        <div class="sn-hero__main">
          <div class="sn-hero__label">Saldo do período <span class="sn-hero__per">${d.periodo}</span><button type="button" class="sn-hero__info" onclick="snHeroLegenda(true)" title="Ver como o saldo é calculado" aria-label="Ver como o saldo é calculado">ⓘ</button></div>
          <div class="sn-hero__val">${fmt(d.saldo)}</div>
          <div class="sn-hero__sub" id="sn-hero-sub">${[
            fmt(d.liq.rec) + ' de receitas',
            d.liq.desp ? '− ' + fmt(d.liq.desp) + ' de despesas' : '',
            d.liq.compras ? '− ' + fmt(d.liq.compras) + ' de compras (estoque e bens)' : '',
            d.liq.aplic ? '− ' + fmt(d.liq.aplic) + ' de aplicações' : '',
            nPend ? '· pendentes só descontam depois de pagos' : '',
          ].filter(Boolean).join(' ')}</div>
          ${nPend ? `<button class="sn-hero__pend" onclick="showPendentes()">⏳ ${fmt(somaPend)} a pagar · ${nPend} lançamento${nPend > 1 ? 's' : ''} pendente${nPend > 1 ? 's' : ''} <span>→</span></button>` : ''}
        </div>
        <div class="sn-hero__spark"><canvas id="sn-spark" aria-label="Evolução do saldo no período"></canvas></div>
      </section>
      <div class="sn-minis">
        ${mini('var(--success)', opImg('receita', '30px'), fmt(d.rec), 'Receitas')}
        ${mini('var(--danger)', opImg('despesa', '30px'), fmt(d.desp), 'Despesas')}
        ${mini('var(--accent)', outrosIco, fmt(d.outros), 'Outros')}
        ${mini('#14b8a6', opImg('investimento', '30px'), fmt(d.aplic), 'Aplicações')}
        ${mini('var(--blue)', opImg('total_lanc', '30px'), d.txs.length, 'Lançamentos')}
      </div>`;
  };

  // Gráficos refeitos
  try { Chart.defaults.font.family = "'Inter',-apple-system,'Segoe UI',sans-serif"; } catch (e) { /* sem Chart.js: ignora */ }
  try {
    Chart.register({
      id: 'snCentro',
      afterDraw(ch) {
        const o = ch.options.plugins && ch.options.plugins.snCentro; if (!o || !o.texto) return;
        const a = ch.chartArea, x = (a.left + a.right) / 2, y = (a.top + a.bottom) / 2, c = ch.ctx;
        c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = cTxt(); c.font = '600 10.5px Inter, sans-serif'; c.fillText(o.titulo, x, y - 13);
        c.fillStyle = claro() ? '#161a26' : '#eceef4'; c.font = '800 17px Inter, sans-serif'; c.fillText(o.texto, x, y + 7);
        c.restore();
      },
    });
  } catch (e) { console.warn('[layout] plugin', e && e.message); }
  const dica = (valorDe) => ({
    backgroundColor: 'rgba(11,13,18,.96)', titleColor: '#fff', bodyColor: '#d6d9e3', borderColor: 'rgba(255,255,255,.1)', borderWidth: 1,
    padding: 12, cornerRadius: 12, boxPadding: 5, usePointStyle: true, titleFont: { weight: '700', size: 12 }, bodyFont: { size: 12 },
    callbacks: { label: (c) => ' ' + (c.dataset.label || c.label) + ': ' + fmt(valorDe(c)) },
  });
  const degrade = (c1, c2) => (ctx) => { const a = ctx.chart.chartArea; if (!a) return c1; const g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, c1); g.addColorStop(1, c2); return g; };

  function restilizar(ch) {
    const o = ch.options;   // (proxy do Chart.js: não reatribuir plugins/scales a si mesmos)
    if (ch.config.type === 'bar') {
      ch.data.datasets.forEach((ds, i) => {
        ds.borderRadius = 8; ds.borderSkipped = false; ds.maxBarThickness = 22; ds.borderWidth = 0;
        ds.backgroundColor = i === 0 ? degrade('#2be0b0', '#0f9f78') : degrade('#ff7a80', '#d93f45');
      });
      o.animation = { duration: 800, easing: 'easeOutQuart' };
      o.interaction = { mode: 'index', intersect: false };
      o.plugins.legend = { align: 'end', labels: { color: cTxt(), usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 14, font: { size: 11, weight: '500' } } };
      o.plugins.tooltip = dica((c) => c.parsed.y);
      o.scales.x = { grid: { display: false }, border: { display: false }, ticks: { color: cTxt(), font: { size: 10.5 }, maxRotation: 0, autoSkip: true } };
      o.scales.y = { beginAtZero: true, grid: { color: cGrade(), drawTicks: false }, border: { display: false }, ticks: { color: cTxt(), font: { size: 10.5 }, padding: 8, callback: (v) => (v >= 1000 ? (v / 1000) + 'k' : v) } };
    } else if (ch.config.type === 'doughnut' || ch.config.type === 'pie') {
      ch.config.type = 'doughnut';
      const ds = ch.data.datasets[0], total = ds.data.reduce((a, b) => a + b, 0);
      ds.borderWidth = 0; ds.spacing = 3; ds.borderRadius = 8; ds.hoverOffset = 8;
      o.cutout = '72%'; o.animation = { duration: 900, easing: 'easeOutQuart' };
      o.plugins.legend = { position: 'bottom', labels: { color: cTxt(), usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 12, font: { size: 11, weight: '500' } } };
      o.plugins.tooltip = dica((c) => c.parsed);
      o.plugins.tooltip.callbacks.label = (c) => ' ' + c.label + ': ' + fmt(c.parsed) + '  (' + (total ? Math.round(c.parsed / total * 100) : 0) + '%)';
      o.plugins.snCentro = { titulo: 'MOVIMENTADO', texto: compacto(total) };
    }
    ch.update();
  }
  function minigrafico() {
    const cv = document.getElementById('sn-spark'), sp = window.__snSpark;
    if (!cv || !sp || sp.data.length < 2) return;
    const col = sp.positivo ? '#19c39a' : '#f0555a';
    S.charts.spark = new Chart(cv, {
      type: 'line',
      data: { labels: sp.labels, datasets: [{ data: sp.data, borderColor: col, borderWidth: 2.6, tension: 0.42, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: col, fill: true,
        backgroundColor: (ctx) => { const a = ctx.chart.chartArea; if (!a) return 'transparent'; const g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, col + '55'); g.addColorStop(1, col + '00'); return g; } }] },
      options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1000, easing: 'easeOutQuart' }, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: dica((c) => c.parsed.y) }, scales: { x: { display: false }, y: { display: false } }, layout: { padding: { top: 6, bottom: 2 } } },
    });
  }

  // envolve as funções do app: roda a original e depois restiliza o que ela criou.
  // (sem render() aqui: os scripts carregam antes do 1º desenho real, que só acontece depois do login/carga de dados)
  const origCliente = buildClientCharts, origAdmin = buildAdminCharts;
  const seguro = (ch) => { try { restilizar(ch); } catch (e) { console.warn('[layout] restilizar', ch.config.type, e && e.message); } };
  buildClientCharts = function () { origCliente(); Object.values(S.charts).forEach(seguro); try { minigrafico(); } catch (e) { console.warn('[layout] mini', e && e.message); } };
  buildAdminCharts = function () { origAdmin(); Object.values(S.charts).forEach(seguro); };
})();
