// INFO, o app aberto: lê edicoes/index.json e edicoes/<AAAA-MM-DD>.json (gerados pelo info.py app) e mostra.
// Rotas: #/ (a edição mais nova), #/<AAAA-MM-DD> (uma edição), #/edicoes, #/sobre. Todo texto entra como texto, nunca como HTML.
'use strict';
const TABS = { geopolitica: 'Geopolítica', maquinas: 'Máquinas', bola: 'Bola', exopolitica: 'Exopolítica', capao: 'Capão' };
const CONF = { fato: 'fato', provavel: 'provável', hipotese: 'hipótese' };
const app = document.getElementById('app');
let indice = null;
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

function cartao(i) {
  const fontes = (i.fontes || []).map(f => {
    const u = linkSeguro(f.url);
    const rot = [f.nome, f.data && dataBr(f.data)].filter(Boolean).join(', ');
    return el('li', null, u ? el('a', { href: u, target: '_blank', rel: 'noopener noreferrer' }, rot || u) : rot);
  });
  const bloco = (tit, txt) => txt ? [el('h3', null, tit), ...paragrafos(txt)] : [];
  return el('details', { class: 'cartao' },
    el('summary', null,
      el('div', { class: 'etiquetas' },
        el('span', { class: 'etq tab' }, TABS[i.tabuleiro] || i.tabuleiro || 'Notícia'),
        i.confianca && el('span', { class: `etq ${i.confianca}` }, CONF[i.confianca] || i.confianca),
        i.acrescentada && el('span', { class: 'etq' }, `entrou às ${i.acrescentada}`)),
      el('h2', null, i.manchete)),
    el('div', { class: 'corpo' },
      bloco('O que dizem', i.narrativa),
      bloco('O que fizeram', i.movimento),
      bloco('A leitura', i.leitura),
      bloco('Conflito de interesse', i.conflito),
      (i.emJogo || []).length ? [el('h3', null, 'Quem está em jogo'), el('p', { class: 'emjogo' }, i.emJogo.join(', '))] : [],
      fontes.length ? [el('h3', null, 'Fontes'), el('ul', null, fontes)] : []));
}

function telaEdicao(ed) {
  const pos = indice.findIndex(e => e.data === ed.data);
  const anterior = indice[pos + 1], seguinte = pos > 0 ? indice[pos - 1] : null;
  const temTabs = [...new Set(ed.itens.map(i => i.tabuleiro))].filter(Boolean);
  const listaEl = el('div');
  const mostrar = tab => {
    listaEl.replaceChildren(...ed.itens.filter(i => !tab || i.tabuleiro === tab).map(cartao));
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
  app.replaceChildren(
    el('section', { class: 'capa' },
      el('div', { class: 'meta' }, `nº ${ed.numero || '?'} · ${dataLonga(ed.data)}`),
      el('h1', null, ed.titulo || 'INFO'),
      el('div', { class: 'abertura' }, paragrafos(ed.abertura)),
      ed.aviso && el('p', { class: 'aviso' }, ed.aviso)),
    abas, listaEl,
    editais.length ? el('section', { class: 'secao' }, el('h2', null, 'Editais abertos'), editais) : '',
    el('div', { class: 'navega' },
      anterior ? el('a', { href: `#/${anterior.data}` }, `← nº ${anterior.numero}`) : el('span'),
      seguinte ? el('a', { href: `#/${seguinte.data}` }, `nº ${seguinte.numero} →`) : el('span')));
  mostrar('');
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
    el('p', null, 'O INFO é um jornal de bolso feito com IA (o Claude, da Anthropic). Sai uma edição por dia, pronta para ser lida às 5h da manhã, horário de Brasília, com notícias de geopolítica, tecnologia, futebol e do Vale do Capão, na Chapada Diamantina.'),
    el('p', null, 'Cada notícia separa o que dizem (a versão divulgada) do que fizeram (os atos, as datas, o dinheiro), traz uma leitura marcada como fato, provável ou hipótese, e lista as fontes. É um exercício lúdico: nada aqui afirma a realidade, e as fontes estão ali para você conferir.'),
    el('p', null, 'Para instalar: no Android, abra no Chrome e toque em "Instalar" (ou no menu ⋮, "Adicionar à tela inicial"). No iPhone, abra no Safari, toque em compartilhar e depois em "Adicionar à Tela de Início".')));
  document.title = 'INFO · sobre';
}

async function rota() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  document.querySelectorAll('.topo nav a').forEach(a => a.classList.toggle('ativo',
    a.dataset.rota === (h === 'edicoes' ? 'edicoes' : h === 'sobre' ? 'sobre' : 'hoje')));
  try {
    if (h === 'sobre') return telaSobre();
    await carregarIndice();
    if (!indice.length) { app.replaceChildren(el('p', { class: 'vazio' }, 'Ainda não há edição publicada.')); return; }
    if (h === 'edicoes') return telaEdicoes();
    const d = ehDia(h) ? h : indice[0].data;
    telaEdicao(await carregarEd(d));
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
