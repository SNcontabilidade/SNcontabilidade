// ═══ Backup do banco (só admin) ══════════════════════════════════════════════
// Baixa UM arquivo .json com todos os documentos das coleções do app (💾), ou o ENVIA para uma pasta no Google Drive do admin (☁).
// Registra quando foi o último backup (sn/backupmeta) e mostra o aviso no admin. Prefixo bk*. Carregado só pelo admin.html.
// ATENÇÃO: o arquivo contém dados de clientes (CNPJ, e-mail, senhas, lançamentos) — guarde fora do Git.

const BK_COLECOES = ['sn', 'sntx', 'perfil', 'vinculos', 'conversas', 'leitura', 'config'];   // as que as regras deixam LISTAR (as 5 últimas são o modelo novo de acesso)
// "loginmeta" entra à parte: as regras só deixam LER documento a documento (get), nunca listar — então vem pelo hash do usuário de cada cliente.
const BK_FORMATO = 1;

// Timestamp do Firestore vira texto ISO; o resto passa como veio (arrays, mapas, strings, números)
function bkNormalizar(v) {
  if (v == null || typeof v !== 'object') return v;
  if (typeof v.toDate === 'function') { try { return { __timestamp: v.toDate().toISOString() }; } catch (e) { return { __timestamp: null }; } }
  if (Array.isArray(v)) return v.map(bkNormalizar);
  const o = {}; Object.keys(v).forEach((k) => { o[k] = bkNormalizar(v[k]); }); return o;
}
// docs: [{ id, data }] por coleção → objeto do arquivo + contagens
function bkMontar(colecoes, versaoApp) {
  const dados = {}, contagens = {};
  Object.keys(colecoes).forEach((nome) => {
    dados[nome] = {}; contagens[nome] = 0;
    colecoes[nome].forEach((d) => { dados[nome][d.id] = bkNormalizar(d.data); contagens[nome]++; });
  });
  return { formato: BK_FORMATO, geradoEm: new Date().toISOString(), versaoApp: versaoApp || '', contagens, colecoes: dados };
}
function bkNomeArquivo(d) {
  const p = (n) => String(n).padStart(2, '0'); d = d || new Date();
  return 'backup-sn_' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()) + '.json';
}
function bkTamanho(bytes) { return bytes < 1048576 ? Math.max(1, Math.round(bytes / 1024)) + ' KB' : (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB'; }

// ── restauração (só lançamentos, e só de quem está VAZIO no banco) ─────────────
// arquivo: JSON do backup · atuais: { idDoCliente: txsAtuais|null } lidos do banco agora.
// Devolve o que PODE ser restaurado: cliente com lançamentos no backup e documento ausente/vazio no banco.
// Quem já tem lançamento no banco NUNCA entra na lista — restaurar não sobrescreve nada que exista.
function bkPlanoRestauracao(arquivo, atuais) {
  const col = (arquivo && arquivo.colecoes) || {}, tx = col.sntx || {}, nomes = {};
  const lista = col.sn && col.sn.clients && Array.isArray(col.sn.clients.value) ? col.sn.clients.value : [];
  lista.forEach((c) => { if (c && c.id) nomes[c.id] = c.razaoSocial || c.nome || ''; });
  const pode = [], jaTem = [];
  Object.keys(tx).forEach((id) => {
    const bk = tx[id] && Array.isArray(tx[id].txs) ? tx[id].txs : [];
    if (!bk.length) return;
    const agora = atuais && Array.isArray(atuais[id]) ? atuais[id] : [];
    (agora.length ? jaTem : pode).push({ id, nome: nomes[id] || id, qtd: bk.length, txs: bk });
  });
  const porNome = (x, y) => String(x.nome).localeCompare(String(y.nome), 'pt-BR');
  return { pode: pode.sort(porNome), jaTem: jaTem.sort(porNome) };
}

// ── aviso do último backup + envio ao Drive: partes PURAS ─────────────────────
const BK_HORAS_ALERTA = 24, BK_HORAS_CRITICO = 72;             // até 24 h = ok · 24 a 72 h = aviso · mais que isso (ou nunca) = crítico. Passou de 24 h, o automático envia ao entrar
const BK_MANTER_DRIVE = 30;                                      // quantos backups ficam na pasta do Drive (os mais velhos são apagados): ~1 mês de backups diários
const BK_PASTA_DRIVE = 'SN-Backups';
const BK_ESCOPO_DRIVE = 'https://www.googleapis.com/auth/drive.file';   // só enxerga o que ESTE app criou — nunca o resto do Drive
function bkDiasDesde(iso, agora) {
  const t = Date.parse(iso || ''); if (!isFinite(t)) return null;
  return Math.max(0, Math.floor(((agora == null ? Date.now() : agora) - t) / 86400000));
}
function bkHorasDesde(iso, agora) {
  const t = Date.parse(iso || ''); if (!isFinite(t)) return null;
  return Math.max(0, ((agora == null ? Date.now() : agora) - t) / 3600000);
}
function bkDataCurta(iso) { const d = new Date(iso); if (!isFinite(d)) return '—'; const p = (n) => String(n).padStart(2, '0'); return p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
function bkQuando(dias) { return dias === 0 ? 'hoje' : dias === 1 ? 'ontem' : 'há ' + dias + ' dias'; }
// meta = { ultimoLocalEm, ultimoDriveEm } (ISO). Devolve o que a tela precisa mostrar.
function bkStatus(meta, agora) {
  const m = meta || {}, datas = [m.ultimoLocalEm, m.ultimoDriveEm].filter((x) => isFinite(Date.parse(x || ''))).sort();
  const ultimo = datas.length ? datas[datas.length - 1] : null, dias = ultimo ? bkDiasDesde(ultimo, agora) : null, horas = ultimo ? bkHorasDesde(ultimo, agora) : null;
  const nivel = horas == null ? 'critico' : horas <= BK_HORAS_ALERTA ? 'ok' : horas <= BK_HORAS_CRITICO ? 'aviso' : 'critico';
  const dd = m.ultimoDriveEm ? bkDiasDesde(m.ultimoDriveEm, agora) : null;
  return {
    nivel, dias, atrasado: nivel !== 'ok', ultimo,
    texto: ultimo ? 'Último backup: ' + bkDataCurta(ultimo) + ' (' + bkQuando(dias) + ')' : 'Nenhum backup registrado ainda',
    textoDrive: m.ultimoDriveEm ? '☁ Drive: ' + bkDataCurta(m.ultimoDriveEm) + ' (' + bkQuando(dd) + ')' : '☁ Drive: ainda não enviado',
    cor: nivel === 'ok' ? '#16a34a' : nivel === 'aviso' ? '#f59e0b' : '#ef4444',
  };
}
// quais arquivos da pasta do Drive apagar: os que passam de "manter", do mais antigo, e SÓ os que têm nome de backup nosso
function bkParaApagar(arquivos, manter) {
  const nossos = (arquivos || []).filter((f) => f && f.id && /^backup-sn_.*\.json$/.test(String(f.name || '')));
  nossos.sort((a, b) => String(b.createdTime || '').localeCompare(String(a.createdTime || '')));
  return nossos.slice(Math.max(0, manter == null ? BK_MANTER_DRIVE : manter)).map((f) => f.id);
}
// corpo "multipart/related" do upload do Drive (metadados em JSON + conteúdo do arquivo)
function bkMultipart(metadados, texto, limite) {
  const b = limite || 'snbk' + Math.random().toString(36).slice(2, 10);
  return { tipo: 'multipart/related; boundary=' + b, corpo: '--' + b + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadados) + '\r\n--' + b + '\r\nContent-Type: application/json\r\n\r\n' + texto + '\r\n--' + b + '--' };
}

// ── tela / ação ──────────────────────────────────────────────────────────────
// loginmeta/<hash do usuário> → { n } (versão da conta de acesso). Lê um por um, a partir da lista de clientes que já foi lida.
async function bkLerLoginmeta(docsSn) {
  const cl = (docsSn || []).find((d) => d.id === 'clients'), lista = cl && cl.data && Array.isArray(cl.data.value) ? cl.data.value : [];
  if (typeof sgHashUsuario !== 'function') throw new Error('acesso.js não carregado');
  const out = [];
  for (const c of lista) {
    if (!c || !c.username) continue;
    const h = await sgHashUsuario(c.username), s = await firebase.firestore().collection('loginmeta').doc(h).get();
    if (s.exists) out.push({ id: h, data: s.data() });
  }
  return out;
}
let bkOcupado = false, bkAutoRodando = false;
function bkRotulo(texto, cor, id) { const b = document.getElementById(id || 'bk-btn'); if (b) { b.textContent = texto; b.style.color = cor || ''; } }

// lê TODAS as coleções e monta o arquivo. Se uma coleção falhar, ABORTA: nunca devolve um backup incompleto. ctx.onde diz em qual falhou.
async function bkGerarArquivo(ctx) {
  const colecoes = {};
  for (const nome of BK_COLECOES) {
    ctx.onde = nome;
    const snap = await firebase.firestore().collection(nome).get();
    colecoes[nome] = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
  }
  ctx.onde = 'loginmeta';
  colecoes.loginmeta = await bkLerLoginmeta(colecoes.sn);
  ctx.onde = '';
  const arq = bkMontar(colecoes, typeof APP_VERSION !== 'undefined' ? APP_VERSION : '');
  const total = Object.keys(arq.contagens).reduce((a, k) => a + arq.contagens[k], 0);
  if (!total) throw new Error('nenhum documento retornado');
  const texto = JSON.stringify(arq);
  return { arq, texto, resumo: Object.keys(arq.contagens).map((k) => k + ': ' + arq.contagens[k]).join(' · ') + ' · ' + bkTamanho(texto.length) };
}

// ── quando foi o último backup (sn/backupmeta, só o admin lê) ──
async function bkCarregarMeta() {
  try { const v = await fsGet('backupmeta'); window.__bkMeta = v && typeof v === 'object' ? v : {}; } catch (e) { window.__bkMeta = window.__bkMeta || {}; }
  bkAtualizarInfo();
}
async function bkRegistrar(patch) {
  window.__bkMeta = Object.assign({}, window.__bkMeta || {}, patch);
  try { await fsSet('backupmeta', window.__bkMeta); } catch (e) { console.warn('[backup] não consegui registrar a data do backup', e && e.message); }
  bkAtualizarInfo();
}
function bkInfoHTML() {
  if (!window.__bkMeta) return '<span style="color:var(--muted)">Verificando o último backup…</span>';
  const s = bkStatus(window.__bkMeta);
  return '<span style="color:' + s.cor + ';font-weight:600">' + (s.nivel === 'ok' ? '✅ ' : '⚠️ ') + bkEsc(s.texto) + '</span><br><span style="color:var(--muted)">' + bkEsc(s.textoDrive) + '</span>';
}
function bkBannerConteudo() {
  if (!window.__bkMeta) return '';
  const s = bkStatus(window.__bkMeta);
  if (!s.atrasado) return '';
  const msg = s.ultimo ? 'O último backup foi ' + bkQuando(s.dias) + ' (' + bkDataCurta(s.ultimo) + ').' : 'Ainda não há backup registrado.';
  return '<div style="background:' + (s.nivel === 'critico' ? 'rgba(239,68,68,.12)' : 'rgba(245,158,11,.12)') + ';border:1px solid ' + s.cor + ';border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:20px">' + (s.nivel === 'critico' ? '🚨' : '⚠️') + '</span><div style="flex:1;min-width:200px"><div style="font-weight:700">Backup atrasado</div><div style="font-size:12.5px;color:var(--muted)">' + bkEsc(msg) + ' Faça um backup por dia.</div></div><button class="btn btn-acc btn-sm" onclick="admBackupDrive()">☁ Enviar ao Drive agora</button><button class="btn btn-ghost btn-sm" onclick="admBackup()">💾 Baixar</button></div>';
}
function bkBannerHTML() { return '<div id="bk-banner">' + bkBannerConteudo() + '</div>'; }
function bkAtualizarInfo() {
  const i = document.getElementById('bk-info'); if (i) i.innerHTML = bkInfoHTML();
  const b = document.getElementById('bk-banner'); if (b) b.innerHTML = bkBannerConteudo();
}

// 💾 baixa o arquivo no computador
async function admBackup() {
  if (bkOcupado) return;
  bkOcupado = true; bkRotulo('⏳ Lendo o banco…');
  const ctx = { onde: '' };                                    // onde estava lendo, para o aviso dizer qual coleção falhou
  try {
    const { texto, resumo } = await bkGerarArquivo(ctx);
    const blob = new Blob([texto], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = bkNomeArquivo(); document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    bkRotulo('✅ Backup realizado', '#16a34a');
    const b = document.getElementById('bk-btn'); if (b) b.title = 'Último backup: ' + resumo;   // o detalhe fica só no balãozinho
    await bkRegistrar({ ultimoLocalEm: new Date().toISOString() });
  } catch (e) {
    console.error('[backup]', e);
    bkRotulo('⚠️ Backup NÃO foi gerado' + (ctx.onde ? ' — falhou em "' + ctx.onde + '"' : '') + (e && e.code === 'permission-denied' ? ' (sem permissão)' : '') + '. Tente de novo.', '#ef4444');
  } finally { bkOcupado = false; }
}

// ☁ Google Drive ----------------------------------------------------------------
const bkTokenValido = () => { const t = typeof S !== 'undefined' && S.googleToken, at = Number(sessionStorage.getItem('sn:googleTokenAt') || 0); return t && at && Date.now() - at < 50 * 60000 ? t : null; };
// reautentica com o Google JÁ pedindo a permissão do Drive. Tem de ser chamada direto do clique (o navegador bloqueia popup depois de um "await").
function bkReautenticar() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/spreadsheets'); provider.addScope(BK_ESCOPO_DRIVE);
  provider.setCustomParameters({ login_hint: typeof ADMIN_EMAIL !== 'undefined' ? ADMIN_EMAIL : '' });
  const u = firebase.auth().currentUser; if (!u) return Promise.reject(new Error('sem login'));
  return u.reauthenticateWithPopup(provider).then((r) => {
    const t = r && r.credential && r.credential.accessToken; if (!t) throw new Error('o Google não devolveu a permissão');
    S.googleToken = t; sessionStorage.setItem('sn:googleToken', t); sessionStorage.setItem('sn:googleTokenAt', String(Date.now())); return t;
  });
}
async function bkDriveReq(token, url, opts) {
  const r = await fetch(url, Object.assign({}, opts, { headers: Object.assign({ Authorization: 'Bearer ' + token }, opts && opts.headers) }));
  if (r.status === 401) { const e = new Error('permissão do Drive expirou'); e.codigo = 'token'; throw e; }
  if (!r.ok) {
    const j = await r.json().catch(() => ({})), er = j.error || {}, motivo = (er.errors && er.errors[0] && er.errors[0].reason) || er.status || '';
    const e = new Error(er.message || 'HTTP ' + r.status); e.status = r.status; e.motivo = motivo;
    if (r.status === 403 && /accessNotConfigured|SERVICE_DISABLED|has not been used/i.test(motivo + ' ' + (er.message || ''))) e.codigo = 'api';
    else if (r.status === 403 && /insufficient|scope/i.test(motivo + ' ' + (er.message || ''))) e.codigo = 'token';
    throw e;
  }
  return r;
}
async function bkPastaDrive(token) {
  const meta = window.__bkMeta || {};
  if (meta.pastaId) {                                           // a pasta de sempre, se ainda existe e não foi para a lixeira
    try { const r = await (await bkDriveReq(token, 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(meta.pastaId) + '?fields=id,trashed')).json(); if (r && r.id && !r.trashed) return r.id; } catch (e) { if (e.codigo === 'token' || e.codigo === 'api') throw e; }
  }
  const q = encodeURIComponent("name='" + BK_PASTA_DRIVE + "' and mimeType='application/vnd.google-apps.folder' and trashed=false");
  const achou = await (await bkDriveReq(token, 'https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id,name)&pageSize=1')).json();
  if (achou.files && achou.files[0]) return achou.files[0].id;
  const nova = await (await bkDriveReq(token, 'https://www.googleapis.com/drive/v3/files?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: BK_PASTA_DRIVE, mimeType: 'application/vnd.google-apps.folder' }) })).json();
  return nova.id;
}
// gera o backup, envia para SN-Backups no Drive, confere o tamanho e apaga só os mais antigos que BK_MANTER_DRIVE
async function bkEnviarDrive(token, ctx) {
  const { texto, resumo } = await bkGerarArquivo(ctx);
  const pasta = await bkPastaDrive(token), nome = bkNomeArquivo();
  const mp = bkMultipart({ name: nome, parents: [pasta], mimeType: 'application/json' }, texto);
  const up = await (await bkDriveReq(token, 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size', { method: 'POST', headers: { 'Content-Type': mp.tipo }, body: new Blob([mp.corpo], { type: mp.tipo }) })).json();
  const bytes = new Blob([texto]).size;
  if (!up.id || (up.size != null && Number(up.size) !== bytes)) throw new Error('o Drive não confirmou o arquivo inteiro');   // nunca dá o backup como feito sem a prova
  let apagados = 0;
  try {
    const q = encodeURIComponent("'" + pasta + "' in parents and trashed=false");
    const lista = await (await bkDriveReq(token, 'https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id,name,createdTime)&orderBy=createdTime%20desc&pageSize=200')).json();
    for (const id of bkParaApagar(lista.files || [], BK_MANTER_DRIVE)) { await bkDriveReq(token, 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id), { method: 'DELETE' }); apagados++; }
  } catch (e) { console.warn('[backup] limpeza da pasta do Drive não concluída', e && e.message); }
  await bkRegistrar({ ultimoDriveEm: new Date().toISOString(), pastaId: pasta, ultimoDriveArquivo: { nome, id: up.id, tamanho: bytes } });
  return { nome, tamanho: bytes, resumo, apagados };
}
function bkMsgErroDrive(e) {
  if (e && e.codigo === 'api') { let p = ''; try { p = (firebase.app().options || {}).projectId || ''; } catch (x) { /* sem projeto: o link sai sem ele */ } return 'A API do Google Drive não está ativada neste projeto. Ative em: https://console.cloud.google.com/apis/library/drive.googleapis.com' + (p ? '?project=' + p : '') + ' e tente de novo.'; }
  if (e && e.codigo === 'token') return 'A permissão do Drive expirou ou não foi concedida. Clique de novo e aceite o acesso.';
  if (e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')) return 'A janela do Google foi fechada antes de concluir.';
  if (e && e.code === 'auth/popup-blocked') return 'O navegador bloqueou a janela do Google. Libere pop-ups para este site e tente de novo.';
  return (e && e.message) || 'erro desconhecido';
}
// ☁ botão: envia agora (pede a permissão do Google se preciso)
async function admBackupDrive() {
  if (bkOcupado) return;
  let token = bkTokenValido();
  let aReautenticar = null;
  if (!token) { try { aReautenticar = bkReautenticar(); } catch (e) { aReautenticar = Promise.reject(e); } }   // abre o popup JÁ, dentro do clique
  bkOcupado = true; bkRotulo('⏳ Enviando ao Drive…', '', 'bk-drive-btn');
  const ctx = { onde: '' };
  try {
    if (!token) token = await aReautenticar;
    let r;
    try { r = await bkEnviarDrive(token, ctx); }
    catch (e) { if (e && e.codigo === 'token') { token = await bkReautenticar(); r = await bkEnviarDrive(token, ctx); } else throw e; }
    bkRotulo('✅ Enviado ao Drive', '#16a34a', 'bk-drive-btn');
    const b = document.getElementById('bk-drive-btn'); if (b) b.title = 'Pasta "' + BK_PASTA_DRIVE + '" · ' + r.nome + ' · ' + r.resumo + (r.apagados ? ' · ' + r.apagados + ' antigo(s) removido(s)' : '');
  } catch (e) {
    console.error('[backup drive]', e);
    bkRotulo('⚠️ ' + bkMsgErroDrive(e) + (ctx.onde ? ' (falhou em "' + ctx.onde + '")' : ''), '#ef4444', 'bk-drive-btn');
  } finally { bkOcupado = false; }
}
// automático: ao entrar no admin (ou ao encerrar a sessão por inatividade), se o último backup passou de 24 h e há permissão do Drive à mão, envia sozinho (sem janela)
async function bkAutoDrive() {
  if (bkAutoRodando || bkOcupado) return;
  if (typeof S !== 'undefined' && S.erroLeitura) return;
  bkAutoRodando = true;
  try {
    if (!window.__bkMeta) await bkCarregarMeta();
    if (!bkStatus(window.__bkMeta).atrasado) return;
    const token = bkTokenValido(); if (!token) return;            // sem permissão à mão: o aviso e o botão ☁ cuidam
    bkOcupado = true; bkRotulo('⏳ Backup automático no Drive…', '', 'bk-drive-btn');
    const r = await bkEnviarDrive(token, { onde: '' });
    bkRotulo('✅ Backup automático enviado ao Drive', '#16a34a', 'bk-drive-btn');
    const b = document.getElementById('bk-drive-btn'); if (b) b.title = 'Pasta "' + BK_PASTA_DRIVE + '" · ' + r.nome + ' · ' + r.resumo;
  } catch (e) { console.warn('[backup automático]', e); bkRotulo('⚠️ Backup automático falhou — use ☁ Enviar ao Drive', '#f59e0b', 'bk-drive-btn'); }
  finally { bkOcupado = false; bkAutoRodando = false; }
}
// ── restaurar: escolhe o .json, mostra quem está vazio no banco e grava só os marcados ──
const bkEsc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function bkFechar() { const m = document.getElementById('bk-modal'); if (m) m.remove(); }
function bkModal(html) {
  bkFechar(); const m = document.createElement('div'); m.id = 'bk-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = '<div style="background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:14px;max-width:560px;width:100%;max-height:85vh;overflow:auto;padding:20px">' + html + '</div>';
  document.body.appendChild(m);
}
let bkPlano = null;
function admRestaurar() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = async () => {
    const f = inp.files && inp.files[0]; if (!f) return;
    bkModal('<p>⏳ Lendo o arquivo e conferindo o banco…</p>');
    try {
      const arq = JSON.parse(await f.text());
      if (!arq || !arq.colecoes || !arq.colecoes.sntx) throw new Error('arquivo não é um backup do SN');
      const atuais = {};
      for (const id of Object.keys(arq.colecoes.sntx)) {
        const snap = await firebase.firestore().collection('sntx').doc(id).get();
        atuais[id] = snap.exists && snap.data() && Array.isArray(snap.data().txs) ? snap.data().txs : [];
      }
      bkPlano = bkPlanoRestauracao(arq, atuais);
      const p = bkPlano;
      const linhas = p.pode.map((c, i) => '<label style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);cursor:pointer"><input type="checkbox" class="bk-ck" data-i="' + i + '" checked/> <span style="flex:1">' + bkEsc(c.nome) + '</span><span style="color:var(--muted);font-size:12px">' + c.qtd + ' lançamento' + (c.qtd > 1 ? 's' : '') + '</span></label>').join('');
      bkModal('<h3 style="margin:0 0 6px">♻️ Restaurar lançamentos do backup</h3>'
        + '<p style="color:var(--muted);font-size:13px;margin:0 0 12px">Arquivo de ' + bkEsc((arq.geradoEm || '').slice(0, 16).replace('T', ' ')) + '. Só aparecem clientes que estão <b>sem lançamentos no banco agora</b>; quem já tem lançamento nunca é sobrescrito (' + p.jaTem.length + ' cliente(s) ignorado(s)). O que foi lançado depois da data do arquivo não volta.</p>'
        + (p.pode.length ? linhas + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost btn-sm" onclick="bkFechar()">Cancelar</button><button id="bk-go" class="btn btn-acc btn-sm" onclick="bkConfirmarRestaurar()">Restaurar selecionados</button></div>'
          : '<p>✅ Nada a restaurar: todos os clientes do arquivo já têm lançamentos no banco (ou não tinham nenhum no backup).</p><div style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="bkFechar()">Fechar</button></div>'));
    } catch (e) {
      console.error('[restaurar]', e);
      bkModal('<p>⚠️ Não foi possível ler o arquivo: ' + bkEsc(e.message) + '</p><div style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="bkFechar()">Fechar</button></div>');
    }
  };
  inp.click();
}
async function bkConfirmarRestaurar() {
  const go = document.getElementById('bk-go'); if (!bkPlano || (go && go.disabled)) return;
  const marcados = [...document.querySelectorAll('.bk-ck')].filter((c) => c.checked).map((c) => bkPlano.pode[+c.dataset.i]);
  if (!marcados.length) return;
  if (go) { go.disabled = true; go.textContent = '⏳ Restaurando…'; }
  let ok = 0, falhou = [];
  for (const c of marcados) {
    try {
      const ref = firebase.firestore().collection('sntx').doc(c.id);
      const agora = await ref.get();                                // confere de novo na hora de gravar: nunca sobrescreve
      if (agora.exists && agora.data() && Array.isArray(agora.data().txs) && agora.data().txs.length) { falhou.push(c.nome + ' (já tem lançamentos)'); continue; }
      await ref.set({ txs: c.txs }); ok++;
    } catch (e) { console.error('[restaurar]', c.id, e); falhou.push(c.nome); }
  }
  bkModal('<h3 style="margin:0 0 8px">' + (falhou.length ? '⚠️' : '✅') + ' Restauração concluída</h3><p>' + ok + ' cliente(s) restaurado(s).</p>'
    + (falhou.length ? '<p style="color:#ef4444">Não restaurado: ' + falhou.map(bkEsc).join(', ') + '</p>' : '')
    + '<div style="text-align:right"><button class="btn btn-acc btn-sm" onclick="location.reload()">Recarregar a página</button></div>');
}

// botão da barra lateral do admin (o app.js só chama esta função, se ela existir)
function bkBotaoHTML() {
  if (!window.__bkMeta && !window.__bkMetaCarregando) { window.__bkMetaCarregando = true; setTimeout(bkCarregarMeta, 0); }
  return '<div id="bk-info" style="font-size:11px;line-height:1.4;margin:0 0 8px;text-align:center">' + bkInfoHTML() + '</div>'
    + '<button id="bk-btn" class="btn btn-ghost btn-full btn-sm" onclick="admBackup()" title="Baixa um arquivo .json com TODOS os dados do banco. Contém dados de clientes: guarde em local seguro e nunca no GitHub." style="margin-bottom:8px;white-space:normal;line-height:1.3">💾 Backup do banco</button>'
    + '<button id="bk-drive-btn" class="btn btn-ghost btn-full btn-sm" onclick="admBackupDrive()" title="Envia o backup para a pasta SN-Backups do seu Google Drive (guarda os 30 mais recentes). Na primeira vez o Google pede a permissão." style="margin-bottom:8px;white-space:normal;line-height:1.3">☁ Enviar backup ao Drive</button>'
    + '<button class="btn btn-ghost btn-full btn-sm" onclick="admRestaurar()" title="Escolha um arquivo de backup para devolver os lançamentos de clientes que ficaram vazios no banco. Nunca sobrescreve quem já tem lançamentos." style="margin-bottom:8px;white-space:normal;line-height:1.3">♻️ Restaurar do backup</button>';
}

if (typeof module !== 'undefined' && module.exports) module.exports = { bkNormalizar, bkMontar, bkNomeArquivo, bkTamanho, bkPlanoRestauracao, BK_COLECOES, bkDiasDesde, bkHorasDesde, bkStatus, bkParaApagar, bkMultipart, bkDataCurta, bkQuando, BK_HORAS_ALERTA, BK_HORAS_CRITICO, BK_MANTER_DRIVE, BK_PASTA_DRIVE, BK_ESCOPO_DRIVE };
