const LOGO='https://res.cloudinary.com/dk10wezy9/image/upload/v1777137104/SN_Branco_m3jaiw.png';

// ─── TAMANHOS CONFIGURÁVEIS ───────────────────────────────────────────────────
const CFG = {
  BANK_ICON_SIZE:  '28px',   // tamanho dos logos de banco
  OP_ICON_SIZE:    '40px',   // tamanho dos ícones de operação (screenNovo)
  OP_BADGE_SIZE:   '20px',   // tamanho nos badges/recentes
  NAV_ICON_SIZE:   '22px',   // tamanho na nav lateral/bottom
  KPI_ICON_SIZE:   '28px',   // tamanho nos KPI cards
};

// ─── TAMANHOS INDIVIDUAIS POR ÍCONE ──────────────────────────────────────────
const ICON_SIZES = {
  'receita':      '40px',
  'retirada':     '40px',
  'despesa':      '40px',
  'entre_bancos': '40px',
  'aporte':       '40px',
  'estoque':      '40px',
  'saldo':        '40px',
  'bens':         '40px',
  'investimento': '48px',  // ← aumente ou diminua aqui
  'emprestimo':   '40px',
  'painel':       '40px',
  'operacoes':    '40px',
};
const BANK_LOGOS = {
  'CAIXA':        'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137107/Caixa_gjhlvz.png',
  'ITAU':         'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137102/Itau_btudnq.png',
  'BRADESCO':     'https://res.cloudinary.com/dk10wezy9/image/upload/v1777138504/Bradesco_jmvqfh.png',
  'SANTANDER':    'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137104/Santander_m9s61x.png',
  'BANCO DO BRASIL':'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137106/BB_w3numo.png',
  'INTER':        'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137102/Inter_psyqu0.png',
  'C6':           'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137106/unnamed_zwkty9.png',
  'NUBANK':       'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137102/Nubank_vlgt0x.png',
  'MERCADO PAGO': 'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137105/unnamed_1_h9ndpc.png',
  'CITIBANK':     'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137108/Citi_a7cjgs.png',
  'BTG':          'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137067/unnamed_3_tjgigh.png',
  'BGT':          'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137067/unnamed_3_tjgigh.png',
};
// Renderiza logo do banco: imagem se tiver, senão texto
const bankLogo = (name, size=CFG.BANK_ICON_SIZE) => {
  const url = BANK_LOGOS[name?.toUpperCase()] || BANK_LOGOS[name] || '';
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
  'clientes':        'https://res.cloudinary.com/dk10wezy9/image/upload/v1777143420/Clientes_rdxkth.png',
  'total_lanc':      'https://res.cloudinary.com/dk10wezy9/image/upload/v1777141277/Total-lancamentos_raxtr6.png',
  'saldo_consol':    'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137103/Saldo_ebjmew.png',
  'investimento': 'https://res.cloudinary.com/dk10wezy9/image/upload/v1777140886/Investimento_mohbdc.png',
  'emprestimo':   'https://res.cloudinary.com/dk10wezy9/image/upload/v1777139841/Empr%C3%A9stimo_gtlzhm.png',
  'operacoes':    'https://res.cloudinary.com/dk10wezy9/image/upload/v1777139632/Opera%C3%A7%C3%B5es_zq6hsv.png',
  'painel':       'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137108/Dashboard_iray85.png',
};
// Ícones de navegação do cliente
const NAV_ICONS = {
  'painel':       'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137108/Dashboard_iray85.png',
  'novo':         'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137103/Receitas_jwk63q.png',
  'lista':        'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137103/Saldo_ebjmew.png',
  'historico':    'https://res.cloudinary.com/dk10wezy9/image/upload/v1777139632/Opera%C3%A7%C3%B5es_zq6hsv.png',
  'grafico':      'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137108/Despesas_nx766f.png',
  'tipos':        'https://res.cloudinary.com/dk10wezy9/image/upload/v1777137109/Estoque_siflk8.png',
};
const opImg = (id, size) => {
  const s = size || ICON_SIZES[id] || CFG.OP_BADGE_SIZE;
  // check custom ops first
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
const OPS=[{id:'receita',label:'Receita',icon:'',color:'#f59e0b'},{id:'retirada',label:'Retirada',icon:'',color:'#10b981'},{id:'bens',label:'Bens',icon:'',color:'#f97316'},{id:'estoque',label:'Estoque',icon:'',color:'#6b7280'},{id:'despesa',label:'Despesa',icon:'',color:'#ef4444'},{id:'aporte',label:'Aporte',icon:'',color:'#3b82f6'},{id:'investimento',label:'Investimento',icon:'',color:'#8b5cf6'},{id:'emprestimo',label:'Empréstimo',icon:'',color:'#ec4899'},{id:'entre_bancos',label:'Entre bancos',icon:'',color:'#06b6d4',wide:true}];
const DEFAULT_BANKS=['CAIXA','ITAU','BRADESCO','SANTANDER','BANCO DO BRASIL','INTER','C6','NUBANK','MERCADO PAGO','CITIBANK','BGT'];
const DEFAULT_DESCRIPTIONS=['Vendas de mercadoria','Serviços prestados','Retirada Sócio','Maquinas','Eletrônicos','Veículo','Mercadoria para revenda','Água','Energia','Telefone e internet','Aluguel','Salário funcionario registrado','Adiantamento func. registrado','Vale transporte','Vale Refeição','Gratificação e prêmio','Ajuda de custo','Material de consumo empresa','Serviços prestados por PJ','Serviços prestados de PF','DAS Impostos faturamento','INSS folha e pagamento','FGTS Folha de pagamento','Contribuições sindicato','Estacionamento','Combustível','Locações','Taxas bancarias','Despesas em diversas','Multas','Despesas com veículo','Reuniões e representação','Embalgens','Aporte sócio','PIS','COFINS','IRPJ','CSLL','ICMS','IR ALUGUEL','Outros impostos - descrever','IPVA','IPTU','ISS','Doação','Iof','Rendimento bancário','Frete','Locomoção','Parcelamento de DAS','Parcelamento impostos federais','Parcelamento impostos estaduais','Juro Passivo','Mora','Aplicações bancarias e outros investimentos','Plano de saúde','Reembolso de despesas diversas','Cartório','Parcelamento diversos','Emprestimo bancário','Transferência mesma titularidade','Seguro','Pagamento de empréstimo'];
const PC=['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316'];
const S={page:'login',adminView:'dashboard',viewClientId:null,clientTab:'painel',menuOpen:false,filterOpen:false,period:'month',selectedOp:null,comprovante:'',txDate:'',txForm:{},showClientForm:false,editClientId:null,filters:{startDate:'',endDate:'',operation:'',banco:'',minVal:'',maxVal:'',busca:''},toast:false,clients:[],banks:[...DEFAULT_BANKS],descriptions:[...DEFAULT_DESCRIPTIONS],customOps:[],txMap:{},session:null,charts:{},clientPeriod:'',histPeriod:'',opForm:{},uploadingIcon:false};

// ─── FIRESTORE HELPERS (Firebase carregado via CDN no index.html) ─────────────
async function fsGet(docId) {
  try {
    const snap = await firebase.firestore().collection('sn').doc(docId).get();
    return snap.exists ? snap.data().value : null;
  } catch(e) { console.error('fsGet', e); return null; }
}
async function fsSet(docId, value) {
  try {
    await firebase.firestore().collection('sn').doc(docId).set({ value });
  } catch(e) { console.error('fsSet', e); }
}

// ─── LOAD / SAVE (Firestore) ───────────────────────────────────────────────────
async function loadAll() {
  document.getElementById('app').innerHTML = '<div class="center-page" style="color:var(--muted);font-size:14px">⏳ Carregando dados...</div>';
  const [clients, banks, txMap, descriptions, customOps] = await Promise.all([
    fsGet('clients'),
    fsGet('banks'),
    fsGet('txmap'),
    fsGet('descriptions'),
    fsGet('customops')
  ]);
  S.clients = clients || [];
  S.banks   = banks   || [...DEFAULT_BANKS];
  S.txMap   = txMap   || {};
  S.descriptions = descriptions || [...DEFAULT_DESCRIPTIONS];
  S.customOps    = customOps    || [];
}
function saveClients()      { return fsSet('clients',      S.clients);      }
function saveBanks()        { return fsSet('banks',         S.banks);        }
function saveTxMap()        { return fsSet('txmap',         S.txMap);        }
function saveDescriptions() { return fsSet('descriptions',  S.descriptions); }
function saveCustomOps()    { return fsSet('customops',     S.customOps);    }
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
function render(){
  destroyCharts();
  const el=document.getElementById('app');
  // Watermark logo no background
  if(!document.getElementById('sn-watermark-style')){
    const st=document.createElement('style');
    st.id='sn-watermark-style';
    st.textContent=`
      .admin-main::before, .page::before {
        content:'';
        position:fixed;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%);
        width:500px;
        height:500px;
        background:url('https://res.cloudinary.com/dk10wezy9/image/upload/v1777137104/SN_Branco_m3jaiw.png') no-repeat center/contain;
        opacity:0.04;
        pointer-events:none;
        z-index:0;
      }
      .admin-content, .screen, .card, .kpi-grid, .charts-grid, .recent-list, .tx-table-wrap {
        position:relative;
        z-index:1;
      }
    `;
    document.head.appendChild(st);
  }
  switch(S.page){case'login':el.innerHTML=pageLogin();break;case'changepwd':el.innerHTML=pageChangePwd();break;case'admin':el.innerHTML=pageAdmin();buildAdminCharts();break;case'client':el.innerHTML=pageClient();buildClientCharts();break;}
}

// LOGIN
const ADMIN_EMAIL = 'contabilidade@snsolucoescontabeis.com';
// ADMIN_MODE é definido pelo HTML que carrega este script (true em admin.html, false em index.html)
const IS_ADMIN_PAGE = typeof ADMIN_MODE !== 'undefined' && ADMIN_MODE === true;

function pageLogin(){
  if(IS_ADMIN_PAGE) return pageLoginAdmin();
  return`<div class="center-page">
    <img src="${LOGO}" class="login-logo" alt="SN" onerror="this.style.display='none'"/>
    <div class="card login-box">
      <h2 class="login-title">SN – Soluções Contábeis</h2>
      <p class="login-sub">Sistema de Gestão Financeira</p>
      <div class="field"><label class="label">Usuário</label><input id="login-user" class="inp" placeholder="Seu usuário de acesso" onkeydown="if(event.key==='Enter')doLogin()"/></div>
      <div class="field"><label class="label">Senha</label><input id="login-pass" type="password" class="inp" placeholder="Sua senha" onkeydown="if(event.key==='Enter')doLogin()"/></div>
      <p id="login-err" class="err"></p>
      <button class="btn btn-acc btn-full" style="padding:12px;font-size:15px" onclick="doLogin()">Entrar</button>
    </div>
  </div>`;
}

function pageLoginAdmin(){
  return`<div class="center-page">
    <img src="${LOGO}" class="login-logo" alt="SN" onerror="this.style.display='none'"/>
    <div class="card login-box" style="text-align:center">
      <h2 class="login-title">Acesso Administrativo</h2>
      <p class="login-sub" style="margin-bottom:24px">Restrito à equipe SN Soluções Contábeis</p>
      <p id="login-err" class="err"></p>
      <button class="btn btn-ghost btn-full" style="padding:13px;font-size:14px;gap:10px;justify-content:center" onclick="doGoogleLogin()">
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 32.8 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.2 4 9.5 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.3 26.8 36 24 36c-5.3 0-9.7-3.2-11.3-7.8l-6.6 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C40.9 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
        Entrar com Google
      </button>
    </div>
  </div>`;
}

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
    provider.setCustomParameters({login_hint: ADMIN_EMAIL});
    const result=await firebase.auth().signInWithPopup(provider);
    const email=result.user.email;
    if(email!==ADMIN_EMAIL){
      await firebase.auth().signOut();
      if(errEl)errEl.textContent='Acesso negado. Use a conta Google autorizada.';
      return;
    }
    S.session={isAdmin:true,adminEmail:email};
    sessionStorage.setItem('sn:session',JSON.stringify(S.session));
    S.page='admin';S.adminView='dashboard';render();
  }catch(e){
    if(errEl)errEl.textContent='Erro ao autenticar: '+(e.message||'tente novamente');
  }
}
function pageChangePwd(){return`<div class="center-page"><img src="${LOGO}" style="width:140px;margin-bottom:24px;object-fit:contain" alt="SN" onerror="this.style.display='none'"/><div class="card" style="width:100%;max-width:360px"><h3 style="color:var(--accent);margin-bottom:6px">Primeiro Acesso</h3><p style="color:var(--muted);font-size:13px;margin-bottom:20px">Crie uma senha pessoal para continuar.</p><div class="field"><label class="label">Nova Senha</label><input id="cp-pass" type="password" class="inp"/></div><div class="field"><label class="label">Confirmar</label><input id="cp-conf" type="password" class="inp" onkeydown="if(event.key==='Enter')doChangePwd()"/></div><p id="cp-err" class="err"></p><button class="btn btn-acc btn-full" style="padding:12px" onclick="doChangePwd()">Confirmar Nova Senha</button></div></div>`;}
function doChangePwd(){const p=q('#cp-pass').value,c=q('#cp-conf').value,err=q('#cp-err');if(p.length<6){err.textContent='Mínimo 6 caracteres.';return;}if(p!==c){err.textContent='As senhas não coincidem.';return;}const client=getClient();S.clients=S.clients.map(x=>x.id===client.id?{...x,password:p,mustChangePwd:false}:x);saveClients();S.page='client';render();}
function doLogout(){
  firebase.auth().signOut().catch(()=>{});
  S.session=null;sessionStorage.removeItem('sn:session');
  S.selectedOp=null;S.comprovante='';S.menuOpen=false;S.filterOpen=false;
  if(IS_ADMIN_PAGE){S.page='login';render();}
  else{S.page='login';render();}
}


// ADMIN SHELL
function pageAdmin(){
  const nav=[{id:'dashboard',label:'Dashboard',icon:''},{id:'clients',label:'Clientes',icon:''},{id:'banks',label:'Bancos',icon:''},{id:'descriptions',label:'Descrições',icon:''},{id:'operacoes',label:'Operações',icon:''}];
  const sideItems=nav.map(n=>`<button class="sidebar-item ${S.adminView===n.id?'active':''}" onclick="setAdminView('${n.id}')">${n.label}</button>`).join('');
  const titles={dashboard:['Dashboard','Visão geral consolidada'],clients:['Clientes',`${S.clients.length} cliente${S.clients.length!==1?'s':''} cadastrado${S.clients.length!==1?'s':''}`],'client-detail':[(S.clients.find(x=>x.id===S.viewClientId)?.razaoSocial||'Cliente'),'Painel gerencial do cliente'],banks:['Bancos',`${S.banks.length} bancos cadastrados`],descriptions:['Descrições',`${S.descriptions.length} descrições cadastradas`],operacoes:['Operações',`${OPS.length + S.customOps.length} operações disponíveis`]};
  const [title,sub]=titles[S.adminView]||['Admin',''];
  let content='';
  if(S.adminView==='dashboard')content=admDashboard();
  else if(S.adminView==='clients')content=admClients();
  else if(S.adminView==='client-detail')content=admClientDetail();
  else if(S.adminView==='banks')content=admBanks();
  else if(S.adminView==='descriptions')content=admDescriptions();
  else if(S.adminView==='operacoes')content=admOperacoes();
  return`<div class="admin-wrap"><aside class="admin-sidebar"><div class="sidebar-logo"><img src="${LOGO}" alt="SN" onerror="this.style.display='none'"/></div><div class="sidebar-user"><div class="sidebar-user-label">Acesso</div><div class="sidebar-user-name">Administrador</div></div><nav class="sidebar-nav">${sideItems}</nav><div class="sidebar-footer"><button class="btn btn-ghost btn-full btn-sm" onclick="doLogout()">Sair</button></div></aside><main class="admin-main"><div class="admin-header"><div class="admin-header-left"><h1>${title}</h1><p>${sub}</p></div><div style="font-size:12px;color:var(--muted)">${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</div></div><div class="admin-content">${content}</div></main></div>`;
}
function setAdminView(v){S.adminView=v;S.showClientForm=false;render();}

// DASHBOARD
function admDashboard(){
  const tx=allTx();
  const totalRec=tx.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);
  const totalDesp=tx.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const saldoGeral=tx.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);
  const ativos=S.clients.filter(c=>(S.txMap[c.id]||[]).length>0).length;
  const kpis=[{img:opImg('clientes',CFG.KPI_ICON_SIZE),val:S.clients.length,lbl:'Clientes Cadastrados',color:'#f59e0b'},{img:opImg('clientes',CFG.KPI_ICON_SIZE),val:ativos,lbl:'Com Lançamentos',color:'#10b981'},{img:opImg('total_lanc',CFG.KPI_ICON_SIZE),val:tx.length,lbl:'Total de Lançamentos',color:'#3b82f6'},{img:opImg('receita',CFG.KPI_ICON_SIZE),val:fmtCur(totalRec),lbl:'Total Receitas',color:'#10b981'},{img:opImg('despesa',CFG.KPI_ICON_SIZE),val:fmtCur(totalDesp),lbl:'Total Despesas',color:'#ef4444'},{img:opImg('saldo_consol',CFG.KPI_ICON_SIZE),val:fmtCur(saldoGeral),lbl:'Saldo Consolidado',color:saldoGeral>=0?'#10b981':'#ef4444'}].map(k=>`<div class="kpi-card" style="border-top-color:${k.color}"><div class="kpi-icon">${k.img}</div><div class="kpi-val" style="color:${k.color}">${k.val}</div><div class="kpi-lbl">${k.lbl}</div></div>`).join('');
  const recent=tx.sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,8).map(t=>{const op=getOp(t.operation);const cl=S.clients.find(c=>(S.txMap[c.id]||[]).some(x=>x.id===t.id));return`<div class="recent-item"><span class="recent-icon">${opImg(t.operation,CFG.OP_BADGE_SIZE)}</span><div class="recent-info"><div class="recent-name">${esc(cl?.razaoSocial||'—')} · ${op?.label||''}</div><div class="recent-meta">${esc(t.descricao||'sem descrição')} · ${fmtDate(t.date)}</div></div><span class="recent-val" style="color:${isNeg(t.operation)?'var(--danger)':'var(--success)'}">${isNeg(t.operation)?'−':'+'}${fmtCur(t.valor)}</span></div>`;}).join('')||'<div style="color:var(--muted);font-size:13px;padding:12px 0">Nenhum lançamento ainda.</div>';
  const ranking=S.clients.map(c=>{const txs=S.txMap[c.id]||[];const saldo=txs.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);return{c,count:txs.length,saldo};}).filter(x=>x.count>0).sort((a,b)=>b.count-a.count).slice(0,5);
  const rankHtml=ranking.length?ranking.map((r,i)=>`<tr><td style="font-weight:700;color:var(--muted);padding-right:8px">${i+1}</td><td style="cursor:pointer;color:var(--accent)" onclick="openClientDetail('${r.c.id}')">${esc(r.c.razaoSocial)}</td><td>${r.count}</td><td style="color:${r.saldo>=0?'var(--success)':'var(--danger)'};font-weight:700">${fmtCur(r.saldo)}</td><td><button class="btn btn-ghost btn-sm" onclick="openClientDetail('${r.c.id}')">Ver →</button></td></tr>`).join(''):`<tr><td colspan="5" style="color:var(--muted);padding:16px">Nenhum lançamento registrado.</td></tr>`;
  return`<div class="kpi-grid">${kpis}</div><div class="charts-grid"><div class="chart-card"><div class="chart-title">Movimentações por Mês</div><div class="chart-sub">Receitas e despesas consolidadas</div><canvas id="adm-chart-bar"></canvas></div><div class="chart-card"><div class="chart-title">Por Tipo de Operação</div><div class="chart-sub">Distribuição do valor total</div><canvas id="adm-chart-pie"></canvas></div></div><div style="display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:24px"><div><div class="section-title" style="margin-bottom:12px">Últimos Lançamentos</div><div class="recent-list">${recent}</div></div><div><div class="section-title" style="margin-bottom:12px">Ranking de Clientes</div><div class="tx-table-wrap"><table class="tx-table"><thead><tr><th>#</th><th>Cliente</th><th>Lançamentos</th><th>Saldo</th><th></th></tr></thead><tbody>${rankHtml}</tbody></table></div></div></div>`;
}

// CLIENTS LIST
function admClients(){
  const editData=S.editClientId?S.clients.find(x=>x.id===S.editClientId):null;
  const formHtml=S.showClientForm?`<div class="card" style="margin-bottom:20px">
    <div style="color:var(--accent);font-weight:700;margin-bottom:14px">${editData?'Editar Cliente':'Novo Cliente'}</div>
    <div class="field"><label class="label">Razão Social</label><input id="cf-rs" class="inp" value="${esc(editData?.razaoSocial||'')}" placeholder="Nome da empresa"/></div>
    <div class="field"><label class="label">CNPJ</label><input id="cf-cnpj" class="inp" value="${esc(editData?.cnpj||'')}" placeholder="00.000.000/0000-00" maxlength="18"/></div>
    <div class="field"><label class="label">E-mail</label><input id="cf-email" type="email" class="inp" value="${esc(editData?.email||'')}" placeholder="email@empresa.com"/></div>
    <div class="field">
      <label class="label">Login de acesso *</label>
      <input id="cf-user" class="inp" value="${esc(editData?.username||'')}" placeholder="Ex: empresa123 (sem espaços)" oninput="this.value=this.value.replace(/\\s/g,'')"/>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">Este será o usuário que o cliente usa para entrar. Senha inicial: <strong style="color:var(--accent)">12345</strong></div>
    </div>
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
function updateUserPreview(){const rs=q('#cf-rs')?.value||'';const p=q('#user-preview');if(p&&rs)p.innerHTML=`Usuário: <strong style="color:var(--accent)">${makeUser(rs)}</strong> &nbsp;·&nbsp; Senha: <strong style="color:var(--accent)">12345</strong>`;}
function saveClientForm(){
  const rs=q('#cf-rs').value.trim();
  const cnpj=q('#cf-cnpj').value.trim();
  const email=q('#cf-email').value.trim();
  const username=q('#cf-user').value.trim();
  const err=q('#cf-err');
  if(!rs||!cnpj||!email||!username){err.textContent='Preencha todos os campos obrigatórios.';return;}
  if(!/^[^\s]+$/.test(username)){err.textContent='Login não pode ter espaços.';return;}
  // check duplicate username (excluding current edit)
  const duplicate=S.clients.find(c=>c.username.toLowerCase()===username.toLowerCase()&&c.id!==S.editClientId);
  if(duplicate){err.textContent='Este login já está em uso por outro cliente.';return;}
  if(S.editClientId){
    S.clients=S.clients.map(c=>c.id===S.editClientId?{...c,razaoSocial:rs,cnpj,email,username}:c);
  }else{
    if(S.clients.length>=30){err.textContent='Limite de 30 clientes atingido.';return;}
    S.clients.push({id:uid(),razaoSocial:rs,cnpj,email,username,password:'12345',mustChangePwd:true,createdAt:new Date().toISOString()});
  }
  saveClients();S.showClientForm=false;S.editClientId=null;render();
}
function deleteClient(id){if(!confirm('Remover este cliente e todos os seus dados?'))return;S.clients=S.clients.filter(c=>c.id!==id);delete S.txMap[id];saveClients();saveTxMap();render();}
function resetClientPwd(id){const c=S.clients.find(x=>x.id===id);if(!c||!confirm(`Resetar senha de ${c.razaoSocial}?`))return;S.clients=S.clients.map(x=>x.id===id?{...x,password:'12345',mustChangePwd:true}:x);saveClients();render();}

// CLIENT DETAIL (admin)
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
  const opRows=Object.entries(opGroups).sort((a,b)=>b[1].value-a[1].value).map(([id,g])=>{const op=getOp(id);return`<tr><td><span class="op-pill" style="background:${op?.color||'#888'}22;color:${op?.color||'#888'}">${op?.icon||''} ${op?.label||id}</span></td><td>${g.count}</td><td style="color:var(--accent);font-weight:700">${fmtCur(g.value)}</td></tr>`;}).join('')||'<tr><td colspan="3" style="color:var(--muted);padding:12px">Sem dados.</td></tr>';
  const txRows=txs.slice(0,20).map(t=>{const op=getOp(t.operation);return`<tr><td style="white-space:nowrap">${fmtDate(t.date)}</td><td><span class="op-pill" style="background:${op?.color||'#888'}22;color:${op?.color||'#888'}">${op?.icon||''} ${op?.label||t.operation}</span></td><td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.descricao||'—')}</td><td>${esc(t.banco||'—')}</td><td class="${isNeg(t.operation)?'val-neg':'val-pos'}">${isNeg(t.operation)?'−':'+'}${fmtCur(t.valor)}</td></tr>`;}).join('')||'<tr><td colspan="5" style="color:var(--muted);padding:16px">Nenhum lançamento.</td></tr>';
  return`<button class="back-btn" onclick="setAdminView('clients')">← Voltar aos Clientes</button>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
    <div style="display:flex;align-items:center;gap:14px;flex:1"><div class="cl-avatar" style="width:52px;height:52px;font-size:18px">${initials}</div><div><div style="font-size:20px;font-weight:700">${esc(c.razaoSocial)}</div><div style="font-size:13px;color:var(--muted);margin-top:4px;display:flex;gap:16px;flex-wrap:wrap"><span>📄 ${esc(c.cnpj)}</span><span>✉️ ${esc(c.email)}</span><span>👤 ${esc(c.username)}</span></div></div></div>
    <div style="display:flex;gap:8px;flex-shrink:0"><button class="btn btn-ghost btn-sm" onclick="editClientOpen('${c.id}')">Editar</button><button class="btn btn-ghost btn-sm" onclick="resetClientPwd('${c.id}')">Reset Senha</button></div>
  </div>
  <div class="kpi-grid" style="margin-bottom:20px">${kpis}</div>
  <div class="detail-charts"><div class="chart-card"><div class="chart-title">Movimentações por Mês</div><div class="chart-sub">Receitas vs Despesas</div><canvas id="cl-chart-bar"></canvas></div><div class="chart-card"><div class="chart-title">Por Tipo</div><div class="chart-sub">Distribuição do valor</div><canvas id="cl-chart-pie"></canvas></div></div>
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:20px">
    <div><div class="section-title" style="margin-bottom:12px">Últimos ${Math.min(txs.length,20)} Lançamentos</div><div class="tx-table-wrap"><table class="tx-table"><thead><tr><th>Data</th><th>Operação</th><th>Descrição</th><th>Banco</th><th>Valor</th></tr></thead><tbody>${txRows}</tbody></table></div></div>
    <div><div class="section-title" style="margin-bottom:12px">Por Operação</div><div class="tx-table-wrap"><table class="tx-table"><thead><tr><th>Tipo</th><th>Qtd</th><th>Total</th></tr></thead><tbody>${opRows}</tbody></table></div></div>
  </div>`;
}

// BANKS
function admBanks(){const pills=S.banks.map(b=>`<div class="bank-pill"><span class="pill-name" style="display:flex;align-items:center;gap:6px">${bankLogo(b)} ${esc(b)}</span><button class="pill-del" onclick="deleteBank('${esc(b)}')">×</button></div>`).join('');return`<div class="card" style="max-width:600px"><div class="row" style="margin-bottom:16px"><input id="new-bank" class="inp" style="flex:1" placeholder="Nome do novo banco" onkeydown="if(event.key==='Enter')addBank()"/><button class="btn btn-acc" onclick="addBank()">Adicionar</button></div><p id="bank-err" class="err"></p><div class="bank-pills">${pills}</div></div>`;}
function addBank(){const v=q('#new-bank').value.trim().toUpperCase(),err=q('#bank-err');if(!v){err.textContent='Digite o nome.';return;}if(S.banks.includes(v)){err.textContent='Já cadastrado.';return;}S.banks.push(v);saveBanks();render();}
function deleteBank(b){if(!confirm(`Remover ${b}?`))return;S.banks=S.banks.filter(x=>x!==b);saveBanks();render();}

// ADMIN CHARTS
function buildAdminCharts(){
  const bCanvas=q('#adm-chart-bar'),pCanvas=q('#adm-chart-pie');
  const tx=allTx();
  if(tx.length&&bCanvas){const g={};tx.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');const k=`${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;if(!g[k])g[k]={R:0,D:0};if(t.operation==='receita')g[k].R+=t.valor;else if(isNeg(t.operation))g[k].D+=t.valor;});const keys=Object.keys(g).sort();S.charts.admBar=new Chart(bCanvas,{type:'bar',data:{labels:keys,datasets:[{label:'Receita',data:keys.map(k=>g[k].R),backgroundColor:'#10b981',borderRadius:4},{label:'Despesa',data:keys.map(k=>g[k].D),backgroundColor:'#ef4444',borderRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:'#888',font:{size:11}}}},scales:{x:{ticks:{color:'#888',font:{size:10}},grid:{color:'#2e2e2e'}},y:{ticks:{color:'#888',font:{size:10},callback:v=>v>=1000?`${(v/1000).toFixed(0)}k`:v},grid:{color:'#2e2e2e'}}}}});}
  if(tx.length&&pCanvas){const g={};tx.forEach(t=>{if(!g[t.operation])g[t.operation]=0;g[t.operation]+=t.valor;});const e=Object.entries(g);S.charts.admPie=new Chart(pCanvas,{type:'doughnut',data:{labels:e.map(([id])=>getOp(id)?.label||id),datasets:[{data:e.map(([,v])=>v),backgroundColor:e.map((_,i)=>PC[i%PC.length]),borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:'#888',font:{size:10},padding:8,boxWidth:10}}}}});}
  // client detail charts
  const cBar=q('#cl-chart-bar'),cPie=q('#cl-chart-pie');
  if(S.viewClientId&&cBar){const txs=S.txMap[S.viewClientId]||[];if(txs.length){const g={};txs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');const k=`${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;if(!g[k])g[k]={R:0,D:0};if(t.operation==='receita')g[k].R+=t.valor;else if(isNeg(t.operation))g[k].D+=t.valor;});const keys=Object.keys(g).sort();S.charts.cBar=new Chart(cBar,{type:'bar',data:{labels:keys,datasets:[{label:'Receita',data:keys.map(k=>g[k].R),backgroundColor:'#10b981',borderRadius:4},{label:'Despesa',data:keys.map(k=>g[k].D),backgroundColor:'#ef4444',borderRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:'#888',font:{size:10}}}},scales:{x:{ticks:{color:'#888',font:{size:9}},grid:{color:'#2e2e2e'}},y:{ticks:{color:'#888',font:{size:9},callback:v=>v>=1000?`${(v/1000).toFixed(0)}k`:v},grid:{color:'#2e2e2e'}}}}});const g2={};txs.forEach(t=>{if(!g2[t.operation])g2[t.operation]=0;g2[t.operation]+=t.valor;});const e2=Object.entries(g2);if(e2.length&&cPie)S.charts.cPie=new Chart(cPie,{type:'doughnut',data:{labels:e2.map(([id])=>getOp(id)?.label||id),datasets:[{data:e2.map(([,v])=>v),backgroundColor:e2.map((_,i)=>PC[i%PC.length]),borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:'#888',font:{size:10},padding:6,boxWidth:10}}}}});}}
}

// CLIENT PORTAL
function pageClient(){
  const client=getClient();if(!client){doLogout();return'';}
  const NAV=[{id:'painel',label:'Painel'},{id:'novo',label:'Lançamento'},{id:'historico',label:'Histórico'}];
  const navBtns=NAV.map(n=>`<button class="nav-btn ${S.clientTab===n.id?'active':''}" onclick="setClientTab('${n.id}')"><span class="nav-icon">${navImg(n.id,CFG.NAV_ICON_SIZE)}</span>${n.label}</button>`).join('');
  const menuItems=NAV.map(n=>`<button class="menu-item ${S.clientTab===n.id?'active':''}" onclick="setClientTab('${n.id}');closeMenu()"><span class="menu-item-icon">${navImg(n.id,CFG.NAV_ICON_SIZE)}</span>${n.label}</button>`).join('');
  const menuHtml=S.menuOpen?`<div class="menu-overlay" onclick="closeMenu()"><div class="menu-drawer" onclick="event.stopPropagation()"><img src="${LOGO}" style="height:36px;object-fit:contain;margin-bottom:20px" alt="SN" onerror="this.style.display='none'"/><div style="font-size:12px;color:var(--muted);margin-bottom:16px">${esc(client.razaoSocial)}</div>${menuItems}<div class="menu-spacer"><button class="menu-item menu-item-logout" onclick="doLogout()"><span class="menu-item-icon">🚪</span>Sair</button></div></div></div>`:'';
  let content='';switch(S.clientTab){case'painel':content=screenPainel();break;case'novo':content=screenNovo();break;case'historico':content=screenHistorico();break;case'lista':content=screenLista();break;case'grafico':content=screenGrafico();break;case'tipos':content=screenTipos();break;}
  if(S.clientTab==='painel'){
    const sideItems=NAV.map(n=>`<button class="sidebar-item ${S.clientTab===n.id?'active':''}" onclick="setClientTab('${n.id}')"><span style="display:inline-flex;align-items:center;margin-right:8px">${navImg(n.id,CFG.NAV_ICON_SIZE)}</span>${n.label}</button>`).join('');
    return`<div class="admin-wrap"><aside class="admin-sidebar"><div class="sidebar-logo"><img src="${LOGO}" alt="SN" onerror="this.style.display='none'"/></div><div class="sidebar-user"><div class="sidebar-user-label">Cliente</div><div class="sidebar-user-name">${esc(client.razaoSocial)}</div></div><nav class="sidebar-nav">${sideItems}</nav><div class="sidebar-footer"><button class="btn btn-ghost btn-full btn-sm" onclick="doLogout()">Sair</button></div></aside><main class="admin-main" style="overflow-y:auto;height:100vh">${content}</main></div>`;
  }
  return`<div class="page"><div class="topbar"><img src="${LOGO}" class="topbar-logo" alt="SN" onerror="this.style.display='none'"/><span class="topbar-title">${esc(client.razaoSocial)}</span><button class="menu-btn" onclick="toggleMenu()">☰</button></div>${menuHtml}<div style="padding-bottom:68px">${content}</div><nav class="bottom-nav">${navBtns}</nav></div>`;
}
function setClientTab(t){S.clientTab=t;S.menuOpen=false;render();}
function toggleMenu(){S.menuOpen=!S.menuOpen;render();}
function closeMenu(){S.menuOpen=false;render();}

// NOVO LANÇAMENTO
function printRelatorio(){
  const client=getClient();
  const txs=getClientTx();
  const mes=S.clientPeriod||'';
  const filtered=mes?txs.filter(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===mes;}):txs;
  const rec=filtered.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);
  const desp=filtered.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const saldo=rec-desp;
  const rows=filtered.map(t=>{const op=getOp(t.operation);return`<tr><td>${fmtDate(t.date)}</td><td>${op?.label||t.operation}</td><td>${esc(t.descricao)}</td><td>${esc(t.banco)}</td><td style="color:${isNeg(t.operation)?'#ef4444':'#10b981'}">${isNeg(t.operation)?'-':'+'} ${fmtCur(t.valor)}</td></tr>`;}).join('');
  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório - ${esc(client.razaoSocial)}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:20px;margin-bottom:4px}p{font-size:13px;color:#555;margin:0 0 20px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#f3f4f6;padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb}td{padding:8px 12px;border-bottom:1px solid #e5e7eb}.totais{margin-top:20px;text-align:right;font-size:14px}.totais span{margin-left:24px}@media print{button{display:none}}</style></head><body><h1>Relatório de Lançamentos</h1><p>${esc(client.razaoSocial)} · CNPJ: ${esc(client.cnpj)} · ${mes?'Período: '+mes:'Todos os lançamentos'}</p><table><thead><tr><th>Data</th><th>Operação</th><th>Descrição</th><th>Banco</th><th>Valor</th></tr></thead><tbody>${rows}</tbody></table><div class="totais"><span>Receitas: <strong style="color:#10b981">${fmtCur(rec)}</strong></span><span>Despesas: <strong style="color:#ef4444">${fmtCur(desp)}</strong></span><span>Saldo: <strong style="color:${saldo>=0?'#10b981':'#ef4444'}">${fmtCur(saldo)}</strong></span></div><br><button onclick="window.print()">🖨️ Imprimir</button></body></html>`);
  w.document.close();
  w.focus();
  setTimeout(()=>w.print(),400);
}

function screenPainel(){
  const client=getClient();
  const allTxs=getClientTx();
  const monthSet=new Set();
  allTxs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');monthSet.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);});
  const months=[...monthSet].sort().reverse();
  if(!S.clientPeriod||!monthSet.has(S.clientPeriod)){S.clientPeriod=months[0]||'';}
  const txs=S.clientPeriod?allTxs.filter(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===S.clientPeriod;}):allTxs;
  const rec=txs.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);
  const desp=txs.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const outros=txs.filter(t=>t.operation!=='receita'&&!isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);
  const saldo=rec-desp;
  const monthLabel=m=>{if(!m)return'';const[y,mo]=m.split('-');return`${mo}/${y}`;};
  const monthOpts=months.length?months.map(m=>`<option value="${m}" ${m===S.clientPeriod?'selected':''}>${monthLabel(m)}</option>`).join(''):'<option value="">Sem lançamentos</option>';
  const kpis=[
    {img:`<img src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777141277/Total-lancamentos_raxtr6.png" style="width:${CFG.KPI_ICON_SIZE};height:${CFG.KPI_ICON_SIZE};object-fit:contain"/>`,val:txs.length,lbl:'Total Lançamentos',color:'#3b82f6'},
    {img:opImg('receita',CFG.KPI_ICON_SIZE),val:fmtCur(rec),lbl:'Receitas',color:'#10b981'},
    {img:opImg('despesa',CFG.KPI_ICON_SIZE),val:fmtCur(desp),lbl:'Despesas',color:'#ef4444'},
    {img:`<img src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777141665/Outros_aebx7k.png" style="width:${CFG.KPI_ICON_SIZE};height:${CFG.KPI_ICON_SIZE};object-fit:contain"/>`,val:fmtCur(outros),lbl:'Outros',color:'#f59e0b'},
    {img:`<img src="https://res.cloudinary.com/dk10wezy9/image/upload/v1777141052/Saldo_vfedtd.png" style="width:${CFG.KPI_ICON_SIZE};height:${CFG.KPI_ICON_SIZE};object-fit:contain"/>`,val:fmtCur(saldo),lbl:'Saldo',color:saldo>=0?'#10b981':'#ef4444'},
  ].map(k=>`<div class="kpi-card" style="border-top-color:${k.color}"><div class="kpi-icon">${k.img}</div><div class="kpi-val" style="color:${k.color}">${k.val}</div><div class="kpi-lbl">${k.lbl}</div></div>`).join('');
  const opG={};txs.forEach(t=>{if(!opG[t.operation])opG[t.operation]={count:0,total:0};opG[t.operation].count++;opG[t.operation].total+=t.valor;});
  const opRows=Object.entries(opG).sort((a,b)=>b[1].total-a[1].total).map(([id,d])=>{const op=getOp(id);const neg=isNeg(id);return`<tr><td><span class="badge" style="background:${neg?'#ef444420':'#10b98120'};color:${neg?'#ef4444':'#10b981'}">${op?.icon||''} ${op?.label||id}</span></td><td>${d.count}</td><td style="color:${neg?'var(--danger)':'var(--success)'};font-weight:600">${fmtCur(d.total)}</td></tr>`;}).join('')||`<tr><td colspan="3" style="color:var(--muted);padding:16px">Sem dados.</td></tr>`;
  const recentRows=txs.slice().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,8).map(t=>{const op=getOp(t.operation);const neg=isNeg(t.operation);return`<div class="recent-item"><span class="recent-icon">${opImg(t.operation,CFG.OP_BADGE_SIZE)}</span><div class="recent-info"><div class="recent-name">${op?.label||t.operation}</div><div class="recent-meta">${esc(t.descricao||'sem descrição')} · ${fmtDate(t.date)}</div></div><span class="recent-val" style="color:${neg?'var(--danger)':'var(--success)'}">${neg?'−':'+'}${fmtCur(t.valor)}</span></div>`;}).join('')||`<div style="color:var(--muted);font-size:13px;padding:12px 0">Nenhum lançamento neste período.</div>`;
  return`
    <div class="admin-header">
      <div class="admin-header-left">
        <h1>Dashboard</h1>
        <p>${esc(client.razaoSocial)} · ${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div class="sel-wrap"><select class="sel" style="min-width:130px" onchange="S.clientPeriod=this.value;render()">${monthOpts}</select><span class="sel-arr">▼</span></div>
        <button class="btn btn-ghost btn-sm" onclick="printRelatorio()">🖨️ Imprimir</button>
      </div>
    </div>
    <div class="admin-content">
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

function screenNovo(){
  const op=S.selectedOp?getOp(S.selectedOp):null;
  const allOpsForGrid=[...OPS,...S.customOps];
  const opGrid=allOpsForGrid.filter(o=>!o.wide).map(o=>{const sel=S.selectedOp===o.id;return`<button class="op-btn ${sel?'active':''}" style="${sel?`border-color:${o.color};background:${o.color}20`:''}" onclick="selectOp('${o.id}')"><span class="op-icon">${opImg(o.id,CFG.OP_ICON_SIZE)}</span>${o.label}</button>`;}).join('');
  const entSel=S.selectedOp==='entre_bancos';
  const bankOpts=S.banks.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join('');
  const descOpts=S.descriptions.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('');
  const formHtml=op?`<div class="card" style="margin-top:8px"><div class="row" style="margin-bottom:16px"><span style="font-size:20px">${op.icon}</span><span style="color:${op.color};font-weight:700;font-size:15px">${op.label}</span></div><div class="field"><label class="label">Valor *</label><div class="inp-icon"><span class="icon-left">R$</span><input id="f-valor" type="number" min="0" step="0.01" class="inp" placeholder="0,00" value="${S.txForm?.valor||''}"/></div></div><div class="field"><label class="label">Descrição *</label><div class="sel-wrap" style="margin-bottom:6px"><select id="f-desc-sel" class="sel ${S.txForm?.desc?'':'empty'}" onchange="applyDescSel(this)"><option value="">Selecione ou digite abaixo...</option>${descOpts}</select><span class="sel-arr">▼</span></div><input id="f-desc" class="inp" placeholder="Ou digite uma descrição livre..." value="${esc(S.txForm?.desc||'')}" style="font-size:13px"/></div><div class="field"><label class="label">Comprovante</label><div class="comp-btn ${S.comprovante?'has-file':''}" onclick="q('#f-file').click()">${S.comprovante?'📎 '+esc(S.comprovante):'📷  Adicionar comprovante'}</div><input id="f-file" type="file" accept="image/*" style="display:none" onchange="setComp(this)"/></div><div class="field"><label class="label">Banco *</label><div style="display:flex;align-items:center;gap:8px"><span id="b-prev" style="min-width:${CFG.BANK_ICON_SIZE}">${bankLogo(S._bprev||'',CFG.BANK_ICON_SIZE)}</span><div class="sel-wrap" style="flex:1"><select id="f-banco" class="sel ${S._bprev?'':'empty'}" onchange="updateBancoPreview(this)"><option value="">Selecione o banco</option>${bankOpts}</select><span class="sel-arr">▼</span></div></div></div><div class="field"><label class="label">Complemento</label><input id="f-comp" class="inp" placeholder="Informação adicional (opcional)" value="${esc(S.txForm?.comp||'')}"/></div><div class="field"><label class="label">Responsável</label><input id="f-resp" class="inp" placeholder="Nome do responsável (opcional)" value="${esc(S.txForm?.resp||'')}"/></div><div class="row"><button class="btn btn-acc" style="flex:1;padding:12px;font-size:15px" onclick="saveTx()">💾 Salvar Lançamento</button><button class="btn btn-ghost" style="padding:12px" onclick="clearOp()">✕</button></div></div>`:'';
  return`<div class="screen">${S.toast?'<div class="toast">✓ Lançamento salvo com sucesso!</div>':''}<div class="field"><label class="label">Data</label><div class="inp-icon"><input id="f-date" type="date" class="inp" value="${S.txDate||todayStr()}" style="padding-right:44px" onchange="S.txDate=this.value"/><span class="icon-right" style="font-size:20px">📅</span></div></div><div class="field"><label class="label">Operações *</label><div class="ops-grid">${opGrid}</div><button class="op-wide ${entSel?'active':''}" style="${entSel?'border-color:#06b6d4;background:#06b6d4;color:#000;font-weight:700':''}" onclick="selectOp('entre_bancos')">${opImg('entre_bancos',CFG.OP_ICON_SIZE)} Entre bancos</button></div>${formHtml}</div>`;
}
function selectOp(id){saveFormState();S.selectedOp=id;render();}
function clearOp(){S.selectedOp=null;S.comprovante='';S.txForm={};S._bprev='';render();}
function setComp(el){if(el.files[0]){saveFormState();S.comprovante=el.files[0].name;render();}}
function applyDescSel(sel){const inp=q('#f-desc');if(inp&&sel.value){inp.value=sel.value;}}
function saveFormState(){S.txForm={valor:q('#f-valor')?.value||'',desc:q('#f-desc')?.value||'',comp:q('#f-comp')?.value||'',resp:q('#f-resp')?.value||''};}
function updateBancoPreview(sel){S._bprev=sel.value;sel.classList.remove('empty');const prev=q('#b-prev');if(prev)prev.innerHTML=bankLogo(sel.value,CFG.BANK_ICON_SIZE);}
async function saveTx(){const valor=parseFloat(q('#f-valor')?.value||0),desc=q('#f-desc')?.value.trim()||'',banco=q('#f-banco')?.value||'';if(!valor||valor<=0){alert('Informe um valor válido.');return;}if(!desc){alert('Preencha a descrição.');return;}if(!banco){alert('Selecione o banco.');return;}const cid=S.session.clientId;const tx={id:uid(),date:q('#f-date')?.value||todayStr(),operation:S.selectedOp,valor,descricao:desc,banco,complemento:q('#f-comp')?.value||'',responsavel:q('#f-resp')?.value||'',comprovante:S.comprovante,createdAt:new Date().toISOString()};if(!S.txMap[cid])S.txMap[cid]=[];S.txMap[cid].unshift(tx);S.selectedOp=null;S.comprovante='';S.txForm={};S._bprev='';S.toast=true;render();await saveTxMap();setTimeout(()=>{S.toast=false;render();},2500);}

// LISTA
function screenLista(){
  const txs=getClientTx();const f=S.filters;
  const filtered=txs.filter(t=>{if(f.startDate&&t.date<f.startDate)return false;if(f.endDate&&t.date>f.endDate)return false;if(f.operation&&t.operation!==f.operation)return false;if(f.banco&&t.banco!==f.banco)return false;if(f.minVal&&t.valor<parseFloat(f.minVal))return false;if(f.maxVal&&t.valor>parseFloat(f.maxVal))return false;if(f.busca){const q2=f.busca.toLowerCase();if(![t.descricao,t.responsavel,t.complemento,t.banco].some(x=>x?.toLowerCase().includes(q2)))return false;}return true;});
  const saldo=filtered.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);
  const hasFilter=Object.values(f).some(Boolean);
  const allBancos=[...new Set(txs.map(t=>t.banco).filter(Boolean))];
  const is='width:100%;background:#252525;border:1px solid var(--border);border-radius:7px;padding:8px 10px;color:var(--text);font-size:13px;font-family:inherit;outline:none';
  const allOpsFilter=[...OPS,...S.customOps];
  const filterPanel=S.filterOpen?`<div class="card" style="margin-bottom:16px"><div style="color:var(--accent);font-weight:700;margin-bottom:12px">← Filtro</div><div class="filter-grid"><div><label class="label">Data Inicial</label><input type="date" style="${is}" value="${f.startDate}" onchange="setFilter('startDate',this.value)"/></div><div><label class="label">Data Final</label><input type="date" style="${is}" value="${f.endDate}" onchange="setFilter('endDate',this.value)"/></div></div><div class="field"><label class="label">Operação</label><select style="${is};appearance:none" onchange="setFilter('operation',this.value)"><option value="">Todas</option>${allOpsFilter.map(o=>`<option value="${o.id}" ${f.operation===o.id?'selected':''}>${o.label}</option>`).join('')}</select></div><div class="field"><label class="label">Banco</label><select style="${is};appearance:none" onchange="setFilter('banco',this.value)"><option value="">Todos</option>${allBancos.map(b=>`<option value="${esc(b)}" ${f.banco===b?'selected':''}>${esc(b)}</option>`).join('')}</select></div><div class="filter-grid"><div><label class="label">Valor Mín.</label><input type="number" style="${is}" value="${f.minVal}" placeholder="0" onchange="setFilter('minVal',this.value)"/></div><div><label class="label">Valor Máx.</label><input type="number" style="${is}" value="${f.maxVal}" placeholder="∞" onchange="setFilter('maxVal',this.value)"/></div></div><div class="field"><label class="label">Busca</label><input style="${is}" value="${esc(f.busca)}" placeholder="Descrição, responsável..." onchange="setFilter('busca',this.value)"/></div><button class="btn btn-ghost btn-full" style="margin-top:4px;font-size:13px" onclick="clearFilters()">Limpar Filtros</button></div>`:'';
  const txCards=filtered.map(t=>{const op=getOp(t.operation);return`<div class="tx-card" style="border-left-color:${op?.color||'#f59e0b'}"><div class="tx-row"><div class="tx-left"><div class="tx-header">${opImg(t.operation,'20px')}<span class="tx-label">${op?.label||t.operation}</span><span class="tx-date">· ${fmtDate(t.date)}</span></div>${t.descricao?`<div class="tx-desc">${esc(t.descricao)}</div>`:''}<div class="tx-meta" style="display:flex;align-items:center;gap:4px">${bankLogo(t.banco,'18px')} ${esc(t.banco)}${t.responsavel?' · '+esc(t.responsavel):''}</div>${t.comprovante?`<div class="tx-comp">${esc(t.comprovante)}</div>`:''}</div><div class="tx-right"><span class="tx-val" style="color:${isNeg(t.operation)?'var(--danger)':'var(--success)'}">${isNeg(t.operation)?'−':'+'}${fmtCur(t.valor)}</span><button class="tx-del-btn" onclick="deleteTx('${t.id}')">🗑 excluir</button></div></div></div>`;}).join('');
  return`<div class="screen"><div class="row-spread" style="margin-bottom:12px"><h3 style="color:var(--text)">Lançamentos (${filtered.length})</h3><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="printRelatorio()">🖨️ Imprimir</button><button class="btn ${hasFilter?'btn-acc':'btn-ghost'} btn-sm" onclick="toggleFilter()">🔍 ${hasFilter?'Filtro ativo':'Filtro'}</button></div></div>${filterPanel}<div class="card summary" style="margin-bottom:12px"><span class="summary-lbl">Saldo do período</span><span class="summary-val" style="color:${saldo>=0?'var(--success)':'var(--danger)'}">${fmtCur(Math.abs(saldo))}</span></div>${filtered.length===0?'<div class="empty" style="padding-top:40px">Nenhum lançamento encontrado.</div>':txCards}</div>`;
}
function setFilter(k,v){S.filters[k]=v;render();}
function clearFilters(){S.filters={startDate:'',endDate:'',operation:'',banco:'',minVal:'',maxVal:'',busca:''};render();}
function toggleFilter(){S.filterOpen=!S.filterOpen;render();}
function deleteTx(id){if(!confirm('Excluir este lançamento?'))return;const cid=S.session.clientId;S.txMap[cid]=(S.txMap[cid]||[]).filter(t=>t.id!==id);saveTxMap();render();}

// GRÁFICO
function screenGrafico(){const txs=getClientTx();if(!txs.length)return'<div class="empty"><div class="empty-icon"></div>Nenhum lançamento para exibir.</div>';const rec=txs.filter(t=>t.operation==='receita').reduce((a,t)=>a+t.valor,0);const desp=txs.filter(t=>isNeg(t.operation)).reduce((a,t)=>a+t.valor,0);const saldo=txs.reduce((a,t)=>isNeg(t.operation)?a-t.valor:a+t.valor,0);return`<div class="screen"><div class="row-spread" style="margin-bottom:14px"><h3 style="color:var(--text)">Demonstração de Resultados</h3><div class="period-toggle"><button class="btn ${S.period==='month'?'btn-acc':'btn-ghost'} btn-sm" onclick="setPeriod('month')">Mensal</button><button class="btn ${S.period==='year'?'btn-acc':'btn-ghost'} btn-sm" onclick="setPeriod('year')">Anual</button></div></div><div class="card" style="margin-bottom:14px;padding:12px"><canvas id="chart-bar"></canvas></div><div class="stats-grid"><div class="card stat-card"><div class="stat-card-lbl">Total Receitas</div><div class="stat-card-val" style="color:var(--success)">${fmtCur(rec)}</div></div><div class="card stat-card"><div class="stat-card-lbl">Total Despesas</div><div class="stat-card-val" style="color:var(--danger)">${fmtCur(desp)}</div></div><div class="card stat-card"><div class="stat-card-lbl">Saldo Geral</div><div class="stat-card-val" style="color:${saldo>=0?'var(--success)':'var(--danger)'}">${fmtCur(saldo)}</div></div><div class="card stat-card"><div class="stat-card-lbl">Lançamentos</div><div class="stat-card-val" style="color:var(--accent)">${txs.length}</div></div></div></div>`;}
function setPeriod(p){S.period=p;render();}

// TIPOS
function screenTipos(){const txs=getClientTx();if(!txs.length)return'<div class="empty"><div class="empty-icon"></div>Nenhum lançamento para exibir.</div>';const g={};txs.forEach(t=>{if(!g[t.operation])g[t.operation]={value:0,count:0};g[t.operation].value+=t.valor;g[t.operation].count++;});const data=Object.entries(g).sort((a,b)=>b[1].value-a[1].value);const rows=data.map(([id,d],i)=>{const op=getOp(id);const col=PC[i%PC.length];return`<div class="type-row" style="border-left-color:${col}"><div><div class="type-name" style="display:flex;align-items:center;gap:6px">${opImg(id,'20px')}${op?.label||id}</div><div class="type-count">${d.count} lançamento${d.count!==1?'s':''}</div></div><span class="type-val" style="color:${col}">${fmtCur(d.value)}</span></div>`;}).join('');return`<div class="screen"><h3 style="color:var(--text);margin-bottom:14px">Gráficos</h3><div class="card" style="margin-bottom:14px;padding:12px"><canvas id="chart-pie"></canvas></div>${rows}</div>`;}

// CLIENT CHARTS
function buildClientCharts(){const txs=getClientTx();if(!txs.length)return;const bCanvas=q('#chart-bar'),pCanvas=q('#chart-pie');if(bCanvas){const g={};txs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');const k=S.period==='month'?`${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`:`${d.getFullYear()}`;if(!g[k])g[k]={R:0,D:0,O:0};if(t.operation==='receita')g[k].R+=t.valor;else if(isNeg(t.operation))g[k].D+=t.valor;else g[k].O+=t.valor;});const keys=Object.keys(g).sort();S.charts.bar=new Chart(bCanvas,{type:'bar',data:{labels:keys,datasets:[{label:'Receita',data:keys.map(k=>g[k].R),backgroundColor:'#10b981',borderRadius:4},{label:'Despesa',data:keys.map(k=>g[k].D),backgroundColor:'#ef4444',borderRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:'#888',font:{size:11}}}},scales:{x:{ticks:{color:'#888',font:{size:10}},grid:{color:'#2e2e2e'}},y:{ticks:{color:'#888',font:{size:10},callback:v=>v>=1000?`${(v/1000).toFixed(0)}k`:v},grid:{color:'#2e2e2e'}}}}});}const pCanvas2=q('#painel-chart-bar'),pPie=q('#painel-chart-pie');
  const allTxs2=getClientTx();const period=S.clientPeriod;const filtTxs=period?allTxs2.filter(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===period;}):allTxs2;
  if(pCanvas2){const g={};filtTxs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');const k=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;if(!g[k])g[k]={R:0,D:0};if(t.operation==='receita')g[k].R+=t.valor;else if(isNeg(t.operation))g[k].D+=t.valor;});const keys2=Object.keys(g).sort();S.charts.painel=new Chart(pCanvas2,{type:'bar',data:{labels:keys2,datasets:[{label:'Receita',data:keys2.map(k=>g[k].R),backgroundColor:'#10b981',borderRadius:4},{label:'Despesa',data:keys2.map(k=>g[k].D),backgroundColor:'#ef4444',borderRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:'#888',font:{size:11}}}},scales:{x:{ticks:{color:'#888',font:{size:10}},grid:{color:'#2e2e2e'}},y:{ticks:{color:'#888',font:{size:10},callback:v=>v>=1000?`${(v/1000).toFixed(0)}k`:v},grid:{color:'#2e2e2e'}}}}});}
  if(pPie){const gp={};filtTxs.forEach(t=>{if(!gp[t.operation])gp[t.operation]=0;gp[t.operation]+=t.valor;});const ep=Object.entries(gp);S.charts.panelPie=new Chart(pPie,{type:'doughnut',data:{labels:ep.map(([id])=>getOp(id)?.label||id),datasets:[{data:ep.map(([,v])=>v),backgroundColor:ep.map((_,i)=>PC[i%PC.length]),borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:'#888',font:{size:11},padding:12}}}}});}
  if(pCanvas){const g={};txs.forEach(t=>{if(!g[t.operation])g[t.operation]=0;g[t.operation]+=t.valor;});const e=Object.entries(g);S.charts.pie=new Chart(pCanvas,{type:'pie',data:{labels:e.map(([id])=>getOp(id)?.label||id),datasets:[{data:e.map(([,v])=>v),backgroundColor:e.map((_,i)=>PC[i%PC.length]),borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:'#888',font:{size:11},padding:12}}}}});}}

// HISTÓRICO DE OPERAÇÕES
function screenHistorico(){
  const allTxs=getClientTx();
  const monthSet=new Set();
  allTxs.forEach(t=>{const d=new Date((t.date||todayStr())+'T12:00:00');monthSet.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);});
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
    return`<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:#1e1e1e;border-radius:10px;border-left:3px solid ${neg?'#ef4444':'#10b981'}">
      <div style="display:flex;align-items:center;gap:10px">
        ${opImg(id,'28px')}
        <div>
          <div style="font-weight:600;font-size:14px;color:var(--text)">${op?.label||id}</div>
          <div style="font-size:12px;color:var(--muted)">${d.count} lançamento${d.count!==1?'s':''}</div>
        </div>
      </div>
      <span style="font-weight:700;font-size:15px;color:${neg?'var(--danger)':'var(--success)'}">${neg?'−':'+'}${fmtCur(d.total)}</span>
    </div>`;
  }).join('')||`<div style="color:var(--muted);font-size:13px;padding:16px 0">Nenhuma operação neste período.</div>`;
  const txRows=txs.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(t=>{
    const op=getOp(t.operation);const neg=isNeg(t.operation);
    return`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:10px">
        ${opImg(t.operation,'22px')}
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(t.descricao||op?.label||t.operation)}</div>
          <div style="font-size:11px;color:var(--muted)">${fmtDate(t.date)} · ${esc(t.banco||'—')}</div>
        </div>
      </div>
      <span style="font-weight:700;font-size:14px;color:${neg?'var(--danger)':'var(--success)'}">${neg?'−':'+'}${fmtCur(t.valor)}</span>
    </div>`;
  }).join('')||`<div style="color:var(--muted);padding:16px;font-size:13px">Nenhum lançamento neste período.</div>`;
  return`<div class="screen">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <h3 style="color:var(--text);font-size:17px">Histórico de Operações</h3>
      <div class="sel-wrap"><select class="sel" style="min-width:140px" onchange="S.histPeriod=this.value;render()">${monthOpts}</select><span class="sel-arr">▼</span></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:20px">
      <div class="card" style="text-align:center;padding:14px 10px;border-top:3px solid #10b981">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Receitas</div>
        <div style="font-size:15px;font-weight:700;color:#10b981">${fmtCur(rec)}</div>
      </div>
      <div class="card" style="text-align:center;padding:14px 10px;border-top:3px solid #ef4444">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Despesas</div>
        <div style="font-size:15px;font-weight:700;color:#ef4444">${fmtCur(desp)}</div>
      </div>
      <div class="card" style="text-align:center;padding:14px 10px;border-top:3px solid #f59e0b">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Outros</div>
        <div style="font-size:15px;font-weight:700;color:#f59e0b">${fmtCur(outros)}</div>
      </div>
      <div class="card" style="text-align:center;padding:14px 10px;border-top:3px solid ${saldo>=0?'#10b981':'#ef4444'}">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Saldo</div>
        <div style="font-size:15px;font-weight:700;color:${saldo>=0?'#10b981':'#ef4444'}">${fmtCur(saldo)}</div>
      </div>
    </div>
    <div class="section-title" style="margin-bottom:12px">Por Tipo de Operação</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">${opCards}</div>
    <div class="section-title" style="margin-bottom:12px">Todos os Lançamentos (${txs.length})</div>
    <div class="card" style="padding:0;overflow:hidden">${txRows}</div>
  </div>`;}

// ─── ADM DESCRIÇÕES ──────────────────────────────────────────────────────────
function admDescriptions(){
  const pills=S.descriptions.map((d,i)=>`<div class="bank-pill"><span class="pill-name">${esc(d)}</span><button class="pill-del" onclick="deleteDescription(${i})">×</button></div>`).join('');
  return`<div class="card" style="max-width:640px"><div class="row" style="margin-bottom:16px"><input id="new-desc" class="inp" style="flex:1" placeholder="Nova descrição..." onkeydown="if(event.key==='Enter')addDescription()"/><button class="btn btn-acc" onclick="addDescription()">Adicionar</button></div><p id="desc-err" class="err"></p><div class="bank-pills">${pills}</div></div>`;
}
function addDescription(){
  const v=q('#new-desc').value.trim(),err=q('#desc-err');
  if(!v){err.textContent='Digite a descrição.';return;}
  if(S.descriptions.map(x=>x.toLowerCase()).includes(v.toLowerCase())){err.textContent='Já cadastrada.';return;}
  S.descriptions.push(v);saveDescriptions();render();
}
function deleteDescription(i){
  if(!confirm(`Remover "${S.descriptions[i]}"?`))return;
  S.descriptions.splice(i,1);saveDescriptions();render();
}

// ─── ADM OPERAÇÕES ────────────────────────────────────────────────────────────
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
    <div class="field"><label class="label">Cor de destaque *</label><div style="display:flex;align-items:center;gap:10px"><input id="op-color" type="color" value="${S.opForm.color||'#f59e0b'}" style="width:44px;height:36px;border:none;background:none;cursor:pointer;padding:0"/><span style="font-size:12px;color:var(--muted)">Escolha uma cor para esta operação</span></div></div>
    <div class="field"><label class="label">Ícone * <span style="color:var(--danger);font-size:11px">(obrigatório)</span></label>
      <div style="display:flex;align-items:center;gap:12px">
        ${previewIcon}
        <div>
          <button class="btn btn-ghost btn-sm" onclick="q('#op-icon-file').click()" ${isUploading?'disabled':''} style="${isUploading?'opacity:.5':''}">
            ${isUploading?'⏳ Enviando...' :'📤 Carregar imagem'}
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
  // save current field values before re-render
  S.opForm={...S.opForm,
    label:q('#op-label')?.value||S.opForm.label||'',
    color:q('#op-color')?.value||S.opForm.color||'#f59e0b'
  };
  S.uploadingIcon=true;render();
  try{
    const fd=new FormData();
    fd.append('file',file);
    fd.append('upload_preset','o5v89u2z');
    const res=await fetch('https://api.cloudinary.com/v1_1/dk10wezy9/image/upload',{method:'POST',body:fd});
    const data=await res.json();
    if(data.secure_url){
      S.opForm={...S.opForm,iconUrl:data.secure_url};
    }else{
      alert('Erro ao enviar ícone: '+(data.error?.message||'tente novamente'));
    }
  }catch(e){alert('Erro de conexão ao enviar ícone.');}
  S.uploadingIcon=false;render();
}
function saveCustomOp(){
  const labelEl=q('#op-label');
  const colorEl=q('#op-color');
  const label=(labelEl?.value||S.opForm.label||'').trim();
  const color=colorEl?.value||S.opForm.color||'#f59e0b';
  const iconUrl=S.opForm.iconUrl||'';
  // keep form values in state in case of re-render
  S.opForm={...S.opForm,label,color};
  const err=q('#op-err');
  if(!label){if(err)err.textContent='Informe o nome da operação.';return;}
  if(!iconUrl){if(err)err.textContent='O ícone é obrigatório. Carregue uma imagem.';return;}
  const id='op_'+uid();
  S.customOps.push({id,label,color,iconUrl,createdAt:new Date().toISOString()});
  S.opForm={};saveCustomOps();render();
}
function deleteCustomOp(id){
  if(!confirm('Remover esta operação personalizada?'))return;
  S.customOps=S.customOps.filter(o=>o.id!==id);saveCustomOps();render();
}

// INIT
S.txDate=todayStr();
const _savedSession=sessionStorage.getItem('sn:session');
if(_savedSession){try{S.session=JSON.parse(_savedSession);S.page=S.session.isAdmin?'admin':'client';}catch{}}
loadAll().then(()=>render());