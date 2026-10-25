// ═══ DE-PARA · núcleo puro ═══════════════════════════════════════════════════
// Sem DOM e sem Firebase: lê células, valida, resolve contas e gera o .txt.
// Roda no navegador (admin) e no Node (testes). Prefixo dp* / DP_*.
// Regra de ouro deste arquivo: NENHUMA linha some em silêncio — toda linha lida
// termina como "ok", "aviso", "erro" ou "ignorada", sempre com o motivo.

const DP_CONTA_PADRAO = '999999';
const DP_ANO_MIN = 1990, DP_ANO_MAX = 2100;

// ── texto ────────────────────────────────────────────────────────────────────
// minúsculo, sem acento, espaços colapsados — usado em TODA comparação de texto
function dpNorm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
function dpPad(n) { return String(n).padStart(2, '0'); }
function dpColLetra(i) { let s = '', n = i + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }
function dpTexto(v) {
  if (v == null) return '';
  if (v instanceof Date) return isNaN(v) ? '' : dpPad(v.getDate()) + '/' + dpPad(v.getMonth() + 1) + '/' + v.getFullYear();
  return String(v).replace(/\s+/g, ' ').trim();
}
function dpTokenizar(texto) { return String(texto == null ? '' : texto).match(/[A-Za-zÀ-ÿ0-9]+|[^\sA-Za-zÀ-ÿ0-9]/g) || []; }

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
  let m;
  if ((m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/))) return dpDataRes(+m[1], +m[2], +m[3], orig);
  if ((m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/))) return dpDataRes(+m[1], +m[2], 2000 + +m[3], orig);
  if ((m = t.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/))) return dpDataRes(+m[3], +m[2], +m[1], orig);
  if ((m = t.match(/^(\d{2})(\d{2})(\d{4})$/))) return dpDataRes(+m[1], +m[2], +m[3], orig);
  if (/^\d{5}$/.test(t)) return dpParseData(+t);                                // série do Excel gravada como texto
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
  s = s.replace(/[^\d.,]/g, '');                                                // sobra só dígito e separador
  if (!/\d/.test(s)) return { ok: false, erro: 'valor não numérico: "' + orig + '"' };
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

// natureza a partir do texto da coluna Tipo; null = não reconheci
function dpNaturezaDoTipo(tipo) {
  const t = dpNorm(tipo); if (!t) return null;
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
function dpLinhaVazia(r) { return !r || r.every((c) => dpTexto(c) === ''); }
// acha a linha de cabeçalho: texto em 2+ células e, logo abaixo, uma linha com data
function dpDetectarCabecalho(linhas) {
  const lim = Math.min(linhas.length, 40);
  for (let i = 0; i < lim; i++) {
    const r = linhas[i] || [];
    const textos = r.filter((c) => typeof c === 'string' && c.trim() !== '' && !dpParseData(c).ok && !dpParseValor(c).ok).length;
    if (textos < 2) continue;
    for (let j = i + 1; j < Math.min(linhas.length, i + 6); j++) if ((linhas[j] || []).some((c) => dpParseData(c).ok)) return i;
  }
  return -1;
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
    const titulo = dpNorm(cab[c]);
    cols.push({ c, datas, nums, tam, unicos: distintos / n, distintos, titulo, preenchida: vals.length / (dados.length || 1) });
  }
  const dica = (col, campo) => (DP_DICAS[campo].some((d) => col.titulo.includes(d)) ? 1 : 0);
  const usado = new Set(), mapa = { data: '', valor: '', fornecedor: '', historico: '', banco: '', tipo: '' };
  const pegar = (campo, pontua, minimo) => {
    let melhor = null;
    cols.forEach((col) => { if (usado.has(col.c)) return; const p = pontua(col); if (p >= minimo && (!melhor || p > melhor.p)) melhor = { c: col.c, p }; });
    if (melhor) { mapa[campo] = melhor.c; usado.add(melhor.c); }
  };
  pegar('data', (x) => x.datas + dica(x, 'data') * 0.5, 0.6);
  pegar('valor', (x) => (x.datas > 0.5 ? 0 : x.nums + dica(x, 'valor') * 0.5 + (x.unicos > 0.3 ? 0.1 : 0)), 0.6);
  pegar('historico', (x) => (x.nums > 0.5 || x.datas > 0.5 ? 0 : Math.min(x.tam / 40, 1) + dica(x, 'historico') * 0.6 + x.preenchida * 0.2), 0.5);
  pegar('fornecedor', (x) => (x.nums > 0.5 || x.datas > 0.5 ? 0 : 0.3 + dica(x, 'fornecedor') * 0.7 + x.preenchida * 0.2), 0.75);
  pegar('banco', (x) => (x.nums > 0.5 || x.datas > 0.5 || x.distintos > 30 ? 0 : dica(x, 'banco') * 1 + (x.tam < 25 ? 0.1 : 0)), 1);
  pegar('tipo', (x) => (x.nums > 0.5 || x.datas > 0.5 || x.distintos > 8 ? 0 : dica(x, 'tipo') * 1), 1);
  if (mapa.fornecedor === '' && mapa.historico !== '') { mapa.fornecedor = mapa.historico; }   // um só texto: serve aos dois
  return mapa;
}
// assinatura do layout: reconhece a mesma planilha no mês seguinte
function dpAssinatura(linhas, linhaCab) { const r = linhaCab >= 0 ? (linhas[linhaCab] || []) : []; return r.map((c) => dpNorm(c)).filter(Boolean).join('|'); }

// ── análise (o coração: nenhuma linha some sem motivo) ───────────────────────
// cfg: contaCaixa, contaPadrao, naturezaPadrao, usarSinal, ano, deParaMap, regras
// mapa: índices das colunas ('' = não usar). linhaCab: -1 = sem cabeçalho.
function dpAnalisar(linhas, linhaCab, mapa, cfg) {
  const idx = dpIndiceDePara(cfg.deParaMap), temBanco = mapa.banco !== '' && mapa.banco != null;
  const cel = (r, i) => (i === '' || i == null ? '' : r[i]);
  const res = { linhas: [], lancamentos: [], resumo: { lidas: 0, validas: 0, erros: 0, ignoradas: 0, vazias: 0, semConta: 0, avisos: 0, duplicados: 0, anoDiferente: 0 } };
  const vistos = new Map(), contaPadrao = (cfg.contaPadrao || DP_CONTA_PADRAO).trim();
  const ini = linhaCab + 1;
  for (let i = ini; i < linhas.length; i++) {
    const r = linhas[i] || [];
    if (dpLinhaVazia(r)) { res.resumo.vazias++; continue; }
    res.resumo.lidas++;
    const L = { linha: i + 1, data: '', valor: null, forn: '', hist: '', banco: '', tipo: '', status: 'ok', motivos: [], avisos: [] };
    L.forn = dpTexto(cel(r, mapa.fornecedor)); L.hist = mapa.historico !== '' && mapa.historico != null ? dpTexto(cel(r, mapa.historico)) : L.forn;
    L.banco = temBanco ? dpTexto(cel(r, mapa.banco)) : ''; L.tipo = mapa.tipo !== '' && mapa.tipo != null ? dpTexto(cel(r, mapa.tipo)) : '';
    const pd = dpParseData(cel(r, mapa.data)), pv = dpParseValor(cel(r, mapa.valor));
    L.dataLida = dpTexto(cel(r, mapa.data)); L.valorLido = dpTexto(cel(r, mapa.valor));
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
    // conta e natureza
    let conta, origemConta, natureza, origemNat, semConta = false;
    const regra = dpAchaRegra(cfg.regras, L.hist, L.banco, temBanco);
    if (regra) { conta = regra.conta; origemConta = 'regra: ' + (regra.keywords || []).join(' + '); natureza = regra.natureza; origemNat = 'regra'; }
    else {
      const m = dpAchaConta(idx, L.forn || L.hist);
      if (m) { conta = m.conta; origemConta = 'DE-PARA ' + (m.tipo === 'exato' ? 'exato' : 'contém "' + m.chave + '"'); if (m.tipo !== 'exato') L.avisos.push('conta por aproximação ("' + m.chave + '") — confira'); }
      else { conta = contaPadrao; origemConta = 'sem regra nem DE-PARA'; semConta = true; L.avisos.push('sem conta definida: usando ' + contaPadrao); }
      const nt = dpNaturezaDoTipo(L.tipo);
      if (nt) { natureza = nt; origemNat = 'coluna Tipo'; }
      else {
        if (L.tipo) L.avisos.push('tipo "' + L.tipo + '" não reconhecido');
        if (cfg.usarSinal) { natureza = pv.valor < 0 ? 'PAGAMENTO' : 'RECEBIMENTO'; origemNat = 'sinal do valor'; }
        else { natureza = cfg.naturezaPadrao === 'RECEBIMENTO' ? 'RECEBIMENTO' : 'PAGAMENTO'; origemNat = 'padrão do cliente'; }
      }
    }
    const caixa = String(cfg.contaCaixa || '').trim();
    L.contaDebito = natureza === 'PAGAMENTO' ? conta : caixa; L.contaCredito = natureza === 'PAGAMENTO' ? caixa : conta;
    L.natureza = natureza; L.origemConta = origemConta; L.origemNat = origemNat; L.semConta = semConta;
    if (semConta) res.resumo.semConta++;
    if (cfg.ano && pd.a !== Number(cfg.ano)) { L.avisos.push('ano ' + pd.a + ' diferente de ' + cfg.ano); res.resumo.anoDiferente++; }
    const chave = pd.iso + '|' + Math.abs(pv.valor) + '|' + dpNorm(L.hist);
    if (vistos.has(chave)) { L.avisos.push('possível duplicado da linha ' + vistos.get(chave)); res.resumo.duplicados++; } else vistos.set(chave, L.linha);
    if (L.avisos.length) { L.status = 'aviso'; res.resumo.avisos++; }
    res.resumo.validas++;
    res.linhas.push(L);
    res.lancamentos.push({ linha: L.linha, data: pd.br, contaDebito: L.contaDebito, contaCredito: L.contaCredito, valor: Math.abs(pv.valor), historico: L.hist, natureza, semConta });
  }
  return res;
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
function dpGerarTxt(lancs, o) {
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
function dpNomeArquivo(cliente, ano) { return (String(cliente || 'EMPRESA').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '') || 'EMPRESA') + '_' + (ano || new Date().getFullYear()) + '_Lctos.txt'; }

// ── configuração do cliente (Firestore) ──────────────────────────────────────
function dpConfigVazia() {
  return { contaCaixa: '', contaPadrao: DP_CONTA_PADRAO, delimitador: ';', decimalFmt: 'virgula', codificacao: 'ansi', naturezaPadrao: 'PAGAMENTO', usarSinal: false, ano: '', deParaMap: {}, regras: [], layout: null };
}
// aceita config nova e o .json exportado pelo conversor antigo (mesmos nomes de campo)
function dpNormalizarConfig(raw) {
  const c = Object.assign(dpConfigVazia(), raw && typeof raw === 'object' ? raw : {});
  c.deParaMap = c.deParaMap && typeof c.deParaMap === 'object' && !Array.isArray(c.deParaMap) ? c.deParaMap : {};
  c.regras = (Array.isArray(c.regras) ? c.regras : []).filter((r) => r && Array.isArray(r.keywords)).map((r, i) => ({ id: r.id || 'r' + (i + 1), keywords: r.keywords.map(String), banco: r.banco || '', natureza: r.natureza === 'RECEBIMENTO' ? 'RECEBIMENTO' : 'PAGAMENTO', conta: String(r.conta || '') }));
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
  module.exports = { dpNorm, dpParseData, dpParseValor, dpFmtValor, dpIndiceDePara, dpAchaConta, dpCasaRegra, dpAchaRegra, dpNaturezaDoTipo, dpDetectarCabecalho, dpDetectarColunas, dpAssinatura, dpAnalisar, dpCodificarAnsi, dpGerarTxt, dpNomeArquivo, dpNormalizarConfig, dpConfigVazia, dpTokenizar, dpColLetra, dpUnicos, dpLimpaCampo };
}
