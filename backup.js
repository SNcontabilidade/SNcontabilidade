// ═══ Backup do banco (só admin) ══════════════════════════════════════════════
// Baixa UM arquivo .json com todos os documentos das coleções do app. Nada sai do navegador:
// o arquivo é gerado aqui e baixado direto. Prefixo bk*. Carregado só pelo admin.html.
// ATENÇÃO: o arquivo contém dados de clientes (CNPJ, e-mail, senhas, lançamentos) — guarde fora do Git.

const BK_COLECOES = ['sn', 'sntx'];                              // acrescente aqui as coleções novas (ex.: perfil, conversas…)
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

// ── tela / ação ──────────────────────────────────────────────────────────────
let bkOcupado = false;
function bkRotulo(texto, cor) { const b = document.getElementById('bk-btn'); if (b) { b.textContent = texto; b.style.color = cor || ''; } }
async function admBackup() {
  if (bkOcupado) return;
  bkOcupado = true; bkRotulo('⏳ Lendo o banco…');
  try {
    const colecoes = {};
    for (const nome of BK_COLECOES) {                          // se uma coleção falhar, ABORTA: nunca baixa um backup incompleto
      const snap = await firebase.firestore().collection(nome).get();
      colecoes[nome] = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
    }
    const arq = bkMontar(colecoes, typeof APP_VERSION !== 'undefined' ? APP_VERSION : '');
    const total = Object.keys(arq.contagens).reduce((a, k) => a + arq.contagens[k], 0);
    if (!total) throw new Error('nenhum documento retornado');
    const texto = JSON.stringify(arq);
    const blob = new Blob([texto], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = bkNomeArquivo(); document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    const resumo = Object.keys(arq.contagens).map((k) => k + ': ' + arq.contagens[k]).join(' · ');
    bkRotulo('✅ Backup realizado', '#16a34a');
    const b = document.getElementById('bk-btn'); if (b) b.title = 'Último backup: ' + resumo + ' · ' + bkTamanho(texto.length);   // o detalhe fica só no balãozinho
  } catch (e) {
    console.error('[backup]', e);
    bkRotulo('⚠️ Backup NÃO foi gerado — tente de novo', '#ef4444');
  } finally { bkOcupado = false; }
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
  return '<button id="bk-btn" class="btn btn-ghost btn-full btn-sm" onclick="admBackup()" title="Baixa um arquivo .json com TODOS os dados do banco. Contém dados de clientes: guarde em local seguro e nunca no GitHub." style="margin-bottom:8px;white-space:normal;line-height:1.3">💾 Backup do banco</button>'
    + '<button class="btn btn-ghost btn-full btn-sm" onclick="admRestaurar()" title="Escolha um arquivo de backup para devolver os lançamentos de clientes que ficaram vazios no banco. Nunca sobrescreve quem já tem lançamentos." style="margin-bottom:8px;white-space:normal;line-height:1.3">♻️ Restaurar do backup</button>';
}

if (typeof module !== 'undefined' && module.exports) module.exports = { bkNormalizar, bkMontar, bkNomeArquivo, bkTamanho, bkPlanoRestauracao, BK_COLECOES };
