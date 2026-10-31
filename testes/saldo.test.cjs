// Testes da fórmula ÚNICA do saldo — rodar, da raiz do projeto: node testes/saldo.test.cjs   (sem dependências)
// O trecho é EXTRAÍDO do app.js (de `const isNeg=` até o fim de `calcResumo`): o teste nunca diverge do código real.
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8').replace(/\r\n/g, '\n');
const ini = src.indexOf('const isNeg=op=>'), fimMarca = 'saldo:rec-desp-aplic};\n};', fim = src.indexOf(fimMarca, ini);
if (ini < 0 || fim < 0) { console.log('✖ não achei o bloco do saldo no app.js'); process.exit(1); }
const bloco = src.slice(ini, fim + fimMarca.length);
const { isNeg, isSaida, fluxoSinal, calcResumo } = new Function(bloco + '\nreturn { isNeg, isSaida, fluxoSinal, calcResumo };')();
let ok = 0, falhas = 0;
const eq = (nome, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) ok++; else { falhas++; console.log('✖', nome, '\n   obtido :', a, '\n   esperado:', b); } };
const c2 = (n) => Math.round(n * 100) / 100;                       // compara em centavos
const tx = (operation, valor, extra) => Object.assign({ operation, valor }, extra || {});

// ── classificação ──
eq("despesa e retirada continuam sendo \"despesas\"", [isNeg("despesa"), isNeg("retirada"), isNeg("estoque"), isNeg("investimento")], [true, true, false, false]);
eq("saem do saldo: despesa, retirada, investimento", ["despesa", "retirada", "investimento"].map(isSaida), [true, true, true]);
eq("não saem: receita, estoque, bens, aporte, empréstimo, entre bancos, personalizada", ["receita", "estoque", "bens", "aporte", "emprestimo", "entre_bancos", "op_x"].map(isSaida), [false, false, false, false, false, false, false]);
eq("sinal do fluxo", ["receita", "despesa", "retirada", "investimento", "estoque", "bens", "aporte", "emprestimo", "entre_bancos", "op_x"].map(fluxoSinal), [1, -1, -1, -1, 0, 0, 0, 0, 0, 0]);

// ── o caso do cliente: só o investimento sai das receitas; compras de estoque NÃO mexem no saldo ──
const caso = [tx("receita", 5987.83), tx("despesa", 29.39), tx("estoque", 8801.4, { status: "pendente" }), tx("investimento", 1000)];
const R = calcResumo(caso);
eq("saldo = receitas − despesas − aplicações", c2(R.saldo), 4958.44);
eq("despesas NÃO inclui estoque", c2(R.desp), 29.39);
eq("aplicações têm card próprio", c2(R.aplic), 1000);
eq("\"Outros\" mostra o estoque e NÃO soma a aplicação", c2(R.outros), 8801.4);

// ── cada regra isolada ──
eq("só receita", calcResumo([tx("receita", 100)]).saldo, 100);
eq("compra de estoque não reduz o saldo", calcResumo([tx("receita", 1000), tx("estoque", 300)]).saldo, 1000);
eq("bens não reduzem o saldo", calcResumo([tx("receita", 1000), tx("bens", 250)]).saldo, 1000);
eq("aplicação reduz o saldo", calcResumo([tx("receita", 1000), tx("investimento", 400)]).saldo, 600);
eq("aporte e empréstimo não mexem no saldo", calcResumo([tx("receita", 100), tx("aporte", 500), tx("emprestimo", 200)]).saldo, 100);
eq("entre bancos é neutro", calcResumo([tx("receita", 100), tx("entre_bancos", 999)]).saldo, 100);
eq("operação personalizada é neutra", calcResumo([tx("receita", 100), tx("op_abc", 999)]).saldo, 100);
eq("retirada reduz", calcResumo([tx("receita", 100), tx("retirada", 30)]).saldo, 70);
eq("lista vazia", calcResumo([]), { rec: 0, desp: 0, aplic: 0, outros: 0, saldo: 0 });
eq("pendentes entram igual aos pagos", calcResumo([tx("receita", 100), tx("investimento", 30, { status: "pendente" })]).saldo, 70);

// ── "Outros" mantém o significado de antes, menos a aplicação ──
const mix = calcResumo([tx("estoque", 10), tx("bens", 20), tx("aporte", 30), tx("emprestimo", 40), tx("entre_bancos", 50), tx("op_x", 60), tx("investimento", 70)]);
eq("Outros = tudo que não é receita, despesa/retirada nem aplicação", mix.outros, 210);
eq("aplicação separada", mix.aplic, 70);

// ── a ordem por vencimento (mesmo critério do app: sem vencimento vai para o fim) ──
const ordenar = (l) => l.slice().sort((a, b) => (a.vencimento || '9999-12-31').localeCompare(b.vencimento || '9999-12-31') || (a.date || '').localeCompare(b.date || ''));
const lista = [{ id: 'a', vencimento: '2026-11-10', date: '2026-10-26' }, { id: 'b', vencimento: '2026-11-01', date: '2026-10-26' }, { id: 'c', vencimento: '2026-10-30', date: '2026-10-26' }, { id: 'd', vencimento: '2026-11-02', date: '2026-10-26' }, { id: 'e', date: '2026-10-20' }];
eq('o que vence primeiro fica no topo; sem vencimento no fim', ordenar(lista).map((x) => x.id), ['c', 'b', 'd', 'a', 'e']);
eq('empate de vencimento: data do lançamento mais antiga primeiro', ordenar([{ id: 'x', vencimento: '2026-11-01', date: '2026-10-28' }, { id: 'y', vencimento: '2026-11-01', date: '2026-10-20' }]).map((x) => x.id), ['y', 'x']);

console.log(falhas ? `\n${falhas} FALHA(S), ${ok} ok` : `Tudo confere. (${ok} conferências)`);
process.exit(falhas ? 1 : 0);
