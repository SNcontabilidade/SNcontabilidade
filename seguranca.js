// ═══ Segurança · Fase 1 (só admin) ═══════════════════════════════════════════
// Prepara a estrutura nova SEM tirar nada do ar: cria uma conta de acesso (Firebase Authentication) para cada
// cliente, com a MESMA senha de hoje, e COPIA os dados para coleções por cliente. Não altera nada do que o app
// atual usa (sn/*, sntx/*). Carregado só pelo admin.html. Prefixo sg*.
//
// As regras de usuário → conta (hash, e-mail interno, senha do Authentication, perfil sem senha) vivem em acesso.js, que o
// admin.html carrega antes deste arquivo. Coleções novas: vinculos/{uid} {clienteId,n}  loginmeta/{hash} {n,...}  perfil/{id}
// conversas/{id}  leitura/{id}  config/{doc}. As regras do Firestore ficam num arquivo local (fora do Git).

// ── núcleo puro (testado no Node) ────────────────────────────────────────────
function sgValidarCliente(c) {
  if (!c || !c.id) return 'cliente sem id';
  if (!sgNormUsuario(c.username)) return 'sem usuário';
  if (c.password == null || String(c.password) === '') return 'sem senha';
  return '';
}
function sgDuplicados(clientes) {                                    // usuários que viram o MESMO login (ignorando caixa e espaços nas pontas)
  const m = new Map();
  (clientes || []).forEach((c) => { const k = sgNormUsuario(c && c.username); if (!k) return; (m.get(k) || m.set(k, []).get(k)).push(c.id); });
  return Array.from(m.values()).filter((ids) => ids.length > 1);
}
// comparação que IGNORA a ordem dos campos dos objetos (o Firestore devolve os campos em ordem alfabética; a ordem dos arrays vale)
function sgCanon(v) {
  if (v === undefined) return null;
  if (Array.isArray(v)) return v.map(sgCanon);
  if (v && typeof v === 'object') { const o = {}; Object.keys(v).sort().forEach((k) => { if (v[k] !== undefined) o[k] = sgCanon(v[k]); }); return o; }
  return v;
}
const sgIgual = (a, b) => JSON.stringify(sgCanon(a)) === JSON.stringify(sgCanon(b));

// ── estado e tela ────────────────────────────────────────────────────────────
const sgState = { busy: false, log: [], estado: null };
const sgEsc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sgDb = () => firebase.firestore();
const sgPausa = (ms) => new Promise((r) => setTimeout(r, ms));
function sgLog(msg, limpar) { if (limpar) sgState.log = []; sgState.log.push(msg); sgRenderLog(); }
function sgRenderLog() { const el = document.getElementById('sg-log'); if (el) { el.textContent = sgState.log.join('\n'); el.scrollTop = el.scrollHeight; } }
function sgRender() { const el = document.getElementById('sg-root'); if (el) el.innerHTML = sgHTML(); sgRenderLog(); }
function sgAppSecundario() {                                         // 2ª instância: criar/entrar com a conta do cliente sem derrubar o login do admin
  try { return firebase.app('sg-sec'); } catch (e) { return firebase.initializeApp(firebase.app().options, 'sg-sec'); }
}
function sgErroAmigavel(e) {
  const c = (e && e.code) || '';
  if (c === 'permission-denied') return 'SEM PERMISSÃO no banco — publique no console as regras da Fase 1 (arquivo REGRAS-FASE1.txt, fora do Git) e confira se você está logado como admin.';
  if (c === 'auth/operation-not-allowed') return 'E-mail/senha NÃO está ativo em Authentication → Sign-in method.';
  if (c === 'auth/too-many-requests') return 'O Firebase pediu para esperar (muitas tentativas). Aguarde alguns minutos e rode de novo — continua de onde parou.';
  return (e && e.message && !c ? e.message : c) || 'erro desconhecido';
}

// ── admin: mantém o modelo novo em dia enquanto o antigo ainda existe (janela de convivência) ──
// Tudo aqui é "melhor esforço": se falhar, avisa no console e o botão 2 da tela (Copiar dados) refaz a cópia inteira.
async function sgEspelharPerfil(c) {
  if (!c || !c.id) return;
  try { await sgDb().collection('perfil').doc(c.id).set(sgPerfil(c)); } catch (e) { console.warn('[espelho] perfil', e && e.code); }
}
async function sgEspelharConversa(cid) {
  try { await sgDb().collection('conversas').doc(cid).set({ msgs: (S.clientMessages && S.clientMessages[cid]) || [] }); } catch (e) { console.warn('[espelho] conversa', e && e.code); }
}
// cria (ou reaproveita) a conta de acesso do cliente e liga ao vínculo. n = versão da conta. Devolve o uid.
async function sgCriarAcessoCliente(c, senha, n) {
  const h = await sgHashUsuario(c.username), email = sgEmail(h, n || 0), pw = sgSenhaAuth(senha), sec = sgAppSecundario();
  let uid = null;
  try { uid = (await sec.auth().createUserWithEmailAndPassword(email, pw)).user.uid; }
  catch (e) {
    if (e.code !== 'auth/email-already-in-use') throw e;
    try { uid = (await sec.auth().signInWithEmailAndPassword(email, pw)).user.uid; } catch (e2) { throw new Error('já existe uma conta com este login e outra senha'); }
  }
  const b = sgDb().batch();
  b.set(sgDb().collection('vinculos').doc(uid), { clienteId: c.id, n: n || 0, criadoEm: new Date().toISOString() });
  b.set(sgDb().collection('loginmeta').doc(h), { n: n || 0 });
  await b.commit();
  try { await sec.auth().signOut(); } catch (e) { /* segue */ }
  return uid;
}
// desliga os acessos antigos do cliente (apaga os vínculos; a conta do Authentication fica sem efeito). `manterUid` = o acesso novo.
async function sgRevogarAcessos(clienteId, manterUid, usuarioAntigo) {
  const snap = await sgDb().collection('vinculos').where('clienteId', '==', clienteId).get();
  const b = sgDb().batch(); let n = 0;
  snap.docs.forEach((d) => { if (d.id !== manterUid) { b.delete(d.ref); n++; } });
  if (usuarioAntigo) b.delete(sgDb().collection('loginmeta').doc(await sgHashUsuario(usuarioAntigo)));
  await b.commit(); return n;
}
// volta o cliente à senha inicial: cria a conta nova ANTES de desligar a antiga (nunca deixa o cliente sem acesso por falha no meio)
async function sgResetarAcesso(c) {
  const meta = await sgDb().collection('loginmeta').doc(await sgHashUsuario(c.username)).get();
  const n = (meta.exists ? Number((meta.data() || {}).n) || 0 : 0) + 1;
  const uid = await sgCriarAcessoCliente(c, '12345', n);
  await sgRevogarAcessos(c.id, uid, null);
}
// o login (usuário) mudou: cria o acesso do login novo com a senha inicial e desliga o do login antigo
async function sgTrocarLoginAcesso(c, usuarioAntigo) {
  const uid = await sgCriarAcessoCliente(c, '12345', 0);
  await sgRevogarAcessos(c.id, uid, usuarioAntigo);
}
async function sgApagarAcessoECopias(c) {
  await sgRevogarAcessos(c.id, null, c.username);
  const b = sgDb().batch(); ['perfil', 'conversas', 'leitura'].forEach((col) => b.delete(sgDb().collection(col).doc(c.id))); await b.commit();
}

// Ao recarregar a página o Firebase leva um instante para restaurar o login do Google. Sem esperar, a 1ª leitura sai SEM login e as
// regras (que só liberam o admin) respondem "sem permissão". Devolve o usuário logado ou null se não houver login ativo neste endereço.
function sgAguardarLogin() {
  return new Promise((resolve) => {
    let feito = false; const fim = (u) => { if (!feito) { feito = true; resolve(u); } };
    const desinscrever = firebase.auth().onAuthStateChanged((u) => { desinscrever(); fim(u); });
    setTimeout(() => fim(firebase.auth().currentUser), 6000);
  });
}
const SG_MSG_SEM_LOGIN = 'Você não está logado com o Google NESTE endereço (o login do localhost não vale para 127.0.0.1 e vice-versa). Clique em "Sair" e entre de novo com o Google.';
async function sgCarregarEstado() {
  const est = { clientes: 0, vinculos: 0, perfil: 0, config: 0, conversas: 0, leitura: 0, erro: '' };
  try {
    if (!(await sgAguardarLogin())) { est.erro = SG_MSG_SEM_LOGIN; sgState.estado = est; sgState.t = Date.now(); sgRender(); return; }
    est.clientes = ((await fsGet('clients')) || []).length;
    for (const [k, col] of [['vinculos', 'vinculos'], ['perfil', 'perfil'], ['config', 'config'], ['conversas', 'conversas'], ['leitura', 'leitura']]) est[k] = (await sgDb().collection(col).get()).size;
  } catch (e) { est.erro = sgErroAmigavel(e); }
  sgState.estado = est; sgState.t = Date.now(); sgRender();
}

// ── 1) criar as contas de acesso ─────────────────────────────────────────────
async function sgCriarContas() {
  if (sgState.busy) return; sgState.busy = true; sgRender();
  sgLog('Criando contas de acesso…', true);
  let criadas = 0, ja = 0; const falhas = [];
  try {
    if (!(await sgAguardarLogin())) throw new Error(SG_MSG_SEM_LOGIN);
    const clientes = (await fsGet('clients')) || [];
    const dup = sgDuplicados(clientes);
    if (dup.length) sgLog('⚠ ' + dup.length + ' usuário(s) repetido(s) (mesmo login para clientes diferentes). Esses ficam de fora até serem corrigidos.');
    const idsDup = new Set([].concat(...dup));
    const vinc = new Map(); (await sgDb().collection('vinculos').get()).docs.forEach((d) => vinc.set(d.data().clienteId, d.id));
    const sec = sgAppSecundario();
    for (let i = 0; i < clientes.length; i++) {
      const c = clientes[i], nome = (c && c.razaoSocial) || (c && c.id) || '?';
      if (vinc.has(c.id)) { ja++; continue; }
      const motivo = idsDup.has(c.id) ? 'usuário repetido' : sgValidarCliente(c);
      if (motivo) { falhas.push(nome + ' — ' + motivo); continue; }
      const h = await sgHashUsuario(c.username), email = sgEmail(h, 0), senha = sgSenhaAuth(c.password);
      let uid = null;
      try { uid = (await sec.auth().createUserWithEmailAndPassword(email, senha)).user.uid; }
      catch (e) {
        if (e.code === 'auth/email-already-in-use') {              // sobrou de uma rodada anterior: só aproveita se a senha for a mesma
          try { uid = (await sec.auth().signInWithEmailAndPassword(email, senha)).user.uid; } catch (e2) { falhas.push(nome + ' — conta já existe com outra senha'); }
        } else if (e.code === 'auth/operation-not-allowed' || e.code === 'auth/too-many-requests') { throw e; }
        else falhas.push(nome + ' — ' + sgErroAmigavel(e));
      }
      if (uid) {
        const b = sgDb().batch();
        b.set(sgDb().collection('vinculos').doc(uid), { clienteId: c.id, n: 0, criadoEm: new Date().toISOString() });
        b.set(sgDb().collection('loginmeta').doc(h), { n: 0 });
        await b.commit(); criadas++;
      }
      try { await sec.auth().signOut(); } catch (e) { /* segue */ }
      if ((i + 1) % 10 === 0) sgLog('… ' + (i + 1) + '/' + clientes.length);
      await sgPausa(250);                                          // não estressar o limite do Authentication
    }
    sgLog('Concluído: ' + criadas + ' conta(s) criada(s), ' + ja + ' já existiam, ' + falhas.length + ' com problema (de ' + clientes.length + ' clientes).');
    falhas.forEach((f) => sgLog('  ✖ ' + f));
  } catch (e) { console.error('[segurança]', e); sgLog('⛔ Parou: ' + sgErroAmigavel(e)); }
  sgState.busy = false; await sgCarregarEstado();
}

// ── 2) copiar os dados para a estrutura nova (nunca apaga nem altera os antigos) ──
async function sgCopiarDados() {
  if (sgState.busy) return; sgState.busy = true; sgRender();
  sgLog('Copiando dados para a estrutura nova…', true);
  try {
    if (!(await sgAguardarLogin())) throw new Error(SG_MSG_SEM_LOGIN);
    const clientes = (await fsGet('clients')) || [];
    const msgs = (await fsGet('clientmessages')) || {}, lidas = (await fsGet('msgread')) || {};
    const ops = [];
    clientes.forEach((c) => { if (!c || !c.id) return; ops.push([sgDb().collection('perfil').doc(c.id), sgPerfil(c)]); });
    Object.keys(msgs).forEach((id) => { if (Array.isArray(msgs[id])) ops.push([sgDb().collection('conversas').doc(id), { msgs: msgs[id] }]); });
    Object.keys(lidas).forEach((id) => { ops.push([sgDb().collection('leitura').doc(id), { lido: lidas[id] }]); });
    for (const nome of SG_CONFIG_DOCS) { const v = await fsGet(nome); if (v != null) ops.push([sgDb().collection('config').doc(nome), { value: v }]); }
    for (let i = 0; i < ops.length; i += 400) {                     // lotes de 400 (limite do Firestore é 500)
      const b = sgDb().batch(); ops.slice(i, i + 400).forEach(([ref, data]) => b.set(ref, data)); await b.commit();
    }
    sgLog('Concluído: ' + ops.length + ' documento(s) gravado(s) (perfil, conversas, leitura, config). Os dados antigos não foram tocados.');
  } catch (e) { console.error('[segurança]', e); sgLog('⛔ Parou: ' + sgErroAmigavel(e)); }
  sgState.busy = false; await sgCarregarEstado();
}

// ── 3) conferir de ponta a ponta ─────────────────────────────────────────────
async function sgConferir() {
  if (sgState.busy) return; sgState.busy = true; sgRender();
  sgLog('Conferindo…', true);
  const probs = []; const ok = (t) => sgLog('✔ ' + t), mal = (t) => { probs.push(t); sgLog('✖ ' + t); };
  try {
    if (!(await sgAguardarLogin())) throw new Error(SG_MSG_SEM_LOGIN);
    const clientes = (await fsGet('clients')) || [];
    // a) cópias iguais ao original
    const perfis = new Map((await sgDb().collection('perfil').get()).docs.map((d) => [d.id, d.data()]));
    let pOk = 0, pSenha = 0; clientes.forEach((c) => { const p = perfis.get(c.id); if (p && sgIgual(p, sgPerfil(c))) pOk++; if (p && 'password' in p) pSenha++; });
    (pOk === clientes.length ? ok : mal)('perfil: ' + pOk + ' de ' + clientes.length + ' idênticos ao cadastro');
    (pSenha === 0 ? ok : mal)('nenhum perfil contém senha' + (pSenha ? ' (' + pSenha + ' contêm!)' : ''));
    for (const nome of SG_CONFIG_DOCS) {
      const orig = await fsGet(nome), s = await sgDb().collection('config').doc(nome).get();
      if (orig == null) continue; (s.exists && sgIgual(s.data().value, orig) ? ok : mal)('config/' + nome + ' igual ao original');
    }
    const msgs = (await fsGet('clientmessages')) || {}; let cOk = 0, cTot = 0;
    for (const id of Object.keys(msgs)) { if (!Array.isArray(msgs[id])) continue; cTot++; const s = await sgDb().collection('conversas').doc(id).get(); if (s.exists && sgIgual(s.data().msgs, msgs[id])) cOk++; }
    (cOk === cTot ? ok : mal)('conversas: ' + cOk + ' de ' + cTot + ' idênticas');
    // b) cada cliente consegue ENTRAR com a senha de hoje, lê o próprio perfil e NÃO lê o de outro
    const sec = sgAppSecundario(); let entrou = 0, leuProprio = 0, barrouOutro = 0, tentou = 0;
    for (let i = 0; i < clientes.length; i++) {
      const c = clientes[i]; if (sgValidarCliente(c)) continue; tentou++;
      try {
        await sec.auth().signInWithEmailAndPassword(sgEmail(await sgHashUsuario(c.username), 0), sgSenhaAuth(c.password)); entrou++;
        try { const s = await sec.firestore().collection('perfil').doc(c.id).get(); if (s.exists) leuProprio++; } catch (e) { /* conta como falha */ }
        const outro = clientes[(i + 1) % clientes.length];
        if (outro && outro.id !== c.id) { try { await sec.firestore().collection('perfil').doc(outro.id).get(); } catch (e) { if (e.code === 'permission-denied') barrouOutro++; } }
      } catch (e) { /* não entrou */ }
      try { await sec.auth().signOut(); } catch (e) { /* segue */ }
      await sgPausa(150);
    }
    (entrou === tentou ? ok : mal)('login: ' + entrou + ' de ' + tentou + ' clientes entram com a senha atual');
    (leuProprio === tentou ? ok : mal)('cada cliente lê o próprio perfil: ' + leuProprio + ' de ' + tentou);
    (barrouOutro >= Math.max(0, tentou - 1) ? ok : mal)('cliente NÃO lê o perfil de outro: ' + barrouOutro + ' de ' + tentou + ' barrados');
    sgLog(probs.length ? '⚠ ' + probs.length + ' ponto(s) para resolver antes de seguir.' : '🎉 Tudo conferido. Pode seguir para a Fase 2.');
  } catch (e) { console.error('[segurança]', e); sgLog('⛔ Parou: ' + sgErroAmigavel(e)); }
  sgState.busy = false; sgRender();
}

function sgHTML() {
  const e = sgState.estado, b = sgState.busy ? ' disabled' : '';
  const lin = (r, v, de) => '<tr><td style="padding:6px 10px">' + r + '</td><td style="padding:6px 10px;text-align:right"><b>' + v + '</b>' + (de != null ? ' <span style="color:var(--muted)">/ ' + de + '</span>' : '') + '</td></tr>';
  const tabela = !e ? '<p style="color:var(--muted)">Carregando estado…</p>' : e.erro ? '<div style="color:#ef4444;font-size:13px">⚠ ' + sgEsc(e.erro) + '</div>' :
    '<table style="font-size:13px;border-collapse:collapse">' + lin('Clientes cadastrados', e.clientes) + lin('Contas de acesso criadas', e.vinculos, e.clientes) + lin('Perfis copiados', e.perfil, e.clientes) + lin('Conversas copiadas', e.conversas) + lin('Documentos de config', e.config, SG_CONFIG_DOCS.length) + '</table>';
  return '<div class="card" style="padding:20px;max-width:820px"><h3 style="margin:0 0 6px">Segurança dos dados · Fase 1</h3>' +
    '<p style="color:var(--muted);font-size:13px;margin:0 0 14px">Prepara a proteção <b>sem tirar nada do ar</b>: cria o acesso de cada cliente (mesma senha de hoje) e copia os dados para a estrutura nova. Os dados atuais e o app dos clientes <b>não são alterados</b>. Faça o <b>Backup</b> antes.</p>' +
    tabela +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:16px 0"><button class="btn btn-acc btn-sm"' + b + ' onclick="sgCriarContas()">1. Criar contas de acesso</button><button class="btn btn-acc btn-sm"' + b + ' onclick="sgCopiarDados()">2. Copiar dados</button><button class="btn btn-ghost btn-sm"' + b + ' onclick="sgConferir()">3. Conferir tudo</button><button class="btn btn-ghost btn-sm"' + b + ' onclick="sgCarregarEstado()">↻ Atualizar</button></div>' +
    '<pre id="sg-log" style="background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:12px;max-height:260px;overflow:auto;white-space:pre-wrap;margin:0"></pre></div>';
}
function admSeguranca() {
  if (!sgState.estado || Date.now() - (sgState.t || 0) > 60000) setTimeout(sgCarregarEstado, 0);   // não relê o banco a cada re-render da tela
  return '<div id="sg-root">' + sgHTML() + '</div>';
}

if (typeof module !== 'undefined' && module.exports) module.exports = { sgNormUsuario, sgHashUsuario, sgEmail, sgSenhaAuth, sgPerfil, sgValidarCliente, sgDuplicados, sgIgual, SG_DOMINIO, SG_CONFIG_DOCS, SG_CAMPOS_PERFIL };
