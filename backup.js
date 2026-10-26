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
// botão da barra lateral do admin (o app.js só chama esta função, se ela existir)
function bkBotaoHTML() {
  return '<button id="bk-btn" class="btn btn-ghost btn-full btn-sm" onclick="admBackup()" title="Baixa um arquivo .json com TODOS os dados do banco. Contém dados de clientes: guarde em local seguro e nunca no GitHub." style="margin-bottom:8px;white-space:normal;line-height:1.3">💾 Backup do banco</button>';
}

if (typeof module !== 'undefined' && module.exports) module.exports = { bkNormalizar, bkMontar, bkNomeArquivo, bkTamanho, BK_COLECOES };
