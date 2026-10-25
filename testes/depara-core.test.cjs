// Testes do núcleo do DE-PARA — rodar, da raiz do projeto: node testes/depara-core.test.cjs   (sem dependências)
const fs = require('fs'), path = require('path');
const m = { exports: {} };
new Function('module', fs.readFileSync(path.join(__dirname, '..', 'depara-core.js'), 'utf8'))(m);
const C = m.exports;
let ok = 0, falhas = 0;
const eq = (nome, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) ok++; else { falhas++; console.log('✖', nome, '\n   obtido :', a, '\n   esperado:', b); } };

// ── data ──
eq('data br', C.dpParseData('25/10/2026').br, '25/10/2026');
eq('data br 2 dígitos', C.dpParseData('05/03/26').br, '05/03/2026');
eq('data iso', C.dpParseData('2026-10-25').br, '25/10/2026');
eq('data com hora', C.dpParseData('25/10/2026 14:30:00').br, '25/10/2026');
eq('data serial excel 46320', C.dpParseData(46320).br, '25/10/2026');   // 46320 = 25/10/2026
eq('data serial como texto', C.dpParseData('46320').br, '25/10/2026');
eq('data ddmmaaaa', C.dpParseData('25102026').br, '25/10/2026');
eq('data 31/02 inválida', C.dpParseData('31/02/2026').ok, false);
eq('data mm/dd NÃO é adivinhada (13º mês)', C.dpParseData('10/25/2026').ok, false);
eq('número pequeno não é data', C.dpParseData(15).ok, false);
eq('data vazia sinaliza vazio', C.dpParseData('').vazio, true);
eq('Date', C.dpParseData(new Date(2026, 9, 25)).br, '25/10/2026');

// ── valor ──
const V = (x) => C.dpParseValor(x).valor;
eq('valor 1.234,56', V('1.234,56'), 1234.56);
eq('valor R$ 1.234,56', V('R$ 1.234,56'), 1234.56);
eq('valor US 1,234.56', V('1,234.56'), 1234.56);
eq('valor 1234.56', V('1234.56'), 1234.56);
eq('valor 1234,5', V('1234,5'), 1234.5);
eq('valor 1.500 = mil e quinhentos', V('1.500'), 1500);
eq('valor 12.5', V('12.5'), 12.5);
eq('valor (1.234,56)', V('(1.234,56)'), -1234.56);
eq('valor -1.234,56', V('-1.234,56'), -1234.56);
eq('valor 1.234,56-', V('1.234,56-'), -1234.56);
eq('valor 1.234.567,89', V('1.234.567,89'), 1234567.89);
eq('valor número', V(77.456), 77.46);
eq('valor texto inválido', C.dpParseValor('abc').ok, false);
eq('valor vazio', C.dpParseValor('  ').vazio, true);
eq('formatar valor negativo vira positivo', C.dpFmtValor(-1234.5, 'virgula'), '1234,50');
eq('formatar ponto', C.dpFmtValor(1234.5, 'ponto'), '1234.50');

// ── DE-PARA e regras ──
const idx = C.dpIndiceDePara({ 'Padaria Pão Quente': '2010', 'ACOUGUE': '2011', 'SA': '9999', 'Posto Shell': '3030', 'Shell': '3031', 'Vazio': '' });
eq('exato ignora caixa e acento', C.dpAchaConta(idx, 'padaria pao quente').conta, '2010');
eq('contém usa a chave MAIS LONGA', C.dpAchaConta(idx, 'POSTO SHELL FILIAL 2').conta, '3030');
eq('chave curta (SA) NÃO casa por pedaço', C.dpAchaConta(idx, 'MARISA COMERCIO'), null);
eq('conta vazia é ignorada', C.dpAchaConta(idx, 'Vazio'), null);
const regra = { keywords: ['TARIFA', 'PIX'], banco: '', natureza: 'PAGAMENTO', conta: '4010' };
eq('regra casa sem acento/caixa', C.dpCasaRegra('Tarifa de pix enviado', '', regra, false), true);
eq('regra exige TODAS as palavras', C.dpCasaRegra('Tarifa de TED', '', regra, false), false);
eq('regra com banco sem coluna Banco NÃO casa', C.dpCasaRegra('tarifa pix', '', { ...regra, banco: 'Itaú' }, false), false);
eq('regra com banco casa com a coluna', C.dpCasaRegra('tarifa pix', 'ITAU', { ...regra, banco: 'Itaú' }, true), true);
eq('tipo receb', C.dpNaturezaDoTipo('Recebimento'), 'RECEBIMENTO');
eq('tipo crédito', C.dpNaturezaDoTipo('Crédito'), 'RECEBIMENTO');
eq('tipo D', C.dpNaturezaDoTipo('D'), 'PAGAMENTO');
eq('tipo desconhecido', C.dpNaturezaDoTipo('xyz'), null);

// ── planilha bagunçada: título, cabeçalho na linha 4, totais, erros, negativo ──
const linhas = [
  ['RELATÓRIO DE MOVIMENTO', '', '', '', ''],
  ['Cliente: Padaria X', '', '', '', ''],
  ['', '', '', '', ''],
  ['Data Pgto', 'Favorecido / Histórico', 'Banco', 'Valor (R$)', 'Tipo'],
  [46320, 'Padaria Pão Quente', 'Itaú', '1.234,56', 'Pagamento'],
  [46321, 'TARIFA PIX; ENVIADO', 'Itaú', -12.5, ''],
  ['26/10/2026', 'Posto Shell Filial', 'Itaú', '89,90', 'Pagamento'],
  ['31/02/2026', 'Data ruim', 'Itaú', '10,00', ''],
  [46322, 'Sem valor', 'Itaú', '', ''],
  [46322, 'Venda balcão', 'Itaú', '500,00', 'Recebimento'],
  [46320, 'Padaria Pão Quente', 'Itaú', '1.234,56', 'Pagamento'],
  ['', 'Total do período', '', '9.999,00', ''],
  ['', 'Observação solta', '', '', ''],
  ['', '', '', '', ''],
];
eq('detecta cabeçalho (linha 4 → índice 3)', C.dpDetectarCabecalho(linhas), 3);
const mapa = C.dpDetectarColunas(linhas, 3);
eq('detecta data (A)', mapa.data, 0);
eq('detecta valor (D)', mapa.valor, 3);
eq('detecta histórico/favorecido (B)', mapa.historico, 1);
eq('detecta banco (C)', mapa.banco, 2);
eq('detecta tipo (E)', mapa.tipo, 4);
const cfg = C.dpNormalizarConfig({ contaCaixa: '1120', ano: '2026', deParaMap: { 'Padaria Pão Quente': '2010', 'Posto Shell': '3030', 'Venda balcão': '5001' }, regras: [{ id: 'r1', keywords: ['TARIFA', 'PIX'], banco: '', natureza: 'PAGAMENTO', conta: '4010' }] });
const R = C.dpAnalisar(linhas, 3, { ...mapa, fornecedor: mapa.historico }, cfg);
eq('lidas = 9 (5 válidas + 2 erros + 2 ignoradas)', R.resumo.lidas, 9);
eq('válidas', R.resumo.validas, 5);
eq('erros (data ruim + sem valor)', R.resumo.erros, 2);
eq('ignoradas (total + observação)', R.resumo.ignoradas, 2);
eq('vazias', R.resumo.vazias, 1);
eq('duplicado detectado', R.resumo.duplicados, 1);
eq('linha 1ª: pagamento → débito=fornecedor, crédito=caixa', [R.lancamentos[0].contaDebito, R.lancamentos[0].contaCredito, R.lancamentos[0].valor], ['2010', '1120', 1234.56]);
eq('negativo vira positivo (tarifa)', R.lancamentos[1].valor, 12.5);
eq('regra venceu o DE-PARA', R.lancamentos[1].contaDebito, '4010');
eq('recebimento inverte débito/crédito', [R.lancamentos[3].contaDebito, R.lancamentos[3].contaCredito], ['1120', '5001']);
eq('cada linha ruim traz motivo', R.linhas.filter((l) => l.status === 'erro').every((l) => l.motivos.length > 0), true);
eq('nada some: soma de tudo = lidas', R.resumo.validas + R.resumo.erros + R.resumo.ignoradas, R.resumo.lidas);
eq('número da linha é o da planilha', R.linhas.find((l) => l.status === 'erro').linha, 8);

// sinal define natureza quando pedido
const R2 = C.dpAnalisar([['d', 'h', 'v'], ['25/10/2026', 'Alguma coisa', '-10,00'], ['25/10/2026', 'Outra', '20,00']], 0, { data: 0, valor: 2, fornecedor: 1, historico: 1, banco: '', tipo: '' }, { ...cfg, usarSinal: true });
eq('sinal: negativo = pagamento, positivo = recebimento', R2.lancamentos.map((l) => l.natureza), ['PAGAMENTO', 'RECEBIMENTO']);
eq('sem conta usa 999999 e conta', [R2.lancamentos[0].semConta, R2.resumo.semConta], [true, 2]);

// ── arquivo .txt ──
const lanc = [{ data: '25/10/2026', contaDebito: '2010', contaCredito: '1120', valor: 1234.56, historico: 'PIX; Ação – “teste” \n linha2', semConta: false }];
const t = C.dpGerarTxt(lanc, { delimitador: ';', decimalFmt: 'virgula', codificacao: 'ansi' });
eq('delimitador/quebra no histórico não quebram o arquivo', t.texto, '25/10/2026;2010;1120;1234,56;PIX Ação – “teste” linha2\r\n');
eq('ANSI: ç/ã = 1 byte; – e “” viram 0x96/0x93/0x94', Array.from(t.bytes.slice(-25, -2)).includes(0x96), true);
eq('ANSI: sem caractere perdido nesse texto', t.trocados, 0);
const t2 = C.dpGerarTxt([{ ...lanc[0], historico: 'emoji 😀 fim' }], { delimitador: ';', decimalFmt: 'virgula', codificacao: 'ansi' });
eq('ANSI: caractere sem correspondência vira ? e é CONTADO', t2.trocados, 1);
eq('UTF-8 sem perdas', C.dpGerarTxt([{ ...lanc[0], historico: 'emoji 😀' }], { delimitador: ';', decimalFmt: 'virgula', codificacao: 'utf8' }).trocados, 0);
eq('aviso vírgula/vírgula', C.dpGerarTxt(lanc, { delimitador: ',', decimalFmt: 'virgula', codificacao: 'ansi' }).avisos.length, 1);
eq('tab', C.dpGerarTxt(lanc, { delimitador: 'tab', decimalFmt: 'ponto', codificacao: 'utf8' }).texto.split('\t').length, 5);
eq('nome do arquivo', C.dpNomeArquivo('Padaria São João Ltda', 2026), 'PadariaSaoJoaoLtda_2026_Lctos.txt');

// ── config antiga (conversor_depara.html) continua válida ──
const antiga = C.dpNormalizarConfig({ contaCaixa: '1120', delimitador: ';', decimalFmt: 'virgula', naturezaPadrao: 'PAGAMENTO', deParaMap: { A: '1' }, regras: [{ id: 'r1', keywords: ['X'], banco: '', natureza: 'RECEBIMENTO', conta: '9' }], apelido: 'Cli' });
eq('config antiga preservada', [antiga.contaCaixa, antiga.deParaMap.A, antiga.regras[0].conta, antiga.codificacao, antiga.contaPadrao], ['1120', '1', '9', 'ansi', '999999']);
eq('config lixo vira vazia', C.dpNormalizarConfig(null).regras, []);
eq('regra inválida é descartada', C.dpNormalizarConfig({ regras: [null, { keywords: 'x' }, { keywords: ['a'], conta: '1' }] }).regras.length, 1);

// ═══ Reconhecimento de layouts (dados FICTÍCIOS) ═══════════════════════════════════════════════════════════════════
// ── data suja ──
const dd = C.dpParseData('´06/04/2026');
eq('data com acento solto é aceita e marcada', [dd.ok, dd.br, dd.corrigida], [true, '06/04/2026', true]);
eq('data limpa não é marcada', C.dpParseData('06/04/2026').corrigida, undefined);
eq('texto sem data continua erro', C.dpParseData('abc').ok, false);
eq('data inválida com lixo continua erro', C.dpParseData('´31/02/2026').ok, false);

// ── operações da plataforma SN ──
eq('operação Receita', C.dpNaturezaDoTipo('Receita'), 'RECEBIMENTO');
eq('operação Aporte', C.dpNaturezaDoTipo('Aporte'), 'RECEBIMENTO');
eq('operação Empréstimo', C.dpNaturezaDoTipo('Empréstimo'), 'RECEBIMENTO');
eq('operação Despesa', C.dpNaturezaDoTipo('Despesa'), 'PAGAMENTO');
eq('operação Retirada', C.dpNaturezaDoTipo('Retirada'), 'PAGAMENTO');
eq('operação Bens', C.dpNaturezaDoTipo('Bens'), 'PAGAMENTO');
eq('operação Entre bancos', C.dpNaturezaDoTipo('Entre bancos'), 'TRANSFERENCIA');

// ── layout da plataforma: 9 operações diferentes + Complemento ──
const OPS = ['Receita', 'Despesa', 'Aporte', 'Retirada', 'Empréstimo', 'Estoque', 'Bens', 'Investimento', 'Entre bancos'];
const plat = [['ID', 'DATA', 'OPERAÇÕES', 'VALOR', 'DESCRIÇÃO', 'COMPROVANTE', 'Complemento', 'RESPONSÁVEL']];
for (let i = 0; i < 27; i++) plat.push([i + 1, 46300 + (i % 20), OPS[i % 9], 100 + i * 7.35, 'Pagamento de serviços prestados no mês ' + i, '', i % 3 ? 'ref ' + i : '', 'Fulano']);
const cabP = C.dpCabPadrao(plat), mapP = C.dpDetectarColunas(plat, cabP);
eq('plataforma: cabeçalho na linha 1', cabP, 0);
eq('plataforma: data/valor/descrição', [mapP.data, mapP.valor, mapP.historico], [1, 3, 4]);
eq('plataforma: coluna OPERAÇÕES reconhecida como Tipo (9 valores)', mapP.tipo, 2);
eq('plataforma: Complemento entra como extra', mapP.extras, [6]);
const resP = C.dpAnalisar(plat, cabP, mapP, C.dpNormalizarConfig({ contaCaixa: '1' }));
const nat = (op) => resP.linhas.filter((l) => l.tipo === op && l.status !== 'ignorada').map((l) => l.natureza);
eq('plataforma: Receita é recebimento', nat('Receita').every((n) => n === 'RECEBIMENTO') && nat('Receita').length > 0, true);
eq('plataforma: Despesa é pagamento', nat('Despesa').every((n) => n === 'PAGAMENTO') && nat('Despesa').length > 0, true);
eq('plataforma: Entre bancos fica de fora e é contado', [resP.resumo.transferencias, resP.linhas.filter((l) => l.tipo === 'Entre bancos').every((l) => l.status === 'ignorada')], [3, true]);
eq('plataforma: complemento vai para o histórico', resP.lancamentos.some((l) => l.historico.includes(' · ref ')), true);
eq('plataforma: nada some', resP.resumo.validas + resP.resumo.erros + resP.resumo.ignoradas, resP.resumo.lidas);

// ── extrato com duas colunas de valor, SEM cabeçalho, com saldo e coluna D/C ──
const ext = [];
let saldo = 1000;
for (let i = 0; i < 14; i++) {
  const entrada = i % 3 === 0, v = 50 + i * 11.1;
  saldo += entrada ? v : -v;
  ext.push(['BANCO TESTE', String(1 + i).padStart(2, '0') + '/09/2026', 0, '000' + (1000 + i), (entrada ? 'RECEBIMENTO CLIENTE ' : 'PAGAMENTO FORNECEDOR ') + i, entrada ? '' : v.toFixed(2).replace('.', ','), entrada ? v.toFixed(2).replace('.', ',') : '', saldo.toFixed(2).replace('.', ','), entrada ? 'CR' : 'DB']);
}
ext.splice(6, 0, ['BANCO TESTE', '', '', '', 'TOTAL DE RECIBOS DO PERÍODO', '', '', '', '']);
eq('sem cabeçalho: dpCabPadrao devolve -1', C.dpCabPadrao(ext), -1);
const mapE = C.dpDetectarColunas(ext, -1);
eq('extrato: data na coluna B', mapE.data, 1);
eq('extrato: saída = F e entrada = G (saldo H fica de fora)', [mapE.valor, mapE.valorEntrada], [5, 6]);
const cfgE = C.dpNormalizarConfig({ contaCaixa: '1', ano: '2026' });
const resE = C.dpAnalisar(ext, -1, mapE, cfgE);
eq('extrato: entradas viram recebimento e saídas pagamento', [resE.lancamentos.filter((l) => l.natureza === 'RECEBIMENTO').length, resE.lancamentos.filter((l) => l.natureza === 'PAGAMENTO').length], [5, 9]);
eq('extrato: nenhum erro de valor', resE.resumo.erros, 0);
const sigA = C.dpAssinatura(ext, -1);
eq('assinatura sem cabeçalho é a forma das colunas', sigA.startsWith('forma:9:'), true);
eq('mesma forma, mesma assinatura (mês seguinte)', C.dpAssinatura(ext.slice(0, 8), -1), sigA);

// ── valor nas duas colunas ao mesmo tempo é erro ──
const dupla = [['Data', 'Histórico', 'Saída', 'Entrada'], ['01/09/2026', 'a', '10,00', ''], ['02/09/2026', 'b', '', '20,00'], ['03/09/2026', 'c', '5,00', '5,00'], ['04/09/2026', 'd', '', '']];
const resD = C.dpAnalisar(dupla, 0, { data: 0, valor: 2, valorEntrada: 3, fornecedor: 1, historico: 1, banco: '', tipo: '', extras: [] }, C.dpNormalizarConfig({ contaCaixa: '1' }));
eq('duas colunas: uma ok pagamento, uma ok recebimento', resD.lancamentos.map((l) => l.natureza), ['PAGAMENTO', 'RECEBIMENTO']);
eq('duas colunas: valor nas duas = erro; nenhuma = erro', resD.resumo.erros, 2);

// ── data suja entra com aviso, não some ──
const suja = [['Data', 'Valor', 'Descrição'], ['´06/04/2026', '10,00', 'compra de material'], ['07/04/2026', '20,00', 'outra compra'], ['', '30,00', 'sem data']];
const resS = C.dpAnalisar(suja, 0, { data: 0, valor: 1, fornecedor: 2, historico: 2, banco: '', tipo: '', extras: [] }, C.dpNormalizarConfig({ contaCaixa: '1' }));
eq('data suja: lançada com aviso', [resS.linhas[0].status, resS.linhas[0].avisos.some((a) => a.includes('caracteres extras'))], ['aviso', true]);
eq('data vazia com valor continua erro', resS.linhas[2].status, 'erro');

// ── linha de total COM data vira aviso ──
const totl = [['Data', 'Valor', 'Descrição'], ['06/04/2026', '10,00', 'compra'], ['30/04/2026', '10,00', 'TOTAL DO MÊS']];
const resT = C.dpAnalisar(totl, 0, { data: 0, valor: 1, fornecedor: 2, historico: 2, banco: '', tipo: '', extras: [] }, C.dpNormalizarConfig({ contaCaixa: '1' }));
eq('total com data: aviso para conferir', resT.linhas[1].avisos.some((a) => a.includes('total')), true);

// ── mapa antigo (sem valorEntrada/extras) continua funcionando ──
const resV = C.dpAnalisar(suja, 0, { data: 0, valor: 1, fornecedor: 2, historico: 2, banco: '', tipo: '' }, C.dpNormalizarConfig({ contaCaixa: '1' }));
eq('mapa antigo salvo no Firestore ainda analisa', resV.resumo.validas, 2);

// ── confiança ──
const cfOk = C.dpConfianca(plat, cabP, mapP, resP, C.dpNormalizarConfig({ contaCaixa: '1' }));
eq('confiança: layout da plataforma é pronto', [cfOk.pronto, cfOk.geral], [true, 'alta']);
const ruim = [['x', 'y', 'z']]; for (let i = 0; i < 10; i++) ruim.push(['01/01/2026', i % 2 ? 'abc' : '1,00', 'texto ' + i]);
const mapR = { data: 0, valor: 1, fornecedor: 2, historico: 2, banco: '', tipo: '', extras: [] };
const cfR = C.dpConfianca(ruim, 0, mapR, C.dpAnalisar(ruim, 0, mapR, C.dpNormalizarConfig({ contaCaixa: '1' })), C.dpNormalizarConfig({}));
eq('confiança: mapeamento que gera muito erro é BAIXA e bloqueia', [cfR.geral, cfR.pronto], ['baixa', false]);
const cfSem = C.dpConfianca(ext, -1, mapE, resE, cfgE);
eq('confiança: sem cabeçalho é no máximo média', cfSem.geral, 'media');
eq('confiança: cada nota diz o campo', cfSem.notas.every((n) => n.campo && n.nota), true);

console.log(falhas ? `\n${falhas} FALHA(S), ${ok} ok` : `Tudo confere. (${ok} conferências)`);
process.exit(falhas ? 1 : 0);

