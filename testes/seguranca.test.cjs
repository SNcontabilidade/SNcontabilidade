// Testes da Fase 1/2 de segurança (partes puras) — rodar, da raiz do projeto: node testes/seguranca.test.cjs   (sem dependências)
// acesso.js + seguranca.js são carregados juntos, como no admin.html (acesso.js vem primeiro).
const fs = require('fs'), path = require('path');
const rd = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const m = { exports: {} };
new Function('module', rd('acesso.js') + '\n' + rd('seguranca.js') + '\nmodule.exports = Object.assign({}, module.exports, { acMesclarPerfil, acUniaoMensagens, acMsgErro });')(m);
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
  eq('e-mail do usuário "teste" é estável', G.sgEmail('e1d34c73af2f20168439eabd', 0), 'ce1d34c73af2f20168439eabd.0@acesso.sn.invalid');
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
  eq('ordem dos campos NÃO importa (Firestore devolve em ordem alfabética)', G.sgIgual({ z: 1, a: { y: 2, b: 3 } }, { a: { b: 3, y: 2 }, z: 1 }), true);
  eq('ordem dentro de arrays de objetos também', G.sgIgual([{ id: 'm1', text: 'x', at: 1 }], [{ at: 1, id: 'm1', text: 'x' }]), true);
  eq('ordem dos itens do array IMPORTA', G.sgIgual([1, 2], [2, 1]), false);
  eq('valor diferente num campo aninhado é detectado', G.sgIgual({ a: { b: 1 } }, { a: { b: 2 } }), false);
  eq('campo a mais é detectado', G.sgIgual({ a: 1 }, { a: 1, b: 2 }), false);
  eq('perfil do Firestore (ordem alfabética) igual ao do cadastro', G.sgIgual({ cnpj: '1', id: 'c1', razaoSocial: 'X', username: 'x' }, G.sgPerfil({ id: 'c1', razaoSocial: 'X', cnpj: '1', username: 'x', password: 's' })), true);
  eq('config cobre os 6 documentos compartilhados', G.SG_CONFIG_DOCS.length, 6);
  // cliente que já entrou pelo app novo: perfil tem último acesso/versão que o cadastro antigo não tem
  const antigoCad = G.sgPerfil({ id: 'c1', razaoSocial: 'X', cnpj: '1', username: 'x', mustChangePwd: true, password: 's' });
  const perfilAtual = { id: 'c1', razaoSocial: 'X', cnpj: '1', username: 'x', mustChangePwd: false, lastLogin: '2026-10-26T01:00:00Z', appVersion: '1.2.0' };
  eq('perfil após login novo continua "igual" na conferência', G.sgIgual(G.sgPerfilEstavel(perfilAtual), G.sgPerfilEstavel(antigoCad)), true);
  eq('mas mudar um dado de verdade (CNPJ) ainda é detectado', G.sgIgual(G.sgPerfilEstavel({ ...perfilAtual, cnpj: '2' }), G.sgPerfilEstavel(antigoCad)), false);
  eq('e mudar o login também', G.sgIgual(G.sgPerfilEstavel({ ...perfilAtual, username: 'y' }), G.sgPerfilEstavel(antigoCad)), false);

  // ── janela de convivência: junção do cadastro antigo com o perfil novo ──
  const antigo = { id: 'c1', mustChangePwd: true, appVersion: '1.1.0', lastLogin: '2026-10-01T10:00:00Z' };
  eq('sem perfil, fica o antigo', G.acMesclarPerfil(antigo, undefined), antigo);
  eq('acesso mais recente (perfil) vence: versão e data', ((o) => [o.appVersion, o.lastLogin])(G.acMesclarPerfil(antigo, { appVersion: '1.2.0', lastLogin: '2026-10-20T10:00:00Z', mustChangePwd: true })), ['1.2.0', '2026-10-20T10:00:00Z']);
  eq('acesso mais recente (antigo) vence', ((o) => [o.appVersion, o.lastLogin])(G.acMesclarPerfil(antigo, { appVersion: '1.0.0', lastLogin: '2026-09-01T10:00:00Z', mustChangePwd: true })), ['1.1.0', '2026-10-01T10:00:00Z']);
  eq('senha trocada no app NOVO (perfil=false) vale', G.acMesclarPerfil(antigo, { mustChangePwd: false }).mustChangePwd, false);
  eq('senha trocada no app ANTIGO (antigo=false) vale', G.acMesclarPerfil({ ...antigo, mustChangePwd: false }, { mustChangePwd: true }).mustChangePwd, false);
  eq('ninguém trocou: continua senha padrão', G.acMesclarPerfil(antigo, { mustChangePwd: true }).mustChangePwd, true);
  eq('a mescla não inventa campo de senha', 'password' in G.acMesclarPerfil(antigo, { password: 'x', mustChangePwd: true }), false);

  // ── conversas: união pelo id, sem perder mensagem de nenhum dos dois lados ──
  const a = [{ id: 'm1', text: 'oi', sentAt: '2026-10-01', readByAdmin: false }, { id: 'm2', text: 'r', sentAt: '2026-10-02', fromAdmin: true }];
  const b = [{ id: 'm1', text: 'oi', sentAt: '2026-10-01', readByAdmin: true }, { id: 'm3', text: 'nova', sentAt: '2026-10-03', readByAdmin: false }];
  const u = G.acUniaoMensagens(a, b);
  eq('união mantém as 3 mensagens, sem repetir', u.map((x) => x.id), ['m1', 'm2', 'm3']);
  eq('lida pelo admin em qualquer lado = lida', u.find((x) => x.id === 'm1').readByAdmin, true);
  eq('ordenada por data', u.map((x) => x.sentAt), ['2026-10-01', '2026-10-02', '2026-10-03']);
  eq('lista nula não quebra', G.acUniaoMensagens(null, undefined), []);
  eq('mensagem sem id é ignorada', G.acUniaoMensagens([{ text: 'x' }], []), []);

  // ── mensagens de erro do login nunca revelam se o usuário existe ──
  eq('senha errada e usuário inexistente dão a MESMA mensagem', G.acMsgErro({ code: 'auth/wrong-password' }), G.acMsgErro({ code: 'auth/user-not-found' }));
  eq('credencial inválida', G.acMsgErro({ code: 'auth/invalid-credential' }), 'Usuário ou senha inválidos.');
  eq('muitas tentativas', G.acMsgErro({ code: 'auth/too-many-requests' }).startsWith('Muitas tentativas'), true);
  eq('sem internet', G.acMsgErro({ code: 'auth/network-request-failed' }).startsWith('Sem conexão'), true);
  eq('erro desconhecido não vaza detalhe', G.acMsgErro({ code: 'xyz', message: 'segredo interno' }).includes('segredo'), false);

  console.log(falhas ? `\n${falhas} FALHA(S), ${ok} ok` : `Tudo confere. (${ok} conferências)`);
  process.exit(falhas ? 1 : 0);
})();
