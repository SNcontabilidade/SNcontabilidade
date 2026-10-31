// Testes do backup — rodar, da raiz do projeto: node testes/backup.test.cjs   (sem dependências)
const fs = require('fs'), path = require('path');
const m = { exports: {} };
new Function('module', fs.readFileSync(path.join(__dirname, '..', 'backup.js'), 'utf8'))(m);
const B = m.exports;
let ok = 0, falhas = 0;
const eq = (nome, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) ok++; else { falhas++; console.log('✖', nome, '\n   obtido :', a, '\n   esperado:', b); } };

// Timestamp do Firestore (objeto com toDate) vira texto ISO; o resto passa igual
const ts = { toDate: () => new Date('2026-10-25T12:00:00Z') };
eq('timestamp vira ISO', B.bkNormalizar(ts), { __timestamp: '2026-10-25T12:00:00.000Z' });
eq('aninhado em array e mapa', B.bkNormalizar({ a: [ts, 1, 'x', null], b: { c: ts } }), { a: [{ __timestamp: '2026-10-25T12:00:00.000Z' }, 1, 'x', null], b: { c: { __timestamp: '2026-10-25T12:00:00.000Z' } } });
eq('primitivos e null intactos', [B.bkNormalizar(null), B.bkNormalizar(5), B.bkNormalizar('t'), B.bkNormalizar(true)], [null, 5, 't', true]);
eq('timestamp quebrado não derruba', B.bkNormalizar({ toDate: () => { throw new Error('x'); } }), { __timestamp: null });

// montagem: contagens e conteúdo por id
const arq = B.bkMontar({ sn: [{ id: 'clients', data: { value: [{ id: 'c1' }, { id: 'c2' }] } }, { id: 'banks', data: { value: ['ITAU'] } }], sntx: [{ id: 'c1', data: { txs: [{ v: 1 }] } }] }, '1.1.0');
eq('contagens por coleção', arq.contagens, { sn: 2, sntx: 1 });
eq('documento restaurável pelo id', arq.colecoes.sntx.c1, { txs: [{ v: 1 }] });
eq('versão do app e formato', [arq.versaoApp, arq.formato], ['1.1.0', 1]);
eq('JSON ida e volta preserva tudo', JSON.parse(JSON.stringify(arq)).colecoes.sn.clients.value.length, 2);
eq('coleção vazia contada como zero', B.bkMontar({ sn: [] }, '').contagens, { sn: 0 });

// nome do arquivo e tamanho
eq('nome do arquivo', B.bkNomeArquivo(new Date(2026, 9, 5, 9, 7)), 'backup-sn_2026-10-05_0907.json');
eq('o nome casa com o .gitignore', /^backup-sn_.*\.json$/.test(B.bkNomeArquivo(new Date())), true);
eq('tamanho KB', B.bkTamanho(2048), '2 KB');
eq('tamanho MB', B.bkTamanho(1572864), '1,5 MB');
eq('coleções cobertas', B.BK_COLECOES, ['sn', 'sntx']);

// restauração: só quem está vazio no banco; nunca sobrescreve
const bk = { colecoes: { sn: { clients: { value: [{ id: 'a', razaoSocial: 'ZETA LTDA' }, { id: 'b', razaoSocial: 'ALFA LTDA' }, { id: 'c', razaoSocial: 'GAMA' }] } }, sntx: { a: { txs: [{ v: 1 }, { v: 2 }] }, b: { txs: [{ v: 3 }] }, c: { txs: [] }, d: { txs: [{ v: 4 }] } } } };
const P = B.bkPlanoRestauracao(bk, { a: [], b: [{ v: 9 }], c: [], d: null });
eq('restaura quem está vazio ou ausente no banco, em ordem alfabética', P.pode.map((x) => [x.id, x.nome, x.qtd]), [['d', 'd', 1], ['a', 'ZETA LTDA', 2]].sort((x, y) => String(x[1]).localeCompare(String(y[1]), 'pt-BR')));
eq('quem já tem lançamento no banco NÃO é restaurado', P.jaTem.map((x) => x.id), ['b']);
eq('cliente sem lançamento no backup não entra', [...P.pode, ...P.jaTem].some((x) => x.id === 'c'), false);
eq('documento ausente do mapa de atuais conta como vazio', B.bkPlanoRestauracao(bk, {}).pode.length, 3);
eq('arquivo sem sntx não quebra', B.bkPlanoRestauracao({ colecoes: {} }, {}), { pode: [], jaTem: [] });
eq('restaurar devolve exatamente os lançamentos do backup', P.pode.find((x) => x.id === 'a').txs, [{ v: 1 }, { v: 2 }]);

console.log(falhas ? `\n${falhas} FALHA(S), ${ok} ok` : `Tudo confere. (${ok} conferências)`);
process.exit(falhas ? 1 : 0);
