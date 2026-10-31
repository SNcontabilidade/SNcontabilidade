// Testes do campo de VALOR (como o cliente digita) — rodar, da raiz do projeto: node testes/valor.test.cjs   (sem dependências)
// O trecho é EXTRAÍDO do app.js (entre os marcadores "CAMPO DE VALOR"): o teste nunca diverge do código real.
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8').replace(/\r\n/g, '\n');
const ini = src.indexOf('// ─── CAMPO DE VALOR (início) ───'), fim = src.indexOf('// ─── CAMPO DE VALOR (fim) ───');
if (ini < 0 || fim < 0) { console.log('✖ não achei o bloco do campo de valor no app.js'); process.exit(1); }
const { valorNormalizar, parseValorBR, valorParaCampo, valorMascarar } = new Function(src.slice(ini, fim) + '\nreturn { valorNormalizar, parseValorBR, valorParaCampo, valorMascarar };')();
// simula o cliente digitando tecla por tecla: o campo é reformatado a cada tecla (como o oninput faz)
const digitar = (texto) => { let campo = ''; for (const ch of texto) campo = valorMascarar(campo + ch, false); return campo; };
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

// ── digitando: milhar automático, ponto digitado é enfeite, vírgula é o decimal ──
eq('o caso do cliente: 2.222,22 digitado tecla por tecla', digitar('2.222,22'), '2.222,22');
eq('sem digitar o ponto: 2222,22', digitar('2222,22'), '2.222,22');
eq('4 números já viram mil', digitar('2222'), '2.222');
eq('3 números continuam sem ponto', digitar('222'), '222');
eq('milhões: 1234567,89', digitar('1234567,89'), '1.234.567,89');
eq('com todos os pontos: 1.234.567,89', digitar('1.234.567,89'), '1.234.567,89');
eq('passo a passo cresce certo', ['1', '12', '123', '1234', '12345', '123456', '1234567'].map((n) => digitar(n)), ['1', '12', '123', '1.234', '12.345', '123.456', '1.234.567']);
eq('a vírgula já aparece enquanto digita', [digitar('12,'), digitar('12,5'), digitar('12,50')], ['12,', '12,5', '12,50']);
eq('só 2 casas decimais', digitar('12,345'), '12,34');
eq('vírgula primeiro vira 0,', digitar(','), '0,');
eq('zeros à esquerda somem', digitar('007'), '7');
eq('letras são ignoradas', digitar('1a2b3'), '123');
eq('o valor lido do que está na tela bate', ['2.222,22', '1.234', '12.345,6', '999'].map(parseValorBR), [2222.22, 1234, 12345.6, 999]);
eq('colar 1234.5 (ponto decimal) é entendido', valorMascarar('1234.5', true), '1.234,5');
eq('colar 1.500 (ponto de milhar)', valorMascarar('1.500', true), '1.500');
eq('colar R$ 1.234,56', valorMascarar('R$ 1.234,56', true), '1.234,56');
eq('apagar um dígito do meio reformata', valorMascarar('2.22,22'.replace('.', ''), false), '222,22');

console.log(falhas ? `\n${falhas} FALHA(S), ${ok} ok` : `Tudo confere. (${ok} conferências)`);
process.exit(falhas ? 1 : 0);
