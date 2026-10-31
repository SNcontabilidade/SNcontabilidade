// ═══ DE-PARA · tela do admin ═════════════════════════════════════════════════
// Planilha/PDF de lançamentos → .txt para importar no Contmatic.
// Depende de depara-core.js (lógica pura) e, do app, de: S, uid, fsGet, fsSet, loadSheetJS.
// Clientes ficam no Firestore, coleção "sn" (a mesma do app — sem regra nova):
//   sn/depara_index  → { value: [ {id, nome} ] }
//   sn/depara_c_<id> → { value: { ...config do cliente } }
// (não há exportar/importar .json: a configuração já fica no Firestore, por cliente)
// O ARQUIVO enviado nunca sai do navegador: só a configuração (contas, regras, layout) é gravada.

const DP_COR = { data: '#4c8dff', valor: '#19c39a', valorEntrada: '#84cc16', fornecedor: '#a06bff', historico: '#f5a524', extras: '#fb923c', banco: '#22c7d6', tipo: '#ec4899' };
const DP_ROTULO = { data: 'Data', valor: 'Valor', valorEntrada: 'Valor entrada', fornecedor: 'Fornecedor', historico: 'Histórico', extras: 'Histórico +', banco: 'Banco', tipo: 'Tipo' };
const DP_SECOES = ['cliente', 'arquivo', 'previa', 'mapa', 'interp', 'config', 'depara', 'regras', 'gerar'];

const dpState = {
  carregado: false, carregando: false, erro: '',
  clientes: [], atualId: '', cfg: null, modo: '',            // modo: '' | 'novo' | 'renomear'
  salvo: '', msgs: {},                                        // salvo: '' | 'salvando' | 'ok' | 'erro'
  arq: null,                                                  // { nome, ehPdf, abas:[{nome, linhas}], aba }
  linhaCab: -1, mapa: dpMapaVazio(),
  conf: null,                                                 // nota de confiança da leitura (dpConfianca)
  origemMapa: '',                                            // '' | 'auto' | 'layout' | 'manual'
  prevMax: 40, interpMax: 60, soProblemas: false, analise: null, confirmou: false,
  pdfGap: 18, pdfBuf: null,
  filtroDePara: '', soSemConta: false, novoDePara: false,
  regra: { id: null, keywords: [], banco: '', natureza: 'PAGAMENTO', conta: '', exemplo: '', filtroEx: '' },
};
let dpTimerSalvar = null, dpTimerAnalise = null;

const dpEsc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const dpLinhas = () => (dpState.arq ? dpState.arq.abas[dpState.arq.aba].linhas : []);
const dpMapaCompleto = () => dpState.mapa;
const dpTemMapa = () => dpState.mapa.data !== '' && dpState.mapa.valor !== '' && (dpState.mapa.fornecedor !== '' || dpState.mapa.historico !== '');
const dpMsg = (sec, texto, tipo) => { dpState.msgs[sec] = texto ? { texto, tipo: tipo || 'ok' } : null; };
const dpMsgHtml = (sec) => { const m = dpState.msgs[sec]; return m ? '<div class="dp-msg dp-msg--' + m.tipo + '">' + dpEsc(m.texto) + '</div>' : ''; };

// ── persistência (Firestore) ─────────────────────────────────────────────────
async function dpCarregarIndice() {
  const idx = await fsGet('depara_index');
  dpState.clientes = (Array.isArray(idx) ? idx : []).filter((c) => c && c.id).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
function dpSerializar(cfg) {                                    // mapa → lista: nome com "." ou "/" não vira problema de chave
  const o = Object.assign({}, cfg); o.deParaLista = Object.keys(cfg.deParaMap || {}).map((nome) => ({ nome, conta: cfg.deParaMap[nome] || '', codigo: (cfg.codigosMap || {})[nome] || '' })); delete o.deParaMap; delete o.codigosMap;
  o.atualizadoEm = new Date().toISOString(); return o;
}
function dpDeserializar(raw) {
  const r = raw && typeof raw === 'object' ? Object.assign({}, raw) : {};
  if (Array.isArray(r.deParaLista)) { r.deParaMap = {}; r.codigosMap = {}; r.deParaLista.forEach((x) => { if (x && x.nome) { r.deParaMap[x.nome] = x.conta || ''; if (x.codigo) r.codigosMap[x.nome] = String(x.codigo); } }); }
  return dpNormalizarConfig(r);
}
async function dpGravarIndice() { await fsSet('depara_index', dpState.clientes); }
function dpSalvarAgendado() {
  if (!dpState.atualId || !dpState.cfg) return;
  dpState.salvo = 'salvando'; dpAtualizarSelo();
  clearTimeout(dpTimerSalvar);
  dpTimerSalvar = setTimeout(async () => {
    try { await fsSet('depara_c_' + dpState.atualId, dpSerializar(dpState.cfg)); dpState.salvo = 'ok'; }
    catch (e) { dpState.salvo = 'erro'; console.error('[DE-PARA] salvar', e); }
    dpAtualizarSelo();
  }, 700);
}
function dpAtualizarSelo() {
  const el = document.getElementById('dp-selo'); if (!el) return;
  const t = { salvando: '⏳ salvando…', ok: '☁ salvo no Firebase', erro: '⚠ não consegui salvar — confira a conexão' }[dpState.salvo] || '';
  el.textContent = t; el.className = 'dp-selo dp-selo--' + (dpState.salvo || 'nada');
}

// ── clientes ─────────────────────────────────────────────────────────────────
function dpLimparArquivo() { dpState.arq = null; dpState.analise = null; dpState.linhaCab = -1; dpState.origemMapa = ''; dpState.confirmou = false; dpState.pdfBuf = null; dpState.conf = null; dpState.mapa = dpMapaVazio(); dpResetRegra(); }
async function dpTrocarCliente(id) {
  dpLimparArquivo(); dpState.modo = '';
  if (!id) { dpState.atualId = ''; dpState.cfg = null; dpRender(); return; }
  const raw = await fsGet('depara_c_' + id);
  dpState.atualId = id; dpState.cfg = dpDeserializar(raw); dpState.salvo = '';
  ['arquivo', 'regra', 'gerar'].forEach((k) => { dpState.msgs[k] = null; });        // o aviso do cliente (criado/importado) fica
  dpResetRegra(); dpRender();
}
function dpNomeAtual() { const c = dpState.clientes.find((x) => x.id === dpState.atualId); return c ? c.nome : ''; }
function dpModo(m) { dpState.modo = m; dpRenderSec('cliente'); const i = document.getElementById('dp-nome-in'); if (i) { i.focus(); i.select(); } }
async function dpConfirmarNome() {
  const nome = (document.getElementById('dp-nome-in') || {}).value || '';
  const limpo = nome.trim();
  if (!limpo) { dpMsg('cliente', 'Digite o nome do cliente.', 'warn'); return dpRenderSec('cliente'); }
  const dup = dpState.clientes.find((c) => dpNorm(c.nome) === dpNorm(limpo) && c.id !== (dpState.modo === 'renomear' ? dpState.atualId : ''));
  if (dup) { dpMsg('cliente', 'Já existe um cliente com esse nome.', 'warn'); return dpRenderSec('cliente'); }
  try {
    if (dpState.modo === 'novo') {
      const id = uid(); dpState.clientes.push({ id, nome: limpo });
      await fsSet('depara_c_' + id, dpSerializar(dpConfigVazia())); await dpGravarIndice();
      dpState.modo = ''; await dpTrocarCliente(id); dpMsg('cliente', 'Cliente "' + limpo + '" criado.', 'ok');
    } else {
      const c = dpState.clientes.find((x) => x.id === dpState.atualId); c.nome = limpo; await dpGravarIndice();
      dpState.modo = ''; dpMsg('cliente', 'Cliente renomeado para "' + limpo + '".', 'ok');
    }
    dpState.clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')); dpRenderSec('cliente'); dpRenderSec('gerar');
  } catch (e) { console.error(e); dpMsg('cliente', 'Não consegui salvar no Firebase. Confira a conexão e tente de novo.', 'erro'); dpRenderSec('cliente'); }
}
async function dpExcluirCliente() {
  if (!dpState.atualId) return;
  if (!confirm('Excluir o cliente "' + dpNomeAtual() + '" e todas as suas regras e DE-PARA salvos? Esta ação não pode ser desfeita.')) return;
  try {
    await firebase.firestore().collection('sn').doc('depara_c_' + dpState.atualId).delete();
    dpState.clientes = dpState.clientes.filter((c) => c.id !== dpState.atualId); await dpGravarIndice();
    dpState.atualId = ''; dpState.cfg = null; dpLimparArquivo(); dpMsg('cliente', 'Cliente excluído.', 'ok'); dpRender();
  } catch (e) { console.error(e); dpMsg('cliente', 'Não consegui excluir. Confira a conexão.', 'erro'); dpRenderSec('cliente'); }
}
function dpBaixar(conteudo, nome, tipo) {
  const blob = new Blob([conteudo], { type: tipo || 'application/octet-stream' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
// ── arquivo ──────────────────────────────────────────────────────────────────
function dpCarregarPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((ok, falha) => {
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => { try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; } catch (e) { /* segue */ } window.pdfjsLib ? ok(window.pdfjsLib) : falha(new Error('pdf.js')); };
    s.onerror = () => falha(new Error('pdf.js')); document.head.appendChild(s);
  });
}
function dpSoltou(ev) { ev.preventDefault(); if (ev.dataTransfer.files.length) dpAbrirArquivo(ev.dataTransfer.files[0]); }
function dpArquivoEscolhido(input) { const f = input.files[0]; input.value = ''; if (f) dpAbrirArquivo(f); }
function dpAbrirArquivo(file) {
  if (!dpState.cfg) { dpMsg('arquivo', 'Selecione ou crie um cliente antes de enviar a planilha.', 'warn'); return dpRenderSec('arquivo'); }
  const nome = (file.name || '').toLowerCase();
  if (!/\.(xlsx|xls|pdf)$/.test(nome)) { dpMsg('arquivo', 'Esse arquivo não parece ser uma planilha (.xlsx/.xls) nem um PDF.', 'warn'); return dpRenderSec('arquivo'); }
  dpMsg('arquivo', 'Lendo o arquivo…', 'info'); dpRenderSec('arquivo');
  const rd = new FileReader();
  rd.onerror = () => { dpMsg('arquivo', 'Não consegui ler esse arquivo do disco. Tente de novo.', 'erro'); dpRenderSec('arquivo'); };
  rd.onload = (ev) => dpAbrirBytes(ev.target.result, file.name);
  rd.readAsArrayBuffer(file);
}
async function dpAbrirBytes(buf, nomeArquivo) {
  const ehPdf = /\.pdf$/i.test(nomeArquivo);
  try {
    let abas;
    if (ehPdf) {
      await dpCarregarPdfJs(); dpState.pdfBuf = buf.slice(0);
      const linhas = await dpExtrairPdf(buf.slice(0), dpState.pdfGap);
      if (!linhas.length) throw new Error('PDF sem texto selecionável (imagem escaneada?)');
      abas = [{ nome: 'PDF', linhas }];
    } else {
      const X = await loadSheetJS();
      const wb = X.read(new Uint8Array(buf), { type: 'array', cellDates: false });     // datas chegam como número de série: sem erro de fuso
      abas = wb.SheetNames.map((n) => ({ nome: n, linhas: X.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: '', raw: true, blankrows: true }) }));
    }
    abas.forEach((a) => { a.vazia = a.linhas.every(dpLinhaVazia); });
    const primeira = Math.max(0, abas.findIndex((a) => !a.vazia));
    if (abas.every((a) => a.vazia)) throw new Error('A planilha está vazia.');
    dpLimparArquivo(); dpState.arq = { nome: nomeArquivo, ehPdf, abas, aba: primeira };
    dpMsg('arquivo', '', ''); dpPrepararAba(); dpRender();
  } catch (e) {
    console.error('[DE-PARA] abrir', e);
    dpMsg('arquivo', ehPdf ? 'Não consegui ler esse PDF. Ele precisa ter texto selecionável (não pode ser imagem escaneada).' : 'Não consegui ler esse arquivo. Confirme que é um .xlsx/.xls válido, sem senha e não corrompido.', 'erro');
    dpRenderSec('arquivo');
  }
}
// escolhe cabeçalho e colunas: layout salvo do cliente (se a planilha for igual) ou detecção automática
function dpPrepararAba() {
  const linhas = dpLinhas(); dpState.prevMax = 40; dpState.interpMax = 60; dpState.confirmou = false;
  const cab = dpCabPadrao(linhas);
  const lay = dpState.cfg.layout;
  if (lay && lay.assinatura && lay.assinatura === dpAssinatura(linhas, lay.linhaCab) && lay.mapa) {
    dpState.linhaCab = lay.linhaCab; dpState.mapa = Object.assign(dpMapaVazio(), lay.mapa); dpState.mapa.extras = Array.isArray(dpState.mapa.extras) ? dpState.mapa.extras.slice() : []; dpState.origemMapa = 'layout';
  } else {
    dpState.linhaCab = cab; dpState.mapa = dpDetectarColunas(linhas, cab); dpState.origemMapa = 'auto';
  }
  dpReanalisar();
}
function dpTrocarAba(i) { dpState.arq.aba = i; dpPrepararAba(); dpRender(); }

// leitura aproximada de PDF: reconstrói colunas pela posição do texto (mesma lógica do conversor antigo)
async function dpExtrairPdf(arrayBuffer, gap) {
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise, todas = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const pag = await pdf.getPage(p), cont = await pag.getTextContent();
    const toks = cont.items.map((it) => ({ text: it.str, x: it.transform[4], y: it.transform[5], w: it.width || 0 })).filter((t) => t.text && t.text.trim() !== '');
    if (!toks.length) continue;
    toks.sort((a, b) => b.y - a.y || a.x - b.x);
    const linhas = [];
    toks.forEach((t) => { let l = linhas.find((q) => Math.abs(q.y - t.y) <= 2.5); if (!l) { l = { y: t.y, ws: [] }; linhas.push(l); } l.ws.push(t); });
    linhas.sort((a, b) => b.y - a.y);
    linhas.forEach((l) => { l.ws.sort((a, b) => a.x - b.x); const m = []; l.ws.forEach((w) => { const pr = m[m.length - 1]; if (pr && (w.x - (pr.x + pr.w)) < 1.5) { pr.text += w.text; pr.w = (w.x + w.w) - pr.x; } else m.push({ text: w.text, x: w.x, w: w.w }); }); l.ws = m; });
    todas.push(...linhas);
  }
  if (!todas.length) return [];
  const xs = []; todas.forEach((l) => l.ws.forEach((w) => xs.push(w.x))); xs.sort((a, b) => a - b);
  const cl = []; xs.forEach((x) => { const u = cl[cl.length - 1]; if (u && (x - u.max) <= gap) { u.max = x; u.soma += x; u.n++; } else cl.push({ max: x, soma: x, n: 1 }); });
  const centros = cl.map((c) => c.soma / c.n);
  const col = (x) => { let b = 0, bd = Infinity; centros.forEach((c, i) => { const d = Math.abs(x - c); if (d < bd) { bd = d; b = i; } }); return b; };
  return todas.map((l) => { const r = new Array(centros.length).fill(''); l.ws.forEach((w) => { const i = col(w.x); r[i] = r[i] ? r[i] + ' ' + w.text : w.text; }); return r; });
}
async function dpReprocessarPdf() {
  if (!dpState.pdfBuf) return;
  const g = parseFloat((document.getElementById('dp-pdfgap') || {}).value) || 18; dpState.pdfGap = Math.min(80, Math.max(4, g));
  try { const linhas = await dpExtrairPdf(dpState.pdfBuf.slice(0), dpState.pdfGap); dpState.arq.abas[0].linhas = linhas; dpPrepararAba(); dpRender(); } catch (e) { dpMsg('arquivo', 'Não consegui reprocessar o PDF.', 'erro'); dpRenderSec('arquivo'); }
}

// ── mapeamento e análise ─────────────────────────────────────────────────────
function dpSetCab(i) {
  dpState.linhaCab = i;
  if (dpState.origemMapa !== 'manual') dpState.mapa = dpDetectarColunas(dpLinhas(), i);
  dpSalvarLayout(); dpReanalisar(); dpRender();
}
function dpSetMapa(campo, v) {
  dpState.mapa[campo] = v === '' ? '' : Number(v); dpState.origemMapa = 'manual';
  dpSalvarLayout(); dpReanalisar(); dpRenderSec('previa'); dpRenderSec('mapa'); dpRenderSec('interp'); dpRenderSec('depara'); dpRenderSec('regras'); dpRenderSec('gerar');
}
function dpSetExtra(c, on) {
  const e = dpState.mapa.extras, i = e.indexOf(c);
  if (on && i < 0) e.push(c); else if (!on && i >= 0) e.splice(i, 1);
  dpState.origemMapa = 'manual'; dpSalvarLayout(); dpReanalisar();
  ['previa', 'interp', 'depara', 'regras', 'gerar'].forEach(dpRenderSec);
}
function dpDetectarDeNovo() { const l = dpLinhas(); const cab = dpCabPadrao(l); dpState.linhaCab = cab; dpState.mapa = dpDetectarColunas(l, cab); dpState.origemMapa = 'auto'; dpReanalisar(); dpRender(); }
function dpSalvarLayout() {
  if (!dpState.cfg || !dpTemMapa()) return;
  dpState.cfg.layout = { assinatura: dpAssinatura(dpLinhas(), dpState.linhaCab), linhaCab: dpState.linhaCab, mapa: Object.assign({}, dpState.mapa, { extras: dpState.mapa.extras.slice() }), aba: dpState.arq.abas[dpState.arq.aba].nome };
  dpSalvarAgendado();
}
function dpReanalisar() {
  dpState.confirmou = false;                                  // qualquer mudança que reanalisa exige confirmar de novo antes de baixar
  dpState.analise = dpState.cfg && dpState.arq && dpTemMapa() ? dpAnalisar(dpLinhas(), dpState.linhaCab, dpMapaCompleto(), dpState.cfg) : null;
  dpState.conf = dpState.analise ? dpConfianca(dpLinhas(), dpState.linhaCab, dpMapaCompleto(), dpState.analise, dpState.cfg) : null;
}
function dpAgendarAnalise() {
  clearTimeout(dpTimerAnalise);
  dpTimerAnalise = setTimeout(() => { dpReanalisar(); dpState.confirmou = false; dpRenderSec('interp'); dpRenderSec('gerar'); dpRenderDeParaCorpo(); dpRenderRegrasLista(); }, 250);
}
function dpCfg(chave, valor) { dpState.cfg[chave] = valor; dpSalvarAgendado(); dpAgendarAnalise(); }
function dpCfgRerender(chave, valor) { dpState.cfg[chave] = valor; dpSalvarAgendado(); dpReanalisar(); dpState.confirmou = false; dpRenderSec('config'); dpRenderSec('interp'); dpRenderSec('gerar'); dpRenderDeParaCorpo(); }

// ── DE-PARA por nome ─────────────────────────────────────────────────────────
function dpNomesDePara() {
  const m = dpState.mapa, idx = m.fornecedor !== '' ? m.fornecedor : m.historico, cfg = dpState.cfg, mapa = new Map();
  dpUnicos(dpLinhas(), dpState.linhaCab, idx).forEach((u) => mapa.set(u.valor, { nome: u.valor, qtd: u.qtd }));
  Object.keys(cfg.deParaMap).forEach((k) => { if (!mapa.has(k)) mapa.set(k, { nome: k, qtd: 0 }); });
  return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
function dpSetCodigo(i, v) { const n = dpNomesDePara()[i]; if (!n) return; const c = dpState.cfg.codigosMap, d = String(v).replace(/\D/g, '').slice(0, 5); if (d) c[n.nome] = d; else delete c[n.nome]; dpSalvarAgendado(); dpAgendarAnalise(); }
function dpSetConta(i, v) { const n = dpNomesDePara()[i]; if (!n) return; const c = dpState.cfg.deParaMap; if (v.trim()) c[n.nome] = v.trim(); else delete c[n.nome]; dpSalvarAgendado(); dpAgendarAnalise(); }
function dpRemoverDePara(i) { const n = dpNomesDePara()[i]; if (!n) return; delete dpState.cfg.deParaMap[n.nome]; delete dpState.cfg.codigosMap[n.nome]; dpSalvarAgendado(); dpReanalisar(); dpRenderSec('depara'); dpRenderSec('interp'); dpRenderSec('gerar'); }
function dpAddDePara() {
  const nome = (document.getElementById('dp-add-nome') || {}).value || '', conta = (document.getElementById('dp-add-conta') || {}).value || '', cod = ((document.getElementById('dp-add-cod') || {}).value || '').replace(/\D/g, '').slice(0, 5);
  if (!nome.trim() || !conta.trim()) return;
  dpState.cfg.deParaMap[nome.trim()] = conta.trim(); if (cod) dpState.cfg.codigosMap[nome.trim()] = cod; dpState.novoDePara = false; dpSalvarAgendado(); dpReanalisar(); dpRenderSec('depara'); dpRenderSec('interp'); dpRenderSec('gerar');
}

// ── regras por palavra-chave ─────────────────────────────────────────────────
function dpResetRegra() { dpState.regra = { id: null, keywords: [], banco: '', natureza: dpState.cfg ? dpState.cfg.naturezaPadrao : 'PAGAMENTO', conta: '', codigo: '', exemplo: '', filtroEx: '' }; }
function dpHistDaLinha(r) {                                     // igual ao histórico que dpAnalisar monta (base + colunas extras)
  const m = dpState.mapa, i = m.historico !== '' ? m.historico : m.fornecedor;
  return [i === '' ? '' : dpTexto(r[i])].concat((m.extras || []).map((c) => dpTexto(r[c]))).filter(Boolean).join(' · ');
}
function dpBancoDaLinha(r) { const i = dpState.mapa.banco; return i === '' ? '' : dpTexto(r[i]); }
function dpDadosRows() { return dpLinhas().slice(dpState.linhaCab + 1).filter((r) => !dpLinhaVazia(r)); }
function dpImpactados(keywords, banco) {
  if (!keywords.length) return [];
  const temB = dpState.mapa.banco !== '', rg = { keywords, banco };
  return dpDadosRows().filter((r) => dpCasaRegra(dpHistDaLinha(r), dpBancoDaLinha(r), rg, temB));
}
function dpToggleToken(tok) {
  const k = dpState.regra.keywords, i = k.findIndex((x) => dpNorm(x) === dpNorm(tok));
  if (i >= 0) k.splice(i, 1); else k.push(tok);
  dpRenderSec('regras');
}
function dpAddKeyword(ev) {
  if (ev.key !== 'Enter') return; ev.preventDefault();
  const v = ev.target.value.trim(); if (v && !dpState.regra.keywords.some((k) => dpNorm(k) === dpNorm(v))) dpState.regra.keywords.push(v);
  ev.target.value = ''; dpRenderSec('regras'); const i = document.getElementById('dp-kw-in'); if (i) i.focus();
}
function dpRemoverKeyword(i) { dpState.regra.keywords.splice(i, 1); dpRenderSec('regras'); }
function dpRegraCampo(campo, v) { dpState.regra[campo] = v; if (campo === 'banco') dpRenderImpactados(); }
function dpSalvarRegra() {
  const r = dpState.regra;
  if (!r.keywords.length) { dpMsg('regra', 'Selecione ao menos uma palavra-chave.', 'warn'); return dpRenderSec('regras'); }
  if (!String(r.conta).trim()) { dpMsg('regra', 'Informe a conta contábil da regra.', 'warn'); return dpRenderSec('regras'); }
  const nova = { id: r.id || 'r' + Date.now().toString(36), keywords: r.keywords.slice(), banco: r.banco, natureza: r.natureza, conta: String(r.conta).trim(), codigo: String(r.codigo || '').replace(/\D/g, '').slice(0, 5) };
  const regras = dpState.cfg.regras, i = regras.findIndex((x) => x.id === nova.id);
  if (i >= 0) regras[i] = nova; else regras.push(nova);
  dpMsg('regra', 'Regra salva.', 'ok'); dpResetRegra(); dpSalvarAgendado(); dpReanalisar(); dpState.confirmou = false;
  dpRenderSec('regras'); dpRenderSec('interp'); dpRenderSec('gerar'); dpRenderSec('depara');
}
function dpEditarRegra(id) {
  const x = dpState.cfg.regras.find((q) => q.id === id); if (!x) return;
  dpState.regra = { id: x.id, keywords: x.keywords.slice(), banco: x.banco || '', natureza: x.natureza, conta: x.conta, codigo: x.codigo || '', exemplo: '', filtroEx: '' };
  dpMsg('regra', '', ''); dpRenderSec('regras'); const el = document.getElementById('dp-s-regras'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function dpRemoverRegra(id) { dpState.cfg.regras = dpState.cfg.regras.filter((x) => x.id !== id); if (dpState.regra.id === id) dpResetRegra(); dpSalvarAgendado(); dpReanalisar(); dpRenderSec('regras'); dpRenderSec('interp'); dpRenderSec('gerar'); }
function dpMoverRegra(id, d) { const r = dpState.cfg.regras, i = r.findIndex((x) => x.id === id), j = i + d; if (i < 0 || j < 0 || j >= r.length) return; [r[i], r[j]] = [r[j], r[i]]; dpSalvarAgendado(); dpReanalisar(); dpRenderSec('regras'); dpRenderSec('interp'); dpRenderSec('gerar'); }
function dpLimparRegra() { dpResetRegra(); dpMsg('regra', '', ''); dpRenderSec('regras'); }
function dpEscolherExemplo(v) { dpState.regra.exemplo = v; dpRenderSec('regras'); }
function dpFiltrarExemplos(v) { dpState.regra.filtroEx = v; const el = document.getElementById('dp-ex-sel'); if (el) el.innerHTML = dpOpcoesExemplo(); }

// ── geração ──────────────────────────────────────────────────────────────────
function dpProblemas() {
  const a = dpState.analise; if (!a) return 0;
  return a.resumo.erros + a.resumo.semConta + a.resumo.avisos + a.resumo.transferencias + (dpState.conf && !dpState.conf.pronto ? 1 : 0) + dpAvisosLayout().length;   // leitura de confiança baixa e avisos do layout também exigem conferir
}
function dpOpcoesTxt() { const c = dpState.cfg; return { formato: c.formato, delimitador: c.delimitador, decimalFmt: c.decimalFmt, codificacao: c.codificacao }; }
function dpAvisosLayout() {                                      // só o layout Contmatic acusa: conta fora de 7 dígitos, código/histórico grande, arquivo que cruza anos
  const a = dpState.analise, c = dpState.cfg; if (!a || !c || c.formato === 'delimitado' || !a.lancamentos.length) return [];
  return dpGerarTxt(a.lancamentos, dpOpcoesTxt()).avisos;
}
function dpPodeGerar() {
  const a = dpState.analise;
  if (!a || !a.lancamentos.length) return { ok: false, motivo: 'Nenhum lançamento válido ainda. Confira o mapeamento de colunas.' };
  if (!String(dpState.cfg.contaCaixa || '').trim()) return { ok: false, motivo: 'Informe a conta de caixa/banco padrão (seção "Configurações do cliente").' };
  if (dpProblemas() > 0 && !dpState.confirmou) return { ok: false, motivo: 'Há linhas com erro, aviso ou sem conta. Revise (e confira a nota de confiança da leitura) e marque a confirmação para gerar mesmo assim.', precisaConfirmar: true };
  return { ok: true };
}
function dpGerar() {
  const g = dpPodeGerar(); if (!g.ok) return;
  dpSalvarLayout();                                           // guarda o mapeamento confirmado para o próximo arquivo deste cliente
  const cfg = dpState.cfg, r = dpGerarTxt(dpState.analise.lancamentos, dpOpcoesTxt());
  dpBaixar(r.bytes, dpNomeArquivo(dpNomeAtual(), cfg.ano), 'application/octet-stream');
  dpMsg('gerar', 'Arquivo gerado com ' + dpState.analise.lancamentos.length + ' lançamento(s)' + (r.trocados ? ' — ATENÇÃO: ' + r.trocados + ' caractere(s) sem correspondência em ANSI viraram "?"' : '') + '.', r.trocados ? 'warn' : 'ok');
  dpRenderSec('gerar');
}
function dpBaixarProblemas() {
  const a = dpState.analise; if (!a) return;
  const q = (s) => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
  const ls = a.linhas.filter((l) => l.status !== 'ok').map((l) => [l.linha, l.status, (l.motivos.concat(l.avisos)).join(' | '), l.dataLida, l.valorLido, l.hist].map(q).join(';'));
  dpBaixar('﻿' + ['Linha;Situação;Motivo;Data lida;Valor lido;Histórico'].concat(ls).join('\r\n'), 'problemas_' + dpNomeArquivo(dpNomeAtual(), dpState.cfg.ano).replace('_Lctos.txt', '') + '.csv', 'text/csv;charset=utf-8');
}

// ═══ HTML ════════════════════════════════════════════════════════════════════
const dpSec = {};
const dpTitulo = (n, t, sub) => '<div class="dp-head"><span class="dp-num">' + n + '</span><div><h3>' + t + '</h3>' + (sub ? '<p class="dp-sub">' + sub + '</p>' : '') + '</div></div>';

dpSec.cliente = () => {
  const cs = dpState.clientes, atual = dpState.atualId;
  const opts = cs.length ? '<option value="">— escolha um cliente —</option>' + cs.map((c) => '<option value="' + dpEsc(c.id) + '"' + (c.id === atual ? ' selected' : '') + '>' + dpEsc(c.nome) + '</option>').join('') : '<option value="">— nenhum cliente ainda —</option>';
  const edit = dpState.modo ? '<div class="dp-linha"><input id="dp-nome-in" class="inp" placeholder="Nome do cliente" value="' + (dpState.modo === 'renomear' ? dpEsc(dpNomeAtual()) : '') + '" onkeydown="if(event.key===\'Enter\')dpConfirmarNome()"/><button class="btn btn-acc btn-sm" onclick="dpConfirmarNome()">Salvar</button><button class="btn btn-ghost btn-sm" onclick="dpModo(\'\')">Cancelar</button></div>' : '';
  return '<div class="dp-cliente-topo"><div><label class="label">Cliente do DE-PARA</label><div class="sel-wrap"><select class="sel" onchange="dpTrocarCliente(this.value)">' + opts + '</select><span class="sel-arr">▼</span></div></div>' +
    '<span id="dp-selo" class="dp-selo dp-selo--' + (dpState.salvo || 'nada') + '">' + ({ salvando: '⏳ salvando…', ok: '☁ salvo no Firebase', erro: '⚠ não consegui salvar — confira a conexão' }[dpState.salvo] || '') + '</span></div>' +
    '<div class="dp-acoes"><button class="btn btn-acc btn-sm" onclick="dpModo(\'novo\')">+ Novo cliente</button>' +
    (atual ? '<button class="btn btn-ghost btn-sm" onclick="dpModo(\'renomear\')">Renomear</button>' : '') +
    (atual ? '<button class="btn btn-danger btn-sm" onclick="dpExcluirCliente()">Excluir cliente</button>' : '') + '</div>' + edit + dpMsgHtml('cliente') +
    '<p class="dp-dica">Cada cliente guarda, no Firebase: DE-PARA por nome, regras por palavra-chave, contas, formato do arquivo e o último layout de colunas. A planilha em si não é salva.</p>';
};

dpSec.arquivo = () => {
  if (!dpState.cfg) return '';
  const a = dpState.arq;
  return dpTitulo(1, 'Arquivo de lançamentos', 'Planilha (.xlsx/.xls) ou PDF com texto selecionável, com os pagamentos ou recebimentos brutos deste cliente.') +
    '<div class="dp-drop' + (a ? ' dp-drop--tem' : '') + '" onclick="document.getElementById(\'dp-file\').click()" ondragover="event.preventDefault()" ondrop="dpSoltou(event)"><span>' +
    (a ? '📄 ' + dpEsc(a.nome) + ' — ' + dpLinhas().length + ' linha(s) · clique para trocar' : 'Clique para escolher o arquivo ou arraste aqui') + '</span></div>' +
    '<input id="dp-file" type="file" accept=".xlsx,.xls,.pdf" hidden onchange="dpArquivoEscolhido(this)"/>' + dpMsgHtml('arquivo') +
    (a && a.ehPdf ? '<div class="dp-pdf"><p class="dp-dica">Leitura de PDF é aproximada: as colunas são reconstruídas pela posição do texto. Se saírem desalinhadas, ajuste a distância e reprocese.</p><div class="dp-linha"><input id="dp-pdfgap" class="inp" type="number" min="4" max="80" value="' + dpState.pdfGap + '" style="max-width:110px"/><button class="btn btn-ghost btn-sm" onclick="dpReprocessarPdf()">Reprocessar PDF</button></div></div>' : '');
};

dpSec.previa = () => {
  const a = dpState.arq; if (!a) return '';
  const linhas = dpLinhas(), m = dpState.mapa, cab = dpState.linhaCab;
  const ncols = Math.min(14, Math.max(1, ...linhas.map((r) => (r ? r.length : 0))));
  const camposDaCol = (c) => Object.keys(DP_COR).filter((k) => (k === 'extras' ? (m.extras || []).includes(c) : m[k] === c));
  const rot = (k) => (k === 'valor' && m.valorEntrada !== '' ? 'Valor saída' : DP_ROTULO[k]);
  const abas = a.abas.length > 1 ? '<div class="dp-abas">' + a.abas.map((x, i) => '<button class="dp-aba' + (i === a.aba ? ' on' : '') + (x.vazia ? ' dp-aba--vazia' : '') + '" onclick="dpTrocarAba(' + i + ')">' + dpEsc(x.nome) + (x.vazia ? ' (vazia)' : '') + '</button>').join('') + '</div>' : '';
  let th = '<th class="dp-rn"></th>';
  for (let c = 0; c < ncols; c++) {
    const cs = camposDaCol(c);
    th += '<th><div class="dp-col-l">' + dpColLetra(c) + '</div>' + cs.map((k) => '<span class="dp-tag" style="--c:' + DP_COR[k] + '">' + rot(k) + '</span>').join('') + '</th>';
  }
  const fim = Math.min(linhas.length, dpState.prevMax); let tr = '';
  for (let i = 0; i < fim; i++) {
    const r = linhas[i] || [], antes = i < cab, ehCab = i === cab;
    let tds = '<td class="dp-rn" title="Usar esta linha como cabeçalho" onclick="dpSetCab(' + i + ')">' + (i + 1) + '</td>';
    for (let c = 0; c < ncols; c++) {
      const cs = camposDaCol(c), bruto = dpTexto(r[c]); let v = bruto; const cor = cs.length ? ' style="--c:' + DP_COR[cs[0]] + '"' : '';
      if (cs.includes('data') && i > cab) { const p = dpParseData(r[c]); if (p.ok) v = p.br; }   // data do Excel vem como número de série: mostra a data de verdade
      tds += '<td class="' + (cs.length ? 'dp-mapeada' : '') + '"' + cor + ' title="' + dpEsc(bruto) + '">' + dpEsc(v.length > 34 ? v.slice(0, 34) + '…' : v) + '</td>';
    }
    tr += '<tr class="' + (antes ? 'dp-ign' : '') + (ehCab ? ' dp-cab' : '') + '">' + tds + '</tr>';
  }
  const mais = linhas.length > fim ? '<div class="dp-linha"><span class="dp-dica">Mostrando ' + fim + ' de ' + linhas.length + ' linhas.</span><button class="btn btn-ghost btn-sm" onclick="dpState.prevMax+=50;dpRenderSec(\'previa\')">+ 50 linhas</button><button class="btn btn-ghost btn-sm" onclick="dpState.prevMax=99999;dpRenderSec(\'previa\')">Mostrar todas</button></div>' : '';
  return dpTitulo(2, 'Prévia do arquivo', 'É assim que o arquivo foi lido. Confira se as colunas e o cabeçalho estão certos <b>antes</b> de seguir. Clique no número de uma linha para marcá-la como cabeçalho.') + abas +
    '<div class="dp-tabela-wrap"><table class="dp-tabela dp-previa"><thead><tr>' + th + '</tr></thead><tbody>' + tr + '</tbody></table></div>' + mais +
    '<div class="dp-legenda">' + Object.keys(DP_COR).map((k) => '<span class="dp-tag" style="--c:' + DP_COR[k] + '">' + rot(k) + '</span>').join('') + '<span class="dp-dica">linhas esmaecidas ficam antes do cabeçalho e são ignoradas</span></div>';
};

dpSec.mapa = () => {
  if (!dpState.arq) return '';
  const linhas = dpLinhas(), m = dpState.mapa, cab = dpState.linhaCab, ncols = Math.min(30, Math.max(1, ...linhas.map((r) => (r ? r.length : 0))));
  const titulos = cab >= 0 ? (linhas[cab] || []) : [];
  const opCol = (campo, obrig) => '<option value="">' + (obrig ? '— escolha —' : '— não usar —') + '</option>' + Array.from({ length: ncols }, (_, c) => '<option value="' + c + '"' + (m[campo] === c ? ' selected' : '') + '>' + dpColLetra(c) + (dpTexto(titulos[c]) ? ' — ' + dpEsc(dpTexto(titulos[c]).slice(0, 40)) : '') + '</option>').join('');
  const campo = (k, rot, obrig, dica) => '<div class="field"><label class="label"><span class="dp-bola" style="background:' + DP_COR[k] + '"></span>' + rot + (obrig ? ' *' : '') + '</label><div class="sel-wrap"><select class="sel" onchange="dpSetMapa(\'' + k + '\',this.value)">' + opCol(k, obrig) + '</select><span class="sel-arr">▼</span></div>' + (dica ? '<div class="dp-dica">' + dica + '</div>' : '') + '</div>';
  const limite = Math.min(30, linhas.length);
  const opCab = '<option value="-1"' + (cab === -1 ? ' selected' : '') + '>Sem cabeçalho (a 1ª linha já é lançamento)</option>' + Array.from({ length: limite }, (_, i) => '<option value="' + i + '"' + (cab === i ? ' selected' : '') + '>Linha ' + (i + 1) + ' — ' + dpEsc((linhas[i] || []).map(dpTexto).filter(Boolean).join(' | ').slice(0, 60) || '(vazia)') + '</option>').join('');
  const selo = { layout: '<div class="dp-msg dp-msg--ok">✔ Layout deste cliente reconhecido — o mapeamento do último arquivo foi reaproveitado.</div>', auto: '<div class="dp-msg dp-msg--info">✨ Colunas detectadas automaticamente. <b>Confira</b> na prévia acima antes de seguir.</div>', manual: '' }[dpState.origemMapa] || '';
  return dpTitulo(3, 'Onde está cada informação', 'Indique qual coluna corresponde a cada campo. O mapeamento fica salvo para o próximo arquivo desse cliente.') + selo +
    '<div class="field"><label class="label">Linha do cabeçalho</label><div class="sel-wrap"><select class="sel" onchange="dpSetCab(Number(this.value))">' + opCab + '</select><span class="sel-arr">▼</span></div></div>' +
    '<div class="dp-grade2">' + campo('data', 'Data', true) + campo('valor', m.valorEntrada !== '' ? 'Valor — coluna de SAÍDAS' : 'Valor', true, m.valorEntrada !== '' ? 'Linhas com valor aqui viram <b>pagamento</b>.' : '') + campo('valorEntrada', 'Valor — coluna de ENTRADAS (opcional)', false, 'Só para extratos com duas colunas de valor (saída e entrada). Linhas com valor aqui viram <b>recebimento</b>. Não escolha a coluna de saldo.') + campo('fornecedor', 'Fornecedor / Banco', false, 'Para o DE-PARA por nome. Se vazio, usa o histórico.') + campo('historico', 'Histórico / Descrição', false, 'Para as regras por palavra-chave. Se vazio, usa o fornecedor.') + campo('banco', 'Banco (opcional)', false, 'Só para regras que filtram por banco.') + campo('tipo', 'Tipo — pagamento/recebimento (opcional)', false, 'Ex.: "Pagamento", "Recebimento", "Débito", "Crédito", ou as operações da plataforma (Receita, Despesa, Aporte, Entre bancos…).') + '</div>' +
    '<div class="field"><label class="label"><span class="dp-bola" style="background:' + DP_COR.extras + '"></span>Colunas extras no histórico (opcional)</label><div class="dp-chips">' + Array.from({ length: ncols }, (_, c) => ({ c, t: dpTexto(titulos[c]) })).filter((x) => x.c !== m.data && x.c !== m.valor && x.c !== m.valorEntrada && x.c !== m.historico && x.c !== m.fornecedor && x.c !== m.tipo && x.c !== m.banco).map((x) => '<label class="dp-check"><input type="checkbox" ' + ((m.extras || []).includes(x.c) ? 'checked' : '') + ' onchange="dpSetExtra(' + x.c + ',this.checked)"/> ' + dpColLetra(x.c) + (x.t ? ' — ' + dpEsc(x.t.slice(0, 24)) : '') + '</label>').join('') + '</div><div class="dp-dica">O texto dessas colunas é somado ao histórico (ajuda as regras e distingue lançamentos parecidos).</div></div>' +
    '<div class="dp-acoes"><button class="btn btn-ghost btn-sm" onclick="dpDetectarDeNovo()">✨ Detectar automaticamente</button></div>';
};

const dpChip = (n, rot, cls) => '<span class="dp-chip dp-chip--' + cls + '"><b>' + n + '</b> ' + rot + '</span>';
// nota de confiança da LEITURA (o que falta cadastrar de conta é outra coisa e aparece nos chips)
function dpConfHtml() {
  const f = dpState.conf; if (!f) return '';
  const rotulo = { alta: 'Leitura com alta confiança', media: 'Leitura com confiança média — confira os pontos abaixo', baixa: 'Leitura com confiança BAIXA — o mapeamento provavelmente está errado' }[f.geral];
  const nomes = { data: 'Data', valor: 'Valor', historico: 'Histórico', natureza: 'Pagamento/recebimento', colunas: 'Colunas' };
  const itens = Object.keys(f.campos).map((k) => { const c = f.campos[k]; return '<span class="dp-chip dp-chip--' + { alta: 'ok', media: 'aviso', baixa: 'erro' }[c.nivel] + '"><b>' + nomes[k] + '</b> ' + c.nivel + (c.pct != null ? ' · ' + c.pct + '%' : '') + '</span>'; }).join('');
  const notas = f.notas.map((n) => '<li>' + dpEsc(n.nota) + '</li>').join('');
  return '<div class="dp-msg dp-msg--' + { alta: 'ok', media: 'warn', baixa: 'erro' }[f.geral] + '"><b>' + rotulo + '</b></div><div class="dp-chips">' + itens + '</div>' + (notas ? '<ul class="dp-dica">' + notas + '</ul>' : '');
}
dpSec.interp = () => {
  const a = dpState.analise;
  if (!dpState.arq) return '';
  if (!a) return dpTitulo(4, 'Como o sistema vai ler', '') + '<div class="dp-msg dp-msg--warn">Escolha ao menos as colunas de <b>Data</b>, <b>Valor</b> e <b>Fornecedor ou Histórico</b> na seção anterior.</div>';
  const s = a.resumo;
  const chips = dpChip(s.validas, 'lançamentos válidos', 'ok') + (s.erros ? dpChip(s.erros, 'com erro (não vão no arquivo)', 'erro') : '') + (s.ignoradas ? dpChip(s.ignoradas, 'ignoradas (título/total)', 'ign') : '') + (s.semConta ? dpChip(s.semConta, 'sem conta (' + dpEsc(dpState.cfg.contaPadrao) + ')', 'aviso') : '') + (s.duplicados ? dpChip(s.duplicados, 'possíveis duplicados', 'aviso') : '') + (s.anoDiferente ? dpChip(s.anoDiferente, 'de outro ano', 'aviso') : '') + (s.transferencias ? dpChip(s.transferencias, 'transferências entre bancos (lance à mão)', 'aviso') : '') + (s.vazias ? dpChip(s.vazias, 'linhas em branco', 'ign') : '');
  const filtradas = dpState.soProblemas ? a.linhas.filter((l) => l.status !== 'ok') : a.linhas, fim = Math.min(filtradas.length, dpState.interpMax);
  const rot = { ok: '✔', aviso: '⚠', erro: '✖', ignorada: '—' };
  const tr = filtradas.slice(0, fim).map((l) => '<tr class="dp-l--' + l.status + '"><td class="dp-num-c">' + l.linha + '</td><td>' + (l.data ? dpEsc(l.data) : '<span class="dp-ruim">' + dpEsc(l.dataLida || '—') + '</span>') + '</td><td class="dp-dir">' + (l.valor != null ? dpEsc(dpFmtValor(l.valor, 'virgula')) + (l.valor < 0 ? ' <span class="dp-dica">(neg.)</span>' : '') : '<span class="dp-ruim">' + dpEsc(l.valorLido || '—') + '</span>') + '</td><td title="' + dpEsc(l.hist) + '">' + dpEsc((l.hist || l.forn).slice(0, 46)) + '</td><td>' + (l.contaDebito || '') + '</td><td>' + (l.contaCredito || '') + '</td><td>' + (l.natureza ? (l.natureza === 'PAGAMENTO' ? 'Pagto' : 'Receb') : '') + '</td><td class="dp-st">' + rot[l.status] + ' ' + dpEsc(l.motivos.concat(l.avisos).join(' · ') || (l.origemConta || '')) + '</td></tr>').join('');
  const mais = filtradas.length > fim ? '<div class="dp-linha"><span class="dp-dica">Mostrando ' + fim + ' de ' + filtradas.length + '.</span><button class="btn btn-ghost btn-sm" onclick="dpState.interpMax+=100;dpRenderSec(\'interp\')">+ 100</button><button class="btn btn-ghost btn-sm" onclick="dpState.interpMax=99999;dpRenderSec(\'interp\')">Mostrar todas</button></div>' : '';
  return dpTitulo(4, 'Como o sistema vai ler', 'Linha a linha: o que foi lido, em que conta cai e por quê. <b>Nenhuma linha some sem aparecer aqui.</b>') + dpConfHtml() + '<div class="dp-chips">' + chips + '</div>' +
    '<div class="dp-acoes"><label class="dp-check"><input type="checkbox" ' + (dpState.soProblemas ? 'checked' : '') + ' onchange="dpState.soProblemas=this.checked;dpState.interpMax=60;dpRenderSec(\'interp\')"/> Mostrar só o que precisa de atenção</label>' + (s.erros + s.ignoradas + s.avisos + s.semConta ? '<button class="btn btn-ghost btn-sm" onclick="dpBaixarProblemas()">⬇ Baixar lista de problemas (.csv)</button>' : '') + '</div>' +
    '<div class="dp-tabela-wrap dp-interp-wrap"><table class="dp-tabela dp-interp"><thead><tr><th>Linha</th><th>Data</th><th>Valor</th><th>Histórico</th><th>Débito</th><th>Crédito</th><th>Natureza</th><th>Situação / origem da conta</th></tr></thead><tbody>' + (tr || '<tr><td colspan="8" class="dp-dica" style="padding:14px">Nada a mostrar.</td></tr>') + '</tbody></table></div>' + mais;
};

dpSec.config = () => {
  const c = dpState.cfg; if (!c) return '';
  const sel = (id, val, ops) => '<div class="sel-wrap"><select class="sel" onchange="dpCfgRerender(\'' + id + '\',this.value)">' + ops.map((o) => '<option value="' + o[0] + '"' + (val === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select><span class="sel-arr">▼</span></div>';
  return dpTitulo(dpState.arq ? 5 : 2, 'Configurações do cliente', 'Valem para todos os arquivos deste cliente e ficam salvas.') +
    '<div class="dp-grade2"><div class="field"><label class="label">Conta de caixa/banco padrão *</label><input class="inp" value="' + dpEsc(c.contaCaixa) + '" placeholder="Ex: 1120" oninput="dpCfg(\'contaCaixa\',this.value.trim())"/></div>' +
    '<div class="field"><label class="label">Conta para não identificados</label><input class="inp" value="' + dpEsc(c.contaPadrao) + '" placeholder="999999" oninput="dpCfg(\'contaPadrao\',this.value.trim()||\'999999\')"/><div class="dp-dica">Usada quando nenhuma regra nem DE-PARA reconhece a linha.</div></div>' +
    '<div class="field"><label class="label">Ano do arquivo de saída</label><input class="inp" type="number" value="' + dpEsc(c.ano) + '" placeholder="2026" oninput="dpCfg(\'ano\',this.value.trim())"/><div class="dp-dica">Vai no nome do arquivo e avisa se houver datas de outro ano.</div></div>' +
    '<div class="field"><label class="label">Natureza quando nada define</label>' + sel('naturezaPadrao', c.naturezaPadrao, [['PAGAMENTO', 'Pagamento'], ['RECEBIMENTO', 'Recebimento']]) + '</div>' +
    '<div class="field"><label class="label">Formato do arquivo</label>' + sel('formato', c.formato, [['contmatic', 'Contmatic — posicional, 330 colunas (padrão)'], ['delimitado', 'Delimitado por ; (formato antigo)']]) + '</div>' +
    (c.formato === 'delimitado'
      ? '<div class="field"><label class="label">Separador de campos</label>' + sel('delimitador', c.delimitador, [[';', 'ponto e vírgula ( ; )'], [',', 'vírgula ( , )'], ['tab', 'tabulação']]) + '</div>' +
        '<div class="field"><label class="label">Formato do valor</label>' + sel('decimalFmt', c.decimalFmt, [['virgula', '1500,00 (vírgula decimal)'], ['ponto', '1500.00 (ponto decimal)']]) + '</div>' +
        '<div class="field"><label class="label">Codificação do arquivo</label>' + sel('codificacao', c.codificacao, [['ansi', 'ANSI / Windows-1252 (padrão do Contmatic)'], ['utf8', 'UTF-8']]) + '</div>'
      : '<div class="field"><label class="label">Código padrão do histórico</label><input class="inp" inputmode="numeric" maxlength="5" value="' + dpEsc(c.codigoPadrao) + '" placeholder="00000" oninput="dpCfg(\'codigoPadrao\',this.value.replace(/\D/g,\'\').slice(0,5).padStart(5,\'0\'))"/><div class="dp-dica">Usado quando o nome (DE-PARA) ou a regra não tem código próprio. Nos arquivos de referência aparece 00000.</div></div>') + '</div>' +
    '<label class="dp-check"><input type="checkbox" ' + (c.usarSinal ? 'checked' : '') + ' onchange="dpCfgRerender(\'usarSinal\',this.checked)"/> O <b>sinal do valor</b> define a natureza (negativo = pagamento, positivo = recebimento) quando não há coluna Tipo nem regra</label>' +
    '<div class="dp-dica">O valor vai sempre <b>positivo</b> no arquivo; o sinal só serve para decidir débito/crédito.</div>';
};

function dpLinhaDePara(n, i) {
  const idx = dpIndiceDePara(dpState.cfg.deParaMap), conta = dpState.cfg.deParaMap[n.nome] || '', ref = conta ? '' : (dpAchaConta(idx, n.nome) || {});
  return '<tr><td class="dp-nome" title="' + dpEsc(n.nome) + '">' + dpEsc(n.nome) + '</td><td class="dp-num-c">' + (n.qtd || '—') + '</td><td><input class="inp dp-conta-in" value="' + dpEsc(conta) + '" placeholder="' + (ref.conta ? 'por aproximação: ' + dpEsc(ref.conta) : 'conta') + '" oninput="dpSetConta(' + i + ',this.value)"/></td><td><input class="inp dp-cod-in" inputmode="numeric" maxlength="5" style="max-width:90px" value="' + dpEsc((dpState.cfg.codigosMap || {})[n.nome] || '') + '" placeholder="' + dpEsc(dpState.cfg.codigoPadrao) + '" title="Código de 5 dígitos que vai no arquivo (vazio = código padrão do cliente)" oninput="dpSetCodigo(' + i + ',this.value)"/></td><td><button class="btn btn-ghost btn-sm" onclick="dpRemoverDePara(' + i + ')" title="Remover da lista">×</button></td></tr>';
}
function dpCorpoDePara() {
  const todos = dpNomesDePara(), f = dpNorm(dpState.filtroDePara);
  const lista = todos.map((n, i) => ({ n, i })).filter(({ n }) => (!f || dpNorm(n.nome).includes(f)) && (!dpState.soSemConta || !dpState.cfg.deParaMap[n.nome]));
  return lista.length ? lista.slice(0, 300).map(({ n, i }) => dpLinhaDePara(n, i)).join('') + (lista.length > 300 ? '<tr><td colspan="5" class="dp-dica" style="padding:10px">… e mais ' + (lista.length - 300) + '. Use o filtro.</td></tr>' : '') : '<tr><td colspan="5" class="dp-dica" style="padding:14px">Nenhum nome encontrado. Confira a coluna de fornecedor/histórico na seção 3, ou adicione um item manualmente.</td></tr>';
}
function dpRenderDeParaCorpo() { const el = document.getElementById('dp-depara-corpo'); if (el && dpState.cfg) el.innerHTML = dpCorpoDePara(); }
dpSec.depara = () => {
  if (!dpState.arq || !dpState.cfg) return '';
  const todos = dpNomesDePara(), sem = todos.filter((n) => !dpState.cfg.deParaMap[n.nome]).length;
  return dpTitulo(6, 'DE-PARA por nome', 'Quando o fornecedor aparece limpo numa coluna, informe a conta direto. Vale nome idêntico (sem diferenciar maiúsculas e acentos); por aproximação só para nomes de 4+ letras.') +
    '<div class="dp-linha"><input class="inp" placeholder="Filtrar nomes…" value="' + dpEsc(dpState.filtroDePara) + '" oninput="dpState.filtroDePara=this.value;dpRenderDeParaCorpo()" style="max-width:260px"/><label class="dp-check"><input type="checkbox" ' + (dpState.soSemConta ? 'checked' : '') + ' onchange="dpState.soSemConta=this.checked;dpRenderDeParaCorpo()"/> só os sem conta (' + sem + ')</label><span class="dp-dica">' + todos.length + ' nome(s)</span></div>' +
    '<div class="dp-tabela-wrap dp-depara-wrap"><table class="dp-tabela"><thead><tr><th>Fornecedor / Banco</th><th>Linhas</th><th>Conta contábil</th><th>Código</th><th></th></tr></thead><tbody id="dp-depara-corpo">' + dpCorpoDePara() + '</tbody></table></div>' +
    (dpState.novoDePara ? '<div class="dp-linha"><input id="dp-add-nome" class="inp" placeholder="Nome do fornecedor/banco"/><input id="dp-add-conta" class="inp" placeholder="Conta" style="max-width:140px"/><input id="dp-add-cod" class="inp" inputmode="numeric" maxlength="5" placeholder="Código" style="max-width:100px"/><button class="btn btn-acc btn-sm" onclick="dpAddDePara()">Adicionar</button><button class="btn btn-ghost btn-sm" onclick="dpState.novoDePara=false;dpRenderSec(\'depara\')">Cancelar</button></div>' : '<div class="dp-acoes"><button class="btn btn-ghost btn-sm" onclick="dpState.novoDePara=true;dpRenderSec(\'depara\')">+ Adicionar item manual</button></div>');
};

function dpOpcoesExemplo() {
  const f = dpNorm(dpState.regra.filtroEx), vistos = new Set(), ops = [];
  dpDadosRows().forEach((r) => { const v = dpHistDaLinha(r); if (v && !vistos.has(v) && (!f || dpNorm(v).includes(f))) { vistos.add(v); ops.push(v); } });
  return '<option value="">— selecione um lançamento (' + ops.length + ') —</option>' + ops.slice(0, 300).map((v) => '<option value="' + dpEsc(v) + '"' + (v === dpState.regra.exemplo ? ' selected' : '') + '>' + dpEsc(v.length > 90 ? v.slice(0, 90) + '…' : v) + '</option>').join('');
}
function dpHtmlImpactados() {
  const r = dpState.regra, imp = dpImpactados(r.keywords, r.banco);
  const aviso = r.banco && dpState.mapa.banco === '' ? '<div class="dp-msg dp-msg--warn">Esta regra filtra por banco, mas a coluna <b>Banco</b> não está mapeada — ela não vai casar com nada.</div>' : '';
  return '<label class="label">Lançamentos impactados (' + imp.length + ')</label>' + aviso + '<div class="dp-impact">' + (!r.keywords.length ? '<div class="dp-dica" style="padding:10px">Selecione palavras-chave para ver quais lançamentos seriam afetados.</div>' : !imp.length ? '<div class="dp-dica" style="padding:10px">Nenhum lançamento combina com essas palavras.</div>' : imp.slice(0, 200).map((x) => '<div class="dp-impact-i">' + dpEsc(dpHistDaLinha(x)) + '</div>').join('') + (imp.length > 200 ? '<div class="dp-dica" style="padding:8px 12px">… e mais ' + (imp.length - 200) + '.</div>' : '')) + '</div>';
}
function dpRenderImpactados() { const el = document.getElementById('dp-impactados'); if (el) el.innerHTML = dpHtmlImpactados(); }
function dpHtmlListaRegras() {
  const regras = dpState.cfg.regras, temB = dpState.mapa.banco !== '';
  if (!regras.length) return '<div class="dp-dica">Nenhuma regra criada ainda.</div>';
  const dados = dpState.arq ? dpDadosRows() : [];
  return '<p class="dp-dica">A <b>primeira</b> regra que combinar vale — use ↑ ↓ para mudar a prioridade.</p>' + regras.map((x, i) => {
    const n = dados.filter((r) => dpCasaRegra(dpHistDaLinha(r), dpBancoDaLinha(r), x, temB)).length;
    return '<div class="dp-regra"><div class="dp-regra-i">' + (i + 1) + '</div><div class="dp-regra-c"><div class="dp-chips">' + x.keywords.map((k) => '<span class="dp-chip dp-chip--ign">' + dpEsc(k) + '</span>').join('') + '</div><div class="dp-dica">Conta <b>' + dpEsc(x.conta) + '</b>' + (x.codigo ? ' · código <b>' + dpEsc(x.codigo) + '</b>' : '') + ' · ' + x.natureza.toLowerCase() + (x.banco ? ' · banco ' + dpEsc(x.banco) : '') + ' · ' + (dpState.arq ? n + ' lançamento(s) neste arquivo' : 'abra um arquivo para contar') + '</div></div><div class="dp-regra-a"><button class="btn btn-ghost btn-sm" onclick="dpMoverRegra(\'' + x.id + '\',-1)" ' + (i === 0 ? 'disabled' : '') + '>↑</button><button class="btn btn-ghost btn-sm" onclick="dpMoverRegra(\'' + x.id + '\',1)" ' + (i === regras.length - 1 ? 'disabled' : '') + '>↓</button><button class="btn btn-ghost btn-sm" onclick="dpEditarRegra(\'' + x.id + '\')">Editar</button><button class="btn btn-danger btn-sm" onclick="dpRemoverRegra(\'' + x.id + '\')">Remover</button></div></div>';
  }).join('');
}
function dpRenderRegrasLista() { const el = document.getElementById('dp-regras-lista'); if (el && dpState.cfg) el.innerHTML = dpHtmlListaRegras(); }
dpSec.regras = () => {
  if (!dpState.arq || !dpState.cfg) return '';
  const r = dpState.regra, tokens = r.exemplo ? dpTokenizar(r.exemplo) : [];
  const bancos = dpState.mapa.banco !== '' ? dpUnicos(dpLinhas(), dpState.linhaCab, dpState.mapa.banco).map((u) => u.valor) : [];
  return dpTitulo(7, 'Regras por palavra-chave', 'Para descrições de extrato: escolha um lançamento, clique nas palavras que o identificam e veja <b>na hora</b> quais lançamentos seriam afetados.') +
    '<div class="field"><label class="label">Escolher um lançamento de exemplo</label><div class="dp-linha"><input class="inp" placeholder="Buscar no histórico…" value="' + dpEsc(r.filtroEx) + '" oninput="dpFiltrarExemplos(this.value)" style="max-width:240px"/><div class="sel-wrap" style="flex:1"><select id="dp-ex-sel" class="sel" onchange="dpEscolherExemplo(this.value)">' + dpOpcoesExemplo() + '</select><span class="sel-arr">▼</span></div></div></div>' +
    '<div class="field"><label class="label">Clique nas palavras que devem compor a regra</label><div class="dp-tokens">' + (tokens.length ? tokens.map((t) => /[A-Za-zÀ-ÿ0-9]/.test(t) ? '<span class="dp-token' + (r.keywords.some((k) => dpNorm(k) === dpNorm(t)) ? ' sel' : '') + '" onclick="dpToggleToken(this.dataset.t)" data-t="' + dpEsc(t) + '">' + dpEsc(t) + '</span>' : '<span class="dp-token dp-token--p">' + dpEsc(t) + '</span>').join('') : '<span class="dp-dica">Escolha um exemplo acima para ver as palavras.</span>') + '</div></div>' +
    '<div class="field"><label class="label">Palavras-chave da regra (todas precisam aparecer)</label><div class="dp-chips">' + (r.keywords.length ? r.keywords.map((k, i) => '<span class="dp-chip dp-chip--kw">' + dpEsc(k) + '<button onclick="dpRemoverKeyword(' + i + ')">×</button></span>').join('') : '<span class="dp-dica">Nenhuma palavra selecionada ainda.</span>') + '</div><input id="dp-kw-in" class="inp" placeholder="ou digite uma palavra e aperte Enter" onkeydown="dpAddKeyword(event)" style="max-width:320px;margin-top:8px"/></div>' +
    '<div class="dp-grade3"><div class="field"><label class="label">Banco (opcional)</label><div class="sel-wrap"><select class="sel" onchange="dpRegraCampo(\'banco\',this.value)"><option value="">— qualquer banco —</option>' + bancos.map((b) => '<option value="' + dpEsc(b) + '"' + (b === r.banco ? ' selected' : '') + '>' + dpEsc(b) + '</option>').join('') + '</select><span class="sel-arr">▼</span></div>' + (dpState.mapa.banco === '' ? '<div class="dp-dica">Mapeie a coluna Banco (seção 3) para filtrar por banco.</div>' : '') + '</div>' +
    '<div class="field"><label class="label">Natureza desta regra</label><div class="sel-wrap"><select class="sel" onchange="dpRegraCampo(\'natureza\',this.value)"><option value="PAGAMENTO"' + (r.natureza === 'PAGAMENTO' ? ' selected' : '') + '>Pagamento</option><option value="RECEBIMENTO"' + (r.natureza === 'RECEBIMENTO' ? ' selected' : '') + '>Recebimento</option></select><span class="sel-arr">▼</span></div></div>' +
    '<div class="field"><label class="label">Conta contábil</label><input class="inp" value="' + dpEsc(r.conta) + '" placeholder="Ex: 30119" oninput="dpRegraCampo(\'conta\',this.value)"/></div>' +
    '<div class="field"><label class="label">Código do histórico (5 dígitos)</label><input class="inp" inputmode="numeric" maxlength="5" value="' + dpEsc(r.codigo || '') + '" placeholder="' + dpEsc(dpState.cfg.codigoPadrao) + '" oninput="dpRegraCampo(\'codigo\',this.value.replace(/\D/g,\'\'))"/><div class="dp-dica">Vai no arquivo do Contmatic. Vazio = código padrão do cliente.</div></div></div>' +
    '<div class="field" id="dp-impactados">' + dpHtmlImpactados() + '</div>' +
    '<div class="dp-acoes"><button class="btn btn-acc btn-sm" onclick="dpSalvarRegra()">' + (r.id ? 'Salvar alterações' : 'Salvar regra') + '</button><button class="btn btn-ghost btn-sm" onclick="dpLimparRegra()">Limpar formulário</button></div>' + dpMsgHtml('regra') +
    '<h4 class="dp-h4">Regras salvas deste cliente</h4><div id="dp-regras-lista">' + dpHtmlListaRegras() + '</div>';
};

dpSec.gerar = () => {
  const a = dpState.analise; if (!dpState.arq || !dpState.cfg) return '';
  const g = dpPodeGerar(), cfg = dpState.cfg, prob = dpProblemas();
  const preContmatic = a && a.lancamentos.length && cfg.formato !== 'delimitado' ? '<div class="dp-tabela-wrap dp-gerar-prev"><pre class="dp-pre" style="margin:0;padding:10px 12px;font-size:11.5px;line-height:1.5;overflow-x:auto;white-space:pre">' + dpEsc(dpGerarTxt(a.lancamentos.slice(0, 8), dpOpcoesTxt()).texto.split('\r\n').filter(Boolean).map((x) => x.replace(/\s+$/, '')).join('\n')) + '</pre></div><p class="dp-dica">Primeiras 8 linhas, <b>como vão no arquivo</b> (sequencial · dia/mês · débito · crédito · valor · código · histórico). Cada linha sai com 330 colunas. Total: ' + a.lancamentos.length + '.</p>' : '';
  const pre = preContmatic || (a && a.lancamentos.length ? '<div class="dp-tabela-wrap dp-gerar-prev"><table class="dp-tabela"><thead><tr><th>Data</th><th>Débito</th><th>Crédito</th><th>Valor</th><th>Histórico</th></tr></thead><tbody>' + a.lancamentos.slice(0, 8).map((l) => '<tr class="' + (l.semConta ? 'dp-l--aviso' : '') + '"><td>' + l.data + '</td><td>' + l.contaDebito + '</td><td>' + l.contaCredito + '</td><td class="dp-dir">' + dpFmtValor(l.valor, cfg.decimalFmt) + '</td><td>' + dpEsc(dpLimpaCampo(l.historico, cfg.delimitador === 'tab' ? '\t' : cfg.delimitador).slice(0, 60)) + '</td></tr>').join('') + '</tbody></table></div><p class="dp-dica">Primeiras 8 linhas, como vão no arquivo. Total: ' + a.lancamentos.length + '.</p>' : '');
  const conf = g.precisaConfirmar || (prob > 0 && dpState.confirmou) ? '<label class="dp-check dp-check--forte"><input type="checkbox" ' + (dpState.confirmou ? 'checked' : '') + ' onchange="dpState.confirmou=this.checked;dpRenderSec(\'gerar\')"/> Revisei os avisos e quero gerar mesmo assim (' + (a ? a.resumo.erros : 0) + ' linha(s) com erro ficam de fora do arquivo; ' + (a ? a.resumo.semConta : 0) + ' sem conta usam ' + dpEsc(cfg.contaPadrao) + ')</label>' : '';
  const avisosFmt = cfg.formato === 'delimitado' ? dpGerarTxt([{ data: '', contaDebito: '', contaCredito: '', valor: 1, historico: '' }], dpOpcoesTxt()).avisos : dpAvisosLayout().slice(0, 8);
  return dpTitulo(8, 'Gerar e baixar', 'Ordem: 1) regras por palavra-chave (a primeira que combinar), 2) DE-PARA por nome, 3) conta de não identificados.') + pre +
    avisosFmt.map((x) => '<div class="dp-msg dp-msg--warn">' + dpEsc(x) + '</div>').join('') + (!g.ok ? '<div class="dp-msg dp-msg--' + (g.precisaConfirmar ? 'warn' : 'info') + '">' + dpEsc(g.motivo) + '</div>' : '') + conf +
    '<div class="dp-acoes"><button class="btn btn-acc" ' + (g.ok ? '' : 'disabled') + ' onclick="dpGerar()">⬇ Baixar .txt' + (a && a.lancamentos.length ? ' (' + a.lancamentos.length + ' lançamentos)' : '') + '</button></div>' + dpMsgHtml('gerar');
};

// ── render ───────────────────────────────────────────────────────────────────
function dpRenderSec(nome) { const el = document.getElementById('dp-s-' + nome); if (el) el.innerHTML = dpSec[nome](); }
function dpRender() { const el = document.getElementById('dp-root'); if (el) el.innerHTML = dpHtmlTudo(); }
function dpHtmlTudo() {
  if (dpState.carregando || !dpState.carregado) return '<div class="dp-carregando">⏳ Carregando clientes do DE-PARA…</div>';
  return (dpState.erro ? '<div class="dp-msg dp-msg--erro">' + dpEsc(dpState.erro) + '</div>' : '') + DP_SECOES.map((n) => '<section class="card dp-card dp-card--' + n + '" id="dp-s-' + n + '">' + dpSec[n]() + '</section>').join('');
}
function admDepara() {
  if (!dpState.carregado && !dpState.carregando) {
    dpState.carregando = true;
    dpCarregarIndice().then(() => { dpState.carregado = true; dpState.carregando = false; dpRender(); })
      .catch((e) => { dpState.carregando = false; dpState.carregado = true; dpState.erro = 'Não consegui carregar os clientes do DE-PARA (' + (e && e.message || e) + ').'; dpRender(); });
  }
  return '<div id="dp-root" class="dp">' + dpHtmlTudo() + '</div>';
}
