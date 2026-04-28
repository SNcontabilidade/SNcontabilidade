const LOGO_DARK='https://res.cloudinary.com/dk10wezy9/image/upload/v1777137104/SN_Branco_m3jaiw.png';
const LOGO_LIGHT='https://res.cloudinary.com/dk10wezy9/image/upload/v1777137105/SN_Solu%C3%A7%C3%B5es_Contabeis_wnt1wv.png';
const getLogo=()=>document.body.classList.contains('light')?LOGO_LIGHT:LOGO_DARK;
const MSG_ICON='https://res.cloudinary.com/dk10wezy9/image/upload/v1777239716/Mensagens_lafk8v.png';
const SHEETS_ICON='https://res.cloudinary.com/dk10wezy9/image/upload/v1777239638/Sheets_chix3m.png';
const SPREADSHEET_ID='1XHk8VXbtt3VARZaAbFdZJpIrTiVIXchXsfr3x-VbG5Q';
const SHEETS_URL='https://docs.google.com/spreadsheets/d/1XHk8VXbtt3VARZaAbFdZJpIrTiVIXchXsfr3x-VbG5Q/edit';

// ─── TAMANHOS CONFIGURÁVEIS ───────────────────────────────────────────────────
const CFG = {
  BANK_ICON_SIZE:  '28px',
  OP_ICON_SIZE:    '40px',
  OP_BADGE_SIZE:   '20px',
  NAV_ICON_SIZE:   '22px',
  KPI_ICON_SIZE:   '28px',
};
const ICON_SIZES = {
  'receita':'40px','retirada':'40px','despesa':'40px','entre_bancos':'40px',
  'aporte':'40px','estoque':'40px','saldo':'40px','bens':'40px',
  'investimento':'48px','emprestimo':'40px','painel':'40px','operacoes':'40px',
};

const BANK_LOGOS = {
  'CAIXA':          'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137107/Caixa_gjhlvz.png',
  'ITAU':           'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137102/Itau_btudnq.png',
  'BRADESCO':       'https://res.cloudinary.com/dk10wezy9/image/upload/v1777138504/Bradesco_jmvqfh.png',
  'SANTANDER':      'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137104/Santander_m9s61x.png',
  'BANCO DO BRASIL':'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137106/BB_w3numo.png',
  'INTER':          'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137102/Inter_psyqu0.png',
  'C6':             'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137106/unnamed_zwkty9.png',
  'NUBANK':         'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137102/Nubank_vlgt0x.png',
  'MERCADO PAGO':   'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137105/unnamed_1_h9ndpc.png',
  'CITIBANK':       'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137108/Citi_a7cjgs.png',
  'BTG':            'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137067/unnamed_3_tjgigh.png',
  'BGT':            'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137067/unnamed_3_tjgigh.png',
};

// bankLogo: usa customBankIcons do estado se disponível, senão BANK_LOGOS padrão
const bankLogo = (name, size=CFG.BANK_ICON_SIZE) => {
  const key = name?.toUpperCase() || '';
  const customUrl = S?.customBankIcons?.[key] || '';
  const url = customUrl || BANK_LOGOS[key] || BANK_LOGOS[name] || '';
  if(url) return `<img src="${url}" alt="${name}" style="width:${size};height:${size};object-fit:contain;border-radius:6px;vertical-align:middle"/>`;
  return `<span style="font-size:12px;font-weight:700;color:var(--muted)">${name||'—'}</span>`;
};

// ─── ÍCONES DE OPERAÇÃO ───────────────────────────────────────────────────────
const OP_ICONS = {
  'receita':      'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137103/Receitas_jwk63q.png',
  'retirada':     'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137103/Retirada_qmpfm8.png',
  'despesa':      'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137108/Despesas_nx766f.png',
  'entre_bancos': 'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137109/Entre_Bancos_jzkris.png',
  'aporte':       'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137106/Aporte_erh8ob.png',
  'estoque':      'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137109/Estoque_siflk8.png',
  'saldo':        'https://res.cloudinary.com/dk10wezy9/image/upload/v1777141052/Saldo_vfedtd.png',
  'bens':         'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137107/Bens_smzkru.png',
  'clientes':     'https://res.cloudinary.com/dk10wezy9/image/upload/v1777143420/Clientes_rdxkth.png',
  'total_lanc':   'https://res.cloudinary.com/dk10wezy9/image/upload/v1777141277/Total-lancamentos_raxtr6.png',
  'saldo_consol': 'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137103/Saldo_ebjmew.png',
  'investimento': 'https://res.cloudinary.com/dk10wezy9/image/upload/v1777140886/Investimento_mohbdc.png',
  'emprestimo':   'https://res.cloudinary.com/dk10wezy9/image/upload/v1777139841/Empr%C3%A9stimo_gtlzhm.png',
  'operacoes':    'https://res.cloudinary.com/dk10wezy9/image/upload/v1777139632/Opera%C3%A7%C3%B5es_zq6hsv.png',
  'painel':       'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137108/Dashboard_iray85.png',
};
const NAV_ICONS = {
  'painel':    'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137108/Dashboard_iray85.png',
  'novo':      'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137103/Receitas_jwk63q.png',
  'lista':     'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137103/Saldo_ebjmew.png',
  'historico': 'https://res.cloudinary.com/dk10wezy9/image/upload/v1777139632/Opera%C3%A7%C3%B5es_zq6hsv.png',
  'grafico':   'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137108/Despesas_nx766f.png',
  'tipos':     'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137109/Estoque_siflk8.png',
};
const opImg = (id, size) => {
  const s = size || ICON_SIZES[id] || CFG.OP_BADGE_SIZE;
  const custom = S.customOps?.find(o=>o.id===id);
  if(custom?.iconUrl) return `<img src="${custom.iconUrl}" alt="${id}" style="width:${s};height:${s};object-fit:contain;vertical-align:middle"/>`;
  const url = OP_ICONS[id] || '';
  if(url) return `<img src="${url}" alt="${id}" style="width:${s};height:${s};object-fit:contain;vertical-align:middle"/>`;
  return '';
};
const navImg = (id, size=CFG.NAV_ICON_SIZE) => {
  const url = NAV_ICONS[id] || '';
  if(url) return `<img src="${url}" alt="${id}" style="width:${size};height:${size};object-fit:contain;vertical-align:middle"/>`;
  return '';
};

const OPS=[{id:'receita',label:'Receita',icon:'',color:'#C8961C'},{id:'retirada',label:'Retirada',icon:'',color:'#10b981'},{id:'bens',label:'Bens',icon:'',color:'#f97316'},{id:'estoque',label:'Estoque',icon:'',color:'#6b7280'},{id:'despesa',label:'Despesa',icon:'',color:'#ef4444'},{id:'aporte',label:'Aporte',icon:'',color:'#3b82f6'},{id:'investimento',label:'Investimento',icon:'',color:'#8b5cf6'},{id:'emprestimo',label:'Empréstimo',icon:'',color:'#ec4899'},{id:'entre_bancos',label:'Entre bancos',icon:'',color:'#06b6d4',wide:true}];
const DEFAULT_BANKS=['CAIXA','ITAU','BRADESCO','SANTANDER','BANCO DO BRASIL','INTER','C6','NUBANK','MERCADO PAGO','CITIBANK','BGT'];
const DEFAULT_DESCRIPTIONS=['Vendas de mercadoria','Serviços prestados','Retirada Sócio','Maquinas','Eletrônicos','Veículo','Mercadoria para revenda','Água','Energia','Telefone e internet','Aluguel','Salário funcionario registrado','Adiantamento func. registrado','Vale transporte','Vale Refeição','Gratificação e prêmio','Ajuda de custo','Material de consumo empresa','Serviços prestados por PJ','Serviços prestados de PF','DAS Impostos faturamento','INSS folha e pagamento','FGTS Folha de pagamento','Contribuições sindicato','Estacionamento','Combustível','Locações','Taxas bancarias','Despesas em diversas','Multas','Despesas com veículo','Reuniões e representação','Embalgens','Aporte sócio','PIS','COFINS','IRPJ','CSLL','ICMS','IR ALUGUEL','Outros impostos - descrever','IPVA','IPTU','ISS','Doação','Iof','Rendimento bancário','Frete','Locomoção','Parcelamento de DAS','Parcelamento impostos federais','Parcelamento impostos estaduais','Juro Passivo','Mora','Aplicações bancarias e outros investimentos','Plano de saúde','Reembolso de despesas diversas','Cartório','Parcelamento diversos','Emprestimo bancário','Transferência mesma titularidade','Seguro','Pagamento de empréstimo'];

// ─── MAPEAMENTO PADRÃO: operação → descrições permitidas ─────────────────────
const OP_DESCRIPTIONS_DEFAULT = {
  'aporte':       ['Aporte sócio'],
  'bens':         ['Maquinas','Eletrônicos','Veículo'],
  'despesa':      ['Água','Energia','Telefone e internet','Aluguel','Salário funcionario registrado','Adiantamento func. registrado','Vale transporte','Vale Refeição','Gratificação e prêmio','Ajuda de custo','Material de consumo empresa','Serviços prestados por PJ','Serviços prestados de PF','DAS Impostos faturamento','INSS folha e pagamento','FGTS Folha de pagamento','Contribuições sindicato','Estacionamento','Combustível','Locações','Taxas bancarias','Despesas em diversas','Multas','Despesas com veículo','Reuniões e representação','Embalgens','PIS','COFINS','IRPJ','CSLL','ICMS','IR ALUGUEL','Outros impostos - descrever','IPVA','IPTU','ISS','Doação','Iof','Frete','Locomoção','Parcelamento de DAS','Parcelamento impostos federais','Parcelamento impostos estaduais','Juro Passivo','Mora','Plano de saúde','Reembolso de despesas diversas','Cartório','Parcelamento diversos','Seguro','Pagamento de empréstimo'],
  'emprestimo':   ['Emprestimo bancário'],
  'receita':      ['Vendas de mercadoria','Serviços prestados','Rendimento bancário'],
  'entre_bancos': ['Transferência mesma titularidade'],
  'retirada':     ['Retirada Sócio'],
  'estoque':      ['Mercadoria para revenda'],
  'investimento': ['Aplicações bancarias e outros investimentos'],
};

const PC=['#C8961C','#3b82f6','#10b981','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316'];

const S={
  page:'login',adminView:'dashboard',viewClientId:null,clientTab:'painel',
  menuOpen:false,filterOpen:false,period:'month',selectedOp:null,comprovante:'',uploadingComp:false,
  txDate:'',txForm:{},showClientForm:false,editClientId:null,
  filters:{startDate:'',endDate:'',operation:'',banco:'',minVal:'',maxVal:'',busca:''},
  toast:false,clients:[],banks:[...DEFAULT_BANKS],descriptions:[...DEFAULT_DESCRIPTIONS],
  customOps:[],txMap:{},session:null,charts:{},clientPeriod:'',histPeriod:'',selectedMonths:[],descQuery:'',slicerOpen:false,
  opForm:{},uploadingIcon:false,
  customBankIcons:{},     // {NOME_BANCO: 'url'}
  descriptionOps:{},      // {descricao: ['op1','op2',...]}
  uploadingBankIcon:false,
  newBankForm:{},
  editTxId:null,          // id da tx sendo editada
  editTxForm:{},
  messages:[],            // broadcast para todos os clientes [{id,text,sentAt}]
  msgRead:{},             // {clientId: lastReadAt timestamp}
  msgText:'',
  adminMsgView:false,
  googleToken:'',     // OAuth token para Sheets API
  sheetsStatus:'',    // '' | 'syncing' | 'ok' | 'error'
};

// ─── FIRESTORE ────────────────────────────────────────────────────────────────
async function fsGet(docId){try{const snap=await firebase.firestore().collection('sn').doc(docId).get();return snap.exists?snap.data().value:null;}catch(e){console.error('fsGet',e);return null;}}
async function fsSet(docId,value){try{await firebase.firestore().collection('sn').doc(docId).set({value});}catch(e){console.error('fsSet',e);}}

async function loadAll(){
  document.getElementById('app').innerHTML='<div class="center-page" style="color:var(--muted);font-size:14px">⏳ Carregando dados...</div>';
  const [clients,banks,txMap,descriptions,customOps,customBankIcons,descriptionOps,messages,msgRead]=await Promise.all([
    fsGet('clients'),fsGet('banks'),fsGet('txmap'),fsGet('descriptions'),
    fsGet('customops'),fsGet('custombankicons'),fsGet('descriptionops'),fsGet('messages'),fsGet('msgread'),
  ]);
  S.clients=clients||[];
  S.banks=banks||[...DEFAULT_BANKS];
  S.txMap=txMap||{};
  S.descriptions=descriptions||[...DEFAULT_DESCRIPTIONS];
  S.customOps=customOps||[];
  S.customBankIcons=customBankIcons||{};
  S.descriptionOps=descriptionOps||{};
  S.messages=Array.isArray(messages)?messages:[];
  S.msgRead=(msgRead&&typeof msgRead==='object'&&!Array.isArray(msgRead))?msgRead:{};
  // Pré-popula descriptionOps a partir dos defaults se vazio
  if(!descriptionOps){
    Object.entries(OP_DESCRIPTIONS_DEFAULT).forEach(([op,descs])=>{
      descs.forEach(d=>{
        if(!S.descriptionOps[d])S.descriptionOps[d]=[];
        if(!S.descriptionOps[d].includes(op))S.descriptionOps[d].push(op);
      });
    });
    fsSet('descriptionops',S.descriptionOps);
  }
}
function saveClients()         {return fsSet('clients',S.clients);}
function saveBanks()           {return fsSet('banks',S.banks);}
function saveTxMap()           {return fsSet('txmap',S.txMap);}
function saveDescriptions()    {return fsSet('descriptions',S.descriptions);}
function saveCustomOps()       {return fsSet('customops',S.customOps);}
function saveCustomBankIcons() {return fsSet('custombankicons',S.customBankIcons);}
function saveDescriptionOps()  {return fsSet('descriptionops',S.descriptionOps);}
function saveMessages()        {return fsSet('messages',S.messages);}
function saveMsgRead()         {return fsSet('msgread',S.msgRead);}

const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const todayStr=()=>new Date().toISOString().slice(0,10);
const isNeg=op=>['despesa','retirada'].includes(op);
const fmtCur=v=>'R$ '+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'';
const makeUser=n=>'SN'+n.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const getOp=id=>OPS.find(o=>o.id===id)||S.customOps.find(o=>o.id===id);
const getClient=()=>S.clients.find(c=>c.id===S.session?.clientId);
const getClientTx=()=>S.txMap[S.session?.clientId]||[];
const q=sel=>document.querySelector(sel);
const allTx=()=>Object.values(S.txMap).flat();
function destroyCharts(){Object.values(S.charts).forEach(ch=>{try{ch.destroy();}catch{}});S.charts={};}

// ─── TEMA ─────────────────────────────────────────────────────────────────────
function applyTheme(){
  const saved=localStorage.getItem('sn:theme')||'dark';
  if(saved==='light')document.body.classList.add('light');
  else document.body.classList.remove('light');
}
function toggleTheme(){
  const isLight=document.body.classList.toggle('light');
  localStorage.setItem('sn:theme',isLight?'light':'dark');
  render();
}

function render(){
  destroyCharts();
  applyTheme();
  const el=document.getElementById('app');
  if(!document.getElementById('sn-watermark-style')){
    const st=document.createElement('style');
    st.id='sn-watermark-style';
    st.textContent=`
      .admin-main::before,.page::before{content:'';position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:500px;background:url('${LOGO_DARK}') no-repeat center/contain;opacity:0.04;pointer-events:none;z-index:0;}
      body.light .admin-main::before,body.light .page::before{background-image:url('${LOGO_LIGHT}');opacity:0.06;}
      .admin-content,.screen,.card,.kpi-grid,.charts-grid,.recent-list,.tx-table-wrap{position:relative;z-index:1;}
    `;
    document.head.appendChild(st);
  }
  switch(S.page){
    case'login':el.innerHTML=pageLogin();break;
    case'changepwd':el.innerHTML=pageChangePwd();break;
    case'admin':el.innerHTML=pageAdmin();buildAdminCharts();break;
    case'client':el.innerHTML=pageClient();buildClientCharts();break;
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL='contabilidade@snsolucoescontabeis.com';
const IS_ADMIN_PAGE=typeof ADMIN_MODE!=='undefined'&&ADMIN_MODE===true;
function pageLogin(){if(IS_ADMIN_PAGE)return pageLoginAdmin();
  return`<div class="center-page">
    <img src="${getLogo()}" class="login-logo" alt="SN" onerror="this.style.display='none'"/>
    <div class="card login-box">
      <h2 class="login-title">SN – Soluções Contábeis</h2>
      <p class="login-sub">Sistema de Gestão Financeira</p>
      <div class="field"><label class="label">Usuário</label><input id="login-user" class="inp" placeholder="Seu usuário de acesso" onkeydown="if(event.key==='Enter')doLogin()"/></div>
      <div class="field"><label class="label">Senha</label><input id="login-pass" type="password" class="inp" placeholder="Sua senha" onkeydown="if(event.key==='Enter')doLogin()"/></div>
      <p id="login-err" class="err"></p>
      <button class="btn btn-acc btn-full" style="padding:12px;font-size:15px" onclick="doLogin()">Entrar</button>
    </div>
    <div style="position:fixed;bottom:16px;left:0;right:0;text-align:center;font-size:11px;color:var(--muted);letter-spacing:.02em">© Desenvolvido por <strong style="color:var(--accent)">Kelvin Santos</strong></div>
  </div>`;}
function pageLoginAdmin(){return`<div class="center-page">
  <img src="${getLogo()}" class="login-logo" alt="SN" onerror="this.style.display='none'"/>
  <div class="card login-box" style="text-align:center">
    <h2 class="login-title">Acesso Administrativo</h2>
    <p class="login-sub" style="margin-bottom:24px">Restrito à equipe SN Soluções Contábeis</p>
    <p id="login-err" class="err"></p>
    <button class="btn btn-ghost btn-full" style="padding:13px;font-size:14px;gap:10px;justify-content:center" onclick="doGoogleLogin()">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 32.8 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.2 4 9.5 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.3 26.8 36 24 36c-5.3 0-9.7-3.2-11.3-7.8l-6.6 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C40.9 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
      Entrar com Google
    </button>
  </div>
  <div style="position:fixed;bottom:16px;left:0;right:0;text-align:center;font-size:11px;color:var(--muted);letter-spacing:.02em">© Desenvolvido por <strong style="color:var(--accent)">Kelvin Santos</strong></div>
</div>`;}
function doLogin(){
  const u=q('#login-user').value.trim(),p=q('#login-pass').value;
  const c=S.clients.find(x=>x.username.toLowerCase()===u.toLowerCase()&&x.password===p);
  if(c){S.session={isAdmin:false,clientId:c.id};sessionStorage.setItem('sn:session',JSON.stringify(S.session));S.page=c.mustChangePwd?'changepwd':'client';render();return;}
  q('#login-err').textContent='Usuário ou senha inválidos.';
}
async function doGoogleLogin(){
  const errEl=q('#login-err');
  try{
    const provider=new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets');
    provider.setCustomParameters({login_hint:ADMIN_EMAIL});
    const result=await firebase.auth().signInWithPopup(provider);
    const email=result.user.email;
    if(email!==ADMIN_EMAIL){await firebase.auth().signOut();if(errEl)errEl.textContent='Acesso negado. Use a conta Google autorizada.';return;}
    S.googleToken=result.credential?.accessToken||'';
    S.session={isAdmin:true,adminEmail:email};
    sessionStorage.setItem('sn:session',JSON.stringify(S.session));
    S.page='admin';S.adminView='dashboard';render();
  }catch(e){if(errEl)errEl.textContent='Erro ao autenticar: '+(e.message||'tente novamente');}
}
function pageChangePwd(){return`<div class="center-page"><img src="${getLogo()}" style="width:140px;margin-bottom:24px;object-fit:contain" alt="SN" onerror="this.style.display='none'"/><div class="card" style="width:100%;max-width:360px"><h3 style="color:var(--accent);margin-bottom:6px">Primeiro Acesso</h3><p style="color:var(--muted);font-size:13px;margin-bottom:20px">Crie uma senha pessoal para continuar.</p><div class="field"><label class="label">Nova Senha</label><input id="cp-pass" type="password" class="inp"/></div><div class="field"><label class="label">Confirmar</label><input id="cp-conf" type="password" class="inp" onkeydown="if(event.key==='Enter')doChangePwd()"/></div><p id="cp-err" class="err"></p><button class="btn btn-acc btn-full" style="padding:12px" onclick="doChangePwd()">Confirmar Nova Senha</button></div></div>`;}
function doChangePwd(){const p=q('#cp-pass').value,c=q('#cp-conf').value,err=q('#cp-err');if(p.length<6){err.textContent='Mínimo 6 caracteres.';return;}if(p!==c){err.textContent='As senhas não coincidem.';return;}const client=getClient();S.clients=S.clients.map(x=>x.id===client.id?{...x,password:p,mustChangePwd:false}:x);saveClients();S.page='client';render();}
function doLogout(){firebase.auth().signOut().catch(()=>{});S.session=null;sessionStorage.removeItem('sn:session');S.selectedOp=null;S.comprovante='';S.uploadingComp=false;S.menuOpen=false;S.filterOpen=false;S.editTxId=null;S.page='login';render();}

// ─── ADMIN SHELL ──────────────────────────────────────────────────────────────
function pageAdmin(){
  const nav=[{id:'dashboard',label:'Dashboard'},{id:'clients',label:'Clientes'},{id:'banks',label:'Bancos'},{id:'descriptions',label:'Descrições'},{id:'operacoes',label:'Operações'},{id:'mensagens',label:'Mensagens'}];
  const sideItems=nav.map(n=>{const isMsgs=n.id==='mensagens';const msgCount=(Array.isArray(S.messages)?S.messages:[]).length;const badge=isMsgs&&msgCount>0?`<span style="background:var(--accent);color:#000;font-size:10px;font-weight:700;border-radius:20px;padding:1px 7px;margin-left:auto">${msgCount}</span>`:'';return`<button class="sidebar-item ${S.adminView===n.id?'active':''}" onclick="setAdminView('${n.id}')" style="justify-content:flex-start">${n.label}${badge}</button>`;}).join('');
  const titles={dashboard:['Dashboard','Visão geral consolidada'],clients:['Clientes',`${S.clients.length} cliente${S.clients.length!==1?'s':''} cadastrado${S.clients.length!==1?'s':''}`],'client-detail':[(S.clients.find(x=>x.id===S.viewClientId)?.razaoSocial||'Cliente'),'Painel gerencial do cliente'],banks:['Bancos',`${S.banks.length} bancos cadastrados`],descriptions:['Descrições',`${S.descriptions.length} descrições cadastradas`],operacoes:['Operações',`${OPS.length+S.customOps.length} operações disponíveis`],mensagens:['Mensagens',`${(Array.isArray(S.messages)?S.messages:[]).length} mensagens enviadas`]};
  const [title,sub]=titles[S.adminView]||['Admin',''];
  let content='';
  if(S.adminView==='dashboard')content=admDashboard();
  else if(S.adminView==='clients')content=admClients();
  else if(S.adminView==='client-detail')content=admClientDetail();
  else if(S.adminView==='banks')content=admBanks();
  else if(S.adminView==='descriptions')content=admDescriptions();
  else if(S.adminView==='operacoes')content=admOperacoes();
  else if(S.adminView==='mensagens')content=admMensagens();
  return`<div class="admin-wrap"><aside class="admin-sidebar"><div class="sidebar-logo"><img src="${getLogo()}" alt="SN" onerror="this.style.display='none'"/></div><div class="sidebar-user"><div class="sidebar-user-label">Acesso</div><div class="sidebar-user-name">Administrador</div></div><nav class="sidebar-nav">${sideItems}</nav><div class="sidebar-footer"><button class="btn btn-ghost btn-full btn-sm" onclick="doLogout()">Sair</button></div></aside><main class="admin-main"><div class="admin-header"><div class="admin-header-left"><h1>${title}</h1><p>${sub}</p></div><div style="display:flex;align-items:center;gap:12px"><div style="font-size:12px;color:var(--muted)">${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</div><a href="${SHEETS_URL}" target="_blank" title="Abrir Google Sheets" style="display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid var(--border);border-radius:7px;padding:6px 10px;text-decoration:none;color:var(--text);font-size:12px;font-weight:500;transition:background .15s" onmouseover="this.style.background='var(--card2)'" onmouseout="this.style.background='none'"><img src="${SHEETS_ICON}" style="width:20px;height:20px;object-fit:contain"/> Sheets</a><button onclick="syncAllToSheets()" title="Sincronizar todos os clientes com o Google Sheets" style="display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid var(--border);border-radius:7px;padding:6px 10px;cursor:pointer;color:var(--text);font-size:12px;font-weight:500;font-family:inherit;transition:background .15s" onmouseover="this.style.background='var(--card2)'" onmouseout="this.style.background='none'">${S.sheetsStatus==='syncing'?'⏳ Sincronizando...':S.sheetsStatus==='ok'?'✓ Sincronizado':S.sheetsStatus==='error'?'⚠️ Erro':'🔄 Sincronizar'}</button></div></div><div class="admin-content">${content}</div></main></div>`;
}
function setAdminView(v){S.adminView=v;S.showClientForm=false;render();}

// ─── DASHBOARD ADMIN ─────────────────────────────────────────────────────────
function admDashboard(){
  const tx=allTx();
  const totalRec=tx.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);
  const totalDesp=tx.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const saldoGeral=tx.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);
  const ativos=S.clients.filter(c=>(S.txMap[c.id]||[]).length>0).length;
  const kpis=[{img:opImg('clientes',CFG.KPI_ICON_SIZE),val:S.clients.length,lbl:'Clientes Cadastrados',color:'#C8961C'},{img:opImg('clientes',CFG.KPI_ICON_SIZE),val:ativos,lbl:'Com Lançamentos',color:'#10b981'},{img:opImg('total_lanc',CFG.KPI_ICON_SIZE),val:tx.length,lbl:'Total de Lançamentos',color:'#3b82f6'},{img:opImg('receita',CFG.KPI_ICON_SIZE),val:fmtCur(totalRec),lbl:'Total Receitas',color:'#10b981'},{img:opImg('despesa',CFG.KPI_ICON_SIZE),val:fmtCur(totalDesp),lbl:'Total Despesas',color:'#ef4444'},{img:opImg('saldo_consol',CFG.KPI_ICON_SIZE),val:fmtCur(saldoGeral),lbl:'Saldo Consolidado',color:saldoGeral>=0?'#10b981':'#ef4444'}].map(k=>`<div class="kpi-card" style="border-top-color:${k.color}"><div class="kpi-icon">${k.img}</div><div class="kpi-val" style="color:${k.color}">${k.val}</div><div class="kpi-lbl">${k.lbl}</div></div>`).join('');
  const recent=tx.sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,8).map(t=>{const op=getOp(t.operation);const cl=S.clients.find(c=>(S.txMap[c.id]||[]).some(x=>x.id===t.id));return`<div class="recent-item"><span class="recent-icon">${opImg(t.operation,CFG.OP_BADGE_SIZE)}</span><div class="recent-info"><div class="recent-name">${esc(cl?.razaoSocial||'—')} · ${op?.label||''}</div><div class="recent-meta">${esc(t.descricao||'sem descrição')} · ${fmtDate(t.date)}</div></div><span class="recent-val" style="color:${isNeg(t.operation)?'var(--danger)':'var(--success)'}">${isNeg(t.operation)?'−':'+'}${fmtCur(t.valor)}</span></div>`;}).join('')||'<div style="color:var(--muted);font-size:13px;padding:12px 0">Nenhum lançamento ainda.</div>';
  const ranking=S.clients.map(c=>{const txs=S.txMap[c.id]||[];const saldo=txs.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);return{c,count:txs.length,saldo};}).filter(x=>x.count>0).sort((a,b)=>b.count-a.count).slice(0,5);
  const rankHtml=ranking.length?ranking.map((r,i)=>`<tr><td style="font-weight:700;color:var(--muted);padding-right:8px">${i+1}</td><td style="cursor:pointer;color:var(--accent)" onclick="openClientDetail('${r.c.id}')">${esc(r.c.razaoSocial)}</td><td>${r.count}</td><td style="color:${r.saldo>=0?'var(--success)':'var(--danger)'};font-weight:700">${fmtCur(r.saldo)}</td><td><button class="btn btn-ghost btn-sm" onclick="openClientDetail('${r.c.id}')">Ver →</button></td></tr>`).join(''):`<tr><td colspan="5" style="color:var(--muted);padding:16px">Nenhum lançamento registrado.</td></tr>`;
  return`<div class="kpi-grid">${kpis}</div><div class="charts-grid"><div class="chart-card"><div class="chart-title">Movimentações por Mês</div><div class="chart-sub">Receitas e despesas consolidadas</div><canvas id="adm-chart-bar"></canvas></div><div class="chart-card"><div class="chart-title">Por Tipo de Operação</div><div class="chart-sub">Distribuição do valor total</div><canvas id="adm-chart-pie"></canvas></div></div><div style="display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:24px"><div><div class="section-title" style="margin-bottom:12px">Últimos Lançamentos</div><div class="recent-list">${recent}</div></div><div><div class="section-title" style="margin-bottom:12px">Ranking de Clientes</div><div class="tx-table-wrap"><table class="tx-table"><thead><tr><th>#</th><th>Cliente</th><th>Lançamentos</th><th>Saldo</th><th></th></tr></thead><tbody>${rankHtml}</tbody></table></div></div></div>`;
}

// ─── CLIENTES ADMIN ───────────────────────────────────────────────────────────
function admClients(){
  const editData=S.editClientId?S.clients.find(x=>x.id===S.editClientId):null;
  const formHtml=S.showClientForm?`<div class="card" style="margin-bottom:20px">
    <div style="color:var(--accent);font-weight:700;margin-bottom:14px">${editData?'Editar Cliente':'Novo Cliente'}</div>
    <div class="field"><label class="label">Razão Social</label><input id="cf-rs" class="inp" value="${esc(editData?.razaoSocial||'')}" placeholder="Nome da empresa"/></div>
    <div class="field"><label class="label">CNPJ</label><input id="cf-cnpj" class="inp" value="${esc(editData?.cnpj||'')}" placeholder="00.000.000/0000-00" maxlength="18"/></div>
    <div class="field"><label class="label">E-mail</label><input id="cf-email" type="email" class="inp" value="${esc(editData?.email||'')}" placeholder="email@empresa.com"/></div>
    <div class="field"><label class="label">Login de acesso *</label><input id="cf-user" class="inp" value="${esc(editData?.username||'')}" placeholder="Ex: empresa123 (sem espaços)" oninput="this.value=this.value.replace(/\\s/g,'')"/>
    <div style="font-size:11px;color:var(--muted);margin-top:4px">Senha inicial: <strong style="color:var(--accent)">12345</strong></div></div>
    <p id="cf-err" class="err"></p>
    <div class="row"><button class="btn btn-acc" onclick="saveClientForm()">Salvar</button><button class="btn btn-ghost" onclick="closeClientForm()">Cancelar</button></div>
  </div>`:'';
  const cards=S.clients.map(c=>{
    const txs=S.txMap[c.id]||[];const saldo=txs.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);const rec=txs.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);const lastTx=txs[0];
    const initials=c.razaoSocial.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
    const badge=c.mustChangePwd?'<span class="cl-badge badge-warn">Senha padrão</span>':txs.length>0?'<span class="cl-badge badge-ok">Ativo</span>':'<span class="cl-badge badge-none">Sem lançamentos</span>';
    return`<div class="cl-card" onclick="openClientDetail('${c.id}')"><div class="cl-card-header"><div class="cl-avatar">${initials||'?'}</div><div><div class="cl-name">${esc(c.razaoSocial)}</div><div class="cl-cnpj">${esc(c.cnpj)}</div><div style="font-size:11px;color:var(--accent);margin-top:2px">Login: <strong>${esc(c.username)}</strong></div></div></div><div class="cl-stats-grid"><div class="cl-stat"><div class="cl-stat-lbl">Lançamentos</div><div class="cl-stat-val" style="color:var(--blue)">${txs.length}</div></div><div class="cl-stat"><div class="cl-stat-lbl">Saldo</div><div class="cl-stat-val" style="color:${saldo>=0?'var(--success)':'var(--danger)'}">${fmtCur(saldo)}</div></div><div class="cl-stat"><div class="cl-stat-lbl">Receitas</div><div class="cl-stat-val" style="color:var(--success)">${fmtCur(rec)}</div></div><div class="cl-stat"><div class="cl-stat-lbl">Último mov.</div><div class="cl-stat-val">${lastTx?fmtDate(lastTx.date):'—'}</div></div></div><div class="cl-card-footer">${badge}<div class="row" style="gap:6px" onclick="event.stopPropagation()"><button class="btn btn-ghost btn-sm" onclick="editClientOpen('${c.id}')">Editar</button><button class="btn btn-ghost btn-sm" onclick="resetClientPwd('${c.id}')">Reset senha</button><button class="btn btn-danger btn-sm" onclick="deleteClient('${c.id}')">Remover</button></div></div></div>`;
  }).join('');
  return`<div class="row-spread" style="margin-bottom:20px"><div><h2 style="font-size:16px;font-weight:700">${S.clients.length} cliente${S.clients.length!==1?'s':''} cadastrado${S.clients.length!==1?'s':''}</h2></div><button class="btn btn-acc" onclick="openNewClientForm()">+ Novo Cliente</button></div>${formHtml}${S.clients.length===0?'<div class="empty"><div class="empty-icon">👥</div>Nenhum cliente cadastrado ainda.<br><br><button class="btn btn-acc" style="margin-top:16px" onclick="openNewClientForm()">Cadastrar primeiro cliente</button></div>':`<div class="cl-grid">${cards}</div>`}`;
}
function openNewClientForm(){S.showClientForm=true;S.editClientId=null;render();}
function editClientOpen(id){S.showClientForm=true;S.editClientId=id;S.adminView='clients';render();}
function closeClientForm(){S.showClientForm=false;S.editClientId=null;render();}
function saveClientForm(){
  const rs=q('#cf-rs').value.trim(),cnpj=q('#cf-cnpj').value.trim(),email=q('#cf-email').value.trim(),username=q('#cf-user').value.trim(),err=q('#cf-err');
  if(!rs||!cnpj||!email||!username){err.textContent='Preencha todos os campos obrigatórios.';return;}
  if(!/^[^\s]+$/.test(username)){err.textContent='Login não pode ter espaços.';return;}
  const duplicate=S.clients.find(c=>c.username.toLowerCase()===username.toLowerCase()&&c.id!==S.editClientId);
  if(duplicate){err.textContent='Este login já está em uso por outro cliente.';return;}
  if(S.editClientId){S.clients=S.clients.map(c=>c.id===S.editClientId?{...c,razaoSocial:rs,cnpj,email,username}:c);}
  else{if(S.clients.length>=30){err.textContent='Limite de 30 clientes atingido.';return;}const newClient={id:uid(),razaoSocial:rs,cnpj,email,username,password:'12345',mustChangePwd:true,createdAt:new Date().toISOString()};
  S.clients.push(newClient);
  sheetsCreateClientTab(newClient);}
  saveClients();S.showClientForm=false;S.editClientId=null;render();
}
function deleteClient(id){if(!confirm('Remover este cliente e todos os seus dados?'))return;S.clients=S.clients.filter(c=>c.id!==id);delete S.txMap[id];saveClients();saveTxMap();render();}
function resetClientPwd(id){const c=S.clients.find(x=>x.id===id);if(!c||!confirm(`Resetar senha de ${c.razaoSocial}?`))return;S.clients=S.clients.map(x=>x.id===id?{...x,password:'12345',mustChangePwd:true}:x);saveClients();render();}

// ─── CLIENT DETAIL (admin) ────────────────────────────────────────────────────
function openClientDetail(id){S.viewClientId=id;S.adminView='client-detail';render();}
function admClientDetail(){
  const c=S.clients.find(x=>x.id===S.viewClientId);
  if(!c)return'<div class="empty">Cliente não encontrado.</div>';
  const txs=(S.txMap[c.id]||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const rec=txs.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);
  const desp=txs.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const outros=txs.filter(t=>t.operation!=='receita'&&!isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const saldo=txs.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);
  const initials=c.razaoSocial.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
  const kpis=[{img:`<img src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777141277/Total-lancamentos_raxtr6.png" style="width:${CFG.KPI_ICON_SIZE};height:${CFG.KPI_ICON_SIZE};object-fit:contain"/>`,val:txs.length,lbl:'Total Lançamentos',color:'var(--blue)'},{img:opImg('receita',CFG.KPI_ICON_SIZE),val:fmtCur(rec),lbl:'Receitas',color:'var(--success)'},{img:opImg('despesa',CFG.KPI_ICON_SIZE),val:fmtCur(desp),lbl:'Despesas',color:'var(--danger)'},{img:`<img src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777141665/Outros_aebx7k.png" style="width:${CFG.KPI_ICON_SIZE};height:${CFG.KPI_ICON_SIZE};object-fit:contain"/>`,val:fmtCur(outros),lbl:'Outros',color:'var(--accent)'},{img:`<img src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777141052/Saldo_vfedtd.png" style="width:${CFG.KPI_ICON_SIZE};height:${CFG.KPI_ICON_SIZE};object-fit:contain"/>`,val:fmtCur(saldo),lbl:'Saldo',color:saldo>=0?'var(--success)':'var(--danger)'}].map(k=>`<div class="kpi-card" style="border-top-color:${k.color}"><div class="kpi-icon">${k.img}</div><div class="kpi-val" style="color:${k.color}">${k.val}</div><div class="kpi-lbl">${k.lbl}</div></div>`).join('');
  const opGroups={};txs.forEach(t=>{if(!opGroups[t.operation])opGroups[t.operation]={value:0,count:0};opGroups[t.operation].value+=t.valor;opGroups[t.operation].count++;});
  const opRows=Object.entries(opGroups).sort((a,b)=>b[1].value-a[1].value).map(([id,g])=>{const op=getOp(id);return`<tr><td><span class="op-pill" style="background:${op?.color||'#888'}22;color:${op?.color||'#888'}">${op?.label||id}</span></td><td>${g.count}</td><td style="color:var(--accent);font-weight:700">${fmtCur(g.value)}</td></tr>`;}).join('')||'<tr><td colspan="3" style="color:var(--muted);padding:12px">Sem dados.</td></tr>';
  const txRows=txs.slice(0,20).map(t=>{const op=getOp(t.operation);return`<tr><td style="white-space:nowrap">${fmtDate(t.date)}</td><td><span class="op-pill" style="background:${op?.color||'#888'}22;color:${op?.color||'#888'}">${op?.label||t.operation}</span></td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.descricao||'—')}</td><td>${esc(t.banco||'—')}</td><td class="${isNeg(t.operation)?'val-neg':'val-pos'}">${isNeg(t.operation)?'−':'+'}${fmtCur(t.valor)}</td><td>${t.comprovante?`<a href="${t.comprovante}" target="_blank" style="color:var(--blue);text-decoration:none;font-size:12px">📎 Ver</a>`:''}</td></tr>`;}).join('')||'<tr><td colspan="6" style="color:var(--muted);padding:16px">Nenhum lançamento.</td></tr>';
  return`<button class="back-btn" onclick="setAdminView('clients')">← Voltar aos Clientes</button>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
    <div style="display:flex;align-items:center;gap:14px;flex:1"><div class="cl-avatar" style="width:52px;height:52px;font-size:18px">${initials}</div><div><div style="font-size:20px;font-weight:700">${esc(c.razaoSocial)}</div><div style="font-size:13px;color:var(--muted);margin-top:4px;display:flex;gap:16px;flex-wrap:wrap"><span>📄 ${esc(c.cnpj)}</span><span>✉️ ${esc(c.email)}</span><span>👤 ${esc(c.username)}</span></div></div></div>
    <div style="display:flex;gap:8px;flex-shrink:0"><button class="btn btn-ghost btn-sm" onclick="editClientOpen('${c.id}')">Editar</button><button class="btn btn-ghost btn-sm" onclick="resetClientPwd('${c.id}')">Reset Senha</button></div>
  </div>
  <div class="kpi-grid" style="margin-bottom:20px">${kpis}</div>
  <div class="detail-charts"><div class="chart-card"><div class="chart-title">Movimentações por Mês</div><div class="chart-sub">Receitas vs Despesas</div><canvas id="cl-chart-bar"></canvas></div><div class="chart-card"><div class="chart-title">Por Tipo</div><div class="chart-sub">Distribuição do valor</div><canvas id="cl-chart-pie"></canvas></div></div>
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:20px">
    <div><div class="section-title" style="margin-bottom:12px">Últimos ${Math.min(txs.length,20)} Lançamentos</div><div class="tx-table-wrap"><table class="tx-table"><thead><tr><th>Data</th><th>Operação</th><th>Descrição</th><th>Banco</th><th>Valor</th><th>Comprovante</th></tr></thead><tbody>${txRows}</tbody></table></div></div>
    <div><div class="section-title" style="margin-bottom:12px">Por Operação</div><div class="tx-table-wrap"><table class="tx-table"><thead><tr><th>Tipo</th><th>Qtd</th><th>Total</th></tr></thead><tbody>${opRows}</tbody></table></div></div>
  </div>`;
}

// ─── BANCOS ADMIN (com upload de ícone) ───────────────────────────────────────
function admBanks(){
  const isUp=S.uploadingBankIcon;
  const preview=S.newBankForm.iconUrl
    ?`<img src="${S.newBankForm.iconUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:6px;border:1px solid var(--border)"/>`
    :`<div style="width:36px;height:36px;background:var(--card2);border:2px dashed var(--border);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px">🏦</div>`;
  const formHtml=`<div class="card" style="max-width:600px;margin-bottom:20px">
    <div style="color:var(--accent);font-weight:700;margin-bottom:14px">Adicionar Banco</div>
    <div style="display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:160px"><label class="label">Nome do banco *</label><input id="new-bank" class="inp" placeholder="Ex: SICOOB" value="${esc(S.newBankForm.name||'')}" onkeydown="if(event.key==='Enter')addBank()"/></div>
      <div>
        <label class="label">Ícone (opcional)</label>
        <div style="display:flex;align-items:center;gap:8px">
          ${preview}
          <button class="btn btn-ghost btn-sm" onclick="q('#bank-icon-file').click()" ${isUp?'disabled':''} style="${isUp?'opacity:.5':''}">
            ${isUp?'⏳ Enviando...':'📤 Imagem'}
          </button>
          <input id="bank-icon-file" type="file" accept="image/*" style="display:none" onchange="uploadBankIcon(this)"/>
        </div>
      </div>
      <button class="btn btn-acc" onclick="addBank()" ${isUp?'disabled':''}>Adicionar</button>
    </div>
    <p id="bank-err" class="err" style="margin-top:8px"></p>
  </div>`;
  const pills=S.banks.map(b=>`<div class="bank-pill"><span class="pill-name" style="display:flex;align-items:center;gap:6px">${bankLogo(b)} ${esc(b)}</span><button class="pill-del" onclick="deleteBank('${esc(b)}')">×</button></div>`).join('');
  return`${formHtml}<div class="card" style="max-width:600px"><div class="bank-pills">${pills}</div></div>`;
}
async function uploadBankIcon(input){
  const file=input.files[0];if(!file)return;
  if(file.size>2*1024*1024){alert('Arquivo muito grande. Máximo 2MB.');return;}
  S.newBankForm={...S.newBankForm,name:q('#new-bank')?.value||''};
  S.uploadingBankIcon=true;render();
  try{
    const fd=new FormData();fd.append('file',file);fd.append('upload_preset','o5v89u2z');
    const res=await fetch('https://api.cloudinary.com/v1_1/dk10wezy9/image/upload',{method:'POST',body:fd});
    const data=await res.json();
    if(data.secure_url)S.newBankForm={...S.newBankForm,iconUrl:data.secure_url};
    else alert('Erro ao enviar ícone.');
  }catch{alert('Erro de conexão ao enviar ícone.');}
  S.uploadingBankIcon=false;render();
}
function addBank(){
  const v=(q('#new-bank')?.value||S.newBankForm.name||'').trim().toUpperCase();
  const err=q('#bank-err');
  if(!v){if(err)err.textContent='Digite o nome do banco.';return;}
  if(S.banks.includes(v)){if(err)err.textContent='Banco já cadastrado.';return;}
  S.banks.push(v);
  if(S.newBankForm.iconUrl)S.customBankIcons[v]=S.newBankForm.iconUrl;
  S.newBankForm={};
  saveBanks();saveCustomBankIcons();render();
}
function deleteBank(b){if(!confirm(`Remover ${b}?`))return;S.banks=S.banks.filter(x=>x!==b);delete S.customBankIcons[b];saveBanks();saveCustomBankIcons();render();}

// ─── DESCRIÇÕES ADMIN (agrupadas por operação) ───────────────────────────────
function admDescriptions(){
  const allOpsForTag=[...OPS,...S.customOps].filter(o=>!o.wide||o.id==='entre_bancos');
  // Agrupa descrições por operação
  const groups={};
  allOpsForTag.forEach(op=>{groups[op.id]=[];});
  const noCategory=[];
  S.descriptions.forEach(d=>{
    const ops=S.descriptionOps[d]||[];
    if(ops.length===0){noCategory.push(d);}
    else{ops.forEach(opId=>{if(groups[opId])groups[opId].push(d);});}
  });
  // Renderiza grupos
  const groupHtml=allOpsForTag.map(op=>{
    const descs=groups[op.id]||[];
    const pills=descs.map(d=>{const idx=S.descriptions.indexOf(d);return`<div class="bank-pill" style="margin:0"><span class="pill-name">${esc(d)}</span><button class="pill-del" onclick="deleteDescription(${idx})">×</button></div>`;}).join('');
    return`<details style="margin-bottom:8px" open>
      <summary style="cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--card);border:1px solid var(--border);border-radius:10px;user-select:none">
        <span style="width:10px;height:10px;border-radius:50%;background:${op.color||'var(--accent)'};flex-shrink:0;display:inline-block"></span>
        <span style="font-weight:700;font-size:14px;color:var(--text);flex:1">${esc(op.label)}</span>
        <span style="font-size:11px;color:var(--muted);background:var(--card2);padding:2px 9px;border-radius:20px">${descs.length}</span>
        <span style="font-size:11px;color:var(--muted)">▾</span>
      </summary>
      <div style="padding:12px 14px;background:var(--card);border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px">
        ${descs.length?`<div class="bank-pills" style="gap:6px">${pills}</div>`:'<div style="font-size:12px;color:var(--muted)">Nenhuma descrição nesta categoria.</div>'}
      </div>
    </details>`;
  }).join('');
  // Sem categoria
  const noCatHtml=noCategory.length?`<details style="margin-bottom:8px">
    <summary style="cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--card);border:1px solid var(--border);border-radius:10px;user-select:none">
      <span style="width:10px;height:10px;border-radius:50%;background:var(--muted);flex-shrink:0;display:inline-block"></span>
      <span style="font-weight:700;font-size:14px;color:var(--muted);flex:1">Sem categoria</span>
      <span style="font-size:11px;color:var(--muted);background:var(--card2);padding:2px 9px;border-radius:20px">${noCategory.length}</span>
      <span style="font-size:11px;color:var(--muted)">▾</span>
    </summary>
    <div style="padding:12px 14px;background:var(--card);border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px">
      <div class="bank-pills" style="gap:6px">${noCategory.map(d=>{const idx=S.descriptions.indexOf(d);return`<div class="bank-pill" style="margin:0"><span class="pill-name">${esc(d)}</span><button class="pill-del" onclick="deleteDescription(${idx})">×</button></div>`;}).join('')}</div>
    </div>
  </details>`:'';
  const opCheckboxesNew=allOpsForTag.map(o=>`
    <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;white-space:nowrap">
      <input type="checkbox" id="new-desc-op-${o.id}" style="accent-color:var(--accent)"/>
      <span style="color:${o.color||'var(--text)'};font-weight:500">${o.label}</span>
    </label>`).join('');
  return`<div style="max-width:700px">
    <div class="card" style="margin-bottom:16px">
      <div style="color:var(--accent);font-weight:700;margin-bottom:12px">+ Nova Descrição</div>
      <div class="row" style="margin-bottom:10px"><input id="new-desc" class="inp" style="flex:1" placeholder="Nome da descrição..." onkeydown="if(event.key==='Enter')addDescription()"/><button class="btn btn-acc" onclick="addDescription()">Adicionar</button></div>
      <label class="label" style="margin-bottom:6px">Vincular às operações</label>
      <div style="display:flex;flex-wrap:wrap;gap:10px;padding:10px;background:var(--card2);border-radius:7px">${opCheckboxesNew}</div>
      <p id="desc-err" class="err" style="margin-top:8px"></p>
    </div>
    ${groupHtml}${noCatHtml}
  </div>`;
}
function toggleDescOp(idx,opId,checked){
  const d=S.descriptions[idx];
  if(!S.descriptionOps[d])S.descriptionOps[d]=[];
  if(checked){if(!S.descriptionOps[d].includes(opId))S.descriptionOps[d].push(opId);}
  else{S.descriptionOps[d]=S.descriptionOps[d].filter(x=>x!==opId);}
  saveDescriptionOps();
  // não faz render para não fechar o <details>
}
function addDescription(){
  const v=q('#new-desc')?.value.trim(),err=q('#desc-err');
  if(!v){if(err)err.textContent='Digite a descrição.';return;}
  if(S.descriptions.map(x=>x.toLowerCase()).includes(v.toLowerCase())){if(err)err.textContent='Já cadastrada.';return;}
  // Coleta operações selecionadas
  const allOpsForTag=[...OPS,...S.customOps].filter(o=>!o.wide||o.id==='entre_bancos');
  const ops=allOpsForTag.filter(o=>q(`#new-desc-op-${o.id}`)?.checked).map(o=>o.id);
  S.descriptions.push(v);
  if(ops.length)S.descriptionOps[v]=ops;
  saveDescriptions();saveDescriptionOps();render();
}
function deleteDescription(i){
  if(!confirm(`Remover "${S.descriptions[i]}"?`))return;
  const d=S.descriptions[i];
  S.descriptions.splice(i,1);
  delete S.descriptionOps[d];
  saveDescriptions();saveDescriptionOps();render();
}

// ─── Retorna descrições filtradas pela operação selecionada ───────────────────
function getDescriptionsForOp(opId){
  if(!opId)return S.descriptions;
  return S.descriptions.filter(d=>{
    const ops=S.descriptionOps[d];
    if(!ops||ops.length===0){
      // fallback: usa mapeamento padrão
      const defOps=OP_DESCRIPTIONS_DEFAULT[opId]||[];
      return defOps.includes(d);
    }
    return ops.includes(opId);
  });
}

// ─── OPERAÇÕES ADMIN ─────────────────────────────────────────────────────────
function admOperacoes(){
  const allOps=[...OPS,...S.customOps];
  const opCards=allOps.map(op=>{
    const isCustom=!!S.customOps.find(o=>o.id===op.id);
    const iconEl=op.iconUrl?`<img src="${op.iconUrl}" style="width:40px;height:40px;object-fit:contain"/>`:opImg(op.id,'40px');
    return`<div class="card" style="display:flex;align-items:center;gap:14px;padding:14px;border-left:4px solid ${op.color||'var(--accent)'}">
      <div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:var(--card2);border-radius:10px;flex-shrink:0">${iconEl}</div>
      <div style="flex:1"><div style="font-weight:700;font-size:14px;color:var(--text)">${esc(op.label)}</div><div style="font-size:11px;color:var(--muted);margin-top:2px">ID: ${op.id} ${isCustom?'· <span style="color:var(--accent)">Personalizada</span>':'· <span style="color:var(--muted)">Padrão</span>'}</div></div>
      ${isCustom?`<button class="btn btn-danger btn-sm" onclick="deleteCustomOp('${op.id}')">Remover</button>`:'<span style="font-size:11px;color:var(--muted)">Padrão</span>'}
    </div>`;
  }).join('');
  const isUploading=S.uploadingIcon;
  const previewIcon=S.opForm.iconUrl?`<img src="${S.opForm.iconUrl}" style="width:48px;height:48px;object-fit:contain;border-radius:8px;border:1px solid var(--border)"/>`:
    `<div style="width:48px;height:48px;background:var(--card2);border:2px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px">🖼️</div>`;
  const formHtml=`<div class="card" style="max-width:480px;margin-bottom:24px">
    <div style="color:var(--accent);font-weight:700;margin-bottom:16px;font-size:15px">+ Nova Operação</div>
    <div class="field"><label class="label">Nome da Operação *</label><input id="op-label" class="inp" placeholder="Ex: Comissão, Imposto, etc." value="${esc(S.opForm.label||'')}"/></div>
    <div class="field"><label class="label">Cor de destaque *</label><div style="display:flex;align-items:center;gap:10px"><input id="op-color" type="color" value="${S.opForm.color||'#C8961C'}" style="width:44px;height:36px;border:none;background:none;cursor:pointer;padding:0"/><span style="font-size:12px;color:var(--muted)">Escolha uma cor para esta operação</span></div></div>
    <div class="field"><label class="label">Ícone * <span style="color:var(--danger);font-size:11px">(obrigatório)</span></label>
      <div style="display:flex;align-items:center;gap:12px">
        ${previewIcon}
        <div>
          <button class="btn btn-ghost btn-sm" onclick="q('#op-icon-file').click()" ${isUploading?'disabled':''} style="${isUploading?'opacity:.5':''}">
            ${isUploading?'⏳ Enviando...':'📤 Carregar imagem'}
          </button>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">PNG/JPG · max 2MB</div>
          ${S.opForm.iconUrl?`<div style="font-size:11px;color:var(--success);margin-top:2px">✓ Ícone carregado!</div>`:''}
        </div>
      </div>
      <input id="op-icon-file" type="file" accept="image/png,image/jpeg,image/webp" style="display:none" onchange="uploadOpIcon(this)"/>
    </div>
    <p id="op-err" class="err"></p>
    <div class="row"><button class="btn btn-acc" onclick="saveCustomOp()" ${isUploading?'disabled':''}>Salvar Operação</button><button class="btn btn-ghost" onclick="S.opForm={};render()">Limpar</button></div>
  </div>`;
  return`<div>${formHtml}<div class="section-title" style="margin-bottom:12px">Todas as Operações (${allOps.length})</div><div style="display:flex;flex-direction:column;gap:8px;max-width:600px">${opCards}</div></div>`;
}
async function uploadOpIcon(input){
  const file=input.files[0];if(!file)return;
  if(file.size>2*1024*1024){alert('Arquivo muito grande. Máximo 2MB.');return;}
  S.opForm={...S.opForm,label:q('#op-label')?.value||S.opForm.label||'',color:q('#op-color')?.value||S.opForm.color||'#C8961C'};
  S.uploadingIcon=true;render();
  try{
    const fd=new FormData();fd.append('file',file);fd.append('upload_preset','o5v89u2z');
    const res=await fetch('https://api.cloudinary.com/v1_1/dk10wezy9/image/upload',{method:'POST',body:fd});
    const data=await res.json();
    if(data.secure_url)S.opForm={...S.opForm,iconUrl:data.secure_url};
    else alert('Erro ao enviar ícone: '+(data.error?.message||'tente novamente'));
  }catch{alert('Erro de conexão ao enviar ícone.');}
  S.uploadingIcon=false;render();
}
function saveCustomOp(){
  const label=(q('#op-label')?.value||S.opForm.label||'').trim();
  const color=q('#op-color')?.value||S.opForm.color||'#C8961C';
  const iconUrl=S.opForm.iconUrl||'';
  S.opForm={...S.opForm,label,color};
  const err=q('#op-err');
  if(!label){if(err)err.textContent='Informe o nome da operação.';return;}
  if(!iconUrl){if(err)err.textContent='O ícone é obrigatório. Carregue uma imagem.';return;}
  const id='op_'+uid();
  S.customOps.push({id,label,color,iconUrl,createdAt:new Date().toISOString()});
  S.opForm={};saveCustomOps();render();
}
function deleteCustomOp(id){if(!confirm('Remover esta operação personalizada?'))return;S.customOps=S.customOps.filter(o=>o.id!==id);saveCustomOps();render();}

// ─── GOOGLE SHEETS API ────────────────────────────────────────────────────────
async function sheetsReq(method, path, body){
  if(!S.googleToken){alert('Faça login com Google novamente para usar o Sheets.');return null;}
  try{
    const res=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}${path}`,{
      method,
      headers:{'Authorization':`Bearer ${S.googleToken}`,'Content-Type':'application/json'},
      body:body?JSON.stringify(body):undefined
    });
    if(res.status===401){S.googleToken='';alert('Token do Google expirado. Faça logout e login novamente.');return null;}
    return res.ok?res.json():null;
  }catch(e){console.error('Sheets API error',e);return null;}
}
async function sheetsGetTabs(){
  const data=await sheetsReq('GET','?fields=sheets.properties');
  return data?.sheets?.map(s=>s.properties)||[];
}
async function sheetsEnsureTab(name){
  const tabs=await sheetsGetTabs();
  if(!tabs)return false;
  const exists=tabs.find(t=>t.title===name);
  if(!exists){
    const res=await sheetsReq('POST',':batchUpdate',{requests:[{addSheet:{properties:{title:name}}}]});
    if(!res)return false;
    const newId=res.replies?.[0]?.addSheet?.properties?.sheetId;
    // Headers
    await sheetsReq('PUT',`/values/${encodeURIComponent(name)}!A1:F1?valueInputOption=USER_ENTERED`,{
      values:[['Data','Operação','Valor (R$)','Banco','Descrição','Comprovante']]
    });
    // Format header bold + freeze
    if(newId!==undefined){
      await sheetsReq('POST',':batchUpdate',{requests:[
        {repeatCell:{range:{sheetId:newId,startRowIndex:0,endRowIndex:1,startColumnIndex:0,endColumnIndex:6},cell:{userEnteredFormat:{textFormat:{bold:true},backgroundColor:{red:.78,green:.59,blue:.11}}},fields:'userEnteredFormat'}},
        {updateSheetProperties:{properties:{sheetId:newId,gridProperties:{frozenRowCount:1}},fields:'gridProperties.frozenRowCount'}}
      ]});
    }
  }
  return true;
}
async function sheetsSyncClient(client){
  const name=client.razaoSocial;
  const ok=await sheetsEnsureTab(name);
  if(!ok)return false;
  // Clear existing data (keep header)
  await sheetsReq('POST',`/values/${encodeURIComponent(name)}!A2:F:clear`,{});
  // Write transactions
  const txs=(S.txMap[client.id]||[]).slice().sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  if(txs.length){
    const values=txs.map(t=>[
      fmtDate(t.date),
      getOp(t.operation)?.label||t.operation,
      Number(t.valor||0),
      t.banco||'',
      t.descricao||'',
      t.comprovante||''
    ]);
    await sheetsReq('PUT',`/values/${encodeURIComponent(name)}!A2?valueInputOption=USER_ENTERED`,{values,majorDimension:'ROWS'});
  }
  return true;
}
async function syncAllToSheets(){
  if(!S.googleToken){alert('Token do Google não encontrado. Faça logout e login novamente.');return;}
  S.sheetsStatus='syncing';render();
  let ok=0,fail=0;
  for(const client of S.clients){
    const res=await sheetsSyncClient(client);
    res?ok++:fail++;
  }
  S.sheetsStatus=fail===0?'ok':'error';render();
  setTimeout(()=>{S.sheetsStatus='';render();},3000);
}
async function sheetsCreateClientTab(client){
  if(!S.googleToken)return; // silencioso se não tiver token ainda
  await sheetsEnsureTab(client.razaoSocial);
}

// ─── MENSAGENS ───────────────────────────────────────────────────────────────
const msgIcon=(badge='',size='28px')=>`<span style="position:relative;display:inline-flex;align-items:center;justify-content:center"><img src="${MSG_ICON}" style="width:${size};height:${size};object-fit:contain"/>${badge?`<span style="position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;border-radius:50%;width:17px;height:17px;display:flex;align-items:center;justify-content:center;line-height:1">${badge}</span>`:''}</span>`;

// Retorna msgs não lidas do cliente (enviadas após o lastRead dele)
function unreadMsgs(clientId){
  const lastRead=S.msgRead[clientId]||'';
  const msgs=Array.isArray(S.messages)?S.messages:[];
  return msgs.filter(m=>m.sentAt>lastRead);
}
// Admin: tela de mensagens universal
function admMensagens(){
  const remaining=500-(S.msgText?.length||0);
  const msgs=(Array.isArray(S.messages)?S.messages:[]).slice().sort((a,b)=>b.sentAt.localeCompare(a.sentAt));
  const rows=msgs.map(m=>`<div class="card" style="margin-bottom:10px;border-left:3px solid var(--accent);max-width:640px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
      <div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${new Date(m.sentAt).toLocaleString('pt-BR')} · <span style="color:var(--accent)">Todos os clientes</span></div>
        <div style="font-size:14px;color:var(--text);line-height:1.6;white-space:pre-wrap">${esc(m.text)}</div>
      </div>
      <button onclick="deleteMsg('${m.id}')" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:16px;flex-shrink:0;padding:0" title="Excluir mensagem">×</button>
    </div>
  </div>`).join('');
  return`<div style="max-width:700px">
    <div class="card" style="margin-bottom:20px">
      <div style="color:var(--accent);font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">${msgIcon('','22px')} Nova Mensagem</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:10px;padding:8px;background:var(--card2);border-radius:7px">📢 Esta mensagem será enviada para <strong style="color:var(--text)">todos os clientes</strong>, incluindo os que forem cadastrados futuramente.</div>
      <div class="field">
        <textarea id="msg-txt" class="inp" rows="5" maxlength="500" style="resize:none;font-size:14px;line-height:1.5" placeholder="Digite sua mensagem..." oninput="S.msgText=this.value;updateMsgCount()">${esc(S.msgText||'')}</textarea>
        <div style="text-align:right;font-size:11px;color:${remaining<50?'var(--danger)':'var(--muted)'};margin-top:4px"><span id="msg-count">${remaining}</span> caracteres restantes</div>
      </div>
      <button class="btn btn-acc" style="padding:12px 24px" onclick="sendBroadcastMsg()">${msgIcon('','18px')} &nbsp;Enviar para todos</button>
    </div>
    <div class="section-title" style="margin-bottom:12px">Mensagens enviadas (${msgs.length})</div>
    ${msgs.length?rows:'<div style="color:var(--muted);font-size:13px">Nenhuma mensagem enviada ainda.</div>'}
  </div>`;
}
function updateMsgCount(){const el=document.getElementById('msg-count');if(el)el.textContent=500-(document.getElementById('msg-txt')?.value?.length||0);}
async function sendBroadcastMsg(){
  const text=(document.getElementById('msg-txt')?.value||'').trim();
  if(!text){alert('Digite uma mensagem.');return;}
  if(!Array.isArray(S.messages))S.messages=[];
  S.messages.unshift({id:uid(),text,sentAt:new Date().toISOString()});
  S.msgText='';render();await saveMessages();
}
async function deleteMsg(id){
  if(!confirm('Excluir esta mensagem?'))return;
  S.messages=(Array.isArray(S.messages)?S.messages:[]).filter(m=>m.id!==id);
  render();await saveMessages();
}
// Cliente: marca todas como lidas (salva timestamp)
async function markAllRead(){
  const cid=S.session?.clientId;if(!cid)return;
  if(!S.msgRead)S.msgRead={};
  S.msgRead[cid]=new Date().toISOString();
  saveMsgRead();
}
// Cliente: tela de mensagens
function screenMensagens(){
  const cid=S.session?.clientId;
  const msgs=(Array.isArray(S.messages)?S.messages:[]).slice().sort((a,b)=>b.sentAt.localeCompare(a.sentAt));
  markAllRead();
  const rows=msgs.map(m=>`<div class="card" style="margin-bottom:10px;border-left:3px solid var(--accent)">
    <div style="font-size:11px;color:var(--muted);margin-bottom:8px">${new Date(m.sentAt).toLocaleString('pt-BR')}</div>
    <div style="font-size:14px;color:var(--text);line-height:1.6;white-space:pre-wrap">${esc(m.text)}</div>
  </div>`).join('');
  return`<div class="screen">
    <h3 style="color:var(--text);margin-bottom:16px;font-size:17px">Mensagens</h3>
    ${msgs.length?rows:'<div class="empty" style="padding-top:60px"><div style="font-size:48px;margin-bottom:12px">💬</div><div style="color:var(--muted);font-size:14px">Nenhuma mensagem ainda.</div></div>'}
  </div>`;
}

// ─── CHARTS ADMIN ────────────────────────────────────────────────────────────
function buildAdminCharts(){
  const isLight=document.body.classList.contains('light');
  const tc=isLight?'#6b7280':'#888';const gc=isLight?'#e5e7eb':'#2e2e2e';
  const bCanvas=q('#adm-chart-bar'),pCanvas=q('#adm-chart-pie');
  const tx=allTx();
  if(tx.length&&bCanvas){const g={};tx.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');const k=`${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;if(!g[k])g[k]={R:0,D:0};if(t.operation==='receita')g[k].R+=t.valor;else if(isNeg(t.operation))g[k].D+=t.valor;});const keys=Object.keys(g).sort();S.charts.admBar=new Chart(bCanvas,{type:'bar',data:{labels:keys,datasets:[{label:'Receita',data:keys.map(k=>g[k].R),backgroundColor:'#10b981',borderRadius:4},{label:'Despesa',data:keys.map(k=>g[k].D),backgroundColor:'#ef4444',borderRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:tc,font:{size:11}}}},scales:{x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10},callback:v=>v>=1000?`${(v/1000).toFixed(0)}k`:v},grid:{color:gc}}}}});}
  if(tx.length&&pCanvas){const g={};tx.forEach(t=>{if(!g[t.operation])g[t.operation]=0;g[t.operation]+=t.valor;});const e=Object.entries(g);S.charts.admPie=new Chart(pCanvas,{type:'doughnut',data:{labels:e.map(([id])=>getOp(id)?.label||id),datasets:[{data:e.map(([,v])=>v),backgroundColor:e.map((_,i)=>PC[i%PC.length]),borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:tc,font:{size:10},padding:8,boxWidth:10}}}}});}
  const cBar=q('#cl-chart-bar'),cPie=q('#cl-chart-pie');
  if(S.viewClientId&&cBar){const txs=S.txMap[S.viewClientId]||[];if(txs.length){const g={};txs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');const k=`${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;if(!g[k])g[k]={R:0,D:0};if(t.operation==='receita')g[k].R+=t.valor;else if(isNeg(t.operation))g[k].D+=t.valor;});const keys=Object.keys(g).sort();S.charts.cBar=new Chart(cBar,{type:'bar',data:{labels:keys,datasets:[{label:'Receita',data:keys.map(k=>g[k].R),backgroundColor:'#10b981',borderRadius:4},{label:'Despesa',data:keys.map(k=>g[k].D),backgroundColor:'#ef4444',borderRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:tc,font:{size:10}}}},scales:{x:{ticks:{color:tc,font:{size:9}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:9},callback:v=>v>=1000?`${(v/1000).toFixed(0)}k`:v},grid:{color:gc}}}}});const g2={};txs.forEach(t=>{if(!g2[t.operation])g2[t.operation]=0;g2[t.operation]+=t.valor;});const e2=Object.entries(g2);if(e2.length&&cPie)S.charts.cPie=new Chart(cPie,{type:'doughnut',data:{labels:e2.map(([id])=>getOp(id)?.label||id),datasets:[{data:e2.map(([,v])=>v),backgroundColor:e2.map((_,i)=>PC[i%PC.length]),borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:tc,font:{size:10},padding:6,boxWidth:10}}}}});}}
}

// ─── CLIENT PORTAL ───────────────────────────────────────────────────────────
function pageClient(){
  const client=getClient();if(!client){doLogout();return'';}
  const NAV=[{id:'painel',label:'Painel'},{id:'novo',label:'Lançamento'},{id:'historico',label:'Histórico'},{id:'mensagens',label:'Mensagens'}];
  const cid2=S.session?.clientId;const unread=unreadMsgs(cid2).length;
  const navBtns=NAV.map(n=>{const isMsgs=n.id==='mensagens';const icon=isMsgs?msgIcon(unread>0?String(unread):'',CFG.NAV_ICON_SIZE):navImg(n.id,CFG.NAV_ICON_SIZE);return`<button class="nav-btn ${S.clientTab===n.id?'active':''}" onclick="setClientTab('${n.id}')"><span class="nav-icon">${icon}</span>${n.label}</button>`;}).join('');
  const isLight=document.body.classList.contains('light');
  const themeIcon=isLight?'🌙':'☀️';
  const menuItems=NAV.map(n=>`<button class="menu-item ${S.clientTab===n.id?'active':''}" onclick="setClientTab('${n.id}');closeMenu()"><span class="menu-item-icon">${navImg(n.id,CFG.NAV_ICON_SIZE)}</span>${n.label}</button>`).join('');
  const menuHtml=S.menuOpen?`<div class="menu-overlay" onclick="closeMenu()"><div class="menu-drawer" onclick="event.stopPropagation()"><img src="${getLogo()}" style="height:36px;object-fit:contain;margin-bottom:20px" alt="SN" onerror="this.style.display='none'"/><div style="font-size:12px;color:var(--muted);margin-bottom:16px">${esc(client.razaoSocial)}</div>${menuItems}<div class="menu-spacer"><button class="menu-item" onclick="toggleTheme();closeMenu()"><span class="menu-item-icon">${themeIcon}</span>${isLight?'Tema escuro':'Tema claro'}</button><button class="menu-item menu-item-logout" onclick="doLogout()"><span class="menu-item-icon">🚪</span>Sair</button></div></div></div>`:'';
  // Overlay de edição de lançamento
  const editOverlay=S.editTxId?renderEditOverlay():'';
  let content='';
  switch(S.clientTab){
    case'painel':content=screenPainel();break;
    case'novo':content=screenNovo();break;
    case'historico':content=screenHistorico();break;
    case'mensagens':content=screenMensagens();break;
    case'lista':content=screenLista();break;
    case'grafico':content=screenGrafico();break;
    case'tipos':content=screenTipos();break;
  }
  if(S.clientTab==='painel'){
    const sideItems=NAV.map(n=>{const isMsgs=n.id==='mensagens';const icon=isMsgs?msgIcon(unread>0?String(unread):'',CFG.NAV_ICON_SIZE):navImg(n.id,CFG.NAV_ICON_SIZE);return`<button class="sidebar-item ${S.clientTab===n.id?'active':''}" onclick="setClientTab('${n.id}')"><span style="display:inline-flex;align-items:center;margin-right:8px">${icon}</span>${n.label}</button>`;}).join('');
    return`<div class="admin-wrap"><aside class="admin-sidebar"><div class="sidebar-logo"><img src="${getLogo()}" alt="SN" onerror="this.style.display='none'"/></div><div class="sidebar-user"><div class="sidebar-user-label">Cliente</div><div class="sidebar-user-name">${esc(client.razaoSocial)}</div></div><nav class="sidebar-nav">${sideItems}</nav><div class="sidebar-footer"><button class="theme-btn btn-full" onclick="toggleTheme()" style="margin-bottom:8px;width:100%">${themeIcon} ${isLight?'Tema escuro':'Tema claro'}</button><button class="btn btn-ghost btn-full btn-sm" onclick="doLogout()">Sair</button></div></aside><main class="admin-main" style="overflow-y:auto;height:100vh">${content}</main></div>${editOverlay}`;
  }
  return`<div class="page"><div class="topbar"><img src="${getLogo()}" class="topbar-logo" alt="SN" onerror="this.style.display='none'"/><span class="topbar-title">${esc(client.razaoSocial)}</span><button style="background:none;border:none;cursor:pointer;padding:4px;position:relative" onclick="setClientTab('mensagens')" title="Mensagens">${msgIcon(unread>0?String(unread):'','26px')}</button><button class="theme-btn" onclick="toggleTheme()" title="Alternar tema" style="margin-right:4px">${themeIcon}</button><button class="menu-btn" onclick="toggleMenu()">☰</button></div>${menuHtml}<div style="padding-bottom:68px">${content}</div><nav class="bottom-nav">${navBtns}</nav></div>${editOverlay}`;
}
function setClientTab(t){S.clientTab=t;S.menuOpen=false;render();}
function toggleMenu(){S.menuOpen=!S.menuOpen;render();}
function closeMenu(){S.menuOpen=false;render();}

// ─── PAINEL DO CLIENTE ────────────────────────────────────────────────────────
function printRelatorio(){
  const client=getClient();const txs=getClientTx();const mes=S.clientPeriod||'';
  const filtered=mes?txs.filter(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===mes;}):txs;
  const rec=filtered.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);
  const desp=filtered.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const saldo=rec-desp;
  const rows=filtered.map(t=>{const op=getOp(t.operation);return`<tr><td>${fmtDate(t.date)}</td><td>${op?.label||t.operation}</td><td>${esc(t.descricao)}</td><td>${esc(t.banco)}</td><td style="text-align:right;font-weight:600;color:${isNeg(t.operation)?'#ef4444':'#10b981'}">${isNeg(t.operation)?'−':'+'}${fmtCur(t.valor)}</td></tr>`;}).join('');
  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório - ${esc(client.razaoSocial)}</title><style>
  @page{margin:14mm 12mm;size:A4}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;color:#111;position:relative;min-height:100vh;background:#fff}
  body::before{content:'';position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:70%;max-width:480px;aspect-ratio:1;background:url('https://res.cloudinary.com/dk10wezy9/image/upload/v1777242151/Solu%C3%A7%C3%B5es_Cont%C3%A1beis_2_qs2rrv.png') no-repeat center/contain;opacity:.07;pointer-events:none;z-index:0}
  .wrap{position:relative;z-index:1;padding:24px 28px}
  .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:2px solid #B8960C;margin-bottom:18px}
  .header-logo{height:54px;object-fit:contain}
  .header-info{text-align:right}
  .header-info h1{font-size:17px;font-weight:700;color:#B8960C}
  .header-info p{font-size:11px;color:#666;margin-top:3px}
  .client-box{background:#fdfaf2;border:1px solid #e5d89a;border-radius:8px;padding:12px 16px;margin-bottom:18px;font-size:12px;color:#555;line-height:1.7}
  .client-box strong{color:#111;font-size:13px}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:18px}
  th{background:#B8960C;color:#fff;padding:8px 10px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
  td{padding:7px 10px;border-bottom:1px solid #f0f0f0;vertical-align:top}
  tr:nth-child(even) td{background:#fafafa}
  tr:last-child td{border-bottom:none}
  .totais{background:#f9f6ee;border:1px solid #e5d89a;border-radius:8px;padding:12px 16px;text-align:right;font-size:13px}
  .totais span{margin-left:24px;display:inline-block}
  .footer{margin-top:24px;padding-top:10px;border-top:1px solid #eee;font-size:10px;color:#aaa;text-align:center}
  .btn-print{margin-top:20px;padding:10px 24px;background:#B8960C;color:#fff;border:none;border-radius:7px;font-size:14px;font-weight:700;cursor:pointer;font-family:Arial}
  @media print{
    .btn-print{display:none}
    body::before{opacity:.06;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    th{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
</style></head><body>
<div class="wrap">
  <div class="header">
    <img class="header-logo" src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777242151/Solu%C3%A7%C3%B5es_Cont%C3%A1beis_2_qs2rrv.png" alt="SN Soluções Contábeis" onerror="this.style.display='none'"/>
    <div class="header-info">
      <h1>Relatório de Lançamentos</h1>
      <p>Gerado em ${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</p>
    </div>
  </div>
  <div class="client-box">
    <strong>${esc(client.razaoSocial)}</strong><br/>
    CNPJ: ${esc(client.cnpj)} &nbsp;·&nbsp; ${mes?'Período: '+mes:'Todos os lançamentos'}
  </div>
  <table>
    <thead><tr><th>Data</th><th>Operação</th><th>Descrição</th><th>Banco</th><th style="text-align:right">Valor</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totais">
    <span>Receitas: <strong style="color:#10b981">${fmtCur(rec)}</strong></span>
    <span>Despesas: <strong style="color:#ef4444">${fmtCur(desp)}</strong></span>
    <span>Saldo: <strong style="color:${saldo>=0?'#10b981':'#ef4444'}">${fmtCur(saldo)}</strong></span>
  </div>
  <div class="footer">SN Soluções Contábeis · Sistema de Gestão Financeira</div>
  <br/><button class="btn-print" onclick="window.print()">🖨️ Imprimir</button>
</div>
</body></html>`);
  w.document.close();w.focus();setTimeout(()=>w.print(),400);
}
function toggleMonth(m){
  const idx=S.selectedMonths.indexOf(m);
  if(idx>=0)S.selectedMonths.splice(idx,1);
  else S.selectedMonths.push(m);
  render();
}
function toggleYear(y){
  const allTxs=getClientTx();
  const monthSet=new Set();allTxs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');monthSet.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);});
  const yearMonths=[...monthSet].filter(m=>m.startsWith(y+'-'));
  const allSel=yearMonths.length>0&&yearMonths.every(m=>S.selectedMonths.includes(m));
  if(allSel){
    S.selectedMonths=S.selectedMonths.filter(m=>!m.startsWith(y+'-'));
  }else{
    yearMonths.forEach(m=>{if(!S.selectedMonths.includes(m))S.selectedMonths.push(m);});
  }
  render();
}
function selectAllMonths(months){S.selectedMonths=[...months];render();}
function clearMonths(){S.selectedMonths=[];render();}
function toggleSlicerOpen(){S.slicerOpen=!S.slicerOpen;render();}

function renderPeriodSlicer(months){
  const MN=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const monthLabel=m=>{const[y,mo]=m.split('-');return MN[parseInt(mo)-1];};
  // Group by year
  const yearMap={};
  months.forEach(m=>{const y=m.split('-')[0];if(!yearMap[y])yearMap[y]=[];yearMap[y].push(m);});
  const years=Object.keys(yearMap).sort().reverse();
  const totalSel=S.selectedMonths.length;
  const label=totalSel===0?'Todos os meses':totalSel===1?`${MN[parseInt(S.selectedMonths[0].split('-')[1])-1]}/${S.selectedMonths[0].split('-')[0]}`:`${totalSel} meses selecionados`;
  const allChecked=months.every(m=>S.selectedMonths.includes(m));
  const panelHtml=S.slicerOpen?`
    <div style="position:absolute;top:100%;left:0;z-index:100;min-width:220px;max-width:280px;background:var(--card);border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.35);overflow:hidden;margin-top:4px">
      <div style="padding:8px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;background:var(--card2)">
        <input type="checkbox" ${allChecked?'checked':''} onchange="allChecked?clearMonths():selectAllMonths(${JSON.stringify(months)})" style="accent-color:var(--accent);width:15px;height:15px;cursor:pointer"/>
        <span style="font-size:13px;font-weight:600;color:var(--text)">Selecionar tudo</span>
      </div>
      <div style="max-height:280px;overflow-y:auto">
        ${years.map(y=>{
          const yMonths=yearMap[y];
          const allYearSel=yMonths.every(m=>S.selectedMonths.includes(m));
          const someYearSel=yMonths.some(m=>S.selectedMonths.includes(m));
          return`<div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--card2);border-bottom:1px solid var(--border);cursor:pointer" onclick="toggleYear('${y}')">
              <input type="checkbox" ${allYearSel?'checked':someYearSel?'indeterminate':''} ${someYearSel&&!allYearSel?`style="accent-color:var(--accent);width:14px;height:14px;opacity:.6"`:`style="accent-color:var(--accent);width:14px;height:14px"`} onclick="event.stopPropagation()" onchange="toggleYear('${y}')"/>
              <span style="font-size:13px;font-weight:700;color:var(--text)">${y}</span>
              <span style="font-size:11px;color:var(--muted);margin-left:auto">${yMonths.filter(m=>S.selectedMonths.includes(m)).length}/${yMonths.length}</span>
            </div>
            ${yMonths.map(m=>{
              const sel=S.selectedMonths.includes(m);
              return`<div style="display:flex;align-items:center;gap:10px;padding:7px 12px 7px 28px;border-bottom:1px solid var(--border);cursor:pointer;background:${sel?'rgba(200,150,28,.06)':''}" onclick="toggleMonth('${m}')">
                <input type="checkbox" ${sel?'checked':''} style="accent-color:var(--accent);width:14px;height:14px;pointer-events:none"/>
                <span style="font-size:13px;color:var(--text)">${monthLabel(m)}</span>
                <span style="font-size:11px;color:var(--muted);margin-left:auto">${m.split('-')[0]}</span>
              </div>`;
            }).join('')}
          </div>`;
        }).join('')}
      </div>
      <div style="padding:8px 12px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:6px;background:var(--card2)">
        <button onclick="clearMonths()" style="font-size:12px;padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--card);color:var(--muted);cursor:pointer;font-family:inherit">Limpar</button>
        <button onclick="toggleSlicerOpen()" style="font-size:12px;padding:4px 12px;border-radius:6px;border:none;background:var(--accent);color:#000;font-weight:700;cursor:pointer;font-family:inherit">OK</button>
      </div>
    </div>`:'';
  return`<div style="position:relative;margin-bottom:16px">
    <button onclick="toggleSlicerOpen()" style="display:flex;align-items:center;gap:8px;padding:9px 14px;background:var(--card);border:1px solid ${S.slicerOpen?'var(--accent)':totalSel>0?'var(--accent)':'var(--border)'};border-radius:8px;cursor:pointer;font-family:inherit;font-size:13px;color:var(--text);min-width:200px;justify-content:space-between;transition:border-color .15s">
      <span style="display:flex;align-items:center;gap:7px"><span style="font-size:16px">📅</span><span style="font-weight:${totalSel>0?'600':'400'};color:${totalSel>0?'var(--accent)':'var(--muted)'}">${label}</span></span>
      <span style="color:var(--muted);font-size:11px">${S.slicerOpen?'▲':'▼'}</span>
    </button>
    ${totalSel>1?`<span style="position:absolute;top:-8px;right:-8px;background:var(--accent);color:#000;font-size:10px;font-weight:700;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center">${totalSel}</span>`:''}
    ${panelHtml}
    ${S.slicerOpen?`<div style="position:fixed;inset:0;z-index:99" onclick="toggleSlicerOpen()"></div>`:''}
  </div>`;
}

function screenPainel(){
  const client=getClient();const allTxs=getClientTx();
  const monthSet=new Set();allTxs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');monthSet.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);});
  const months=[...monthSet].sort().reverse();
  // Init: se nada selecionado, seleciona o mês mais recente
  if(S.selectedMonths.length===0&&months.length>0){S.selectedMonths=[months[0]];}
  // Remove meses que não existem mais nos dados
  S.selectedMonths=S.selectedMonths.filter(m=>monthSet.has(m));
  const allSelected=S.selectedMonths.length===0;
  const txs=allSelected?allTxs:allTxs.filter(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;return S.selectedMonths.includes(mk);});
  const rec=txs.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);
  const desp=txs.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const outros=txs.filter(t=>t.operation!=='receita'&&!isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const saldo=rec-desp;
  const MN=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const monthLabel=m=>{if(!m)return'';const[y,mo]=m.split('-');return`${MN[parseInt(mo)-1]} ${y}`;};
  // Slicer chips
  const chips=months.map(m=>{
    const sel=S.selectedMonths.includes(m);
    return`<button onclick="toggleMonth('${m}')" style="padding:5px 12px;border-radius:20px;border:1.5px solid ${sel?'var(--accent)':'var(--border)'};background:${sel?'var(--accent)':'var(--card2)'};color:${sel?'#000':'var(--muted)'};font-size:12px;font-weight:${sel?'700':'400'};cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .15s">${monthLabel(m)}</button>`;
  }).join('');
  const slicerLabel=S.selectedMonths.length===0?'Todos os meses':S.selectedMonths.length===1?monthLabel(S.selectedMonths[0]):`${S.selectedMonths.length} meses selecionados`;
  const kpis=[{img:`<img src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777141277/Total-lancamentos_raxtr6.png" style="width:${CFG.KPI_ICON_SIZE};height:${CFG.KPI_ICON_SIZE};object-fit:contain"/>`,val:txs.length,lbl:'Total Lançamentos',color:'#3b82f6'},{img:opImg('receita',CFG.KPI_ICON_SIZE),val:fmtCur(rec),lbl:'Receitas',color:'#10b981'},{img:opImg('despesa',CFG.KPI_ICON_SIZE),val:fmtCur(desp),lbl:'Despesas',color:'#ef4444'},{img:`<img src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777141665/Outros_aebx7k.png" style="width:${CFG.KPI_ICON_SIZE};height:${CFG.KPI_ICON_SIZE};object-fit:contain"/>`,val:fmtCur(outros),lbl:'Outros',color:'#C8961C'},{img:`<img src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777141052/Saldo_vfedtd.png" style="width:${CFG.KPI_ICON_SIZE};height:${CFG.KPI_ICON_SIZE};object-fit:contain"/>`,val:fmtCur(saldo),lbl:'Saldo',color:saldo>=0?'#10b981':'#ef4444'}].map(k=>`<div class="kpi-card" style="border-top-color:${k.color}"><div class="kpi-icon">${k.img}</div><div class="kpi-val" style="color:${k.color}">${k.val}</div><div class="kpi-lbl">${k.lbl}</div></div>`).join('');
  const opG={};txs.forEach(t=>{if(!opG[t.operation])opG[t.operation]={count:0,total:0};opG[t.operation].count++;opG[t.operation].total+=t.valor;});
  const opRows=Object.entries(opG).sort((a,b)=>b[1].total-a[1].total).map(([id,d])=>{const op=getOp(id);const neg=isNeg(id);return`<tr><td><span class="badge" style="background:${neg?'#ef444420':'#10b98120'};color:${neg?'#ef4444':'#10b981'}">${op?.label||id}</span></td><td>${d.count}</td><td style="color:${neg?'var(--danger)':'var(--success)'};font-weight:600">${fmtCur(d.total)}</td></tr>`;}).join('')||`<tr><td colspan="3" style="color:var(--muted);padding:16px">Sem dados.</td></tr>`;
  const recentRows=txs.slice().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,8).map(t=>{const op=getOp(t.operation);const neg=isNeg(t.operation);return`<div class="recent-item"><span class="recent-icon">${opImg(t.operation,CFG.OP_BADGE_SIZE)}</span><div class="recent-info"><div class="recent-name">${op?.label||t.operation}</div><div class="recent-meta">${esc(t.descricao||'sem descrição')} · ${fmtDate(t.date)}</div></div><span class="recent-val" style="color:${neg?'var(--danger)':'var(--success)'}">${neg?'−':'+'}${fmtCur(t.valor)}</span></div>`;}).join('')||`<div style="color:var(--muted);font-size:13px;padding:12px 0">Nenhum lançamento neste período.</div>`;
  return`
    ${(()=>{const cid=S.session?.clientId;const um=unreadMsgs(cid);return um.length?`<div style="background:rgba(200,150,28,.12);border:1px solid var(--accent);border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;cursor:pointer" onclick="setClientTab('mensagens')">${msgIcon(um.length,'24px')}<div><div style="font-weight:700;font-size:14px;color:var(--accent)">Você tem ${um.length} nova${um.length>1?'s':''} mensagem${um.length>1?'s':''}!</div><div style="font-size:12px;color:var(--muted);margin-top:2px">Toque para ler</div></div></div>`:''})()}
    <div class="admin-header">
      <div class="admin-header-left"><h1>Dashboard</h1><p>${esc(client.razaoSocial)} · ${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</p></div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="printRelatorio()">🖨️ Imprimir</button>
      </div>
    </div>
    <div class="admin-content">
      ${renderPeriodSlicer(months)}
      <div class="kpi-grid">${kpis}</div>
      <div class="charts-grid">
        <div class="chart-card"><div class="chart-title">Movimentações do Período</div><div class="chart-sub">Receitas vs Despesas por dia</div><canvas id="painel-chart-bar"></canvas></div>
        <div class="chart-card"><div class="chart-title">Por Tipo de Operação</div><div class="chart-sub">Distribuição do valor total</div><canvas id="painel-chart-pie"></canvas></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:24px">
        <div><div class="section-title" style="margin-bottom:12px">Últimos Lançamentos</div><div class="recent-list">${recentRows}</div></div>
        <div><div class="section-title" style="margin-bottom:12px">Por Operação</div><div class="tx-table-wrap"><table class="tx-table"><thead><tr><th>Tipo</th><th>Qtd</th><th>Total</th></tr></thead><tbody>${opRows}</tbody></table></div></div>
      </div>
    </div>`;
}

// ─── NOVO LANÇAMENTO ──────────────────────────────────────────────────────────
function screenNovo(){
  const op=S.selectedOp?getOp(S.selectedOp):null;
  const allOpsForGrid=[...OPS,...S.customOps];
  const opGrid=allOpsForGrid.filter(o=>!o.wide).map(o=>{const sel=S.selectedOp===o.id;return`<button class="op-btn ${sel?'active':''}" style="${sel?`border-color:${o.color};background:${o.color}20`:''}" onclick="selectOp('${o.id}')"><span class="op-icon">${opImg(o.id,CFG.OP_ICON_SIZE)}</span>${o.label}</button>`;}).join('');
  const entSel=S.selectedOp==='entre_bancos';
  const bankOpts=S.banks.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join('');
  // Descrições filtradas pela operação selecionada
  const filteredDescs=getDescriptionsForOp(S.selectedOp);
  const descOpts=filteredDescs.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('');
  const formHtml=op?`<div class="card" style="margin-top:8px">
    <div class="row" style="margin-bottom:16px"><span style="font-size:20px">${op.icon}</span><span style="color:${op.color};font-weight:700;font-size:15px">${op.label}</span></div>
    <div class="field"><label class="label">Valor *</label><div class="inp-icon"><span class="icon-left">R$</span><input id="f-valor" type="number" min="0" step="0.01" class="inp" placeholder="0,00" value="${S.txForm?.valor||''}"/></div></div>
    <div class="field"><label class="label">Descrição *</label>
      <div style="position:relative">
        <input id="f-desc" class="inp" placeholder="Digite para buscar ou escreva livremente..." value="${esc(S.txForm?.desc||S.descQuery||'')}" autocomplete="off"
          oninput="S.descQuery=this.value;const d=document.getElementById('desc-suggestions');if(d)d.style.display=this.value.length>0?'block':'none';filterDescSuggestions(this.value)"
          onfocus="filterDescSuggestions(this.value)"
          onkeydown="handleDescKey(event)"/>
        <div id="desc-suggestions" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:50;background:var(--card);border:1px solid var(--accent);border-top:none;border-radius:0 0 8px 8px;max-height:200px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,.3)">
          ${filteredDescs.map((d,i)=>`<div class="desc-sugg-item" data-val="${esc(d)}" onclick="pickDesc('${esc(d)}')" style="padding:10px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border);color:var(--text)" onmouseover="this.style.background='rgba(200,150,28,.12)'" onmouseout="this.style.background=''">${esc(d)}</div>`).join('')}
        </div>
      </div>
    </div>
    <div class="field"><label class="label">Comprovante</label>
      <div class="comp-btn ${S.uploadingComp?'has-file':S.comprovante?'has-file':''}" onclick="${S.uploadingComp?'':"q('#f-file').click()"}" style="${S.uploadingComp?'cursor:wait;opacity:.7':''}">
        ${S.uploadingComp?'⏳ Enviando comprovante...':S.comprovante?`<span style="display:flex;align-items:center;gap:8px;justify-content:center">📎 Comprovante anexado &nbsp;<a href="${S.comprovante}" target="_blank" onclick="event.stopPropagation()" style="color:var(--accent);font-size:12px;text-decoration:underline">Ver</a></span>`:'📷  Adicionar comprovante'}
      </div>
      <input id="f-file" type="file" accept="image/*" style="display:none" onchange="setComp(this)" ${S.uploadingComp?'disabled':''}/>
    </div>
    <div class="field"><label class="label">Banco *</label><div style="display:flex;align-items:center;gap:8px"><span id="b-prev" style="min-width:${CFG.BANK_ICON_SIZE}">${bankLogo(S._bprev||'',CFG.BANK_ICON_SIZE)}</span><div class="sel-wrap" style="flex:1"><select id="f-banco" class="sel ${S._bprev?'':'empty'}" onchange="updateBancoPreview(this)"><option value="">Selecione o banco</option>${bankOpts}</select><span class="sel-arr">▼</span></div></div></div>
    <div class="field"><label class="label">Complemento</label><input id="f-comp" class="inp" placeholder="Informação adicional (opcional)" value="${esc(S.txForm?.comp||'')}"/></div>
    <div class="field"><label class="label">Responsável</label><input id="f-resp" class="inp" placeholder="Nome do responsável (opcional)" value="${esc(S.txForm?.resp||'')}"/></div>
    <div class="row"><button class="btn btn-acc" style="flex:1;padding:12px;font-size:15px" onclick="saveTx()">💾 Salvar Lançamento</button><button class="btn btn-ghost" style="padding:12px" onclick="clearOp()">✕</button></div>
  </div>`:'';
  return`<div class="screen">${S.toast?'<div class="toast">✓ Lançamento salvo com sucesso!</div>':''}
    <div class="field"><label class="label">Data</label><div class="inp-icon"><input id="f-date" type="date" class="inp" value="${S.txDate||todayStr()}" style="padding-right:44px" onchange="S.txDate=this.value"/><span class="icon-right" style="font-size:20px">📅</span></div></div>
    <div class="field"><label class="label">Operações *</label><div class="ops-grid">${opGrid}</div><button class="op-wide ${entSel?'active':''}" style="${entSel?'border-color:#06b6d4;background:#06b6d4;color:#000;font-weight:700':''}" onclick="selectOp('entre_bancos')">${opImg('entre_bancos',CFG.OP_ICON_SIZE)} Entre bancos</button></div>
    ${formHtml}
  </div>`;
}
function selectOp(id){saveFormState();S.selectedOp=id;render();}
function clearOp(){S.selectedOp=null;S.comprovante='';S.uploadingComp=false;S.txForm={};S.descQuery='';S._bprev='';render();}
async function setComp(el){
  const file=el.files[0];if(!file)return;
  if(file.size>5*1024*1024){alert('Arquivo muito grande. Máximo 5MB.');return;}
  saveFormState();S.uploadingComp=true;S.comprovante='';render();
  try{
    const fd=new FormData();fd.append('file',file);fd.append('upload_preset','o5v89u2z');
    const res=await fetch('https://api.cloudinary.com/v1_1/dk10wezy9/image/upload',{method:'POST',body:fd});
    const data=await res.json();
    if(data.secure_url){S.comprovante=data.secure_url;}
    else{alert('Erro ao enviar comprovante. Tente novamente.');}
  }catch{alert('Erro de conexão ao enviar comprovante.');}
  S.uploadingComp=false;render();
}
function applyDescSel(sel){const inp=q('#f-desc');if(inp&&sel.value){inp.value=sel.value;}}
function filterDescSuggestions(query){
  const box=document.getElementById('desc-suggestions');if(!box)return;
  const descs=getDescriptionsForOp(S.selectedOp);
  const q2=(query||'').toLowerCase().trim();
  const filtered=q2?descs.filter(d=>d.toLowerCase().includes(q2)):descs;
  if(!filtered.length){box.style.display='none';return;}
  box.innerHTML=filtered.map(d=>`<div class="desc-sugg-item" data-val="${esc(d)}" onclick="pickDesc('${esc(d)}')" style="padding:10px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border);color:var(--text)" onmouseover="this.style.background='rgba(200,150,28,.12)'" onmouseout="this.style.background=''">${highlightMatch(d,q2)}</div>`).join('');
  box.style.display='block';
}
function highlightMatch(text,query){
  if(!query)return esc(text);
  const idx=text.toLowerCase().indexOf(query.toLowerCase());
  if(idx<0)return esc(text);
  return esc(text.slice(0,idx))+'<strong style="color:var(--accent)">'+esc(text.slice(idx,idx+query.length))+'</strong>'+esc(text.slice(idx+query.length));
}
function pickDesc(val){
  const inp=q('#f-desc');if(inp){inp.value=val;}
  S.descQuery=val;
  const box=document.getElementById('desc-suggestions');if(box)box.style.display='none';
}
function handleDescKey(e){
  const box=document.getElementById('desc-suggestions');if(!box||box.style.display==='none')return;
  const items=[...box.querySelectorAll('.desc-sugg-item')];
  const active=box.querySelector('.desc-sugg-active');
  let idx=items.indexOf(active);
  if(e.key==='ArrowDown'){e.preventDefault();if(active)active.classList.remove('desc-sugg-active');idx=Math.min(idx+1,items.length-1);items[idx]?.classList.add('desc-sugg-active');items[idx]?.scrollIntoView({block:'nearest'});}
  else if(e.key==='ArrowUp'){e.preventDefault();if(active)active.classList.remove('desc-sugg-active');idx=Math.max(idx-1,0);items[idx]?.classList.add('desc-sugg-active');items[idx]?.scrollIntoView({block:'nearest'});}
  else if(e.key==='Enter'){if(active){e.preventDefault();pickDesc(active.dataset.val);}}
  else if(e.key==='Escape'){box.style.display='none';}
}
function saveFormState(){const dv=q('#f-desc')?.value||'';S.descQuery=dv;S.txForm={valor:q('#f-valor')?.value||'',desc:dv,comp:q('#f-comp')?.value||'',resp:q('#f-resp')?.value||''}; }
function updateBancoPreview(sel){S._bprev=sel.value;sel.classList.remove('empty');const prev=q('#b-prev');if(prev)prev.innerHTML=bankLogo(sel.value,CFG.BANK_ICON_SIZE);}
async function saveTx(){
  const valor=parseFloat(q('#f-valor')?.value||0),desc=q('#f-desc')?.value.trim()||'',banco=q('#f-banco')?.value||'';
  if(!valor||valor<=0){alert('Informe um valor válido.');return;}
  if(!desc){alert('Preencha a descrição.');return;}
  if(!banco){alert('Selecione o banco.');return;}
  const cid=S.session.clientId;
  const tx={id:uid(),date:q('#f-date')?.value||todayStr(),operation:S.selectedOp,valor,descricao:desc,banco,complemento:q('#f-comp')?.value||'',responsavel:q('#f-resp')?.value||'',comprovante:S.comprovante,createdAt:new Date().toISOString()};
  if(!S.txMap[cid])S.txMap[cid]=[];
  S.txMap[cid].unshift(tx);
  S.selectedOp=null;S.comprovante='';S.txForm={};S._bprev='';S.toast=true;
  render();await saveTxMap();setTimeout(()=>{S.toast=false;render();},2500);
}

// ─── EDITAR LANÇAMENTO ────────────────────────────────────────────────────────
function editTx(txId){
  const cid=S.session.clientId;
  const tx=(S.txMap[cid]||[]).find(t=>t.id===txId);
  if(!tx)return;
  S.editTxId=txId;
  S.editTxForm={valor:tx.valor,desc:tx.descricao||'',banco:tx.banco||'',date:tx.date||todayStr(),comp:tx.complemento||'',resp:tx.responsavel||''};
  render();
}
function cancelEditTx(){S.editTxId=null;S.editTxForm={};render();}
async function saveEditTx(){
  const valor=parseFloat(q('#edit-valor')?.value||0);
  const desc=q('#edit-desc')?.value.trim()||'';
  const banco=q('#edit-banco')?.value||'';
  const date=q('#edit-date')?.value||todayStr();
  const comp=q('#edit-comp')?.value||'';
  const resp=q('#edit-resp')?.value||'';
  if(!valor||valor<=0){alert('Informe um valor válido.');return;}
  if(!desc){alert('Preencha a descrição.');return;}
  if(!banco){alert('Selecione o banco.');return;}
  const cid=S.session.clientId;
  S.txMap[cid]=(S.txMap[cid]||[]).map(t=>t.id===S.editTxId?{...t,valor,descricao:desc,banco,date,complemento:comp,responsavel:resp,editedAt:new Date().toISOString()}:t);
  S.editTxId=null;S.editTxForm={};
  render();await saveTxMap();
}
function renderEditOverlay(){
  const cid=S.session.clientId;
  const tx=(S.txMap[cid]||[]).find(t=>t.id===S.editTxId);
  if(!tx)return'';
  const op=getOp(tx.operation);
  const bankOpts=S.banks.map(b=>`<option value="${esc(b)}" ${b===S.editTxForm.banco?'selected':''}>${esc(b)}</option>`).join('');
  const filteredDescs=getDescriptionsForOp(tx.operation);
  const descOpts=filteredDescs.map(d=>`<option value="${esc(d)}" ${d===S.editTxForm.desc?'selected':''}>${esc(d)}</option>`).join('');
  return`<div class="edit-overlay" onclick="cancelEditTx()">
    <div class="edit-sheet" onclick="event.stopPropagation()">
      <div class="edit-sheet-title">
        <span>✏️ Editar Lançamento</span>
        <button onclick="cancelEditTx()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:20px;line-height:1">×</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:10px;background:var(--card2);border-radius:8px">
        ${opImg(tx.operation,'24px')}
        <span style="font-weight:600;color:${op?.color||'var(--accent)'}">${op?.label||tx.operation}</span>
        <span style="font-size:12px;color:var(--muted);margin-left:4px">· ${fmtDate(tx.date)}</span>
      </div>
      <div class="field"><label class="label">Data</label><input id="edit-date" type="date" class="inp" value="${S.editTxForm.date}"/></div>
      <div class="field"><label class="label">Valor *</label><div class="inp-icon"><span class="icon-left">R$</span><input id="edit-valor" type="number" min="0" step="0.01" class="inp" value="${S.editTxForm.valor}"/></div></div>
      <div class="field"><label class="label">Descrição *</label>
        <div class="sel-wrap" style="margin-bottom:6px"><select id="edit-desc-sel" class="sel" onchange="q('#edit-desc').value=this.value"><option value="">Selecione...</option>${descOpts}</select><span class="sel-arr">▼</span></div>
        <input id="edit-desc" class="inp" placeholder="Ou digite..." value="${esc(S.editTxForm.desc)}"/>
      </div>
      <div class="field"><label class="label">Banco *</label><div class="sel-wrap"><select id="edit-banco" class="sel"><option value="">Selecione o banco</option>${bankOpts}</select><span class="sel-arr">▼</span></div></div>
      <div class="field"><label class="label">Complemento</label><input id="edit-comp" class="inp" value="${esc(S.editTxForm.comp)}"/></div>
      <div class="field"><label class="label">Responsável</label><input id="edit-resp" class="inp" value="${esc(S.editTxForm.resp)}"/></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-acc" style="flex:1;padding:12px" onclick="saveEditTx()">💾 Salvar Alterações</button>
        <button class="btn btn-ghost" style="padding:12px" onclick="cancelEditTx()">Cancelar</button>
      </div>
    </div>
  </div>`;
}

// ─── LISTA ────────────────────────────────────────────────────────────────────
function screenLista(){
  const txs=getClientTx();const f=S.filters;
  const filtered=txs.filter(t=>{if(f.startDate&&t.date<f.startDate)return false;if(f.endDate&&t.date>f.endDate)return false;if(f.operation&&t.operation!==f.operation)return false;if(f.banco&&t.banco!==f.banco)return false;if(f.minVal&&t.valor<parseFloat(f.minVal))return false;if(f.maxVal&&t.valor>parseFloat(f.maxVal))return false;if(f.busca){const q2=f.busca.toLowerCase();if(![t.descricao,t.responsavel,t.complemento,t.banco].some(x=>x?.toLowerCase().includes(q2)))return false;}return true;});
  const saldo=filtered.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);
  const hasFilter=Object.values(f).some(Boolean);
  const allBancos=[...new Set(txs.map(t=>t.banco).filter(Boolean))];
  const is='width:100%;background:var(--inp-bg);border:1px solid var(--border);border-radius:7px;padding:8px 10px;color:var(--text);font-size:13px;font-family:inherit;outline:none';
  const allOpsFilter=[...OPS,...S.customOps];
  const filterPanel=S.filterOpen?`<div class="card" style="margin-bottom:16px"><div style="color:var(--accent);font-weight:700;margin-bottom:12px">← Filtro</div><div class="filter-grid"><div><label class="label">Data Inicial</label><input type="date" style="${is}" value="${f.startDate}" onchange="setFilter('startDate',this.value)"/></div><div><label class="label">Data Final</label><input type="date" style="${is}" value="${f.endDate}" onchange="setFilter('endDate',this.value)"/></div></div><div class="field"><label class="label">Operação</label><select style="${is};appearance:none" onchange="setFilter('operation',this.value)"><option value="">Todas</option>${allOpsFilter.map(o=>`<option value="${o.id}" ${f.operation===o.id?'selected':''}>${o.label}</option>`).join('')}</select></div><div class="field"><label class="label">Banco</label><select style="${is};appearance:none" onchange="setFilter('banco',this.value)"><option value="">Todos</option>${allBancos.map(b=>`<option value="${esc(b)}" ${f.banco===b?'selected':''}>${esc(b)}</option>`).join('')}</select></div><div class="filter-grid"><div><label class="label">Valor Mín.</label><input type="number" style="${is}" value="${f.minVal}" placeholder="0" onchange="setFilter('minVal',this.value)"/></div><div><label class="label">Valor Máx.</label><input type="number" style="${is}" value="${f.maxVal}" placeholder="∞" onchange="setFilter('maxVal',this.value)"/></div></div><div class="field"><label class="label">Busca</label><input style="${is}" value="${esc(f.busca)}" placeholder="Descrição, responsável..." onchange="setFilter('busca',this.value)"/></div><button class="btn btn-ghost btn-full" style="margin-top:4px;font-size:13px" onclick="clearFilters()">Limpar Filtros</button></div>`:'';
  const txCards=filtered.map(t=>{const op=getOp(t.operation);return`<div class="tx-card" style="border-left-color:${op?.color||'var(--accent)'}"><div class="tx-row"><div class="tx-left"><div class="tx-header">${opImg(t.operation,'20px')}<span class="tx-label">${op?.label||t.operation}</span><span class="tx-date">· ${fmtDate(t.date)}</span></div>${t.descricao?`<div class="tx-desc">${esc(t.descricao)}</div>`:''}<div class="tx-meta" style="display:flex;align-items:center;gap:4px">${bankLogo(t.banco,'18px')} ${esc(t.banco)}${t.responsavel?' · '+esc(t.responsavel):''}</div>${t.comprovante?`<div class="tx-comp"><a href="${t.comprovante}" target="_blank" style="color:var(--blue);text-decoration:none;font-size:12px">📎 Ver comprovante</a></div>`:''}</div><div class="tx-right"><span class="tx-val" style="color:${isNeg(t.operation)?'var(--danger)':'var(--success)'}">${isNeg(t.operation)?'−':'+'}${fmtCur(t.valor)}</span><div class="tx-actions"><button class="tx-edit-btn" onclick="editTx('${t.id}')">✏️ editar</button><button class="tx-del-btn" onclick="deleteTx('${t.id}')">🗑 excluir</button></div></div></div></div>`;}).join('');
  return`<div class="screen"><div class="row-spread" style="margin-bottom:12px"><h3 style="color:var(--text)">Lançamentos (${filtered.length})</h3><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="printRelatorio()">🖨️ Imprimir</button><button class="btn ${hasFilter?'btn-acc':'btn-ghost'} btn-sm" onclick="toggleFilter()">🔍 ${hasFilter?'Filtro ativo':'Filtro'}</button></div></div>${filterPanel}<div class="card summary" style="margin-bottom:12px"><span class="summary-lbl">Saldo do período</span><span class="summary-val" style="color:${saldo>=0?'var(--success)':'var(--danger)'}">${fmtCur(Math.abs(saldo))}</span></div>${filtered.length===0?'<div class="empty" style="padding-top:40px">Nenhum lançamento encontrado.</div>':txCards}</div>`;
}
function setFilter(k,v){S.filters[k]=v;render();}
function clearFilters(){S.filters={startDate:'',endDate:'',operation:'',banco:'',minVal:'',maxVal:'',busca:''};render();}
function toggleFilter(){S.filterOpen=!S.filterOpen;render();}
function deleteTx(id){if(!confirm('Excluir este lançamento?'))return;const cid=S.session.clientId;S.txMap[cid]=(S.txMap[cid]||[]).filter(t=>t.id!==id);saveTxMap();render();}

// ─── HISTÓRICO ────────────────────────────────────────────────────────────────
function screenHistorico(){
  const allTxs=getClientTx();
  const monthSet=new Set();allTxs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');monthSet.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);});
  const months=[...monthSet].sort().reverse();
  if(!S.histPeriod||!monthSet.has(S.histPeriod)){S.histPeriod=months[0]||'';}
  const txs=S.histPeriod?allTxs.filter(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===S.histPeriod;}):allTxs;
  const monthLabel=m=>{if(!m)return'';const[y,mo]=m.split('-');const names=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];return`${names[parseInt(mo)-1]} / ${y}`;};
  const monthOpts=months.length?months.map(m=>`<option value="${m}" ${m===S.histPeriod?'selected':''}>${monthLabel(m)}</option>`).join(''):'<option value="">Sem lançamentos</option>';
  const rec=txs.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);
  const desp=txs.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const outros=txs.filter(t=>t.operation!=='receita'&&!isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const saldo=rec-desp;
  const opG={};txs.forEach(t=>{if(!opG[t.operation])opG[t.operation]={count:0,total:0};opG[t.operation].count++;opG[t.operation].total+=t.valor;});
  const opCards=Object.entries(opG).sort((a,b)=>b[1].total-a[1].total).map(([id,d])=>{
    const op=getOp(id);const neg=isNeg(id);
    return`<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--card2);border-radius:10px;border-left:3px solid ${neg?'#ef4444':'#10b981'}">
      <div style="display:flex;align-items:center;gap:10px">${opImg(id,'28px')}<div><div style="font-weight:600;font-size:14px;color:var(--text)">${op?.label||id}</div><div style="font-size:12px;color:var(--muted)">${d.count} lançamento${d.count!==1?'s':''}</div></div></div>
      <span style="font-weight:700;font-size:15px;color:${neg?'var(--danger)':'var(--success)'}">${neg?'−':'+'}${fmtCur(d.total)}</span>
    </div>`;
  }).join('')||`<div style="color:var(--muted);font-size:13px;padding:16px 0">Nenhuma operação neste período.</div>`;
  const txRows=txs.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(t=>{
    const op=getOp(t.operation);const neg=isNeg(t.operation);
    return`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">${opImg(t.operation,'22px')}
        <div style="min-width:0"><div style="font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.descricao||op?.label||t.operation)}</div>
        <div style="font-size:11px;color:var(--muted)">${fmtDate(t.date)} · ${esc(t.banco||'—')}${t.comprovante?` · <a href="${t.comprovante}" target="_blank" style="color:var(--blue);text-decoration:none">📎 comprovante</a>`:''}</div></div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:8px">
        <div style="font-weight:700;font-size:14px;color:${neg?'var(--danger)':'var(--success)'}">${neg?'−':'+'}${fmtCur(t.valor)}</div>
        <button class="tx-edit-btn" style="font-size:11px" onclick="editTx('${t.id}')">✏️ editar</button>
      </div>
    </div>`;
  }).join('')||`<div style="color:var(--muted);padding:16px;font-size:13px">Nenhum lançamento neste período.</div>`;
  return`<div class="screen">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <h3 style="color:var(--text);font-size:17px">Histórico de Operações</h3>
      <div class="sel-wrap"><select class="sel" style="min-width:140px" onchange="S.histPeriod=this.value;render()">${monthOpts}</select><span class="sel-arr">▼</span></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:20px">
      <div class="card" style="text-align:center;padding:14px 10px;border-top:3px solid #10b981"><div style="font-size:11px;color:var(--muted);margin-bottom:4px">Receitas</div><div style="font-size:15px;font-weight:700;color:#10b981">${fmtCur(rec)}</div></div>
      <div class="card" style="text-align:center;padding:14px 10px;border-top:3px solid #ef4444"><div style="font-size:11px;color:var(--muted);margin-bottom:4px">Despesas</div><div style="font-size:15px;font-weight:700;color:#ef4444">${fmtCur(desp)}</div></div>
      <div class="card" style="text-align:center;padding:14px 10px;border-top:3px solid #C8961C"><div style="font-size:11px;color:var(--muted);margin-bottom:4px">Outros</div><div style="font-size:15px;font-weight:700;color:#C8961C">${fmtCur(outros)}</div></div>
      <div class="card" style="text-align:center;padding:14px 10px;border-top:3px solid ${saldo>=0?'#10b981':'#ef4444'}"><div style="font-size:11px;color:var(--muted);margin-bottom:4px">Saldo</div><div style="font-size:15px;font-weight:700;color:${saldo>=0?'#10b981':'#ef4444'}">${fmtCur(saldo)}</div></div>
    </div>
    <div class="section-title" style="margin-bottom:12px">Por Tipo de Operação</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">${opCards}</div>
    <div class="section-title" style="margin-bottom:12px">Todos os Lançamentos (${txs.length})</div>
    <div class="card" style="padding:0;overflow:hidden">${txRows}</div>
  </div>`;
}

// ─── GRÁFICO / TIPOS ──────────────────────────────────────────────────────────
function screenGrafico(){const txs=getClientTx();if(!txs.length)return'<div class="empty"><div class="empty-icon"></div>Nenhum lançamento para exibir.</div>';const rec=txs.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);const desp=txs.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);const saldo=txs.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);return`<div class="screen"><div class="row-spread" style="margin-bottom:14px"><h3 style="color:var(--text)">Demonstração de Resultados</h3><div class="period-toggle"><button class="btn ${S.period==='month'?'btn-acc':'btn-ghost'} btn-sm" onclick="setPeriod('month')">Mensal</button><button class="btn ${S.period==='year'?'btn-acc':'btn-ghost'} btn-sm" onclick="setPeriod('year')">Anual</button></div></div><div class="card" style="margin-bottom:14px;padding:12px"><canvas id="chart-bar"></canvas></div><div class="stats-grid"><div class="card stat-card"><div class="stat-card-lbl">Total Receitas</div><div class="stat-card-val" style="color:var(--success)">${fmtCur(rec)}</div></div><div class="card stat-card"><div class="stat-card-lbl">Total Despesas</div><div class="stat-card-val" style="color:var(--danger)">${fmtCur(desp)}</div></div><div class="card stat-card"><div class="stat-card-lbl">Saldo Geral</div><div class="stat-card-val" style="color:${saldo>=0?'var(--success)':'var(--danger)'}">${fmtCur(saldo)}</div></div><div class="card stat-card"><div class="stat-card-lbl">Lançamentos</div><div class="stat-card-val" style="color:var(--accent)">${txs.length}</div></div></div></div>`;}
function setPeriod(p){S.period=p;render();}
function screenTipos(){const txs=getClientTx();if(!txs.length)return'<div class="empty"><div class="empty-icon"></div>Nenhum lançamento para exibir.</div>';const g={};txs.forEach(t=>{if(!g[t.operation])g[t.operation]={value:0,count:0};g[t.operation].value+=t.valor;g[t.operation].count++;});const data=Object.entries(g).sort((a,b)=>b[1].value-a[1].value);const rows=data.map(([id,d],i)=>{const op=getOp(id);const col=PC[i%PC.length];return`<div class="type-row" style="border-left-color:${col}"><div><div class="type-name" style="display:flex;align-items:center;gap:6px">${opImg(id,'20px')}${op?.label||id}</div><div class="type-count">${d.count} lançamento${d.count!==1?'s':''}</div></div><span class="type-val" style="color:${col}">${fmtCur(d.value)}</span></div>`;}).join('');return`<div class="screen"><h3 style="color:var(--text);margin-bottom:14px">Gráficos</h3><div class="card" style="margin-bottom:14px;padding:12px"><canvas id="chart-pie"></canvas></div>${rows}</div>`;}

// ─── CHARTS CLIENTE ───────────────────────────────────────────────────────────
function buildClientCharts(){
  const isLight=document.body.classList.contains('light');
  const tc=isLight?'#6b7280':'#888';const gc=isLight?'#e5e7eb':'#2e2e2e';
  const txs=getClientTx();if(!txs.length)return;
  const bCanvas=q('#chart-bar'),pCanvas=q('#chart-pie');
  if(bCanvas){const g={};txs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');const k=S.period==='month'?`${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`:`${d.getFullYear()}`;if(!g[k])g[k]={R:0,D:0,O:0};if(t.operation==='receita')g[k].R+=t.valor;else if(isNeg(t.operation))g[k].D+=t.valor;else g[k].O+=t.valor;});const keys=Object.keys(g).sort();S.charts.bar=new Chart(bCanvas,{type:'bar',data:{labels:keys,datasets:[{label:'Receita',data:keys.map(k=>g[k].R),backgroundColor:'#10b981',borderRadius:4},{label:'Despesa',data:keys.map(k=>g[k].D),backgroundColor:'#ef4444',borderRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:tc,font:{size:11}}}},scales:{x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10},callback:v=>v>=1000?`${(v/1000).toFixed(0)}k`:v},grid:{color:gc}}}}});}
  if(pCanvas){const g={};txs.forEach(t=>{if(!g[t.operation])g[t.operation]=0;g[t.operation]+=t.valor;});const e=Object.entries(g);S.charts.pie=new Chart(pCanvas,{type:'pie',data:{labels:e.map(([id])=>getOp(id)?.label||id),datasets:[{data:e.map(([,v])=>v),backgroundColor:e.map((_,i)=>PC[i%PC.length]),borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:tc,font:{size:11},padding:12}}}}});}
  const pCanvas2=q('#painel-chart-bar'),pPie=q('#painel-chart-pie');
  const allTxs2=getClientTx();const period=S.clientPeriod;const filtTxs=period?allTxs2.filter(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===period;}):allTxs2;
  if(pCanvas2){const g={};filtTxs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');const k=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;if(!g[k])g[k]={R:0,D:0};if(t.operation==='receita')g[k].R+=t.valor;else if(isNeg(t.operation))g[k].D+=t.valor;});const keys2=Object.keys(g).sort();S.charts.painel=new Chart(pCanvas2,{type:'bar',data:{labels:keys2,datasets:[{label:'Receita',data:keys2.map(k=>g[k].R),backgroundColor:'#10b981',borderRadius:4},{label:'Despesa',data:keys2.map(k=>g[k].D),backgroundColor:'#ef4444',borderRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:tc,font:{size:11}}}},scales:{x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10},callback:v=>v>=1000?`${(v/1000).toFixed(0)}k`:v},grid:{color:gc}}}}});}
  if(pPie){const gp={};filtTxs.forEach(t=>{if(!gp[t.operation])gp[t.operation]=0;gp[t.operation]+=t.valor;});const ep=Object.entries(gp);S.charts.panelPie=new Chart(pPie,{type:'doughnut',data:{labels:ep.map(([id])=>getOp(id)?.label||id),datasets:[{data:ep.map(([,v])=>v),backgroundColor:ep.map((_,i)=>PC[i%PC.length]),borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:tc,font:{size:11},padding:12}}}}});}
}

// INIT
S.txDate=todayStr();
applyTheme();
const _savedSession=sessionStorage.getItem('sn:session');
if(_savedSession){try{S.session=JSON.parse(_savedSession);S.page=S.session.isAdmin?'admin':'client';}catch{}}
loadAll().then(()=>render());
