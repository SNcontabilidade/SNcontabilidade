// ═══ Acesso (login pelo Firebase Authentication) ═════════════════════════════
// Carregado por index.html (clientes) e admin.html, ANTES do app.js. Aqui ficam:
//  (1) as regras que ligam "usuário + senha" a uma conta do Authentication (compartilhadas com a tela de Segurança);
//  (2) o login e a carga de dados do CLIENTE: depois de entrar, ele lê SÓ os próprios dados — nunca baixa a lista de clientes.
// Prefixos sg* (regras) e ac* (cliente). O cliente usa uma INSTÂNCIA PRÓPRIA do Firebase ('cliente'): assim entrar como cliente
// não derruba o login do Google do admin no mesmo navegador.
//
//   e-mail interno = c<hash do usuário>.<n>@acesso.sn.invalid   (n = versão da conta; sobe no "reset de senha")
//   senha do Authentication = 'sn#' + senha digitada            (o Firebase exige 6+ caracteres; a inicial tem 5)
// ATENÇÃO: o hash, o prefixo e o formato do e-mail NÃO podem mudar depois que as contas existem — derrubaria todos os logins.

const SG_DOMINIO = 'acesso.sn.invalid';
const SG_CONFIG_DOCS = ['banks', 'descriptions', 'customops', 'custombankicons', 'descriptionops', 'messages'];   // documentos compartilhados (sn/<nome> → config/<nome>)
const SG_CAMPOS_PERFIL = ['id', 'razaoSocial', 'cnpj', 'email', 'username', 'mustChangePwd', 'createdAt', 'appVersion', 'lastLogin'];   // SEM senha

// ── (1) regras puras (testadas no Node) ──────────────────────────────────────
function sgNormUsuario(u) { return String(u == null ? '' : u).trim().toLowerCase(); }
async function sgHashUsuario(u) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('sn|' + sgNormUsuario(u)));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}
function sgEmail(hash, n) { return 'c' + hash + '.' + (n || 0) + '@' + SG_DOMINIO; }
function sgSenhaAuth(s) { return 'sn#' + String(s == null ? '' : s); }
function sgPerfil(c) { const o = {}; SG_CAMPOS_PERFIL.forEach((k) => { if (c[k] !== undefined) o[k] = c[k]; }); return o; }
// junta o que veio do cadastro antigo e do perfil novo: o acesso mais recente vence; a senha só é "padrão" se NENHUM dos dois disser que já foi trocada
function acMesclarPerfil(antigo, perfil) {
  if (!perfil) return antigo;
  const o = Object.assign({}, antigo);
  if ((perfil.lastLogin || '') > (antigo.lastLogin || '')) { o.lastLogin = perfil.lastLogin; if (perfil.appVersion !== undefined) o.appVersion = perfil.appVersion; }
  else if (!antigo.appVersion && perfil.appVersion) o.appVersion = perfil.appVersion;
  if (typeof perfil.mustChangePwd === 'boolean') o.mustChangePwd = !!antigo.mustChangePwd && perfil.mustChangePwd;
  return o;
}
// junta duas listas de mensagens pelo id (readByAdmin=true vence)
function acUniaoMensagens(a, b) {
  const m = new Map();
  (Array.isArray(a) ? a : []).concat(Array.isArray(b) ? b : []).forEach((x) => {
    if (!x || !x.id) return; const k = m.get(x.id);
    m.set(x.id, k ? Object.assign({}, k, x, { readByAdmin: !!(k.readByAdmin || x.readByAdmin) }) : x);
  });
  return Array.from(m.values()).sort((p, q) => String(p.sentAt || '').localeCompare(String(q.sentAt || '')));
}

// ── (2) cliente: instância própria, login e carga ────────────────────────────
const acEhAdmin = () => typeof ADMIN_MODE !== 'undefined' && ADMIN_MODE === true;
function acApp() {
  try { return firebase.app('cliente'); } catch (e) { return firebase.initializeApp(firebase.app().options, 'cliente'); }
}
const acFirestore = () => (acEhAdmin() ? firebase.firestore() : acApp().firestore());
const acAuth = () => (acEhAdmin() ? firebase.auth() : acApp().auth());
// a sessão do cliente vale só nesta aba (igual ao app antigo, que usava sessionStorage)
async function acPersistenciaSessao() { try { await acAuth().setPersistence(firebase.auth.Auth.Persistence.SESSION); } catch (e) { /* segue com o padrão */ } }
function acMsgErro(e) {
  const c = (e && e.code) || '';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email', 'auth/user-disabled'].includes(c)) return 'Usuário ou senha inválidos.';
  if (c === 'auth/too-many-requests') return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
  if (c === 'auth/network-request-failed' || c === 'unavailable') return 'Sem conexão. Verifique a internet e tente de novo.';
  return 'Não foi possível entrar agora. Tente novamente ou fale com o escritório.';
}
async function acClienteDoUsuario(user) {
  const v = await acFirestore().collection('vinculos').doc(user.uid).get();
  return v.exists ? ((v.data() || {}).clienteId || null) : null;
}
// usuário + senha digitados → { ok, clienteId } ou { ok:false, msg }
async function acEntrar(usuario, senha) {
  try {
    await acPersistenciaSessao();
    const h = await sgHashUsuario(usuario);
    const meta = await acFirestore().collection('loginmeta').doc(h).get();
    if (!meta.exists) return { ok: false, msg: 'Usuário ou senha inválidos.' };
    const n = Number((meta.data() || {}).n) || 0;
    const cred = await acAuth().signInWithEmailAndPassword(sgEmail(h, n), sgSenhaAuth(senha));
    const cid = await acClienteDoUsuario(cred.user);
    if (!cid) { await acAuth().signOut(); return { ok: false, msg: 'Seu acesso ainda não foi liberado. Fale com o escritório.' }; }
    return { ok: true, clienteId: cid };
  } catch (e) { console.warn('[acesso]', e && e.code); return { ok: false, msg: acMsgErro(e) }; }
}
// carrega SÓ os dados deste cliente para o estado do app
async function acCarregarCliente(id) {
  const db = acFirestore();
  const ler = (col, doc) => db.collection(col).doc(doc).get();
  const [perfil, tx, conv, leit, ...cfg] = await Promise.all([ler('perfil', id), ler('sntx', id), ler('conversas', id), ler('leitura', id), ...SG_CONFIG_DOCS.map((n) => ler('config', n))]);
  if (!perfil.exists) throw new Error('perfil não encontrado');
  const v = {}; SG_CONFIG_DOCS.forEach((n, i) => { v[n] = cfg[i].exists ? (cfg[i].data() || {}).value : null; });
  S.clients = [perfil.data()];
  S.txMap = {}; S.txMap[id] = tx.exists ? ((tx.data() || {}).txs || []) : [];
  S.banks = Array.isArray(v.banks) ? v.banks : [...DEFAULT_BANKS];
  S.descriptions = Array.isArray(v.descriptions) ? v.descriptions : [...DEFAULT_DESCRIPTIONS];
  S.customOps = Array.isArray(v.customops) ? v.customops : [];
  S.customBankIcons = (v.custombankicons && typeof v.custombankicons === 'object') ? v.custombankicons : {};
  S.descriptionOps = (v.descriptionops && typeof v.descriptionops === 'object' && !Array.isArray(v.descriptionops)) ? v.descriptionops : {};
  S.messages = Array.isArray(v.messages) ? v.messages : [];
  S.clientMessages = {}; S.clientMessages[id] = conv.exists ? ((conv.data() || {}).msgs || []) : [];
  S.msgRead = {}; if (leit.exists) S.msgRead[id] = (leit.data() || {}).lido || '';
}
// grava versão do app e último acesso no próprio perfil (as regras só deixam o cliente mexer nesses 3 campos)
function acRegistrarAcesso(id) {
  return acFirestore().collection('perfil').doc(id).set({ appVersion: APP_VERSION, lastLogin: new Date().toISOString() }, { merge: true }).catch((e) => console.warn('[acesso] registrar', e && e.code));
}
// ao abrir o app: se já há login nesta aba, restaura; senão mostra o login. NÃO baixa nada antes de entrar.
async function acIniciarCliente() {
  try {
    await acPersistenciaSessao();
    const user = await new Promise((res) => { const off = acAuth().onAuthStateChanged((u) => { off(); res(u); }); });
    if (user) {
      const cid = await acClienteDoUsuario(user);
      if (cid) {
        await acCarregarCliente(cid);
        S.session = { isAdmin: false, clientId: cid };   // antes de getClient(), que depende da sessão
        const c = getClient();
        S.page = c && c.mustChangePwd ? 'changepwd' : 'client'; return;
      }
    }
  } catch (e) { console.warn('[acesso] iniciar', e && e.code); }
  S.session = null; S.page = 'login';
}
function acLimparDados() { S.clients = []; S.txMap = {}; S.clientMessages = {}; S.msgRead = {}; S.messages = []; }

// ── admin: espelha no modelo novo o que o admin grava no antigo (janela de convivência) ──
function acEspelharConfig(docId, value) {
  if (!acEhAdmin() || !SG_CONFIG_DOCS.includes(docId)) return Promise.resolve();
  return firebase.firestore().collection('config').doc(docId).set({ value }).catch((e) => console.warn('[espelho] config/' + docId, e && e.code));
}

// admin: ao carregar, traz do modelo novo o que os clientes da versão nova gravam lá (último acesso, versão, conversas)
function acAguardarLoginAdmin() {
  return new Promise((resolve) => {
    let feito = false; const fim = (u) => { if (!feito) { feito = true; resolve(u); } };
    const off = firebase.auth().onAuthStateChanged((u) => { off(); fim(u); });
    setTimeout(() => fim(firebase.auth().currentUser), 5000);
  });
}
async function acMesclarNovoAdmin() {
  if (!acEhAdmin()) return;
  try {
    if (!(await acAguardarLoginAdmin())) return;
    const db = firebase.firestore();
    const perfis = new Map((await db.collection('perfil').get()).docs.map((d) => [d.id, d.data()]));
    S.clients = S.clients.map((c) => acMesclarPerfil(c, perfis.get(c.id)));
    (await db.collection('conversas').get()).docs.forEach((d) => { S.clientMessages[d.id] = acUniaoMensagens(S.clientMessages[d.id], (d.data() || {}).msgs); });
  } catch (e) { console.warn('[acesso] mesclar', e && e.code); }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { SG_DOMINIO, SG_CONFIG_DOCS, SG_CAMPOS_PERFIL, sgNormUsuario, sgHashUsuario, sgEmail, sgSenhaAuth, sgPerfil, acMesclarPerfil, acUniaoMensagens, acMsgErro };
