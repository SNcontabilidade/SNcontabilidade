// Testes da Fase 1 de segurança (parte pura) — rodar, da raiz do projeto: node testes/seguranca.test.cjs
const fs = require('fs'), path = require('path');
const m = { exports: {} };
new Function('module', fs.readFileSync(path.join(__dirname, '..', 'seguranca.js'), 'utf8'))(m);
const G = m.exports;
let ok = 0, falhas = 0;
const eq = (nome, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) ok++; else { falhas++; console.log('✖', nome, '\n   obtido :', a, '\n   esperado:', b); } };

(async () => {
  // usuário: caixa e espaços nas pontas não mudam o login (o app antigo comparava sem caixa)
  eq('normaliza usuário', G.sgNormUsuario('  FinPlast '), 'finplast');
  const h1 = await G.sgHashUsuario('FINPLAST'), h2 = await G.sgHashUsuario(' finplast ');
  eq('mesmo usuário (caixa/espaço) = mesmo hash', h1, h2);
  eq('usuários diferentes = hashes diferentes', h1 === await G.sgHashUsuario('finplast2'), false);
  eq('hash tem 24 hex', /^[0-9a-f]{24}$/.test(h1), true);
  eq('hash é estável (valor fixo: se mudar, derruba TODOS os logins)', await G.sgHashUsuario('teste'), 'e1d34c73af2f20168439eabd');

  // e-mail interno
  const em = G.sgEmail(h1, 0);
  eq('e-mail interno válido', /^c[0-9a-f]{24}\.0@acesso\.sn\.invalid$/.test(em), true);
  eq('versão da conta sobe no reset', G.sgEmail(h1, 2).includes('.2@'), true);
  eq('sem n usa 0', G.sgEmail(h1), em);
  eq('e-mail não revela o usuário', em.includes('finplast'), false);

  // senha do Authentication: Firebase exige 6+; a senha inicial (12345) tem 5
  eq('prefixo na senha', G.sgSenhaAuth('12345'), 'sn#12345');
  eq('senha curta passa de 6', G.sgSenhaAuth('12345').length >= 6, true);
  eq('senha vazia não quebra', G.sgSenhaAuth(null), 'sn#');

  // perfil: nunca leva a senha
  const c = { id: 'c1', razaoSocial: 'X', cnpj: '1', email: 'a@b', username: 'x', password: 'segredo', mustChangePwd: false, createdAt: 'd', appVersion: '1.1.0', lastLogin: 'd', lixo: 1 };
  const p = G.sgPerfil(c);
  eq('perfil sem senha', 'password' in p, false);
  eq('perfil sem campo estranho', 'lixo' in p, false);
  eq('perfil mantém os dados', [p.id, p.razaoSocial, p.cnpj, p.mustChangePwd], ['c1', 'X', '1', false]);
  eq('campo ausente não vira undefined', Object.keys(G.sgPerfil({ id: 'z', username: 'u' })), ['id', 'username']);
  eq('lista de campos do perfil não inclui senha', G.SG_CAMPOS_PERFIL.includes('password'), false);

  // validação e duplicados
  eq('cliente ok', G.sgValidarCliente(c), '');
  eq('sem usuário', G.sgValidarCliente({ id: 'a', username: ' ', password: 'x' }), 'sem usuário');
  eq('sem senha', G.sgValidarCliente({ id: 'a', username: 'u', password: '' }), 'sem senha');
  eq('sem id', G.sgValidarCliente({ username: 'u', password: 'x' }), 'cliente sem id');
  eq('senha numérica 0 é válida', G.sgValidarCliente({ id: 'a', username: 'u', password: 0 }), '');
  eq('duplicados por caixa', G.sgDuplicados([{ id: 'a', username: 'ALFA' }, { id: 'b', username: 'alfa ' }, { id: 'c', username: 'beta' }]), [['a', 'b']]);
  eq('sem duplicados', G.sgDuplicados([{ id: 'a', username: 'x' }, { id: 'b', username: 'y' }]), []);

  // comparação usada na conferência
  eq('igual ignora undefined vs null', G.sgIgual(undefined, null), true);
  eq('diferente detecta', G.sgIgual({ a: 1 }, { a: 2 }), false);
  eq('config cobre os 6 documentos compartilhados', G.SG_CONFIG_DOCS.length, 6);

  console.log(falhas ? `\n${falhas} FALHA(S), ${ok} ok` : `Tudo confere. (${ok} conferências)`);
  process.exit(falhas ? 1 : 0);
})();
