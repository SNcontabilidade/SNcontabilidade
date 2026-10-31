# SN Soluções Contábeis — Sistema de Gestão Financeira (PWA)

Documento oficial do projeto: arquitetura, regras de negócio, publicação e **histórico de alterações**.
Quem for mexer no código (pessoa ou IA) lê este arquivo antes e **atualiza este arquivo depois** — ver
[Regra de ouro](#regra-de-ouro--toda-alteração-entra-aqui).

---

## Regra de ouro — toda alteração entra aqui

Toda mudança no projeto (código, regra de negócio, estrutura, dado, publicação) **precisa**, no mesmo commit:

1. Ganhar uma **entrada no topo do [Histórico de alterações](#histórico-de-alterações)** (data, versão, pedido,
   o que foi feito, decisões e porquês, como foi validado, pendências).
2. Atualizar a **seção de regra/estrutura** correspondente deste arquivo, se a mudança alterou algo que ela descreve.
3. Se for uma entrega para os clientes: **subir `APP_VERSION`** (`app.js`, linha 1) **e `CACHE_NAME`** (`sw.js`,
   linha 3) — sem a segunda o navegador não reconhece versão nova (ver [PWA](#pwa-e-atualização-automática)).
4. Ser commitada **junto** com o `CLAUDE.md` (nunca publicar código sem a entrada no histórico).

Não crie outro MD de documentação: este é o único.

---

## 1. Finalidade e público

Sistema web de **controle financeiro de clientes de um escritório de contabilidade** (SN Soluções Contábeis).
Dois públicos, duas portas de entrada:

| Público | Entrada | O que faz |
|---|---|---|
| **Cliente** (empresa atendida) | `index.html` (site/PWA instalável) — login com **usuário e senha** | Lança receitas, despesas e demais movimentações, anexa comprovante, acompanha painel, histórico, pendências a pagar, troca mensagens com o escritório, imprime/exporta relatório |
| **Administrador** (equipe SN) | `admin.html` — login com **conta Google autorizada** | Cadastra clientes, vê o consolidado e o painel de cada cliente, mantém bancos/descrições/operações, envia comunicados, sincroniza com Google Sheets |

URL de produção (cliente): `https://sncontabilidade.github.io/SNcontabilidade/` · admin: `.../admin.html`.

## 2. Arquitetura

Site **100% estático**, sem build, sem `package.json`, sem framework, sem módulos ES. **Tudo é global do browser.**

```
index.html / admin.html
  ├─ style.css
  ├─ Chart.js 4.4.0 (CDN)
  ├─ Firebase 10.12.0 compat: app + firestore + auth (CDN)
  ├─ firebase.initializeApp({...})  + const ADMIN_MODE = false|true   (inline, em cada HTML)
  └─ app.js  ← toda a aplicação (~1600 linhas, HTML por template string)
index.html ainda registra o service worker (sw.js) e faz o recarregamento automático em versão nova
```

- **Um arquivo de lógica só:** `app.js`. Não há roteador: navegar = mudar `S.page` / `S.clientTab` /
  `S.adminView` e chamar `render()`, que reescreve `#app` inteiro com `innerHTML` e recria os gráficos.
- **Mesmo `app.js` para cliente e admin.** Quem decide é `const ADMIN_MODE` (definida no HTML antes do
  `app.js`): `IS_ADMIN_PAGE = typeof ADMIN_MODE!=='undefined' && ADMIN_MODE===true`. O `admin.html` **não**
  registra service worker (não é PWA).
- **Eventos por `onclick="..."` inline** chamando funções globais. Não há delegação.
- **Persistência:** Firebase Firestore (SDK *compat*), sem backend próprio. Imagens: Cloudinary (upload sem
  assinatura). Planilha: Google Sheets API (só admin).
- **Estado:** um objeto global `S` (ver [seção 5](#5-estado-global-s)).

### Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Página do cliente. Meta tags PWA, inicializa Firebase, `ADMIN_MODE=false`, carrega `app.js`, registra `sw.js` e faz o recarregamento automático |
| `admin.html` | Página do administrador. Mesmo Firebase, `ADMIN_MODE=true`, **sem** service worker. Carrega também `depara.css`, `depara-core.js` e `depara.js` (o DE-PARA **não** é carregado na página do cliente) |
| `depara-core.js` | **DE-PARA, núcleo puro** (sem DOM e sem Firebase): lê data/valor, detecta cabeçalho e colunas, resolve contas, analisa linha a linha e gera o `.txt`. Roda no navegador e no Node (testes). Prefixo `dp*`/`DP_*` |
| `depara.js` | **DE-PARA, tela do admin**: clientes no Firestore, upload, prévia, mapeamento, regras, geração. Expõe `admDepara()` |
| `depara.css` | Estilo do DE-PARA, tudo prefixado `.dp-` e só com variáveis de tema do app |
| `testes/depara-core.test.cjs` | Única bateria automatizada do projeto: `node testes/depara-core.test.cjs` (109 conferências do núcleo) |
| `testes/exemplo-depara.xlsx` | Planilha de exemplo **propositalmente bagunçada** (dados fictícios) para testar o DE-PARA |
| `backup.js` | **Backup do banco (só admin)**: botão "💾 Backup do banco" na barra lateral que baixa um `.json` com todas as coleções (`BK_COLECOES`). Carregado só pelo `admin.html`; no `app.js` há **1 encaixe** (`bkBotaoHTML` no rodapé da barra). Prefixo `bk*` |
| `testes/backup.test.cjs` | Testes do backup (`node testes/backup.test.cjs`) |
| `testes/valor.test.cjs` | Testes do **campo de valor** (`node testes/valor.test.cjs`): extrai do `app.js` o trecho entre os marcadores `CAMPO DE VALOR` |
| `testes/saldo.test.cjs` | Testes da **fórmula única do saldo** (`node testes/saldo.test.cjs`): extrai do `app.js` o trecho de `isNeg` até `calcResumo`, então nunca diverge do código real. Cobre o caso do cliente, cada operação e a ordem por vencimento |
| `acesso.js` | **Acesso do cliente (v1.2.0)** — carregado por `index.html` **e** `admin.html`, antes do `app.js`: regras de usuário→conta (`sg*`: hash, e-mail interno, senha do Authentication, `sgPerfil`), login e carga **só dos dados do próprio cliente** (`ac*`: `acEntrar`, `acCarregarCliente`, `acIniciarCliente`), junção do modelo antigo com o novo para o admin (`acMesclarPerfil`, `acUniaoMensagens`, `acMesclarNovoAdmin`) e espelho das configurações (`acEspelharConfig`) |
| `layout-moderno.css` | **Tema moderno (v1.3.0)**, carregado por `index.html` e `admin.html` **depois** do `style.css` e sobrescrevendo por cima: variáveis de cor/raio/sombra, tipografia Inter, cartões, sidebar, cabeçalho, botões, formulários, login e o **cartão de Saldo** do painel (`.sn-hero`, `.sn-minis`). Só aparência: nenhuma regra de negócio. Tema claro em `body.light` |
| `layout-moderno.js` | Carregado **depois** do `app.js`: (1) troca só a URL de **entrega** dos ícones do Cloudinary (tamanho, formato, cantos) — nenhum arquivo original muda; (2) `snPainelHero`, o cartão de Saldo que o `screenPainel` chama; (3) envolve `buildClientCharts`/`buildAdminCharts` e restiliza os gráficos (barras com gradiente, rosca com total no centro). Cada bloco é protegido: se falhar, o app segue com o visual simples |
| `seguranca.js` | **Segurança dos dados, Fases 1–2 (só admin):** tela "Segurança" com 3 botões — criar a conta de acesso de cada cliente no Firebase Authentication (mesma senha de hoje), copiar os dados para coleções por cliente e conferir de ponta a ponta. **Não altera** os dados que o app atual usa. Carregado só pelo `admin.html`; no `app.js` há **3 encaixes** (item de menu, título e roteamento). Prefixo `sg*` |
| `testes/seguranca.test.cjs` | Testes da parte pura da Fase 1 (`node testes/seguranca.test.cjs`) |
| `.gitignore` | Impede versionar `backup-sn_*.json`: o backup contém dados de clientes e **nunca** vai para o Git |
| `app.js` | Toda a aplicação (constantes, estado, Firestore, login, admin, cliente, relatório, gráficos, init) |
| `style.css` | Tema escuro/claro por variáveis CSS (`:root` e `body.light`), layout admin (sidebar) e cliente (topbar + bottom-nav) |
| `sw.js` | Service worker: rede primeiro sem cache HTTP, cai no cache offline; `CACHE_NAME` |
| `manifest.json` | PWA: `start_url index.html`, `display standalone`, ícones 192/512, `theme_color #f59e0b` |
| `icon-192.png`, `icon-512.png` | Ícones do PWA |
| `SNicon/` | Pasta **só local** (imagens-fonte de logos/ícones). **Fora do Git** (`.git/info/exclude`); as imagens em uso vêm do Cloudinary |
| `CLAUDE.md` | Este documento |

### Mapa do `app.js` (ordem do arquivo)

| Bloco | Conteúdo |
|---|---|
| Constantes | `APP_VERSION`, logos, `SPREADSHEET_ID`/`SHEETS_URL`, `CFG` (tamanhos de ícone), `BANK_LOGOS`, `OP_ICONS`, `NAV_ICONS`, `OPS`, `DEFAULT_BANKS`, `DEFAULT_DESCRIPTIONS`, `OP_DESCRIPTIONS_DEFAULT`, `PC` (paleta de gráficos) |
| `S` | Estado global |
| Firestore | `fsGet/fsSet` (coleção `sn`), `fsGetTx/fsSetTx` (coleção `sntx`), `loadAll`, `save*` |
| Helpers | `uid`, `todayStr`, `localToday`, `isNeg`, `isSaida`, `fluxoSinal`, `calcResumo`, `fmtCur`, `fmtDate`, `addMonths`, `splitParcelas`, `isPend`, `dueTxs`, `parcTag`, `pendKpi`, `esc`, `getOp`, `getClient`, `getClientTx`, `q`, `allTx` |
| Tema | `applyTheme`/`toggleTheme` (`localStorage 'sn:theme'`) |
| `render()` | Roteia por `S.page`: `login`, `changepwd`, `admin`, `client` |
| Login | `pageLogin`, `pageLoginAdmin`, `doLogin`, `doGoogleLogin`, `doChangePwd`, `doLogout` |
| Admin | `pageAdmin` + `admDashboard`, `admClients`, `admClientDetail`, `admBanks`, `admDescriptions`, `admOperacoes`, `admMensagens`, **`admDepara`** (vem de `depara.js`; no `app.js` só há **3 encaixes**: item `{id:'depara'}` do menu, título em `titles` e o `else if(S.adminView==='depara')` do roteamento); Google Sheets (`sheets*`, `syncAllToSheets`) |
| Mensagens | `unreadMsgs`, `sendBroadcastMsg`, `sendAdminReply`, `sendClientMsg`, `screenMensagens` |
| Cliente | `pageClient`, `screenPainel`, `screenNovo`, `screenHistorico`, `screenLista`, (`screenGrafico`/`screenTipos` legados), edição (`renderEditOverlay`), relatório (`printRelatorio`, `exportExcel`) |
| Gráficos | `buildAdminCharts`, `buildClientCharts` (Chart.js) |
| `INIT` | Restaura sessão do `sessionStorage`, `loadAll().then(render)` |

## 3. Ambientes, hospedagem e serviços externos

| Item | Valor / onde |
|---|---|
| Repositório | `https://github.com/SNcontabilidade/SNcontabilidade` (público), branch **`main`** |
| Hospedagem | **GitHub Pages**, servido da `main` — **publicar na `main` = produção em poucos minutos** |
| Projeto Firebase | projeto do escritório (config no `<script>` inline do `index.html` e do `admin.html` — **duplicada, alterar os dois**; os identificadores ficam só no código) |
| Cloudinary | conta do escritório, upload sem assinatura (parâmetros em `app.js`): logos, ícones de banco/operação e **comprovantes** |
| Google Sheets | planilha `SPREADSHEET_ID` (constante em `app.js`); escrita via API v4 com o token OAuth do login Google do admin |
| Conta admin | constante `ADMIN_EMAIL` em `app.js` — única conta aceita no login Google |
| SheetJS | `xlsx@0.18.5` via jsDelivr, **carregado sob demanda** (`loadSheetJS`): ao exportar Excel e ao ler planilha no DE-PARA |
| pdf.js | `pdf.js@3.11.174` via cdnjs, **só no DE-PARA e só ao enviar um PDF** (`dpCarregarPdfJs`) |

Não há `.env`: **tudo é constante no código** (chaves públicas de cliente). A proteção dos dados é feita **no console do
Firebase** (regras do Firestore, fora do repositório). **Este repositório é público:** não registre aqui chaves, IDs de
contas, senhas (nem padrão), regras do banco, nem detalhes de falhas de segurança — o plano de segurança fica fora do Git.

## 4. Modelo de dados (Firestore)

Duas coleções. **Não há migrations**; documento antigo precisa continuar abrindo (use `||` / `?.` ao ler campo novo).

### 4.1 Coleção `sn` — documentos `{ value: ... }` (via `fsGet/fsSet`)

| Doc | Conteúdo |
|---|---|
| `clients` | Array de clientes (ver abaixo) |
| `banks` | Array de nomes de banco (maiúsculas). Padrão: `DEFAULT_BANKS` |
| `descriptions` | Array de descrições cadastradas. Padrão: `DEFAULT_DESCRIPTIONS` |
| `descriptionops` | `{ "Descrição": ["op1","op2"] }` — quais operações enxergam cada descrição |
| `customops` | Array de operações personalizadas |
| `custombankicons` | `{ "BANCO": "url" }` — ícone próprio de banco |
| `messages` | Array de comunicados do admin para **todos** os clientes |
| `msgread` | `{ clientId: "ISO" }` — até quando o cliente leu |
| `clientmessages` | `{ clientId: [mensagens da conversa] }` |
| `txmap` | **Legado** (todos os lançamentos num doc só). Migrado e apagado automaticamente por `loadAll` |
| `depara_index` | **DE-PARA**: array `[{ id, nome }]` com os clientes do DE-PARA (**não** são os clientes do app) |
| `depara_c_<id>` | **DE-PARA**: configuração de um cliente do DE-PARA (ver abaixo). Um documento por cliente |

**Cliente** (`clients[]`): `id`, `razaoSocial`, `cnpj`, `email`, `username` (login, sem espaços, único sem distinção de
caixa), `password`, `mustChangePwd`, `createdAt`, `appVersion` e `lastLogin` (gravados a cada login).

**Operação personalizada** (`customops[]`): `{ id:'op_<uid>', label, color, iconUrl, createdAt }` — ícone obrigatório.

**Mensagem do cliente/admin** (`clientmessages[clientId][]`): `{ id, text(≤500), sentAt, readByAdmin, fromAdmin? }`.
**Comunicado** (`messages[]`): `{ id, text, sentAt }`.

**Cliente do DE-PARA** (`sn/depara_c_<id>` → `{ value: ... }`): `contaCaixa`, `contaPadrao` (padrão `999999`),
`delimitador` (`;` `,` `tab`), `decimalFmt` (`virgula`/`ponto`), `codificacao` (`ansi`/`utf8`), `naturezaPadrao`
(`PAGAMENTO`/`RECEBIMENTO`), `usarSinal` (bool), `ano`, `deParaLista` (`[{ nome, conta }]`), `regras`
(`[{ id, keywords[], banco, natureza, conta }]`, **a ordem é a prioridade**), `layout` (`{ assinatura, linhaCab, mapa,
aba }`, o último mapeamento de colunas confirmado) e `atualizadoEm`. O DE-PARA por nome é guardado como **lista**, não
como mapa, de propósito: nome de fornecedor com `.` ou `/` seria problema como chave do Firestore; em memória
(`cfg.deParaMap`) continua um mapa `{ nome: conta }`. `dpDeserializar` aceita a lista e também o mapa antigo
(`deParaMap`), mas **não há tela de exportar/importar `.json`** (foi removida a pedido do dono: a configuração já fica no
Firestore, por cliente). **A planilha enviada nunca é gravada.**

### 4.2 Coleção `sntx` — um documento por cliente: `{ txs: [...] }` (via `fsGetTx/fsSetTx`)

Documento separado por cliente para fugir do limite de 1 MB. **Cada gravação regrava o array inteiro do cliente**
(`saveTxMap(clientId)`); duas sessões editando o mesmo cliente ao mesmo tempo: **vale a última a gravar**.

**Lançamento** (`txs[]`) — campos:

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string | `uid()` |
| `date` | `AAAA-MM-DD` | Data do lançamento. **Nos contínuos = a data de cada mês** |
| `operation` | string | id da operação (`receita`, `despesa`… ou `op_xxx`) |
| `valor` | number | **Sempre positivo.** O sinal vem de `fluxoSinal(operation)` (regra 8.1) |
| `descricao`, `banco`, `complemento`, `responsavel` | string | `banco` pode ser `''` enquanto pendente |
| `comprovante` | string | URL Cloudinary (opcional) |
| `pagamento` | `'vista'` \| `'prazo'` \| `'continuo'` | Ausente em lançamento antigo (= à vista) |
| `status` | `'pago'` \| `'pendente'` | Ausente em lançamento antigo (= pago) |
| `vencimento` | `AAAA-MM-DD` | Só quando pendente |
| `pagoEm` | `AAAA-MM-DD` | Preenchido ao dar baixa em lançamento que era pendente |
| `parcelaNum`, `parcelaTotal` | number | Só no **a prazo** com mais de 1 parcela |
| `grupoId` | string | Une as parcelas/meses do mesmo lançamento (a prazo e contínuo) |
| `createdAt` | ISO | Ordena "últimos lançamentos" |
| `editedAt` | ISO | Gravado ao editar |

## 5. Estado global `S`

Objeto único no topo do `app.js`. Campos principais: `page` (`login`/`changepwd`/`admin`/`client`), `session`
(`{isAdmin:false, clientId}` ou `{isAdmin:true, adminEmail}`), `clients`, `txMap` (`{clientId:[tx]}`), `banks`,
`descriptions`, `descriptionOps`, `customOps`, `customBankIcons`, mensagens (`messages`, `msgRead`,
`clientMessages`), navegação (`clientTab`, `adminView`, `viewClientId`), formulário de lançamento (`selectedOp`,
`txDate`, `txForm`, `txPay`, `txParc`, `txDues`, `comprovante`, `descQuery`, `_bprev`), edição (`editTxId`,
`editTxForm`), filtros (`filters`, `filterOpen`), período (`selectedMonths`, `histPeriod`, `clientPeriod`, `period`),
exportação (`exportOpen`) e Sheets (`googleToken`, `sheetsStatus`, `syncProgress`, `syncTotal`).

- **Sessão:** `sessionStorage 'sn:session'` (some ao fechar a aba); token do Google em `'sn:googleToken'`.
  Tema: `localStorage 'sn:theme'` (`dark` padrão).
- `render()` destrói os gráficos e reescreve tudo: **nunca guarde estado só no DOM** — leia o que o usuário digitou
  com `saveFormState()` antes de um `render()` que mantenha o formulário (padrão usado em `selectOp`, `setPay`,
  `setParc`, `setDue`).

## 6. Autenticação e segurança

- **Cliente (v1.2.0):** `doLogin` → `acEntrar` (`acesso.js`): usuário+senha viram uma conta do **Firebase Authentication** e,
  só depois de entrar, `acCarregarCliente` baixa **apenas os dados dele** (perfil, lançamentos, conversa e configurações) —
  nunca a lista de clientes. O cliente usa uma **instância própria** do Firebase (`acApp()`/`acFirestore()`/`acAuth()`), para
  entrar como cliente não derrubar o login do Google do admin no mesmo navegador; a sessão vale só na aba. Cliente novo
  entra com a senha inicial e `mustChangePwd:true` → "Primeiro Acesso" (`pageChangePwd`), que troca a senha no Authentication
  (`doChangePwd`). "Reset senha" (admin) volta à senha inicial criando uma conta nova (`sgResetarAcesso`). **Não mude** o hash
  do usuário, o prefixo da senha nem o formato do e-mail interno (`acesso.js`): derrubaria todos os logins (há teste que fixa isso).
- **Admin:** `signInWithPopup` Google; só entra se `email === ADMIN_EMAIL`, senão faz `signOut`. Pede o escopo
  `spreadsheets` para o Sheets.
- **A proteção real dos dados depende das regras do Firestore**, configuradas no console (fora do repositório). A revisão de
  segurança está em andamento por fases e seu plano é mantido **fora do repositório público** (ver
  [Pendências](#13-pendências-e-armadilhas-conhecidas), item 3).
- **Janela de convivência:** enquanto houver clientes na versão antiga do app, o admin grava nos dois modelos (o antigo e o novo:
  `config`, `perfil`, `conversas`) e, ao carregar, junta o que a versão nova gravou (`acMesclarNovoAdmin`). Quem não atualizou
  continua funcionando. Fechar o modelo antigo é uma fase à parte, **só depois** de conferir a versão de cada cliente.
- **Escape:** texto digitado vindo do Firestore deve passar por `esc()` antes de virar `innerHTML`. Mantenha.
- `confirm()`/`alert()` são usados (remoção de cliente/lançamento, validações). Funcionam no site; **não** funcionam
  dentro de `iframe` com `sandbox` (ex.: Google Sites).

## 7. Telas e fluxos

### 7.1 Cliente (`pageClient`)

Abas (`S.clientTab`): **Painel**, **Lançamento** (`novo`), **Histórico**, **Mensagens**. Existe ainda a tela
**`lista`** ("Lançamentos", com filtros) — **sem item de menu**: só se chega nela pelo aviso de pendentes
(`showPendentes`). `grafico` e `tipos` são telas legadas sem acesso no menu.

- **Layout:** no **Painel** usa a sidebar (estilo desktop); nas demais abas, topbar + `bottom-nav` (mobile).
- **Faixa de aviso de vencimento** (`dueAlertHTML`) aparece no topo do Painel e das demais abas (exceto Mensagens)
  quando há pendente vencendo hoje ou já vencido — ver regra 8.6.
- **Painel** (`screenPainel`): seletor de período (meses, multi-seleção), cartão de **Saldo** (com a composição na
  linha de baixo) e cards (Receitas, Despesas, Outros, **Aplicações**, Lançamentos, **Pendente**), gráfico de barras diário (receita × despesa), rosca por operação,
  "Últimos Lançamentos" (8) e "Por Operação". Botão **Imprimir / Exportar**.
- **Lançamento** (`screenNovo`): data, grade de operações, formulário (regras na seção 8).
- **Histórico** (`screenHistorico`): um mês por vez (padrão = mês atual), 4 cards, "Por tipo de operação" e a lista de
  lançamentos com **editar** e **excluir**.
- **Mensagens** (`screenMensagens`): comunicados do escritório + conversa com o escritório.

### 7.2 Administrador (`pageAdmin`)

Menu: **Dashboard**, **Clientes**, **Bancos**, **Descrições**, **Operações**, **Mensagens**, **DE-PARA** + botões **Sheets**
(abre a planilha) e **Sincronizar**.

- **Dashboard** (`admDashboard`): 8 cards consolidados (clientes cadastrados, com lançamentos, total de lançamentos,
  total receitas, total despesas, **total aplicações**, saldo consolidado, **Pendente**), gráficos, últimos lançamentos de todos e ranking
  dos 5 clientes com mais lançamentos.
- **Clientes** (`admClients`): filtro por letra inicial, cartões com lançamentos/saldo/receitas/último movimento,
  **versão do app** de cada cliente (✓ verde se igual à atual, ⚠️ laranja se desatualizada), data do último acesso,
  selo "Senha padrão" / "Ativo" / "Sem lançamentos", barra de aviso com a contagem de desatualizados, botão
  **Copiar link do app**, criar/editar/**Reset senha**/**Remover**.
- **Detalhe do cliente** (`admClientDetail`): cabeçalho, 6 cards (inclui **Pendente**), gráficos, últimos 20
  lançamentos (pendente sem banco aparece como "⏳ pendente · data") e "Por Operação". **Somente leitura** — o admin
  não lança nem edita lançamento de cliente.
- **Bancos:** cadastrar (nome em MAIÚSCULAS, único) com ícone opcional (upload ≤ 2 MB), remover. Ícone próprio vence o
  padrão de `BANK_LOGOS`. Ícone de operação personalizada também é ≤ 2 MB.
- **Descrições:** agrupadas por operação; marcar quais operações usam cada descrição (`descriptionOps`); cadastrar
  (único sem distinção de caixa) e remover.
- **Operações:** as 9 padrão são fixas; o admin cria **operações personalizadas** (nome, cor, ícone obrigatório).
- **Mensagens:** comunicado para todos (`unshift` em `messages`), excluir comunicado, responder cada cliente
  (≤500 caracteres), marcar como lida; selo vermelho no menu com o total de mensagens de clientes não lidas.
- **DE-PARA** (`admDepara`, só admin): converte planilha/PDF de lançamentos em `.txt` para o Contmatic — regras na
  seção 8.11. Seções, nesta ordem: Cliente do DE-PARA → 1 Arquivo → 2 Prévia do arquivo → 3 Onde está cada informação →
  4 Como o sistema vai ler → 5 Configurações do cliente → 6 DE-PARA por nome → 7 Regras por palavra-chave → 8 Gerar e
  baixar. As seções 2 a 4 e 6 a 8 só aparecem com um arquivo carregado.

## 8. Regras de negócio

### 8.1 Operações e sinal

Operações padrão (`OPS`): **Receita, Retirada, Bens, Estoque, Despesa, Aporte, Investimento, Empréstimo, Entre bancos**
(esta última em largura total). Mais as personalizadas do admin.

- `valor` é sempre guardado positivo; o sinal é aplicado só na exibição e nas somas.
- **Sinal de cada operação (desde a v1.4.0), fonte única em `fluxoSinal(op)`:**
  - **Entra (+):** `receita`, **`aporte`** e **`emprestimo`** (`isEntrada`). Aporte e empréstimo **somam no card Outros** (não no card Receitas) **e refletem no saldo**.
  - **Sai (−):** `despesa`, `retirada` (`isNeg`), **compras** `estoque` e `bens` (`OPS_COMPRA`) e `investimento` (**aplicação**, `OP_APLICACAO`).
  - **Neutras (0):** `entre_bancos` e as personalizadas — não mexem no saldo.
  - `isNeg` continua significando só despesa/retirada (é o que define o card **Despesas**). `isSaida(op)` = `isNeg`, compra ou
    investimento (usada para sinal e cor na exibição).
  - **Pendente (a pagar) só entra no saldo depois de baixado.** O saldo é calculado só sobre lançamentos **sem** `status:'pendente'`
    (lançamento antigo sem status conta como pago); ao dar baixa (`status:'pago'`) a compra/despesa passa a descontar. Vale para
    qualquer operação pendente, inclusive receita a receber.

### 8.2 Cálculo dos cards (uma fórmula só de Saldo, em `calcResumo`)

Toda tela que mostra saldo chama `calcResumo(lista)` (painel e histórico do cliente, lista de lançamentos, relatório PDF e
Excel, dashboard, ranking, cartão e detalhe do cliente no admin, cartão de Saldo do layout moderno).

| Indicador | Regra |
|---|---|
| **Receitas** | soma de `operation==='receita'` (o aporte **não** entra aqui); `calcResumo` devolve `aporte` à parte, que o cartão de Saldo cita ("+ R$ X de aportes") |
| **Despesas** | soma das `isNeg` (**despesa + retirada**) |
| **Aplicações** (card próprio, `#14b8a6`) | soma de `investimento` |
| **Outros** | soma de tudo que não é `receita`, despesa/retirada **nem investimento** (estoque, bens, **aporte**, **empréstimo**, entre bancos, personalizadas). Estoque/bens (−), aporte e empréstimo (+) mexem no saldo; entre bancos e personalizadas não |
| **Saldo** | `Receitas + Aportes + Empréstimos − Despesas − Compras (estoque e bens) − Aplicações`, **só dos lançamentos já pagos** (pendentes ficam de fora até a baixa). `calcResumo` devolve também `liq` = os componentes pagos, que o cartão de Saldo lista |
| **Total Lançamentos** | quantidade de registros — **cada parcela / cada mês contínuo conta como um** |

Os cards Receitas/Despesas/Outros/Aplicações mostram o **total do período, com pendentes**; só o **Saldo** (e a composição no cartão) usa
os pagos. O card Pendente mostra quanto ainda falta pagar. Na lista, o filtro **Pendente** mostra "Total a pagar" no lugar do saldo.

**Pendente (card roxo `#a855f7`)** = soma de `valor` dos lançamentos com `status==='pendente'` (`pendKpi`), com a
quantidade entre parênteses. **Não é um valor a mais**: o pendente **já está** contado em Receitas/Despesas/Outros/Saldo
(a dívida existe desde o lançamento). O card só mostra quanto ainda não foi pago. Escopo: no Painel do cliente, o(s)
mês(es) selecionado(s); no detalhe do cliente (admin) e no dashboard do admin, **todos** os lançamentos.

### 8.3 Lançamento novo (`saveTx`)

Campos: **Data** (padrão hoje), **Operação** (obrigatória), **Valor** (> 0; ver **campo de valor** abaixo), **Descrição** (obrigatória, **tem de ser
uma da lista** da operação — `validateDesc` apaga texto fora da lista), **Comprovante** (foto ≤ 5 MB, vai ao
Cloudinary), **Pagamento**, **Banco**, Complemento e Responsável (opcionais).

- **Descrições por operação** (`getDescriptionsForOp`): usa `descriptionOps`; se a descrição **não tem nenhuma
  operação marcada**, cai no mapa padrão `OP_DESCRIPTIONS_DEFAULT`; descrição nova **sem operação marcada e fora do
  padrão não aparece em nenhuma operação**. Sem operação escolhida, lista todas.
- **Banco:** obrigatório quando o pagamento é **À vista**; **opcional** quando é **A prazo** ou **Contínuo**
  (é informado na baixa). O banco escolhido é preservado ao trocar a forma de pagamento (`S._bprev`).
- **Data × lançamento:** À vista usa a data do campo "Data"; A prazo usa a data do campo "Data" para todas as
  parcelas; **Contínuo usa a data de cada mês** como `date` e `vencimento`.

### 8.4 Forma de pagamento

Três botões em "Pagamento": **💵 À vista**, **🗓️ A prazo**, **🔁 Contínuo** (os três valem para **todas** as operações).

**À vista** → um lançamento `pagamento:'vista'`, `status:'pago'`, banco obrigatório.

**A prazo** (`prazoFieldsHTML`, `saveTx`):
- Escolhe-se a **quantidade de parcelas** (1x a 24x) e a **data de vencimento de cada parcela**.
- Ao informar/alterar o vencimento da parcela *i*, as seguintes são preenchidas de mês em mês **a partir da data
  alterada** (`addMonths(v, j-i)`), e cada uma ainda pode ser ajustada. Dia que não existe no mês cai no **último
  dia** (31/01 → 28/02 → 31/03; sempre calculado a partir da data-base, sem "deriva").
- O **valor digitado é o total**; divide-se em **centavos** (`splitParcelas`) e **a última parcela absorve a
  diferença** (R$ 100 em 3x = 33,33 + 33,33 + 33,34).
- **Cada parcela vira um lançamento separado**: `pagamento:'prazo'`, `status:'pendente'`, `vencimento`, `parcelaNum`,
  `parcelaTotal`, `grupoId` comum. Com 1 parcela não há numeração. Exibição: "descrição (2/3)" (`parcTag`).
- Qualquer data é permitida, **inclusive passada** (sem `min` no calendário).

**Contínuo** (`continuoFieldsHTML`, `contDates`) — conta recorrente (internet, aluguel, assinatura…):
- Informa-se só o **1º vencimento**. O sistema cadastra **um lançamento por mês, do 1º vencimento até dezembro do
  MESMO ano**, no mesmo dia de cada mês (dia inexistente → último dia do mês), todos com o **mesmo valor**
  (sem divisão).
- **Não é parcela**: sem `parcelaNum/parcelaTotal`, sem "(1/10)" na tela. Cada um é `pagamento:'continuo'`,
  `status:'pendente'`, `vencimento = date`, `grupoId` comum.
- **Limite de ano:** virou o ano, **o cliente precisa lançar de novo** (a tela avisa "Em jan/AAAA será preciso lançar
  novamente"). Não há geração automática no ano seguinte.
- 1º vencimento no passado gera também os meses passados (já nascem vencidos).
- Como existem lançamentos em meses futuros, o **mês exibido por padrão** (Painel e Histórico) é o **mês atual**
  (`pickMonth`: o mais recente que não está no futuro), não o último mês com lançamento.

### 8.5 Edição e baixa (`editTx`, `saveEditTx`)

- Editar abre uma folha com Data, Valor, Descrição (seletor + texto livre — **aqui a descrição não é validada contra a
  lista**), Pagamento, Banco, Complemento e Responsável. **Edita-se um lançamento por vez**: alterar uma parcela/mês
  **não** altera as demais do grupo.
- Botões **À vista (pago)** / **A prazo**:
  - **À vista (pago)** = **dar baixa**: exige banco; `status:'pago'`; `pagoEm` = hoje (se estava pendente);
    mantém `pagamento` original (`prazo`/`continuo`) e `vencimento`.
  - **A prazo** (pendente): exige data de vencimento; `status:'pendente'`; `pagoEm` apagado. Se o lançamento era
    `continuo`, **continua `continuo`**.
  - Trocar entre os botões **não perde** o que já foi digitado (`setEditPay`).
- Lançamento **antigo** (sem `status`) aparece na edição como À vista (pago).
- **Excluir** (`deleteTx`) apaga **só aquele** lançamento (parcela/mês), após `confirm`.
- O botão **✅ dar baixa** (na lista de pendentes) é atalho: abre a edição já em À vista (pago).

### 8.6 Aviso de pagamento pendente

- Pendente "chegou a hora" quando `status==='pendente'` e `vencimento <= hoje` (**vence hoje ou em atraso**;
  `dueTxs`, data **local**, `localToday()`, não UTC).
- Faixa roxa no topo: "**N pagamentos pendentes de baixa · R$ total**" + "X vencem hoje · Y em atraso".
  Tocar nela chama `showPendentes()`: abre a tela `lista` já filtrada em **Situação = Pendente de baixa**.
- **Só aparece quando o cliente abre/volta ao app.** Não há e-mail nem notificação push (exigiria backend).
- Na lista e no histórico, o pendente mostra "⏳ pendente · vence dd/mm/aaaa" (no histórico, no lugar do banco
  quando o banco está vazio).

### 8.7 Período e filtros

- **Painel:** `selectedMonths` (multi-seleção por mês/ano, "Selecionar tudo"); vazio = todos. Padrão = `pickMonth`.
  **Os cards usam esse filtro; o gráfico de barras e a rosca do Painel usam `S.clientPeriod` (sempre vazio hoje) →
  mostram TODOS os meses.** (pendência)
- **Histórico:** `histPeriod` (um mês por vez; padrão = `pickMonth`).
- **Lista:** filtros por data inicial/final, operação, **situação (pendente de baixa)**, banco, valor mín./máx. e
  busca (descrição, responsável, complemento, banco). `hasFilter` = qualquer filtro preenchido.

### 8.8 Relatório: Imprimir / Exportar

Botão **🖨️ Imprimir / Exportar** → janela com duas opções:
- **PDF / Imprimir** (`printRelatorio`): abre uma janela com o relatório (cabeçalho com logo, dados do cliente, tabela,
  totais) e dispara a impressão do navegador (o "salvar como PDF" é do próprio navegador). Exige *popup* liberado.
- **Excel (.xlsx)** (`exportExcel`): planilha com topo (cliente, CNPJ, geração), colunas **Data, Operação,
  Descrição (com "(n/N)"), Banco, Complemento, Responsável, Valor (R$), Situação (Pago/Pendente), Vencimento**,
  ordenada por data; **valor com sinal** (negativo em despesa, retirada e investimento, formato `#,##0.00;[Red]-#,##0.00`) e rodapé
  com **Receitas, Despesas, Compras, Aplicações, Saldo (sem os pendentes)** (fórmula da 8.2) e **Pendente (a prazo)**. Nome:
  `Relatorio_<CLIENTE>_<AAAA-MM-DD>.xlsx`. A biblioteca é baixada na hora; **sem internet cai para `.csv`**
  (`;`, vírgula decimal, BOM UTF-8).
- Os dois usam o mesmo recorte (`relatorioTxs()` = `S.clientPeriod`, hoje vazio ⇒ **todos** os lançamentos).

### 8.9 Mensagens

- **Comunicado** (admin → todos) e **conversa** (cliente ↔ escritório), máx. **500 caracteres**.
- **Não lido do cliente** = comunicados e respostas do admin com `sentAt > msgRead[clientId]`; abrir a aba marca como
  lido (`markAllRead`). Aviso no Painel ("Você tem N novas mensagens") e selo no ícone.
- **Não lido do admin** = mensagens de cliente com `readByAdmin !== true`.

### 8.10 Google Sheets (só admin)

- Uma **aba por cliente**, com o nome exato da `razaoSocial`; criada ao cadastrar o cliente (se há token do Google) e
  pelo botão **Sincronizar**.
- `syncAllToSheets`: lista abas → cria as que faltam (cabeçalho dourado, 1ª linha congelada) → **limpa `A2:F`** de
  todos → regrava, tudo em **lotes de 100**, com *retry* para HTTP 429 e aviso quando o token expira (401).
- Colunas: **Data, Operação, Valor (R$), Banco, Descrição, Comprovante**, ordenadas por data. **Valor vai sem sinal e
  a planilha não leva status, vencimento nem parcela** (pendência).
- Sem token (login Google feito em outra sessão) o botão pede logout/login.

### 8.11 DE-PARA — planilha → `.txt` do Contmatic (só admin)

Substitui o `conversor_depara.html` (arquivo avulso, com clientes só no `localStorage`) e mantém as mesmas
funcionalidades, **corrigidas**. Regra de ouro do módulo: **nenhuma linha some em silêncio** — toda linha lida termina
como `ok`, `aviso`, `erro` ou `ignorada`, sempre com o motivo e o **número da linha na planilha**. A lógica está em
`depara-core.js` (pura, testada) e a tela em `depara.js`; mexeu na regra? Mexa **no núcleo** e rode os testes.

**Clientes** (seção 4.1): criar (nome único, sem diferenciar caixa), renomear, excluir (`confirm`). Sem exportar/importar `.json`.
Trocar de cliente **descarta o arquivo carregado** — nunca se gera um arquivo com as regras de outro cliente. A
configuração é gravada sozinha (700 ms depois da última alteração); o selo "☁ salvo no Firebase" mostra o estado.

**Arquivo.** `.xlsx`/`.xls` (SheetJS) ou `.pdf` com texto selecionável (pdf.js; leitura **aproximada**: as colunas saem da
posição do texto e há o ajuste "distância mínima entre colunas", 4 a 80, padrão 18). A planilha é lida com
`cellDates:false`: datas chegam como **número de série do Excel** e são convertidas sem fuso horário (evita o erro de
um dia). Planilha com várias abas: escolhe-se a aba na prévia (abre na primeira que não está vazia).

**Cabeçalho e colunas (detecção automática, sempre conferível).**
- Cabeçalho (`dpDetectarCabecalho`) = a primeira linha, **antes da primeira linha com data**, com 2+ células de texto (que
  não sejam data nem valor) e, nas 5 seguintes, alguma data. Quem decide o padrão é `dpCabPadrao`: o detectado; senão a 1ª
  linha preenchida, ou **"sem cabeçalho"** (`-1`) se ela já é um lançamento. Texto com número no meio (`mês 5`) **não** é
  valor (`dpParseValor` exige só dígitos e separadores depois de tirar `R$`, sinal e parênteses).
- Colunas, nesta ordem: Data, **Valor** (ou o par Saída/Entrada), Histórico, Fornecedor, Banco, Tipo, **Extras** — pontuadas
  pelo **conteúdo** (parte de células que são data, que são número, tamanho médio, quantos valores diferentes, centavos)
  somado à **dica do título** (ex.: "Vlr", "Favorecido"). Banco só entra se o título ajudar. Com um único campo de texto,
  ele serve de fornecedor **e** de histórico. A tela avisa "✨ detectadas automaticamente — confira".
  - **Candidata a valor** = numérica, não-data, não só zeros, **não "numerinho" de 1–2 dígitos** (ordem/código), não
    número de documento (`00000040`) e sem "saldo" no título.
  - **Duas colunas de valor (`mapa.valorEntrada`):** vale o par de colunas que **nunca tem valor na mesma linha** (≥95%) e
    que, somado, cobre ≥80% das linhas com data (cada uma com ≥15% — juros/multa esparsos não formam par). O **saldo
    corrido fica de fora** porque está preenchido junto com as duas. Com título (entrada/crédito × saída/débito/pago) ele
    orienta; **sem título, a coluna da esquerda é a SAÍDA** (a tela mostra nota "média" mandando conferir).
  - **Tipo/Operação:** vale pelo título **ou** por reconhecer ≥70% dos valores (até 20 valores diferentes) — é assim que a
    coluna `OPERAÇÕES` da plataforma SN (9 operações) é achada. Só conta valor de até 20 caracteres (descrição livre com
    "pag…" não é Tipo).
  - **Extras (`mapa.extras`, até 3):** colunas de texto cujo título lembra complemento/observação/detalhe/memo e que têm
    ≥5% de preenchimento. O texto delas entra no histórico (`base · extra · extra`), então vale para regras, duplicados
    e para o `.txt`. Na tela, caixas de seleção em "Onde está cada informação".
- **Layout salvo:** a assinatura é a lista dos títulos do cabeçalho (sem caixa/acento); **sem cabeçalho** ela é a "forma"
  das colunas (`forma:9:tdnnttnnt` = quantas colunas e o tipo dominante de cada: d data, n número, t texto). Se o arquivo
  seguinte do cliente tiver a mesma assinatura, o mapeamento salvo é reaproveitado ("✔ layout reconhecido"). O layout é
  salvo quando se muda cabeçalho/coluna e ao gerar o arquivo. Obrigatórias: **Data**, **Valor** e **Fornecedor ou
  Histórico**. Layout salvo antes desta versão (sem `valorEntrada`/`extras`) continua abrindo (`dpMapaVazio` completa).

**Prévia do arquivo (seção 2).** Tabela com letra de coluna e número de linha, selo colorido do campo em cada coluna
mapeada, linhas **antes** do cabeçalho esmaecidas (são ignoradas), cabeçalho em destaque e datas já mostradas como data.
Clicar no número de uma linha a define como cabeçalho. Mostra 40 linhas (+50 / todas).

**Leitura de cada linha (`dpAnalisar`).**
1. **Em branco** (todas as células vazias): contada à parte, não é erro.
2. **Ignorada:** sem data **e** sem valor (título, observação, separador) ou linha cujo texto começa com
   total/subtotal/saldo/soma/resumo e que não tem data.
3. **Erro** (não entra no arquivo): data inválida, data vazia, valor vazio/não numérico ou **valor zero**.
4. **Data:** aceita `dd/mm/aaaa` (separador `/`, `-` ou `.`), `dd/mm/aa`, `aaaa-mm-dd`, `ddmmaaaa`, data/hora, número de
   série do Excel e `Date`. **Nunca adivinha `mm/dd`** (`10/25/2026` é erro). Ano entre 1990 e 2100; dia/mês existentes.
5. **Valor:** aceita `R$`, milhar e decimal nos dois padrões (`1.234,56` e `1,234.56`; o **último** separador é o decimal),
   `(1.234,56)`, `-1.234,56`, `1.234,56-`. `1.500` isolado vale **mil e quinhentos** (padrão brasileiro). Arredonda em
   centavos. **No arquivo o valor vai sempre positivo.**
6. **Natureza** (pagamento/recebimento), por prioridade: regra → **coluna de valor** (modo duas colunas: saída = pagamento,
   entrada = recebimento; valor nas **duas** na mesma linha = erro; negativo numa delas vira módulo com aviso; se a
   regra contradiz a coluna, vale a regra e a linha ganha aviso) → coluna **Tipo** → **sinal do valor** (só se a opção
   do cliente estiver ligada) → natureza padrão do cliente. A coluna Tipo reconhece primeiro a **tabela exata das
   operações da plataforma SN** — Receita, Aporte, Empréstimo = recebimento; Despesa, Retirada, Estoque, Bens,
   Investimento = pagamento; **Entre bancos = transferência** — e depois por palavra (`receb/entrada/crédito/receita/CR/C`
   × `pag/saída/débito/despesa/DB/D`); texto que não reconhece vira **aviso** e cai no passo seguinte. **Transferência
   entre bancos fica de fora do arquivo** (não dá para saber as duas contas): status `ignorada`, contada em
   `resumo.transferencias`, mostrada num chip e **conta como problema** (exige confirmar). O resumo guarda
   `origemNat` (quantas linhas vieram de regra/coluna/Tipo/sinal/padrão), que alimenta a nota de confiança.
7. **Conta do terceiro**, por prioridade: **regra** (a primeira que casar) → **DE-PARA exato** (nome idêntico, sem
   diferenciar caixa e acento) → **DE-PARA por aproximação** (o nome da linha *contém* o nome cadastrado; só para
   cadastros de **4+ letras** e vence o **mais longo**; gera aviso "conta por aproximação") → **conta para não
   identificados** (padrão `999999`, configurável; gera aviso "sem conta").
8. **Débito/crédito:** pagamento = débito na conta do terceiro e crédito no caixa; recebimento = débito no caixa e
   crédito na conta do terceiro. O DE-PARA por nome usa o texto da coluna Fornecedor (ou o histórico, se não houver).
9. **Avisos que não impedem a linha:** sem conta, aproximação, tipo não reconhecido, **possível duplicado** (mesma data +
   valor + histórico — já com as colunas extras — de outra linha, ela é mantida), **ano diferente** do "ano do arquivo"
   do cliente, **data suja** (`´06/04/2026`: o lixo no começo/fim é ignorado e a linha diz de qual texto foi lida) e
   **linha de total/saldo com data** ("confira se deve entrar" — a linha **entra**; só não entra a de total **sem** data).

**Nota de confiança da leitura (`dpConfianca`, painel na seção 4).** Diz o quanto o sistema tem de certeza de que
**entendeu o arquivo** — separado das contas que faltam (isso continua nos chips "sem conta"). Por campo: **data**, **valor**
e **histórico** (alta ≥97%/≥90% de linhas lidas; média ≥85%/≥60%), **natureza** (alta quando vem de regra/coluna/Tipo; média
quando muitas linhas caem no padrão do cliente ou no sinal) e **colunas** (média quando não há cabeçalho, quando os títulos
não confirmam a detecção ou quando as duas colunas de valor não têm título claro). **Mais de 10% das linhas com erro rebaixa
o valor para baixa** (o mapeamento provavelmente está errado). A leitura geral é a **pior** nota entre os campos; `baixa`
**exige a confirmação** antes de baixar o `.txt` (entra em `dpProblemas`). Cada nota diz o campo e o motivo em texto.

**Regras por palavra-chave.** Escolhe-se um lançamento de exemplo, clicam-se as palavras (ou digita-se uma) e a tela mostra
**na hora** os lançamentos impactados. A regra casa quando **todas** as palavras aparecem no histórico — **sem diferenciar
caixa e acento, e por pedaço de texto** (`TARIF` casa `TARIFA`) —, e, se tiver banco, quando o banco da linha é igual.
**Regra com banco só vale se a coluna Banco estiver mapeada** (no conversor antigo, sem a coluna, comparava com o
fornecedor); a tela avisa quando é o caso. A **ordem é a prioridade** (↑ ↓): vale a primeira que casar. Cada regra mostra
quantos lançamentos pega no arquivo aberto.

**Configurações do cliente.** Conta de caixa/banco (**obrigatória para gerar**), conta para não identificados, ano do arquivo
(nome do arquivo e aviso de datas de outro ano — **não filtra** nada), natureza padrão, usar o sinal do valor,
separador (`;`, `,`, tabulação), formato do valor (`1500,00` ou `1500.00`) e codificação.

**Arquivo gerado.** Uma linha por lançamento: `data;débito;crédito;valor;histórico` (separador e formato conforme o
cliente), terminada em `\r\n`. O **separador e as quebras de linha dentro do histórico viram espaço** (no conversor
antigo um `;` no histórico quebrava as colunas). Codificação **ANSI de verdade (Windows-1252)** por padrão — letras
acentuadas, `–`, `—`, `’`, `“ ”` e `€` são preservados; caractere sem correspondência vira `?` e a tela avisa quantos.
UTF-8 é opção. Nome: `<Cliente sem acento e sem espaço>_<ano>_Lctos.txt` (ex.: `PadariaPaoQuente_2026_Lctos.txt`).
Aviso quando o separador de campos coincide com o decimal (`,` + vírgula).

**Trava de segurança antes de baixar.** O botão só habilita com: ao menos 1 lançamento válido **e** conta de caixa
informada **e**, havendo erro, aviso ou linha sem conta, a caixa **"Revisei os avisos e quero gerar mesmo assim"**
marcada (a tela diz quantas linhas ficam de fora e quantas usam a conta de não identificados). Alterar regra, DE-PARA ou
configuração **desmarca** a confirmação. Há ainda o `.csv` "lista de problemas" (linha, situação, motivo, data e valor
lidos, histórico) para conferir fora do sistema.

**Segurança e privacidade.** A planilha é processada **só no navegador** e nunca é enviada nem gravada. Todo texto vindo do
arquivo ou do Firestore passa por `dpEsc` antes de virar `innerHTML`. A página só existe no `admin.html`.

## 9. PWA e atualização automática

- `sw.js`: **rede primeiro, sem cache HTTP** (`fetch(req,{cache:'no-store'})`) para qualquer GET do mesmo domínio;
  guarda no cache só resposta `ok`; **offline cai no cache**. `install` faz `skipWaiting`; `activate` apaga caches de
  outro nome e faz `clients.claim`. Caminho-base fixo `BASE='/SNcontabilidade'`.
- `index.html`: ao receber `controllerchange` (nova versão assumiu) **recarrega a página sozinho**; se o cliente
  estiver num lançamento/edição/exportação (`S.selectedOp||S.editTxId||S.exportOpen`) **espera terminar**. Também
  chama `reg.update()` quando o app volta ao primeiro plano.
- **O navegador só reconhece versão nova do service worker se o `sw.js` mudar** ⇒ **trocar `CACHE_NAME` a cada
  publicação** (`sn-v4`, `sn-v5`…). Subir também `APP_VERSION` (aparece no topo/login do app e no painel do admin).
- Quem já tinha o app com o `sw.js` antigo recebe a 1ª atualização no próximo abrir (pode precisar abrir duas vezes).
- O PWA **não precisa ser reinstalado** pelo cliente.
- Testar localmente (Live Server) **não** mostra a atualização automática; só vale em produção.

## 10. Padrões de código

- JS puro, sem transpilação, tudo global; HTML por template string. Comentários e mensagens em **português**.
- Valores monetários: **number** (`valor`); entrada via `<input type=number step=0.01>`; formatação `fmtCur` (pt-BR).
- Datas: guardadas como `AAAA-MM-DD`; exibidas com `fmtDate` (`T12:00:00` para evitar virar o dia por fuso).
  **Use `localToday()` para "hoje" em regra de vencimento** — `todayStr()` é UTC e à noite no Brasil já é "amanhã".
- Cores: tema por variáveis (`--accent #C8961C`, `--success`, `--danger`, `--blue`); pendente = `#a855f7`.
- Gráficos: sempre `destroyCharts()` antes de recriar (`render()` já faz).
- Campo de formulário que sobrevive a `render()`: ler com `saveFormState()` antes.
- Não use `alert`/`confirm` em fluxo novo se a tela puder rodar em `iframe` com sandbox.

## 11. Como validar

Não há lint nem CI. Há **uma** bateria automatizada, a do núcleo do DE-PARA. Rotina mínima:

1. `node --check app.js`, `node --check sw.js`, `node --check depara-core.js`, `node --check depara.js` (sintaxe) e
   `node testes/depara-core.test.cjs` (precisa terminar em "Tudo confere."). Mexeu no DE-PARA? Acrescente a conferência
   do caso novo no teste **antes** de corrigir.
2. Abrir `index.html` no **Live Server** (login de cliente) e `admin.html` (login Google admin).
3. Roteiro funcional: lançar À vista; lançar A prazo (3x, conferir centavos e datas); lançar Contínuo (conferir
   meses até dezembro); aviso de vencimento; dar baixa; editar; excluir; card **Pendente** no cliente e no admin;
   filtro Situação; Imprimir/Exportar (PDF e Excel); mensagens; sincronizar Sheets.
4. Conferir clientes e lançamentos **antigos** (sem `status`) ainda abrindo normalmente.
5. DE-PARA (admin): criar um cliente, enviar `testes/exemplo-depara.xlsx` (deve achar o cabeçalho na linha 4 e mapear as
   colunas sozinho), conferir "Como o sistema vai ler", criar uma regra, baixar o `.txt`, recarregar a página e ver o
   cliente e as regras de volta (Firestore); enviar de novo e ver "layout reconhecido".

## 12. Como publicar

1. Atualize `APP_VERSION`, `CACHE_NAME` e **este arquivo** (histórico + regras).
2. `git add -A && git commit` (mensagem em português, curta, dizendo o porquê).
3. `git push origin main` — **vai direto para produção** (GitHub Pages). O push abre o login do GitHub no navegador
   (Git Credential Manager); não há senha no repositório.
4. Aguardar ~1 min e conferir `https://sncontabilidade.github.io/SNcontabilidade/sw.js` (`CACHE_NAME`) e `app.js`
   (`APP_VERSION`) no ar.
5. Para algo arriscado: publicar em **branch**, abrir Pull Request e só então fazer o merge.

Voltar atrás: `git revert <commit>` + push (e nova troca de `CACHE_NAME`).

## 13. Pendências e armadilhas conhecidas

Confirmadas no código em 24/10/2026. Nenhuma foi alterada por não ter sido pedida.

1. ~~Duas fórmulas de Saldo~~ — **resolvida na v1.4.0**: fórmula única em `calcResumo` (regra 8.2). **Atenção:** a regra do
   saldo mudou duas vezes no mesmo dia por pedido do dono (ver o histórico de 30/10) e hoje é: pago sai das receitas
   (despesa, retirada, compras, aplicação); **pendente só desconta depois da baixa**. Aporte e empréstimo somam no saldo (aparecem em Outros).
   Não há linha "disponível × investido" separada.
2. **Gráficos e relatório do Painel ignoram o filtro de meses** (usam `clientPeriod`, sempre vazio) — mostram tudo,
   enquanto os cards respeitam a seleção.
3. **Segurança de acesso e de dados — em revisão.** O plano de correção (etapas, riscos e compatibilidade com o app dos
   clientes) é mantido **fora do repositório público**, de propósito. Não documente aqui detalhes de falhas.
4. **Sheets** não leva status/vencimento/parcela e grava valor sem sinal.
5. **Total Lançamentos** conta cada parcela/mês como um lançamento.
6. **Concorrência:** gravar o array inteiro do cliente; edição simultânea = última grava.
7. **Contínuo expira em dezembro** e não renova sozinho; lançamentos em meses futuros entram nos totais do mês deles.
8. **Descrição na edição é livre** (a do lançamento novo é validada pela lista).
9. **Aviso de vencimento só dentro do app** (sem e-mail/push).
10. **`todayStr()` é UTC** (usado ainda como data padrão do campo "Data"): à noite pode sugerir o dia seguinte.
11. **Telas legadas** (`grafico`, `tipos`) e a função `makeUser` não têm acesso/uso; `lista` só abre pelo aviso.
12. **`alert`/`confirm`** não funcionam em `iframe` com sandbox.
13. **DE-PARA — não validado com o Contmatic real.** O layout do `.txt` (`data;débito;crédito;valor;histórico`) foi
    herdado do conversor antigo; não houve importação de teste no sistema. Também não foram testados com arquivo real:
    leitura de **PDF**, gravação no **Firestore real** (as regras do console precisam permitir a escrita do admin nos
    documentos do DE-PARA) e o uso em **celular**.
14. **DE-PARA — não valida a conta contra o plano de contas** do cliente: um número digitado errado é aceito. Importar o
    plano de contas e avisar conta inexistente é o próximo passo natural.
15. **DE-PARA — PDF escaneado (imagem) não é lido.** O leitor (pdf.js) só pega texto selecionável: um PDF de imagem — como o
    "fechamento" de condomínio testado — devolve **zero linhas** e a tela recusa com aviso. Precisa de **OCR** (ex.:
    Tesseract.js, com revisão obrigatória) e talvez de um "modo por linha" para relatórios agrupados por categoria.
    Também **não** há leitura de Word (`.docx`), CSV ou OFX ainda, nem geração direta do `.txt` a partir dos lançamentos
    da própria plataforma SN (`sntx`). Nenhum dos três foi pedido para começar.
16. **DE-PARA — validado com 3 planilhas reais (25/10/2026), mas só no Node.** Detecção, natureza e contagem batem com o
    esperado em todas; a tela foi conferida só com dados fictícios. Falta o teste com login real e o `.txt` no Contmatic (item 13).
17. **DE-PARA — os clientes do `conversor_depara.html` antigo não migram:** ele guardava tudo no `localStorage` do navegador e,
    sem a tela de importar `.json` (removida), é preciso **recadastrar** cada cliente (conta, DE-PARA e regras). O arquivo
    antigo continua existindo fora do projeto.

---

## Histórico de alterações

> Uma entrada por mudança, **a mais recente no topo**. Formato: data · versão — pedido, feito, decisões e porquês,
> validação, pendências.

### 2026-10-31 · v1.4.1 (branch `feature/saldo-aplicacoes`, **não** publicada) — Campo de valor: digita normal, vírgula ou ponto

**Pedido do dono:** o campo de valor confundia os clientes (era `type="number"`, que se comporta diferente por navegador/idioma e rejeita
vírgula em alguns). Quer que o cliente **digite normal** (1234 = mil duzentos e trinta e quatro reais) e que, se ele usar **ponto ou vírgula**,
o campo também entenda.
**Feito:** os campos de valor do **lançamento novo** (`#f-valor`), da **edição** (`#edit-valor`) e do **filtro Mín./Máx.** da lista viraram texto com
teclado numérico do celular (`inputmode="decimal"`). **Ao digitar** (`valorMascarar` + `valorDigitando`, marcadores `CAMPO DE VALOR`): número inteiro é **em reais,
nunca centavos**; o campo põe o **ponto de milhar sozinho** (2222 → 2.222; 4 dígitos já viram mil, e assim por diante); o **ponto digitado é só enfeite
e é ignorado** (digitar `2.222,22` do jeito que se escreve dá 2.222,22); a **vírgula é o decimal**, até 2 casas; o cursor fica no mesmo dígito mesmo
inserindo no meio. **Ao colar** (`valorNormalizar`): `1234.5` = 1234,5 (ponto único com até 2 dígitos depois é decimal), `1.500` = 1500 (milhar),
`R$ 1.234,56` funciona. Ao sair do campo mostra `1.234,56` e ao entrar o texto fica selecionado; a edição abre com o valor formatado.
`parseFloat` saiu das quatro leituras (`parseValorBR`).
**Correção no mesmo dia:** a 1ª versão trocava o ponto digitado por vírgula (`2.` virava `2,`) e travava quem digitava `2.222,22`; o dono pediu o
milhar automático. **Decisões e porquês:** não é máscara de centavos (digitar 1234 não vira 12,34); o ponto **digitado** nunca é decimal (só o colado),
porque o milhar automático torna o ponto desnecessário e a leitura ao vivo confundia os dois — **risco aceito:** quem digitar `10.50` com ponto decimal
obtém 1.050 (o campo mostra `1.050` na hora); valor negativo não existe (o sinal é descartado).
**Validação:** `node testes/valor.test.cjs` (41 conferências) e os demais; `node --check` limpo. No ambiente de teste (Firebase simulado, arquivos reais):
digitando de verdade (teclado) `2.222,22` o campo mostra `2.222,22`, `1234567` vira `1.234.567` e inserir um 9 no meio mantém o cursor; ao sair `1234.5` colado vira `1.234,50`; salvar `1234`, `89,9`, `1.234,56`, `2500.75` e `1.500` gravou 1234, 89,9,
1234,56, 2500,75 e 1500; a edição abriu com `1.234,56` e salvou `2.000,10` como 2000,1. `CACHE_NAME` `sn-v8`, `APP_VERSION` `1.4.1`.
**Também nesta versão — complemento (fornecedor) visível para identificar de quem é o lançamento:** além da lista de lançamentos (já tinha,
v1.4.0), agora aparece no **Histórico** (linha em negrito abaixo da descrição, classe `tx-compl`) e em **Últimos Lançamentos** do painel (cliente e
admin), sempre com `esc()`. A lista com o filtro Pendente já mostrava.
**Pendências:** teste do dono no celular (teclado numérico) e no Live Server antes de publicar.

### 2026-10-30 · v1.4.0 (branch `feature/saldo-aplicacoes`, **não** publicada) — Saldo único, card Aplicações e lista com complemento

**Pedido (duas ponderações do dono):** (1) na lista de lançamentos mostrar o **complemento** (fornecedor) e, **só no filtro Pendente**,
ordenar por **vencimento** (o que vence primeiro no topo); (2) o **investimento** tem de **subtrair das receitas**, **não** pode somar em
"Outros" e ganha **card próprio "Aplicações"**. **Duas correções no mesmo dia:** (a) a 1ª versão subtraía compras e somava aportes/empréstimos e o dono
reclamou ("era só para subtrair meu investimento das minhas receitas"); (b) esclarecido o pedido final: **todo lançamento de compra e
afins sai das receitas, menos os a pagar, que só descontam quando o dono atualizar (baixar) ao chegar a data**.
Regra final: `Receitas − Despesas − Compras (estoque e bens) − Aplicações`, **só de lançamentos pagos**.
**Feito:**
- `calcResumo(lista)` + `fluxoSinal`/`isSaida`/`OP_APLICACAO` no `app.js`: **uma fórmula só** de saldo
  (regras 8.1 e 8.2), usada em painel, histórico, lista, PDF, Excel, dashboard, ranking, cartão e detalhe do cliente e no cartão de
  Saldo do `layout-moderno.js`. Acabou a divergência entre telas (antiga pendência 1).
- Card **Aplicações** (`#14b8a6`) no painel, histórico, detalhe do cliente e dashboard do admin; "Outros" deixa de somar investimento;
  o cartão de Saldo mostra a composição **dos pagos** (receitas − despesas − compras − aplicações) e avisa quando há pendentes. `layout-moderno.css`: a faixa
  de mini cards passou a `auto-fit` para caber o card novo.
- Lista: linha do **complemento** em cada lançamento; filtro Pendente ordena por vencimento crescente (sem vencimento no fim, empate
  pela data do lançamento); saldo do resumo da lista vem de `calcResumo` (no filtro Pendente o resumo vira "Total a pagar"); nome do banco só aparece em texto quando não há logo
  (corrige o nome duplicado); `bankLogo` passou a escapar nome/alt. Sinal e cor de exibição usam `isSaida` (despesa, retirada, estoque, bens e aplicação
  aparecem com "−"; aporte, empréstimo etc. continuam positivos).
- **Legenda do cartão de Saldo some sozinha** (pedido do dono: "vai chegar uma hora que vai atrapalhar"): aparece ao abrir, some em 7 s com
  transição suave (`.sn-hero__sub.is-oculta`, `LEGENDA_MS` em `layout-moderno.js`) e o botão **ⓘ** ao lado do período mostra de novo
  (`snHeroLegenda(true)`), sumindo outra vez. Cada render do cartão reinicia a contagem.
- **Gráfico de linha do cartão de Saldo** (`minigrafico`/`snPainelHero`): ficou de fora quando o saldo passou a contar só os pagos — com 0 ou 1 dia pago
  a série tinha menos de 2 pontos e o gráfico não era desenhado. Agora a linha é **dia a dia** (dia sem movimento repete o saldo anterior), do
  primeiro ao último lançamento do período (pendentes só alargam o intervalo); lançamento baixado entra no dia da baixa (`pagoEm`); um dia só
  começa no dia anterior com saldo 0.
- **Aporte** (pedido do dono, depois dos testes): entra no **saldo** como entrada e fica somado no card **Outros** — **não** no card Receitas
  (1ª tentativa o somou à receita; o dono corrigiu). O cartão de Saldo mostra "X de receitas + Y de aportes". Os gráficos de barras
  receita × despesa continuam só com receita. 
- **Empréstimo** (pedido seguinte do dono): passa a somar no saldo e em Outros, igual ao aporte; o cartão cita "+ R$ X de empréstimos".
- `sw.js`: `CACHE_NAME` `sn-v7`. `APP_VERSION` `1.4.0`.
**Decisões e porquês:** o saldo é **regime de caixa** — só conta o que já foi pago/recebido, pela marca `status` (pendente × pago), sem
olhar a data de vencimento: o dono é quem dá a baixa. Vale para **qualquer** operação pendente (inclusive receita a receber);
entre bancos/personalizadas ficam neutros (não pedidos); os cards (Receitas, Despesas, Outros, Aplicações)
continuam com o total do período, pendentes incluídos, e o card Pendente diz quanto falta pagar; `isNeg` não mudou de significado
(card Despesas); o dado salvo não muda. **Efeito esperado:** saldo de quem tem compra/investimento **paga** cai; o que está a pagar
só pesa depois da baixa. Quem mexe em pendente já existente vê o saldo mudar na hora da baixa.
**Validação:** `node testes/saldo.test.cjs` (27), `seguranca.test.cjs`, `backup.test.cjs`, `depara-core.test.cjs`; `node --check` limpo.
No ambiente de teste local (Firebase simulado, arquivos reais): cenário do dono (receita 5.987,83, despesa 29,39, três compras de estoque
pendentes, uma paga de 500,00, investimento 1.000,00) → saldo 4.458,44; ao baixar uma pendente de 2.107,50 → 2.350,94; lista Pendente ordenada por vencimento com
complemento; admin com o mesmo cálculo; sem erro no console.
**Pendências:** teste do dono no Live Server (cliente e admin, PDF/Excel) antes de publicar; avaliar a linha "disponível /
investido" que o dono citou como exemplo.

### 2026-10-26 · v1.3.0 (correção, branch `fix/botoes-card-cliente`) — Botões do card de cliente vazavam pela borda (admin)

**Bug (achado pelo dono):** em **Clientes**, no admin, os botões Editar / Reset senha / **Remover** passavam da borda direita de cada card.
**Causa:** o rodapé do card (`.cl-card-footer`) tem o selo ("Senha padrão"/"Ativo") **e** três botões na mesma linha; o tema novo aumentou o
espaço interno dos botões e a linha deixou de caber na largura mínima do card (280px, `minmax(280px,1fr)` do `.cl-grid`).
**Feito (só CSS, em `layout-moderno.css`):** o rodapé quebra em duas linhas — o selo em cima e os **3 botões lado a lado, de larguras iguais**,
embaixo; `.cl-card{min-width:0}`, botões `btn-sm` um pouco mais compactos. Sem mudança de HTML, de regra ou de versão.
**Validação:** reproduzido no navegador de teste forçando o card em 280px com o CSS antigo (**4 botões fora do card**, um por card) e com
a correção (**0**); conferido também na largura normal (346px), no tema claro e no celular (375px, sem rolagem lateral).
**Aprendizado:** ao mexer em padding/tamanho de botão do tema, conferir os rodapés de card na **largura mínima** (280px), não só na média.

---

### 2026-10-25 · v1.3.0 (publicada na `main`) — Layout moderno nos dois ambientes (cliente e admin)

**Pedido:** aplicar de verdade a prévia do layout moderno ("versão 2": cartão de Saldo e gráficos refeitos) **no app do cliente e no
admin**, com os ícones melhorados. Era só prévia no ambiente de teste (ligada por `?v2=1`/`?ui=novo`); nunca tinha entrado no projeto.
**Feito:** `layout-moderno.css` (tema base + cartão de Saldo, em arquivo único) e `layout-moderno.js` (ícones + cartão + gráficos),
ligados no `index.html` e no `admin.html`; **um encaixe** no `app.js`: `screenPainel` chama `snPainelHero(...)` no lugar da grade de 6
cards (com `typeof` — sem o arquivo, volta à grade antiga). `APP_VERSION` 1.3.0, `CACHE_NAME` `sn-v6`, e os dois arquivos novos no cache do `sw.js`.
**Decisões e porquês:**
- **Sem as chaves de prévia** (`?v2=1`, `?ui=novo`, `?ic=novo`): o visual é sempre o novo.
- **Sem o `render()` final** que a prévia tinha: com o login pelo Authentication os scripts carregam antes do 1º desenho real, e esse
  `render()` mostraria a tela de login por um instante, mesmo para quem já está logado.
- **O cartão de Saldo usa os mesmos números do painel antigo** (`rec`, `desp`, `outros`, `saldo`, `txs`, `slicerLabel`): nenhum cálculo novo.
- **`layout-moderno.css` usa `@import` da fonte Inter (Google Fonts):** exige internet na 1ª carga; offline cai nas fontes do sistema.
- **O CSS é solto** (sobrescreve classes do `style.css`), por isso precisa continuar sendo o **último** CSS do `index.html`; no admin vem
  antes do `depara.css`, que é todo prefixado `.dp-`.
**Validação:** `node --check` limpo; testes `seguranca` (54), `backup` (14) e `depara-core` (109) passando. No navegador de teste (Firebase
simulado, **arquivos reais do projeto**): painel do cliente com cartão, 4 cards, gráficos e pendência; abas Lançamento/Histórico/Mensagens
sem erro; celular 375px sem rolagem lateral; tema claro e escuro; no admin, as 8 telas (Dashboard, Clientes, Bancos, Descrições, Operações,
Mensagens, DE-PARA, Segurança) e o botão de backup, sem erro de console. **Não validado:** com dados e login reais, nem em aparelhos
físicos. **Pendências:** nenhuma de código; aguardar o teste do dono no Live Server antes de publicar.

---

### 2026-10-25 · v1.2.0 (publicada na `main`) — Segurança, Fase 2: o app do cliente passa a entrar pelo Authentication

**Pedido:** seguir o plano — o cliente entra com o **mesmo usuário e senha**, mas por uma conta do Firebase Authentication, e o app
baixa **só os dados dele** (antes baixava a lista de todos os clientes e os lançamentos de todos para conferir o login no navegador).
**Feito:** `acesso.js` (novo, compartilhado); `app.js` — `doLogin` assíncrono, `doChangePwd` via `updatePassword`, `doLogout` limpa os
dados, `INIT` do cliente **não baixa nada antes do login** e restaura a sessão da aba; `fsGet/fsSet/fsGetTx/fsSetTx` passaram a usar
`acFirestore()` (instância própria no cliente, padrão no admin); mensagens do cliente gravam em `conversas/{id}` e `leitura/{id}`;
no admin, `fsSet` espelha os documentos compartilhados em `config/`, `saveClientMessages(cid)` espelha a conversa, e criar, editar o
login, resetar senha e remover cliente passam a manter também o acesso novo (`sgCriarAcessoCliente`, `sgTrocarLoginAcesso`,
`sgResetarAcesso`, `sgApagarAcessoECopias`). `APP_VERSION` 1.2.0 e `CACHE_NAME` `sn-v5`; `acesso.js` entrou no `index.html`,
`admin.html` e no cache do `sw.js`.
**Decisões e porquês:**
- **Instância própria do Firebase no cliente** (`'cliente'`): sem ela, abrir o app do cliente no mesmo navegador do admin trocava o
  usuário logado e as gravações do admin passavam a falhar.
- **Sessão só na aba** (`Persistence.SESSION`): mantém o comportamento antigo (`sessionStorage`).
- **A senha nova do cliente vai só para o Authentication**; o cadastro antigo não é atualizado (só serve à versão antiga do app, que
  some na fase final). Por isso o admin deixa de enxergar a senha e o **reset** cria uma conta nova (versão `n+1`) antes de desligar a antiga.
- **Mudar o login de um cliente volta a senha dele para a inicial** (a senha atual é desconhecida do admin).
- **mustChangePwd na junção:** só é "padrão" se nenhuma das duas versões disser que a senha já foi trocada.
- **Erros de login iguais** para usuário inexistente e senha errada (não revelam se o usuário existe).
**Validação:** `node testes/seguranca.test.cjs` (51), `backup.test.cjs` (14), `depara-core.test.cjs` (109); `node --check` limpo. No
navegador, com Firebase **simulado** e o `app.js` real: senha errada e usuário inexistente (mesma mensagem), login em maiúsculas,
só os documentos do próprio cliente lidos, nenhum campo de senha no estado, logout limpa tudo, primeiro acesso (senha curta, não
coincide, troca), senha nova **nunca** vai para o banco, senha antiga deixa de valer, restauração da sessão e abertura sem login sem
baixar nada. **Não validado:** com o Firebase real (rodar no Live Server com um cliente de teste criado pelo admin), e as regras
precisam estar publicadas no console antes de publicar este app. **Pendências:** Fase 3 (janela de convivência) e Fase 4 (fechar o
modelo antigo, só depois de conferir as versões dos clientes).

---

### 2026-10-25 · v1.1.0 (versão **não** subida) — Segurança dos dados, Fase 1: contas de acesso e estrutura por cliente (preparação)

**Pedido:** seguir o plano de proteção dos dados dos clientes sem plano pago do Firebase, sem trocar senhas e sem tirar o acesso
de ninguém. **Feito (branch `seguranca/fase1-contas`):** `seguranca.js` + item "Segurança" no menu do admin com 3 ações:
**(1)** criar uma conta no Firebase Authentication para cada cliente (login interno derivado do usuário; senha = a de hoje com um
prefixo fixo, porque o Firebase exige 6+ caracteres), gravando `vinculos/{uid}` e `loginmeta/{hash}`; **(2)** copiar para
coleções por cliente (`perfil` **sem senha**, `conversas`, `leitura`) e `config` (bancos, descrições, operações, ícones, comunicados);
**(3)** conferir: cópias idênticas, nenhum perfil com senha, **cada cliente entra com a senha atual, lê o próprio perfil e é
barrado ao ler o de outro**. Tudo é idempotente (pode rodar de novo; continua de onde parou) e **nunca altera nem apaga** `sn/*`
e `sntx/*`. Usa uma 2ª instância do Firebase para não derrubar o login do admin.
**Decisões:** o hash do usuário e o prefixo da senha **não podem mudar** depois que as contas existirem (teste com valor fixo
protege isso); a conta tem uma "versão" `n` que sobe no reset de senha pelo admin (Fase 2). As regras novas das coleções ficam num
arquivo **local, fora do Git**, e precisam ser publicadas no console antes de usar a tela. Usuário repetido (mesmo login) é recusado.
**Validação:** `node testes/seguranca.test.cjs` (27), `backup.test.cjs` (14), `depara-core.test.cjs` (109); `node --check` limpo; a tela
abre no navegador com banco simulado. **Não validado:** criação de contas e conferência com o Firebase real (rodar no Live Server
com o login do admin, depois de publicar as regras). **Pendências:** Fase 2 (app do cliente passa a usar essas contas), Fase 3
(janela de convivência) e Fase 4 (fechar o banco antigo).

---

### 2026-10-25 · v1.1.0 (versão **não** subida) — Botão de backup do banco no admin (1º passo da revisão de segurança)

**Pedido:** antes de qualquer mudança na proteção dos dados, ter uma cópia de segurança completa que o admin possa baixar.
**Feito (branch `seguranca/fase0-backup`):** `backup.js` com o botão **"💾 Backup do banco"** no rodapé da barra lateral do admin.
Lê as coleções de `BK_COLECOES` (hoje `sn` e `sntx`) e baixa `backup-sn_AAAA-MM-DD_HHMM.json`, com a data, a versão do app, a
contagem por coleção e todos os documentos por id (Timestamp vira `{__timestamp: ISO}`). O rótulo do botão mostra o resultado
(contagens e tamanho). `admin.html` carrega o script; `app.js` ganhou um único encaixe.
**Decisões e porquês:**
- **Se uma coleção falhar, aborta** e avisa no botão — nunca baixa um backup incompleto como se estivesse bom.
- **Nada sai do navegador:** o arquivo é gerado aqui e baixado direto.
- O arquivo contém dados de clientes, então `.gitignore` bloqueia `backup-sn_*.json`. Guarde fora do Git, em local protegido.
- **Coleção nova exige entrada em `BK_COLECOES`**, senão fica fora do backup.
- **Ainda não existe "restaurar"** — é um passo à parte, a fazer só se for preciso.
**Validação:** `node testes/backup.test.cjs` → 14 conferências; `depara-core.test.cjs` → 109; `node --check` limpo. No
navegador, com Firebase simulado: botão aparece no menu, gera arquivo com as contagens certas, e com falha numa coleção não
baixa nada e mostra aviso. **Não validado:** com o banco real e login Google (rodar uma vez no Live Server antes de publicar).

---

### 2026-10-25 · v1.1.0 (versão **não** subida) — CLAUDE.md sem dados sensíveis

**Pedido:** o repositório é público; o dono pediu para tirar deste arquivo qualquer dado vulnerável, chave exposta ou detalhe
de falha, e elaborar (fora do Git) um plano para proteger os dados dos clientes sem tirar o acesso nem a funcionalidade.
**Feito:** removidos identificadores de contas externas (projeto Firebase, conta e preset do Cloudinary), a senha inicial
padrão, a descrição de como o acesso do cliente é conferido e do que as regras do banco não cobrem. Seção 6 e pendência 3
passaram a dizer apenas que a revisão de segurança está em andamento. Acrescentada a regra de **não registrar segredos nem
falhas neste arquivo**. **Atenção:** o histórico do Git guarda as versões antigas deste arquivo; os identificadores
removidos já são públicos no código do site, então não se trata de segredo vazado — mas não os reintroduza.
Sem mudança de código nem de versão do app.

---

### 2026-10-25 · v1.1.0 (versão **não** subida) — DE-PARA reconhece mais formatos + nota de confiança; publicado na `main`

**Pedido:** o dono mandou 4 arquivos reais (2 planilhas de controle, 1 extrato de condomínio em planilha e 1 PDF de
fechamento) e perguntou se a plataforma consegue **identificar e reconhecer os dados** em formatos muito diferentes. Depois de
ver o diagnóstico ("vamos aplicar") e de testar, mandou **publicar na `main`**.

**Diagnóstico (núcleo antigo, dados reais):** (a) a planilha no formato da própria plataforma tinha a coluna `OPERAÇÕES` com
9 valores — acima do limite de 8 — e nenhuma operação era entendida, então **todos os recebimentos saíam como pagamento**;
(b) o extrato sem cabeçalho tinha **duas colunas de valor** (saída e entrada) e só uma era lida (27 linhas de entrada
viravam erro), além de uma coluna de saldo e uma de "0"; (c) datas digitadas com acento solto (`´06/04/2026`) eram erro;
(d) a coluna Complemento não entrava no histórico, gerando 47 falsos "duplicados"; (e) o PDF era imagem escaneada (zero texto).

**Feito (`depara-core.js`, `depara.js`, testes):** duas colunas de valor; operações da plataforma como natureza (com
"Entre bancos" fora do arquivo); datas sujas com aviso; colunas extras no histórico; arquivo **sem cabeçalho** (`dpCabPadrao`
e assinatura por "forma"); aviso de total com data; **nota de confiança** por campo na seção 4 (regras completas na 8.11).
Tela: seletor "Valor — coluna de ENTRADAS", caixas de "colunas extras", painel de confiança, chip de transferências e novas
etiquetas na prévia. `dpProblemas` passou a contar transferência e leitura de confiança baixa (exigem confirmar).

**Decisões e porquês:**
- Texto com número no meio (`Pagamento … mês 5`) **não é mais valor**. Antes `dpParseValor` arrancava as letras e devolvia 5;
  isso fazia a descrição virar "valor" na detecção e sumir do histórico (apareceu no 1º teste da plataforma).
- Cabeçalho só **antes** da 1ª linha com data: uma linha de total no meio do arquivo era tomada por cabeçalho.
- Saldo corrido **não** entra no par saída/entrada: ele está preenchido junto com as duas colunas.
- Coluna de "numerinhos" (1–2 dígitos) nunca é valor: era a coluna de ordem do extrato que ganhava de F/G.
- Tipo só reconhece valor de até 20 caracteres: descrição livre com "pag…" virava coluna Tipo.
- Sem título, a coluna da **esquerda é a saída**; a nota de confiança fica "média" e manda conferir.

**Validação:** `node testes/depara-core.test.cjs` → **109 conferências** ok (37 novas, com dados fictícios: data suja, operações,
layout da plataforma, extrato de 2 colunas sem cabeçalho, duplo erro, total com data, mapa antigo, confiança). Contra as
**3 planilhas reais** (Node, só contagens): Controle — 131 válidas, 1 erro (valor vazio), 3 datas sujas lidas com aviso;
plataforma (GTR) — 363 pagamentos / 173 recebimentos pela coluna Operações, 0 erros, confiança alta; extrato (Habitar) —
saída F, entrada G, 82 pagamentos / 27 recebimentos, 0 erros, saldo ignorado, confiança média (sem título). A tela foi aberta
no navegador com Firebase simulado e dados fictícios: sem erro de console, painel de confiança e seletor de entradas visíveis.

**Pendências:** PDF escaneado precisa de OCR (item 15); falta teste com login real e `.txt` no Contmatic (itens 13 e 16).
Os 2 duplicados do extrato e os 45 da plataforma são **avisos** de lançamentos realmente repetidos no mesmo dia.

**Publicação:** merge de `feature/depara` na `main` (somente `admin.html`/DE-PARA mudam o que é carregado; o app do cliente
não carrega esses arquivos, então **não houve** troca de `APP_VERSION`/`CACHE_NAME`).

---

### 2026-10-25 · v1.1.0 (versão **não** subida) — DE-PARA: planilha → `.txt` do Contmatic dentro do admin

**Pedido:** o dono tem uma ferramenta própria (`conversor_depara.html`) para ler planilhas de clientes **sem padrão**,
identificar cada coluna e gerar o arquivo de lançamentos do Contmatic, para não pagar por uma ferramenta de mercado.
Pediu para integrá-la ao app como **nova aba do menu lateral do admin, abaixo de Mensagens, com o título DE-PARA**;
manter as funcionalidades, **corrigidas para evitar erros**; ter uma **prévia do arquivo enviado** para ser mais
assertivo; **clientes salvos no Firebase**; e **tirar os logos/imagens do código** (usar o Cloudinary, para ficar leve).
Antes disso foi feita uma comparação com a Ottimizza ("Meu Integrador"): ela tem equivalentes ao mapeamento de colunas,
DE-PARA e regras, mais biblioteca de layouts, plano de contas, histórico de lotes e busca de extrato; não foi possível
confirmar se ela gera para o Contmatic (a Domínio é a parceira citada na tela).

**Feito (branch `feature/depara`):**
- Arquivos novos: `depara-core.js` (núcleo puro), `depara.js` (tela), `depara.css`, `testes/depara-core.test.cjs` (72
  conferências) e `testes/exemplo-depara.xlsx`. `admin.html` carrega os três primeiros; `index.html` **não**.
- `app.js`: só **3 encaixes** (item de menu, título, roteamento) — o resto mora nos arquivos novos.
- Tela com 8 seções (regras completas na seção 8.11): clientes no Firestore, upload, **prévia do arquivo** (tabela com
  colunas coloridas por campo, cabeçalho clicável, abas), mapeamento com **detecção automática** e **layout salvo por
  cliente**, **"Como o sistema vai ler"** (linha a linha, com motivo), configurações, DE-PARA por nome, regras por
  palavra-chave com impacto ao vivo, e geração com trava de confirmação.
- **Correções em relação ao conversor antigo:** linhas descartadas em silêncio agora aparecem todas, com motivo; data
  inválida é erro e `mm/dd` não é mais adivinhado; datas do Excel sem erro de fuso; valores negativos, entre parênteses,
  com `R$`, com `-` no fim e nos dois padrões de milhar/decimal; valor sempre positivo no arquivo; `;`/quebra de linha no
  histórico não quebram mais as colunas; codificação ANSI (Windows-1252) de verdade com contagem de caracteres perdidos
  (antes `& 0xFF` corrompia `–`, `’`, `“ ”`); todas as abas da planilha; DE-PARA sem diferenciar caixa/acento e
  aproximação só com 4+ letras e pelo nome mais longo; regra com banco não compara mais com o fornecedor quando falta a
  coluna Banco; regras com ordem de prioridade editável; avisos de duplicado, ano diferente e separador conflitante.
- Sem imagens embutidas: o arquivo antigo tinha 253 KB (a maior parte base64); o módulo novo tem ~80 KB de código. O logo
  do cabeçalho é o do app (Cloudinary). SheetJS e pdf.js só são baixados quando se envia um arquivo.

**Decisões e porquês:**
- **Coleção `sn`, não uma nova:** `depara_index` + `depara_c_<id>` reaproveitam a coleção que o app já usa, então **não
  exige regra nova** no Firestore (uma coleção nova falharia em silêncio sem a regra publicada). Um documento por cliente
  evita o limite de 1 MB.
- **DE-PARA gravado como lista `[{nome, conta}]`**, não como mapa: nome de fornecedor com `.` ou `/` seria problema como
  chave do Firestore.
- **Núcleo puro separado da tela**, no mesmo padrão do módulo de Orçamentos do outro projeto do dono: dá para testar em
  Node e corrigir regra sem abrir o navegador. As seções da tela são re-renderizadas **uma a uma** (`dpRenderSec`), para
  não roubar o foco de quem está digitando.
- **Sem Exportar/Importar `.json`** (a pedido do dono, depois de revisar a prévia): a configuração já fica no Firestore, por
  cliente, e voltar ao cliente no mês seguinte traz tudo. Consequência assumida: **clientes do conversor antigo não
  migram**, é preciso recadastrá-los (pendência 15). O núcleo ainda tolera o formato antigo (`deParaMap`), mas nenhuma
  tela o usa.
- **Trava antes de baixar** em vez de simplesmente bloquear: o dono pode precisar gerar com linhas sem conta (vão para a
  conta de não identificados), mas tem de confirmar sabendo quantas são. Toda reanálise desmarca a confirmação.
- **`APP_VERSION`/`CACHE_NAME` NÃO foram subidos:** a mudança é só do admin; subir a versão faria o painel do admin marcar
  **todos os clientes** como "⚠ versão desatualizada" sem que nada tenha mudado para eles.
- **Não foi aplicado nada visual** (o layout moderno e a melhoria dos ícones, mostrados em prévia, **não** fazem parte
  desta mudança).

**Validação:** `node --check` em `app.js`, `depara-core.js`, `depara.js` e `sw.js`; `node testes/depara-core.test.cjs` →
"Tudo confere. (72 conferências)"; arquivos do projeto **idênticos** aos da prévia testada; no navegador, com os arquivos
**reais do projeto** e o visual atual do app (Firebase simulado): item "DE-PARA" abaixo de Mensagens, criação de cliente,
envio da planilha de exemplo (cabeçalho achado na linha 4, colunas detectadas, 21 linhas lidas = 16 válidas + 3 erros + 2
ignoradas), regra, DE-PARA, layout reconhecido no 2º envio, arquivo inválido recusado, `.txt` conferido e download
bloqueado até confirmar. Testado também nos temas escuro e claro.

**Pendências:** itens 13 a 15 da seção 13 — principalmente **não houve importação de teste no Contmatic**, nem teste com PDF
real, com o Firestore real ou no celular. **Antes de publicar na `main`:** abrir `admin.html` no Live Server, entrar com a
conta admin e repetir o roteiro 5 da seção 11 com uma planilha real.

### 2026-10-24 · v1.1.0 — Pagamento a prazo, parcelas, contínuo, pendentes, Excel e atualização automática

**Pedido (em etapas, mesma sessão):** (1) na tela de lançamento, antes do banco, botões *Pagamento à vista* e
*a prazo*; a prazo abre calendário e salva como **pagamento pendente**; (2) novo card para ver o valor a prazo;
(3) card **Pendente** também no admin, na mesma cor; (4) avisar o cliente quando chegar o dia do pagamento; (5) a
prazo com **quantidade de parcelas** e datas; (6) **Contínuo** (conta recorrente) para todas as operações, sem
aparecer como parcela, limitado ao ano atual; (7) exportar em **Excel** além de PDF; (8) app instalado se
**atualizar sozinho**; (9) criar este `CLAUDE.md`.

**Feito:**
- Forma de pagamento (À vista / A prazo / Contínuo) no lançamento e na edição; status `pago`/`pendente`,
  `vencimento`, `pagoEm`, `parcelaNum/Total`, `grupoId` (seção 4.2 e 8.4).
- A prazo: 1x–24x, vencimento por parcela, preenchimento mês a mês a partir da data alterada, divisão em centavos com
  resto na última parcela; cada parcela = um lançamento.
- Contínuo: um lançamento por mês até dezembro do ano do 1º vencimento, sem numeração; vale para todas as operações.
- Card **Pendente** (roxo) no Painel do cliente, no detalhe do cliente e no dashboard do admin.
- Aviso de pendente vencendo/vencido (faixa roxa), filtro **Situação** na lista e botão **✅ dar baixa**.
- Edição: botões À vista (pago) / A prazo; banco só obrigatório ao dar baixa; trocar de botão não perde o digitado.
- **Imprimir / Exportar**: janela com PDF ou Excel `.xlsx` (SheetJS sob demanda; cai para CSV sem internet).
- Mês padrão do Painel/Histórico passou a ser o **mês atual** (`pickMonth`), pois o contínuo cadastra meses futuros.
- PWA: `sw.js` sem cache HTTP e só cacheia resposta ok; `index.html` recarrega o app em versão nova (espera o cliente
  terminar o que está digitando); `CACHE_NAME sn-v4`; `APP_VERSION 1.1.0`.
- Criado este `CLAUDE.md`; repositório local ligado ao GitHub (`origin`), `SNicon/` fora do Git.

**Decisões e porquês:**
- **Pendente já conta nos totais** (decisão do dono: "a dívida já existe e preciso contabilizar"); o card só mostra
  quanto falta pagar.
- **Parcela = lançamento separado**, em vez de um lançamento com lista de parcelas: cada uma tem vencimento e baixa
  próprios e todas as telas/somas existentes continuam funcionando sem mudança.
- **Banco opcional enquanto pendente** (obrigatório na baixa): na compra a prazo o banco de pagamento ainda não é
  conhecido.
- **Contínuo limitado ao ano** (pedido): evita criar lançamentos para anos distantes; renova-se lançando de novo.
- **Excel `.xlsx` real** (e não só CSV) para abrir com formatação e números; biblioteca carregada só ao exportar.
- **Vencimento usa data local** (`localToday`), não UTC, para o aviso não adiantar um dia à noite.

**Validação:** `node --check` em `app.js`/`sw.js`; testes em Node das contas de centavos (100÷3 e 10.000÷7),
`addMonths` (31/01→28/02→31/03), `contDates` (15/03 → 10 meses; 31/01 → 12) e `pickMonth`; estrutura da planilha
conferida lendo o `.xlsx` gerado com SheetJS; testado pelo dono no Live Server antes de publicar. Site conferido no ar
(`sn-v4` / `1.1.0`).

**Pendências:** itens 1–12 da seção 13 (nenhum foi tratado nesta entrega).

**Publicação:** commit `ac93a07` na `main` (`1f1f094` → `ac93a07`).

### Antes de 2026-10-24 · v1.0.5 e anteriores

Versão-base do GitHub (último commit `1f1f094`, 05/06/2026): cadastro de clientes, lançamentos à vista, painel,
histórico, mensagens, bancos/descrições/operações personalizadas, sincronização com Google Sheets, relatório em PDF
(impressão) e PWA com `CACHE_NAME sn-v3`. Detalhes dessas versões não foram registrados aqui.
