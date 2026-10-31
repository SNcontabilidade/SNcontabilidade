// Testes do layout POSICIONAL do Contmatic — rodar, da raiz do projeto: node testes/depara-contmatic.test.cjs   (sem dependências)
// Dados FICTÍCIOS. O desenho (colunas, largura, CRLF) foi conferido em 109 arquivos reais (8.464 lançamentos), regerados byte a byte idênticos.
const fs = require('fs'), path = require('path');
const m = { exports: {} };
new Function('module', fs.readFileSync(path.join(__dirname, '..', 'depara-core.js'), 'utf8'))(m);
const C = m.exports;
let ok = 0, falhas = 0;
const eq = (nome, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) ok++; else { falhas++; console.log('✖', nome, '\n   obtido :', a, '\n   esperado:', b); } };
const lanc = (extra) => Object.assign({ data: '03/08/2026', contaDebito: '2017', contaCredito: '1002', valor: 8475.55, historico: 'Holerites pró-labore', codigo: '00011' }, extra || {});
const gerar = (ls, o) => C.dpGerarTxt(ls, Object.assign({ formato: 'contmatic' }, o || {}));
const linhas = (r) => r.texto.split('\r\n');

// ── uma linha, coluna por coluna ──
const r1 = gerar([lanc()]);
const L1 = linhas(r1)[0];
eq('a linha tem 330 colunas', L1.length, 330);
eq('1-7 sequencial', L1.slice(0, 7), '0000001');
eq('8-12 dia/mês (sem ano)', L1.slice(7, 12), '03/08');
eq('13-19 conta de débito, 7 dígitos', L1.slice(12, 19), '0002017');
eq('20-26 conta de crédito, 7 dígitos', L1.slice(19, 26), '0001002');
eq('27-43 valor: 14 inteiros + ponto + 2 decimais', L1.slice(26, 43), '00000000008475.55');
eq('44-48 código de 5 dígitos', L1.slice(43, 48), '00011');
eq('49- histórico em maiúsculas, sem acento', L1.slice(48, 68), 'HOLERITES PRO-LABORE');
eq('o resto da linha é espaço', L1.slice(68).trim(), '');
eq('a linha inteira, como no arquivo de referência', L1.replace(/\s+$/, ''), '000000103/080002017000100200000000008475.5500011HOLERITES PRO-LABORE');

// ── arquivo ──
const r3 = gerar([lanc(), lanc({ data: '04/08/2026', valor: 1016.8, historico: 'IOF', codigo: '100' }), lanc({ data: '05/08/2026', valor: 0.5, contaDebito: '30153', contaCredito: '1003', historico: 'Pagamento' })]);
const T = linhas(r3);
eq('termina com quebra CRLF (3 linhas + vazio final)', [T.length, T[3]], [4, '']);
eq('sequencial 0000001, 0000002, 0000003', T.slice(0, 3).map((x) => x.slice(0, 7)), ['0000001', '0000002', '0000003']);
eq('todas as linhas com 330 colunas', T.slice(0, 3).every((x) => x.length === 330), true);
eq('código curto é completado com zeros (100 → 00100)', T[1].slice(43, 48), '00100');
eq('valor pequeno: 0,5 → 0.50 com zeros à esquerda', T[2].slice(26, 43), '00000000000000.50');
eq('conta de 5 dígitos → 7 (0030153)', T[2].slice(12, 19), '0030153');
eq('sem aviso quando está tudo certo', r3.avisos, []);
eq('sem separador ";" no arquivo', r3.texto.includes(';'), false);
eq('bytes = texto em ANSI (tudo ASCII)', Buffer.from(r3.bytes).toString('latin1'), r3.texto);

// ── histórico ──
eq('acento e cedilha saem sem acento, em maiúsculas', linhas(gerar([lanc({ historico: 'Ação — conexão São João' })]))[0].slice(48).trim(), 'ACAO CONEXAO SAO JOAO');
eq('quebra de linha e tab no histórico viram espaço', linhas(gerar([lanc({ historico: 'a\r\nb\tc' })]))[0].slice(48).trim(), 'A B C');
eq('histórico vazio sai só com espaços', linhas(gerar([lanc({ historico: '' })]))[0].slice(48).trim(), '');
const longo = gerar([lanc({ historico: 'X'.repeat(400) })]);
eq('histórico longo é cortado em 282 e avisado', [linhas(longo)[0].length, longo.avisos.length], [330, 1]);

// ── avisos (nada some em silêncio) ──
eq('conta com letras avisa e sai 0000000', [gerar([lanc({ contaDebito: '1.2.01' })]).avisos.length, linhas(gerar([lanc({ contaDebito: '1.2.01' })]))[0].slice(12, 19)], [1, '0000000']);
eq('conta com mais de 7 dígitos avisa', gerar([lanc({ contaCredito: '12345678' })]).avisos.length, 1);
eq('código com mais de 5 dígitos avisa e sai 00000', [gerar([lanc({ codigo: '123456' })]).avisos.length, linhas(gerar([lanc({ codigo: '123456' })]))[0].slice(43, 48)], [1, '00000']);
eq('arquivo que cruza anos avisa (o padrão não tem ano)', gerar([lanc(), lanc({ data: '05/01/2027' })]).avisos.length, 1);
eq('data fora de dd/mm/aaaa avisa', gerar([lanc({ data: '2026-08-03' })]).avisos.length, 1);

// ── código: regra > DE-PARA > padrão ──
eq('código 5 dígitos: vazio usa o padrão', [C.dpCodigo5('', '00022'), C.dpCodigo5('', ''), C.dpCodigo5(undefined)], ['00022', '00000', '00000']);
eq('código com letras: só os dígitos', C.dpCodigo5('A-11'), '00011');
const cab = ['Data', 'Fornecedor', 'Valor'];
const planilha = [cab, ['25/08/2026', 'Posto Alfa', '100,00'], ['25/08/2026', 'Loja Beta', '50,00'], ['25/08/2026', 'IOF mensal', '9,90'], ['25/08/2026', 'Sem cadastro', '7,00']];
const mapa = { data: 0, valor: 2, fornecedor: 1, historico: 1, banco: '', tipo: '', extras: [] };
const cfg = C.dpNormalizarConfig({ contaCaixa: '1002', deParaMap: { 'Posto Alfa': '30101', 'Loja Beta': '30102' }, codigosMap: { 'Posto Alfa': '11' }, regras: [{ id: 'r1', keywords: ['IOF'], natureza: 'PAGAMENTO', conta: '30119', codigo: '100' }], codigoPadrao: '22' });
const res = C.dpAnalisar(planilha, 0, mapa, cfg);
eq('regra com código vence', res.lancamentos[2].codigo, '00100');
eq('DE-PARA com código', res.lancamentos[0].codigo, '00011');
eq('DE-PARA sem código usa o padrão do cliente', res.lancamentos[1].codigo, '00022');
eq('sem regra nem DE-PARA também usa o padrão', res.lancamentos[3].codigo, '00022');
const tudo = linhas(C.dpGerarTxt(res.lancamentos, { formato: 'contmatic' }));
eq('o arquivo sai com o código de cada lançamento', tudo.slice(0, 4).map((x) => x.slice(43, 48)), ['00011', '00022', '00100', '00022']);
eq('pagamento: débito = conta da despesa, crédito = caixa', [tudo[0].slice(12, 19), tudo[0].slice(19, 26)], ['0030101', '0001002']);

// ── configuração ──
const c0 = C.dpNormalizarConfig({});
eq('cliente novo/antigo já nasce no formato Contmatic com código 00000', [c0.formato, c0.codigoPadrao, c0.codigosMap], ['contmatic', '00000', {}]);
eq('o formato antigo continua disponível', C.dpNormalizarConfig({ formato: 'delimitado' }).formato, 'delimitado');
eq('formato desconhecido volta ao Contmatic', C.dpNormalizarConfig({ formato: 'xyz' }).formato, 'contmatic');
eq('código padrão normalizado', C.dpNormalizarConfig({ codigoPadrao: '7' }).codigoPadrao, '00007');
eq('código da regra só com dígitos (máx. 5)', C.dpNormalizarConfig({ regras: [{ keywords: ['a'], conta: '1', codigo: '12ab345678' }] }).regras[0].codigo, '12345');
eq('formato delimitado antigo continua gerando ;', C.dpGerarTxt([lanc({ data: '25/10/2026' })], { formato: 'delimitado', delimitador: ';', decimalFmt: 'virgula', codificacao: 'ansi' }).texto.includes(';'), true);

console.log(falhas ? `\n${falhas} FALHA(S), ${ok} ok` : `Tudo confere. (${ok} conferências)`);
process.exit(falhas ? 1 : 0);
