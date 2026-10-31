// ═══ DE-PARA · núcleo puro ═══════════════════════════════════════════════════
// Sem DOM e sem Firebase: lê células, valida, resolve contas e gera o .txt.
// Roda no navegador (admin) e no Node (testes). Prefixo dp* / DP_*.
// Regra de ouro deste arquivo: NENHUMA linha some em silêncio — toda linha lida
// termina como "ok", "aviso", "erro" ou "ignorada", sempre com o motivo.

const DP_CONTA_PADRAO = '999999';
const DP_ANO_MIN = 1990, DP_ANO_MAX = 2100;
const DP_RE_ACENTOS = new RegExp('[\\u0300-\\u036f]', 'g');                       // escrito assim para nenhum editor "normalizar" o arquivo

// ── texto ────────────────────────────────────────────────────────────────────
// minúsculo, sem acento, espaços colapsados — usado em TODA comparação de texto
function dpNorm(s) { return String(s == null ? '' : s).normalize('NFD').replace(DP_RE_ACENTOS, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
function dpPad(n) { return String(n).padStart(2, '0'); }
function dpColLetra(i) { let s = '', n = i + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }
function dpTexto(v) {
  if (v == null) return '';
  if (v instanceof Date) return isNaN(v) ? '' : dpPad(v.getDate()) + '/' + dpPad(v.getMonth() + 1) + '/' + v.getFullYear();
  return String(v).replace(/\s+/g, ' ').trim();
}
function dpTokenizar(texto) { return String(texto == null ? '' : texto).match(/[A-Za-zÀ-ÿ0-9]+|[^\sA-Za-zÀ-ÿ0-9]/g) || []; }
const dpTem = (i) => i !== '' && i != null;                                        // coluna mapeada?

// ── data ─────────────────────────────────────────────────────────────────────
function dpDataOk(d, m, a) {
  if (a < DP_ANO_MIN || a > DP_ANO_MAX || m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(a, m, 0).getDate();
}
function dpDataRes(d, m, a, orig) {
  if (!dpDataOk(d, m, a)) return { ok: false, erro: 'data inválida: "' + orig + '"' };
  return { ok: true, d, m, a, iso: a + '-' + dpPad(m) + '-' + dpPad(d), br: dpPad(d) + '/' + dpPad(m) + '/' + a };
}
// Aceita: Date, número de série do Excel, dd/mm/aaaa (/, -, .), dd/mm/aa, aaaa-mm-dd, ddmmaaaa.
// Lixo no começo/fim do texto (´ ' " letras soltas) é ignorado e a linha ganha um aviso (`corrigida`).
// NÃO adivinha mm/dd (não usa new Date(texto)): o padrão é sempre o brasileiro.
function dpParseData(v) {
  if (v == null || v === '') return { ok: false, vazio: true, erro: 'data vazia' };
  if (v instanceof Date) return isNaN(v) ? { ok: false, erro: 'data inválida' } : dpDataRes(v.getDate(), v.getMonth() + 1, v.getFullYear(), dpTexto(v));
  if (typeof v === 'number') {
    if (!isFinite(v) || v < 20000 || v > 73050) return { ok: false, erro: 'número que não parece data: ' + v };
    const dt = new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000);   // série do Excel, sem fuso
    return dpDataRes(dt.getUTCDate(), dt.getUTCMonth() + 1, dt.getUTCFullYear(), String(v));
  }
  let t = String(v).trim();
  if (t === '') return { ok: false, vazio: true, erro: 'data vazia' };
  const orig = t;
  t = t.replace(/[ T]\d{1,2}:\d{2}(:\d{2})?(\.\d+)?Z?.*$/, '');                // tira a hora
  const limpo = t.replace(/^[^\d]+/, '').replace(/[^\d]+$/, '');               // ´06/04/2026 → 06/04/2026
  const corrigida = limpo !== t; t = limpo;
  const fim = (r) => (corrigida && r.ok ? Object.assign(r, { corrigida: true, original: orig }) : r);
  let m;
  if ((m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/))) return fim(dpDataRes(+m[1], +m[2], +m[3], orig));
  if ((m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/))) return fim(dpDataRes(+m[1], +m[2], 2000 + +m[3], orig));
  if ((m = t.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/))) return fim(dpDataRes(+m[3], +m[2], +m[1], orig));
  if ((m = t.match(/^(\d{2})(\d{2})(\d{4})$/))) return fim(dpDataRes(+m[1], +m[2], +m[3], orig));
  if (/^\d{5}$/.test(t)) return fim(dpParseData(+t));                           // série do Excel gravada como texto
  return { ok: false, erro: 'data não reconhecida: "' + orig + '"' };
}

// ── valor ────────────────────────────────────────────────────────────────────
// Devolve o valor COM sinal. Aceita R$, parênteses, "123,45-", "-123,45", milhar e decimal nos dois padrões.
function dpParseValor(v) {
  if (v == null) return { ok: false, vazio: true, erro: 'valor vazio' };
  if (typeof v === 'number') return isFinite(v) ? { ok: true, valor: Math.round(v * 100) / 100 } : { ok: false, erro: 'valor inválido' };
  const orig = String(v).trim();
  if (orig === '') return { ok: false, vazio: true, erro: 'valor vazio' };
  let s = orig, neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/R\$/gi, '').replace(/\s/g, '');
  if (/-$/.test(s)) { neg = true; s = s.slice(0, -1); }
  if (/^[-−–]/.test(s)) { neg = true; s = s.slice(1); }
  if (!/^[\d.,]*\d[\d.,]*$/.test(s)) return { ok: false, erro: 'valor não numérico: "' + orig + '"' };   // texto com número no meio ("mês 5") NÃO é valor
  const nV = (s.match(/,/g) || []).length, nP = (s.match(/\./g) || []).length;
  if (nV && nP) {                                                               // o ÚLTIMO separador é o decimal
    const dec = s.lastIndexOf(',') > s.lastIndexOf('.') ? ',' : '.', mil = dec === ',' ? '.' : ',';
    s = s.split(mil).join('').replace(dec, '.');
  } else if (nV) { s = nV > 1 ? s.split(',').join('') : s.replace(',', '.'); }
  else if (nP) { if (nP > 1) s = s.split('.').join(''); else if (/^\d{1,3}\.\d{3}$/.test(s)) s = s.replace('.', ''); }   // "1.500" = mil e quinhentos (padrão BR)
  const n = parseFloat(s);
  if (!isFinite(n)) return { ok: false, erro: 'valor inválido: "' + orig + '"' };
  return { ok: true, valor: Math.round((neg ? -n : n) * 100) / 100 };
}
// o arquivo vai sempre com valor POSITIVO — o sinal só decide a natureza (e só se o usuário pedir)
function dpFmtValor(n, fmt) { const s = Math.abs(n).toFixed(2); return fmt === 'ponto' ? s : s.replace('.', ','); }

// ── DE-PARA por nome e regras por palavra-chave ──────────────────────────────
function dpIndiceDePara(map) {
  const exato = new Map(), lista = [];
  Object.keys(map || {}).forEach((k) => { const conta = String(map[k] || '').trim(); const n = dpNorm(k); if (!conta || !n) return; if (!exato.has(n)) exato.set(n, { conta, chave: k }); lista.push({ n, conta, chave: k }); });
  lista.sort((a, b) => b.n.length - a.n.length);                                // chave mais comprida primeiro
  return { exato, lista };
}
// 1º nome idêntico (sem caixa/acento); 2º "contém", só com chave de 4+ letras e a MAIS LONGA vence
function dpAchaConta(idx, nome) {
  const n = dpNorm(nome); if (!n) return null;
  const e = idx.exato.get(n); if (e) return { conta: e.conta, tipo: 'exato', chave: e.chave };
  for (const c of idx.lista) if (c.n.length >= 4 && n.includes(c.n)) return { conta: c.conta, tipo: 'contem', chave: c.chave };
  return null;
}
// busca por texto, sem caixa e sem acento. Regra com banco só vale se a coluna Banco existir.
function dpCasaRegra(hist, banco, regra, temColBanco) {
  const t = dpNorm(hist);
  for (const k of regra.keywords || []) if (!t.includes(dpNorm(k))) return false;
  if (regra.banco) { if (!temColBanco) return false; if (dpNorm(banco) !== dpNorm(regra.banco)) return false; }
  return true;
}
function dpAchaRegra(regras, hist, banco, temColBanco) { for (const r of regras || []) if (dpCasaRegra(hist, banco, r, temColBanco)) return r; return null; }

// Natureza a partir do texto da coluna Tipo/Operação. Devolve 'RECEBIMENTO', 'PAGAMENTO', 'TRANSFERENCIA' ou null (não reconheci).
// As operações da própria plataforma SN (Receita, Despesa, Retirada…) têm tabela exata; o resto é por palavra.
const DP_OPERACOES = { receita: 'RECEBIMENTO', aporte: 'RECEBIMENTO', emprestimo: 'RECEBIMENTO', despesa: 'PAGAMENTO', retirada: 'PAGAMENTO', estoque: 'PAGAMENTO', bens: 'PAGAMENTO', investimento: 'PAGAMENTO', 'entre bancos': 'TRANSFERENCIA' };
function dpNaturezaDoTipo(tipo) {
  const t = dpNorm(tipo); if (!t) return null;
  if (Object.prototype.hasOwnProperty.call(DP_OPERACOES, t)) return DP_OPERACOES[t];
  if (/entre\s+(bancos|contas)/.test(t)) return 'TRANSFERENCIA';
  if (/(receb|entrada|credito|receita|\bcr\b|^c$)/.test(t)) return 'RECEBIMENTO';
  if (/(pag|saida|debito|despesa|\bdb\b|^d$)/.test(t)) return 'PAGAMENTO';
  return null;
}

// ── detecção automática (cabeçalho e colunas) ────────────────────────────────
const DP_DICAS = {
  data: ['data', 'dt', 'vencimento', 'pagamento', 'emissao', 'liquidacao', 'lancamento', 'movimento'],
  valor: ['valor', 'vlr', 'total', 'montante', 'quantia', 'pago', 'recebido'],
  fornecedor: ['fornecedor', 'favorecido', 'beneficiario', 'cliente', 'razao', 'nome', 'credor', 'devedor', 'sacado'],
  historico: ['historico', 'descricao', 'observacao', 'complemento', 'memo', 'detalhe', 'obs'],
  banco: ['banco', 'portador', 'conta corrente', 'origem', 'caixa'],
  tipo: ['tipo', 'natureza', 'operacao', 'd/c', 'deb', 'cred', 'movimento'],
};
const DP_DICA_ENTRADA = /(entrada|credito|recebi|receita)/, DP_DICA_SAIDA = /(saida|debito|pago|pagamento|despesa)/;
const DP_DICA_EXTRA = ['complemento', 'observac', 'obs', 'detalhe', 'memo'];
function dpMapaVazio() { return { data: '', valor: '', valorEntrada: '', fornecedor: '', historico: '', banco: '', tipo: '', extras: [] }; }
function dpLinhaVazia(r) { return !r || r.every((c) => dpTexto(c) === ''); }
function dpTemData(r) { return (r || []).some((c) => dpParseData(c).ok); }
// acha a linha de cabeçalho: texto em 2+ células, SEM data na própria linha e, logo abaixo, uma linha com data
function dpDetectarCabecalho(linhas) {
  const lim = Math.min(linhas.length, 40);
  for (let i = 0; i < lim; i++) {
    const r = linhas[i] || [];
    if (dpTemData(r)) break;                                                    // 1ª linha com data = começam os lançamentos; cabeçalho só existe antes dela
    const textos = r.filter((c) => typeof c === 'string' && c.trim() !== '' && !dpParseData(c).ok && !dpParseValor(c).ok).length;
    if (textos < 2) continue;
    for (let j = i + 1; j < Math.min(linhas.length, i + 6); j++) if (dpTemData(linhas[j])) return i;
  }
  return -1;
}
// cabeçalho sugerido: o detectado; senão, a 1ª linha preenchida, ou -1 se ela já é lançamento (arquivo sem cabeçalho)
function dpCabPadrao(linhas) {
  const cab = dpDetectarCabecalho(linhas); if (cab >= 0) return cab;
  const f = linhas.findIndex((r) => !dpLinhaVazia(r)); if (f < 0) return -1;
  return dpTemData(linhas[f]) ? -1 : f;
}
function dpDetectarColunas(linhas, linhaCab) {
  const dados = linhas.slice(linhaCab + 1).filter((r) => !dpLinhaVazia(r)).slice(0, 200);
  const ncols = Math.max(0, ...linhas.map((r) => (r ? r.length : 0)));
  const cab = linhaCab >= 0 ? (linhas[linhaCab] || []) : [];
  const cols = [];
  for (let c = 0; c < ncols; c++) {
    const vals = dados.map((r) => r[c]).filter((v) => dpTexto(v) !== '');
    const n = vals.length || 1;
    const datas = vals.filter((v) => dpParseData(v).ok && !(typeof v === 'number' && v < 20000)).length / n;
    const nums = vals.filter((v) => dpParseValor(v).ok).length / n;
    const tam = vals.reduce((a, v) => a + dpTexto(v).length, 0) / n;
    const distintos = new Set(vals.map((v) => dpNorm(v))).size;                  // quantos valores diferentes (tipo e banco têm poucos)
    const dec = vals.filter((v) => (typeof v === 'number' ? Math.round(v * 100) % 100 !== 0 : /[.,]\d{2}\s*$/.test(String(v).trim()))).length / n;   // tem centavos = parece dinheiro
    const zeros = vals.filter((v) => /^0\d{4,}$/.test(String(v).trim())).length / n;                                                              // 00000040 = número de documento
    const reco = vals.filter((v) => dpTexto(v).length <= 20 && dpNaturezaDoTipo(v) !== null).length / n;                                                                    // "Despesa", "Recebimento"…
    const titulo = dpNorm(cab[c]);
    const nz = vals.filter((v) => { const p = dpParseValor(v); return p.ok && p.valor !== 0; }).length / n;                                                      // coluna só de zeros ("0") não é valor
    const curto = vals.filter((v) => /^\d{1,2}$/.test(String(v).trim())).length / n;                                                                            // 1, 2, 12… = ordem/código, não dinheiro
    cols.push({ c, datas, nums, nz, curto, tam, unicos: distintos / n, distintos, dec, zeros, reco, titulo, preenchida: vals.length / (dados.length || 1) });
  }
  const dica = (col, campo) => (DP_DICAS[campo].some((d) => col.titulo.includes(d)) ? 1 : 0);
  const usado = new Set(), mapa = dpMapaVazio();
  const pegar = (campo, pontua, minimo) => {
    let melhor = null;
    cols.forEach((col) => { if (usado.has(col.c)) return; const p = pontua(col); if (p >= minimo && (!melhor || p > melhor.p)) melhor = { c: col.c, p }; });
    if (melhor) { mapa[campo] = melhor.c; usado.add(melhor.c); }
  };
  pegar('data', (x) => x.datas + dica(x, 'data') * 0.5, 0.6);
  // candidatas a valor: numéricas, não-data, não só zeros, e não "numerinhos" de 1–2 dígitos (ordem/código)
  const candValor = (x) => x.datas <= 0.5 && x.nz >= 0.3 && x.curto <= 0.8 && x.zeros <= 0.3 && !x.titulo.includes('saldo') && x.nums >= 0.8;
  // 1º) DUAS colunas de valor (saídas × entradas): um par que NUNCA tem valor junto na mesma linha e que, somado, cobre as linhas com data.
  //     Um saldo corrido não entra no par: ele está preenchido junto com as duas.
  if (mapa.data !== '') {
    const comData = dados.filter((r) => dpParseData(r[mapa.data]).ok);
    const cheia = (r, c) => { const p = dpParseValor(r[c]); return p.ok && p.valor !== 0; };
    const cs = cols.filter((x) => x.c !== mapa.data && candValor(x));
    let melhor = null;
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      let a1 = 0, b1 = 0, ambos = 0, ate = 0;
      comData.forEach((r) => { const a = cheia(r, cs[i].c), b = cheia(r, cs[j].c); if (a) a1++; if (b) b1++; if (a || b) { ate++; if (a && b) ambos++; } });
      if (!comData.length || a1 / comData.length < 0.15 || b1 / comData.length < 0.15) continue;   // parceira quase vazia (juros, multa…) não forma par
      const excl = 1 - ambos / (ate || 1), cobertura = ate / comData.length;
      if (excl < 0.95 || cobertura < 0.8) continue;
      const p = cobertura + (DP_DICA_ENTRADA.test(cs[i].titulo + ' ' + cs[j].titulo) || DP_DICA_SAIDA.test(cs[i].titulo + ' ' + cs[j].titulo) ? 0.3 : 0);
      if (!melhor || p > melhor.p) melhor = { a: cs[i], b: cs[j], p };
    }
    if (melhor) {
      let { a: saida, b: entrada } = melhor;                                       // sem título: a da esquerda é a saída
      if ((DP_DICA_ENTRADA.test(saida.titulo) && !DP_DICA_ENTRADA.test(entrada.titulo)) || (DP_DICA_SAIDA.test(entrada.titulo) && !DP_DICA_SAIDA.test(saida.titulo))) [saida, entrada] = [entrada, saida];
      mapa.valor = saida.c; mapa.valorEntrada = entrada.c; usado.add(saida.c); usado.add(entrada.c);
    }
  }
  // 2º) uma coluna só
  if (mapa.valor === '') pegar('valor', (x) => (!candValor(x) ? 0 : x.nums + dica(x, 'valor') * 0.5 + (x.unicos > 0.3 ? 0.1 : 0) + x.dec * 0.3 - x.zeros * 0.6), 0.6);
  pegar('historico', (x) => (x.nums > 0.5 || x.datas > 0.5 || x.reco > 0.7 ? 0 : Math.min(x.tam / 40, 1) + dica(x, 'historico') * 0.6 + x.preenchida * 0.2), 0.5);
  pegar('fornecedor', (x) => (x.nums > 0.5 || x.datas > 0.5 || x.reco > 0.7 ? 0 : 0.3 + dica(x, 'fornecedor') * 0.7 + x.preenchida * 0.2), 0.75);
  pegar('banco', (x) => (x.nums > 0.5 || x.datas > 0.5 || x.distintos > 30 ? 0 : dica(x, 'banco') * 1 + (x.tam < 25 ? 0.1 : 0)), 1);
  // Tipo/Operação: título ajuda; e vale mesmo com muitos valores diferentes se (quase) todos forem reconhecíveis ("Despesa", "Receita", "Aporte"…)
  pegar('tipo', (x) => (x.nums > 0.5 || x.datas > 0.5 ? 0 : (x.reco >= 0.7 && x.distintos <= 20 ? 1 + dica(x, 'tipo') * 0.5 : (x.distintos <= 8 ? dica(x, 'tipo') : 0))), 1);
  if (mapa.fornecedor === '' && mapa.historico !== '') { mapa.fornecedor = mapa.historico; }   // um só texto: serve aos dois
  // colunas de complemento/observação entram no histórico (ajudam as regras e distinguem lançamentos parecidos)
  mapa.extras = cols.filter((x) => !usado.has(x.c) && x.nums < 0.5 && x.datas < 0.5 && x.preenchida >= 0.05 && DP_DICA_EXTRA.some((h) => x.titulo.includes(h))).slice(0, 3).map((x) => x.c);
  return mapa;
}
// assinatura do layout: reconhece a mesma planilha no mês seguinte.
// Com cabeçalho = os títulos; sem cabeçalho = a "forma" (quantas colunas e o tipo de cada uma: d=data, n=número, t=texto).
function dpAssinatura(linhas, linhaCab) {
  const r = linhaCab >= 0 ? (linhas[linhaCab] || []) : [];
  const titulos = r.map((c) => dpNorm(c)).filter(Boolean).join('|');
  if (titulos) return titulos;
  const dados = linhas.slice(linhaCab + 1).filter((x) => !dpLinhaVazia(x)).slice(0, 40), ncols = Math.max(0, ...dados.map((x) => x.length));
  let forma = '';
  for (let c = 0; c < ncols; c++) {
    const cont = { d: 0, n: 0, t: 0 };
    dados.forEach((x) => { const v = x[c]; if (dpTexto(v) === '') return; if (dpParseData(v).ok && !(typeof v === 'number' && v < 20000)) cont.d++; else if (dpParseValor(v).ok) cont.n++; else cont.t++; });
    forma += cont.d >= cont.n && cont.d >= cont.t && cont.d ? 'd' : cont.n >= cont.t && cont.n ? 'n' : cont.t ? 't' : '_';
  }
  return forma ? 'forma:' + ncols + ':' + forma : '';
}

// ── análise (o coração: nenhuma linha some sem motivo) ───────────────────────
// cfg: contaCaixa, contaPadrao, naturezaPadrao, usarSinal, ano, deParaMap, regras
// mapa: índices das colunas ('' = não usar). linhaCab: -1 = sem cabeçalho.
// Com `mapa.valorEntrada`, `mapa.valor` é a coluna de SAÍDAS e a natureza vem de qual coluna está preenchida.
function dpAnalisar(linhas, linhaCab, mapa, cfg) {
  const idx = dpIndiceDePara(cfg.deParaMap), temBanco = dpTem(mapa.banco), dual = dpTem(mapa.valorEntrada);
  const extras = Array.isArray(mapa.extras) ? mapa.extras : [];
  const cel = (r, i) => (dpTem(i) ? r[i] : '');
  const res = { linhas: [], lancamentos: [], origemNat: {}, resumo: { lidas: 0, validas: 0, erros: 0, ignoradas: 0, vazias: 0, semConta: 0, avisos: 0, duplicados: 0, anoDiferente: 0, transferencias: 0 } };
  const vistos = new Map(), contaPadrao = (cfg.contaPadrao || DP_CONTA_PADRAO).trim();
  const ini = linhaCab + 1;
  for (let i = ini; i < linhas.length; i++) {
    const r = linhas[i] || [];
    if (dpLinhaVazia(r)) { res.resumo.vazias++; continue; }
    res.resumo.lidas++;
    const L = { linha: i + 1, data: '', valor: null, forn: '', hist: '', banco: '', tipo: '', status: 'ok', motivos: [], avisos: [] };
    L.forn = dpTexto(cel(r, mapa.fornecedor));
    const base = dpTem(mapa.historico) ? dpTexto(cel(r, mapa.historico)) : L.forn;
    L.hist = [base].concat(extras.map((c) => dpTexto(cel(r, c)))).filter(Boolean).join(' · ');
    L.banco = temBanco ? dpTexto(cel(r, mapa.banco)) : ''; L.tipo = dpTem(mapa.tipo) ? dpTexto(cel(r, mapa.tipo)) : '';
    const pd = dpParseData(cel(r, mapa.data));
    let pv, dir = null;
    if (dual) {
      const ps = dpParseValor(cel(r, mapa.valor)), pe = dpParseValor(cel(r, mapa.valorEntrada));
      const vs = ps.ok && ps.valor !== 0, ve = pe.ok && pe.valor !== 0;
      L.valorLido = [dpTexto(cel(r, mapa.valor)), dpTexto(cel(r, mapa.valorEntrada))].filter(Boolean).join(' / ');
      if (vs && ve) pv = { ok: false, erro: 'valor nas duas colunas (saída e entrada) na mesma linha' };
      else if (vs) { pv = { ok: true, valor: ps.valor }; dir = 'PAGAMENTO'; }
      else if (ve) { pv = { ok: true, valor: pe.valor }; dir = 'RECEBIMENTO'; }
      else if (ps.ok || pe.ok) pv = { ok: true, valor: 0 };
      else if ((ps.vazio || ps.ok) && (pe.vazio || pe.ok)) pv = { ok: false, vazio: true, erro: 'sem valor nas colunas de saída e entrada' };
      else pv = { ok: false, erro: !ps.ok && !ps.vazio ? ps.erro : pe.erro };
      if (pv.ok && pv.valor < 0) { L.avisos.push('valor negativo numa coluna de ' + (dir === 'PAGAMENTO' ? 'saída' : 'entrada') + ' (usado em módulo)'); pv.valor = Math.abs(pv.valor); }
    } else { pv = dpParseValor(cel(r, mapa.valor)); L.valorLido = dpTexto(cel(r, mapa.valor)); }
    L.dataLida = dpTexto(cel(r, mapa.data));
    if (pd.ok) L.data = pd.br;
    if (pv.ok) L.valor = pv.valor;
    const ehTotal = /^(total|subtotal|saldo|soma|resumo)\b/.test(dpNorm(L.forn || L.hist));
    if (!pd.ok || !pv.ok) {
      if (pd.vazio && pv.vazio) { L.status = 'ignorada'; L.motivos.push('sem data e sem valor (título, observação ou separador)'); }
      else if (!pd.ok && pv.ok && ehTotal) { L.status = 'ignorada'; L.motivos.push('linha de total/saldo'); }
      else { L.status = 'erro'; if (!pd.ok) L.motivos.push(pd.erro); if (!pv.ok) L.motivos.push(pv.erro); }
      res.linhas.push(L); res.resumo[L.status === 'erro' ? 'erros' : 'ignoradas']++; continue;
    }
    if (pv.valor === 0) { L.status = 'erro'; L.motivos.push('valor zero'); res.linhas.push(L); res.resumo.erros++; continue; }
    const nt0 = dpNaturezaDoTipo(L.tipo);
    if (nt0 === 'TRANSFERENCIA') {                                                // não dá para saber as duas contas: fica de fora e é contada
      L.status = 'ignorada'; L.motivos.push('transferência entre bancos — lance à mão (não vai no arquivo)');
      res.linhas.push(L); res.resumo.ignoradas++; res.resumo.transferencias++; continue;
    }
    // conta e natureza
    let conta, origemConta, natureza, origemNat, semConta = false, codigoLinha = '';
    const regra = dpAchaRegra(cfg.regras, L.hist, L.banco, temBanco);
    if (regra) {
      conta = regra.conta; origemConta = 'regra: ' + (regra.keywords || []).join(' + '); natureza = regra.natureza; origemNat = 'regra'; codigoLinha = regra.codigo || '';
      if (dir && dir !== natureza) L.avisos.push('a regra diz ' + natureza.toLowerCase() + ', mas o valor está na coluna de ' + (dir === 'PAGAMENTO' ? 'saída' : 'entrada'));
    } else {
      const m = dpAchaConta(idx, L.forn || L.hist);
      if (m) { conta = m.conta; codigoLinha = (cfg.codigosMap && cfg.codigosMap[m.chave]) || ''; origemConta = 'DE-PARA ' + (m.tipo === 'exato' ? 'exato' : 'contém "' + m.chave + '"'); if (m.tipo !== 'exato') L.avisos.push('conta por aproximação ("' + m.chave + '") — confira'); }
      else { conta = contaPadrao; origemConta = 'sem regra nem DE-PARA'; semConta = true; L.avisos.push('sem conta definida: usando ' + contaPadrao); }
      if (dir) { natureza = dir; origemNat = 'coluna de ' + (dir === 'PAGAMENTO' ? 'saída' : 'entrada'); }
      else if (nt0) { natureza = nt0; origemNat = 'coluna Tipo'; }
      else {
        if (L.tipo) L.avisos.push('tipo "' + L.tipo + '" não reconhecido');
        if (cfg.usarSinal) { natureza = pv.valor < 0 ? 'PAGAMENTO' : 'RECEBIMENTO'; origemNat = 'sinal do valor'; }
        else { natureza = cfg.naturezaPadrao === 'RECEBIMENTO' ? 'RECEBIMENTO' : 'PAGAMENTO'; origemNat = 'padrão do cliente'; }
      }
    }
    res.origemNat[origemNat] = (res.origemNat[origemNat] || 0) + 1;
    const caixa = String(cfg.contaCaixa || '').trim();
    L.contaDebito = natureza === 'PAGAMENTO' ? conta : caixa; L.contaCredito = natureza === 'PAGAMENTO' ? caixa : conta;
    L.natureza = natureza; L.origemConta = origemConta; L.origemNat = origemNat; L.semConta = semConta;
    L.codigo = dpCodigo5(codigoLinha, cfg.codigoPadrao);
    if (semConta) res.resumo.semConta++;
    if (pd.corrigida) L.avisos.push('data lida de "' + pd.original + '" (caracteres extras ignorados)');
    if (ehTotal) L.avisos.push('parece uma linha de total/saldo — confira se deve entrar');
    if (cfg.ano && pd.a !== Number(cfg.ano)) { L.avisos.push('ano ' + pd.a + ' diferente de ' + cfg.ano); res.resumo.anoDiferente++; }
    const chave = pd.iso + '|' + Math.abs(pv.valor) + '|' + dpNorm(L.hist);
    if (vistos.has(chave)) { L.avisos.push('possível duplicado da linha ' + vistos.get(chave)); res.resumo.duplicados++; } else vistos.set(chave, L.linha);
    if (L.avisos.length) { L.status = 'aviso'; res.resumo.avisos++; }
    res.resumo.validas++;
    res.linhas.push(L);
    res.lancamentos.push({ linha: L.linha, data: pd.br, contaDebito: L.contaDebito, contaCredito: L.contaCredito, valor: Math.abs(pv.valor), historico: L.hist, natureza, semConta, codigo: L.codigo });
  }
  return res;
}

// ── nota de confiança da LEITURA ─────────────────────────────────────────────
// Diz o quanto o sistema tem de certeza de que entendeu o arquivo. 'baixa' = pare e confira; 'media' = confira o ponto indicado;
// 'alta' = pode seguir. As CONTAS (o que falta cadastrar) são outra coisa e vêm à parte em `contas`.
const DP_ORDEM_NIVEL = { alta: 0, media: 1, baixa: 2 };
function dpConfianca(linhas, linhaCab, mapa, res, cfg) {
  const niv = (r, alta, media) => (r >= alta ? 'alta' : r >= media ? 'media' : 'baixa');
  const base = res.linhas.filter((l) => l.status !== 'ignorada'), n = base.length || 1, pct = (x) => Math.round(x * 100);
  const campos = {}, cab = linhaCab >= 0 ? (linhas[linhaCab] || []) : [];
  const tit = (i) => (dpTem(i) ? dpNorm(cab[i]) : '');
  const rd = base.filter((l) => l.data).length / n;
  campos.data = { nivel: niv(rd, 0.97, 0.85), pct: pct(rd), nota: rd < 1 ? (base.length - base.filter((l) => l.data).length) + ' linha(s) com data ilegível' : '' };
  const rv = base.filter((l) => l.valor != null).length / n;
  campos.valor = { nivel: niv(rv, 0.97, 0.85), pct: pct(rv), nota: rv < 1 ? (base.length - base.filter((l) => l.valor != null).length) + ' linha(s) com valor ilegível' : '' };
  const rh = base.filter((l) => l.hist).length / n;
  campos.historico = { nivel: niv(rh, 0.9, 0.6), pct: pct(rh), nota: rh < 1 ? (base.length - base.filter((l) => l.hist).length) + ' linha(s) sem texto de histórico' : '' };
  // natureza (pagamento/recebimento): quanto vem de algo explícito no arquivo
  const o = res.origemNat || {}, tot = Object.values(o).reduce((a, b) => a + b, 0) || 1;
  const explicito = (o['regra'] || 0) + (o['coluna Tipo'] || 0) + (o['coluna de saída'] || 0) + (o['coluna de entrada'] || 0), sinal = o['sinal do valor'] || 0, padrao = o['padrão do cliente'] || 0;
  let nat = { nivel: 'alta', pct: pct(explicito / tot), nota: '' };
  if (padrao / tot >= 0.5) nat = { nivel: 'media', pct: pct(explicito / tot), nota: 'quase tudo usa a natureza padrão do cliente (' + (cfg && cfg.naturezaPadrao === 'RECEBIMENTO' ? 'recebimento' : 'pagamento') + ') — confira se o arquivo só tem um tipo de movimento' };
  else if (padrao) nat = { nivel: 'media', pct: pct(explicito / tot), nota: padrao + ' linha(s) sem Tipo/coluna definida usaram a natureza padrão' };
  else if (sinal) nat = { nivel: 'media', pct: pct(explicito / tot), nota: 'natureza pelo sinal do valor em ' + sinal + ' linha(s)' };
  campos.natureza = nat;
  // colunas: o cabeçalho confirma o que foi detectado?
  let col = { nivel: 'alta', nota: '' };
  const okTit = (i, campo) => dpTem(i) && DP_DICAS[campo].some((d) => tit(i).includes(d));
  if (linhaCab < 0) col = { nivel: 'media', nota: 'arquivo sem cabeçalho — confira as colunas na prévia' };
  else if (!(okTit(mapa.data, 'data') && (okTit(mapa.valor, 'valor') || dpTem(mapa.valorEntrada)))) col = { nivel: 'media', nota: 'os títulos das colunas não confirmam a detecção — confira na prévia' };
  if (dpTem(mapa.valorEntrada) && !(DP_DICA_ENTRADA.test(tit(mapa.valorEntrada)) || DP_DICA_SAIDA.test(tit(mapa.valor)))) col = { nivel: 'media', nota: 'duas colunas de valor sem título claro — confira qual é a SAÍDA (esquerda) e qual é a ENTRADA' };
  campos.colunas = col;
  const erros = res.resumo.erros, ratioErro = erros / n;
  if (ratioErro > 0.1) campos.valor = { nivel: 'baixa', pct: campos.valor.pct, nota: erros + ' linha(s) com erro (' + pct(ratioErro) + '%) — o mapeamento pode estar errado' };
  const geral = Object.values(campos).reduce((a, c) => (DP_ORDEM_NIVEL[c.nivel] > DP_ORDEM_NIVEL[a] ? c.nivel : a), 'alta');
  const notas = Object.keys(campos).filter((k) => campos[k].nota).map((k) => ({ campo: k, nivel: campos[k].nivel, nota: campos[k].nota }));
  return { geral, campos, notas, pronto: geral !== 'baixa', contas: { semConta: res.resumo.semConta, validas: res.resumo.validas } };
}

// ── arquivo de saída ─────────────────────────────────────────────────────────
const DP_WIN1252 = { 0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F };
// ANSI de verdade (Windows-1252). Caractere sem correspondência vira "?" e é CONTADO — não corrompe em silêncio.
function dpCodificarAnsi(texto) {
  const out = []; let trocados = 0;
  for (const ch of texto) {
    const cp = ch.codePointAt(0);
    if (cp < 0x80 || (cp >= 0xA0 && cp <= 0xFF)) out.push(cp);
    else if (DP_WIN1252[cp] !== undefined) out.push(DP_WIN1252[cp]);
    else { out.push(0x3F); trocados++; }
  }
  return { bytes: Uint8Array.from(out), trocados };
}
// o delimitador, quebras de linha e tabs dentro do histórico quebrariam as colunas: viram espaço
function dpLimpaCampo(s, delim) { return String(s == null ? '' : s).split(delim).join(' ').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim(); }
// ── layout POSICIONAL do Contmatic (padrão dos arquivos que o contador importa) ──
// Conferido em 109 arquivos reais (8.464 lançamentos): 100% idênticos neste desenho. Linha de 330 colunas, quebra CRLF, sem cabeçalho nem rodapé:
//   1-7  sequencial do lançamento (0000001, 0000002…, recomeça em cada arquivo)
//   8-12 dia/mês (dd/mm — o padrão NÃO tem ano)
//   13-19 conta de débito (7 dígitos, zeros à esquerda)   20-26 conta de crédito (7 dígitos)
//   27-43 valor: 14 inteiros + "." + 2 decimais (sempre positivo)
//   44-48 código de 5 dígitos (por descrição/regra; sem código = o padrão do cliente, 00000)
//   49-330 histórico em MAIÚSCULAS, sem acento, completado com espaços
const DP_POS_LARGURA = 330, DP_POS_HIST = 282;
function dpCodigo5(v, padrao) {                                                    // só dígitos; vazio usa o padrão; devolve preenchido com zeros (NÃO corta: o gerador acusa se passar de 5)
  const d = String(v == null ? '' : v).replace(/\D/g, ''), p = String(padrao == null ? '' : padrao).replace(/\D/g, '');
  return (d || p || '0').padStart(5, '0');
}
function dpHistContmatic(h) { return String(h == null ? '' : h).normalize('NFD').replace(DP_RE_ACENTOS, '').toUpperCase().replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim(); }
function dpLinhaContmatic(seq, l, avisos) {
  const lin = 'lançamento ' + seq;
  const conta = (c, qual) => { const t = String(c == null ? '' : c).trim(); if (/^\d{1,7}$/.test(t)) return t.padStart(7, '0'); avisos.push(lin + ': conta de ' + qual + ' "' + t + '" não cabe em 7 dígitos numéricos — saiu 0000000'); return '0000000'; };
  const m = String(l.data || '').match(/^(\d{2}\/\d{2})\/\d{4}$/);
  if (!m) avisos.push(lin + ': data "' + l.data + '" fora de dd/mm/aaaa');
  const v = Math.abs(Number(l.valor) || 0).toFixed(2), [ent, dec] = v.split('.');
  if (ent.length > 14) avisos.push(lin + ': valor grande demais para 14 dígitos inteiros');
  let cod = dpCodigo5(l.codigo); if (cod.length !== 5) { avisos.push(lin + ': código "' + l.codigo + '" tem mais de 5 dígitos — saiu 00000'); cod = '00000'; }
  let hist = dpHistContmatic(l.historico); if (hist.length > DP_POS_HIST) { avisos.push(lin + ': histórico com ' + hist.length + ' caracteres, cortado em ' + DP_POS_HIST); hist = hist.slice(0, DP_POS_HIST); }
  const linha = String(seq).padStart(7, '0') + (m ? m[1] : '00/00') + conta(l.contaDebito, 'débito') + conta(l.contaCredito, 'crédito') + ent.padStart(14, '0') + '.' + dec + cod + hist;
  return linha.padEnd(DP_POS_LARGURA, ' ');
}
function dpGerarTxtContmatic(lancs, o) {
  const avisos = [], anos = new Set();
  lancs.forEach((l) => { const a = String(l.data || '').slice(6, 10); if (a) anos.add(a); });
  if (anos.size > 1) avisos.push('os lançamentos cruzam mais de um ano (' + [...anos].sort().join(', ') + '): o padrão do Contmatic guarda só dia/mês — gere um arquivo por ano');
  const texto = lancs.map((l, i) => dpLinhaContmatic(i + 1, l, avisos)).join('\r\n') + '\r\n';
  const r = dpCodificarAnsi(texto);
  return { bytes: r.bytes, trocados: r.trocados, avisos, texto };
}
function dpGerarTxt(lancs, o) {
  if (o.formato !== 'delimitado') return dpGerarTxtContmatic(lancs, o);            // padrão: layout posicional do Contmatic
  const delim = o.delimitador === 'tab' ? '\t' : (o.delimitador || ';');
  const linhas = lancs.map((l) => [l.data, l.contaDebito, l.contaCredito, dpFmtValor(l.valor, o.decimalFmt), dpLimpaCampo(l.historico, delim)].join(delim));
  const texto = linhas.join('\r\n') + '\r\n';
  const aviso = [];
  if (o.decimalFmt === 'virgula' && delim === ',') aviso.push('valor com vírgula decimal e separador de campos vírgula: as colunas vão se confundir');
  if (o.decimalFmt === 'ponto' && delim === '.') aviso.push('separador ponto com valor decimal ponto');
  if (o.codificacao === 'utf8') return { bytes: new TextEncoder().encode(texto), trocados: 0, avisos: aviso, texto };
  const r = dpCodificarAnsi(texto);
  return { bytes: r.bytes, trocados: r.trocados, avisos: aviso, texto };
}
function dpNomeArquivo(cliente, ano) { return (String(cliente || 'EMPRESA').normalize('NFD').replace(DP_RE_ACENTOS, '').replace(/[^A-Za-z0-9]+/g, '') || 'EMPRESA') + '_' + (ano || new Date().getFullYear()) + '_Lctos.txt'; }

// ── configuração do cliente (Firestore) ──────────────────────────────────────
function dpConfigVazia() {
  return { contaCaixa: '', contaPadrao: DP_CONTA_PADRAO, formato: 'contmatic', codigoPadrao: '00000', delimitador: ';', decimalFmt: 'virgula', codificacao: 'ansi', naturezaPadrao: 'PAGAMENTO', usarSinal: false, ano: '', deParaMap: {}, codigosMap: {}, regras: [], layout: null };
}
// aceita config nova e o formato do conversor antigo (mesmos nomes de campo)
function dpNormalizarConfig(raw) {
  const c = Object.assign(dpConfigVazia(), raw && typeof raw === 'object' ? raw : {});
  c.deParaMap = c.deParaMap && typeof c.deParaMap === 'object' && !Array.isArray(c.deParaMap) ? c.deParaMap : {};
  c.codigosMap = c.codigosMap && typeof c.codigosMap === 'object' && !Array.isArray(c.codigosMap) ? c.codigosMap : {};
  c.formato = c.formato === 'delimitado' ? 'delimitado' : 'contmatic';
  c.codigoPadrao = String(c.codigoPadrao == null || c.codigoPadrao === '' ? '00000' : c.codigoPadrao).replace(/\D/g, '').slice(0, 5).padStart(5, '0');
  c.regras = (Array.isArray(c.regras) ? c.regras : []).filter((r) => r && Array.isArray(r.keywords)).map((r, i) => ({ id: r.id || 'r' + (i + 1), keywords: r.keywords.map(String), banco: r.banco || '', natureza: r.natureza === 'RECEBIMENTO' ? 'RECEBIMENTO' : 'PAGAMENTO', conta: String(r.conta || ''), codigo: String(r.codigo || '').replace(/\D/g, '').slice(0, 5) }));
  c.naturezaPadrao = c.naturezaPadrao === 'RECEBIMENTO' ? 'RECEBIMENTO' : 'PAGAMENTO';
  c.delimitador = [';', ',', 'tab'].includes(c.delimitador) ? c.delimitador : ';';
  c.decimalFmt = c.decimalFmt === 'ponto' ? 'ponto' : 'virgula';
  c.codificacao = c.codificacao === 'utf8' ? 'utf8' : 'ansi';
  c.usarSinal = !!c.usarSinal; c.contaPadrao = String(c.contaPadrao || DP_CONTA_PADRAO); c.contaCaixa = String(c.contaCaixa || '');
  return c;
}
function dpUnicos(linhas, linhaCab, idx, max) {
  if (idx === '' || idx == null) return [];
  const m = new Map();
  for (let i = linhaCab + 1; i < linhas.length; i++) { const v = dpTexto((linhas[i] || [])[idx]); if (!v) continue; m.set(v, (m.get(v) || 0) + 1); }
  const arr = Array.from(m, ([valor, qtd]) => ({ valor, qtd })).sort((a, b) => a.valor.localeCompare(b.valor, 'pt-BR'));
  return max ? arr.slice(0, max) : arr;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { dpNorm, dpParseData, dpParseValor, dpFmtValor, dpIndiceDePara, dpAchaConta, dpCasaRegra, dpAchaRegra, dpNaturezaDoTipo, dpDetectarCabecalho, dpCabPadrao, dpDetectarColunas, dpAssinatura, dpAnalisar, dpConfianca, dpMapaVazio, dpCodificarAnsi, dpGerarTxt, dpNomeArquivo, dpNormalizarConfig, dpConfigVazia, dpTokenizar, dpColLetra, dpUnicos, dpLimpaCampo, dpCodigo5, dpHistContmatic, dpLinhaContmatic, dpGerarTxtContmatic, DP_POS_LARGURA, DP_POS_HIST };
}
