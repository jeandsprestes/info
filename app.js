// INFO, o app aberto: lê edicoes/index.json e edicoes/<AAAA-MM-DD>.json (gerados pelo info.py app) e mostra.
// Rotas: #/ (a edição mais nova), #/<AAAA-MM-DD> (uma edição), #/edicoes, #/sobre. Todo texto entra como texto, nunca como HTML.
'use strict';
const TABS = { geopolitica: 'Geopolítica', maquinas: 'Máquinas', bola: 'Bola', exopolitica: 'Exopolítica', ufologia: 'Ufologia', capao: 'Capão' };
const CONF = { fato: 'fato', provavel: 'provável', hipotese: 'hipótese' };
const ORDEM_TAB = ['geopolitica', 'maquinas', 'exopolitica', 'ufologia', 'bola', 'capao'];   // as corriqueiras (Bola e Capão) sempre no fim (pedido do Jean em 10/11/2026)
const estadosDu = {}, abaRev = {};   // o que a dualidade lembra de cada edição; a aba escolhida (o dia, a semana ou o mês)
const app = document.getElementById('app');
let indice = null;
const estadosMapa = {};   // o que o mapa de forças lembra de cada edição (o player escolhido, a notícia, as partes abertas)
const cacheEd = {};

function el(tag, attrs, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v);
  }
  for (const f of filhos.flat()) if (f != null && f !== '') n.append(f instanceof Node ? f : String(f));
  return n;
}
const linkSeguro = u => /^https?:\/\//i.test(u || '') ? u : null;
const ehDia = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
function dataLonga(d) {
  try { return new Date(d + 'T12:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
  catch (e) { return d; }
}
const dataBr = d => ehDia(d) ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : (d || '');
const paragrafos = t => String(t || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => el('p', null, p));

async function json(url) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}
async function carregarIndice() { if (!indice) indice = await json('edicoes/index.json'); return indice; }
async function carregarEd(d) { if (!cacheEd[d]) cacheEd[d] = await json(`edicoes/${d}.json`); return cacheEd[d]; }
async function carregarRev(d, tipo) { const k = d + '-' + tipo; if (!cacheEd[k]) cacheEd[k] = await json(`edicoes/${k}.json`); return cacheEd[k]; }

function cartao(i, noMapa) {
  const fontes = (i.fontes || []).map(f => {
    const u = linkSeguro(f.url);
    const rot = [f.nome, f.data && dataBr(f.data)].filter(Boolean).join(', ');
    return el('li', null, u ? el('a', { href: u, target: '_blank', rel: 'noopener noreferrer' }, rot || u) : rot);
  });
  const bloco = (tit, txt) => txt ? [el('h3', null, tit), ...paragrafos(txt)] : [];
  return el('details', { class: 'cartao', id: 'c-' + i.id },
    el('summary', null,
      el('div', { class: 'etiquetas' },
        el('span', { class: 'etq tab' }, TABS[i.tabuleiro] || i.tabuleiro || 'Notícia'),
        i.confianca && el('span', { class: `etq ${i.confianca}` }, CONF[i.confianca] || i.confianca),
        i.acrescentada && el('span', { class: 'etq' }, `entrou às ${i.acrescentada}`),
        noMapa && el('span', { class: 'etq tab' }, `no mapa · ${noMapa.n}`)),
      el('h2', null, i.manchete)),
    el('div', { class: 'corpo' },
      bloco('O que dizem', i.narrativa),
      bloco('O que fizeram', i.movimento),
      bloco('A leitura', i.leitura),
      bloco('A análise pela ótica do jogo', i.analise),
      bloco('Conflito de interesse', i.conflito),
      (i.emJogo || []).length ? [el('h3', null, 'Quem está em jogo'), el('p', { class: 'emjogo' }, i.emJogo.join(', '))] : [],
      fontes.length ? [el('h3', null, 'Fontes'), el('ul', null, fontes)] : []));
}

function telaEdicao(ed, revs) {
  revs = revs || {};
  ed = { ...ed, itens: (ed.itens || []).map((i, k) => [i, k]).sort((a, b) => ((ORDEM_TAB.indexOf(a[0].tabuleiro) + 1 || 99) - (ORDEM_TAB.indexOf(b[0].tabuleiro) + 1 || 99)) || a[1] - b[1]).map(([i]) => i) };
  const pos = indice.findIndex(e => e.data === ed.data);
  const anterior = indice[pos + 1], seguinte = pos > 0 ? indice[pos - 1] : null;
  const temTabs = [...new Set(ed.itens.map(i => i.tabuleiro))].filter(Boolean);
  const listaEl = el('div');
  const mapa = window.MapaDeForcas ? MapaDeForcas.limpar(ed.mapa) : null;   // o mapa de forças: o jogo dos 7 players (mapa-de-forcas.js)
  const noMapa = i => (mapa && mapa.noticias.find(n => n.id === i.id)) || null;
  const mostrar = tab => {
    listaEl.replaceChildren(...ed.itens.filter(i => !tab || i.tabuleiro === tab).map(i => cartao(i, noMapa(i))));
    abas.querySelectorAll('button').forEach(b => b.classList.toggle('ativo', (b.dataset.tab || '') === (tab || '')));
  };
  const abas = el('div', { class: 'abas' },
    el('button', { type: 'button', 'data-tab': '', onclick: () => mostrar('') }, `Todas (${ed.itens.length})`),
    temTabs.map(t => el('button', { type: 'button', 'data-tab': t, onclick: () => mostrar(t) },
      `${TABS[t] || t} (${ed.itens.filter(i => i.tabuleiro === t).length})`)));
  const editais = (ed.editais || []).map(d => el('div', { class: 'edital' },
    el('strong', null, linkSeguro(d.url) ? el('a', { href: d.url, target: '_blank', rel: 'noopener noreferrer' }, d.titulo) : d.titulo),
    el('div', { class: 'det' }, [d.orgao, d.para, d.prazo && `inscrição até ${dataBr(d.prazo)}`, d.valor].filter(Boolean).join(' · ')),
    d.resumo && el('p', null, d.resumo)));
  const rolar = id => { mostrar(''); setTimeout(() => { const x = document.getElementById(id); if (x) { if (x.tagName === 'DETAILS') x.open = true; x.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 0); };
  const mapaEl = mapa ? MapaDeForcas.desenhar({ edicao: { data: ed.data, itens: ed.itens, mapa }, estado: estadosMapa[ed.data] || (estadosMapa[ed.data] = {}), rolar, idCartao: i => 'c-' + i.id }) : null;
  const dual = window.Dualidade ? Dualidade.limpar(ed.dualidade) : null;   // a dualidade, elite antiga x nova elite (dualidade.js)
  const dualEl = dual ? Dualidade.desenhar({ dualidade: dual, estado: estadosDu[ed.data] || (estadosDu[ed.data] = {}) }) : null;
  const qual = revs[abaRev[ed.data]] ? abaRev[ed.data] : 'dia';   // a semana e o mês (revisao.js), na edição de segunda e na do dia 1º
  const abaEl = (k, nome) => el('button', { type: 'button', class: 'rv-aba', 'aria-pressed': String(qual === k), onclick: () => { abaRev[ed.data] = k; telaEdicao(ed, revs); const f = document.querySelector('.rv-aba[aria-pressed="true"]'); if (f) f.focus(); } }, nome);
  const abasRev = revs.semana || revs.mes ? el('div', { class: 'rv-abas', role: 'group', 'aria-label': 'O que esta edição traz' }, abaEl('dia', 'O dia'), revs.semana ? abaEl('semana', 'A semana') : null, revs.mes ? abaEl('mes', 'O mês') : null) : null;
  const revEl = qual !== 'dia' && window.Revisao ? Revisao.desenhar({ revisao: Revisao.limpar(revs[qual]), link: d => '#/' + d }) : null;
  app.replaceChildren(
    el('section', { class: 'capa' },
      el('div', { class: 'meta' }, `nº ${ed.numero || '?'} · ${dataLonga(ed.data)}`),
      el('h1', null, ed.titulo || 'INFO'),
      el('div', { class: 'abertura' }, paragrafos(ed.abertura)),
      ed.aviso && el('p', { class: 'aviso' }, ed.aviso)),
    abasRev || '',
    ...(revEl ? [revEl] : [mapaEl || '', dualEl || '', abas, listaEl,
    editais.length ? el('section', { class: 'secao' }, el('h2', null, 'Editais abertos'), editais) : '']),
    el('div', { class: 'navega' },
      anterior ? el('a', { href: `#/${anterior.data}` }, `← nº ${anterior.numero}`) : el('span'),
      seguinte ? el('a', { href: `#/${seguinte.data}` }, `nº ${seguinte.numero} →`) : el('span')));
  if (!revEl) mostrar('');
  document.title = `INFO nº ${ed.numero || ''}`.trim();
}

function telaEdicoes() {
  app.replaceChildren(el('section', { class: 'secao lista-ed' }, el('h2', null, 'Todas as edições'),
    indice.map(e => el('a', { href: `#/${e.data}` },
      el('span', { class: 'meta' }, `nº ${e.numero} · ${dataLonga(e.data)} · ${e.noticias} notícias`),
      el('span', { class: 'tit' }, e.titulo)))));
  document.title = 'INFO · edições';
}

function telaSobre() {
  app.replaceChildren(el('section', { class: 'secao sobre' }, el('h2', null, 'Sobre o INFO'),
    el('p', null, 'O INFO é um jornal de bolso feito com IA (o Claude, da Anthropic). Sai uma edição por dia, pronta para ser lida às 5h da manhã, horário de Brasília, com notícias de geopolítica, tecnologia, futebol, ufologia técnica e do Vale do Capão, na Chapada Diamantina.'),
    el('p', null, 'Cada notícia separa o que dizem (a versão divulgada) do que fizeram (os atos, as datas, o dinheiro), traz uma leitura marcada como fato, provável ou hipótese, e lista as fontes. É um exercício lúdico: nada aqui afirma a realidade, e as fontes estão ali para você conferir.'),
    el('p', null, 'O mapa de forças, logo abaixo da capa, é um jogo de hipóteses montado sobre uma lista de grupos de poder: só os 7 grupos maiores da lista são players e ganham ou perdem; países, pessoas e instituições são peças, que se movem, ou territórios, que se disputam. As ligações que a lista afirma são postas à prova a cada rodada, com sinais a favor ou contra e um placar. Os fatos têm fonte; a ligação de uma peça a um player é hipótese.'),
    el('p', null, 'A dualidade, logo abaixo do mapa, é um segundo exercício especulativo: a hipótese de uma transição de poder da elite antiga (o petróleo, a finança tradicional, o establishment político até 2016) para a nova elite (os donos das Big Techs e quem monta a tecnocracia), com Trump como negociador que acena para os dois lados. Cada lance e cada aceno tem peso e fonte, e a conta mostra para que lado a transição e Trump pendem.'),
    el('p', null, 'A edição de segunda traz também a semana que passou, e a do dia 1º traz a semana e o mês, feitas só a partir das edições, sem busca nova.'),
    el('p', null, 'Para instalar: no Android, abra no Chrome e toque em "Instalar" (ou no menu ⋮, "Adicionar à tela inicial"). No iPhone, abra no Safari, toque em compartilhar e depois em "Adicionar à Tela de Início".')));
  document.title = 'INFO · sobre';
}

let navegacao = 0;
async function rota() {
  const n = ++navegacao;
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  document.querySelectorAll('.topo nav a').forEach(a => a.classList.toggle('ativo',
    a.dataset.rota === (h === 'edicoes' ? 'edicoes' : h === 'sobre' ? 'sobre' : 'hoje')));
  try {
    if (h === 'sobre') return telaSobre();
    await carregarIndice();
    if (!indice.length) { app.replaceChildren(el('p', { class: 'vazio' }, 'Ainda não há edição publicada.')); return; }
    if (h === 'edicoes') return telaEdicoes();
    const d = ehDia(h) ? h : indice[0].data;
    const linha = indice.find(e => e.data === d) || {}, revs = {}, tipos = linha.revisoes || [];
    const [ed, ...rs] = await Promise.allSettled([carregarEd(d), ...tipos.map(t => carregarRev(d, t))]);
    tipos.forEach((t, k) => { if (rs[k].status === 'fulfilled') revs[t] = rs[k].value; });   // a revisão que não abriu fica de fora: fica só o dia
    if (n !== navegacao) return;   // outra navegação começou depois desta
    if (ed.status !== 'fulfilled') throw ed.reason;
    telaEdicao(ed.value, revs);
    window.scrollTo(0, 0);
  } catch (e) {
    app.replaceChildren(el('p', { class: 'vazio' }, 'Não consegui abrir a edição. Confira a internet e tente de novo.'));
  }
}
window.addEventListener('hashchange', rota);
rota();

// ---------- compartilhar o link
document.getElementById('compartilhar').addEventListener('click', async () => {
  const url = location.href.split('#')[0];
  try {
    if (navigator.share) await navigator.share({ title: 'INFO', text: 'O jornal de bolso, com as fontes:', url });
    else { await navigator.clipboard.writeText(url); alert('Link copiado: ' + url); }
  } catch (e) { /* cancelado */ }
});

// ---------- instalar (Android: o aviso do navegador; iPhone: a explicação)
const faixa = document.getElementById('instalar'), botao = document.getElementById('instalar-botao');
const instalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const fechou = () => { try { return localStorage.getItem('info-instalar-fechou') === '1'; } catch (e) { return false; } };
let pedido = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); pedido = e;
  if (!instalado && !fechou()) faixa.hidden = false;
});
botao.addEventListener('click', async () => { if (!pedido) return; pedido.prompt(); await pedido.userChoice; pedido = null; faixa.hidden = true; });
document.getElementById('instalar-fechar').addEventListener('click', () => {
  faixa.hidden = true; try { localStorage.setItem('info-instalar-fechou', '1'); } catch (e) { /* sem memória */ }
});
if (!instalado && !fechou() && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
  document.getElementById('instalar-texto').textContent = 'Para instalar: toque em compartilhar e depois em "Adicionar à Tela de Início".';
  botao.hidden = true; faixa.hidden = false;
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
