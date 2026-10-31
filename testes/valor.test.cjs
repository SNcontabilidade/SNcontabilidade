// Testes do campo de VALOR (como o cliente digita) — rodar, da raiz do projeto: node testes/valor.test.cjs   (sem dependências)
// O trecho é EXTRAÍDO do app.js (entre os marcadores "CAMPO DE VALOR"): o teste nunca diverge do código real.
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8').replace(/\r\n/g, '\n');
const ini = src.indexOf('// ─── CAMPO DE VALOR (início) ───'), fim = src.indexOf('// ─── CAMPO DE VALOR (fim) ───');
if (ini < 0 || fim < 0) { console.log('✖ não achei o bloco do campo de valor no app.js'); process.exit(1); }
const { valorNormalizar, parseValorBR, valorParaCampo } = new Function(src.slice(ini, fim) + '\nreturn { valorNormalizar, parseValorBR, valorParaCampo };')();
let ok = 0, falhas = 0;
const eq = (nome, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) ok++; else { falhas++; console.log('✖', nome, '\n   obtido :', a, '\n   esperado:', b); } };

// digitar "normal": número inteiro é em REAIS, não em centavos
eq('1234 = mil duzentos e trinta e quatro reais', parseValorBR('1234'), 1234);
eq('5 = cinco reais', parseValorBR('5'), 5);
eq('digitando devagar: 1 → 12 → 123 → 1234', ['1', '12', '123', '1234'].map(parseValorBR), [1, 12, 123, 1234]);

// vírgula: decimal
eq('vírgula é decimal', parseValorBR('1234,56'), 1234.56);
eq('vírgula com um dígito', parseValorBR('12,5'), 12.5);
eq('termina em vírgula (ainda digitando)', [valorNormalizar('12,'), parseValorBR('12,')], ['12,', 12]);
eq('mais de 2 casas são cortadas', valorNormalizar('12,345'), '12,34');

// ponto: decimal quando único e com até 2 dígitos depois; milhar nos outros casos
eq('ponto como decimal (1.5)', parseValorBR('1.5'), 1.5);
eq('ponto como decimal (1234.56)', parseValorBR('1234.56'), 1234.56);
eq('ponto vira vírgula na tela enquanto digita', valorNormalizar('1234.56'), '1234,56');
eq('ponto de milhar (1.500 = 1500)', parseValorBR('1.500'), 1500);
eq('milhares com dois pontos (1.234.567)', parseValorBR('1.234.567'), 1234567);

// colar valor formatado
eq('colar 1.234,56', parseValorBR('1.234,56'), 1234.56);
eq('colar 1.234.567,89', parseValorBR('1.234.567,89'), 1234567.89);
eq('colar com R$ e espaços', parseValorBR('R$ 1.234,56'), 1234.56);
eq('letras são ignoradas', valorNormalizar('12a3,4b5'), '123,45');

// vazio e inválido nunca viram NaN
eq('vazio', [parseValorBR(''), parseValorBR(null), parseValorBR(undefined)], [0, 0, 0]);
eq('só símbolos', parseValorBR('R$ ,'), 0);
eq('negativo não existe (o sinal é descartado)', parseValorBR('-50'), 50);

// valor que volta para o campo (edição de lançamento, ao sair do campo)
eq('número vira texto com milhar e 2 casas', valorParaCampo(1234.5), '1.234,50');
eq('17,4 → 17,40', valorParaCampo(17.4), '17,40');
eq('zero e vazio ficam em branco', [valorParaCampo(0), valorParaCampo(''), valorParaCampo(undefined)], ['', '', '']);
eq('o que o cliente digitou é normalizado ao sair', valorParaCampo('1234.5'), '1.234,50');
eq('ida e volta: texto do campo lê o mesmo valor', parseValorBR(valorParaCampo(1234567.89)), 1234567.89);

console.log(falhas ? `\n${falhas} FALHA(S), ${ok} ok` : `Tudo confere. (${ok} conferências)`);
process.exit(falhas ? 1 : 0);
