// O mapa de forças do INFO: um jogo de hipóteses (pedidos do Jean em 10/11/2026; Sistemas/INFO.md, "O mapa de forças").
// Os players são os 7 grupos maiores da lista que o Jean mandou, a cama maior. Na versão 2 (10/11/2026), países, pessoas e instituições
// são peças ou territórios; na versão 3 (desde 11/11/2026), as peças são as pessoas que executam e as casas são as instituições e os lugares
// onde o poder opera, num tabuleiro, com o placar da hipótese Trump e China. Só os players ganham ou perdem.
// Um arquivo só, usado pelo aX2 (OS/modulos/info.js) e pelo app aberto (OS/info-app/app.js; o info.py app copia este arquivo para lá).
// O que vem do banco vira só texto, com limite de tamanho; link só http(s).
'use strict';
(() => {
const PLAYERS = {   // id: [o nome curto no mapa, o título na lista, as peças e territórios que a lista põe com ele]
  'core-financeiro': ['Core Financeiro', 'O Core do Poder Financeiro', 'Rothschild & Co, Rockefeller, JPMorgan e Morgan Stanley, Warburg Pincus e Blackstone; o Fed como território'],
  'deep-state-eua': ['Deep State EUA', 'A Deep State americana e global', 'CIA, NSA, DIA, FBI, CFR, Comissão Trilateral e Bilderberg'],
  'empresas-controle': ['Empresas de Controle', 'As Empresas de Controle invisíveis', 'RAND, Brookings, Heritage, empresas militares privadas, fundos de hedge e grandes gestoras'],
  'oligarquia-digital': ['Oligarquia Digital', 'A Oligarquia Digital', 'Google, Meta, Amazon e Microsoft; as redes sociais como território'],
  'deep-state-europa-asia': ['Deep State Europa e Ásia', 'O Deep State europeu e asiático', 'Bilderberg, Conselho da Europa, OSCE, OCX e BRICS'],
  'nova-ordem': ['Nova Ordem Mundial', 'A Nova Ordem Mundial em prática', 'Fórum de Davos e Clube de Roma'],
  'espionagem-privada': ['Espionagem Privada', 'O Deep State oculto: a espionagem privada', 'Palantir'],
};
const HIPOTESES = {   // id: [o player, o que a lista afirma]
  'h-capital': ['core-financeiro', 'O Core Financeiro controla o fluxo de capitais: bancos centrais, fundos de investimento e grandes empresas.'],
  'h-fed': ['core-financeiro', 'O Fed é dirigido por elites financeiras que não precisam ser eleitas.'],
  'h-agencias': ['deep-state-eua', 'CIA, NSA, DIA e FBI articulam políticas secretas que seguem de pé sem depender de eleições.'],
  'h-foruns': ['deep-state-eua', 'CFR, Comissão Trilateral e Bilderberg definem as agendas de líderes políticos e de empresas.'],
  'h-thinktanks': ['empresas-controle', 'RAND, Brookings e Heritage produzem as ideias que os governos depois adotam.'],
  'h-militares': ['empresas-controle', 'Empresas militares privadas agem como braço armado de interesses de empresas e de governos.'],
  'h-ativos': ['empresas-controle', 'Fundos compram ou controlam ativos críticos, como petróleo, água e terras raras, para mexer em preços e políticas.'],
  'h-bigtech': ['oligarquia-digital', 'A Big Tech controla a infraestrutura da internet e define o que é informação aceitável.'],
  'h-redes': ['oligarquia-digital', 'As redes sociais espalham propaganda, muitas vezes sob ordens de agências de inteligência.'],
  'h-europa': ['deep-state-europa-asia', 'Bilderberg, Conselho da Europa e OSCE coordenam políticas entre as nações ricas.'],
  'h-blocos': ['deep-state-europa-asia', 'OCX e BRICS são comandados por elites locais que buscam autonomia do Ocidente.'],
  'h-davos': ['nova-ordem', 'O Fórum de Davos define as tendências econômicas e sociais.'],
  'h-roma': ['nova-ordem', 'O Clube de Roma empurra a pauta da sustentabilidade e do controle populacional.'],
  'h-palantir': ['espionagem-privada', 'A Palantir monitora populações e prevê comportamentos, sob contrato com governos.'],
  'h-intersecoes': ['', 'O poder está nas interseções: dinheiro, ideias, força e tecnologia agem juntos.'],
};
const TIPOS = { ataca: 'ataca', pressiona: 'pressiona', apoia: 'apoia', negocia: 'negocia com', lucra: 'lucra com' };
const FAIXA = { ganha: 'Saem ganhando', disputa: 'Em disputa', perde: 'Saem perdendo' };
const SALDO1 = { ganha: 'sai ganhando', disputa: 'em disputa', perde: 'sai perdendo' };
const CONF = { fato: 'fato', provavel: 'provável', hipotese: 'hipótese' };
const NIVEL = { perde: 0, disputa: 1, ganha: 2 };
const ORDEM = Object.keys(PLAYERS);

// ---------- ferramentas (as mesmas do aX2, aqui dentro para o arquivo andar sozinho)
const el = (tag, attrs, ...filhos) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  const por = f => { if (f === null || f === undefined || f === false || f === '') return; if (Array.isArray(f)) f.forEach(por); else e.append(f instanceof Node ? f : String(f)); };
  filhos.forEach(por);
  return e;
};
const deSvg = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const str = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
const lista = v => Array.isArray(v) ? v : [];
const tem = (o, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
const url = v => { const s = str(v, 900).trim(); return /^https?:\/\/[^\s"'<>]+$/i.test(s) ? s : ''; };
const slug = v => { const s = str(v, 90).trim(); return /^[a-z0-9][a-z0-9-]*$/.test(s) ? s : ''; };
const conf = c => tem(CONF, c) ? c : '';
const nums = v => lista(v).map(Number).filter(n => n >= 1 && n <= 3);
const diaMes = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : (d || '');
const nomeP = id => tem(PLAYERS, id) ? PLAYERS[id][0] : id;
function quebra(t, max, linhas) {   // o nome embaixo do player, em até 2 linhas curtas
  const ls = [];
  for (const p of String(t).split(/\s+/).filter(Boolean)) {
    if (ls.length && (ls[ls.length - 1] + ' ' + p).length <= max) ls[ls.length - 1] += ' ' + p; else ls.push(p);
  }
  const r = ls.slice(0, linhas).map(l => l.length > max ? l.slice(0, max - 1) + '…' : l);
  if (ls.length > linhas) r[linhas - 1] = r[linhas - 1].slice(0, max - 1) + '…';
  return r;
}

// ---------- o mapa limpo (o formato está em Sistemas/INFO.md, "O formato do mapa")
function limpar(m) {
  if (m && typeof m === 'object' && m.versao === 3) return limpar3(m);   // o tabuleiro, desde 11/11/2026
  if (!m || typeof m !== 'object' || m.versao !== 2) return null;
  const fontes = v => lista(v).slice(0, 4).map(f => ({ nome: str(f && f.nome, 200).trim(), url: url(f && f.url), data: str(f && f.data, 40) })).filter(f => f.url);
  const lado = v => lista(v).slice(0, 7).map(x => ({ ator: tem(PLAYERS, x && x.ator) ? x.ator : '', porque: str(x && x.porque, 240), confianca: conf(x && x.confianca) })).filter(x => x.ator);
  const noticias = lista(m.noticias).slice(0, 3).map(n => ({ n: Number(n && n.n) || 0, id: str(n && n.id, 90), rotulo: str(n && n.rotulo, 60), ganham: lado(n && n.ganham), perdem: lado(n && n.perdem) }))
    .filter(n => n.n >= 1 && n.n <= 3 && n.rotulo).sort((a, b) => a.n - b.n);
  const players = lista(m.players).slice(0, 7).map(p => ({ id: tem(PLAYERS, p && p.id) ? p.id : '', saldo: tem(FAIXA, p && p.saldo) ? p.saldo : 'disputa',
    fez: str(p && p.fez, 200), disse: str(p && p.disse, 200), papel: str(p && p.papel, 200), confianca: conf(p && p.confianca), noticias: nums(p && p.noticias), fontes: fontes(p && p.fontes) }))
    .filter((p, k, xs) => p.id && xs.findIndex(q => q.id === p.id) === k);
  const ids = new Set(players.map(p => p.id));
  const pecas = lista(m.pecas).slice(0, 14).map(x => ({ id: slug(x && x.id), nome: str(x && x.nome, 50), tipo: x && x.tipo === 'territorio' ? 'territorio' : 'peca',
    dono: tem(PLAYERS, x && x.dono) ? x.dono : '', fez: str(x && x.fez, 200), confianca: conf(x && x.confianca), noticias: nums(x && x.noticias), fontes: fontes(x && x.fontes) }))
    .filter(x => x.id && x.nome);
  const pids = new Set(pecas.map(x => x.id));
  const lacos = lista(m.lacos).slice(0, 12).map(l => ({ de: str(l && l.de, 40), para: str(l && l.para, 40), tipo: tem(TIPOS, l && l.tipo) ? l.tipo : '',
    via: lista(l && l.via).map(v => str(v, 90)).filter(v => pids.has(v)), noticia: Number(l && l.noticia) || 0, texto: str(l && l.texto, 200), confianca: conf(l && l.confianca), fontes: fontes(l && l.fontes) }))
    .filter(l => ids.has(l.de) && ids.has(l.para) && l.de !== l.para && l.tipo);
  const sinais = lista(m.hipoteses).slice(0, 8).map(h => ({ id: tem(HIPOTESES, h && h.id) ? h.id : '', sinal: h && h.sinal === 'contra' ? 'contra' : 'a-favor',
    porque: str(h && h.porque, 240), noticia: Number(h && h.noticia) || 0, confianca: conf(h && h.confianca), fontes: fontes(h && h.fontes) })).filter(h => h.id);
  if (!players.length && !pecas.length) return null;
  const a = m.antes && typeof m.antes === 'object' && m.antes.saldos && typeof m.antes.saldos === 'object' ? m.antes : null;
  const antes = a ? { data: str(a.data, 10), saldos: Object.fromEntries(Object.entries(a.saldos).filter(([k, v]) => tem(PLAYERS, k) && tem(FAIXA, v))) } : null;
  const pl = m.placar && typeof m.placar === 'object' ? m.placar : null;
  const placar = pl ? { desde: str(pl.desde, 10), rodadas: Number(pl.rodadas) || 0,
    hipoteses: Object.fromEntries(Object.entries(pl.hipoteses && typeof pl.hipoteses === 'object' ? pl.hipoteses : {}).filter(([k]) => tem(HIPOTESES, k))
      .map(([k, v]) => [k, { favor: Number(v && v.favor) || 0, contra: Number(v && v.contra) || 0 }])) } : null;
  return { versao: 2, noticias, players, pecas, lacos, sinais, leitura: str(m.leitura, 800), por: str(m.por, 60), antes, placar };
}

// ---------- o desenho: três faixas (em cima quem sai ganhando, no meio quem está em disputa, embaixo quem sai perdendo); as setas são as jogadas
function svgMapa(m, sel, filtro, mud) {
  const W = 360, R = 18, FILA = 82, POR_FILA = 4;
  const daRodada = x => !filtro || x.noticias.includes(filtro);
  const conta = {};
  for (const x of m.pecas) if (x.dono && daRodada(x)) conta[x.dono] = (conta[x.dono] || 0) + 1;
  const pos = {}, fundo = [];
  let y = 0;
  for (const s of ['ganha', 'disputa', 'perde']) {
    const xs = m.players.filter(p => p.saldo === s).sort((a, b) => ORDEM.indexOf(a.id) - ORDEM.indexOf(b.id));
    const filas = Math.ceil(xs.length / POR_FILA), alt = xs.length ? 26 + filas * FILA : 46;
    fundo.push(`<rect class="mf-banda mf-b-${s}" x="1" y="${y + 1}" width="${W - 2}" height="${alt - 8}" rx="12"/>`,
      `<text class="mf-banda-tit mf-t-${s}" x="12" y="${y + 16}">${esc(FAIXA[s])}</text>`);
    if (!xs.length) fundo.push(`<text class="mf-vazio" x="${W / 2}" y="${y + 32}" text-anchor="middle">nenhum player nesta rodada</text>`);
    xs.forEach((p, k) => {
      const f = Math.floor(k / POR_FILA), n = Math.min(POR_FILA, xs.length - f * POR_FILA);
      pos[p.id] = { x: Math.round(W * ((k % POR_FILA) + 0.5) / n), y: y + 26 + f * FILA + 22, fila: s + f, p };
    });
    y += alt;
  }
  const perto = new Set(), lacoSel = sel && sel.tipo === 'laco' ? m.lacos[sel.id] : null;
  if (sel && sel.tipo === 'player') { perto.add(sel.id); m.lacos.forEach(l => { if (l.de === sel.id || l.para === sel.id) { perto.add(l.de); perto.add(l.para); } }); }
  if (lacoSel) { perto.add(lacoSel.de); perto.add(lacoSel.para); }
  const vezes = {}, f1 = v => v.toFixed(1);
  const setas = m.lacos.map((l, k) => {
    const A = pos[l.de], B = pos[l.para];
    if (!A || !B || (filtro && l.noticia !== filtro)) return '';
    const par = [l.de, l.para].sort().join('|'), vez = vezes[par] = (vezes[par] || 0) + 1;
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1;
    let cx, cy;
    if (A.fila === B.fila) { cx = mx; cy = my + (vez % 2 === 1 ? -1 : 1) * (30 + 0.1 * Math.abs(dx)) * (1 + 0.5 * Math.floor((vez - 1) / 2)); }
    else { const b = (0.16 + 0.12 * (vez - 1)) * d; cx = mx - dy / d * b; cy = my + dx / d * b; }
    const un = (px, py) => { const L = Math.hypot(cx - px, cy - py) || 1; return [(cx - px) / L, (cy - py) / L]; };
    const [ux, uy] = un(A.x, A.y), [vx, vy] = un(B.x, B.y);
    const sx = A.x + ux * (R + 5), sy = A.y + uy * (R + 5), ex = B.x + vx * (R + 9), ey = B.y + vy * (R + 9);
    const px = 0.25 * sx + 0.5 * cx + 0.25 * ex, py = 0.25 * sy + 0.5 * cy + 0.25 * ey, caminho = `M${f1(sx)},${f1(sy)} Q${f1(cx)},${f1(cy)} ${f1(ex)},${f1(ey)}`;
    const apagado = sel && (sel.tipo === 'player' ? !(l.de === sel.id || l.para === sel.id) : sel.id !== k);
    return `<g class="mf-laco mf-l-${l.tipo}${apagado ? ' mf-apagado' : ''}${lacoSel && sel.id === k ? ' mf-sel' : ''}" data-laco="${k}" role="button" tabindex="0" aria-label="${esc(`${nomeP(l.de)} ${TIPOS[l.tipo]} ${nomeP(l.para)}, notícia ${l.noticia}`)}">`
      + `<path class="mf-seta mf-${l.tipo}" d="${caminho}"${l.tipo === 'negocia' ? '' : ` marker-end="url(#mf-p-${l.tipo})"`}/><path class="mf-toque" d="${caminho}"/>`
      + (filtro ? '' : `<g class="mf-num mf-n-${l.tipo}" transform="translate(${f1(px)},${f1(py)})"><circle r="7"/><text text-anchor="middle" dy="3">${l.noticia}</text></g>`) + '</g>';
  });
  const nos = Object.values(pos).map(({ x, y: yy, p }) => {
    const apagado = (sel && !perto.has(p.id)) || (filtro && !p.noticias.includes(filtro)), escolhido = sel && sel.tipo === 'player' && sel.id === p.id;
    const anel = p.fez ? `<circle class="mf-anel" r="${R + 5}"/>` : p.disse ? `<circle class="mf-anel fala" r="${R + 5}"/>` : '';
    const nome = quebra(nomeP(p.id), 13, 2).map((t, k) => `<text class="mf-nome" text-anchor="middle" y="${R + 15 + k * 12}">${esc(t)}</text>`).join('');
    const n = conta[p.id] ? `<text class="mf-conta" text-anchor="middle" dy="4">${conta[p.id]}</text>` : '';
    const mv = mud[p.id] ? `<text class="mf-mud ${mud[p.id]}" x="${R + 3}" y="${-R + 2}">${mud[p.id] === 'sobe' ? '▲' : mud[p.id] === 'desce' ? '▼' : 'novo'}</text>` : '';
    return `<g class="mf-no mf-s-${p.saldo}${apagado ? ' mf-apagado' : ''}${escolhido ? ' mf-sel' : ''}" data-player="${esc(p.id)}" transform="translate(${x},${yy})" role="button" tabindex="0" aria-label="${esc(`${nomeP(p.id)}, ${SALDO1[p.saldo]}`)}">${anel}<circle class="mf-forma" r="${R}"/>${n}${nome}${mv}</g>`;
  });
  const pontas = Object.keys(TIPOS).filter(t => t !== 'negocia').map(t => `<marker id="mf-p-${t}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path class="mf-ponta mf-pt-${t}" d="M0,0 L10,5 L0,10 z"/></marker>`).join('');
  return `<svg class="mf" viewBox="0 0 ${W} ${y}" role="group" aria-label="Mapa de forças: os players que saem ganhando, em disputa e perdendo, e as setas das jogadas"><defs>${pontas}</defs>${fundo.join('')}${setas.join('')}${nos.join('')}</svg>`;
}

function partes(o, m, st, pintar) {
  const sel = st.sel || null, filtro = st.filtro || null;
  const escolher = (tipo, id) => { st.sel = !tipo || (sel && sel.tipo === tipo && sel.id === id) ? null : { tipo, id }; pintar(); };
  const filtrar = n => { st.filtro = n && st.filtro !== n ? n : null; st.sel = null; pintar(); };
  const daRodada = x => !filtro || (x.noticias ? x.noticias.includes(filtro) : x.noticia === filtro);
  const det = (k, sum, ...corpo) => {
    const d = el('details', { class: 'mf-det' }, el('summary', {}, sum), ...corpo);
    if (st.abertos.includes(k)) d.open = true;
    d.addEventListener('toggle', () => { st.abertos = st.abertos.filter(x => x !== k); if (d.open) st.abertos.push(k); });
    return d;
  };
  const fontesEl = (fs, k) => fs.length ? det('f:' + k, `Fontes · ${fs.length}`, el('ul', { class: 'mf-fontes' }, fs.map(f =>
    el('li', {}, el('a', { href: f.url, target: '_blank', rel: 'noopener noreferrer' }, f.nome || f.url), f.data ? el('small', {}, ' · ' + f.data) : null)))) : null;
  const selo = c => c ? el('span', { class: 'mf-selo mf-c-' + c }, CONF[c]) : null;
  const rot = t => el('p', { class: 'mf-rot' }, t);
  const icone = x => el('span', { class: 'mf-ic mf-ic-' + x.tipo, title: x.tipo === 'territorio' ? 'território: o que se disputa' : 'peça: quem se move' }, x.tipo === 'territorio' ? '■' : '●');
  const botaoP = id => el('button', { type: 'button', class: 'mf-link', onclick: () => escolher('player', id) }, nomeP(id));
  const mud = {};
  if (m.antes) for (const p of m.players) { const a = m.antes.saldos[p.id]; mud[p.id] = !a ? 'novo' : NIVEL[p.saldo] > NIVEL[a] ? 'sobe' : NIVEL[p.saldo] < NIVEL[a] ? 'desce' : ''; }

  // o desenho, com o toque nos players e nas setas
  const desenho = deSvg(svgMapa(m, sel, filtro, mud));
  const ligar = (g, tipo, id) => { g.addEventListener('click', () => escolher(tipo, id)); g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); escolher(tipo, id); } }); };
  desenho.querySelectorAll('[data-player]').forEach(g => ligar(g, 'player', g.getAttribute('data-player')));
  desenho.querySelectorAll('[data-laco]').forEach(g => ligar(g, 'laco', Number(g.getAttribute('data-laco'))));

  // desde a rodada anterior
  let desde = null;
  if (m.antes) {
    const grupo = t => m.players.filter(p => mud[p.id] === t).map(p => nomeP(p.id));
    const pararam = Object.keys(m.antes.saldos).filter(id => !m.players.some(p => p.id === id)).map(nomeP);
    const ps = [['subiram', grupo('sobe')], ['desceram', grupo('desce')], ['entraram', grupo('novo')], ['pararam', pararam]].filter(([, xs]) => xs.length);
    desde = el('p', { class: 'mf-desde' }, el('b', {}, `Desde a rodada de ${diaMes(m.antes.data)}: `), ps.length ? ps.map(([t, xs], k) => `${k ? '; ' : ''}${t} ${xs.join(', ')}`).join('') + '.' : 'nenhum player mudou de faixa.');
  }
  const parados = ORDEM.filter(id => !m.players.some(p => p.id === id));
  const notF = filtro && m.noticias.find(n => n.n === filtro);
  const botoes = el('div', { class: 'mf-filtro', role: 'group', 'aria-label': 'Ver todas as notícias ou uma por vez' },
    el('button', { type: 'button', class: 'mf-btn', 'aria-pressed': String(!filtro), onclick: () => filtrar(null) }, 'Todas'),
    m.noticias.map(n => el('button', { type: 'button', class: 'mf-btn', 'aria-pressed': String(filtro === n.n), title: n.rotulo, onclick: () => filtrar(n.n) }, String(n.n))),
    el('span', { class: 'mf-apagado-txt' }, notF ? notF.rotulo : 'ver uma notícia por vez'));

  // a legenda
  const amostra = t => deSvg(`<svg class="mf-amostra" viewBox="0 0 30 10" aria-hidden="true"><path class="mf-seta mf-${t}" d="M1,5 L${t === 'negocia' ? 29 : 23},5"/>${t === 'negocia' ? '' : `<path class="mf-ponta mf-pt-${t}" d="M22,1 L29,5 L22,9 z"/>`}</svg>`);
  const forma = (html, t) => el('span', {}, deSvg(`<svg class="mf-amostra-forma" viewBox="0 0 22 22" aria-hidden="true">${html}</svg>`), t);
  const legenda = el('div', { class: 'mf-legenda' },
    el('div', {}, [['ataca', 'ataca'], ['pressiona', 'pressiona'], ['apoia', 'apoia'], ['negocia', 'negocia'], ['lucra', 'lucra com']].map(([t, r]) => el('span', {}, amostra(t), r))),
    el('div', {}, forma('<circle class="mf-forma-neutra" cx="11" cy="11" r="6"/><circle class="mf-anel" cx="11" cy="11" r="9.5"/>', 'moveu peças'),
      forma('<circle class="mf-forma-neutra" cx="11" cy="11" r="6"/><circle class="mf-anel fala" cx="11" cy="11" r="9.5"/>', 'só falou'),
      el('span', {}, 'o número no player: as peças e territórios dele na rodada; na seta: a notícia')));

  // o detalhe do player ou da jogada escolhida
  let detalhe = el('p', { class: 'mf-dica' }, 'Toque num player ou numa seta para ver as jogadas, as peças e as fontes.');
  if (sel && sel.tipo === 'player') {
    const p = m.players.find(x => x.id === sel.id);
    if (p) {
      const lados = m.noticias.flatMap(n => [...n.ganham.filter(x => x.ator === p.id).map(x => ({ ...x, n, lado: 'ganha' })), ...n.perdem.filter(x => x.ator === p.id).map(x => ({ ...x, n, lado: 'perde' }))]);
      const lacos = m.lacos.map((l, k) => ({ l, k })).filter(({ l }) => l.de === p.id || l.para === p.id);
      const suas = m.pecas.filter(x => x.dono === p.id);
      detalhe = el('div', { class: 'mf-detalhe', role: 'region', 'aria-label': nomeP(p.id) },
        el('div', { class: 'mf-topo' }, el('span', { class: 'mf-tab' }, 'player'), el('span', { class: 'mf-etq mf-e-' + p.saldo }, SALDO1[p.saldo]), el('span', { class: 'mf-mola' }), selo(p.confianca),
          el('button', { type: 'button', class: 'mf-btn', onclick: () => escolher(null) }, 'fechar')),
        el('h3', { class: 'mf-h' }, nomeP(p.id), el('small', {}, ' · ' + PLAYERS[p.id][1])),
        el('p', { class: 'mf-peq' }, 'Na lista: ' + PLAYERS[p.id][2] + '.'),
        p.papel ? el('p', {}, p.papel) : null,
        p.fez || p.disse ? el('div', { class: 'mf-duas' }, p.disse ? el('div', { class: 'mf-diz' }, rot('O que diz'), el('p', {}, p.disse)) : null, p.fez ? el('div', { class: 'mf-fez' }, rot('O que fez'), el('p', {}, p.fez)) : null) : null,
        lados.length ? el('ul', { class: 'mf-lados' }, lados.map(x => el('li', { class: 'mf-l-' + x.lado }, el('b', {}, `${x.lado === 'ganha' ? '▲ Ganha' : '▼ Perde'} com a ${x.n.n}, ${x.n.rotulo}: `), x.porque,
          x.confianca && x.confianca !== 'fato' ? el('small', {}, ` (${CONF[x.confianca]})`) : null))) : null,
        lacos.length ? [rot('As jogadas'), el('ul', { class: 'mf-lacos' }, lacos.map(({ l, k }) => el('li', {},
          el('button', { type: 'button', class: 'mf-link', onclick: () => escolher('laco', k) }, `${nomeP(l.de)} ${TIPOS[l.tipo]} ${nomeP(l.para)}`), el('small', {}, ` · notícia ${l.noticia}`))))] : null,
        suas.length ? [rot('As peças e territórios dele nesta rodada'), el('ul', { class: 'mf-suas' }, suas.map(x => el('li', {}, icone(x), ' ', el('b', {}, x.nome), ': ', x.fez)))] : null,
        fontesEl(p.fontes, 'p:' + p.id));
    }
  } else if (sel && sel.tipo === 'laco' && m.lacos[sel.id]) {
    const l = m.lacos[sel.id], n = m.noticias.find(x => x.n === l.noticia);
    const via = l.via.map(id => m.pecas.find(x => x.id === id)).filter(Boolean);
    detalhe = el('div', { class: 'mf-detalhe', role: 'region', 'aria-label': 'A jogada' },
      el('div', { class: 'mf-topo' }, el('span', { class: 'mf-tab' }, `notícia ${l.noticia}` + (n ? ' · ' + n.rotulo : '')), el('span', { class: 'mf-mola' }), selo(l.confianca),
        el('button', { type: 'button', class: 'mf-btn', onclick: () => escolher(null) }, 'fechar')),
      el('h3', { class: 'mf-h' }, `${nomeP(l.de)} ${TIPOS[l.tipo]} ${nomeP(l.para)}`),
      el('p', {}, l.texto),
      via.length ? [rot('Por meio de'), el('ul', { class: 'mf-suas' }, via.map(x => el('li', {}, icone(x), ' ', el('b', {}, x.nome), x.dono ? el('small', {}, ' · de ' + nomeP(x.dono)) : null, ': ', x.fez)))] : null,
      el('p', {}, [l.de, l.para].map((id, k) => [k ? ' · ' : '', el('button', { type: 'button', class: 'mf-link', onclick: () => escolher('player', id) }, 'ver ' + nomeP(id))])),
      fontesEl(l.fontes, 'l:' + sel.id));
  }

  // as 3 notícias, com quem ganha e quem perde
  const nomes = xs => xs.map((x, k) => [k ? ', ' : '', botaoP(x.ator)]);
  const rodada = el('ol', { class: 'mf-rodada', 'aria-label': 'As três notícias do mapa' }, m.noticias.map(n => {
    const item = (o.edicao.itens || []).find(i => i.id === n.id);
    return el('li', {}, el('button', { type: 'button', class: 'mf-bola', 'aria-pressed': String(filtro === n.n), title: 'Ver só esta notícia no mapa', onclick: () => filtrar(n.n) }, String(n.n)),
      el('div', {},
        item && o.rolar && o.idCartao ? el('button', { type: 'button', class: 'mf-not', title: 'Ir até a notícia', onclick: () => o.rolar(o.idCartao(item)) }, n.rotulo) : el('span', { class: 'mf-not' }, n.rotulo),
        n.ganham.length ? el('p', { class: 'mf-l-ganha' }, el('b', {}, '▲ ganham: '), nomes(n.ganham)) : null,
        n.perdem.length ? el('p', { class: 'mf-l-perde' }, el('b', {}, '▼ perdem: '), nomes(n.perdem)) : null));
  }));

  // as peças e territórios da rodada, por player
  const visiveis = m.pecas.filter(daRodada);
  const grupos = [...ORDEM, ''].map(d => [d, visiveis.filter(x => x.dono === d)]).filter(([, xs]) => xs.length);
  const pecasEl = visiveis.length ? el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, 'As peças e os territórios', el('small', {}, String(visiveis.length))),
    el('p', { class: 'mf-peq' }, '● peça é quem se move (um governo, uma agência, uma empresa); ■ território é o que se disputa (um país, uma rota, um mercado). O dono é o player a quem a lista liga a peça: é a hipótese em teste.'),
    grupos.map(([d, xs]) => el('div', { class: 'mf-grupo' }, el('p', { class: 'mf-dono' }, d ? botaoP(d) : 'Sem dono claro'),
      xs.map(x => det('pc:' + x.id, [icone(x), ' ', el('b', {}, x.nome), el('small', {}, ' · notícia ' + x.noticias.join(', '))],
        el('div', { class: 'mf-peca' }, el('p', {}, x.fez), selo(x.confianca), fontesEl(x.fontes, 'pc:' + x.id))))))) : null;

  // as hipóteses da lista: o sinal desta rodada e o placar
  const sinais = m.sinais.filter(daRodada);
  const pl = m.placar && m.placar.hipoteses ? m.placar : null;
  const comPlacar = pl ? Object.keys(HIPOTESES).filter(h => pl.hipoteses[h]) : [];
  const semSinal = Object.keys(HIPOTESES).filter(h => !comPlacar.includes(h));
  const hipEl = el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, 'As hipóteses da lista, em teste'),
    el('p', { class: 'mf-peq' }, 'Cada rodada procura fatos que combinam (✓) ou não combinam (✗) com o que a lista afirma. Um sinal não é prova.'),
    sinais.length ? el('ul', { class: 'mf-sinais' }, sinais.map((h, k) => el('li', { class: 'mf-s-' + h.sinal },
      el('span', { class: 'mf-marca', 'aria-label': h.sinal === 'contra' ? 'sinal contra' : 'sinal a favor' }, h.sinal === 'contra' ? '✗' : '✓'),
      el('div', {}, el('p', { class: 'mf-hip' }, HIPOTESES[h.id][1]), el('p', {}, h.porque, el('small', {}, ` · notícia ${h.noticia}`)), selo(h.confianca), fontesEl(h.fontes, 'h:' + h.id + k))))) :
      el('p', { class: 'mf-peq' }, 'Nenhum sinal nesta rodada.'),
    pl ? det('placar', `O placar desde ${diaMes(pl.desde)} · ${pl.rodadas} ${pl.rodadas === 1 ? 'rodada' : 'rodadas'}`,
      comPlacar.length ? el('ul', { class: 'mf-placar' }, comPlacar.map(h => el('li', {}, el('span', { class: 'mf-conta-h' }, `✓ ${pl.hipoteses[h].favor} · ✗ ${pl.hipoteses[h].contra}`), ' ', HIPOTESES[h][1]))) : null,
      semSinal.length ? el('p', { class: 'mf-peq' }, `Ainda sem sinal (${semSinal.length}): ` + semSinal.map(h => HIPOTESES[h][1].replace(/\.$/, '')).join('; ') + '.') : null) : null);

  return [
    el('div', { class: 'mf-cab' }, el('h2', { id: 'mf-tit', class: 'mf-tit' }, 'O mapa de forças'),
      el('span', { class: 'mf-apagado-txt' }, 'o jogo dos 7 grupos maiores da lista, nas 3 principais notícias de Geopolítica')),
    desde, botoes, desenho,
    parados.length ? el('p', { class: 'mf-parados' }, el('b', {}, 'Sem jogada nesta rodada: '), parados.map(nomeP).join(', ') + '.') : null,
    legenda, detalhe, rodada, pecasEl, hipEl,
    m.leitura ? el('div', { class: 'mf-leitura' }, rot('O jogo depois desta rodada'), el('p', {}, m.leitura)) : null,
    el('p', { class: 'mf-pe' }, `Um jogo de hipóteses: só os 7 grupos maiores de uma lista de poder ganham ou perdem. Países, pessoas e instituições são peças, que se movem, ou territórios, que se disputam. A ligação de uma peça a um player é a hipótese da lista; os fatos têm fonte. Exercício lúdico: nada aqui afirma a realidade.${m.por ? ' Feito por ' + m.por + '.' : ''}`),
  ];
}

// ---------- a versão 3: o tabuleiro (pedidos do Jean em 10/11/2026). Os players são a cama maior, que não se vê; as peças são as pessoas
// que executam; as casas são as instituições e os lugares onde o poder opera, num tabuleiro como o de xadrez, por domínio.
// E o placar da hipótese "Trump está a serviço da China", com pontos e pesos, que se soma rodada a rodada.
const CORES = { 'core-financeiro': '#E3C16F', 'deep-state-eua': '#5B8DEF', 'empresas-controle': '#C084FC', 'oligarquia-digital': '#2DD4BF',
  'deep-state-europa-asia': '#FB7185', 'nova-ordem': '#A3E635', 'espionagem-privada': '#CBD5E1' };
const DOMINIOS = { dinheiro: 'Dinheiro', forca: 'Força', governo: 'Governo', tecnologia: 'Tecnologia', informacao: 'Informação', territorio: 'Território' };
const SALDO3 = { ganha: '▲ ganha', perde: '▼ perde', disputa: '↕ em disputa', parado: '· parado' };
const TIPOS3 = { ...TIPOS, move: 'move' };
const num = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(1).replace('.', ',');
const cor = id => CORES[id] || '#8A90A6';

function limpar3(m) {
  const fontes = v => lista(v).slice(0, 4).map(f => ({ nome: str(f && f.nome, 200).trim(), url: url(f && f.url), data: str(f && f.data, 40) })).filter(f => f.url);
  const linhas = v => lista(v).slice(0, 4).map(x => ({ texto: str(x && x.texto, 200), confianca: conf(x && x.confianca) })).filter(x => x.texto);
  const players = ORDEM.map(id => {
    const p = lista(m.players).find(x => x && x.id === id) || {};
    return { id, dia: str(p.dia, 1200), ganhos: linhas(p.ganhos), perdas: linhas(p.perdas), saldo: tem(SALDO3, p.saldo) ? p.saldo : 'parado', confianca: conf(p.confianca), fontes: fontes(p.fontes) };
  });
  const casas = lista(m.casas).slice(0, 20).map(x => ({ id: slug(x && x.id), nome: str(x && x.nome, 40), dominio: tem(DOMINIOS, x && x.dominio) ? x.dominio : 'territorio',
    dono: tem(PLAYERS, x && x.dono) ? x.dono : '', aconteceu: str(x && x.aconteceu, 200), confianca: conf(x && x.confianca), fontes: fontes(x && x.fontes) })).filter(x => x.id && x.nome);
  const cids = new Set(casas.map(c => c.id));
  const pecas = lista(m.pecas).slice(0, 16).map(x => ({ id: slug(x && x.id), nome: str(x && x.nome, 40), cargo: str(x && x.cargo, 60), casa: str(x && x.casa, 90),
    dono: tem(PLAYERS, x && x.dono) ? x.dono : '', fez: str(x && x.fez, 200), confianca: conf(x && x.confianca), fontes: fontes(x && x.fontes) })).filter(x => x.id && x.nome && cids.has(x.casa));
  const pids = new Set(pecas.map(x => x.id));
  const jogadas = lista(m.jogadas).slice(0, 16).map(j => ({ de: tem(PLAYERS, j && j.de) ? j.de : '', para: tem(PLAYERS, j && j.para) ? j.para : '', tipo: tem(TIPOS3, j && j.tipo) ? j.tipo : '',
    peca: pids.has(j && j.peca) ? j.peca : '', de_casa: str(j && j.de_casa, 90), para_casa: str(j && j.para_casa, 90), texto: str(j && j.texto, 200), confianca: conf(j && j.confianca), fontes: fontes(j && j.fontes) }))
    .filter(j => j.de && j.tipo && cids.has(j.de_casa) && cids.has(j.para_casa));
  const sinais = lista(m.hipoteses).slice(0, 8).map(h => ({ id: tem(HIPOTESES, h && h.id) ? h.id : '', sinal: h && h.sinal === 'contra' ? 'contra' : 'a-favor',
    porque: str(h && h.porque, 240), noticia: Number(h && h.noticia) || 0, confianca: conf(h && h.confianca), fontes: fontes(h && h.fontes) })).filter(h => h.id);
  const tc = m.trumpChina && typeof m.trumpChina === 'object' ? m.trumpChina : null;
  const trump = tc ? { leitura: str(tc.leitura, 600), dia: Number(tc.dia) || 0, total: Number(tc.total) || 0,
    movimentos: lista(tc.movimentos).slice(0, 12).map(x => ({ id: slug(x && x.id), data: str(x && x.data, 10), texto: str(x && x.texto, 240), sentido: x && x.sentido === 'contra' ? 'contra' : 'favor',
      peso: Math.max(1, Math.min(5, Math.round(Number(x && x.peso) || 1))), porquePeso: str(x && x.porquePeso, 200), tipo: x && x.tipo === 'evidencia-direta' ? 'evidencia-direta' : 'ato',
      confianca: conf(x && x.confianca), pontos: Number(x && x.pontos) || 0, fontes: fontes(x && x.fontes) })).filter(x => x.texto),
    historico: lista(tc.historico).slice(-60).map(h => ({ data: str(h && h.data, 10), dia: Number(h && h.dia) || 0, total: Number(h && h.total) || 0 })).filter(h => h.data) } : null;
  const a = m.antes && typeof m.antes === 'object' && m.antes.saldos && typeof m.antes.saldos === 'object' ? m.antes : null;
  const antes = a ? { data: str(a.data, 10), saldos: Object.fromEntries(Object.entries(a.saldos).filter(([k, v]) => tem(PLAYERS, k) && (tem(FAIXA, v) || v === 'parado'))) } : null;
  const pl = m.placar && typeof m.placar === 'object' ? m.placar : null;
  const placar = pl ? { desde: str(pl.desde, 10), rodadas: Number(pl.rodadas) || 0,
    hipoteses: Object.fromEntries(Object.entries(pl.hipoteses && typeof pl.hipoteses === 'object' ? pl.hipoteses : {}).filter(([k]) => tem(HIPOTESES, k))
      .map(([k, v]) => [k, { favor: Number(v && v.favor) || 0, contra: Number(v && v.contra) || 0 }])) } : null;
  return { versao: 3, noticias: [], players, casas, pecas, jogadas, sinais, analise: str(m.analise, 2500), trump, antes, placar, por: str(m.por, 60) };
}

function svgTabuleiro(m, st) {   // o tabuleiro: uma fileira por domínio, as casas em quadrados alternados como no xadrez, as peças dentro delas
  const W = 360, COLS = 4, GAP = 4, CW = (W - GAP * (COLS - 1)) / COLS, CH = 66, ROT = 16;
  const foco = st.player || null, sel = st.sel || null;
  const toca = (c, id) => !foco || c.dono === foco || m.pecas.some(p => p.casa === c.id && p.dono === foco)
    || m.jogadas.some(j => (j.de === foco || j.para === foco) && (j.de_casa === id || j.para_casa === id));
  const pos = {}, casas = [];
  let y = 0, k = 0;
  for (const d of Object.keys(DOMINIOS)) {
    const cs = m.casas.filter(c => c.dominio === d), filas = Math.max(1, Math.ceil(cs.length / COLS));
    casas.push(`<text class="mf3-dom" x="1" y="${y + 11}">${esc(DOMINIOS[d].toUpperCase())}</text>`);
    for (let i = cs.length; i < filas * COLS; i++) {   // as casas vazias do tabuleiro
      const col = i % COLS, lin = Math.floor(i / COLS);
      casas.push(`<rect class="mf3-vaga${(col + lin + k) % 2 === 1 ? ' escura' : ''}" x="${col * (CW + GAP)}" y="${y + ROT + lin * (CH + GAP)}" width="${CW}" height="${CH}" rx="6"/>`);
    }
    y += ROT;
    cs.forEach((c, i) => {
      const col = i % COLS, lin = Math.floor(i / COLS), x0 = col * (CW + GAP), y0 = y + lin * (CH + GAP);
      pos[c.id] = { x: x0 + CW / 2, y: y0 + CH / 2 };
      const escura = (col + lin + k) % 2 === 1, dentro = m.pecas.filter(p => p.casa === c.id);
      const apagada = !toca(c, c.id), escolhida = sel && sel.tipo === 'casa' && sel.id === c.id;
      const nome = quebra(c.nome, 15, 2).map((t, n) => `<text class="mf3-nome" x="${x0 + 6}" y="${y0 + 13 + n * 11}">${esc(t)}</text>`).join('');
      const pcs = dentro.slice(0, 2).map((p, n) => `<circle cx="${x0 + 9}" cy="${y0 + 39 + n * 12}" r="3.6" fill="${p.dono ? cor(p.dono) : '#8A90A6'}"/>`
        + `<text class="mf3-peca" x="${x0 + 16}" y="${y0 + 42 + n * 12}">${esc(quebra(p.nome, 13, 1)[0])}</text>`).join('')
        + (dentro.length > 2 ? `<text class="mf3-mais" x="${x0 + CW - 6}" y="${y0 + CH - 5}" text-anchor="end">+${dentro.length - 2}</text>` : '');
      casas.push(`<g class="mf3-casa${escura ? ' escura' : ''}${apagada ? ' mf-apagado' : ''}${escolhida ? ' mf-sel' : ''}" data-casa="${esc(c.id)}" role="button" tabindex="0" aria-label="${esc(c.nome + (c.dono ? ', de ' + nomeP(c.dono) : ''))}">`
        + `<rect x="${x0}" y="${y0}" width="${CW}" height="${CH}" rx="6" style="stroke:${c.dono ? cor(c.dono) : 'rgba(138,144,166,.35)'}"/>${nome}${pcs}</g>`);
    });
    y += filas * (CH + GAP) + 4;
    k++;
  }
  const vezes = {}, f1 = v => v.toFixed(1);
  const setas = m.jogadas.map((j, n) => {
    const A = pos[j.de_casa], B = pos[j.para_casa];
    if (!A || !B) return '';
    const apagada = (foco && j.de !== foco && j.para !== foco) || (sel && sel.tipo === 'jogada' && sel.id !== n) || (sel && sel.tipo === 'casa' && j.de_casa !== sel.id && j.para_casa !== sel.id);
    const cls = `mf-laco mf-l-${j.tipo === 'move' ? 'apoia' : j.tipo}${apagada ? ' mf-apagado' : ''}${sel && sel.tipo === 'jogada' && sel.id === n ? ' mf-sel' : ''}`;
    const rot = esc(`${nomeP(j.de)} ${TIPOS3[j.tipo]}${j.para ? ' ' + nomeP(j.para) : ''}`);
    if (j.de_casa === j.para_casa) {   // a jogada dentro da mesma casa: um anel no canto
      return `<g class="${cls}" data-jogada="${n}" role="button" tabindex="0" aria-label="${rot}"><circle class="mf-seta mf-${j.tipo === 'move' ? 'apoia' : j.tipo}" cx="${f1(A.x + 30)}" cy="${f1(A.y - 20)}" r="7"/><circle class="mf-toque" cx="${f1(A.x + 30)}" cy="${f1(A.y - 20)}" r="9"/></g>`;
    }
    const par = [j.de_casa, j.para_casa].sort().join('|'), vez = vezes[par] = (vezes[par] || 0) + 1;
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, b = (0.18 + 0.12 * (vez - 1)) * d;
    const cx = mx - dy / d * b, cy = my + dx / d * b;
    const un = (px, py) => { const L = Math.hypot(cx - px, cy - py) || 1; return [(cx - px) / L, (cy - py) / L]; };
    const [ux, uy] = un(A.x, A.y), [vx, vy] = un(B.x, B.y);
    const sx = A.x + ux * 16, sy = A.y + uy * 16, ex = B.x + vx * 20, ey = B.y + vy * 20, cam = `M${f1(sx)},${f1(sy)} Q${f1(cx)},${f1(cy)} ${f1(ex)},${f1(ey)}`;
    const t = j.tipo === 'move' ? 'apoia' : j.tipo;
    return `<g class="${cls}" data-jogada="${n}" role="button" tabindex="0" aria-label="${rot}"><path class="mf-seta mf-${t}${j.tipo === 'move' ? ' mf3-move' : ''}" d="${cam}"${t === 'negocia' ? '' : ` marker-end="url(#mf3-p-${t})"`}/>`
      + `<path class="mf-toque" d="${cam}"/><circle cx="${f1(sx)}" cy="${f1(sy)}" r="3.4" fill="${cor(j.de)}"/></g>`;
  });
  const pontas = Object.keys(TIPOS).filter(t => t !== 'negocia').map(t => `<marker id="mf3-p-${t}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path class="mf-ponta mf-pt-${t}" d="M0,0 L10,5 L0,10 z"/></marker>`).join('');
  return { html: `<svg class="mf mf3" viewBox="0 0 ${W} ${Math.max(y, 40)}" role="group" aria-label="O tabuleiro: as casas onde o poder opera, por domínio, com as peças dentro e as jogadas entre elas"><defs>${pontas}</defs>${casas.join('')}${setas.join('')}</svg>`, vazio: !m.casas.length };
}

function svgHistorico(h) {   // o placar Trump e China, dia a dia: a barra é o saldo do dia, a linha é o total
  if (!h.length) return '';
  const W = 360, H = 64, M = 4, max = Math.max(1, ...h.map(x => Math.abs(x.dia)), ...h.map(x => Math.abs(x.total)));
  const bw = Math.min(26, (W - 2 * M) / h.length - 4), meio = H / 2, esc_ = v => v / max * (H / 2 - 6);
  const xs = h.map((x, i) => M + i * ((W - 2 * M) / h.length) + bw / 2 + 2);
  const barras = h.map((x, i) => { const v = esc_(x.dia); return `<rect class="mf3-barra ${x.dia >= 0 ? 'favor' : 'contra'}" x="${(xs[i] - bw / 2).toFixed(1)}" y="${(v >= 0 ? meio - v : meio).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(v)).toFixed(1)}" rx="2"/>`; }).join('');
  const linha = h.length > 1 ? `<polyline class="mf3-linha" points="${h.map((x, i) => `${xs[i].toFixed(1)},${(meio - esc_(x.total)).toFixed(1)}`).join(' ')}"/>` : '';
  return `<svg class="mf3-hist" viewBox="0 0 ${W} ${H}" role="img" aria-label="O saldo de cada dia e o total do placar"><line class="mf3-zero" x1="0" y1="${meio}" x2="${W}" y2="${meio}"/>${barras}${linha}</svg>`;
}

function partes3(o, m, st, pintar) {
  const muda = f => { f(); pintar(); };
  const det = (k, sum, ...corpo) => {
    const d = el('details', { class: 'mf-det' }, el('summary', {}, sum), ...corpo);
    if (st.abertos.includes(k)) d.open = true;
    d.addEventListener('toggle', () => { st.abertos = st.abertos.filter(x => x !== k); if (d.open) st.abertos.push(k); });
    return d;
  };
  const fontesEl = (fs, k) => fs.length ? det('f:' + k, `Fontes · ${fs.length}`, el('ul', { class: 'mf-fontes' }, fs.map(f =>
    el('li', {}, el('a', { href: f.url, target: '_blank', rel: 'noopener noreferrer' }, f.nome || f.url), f.data ? el('small', {}, ' · ' + f.data) : null)))) : null;
  const selo = c => c ? el('span', { class: 'mf-selo mf-c-' + c }, CONF[c]) : null;
  const rot = t => el('p', { class: 'mf-rot' }, t);
  const bola = id => el('span', { class: 'mf3-bola', style: `background:${cor(id)}`, 'aria-hidden': 'true' });
  const nomeC = id => (m.casas.find(c => c.id === id) || {}).nome || id;
  const nomePc = id => (m.pecas.find(p => p.id === id) || {}).nome || id;
  const sel = st.sel || null;

  // desde a rodada anterior
  let desde = null;
  if (m.antes) {
    const mud = m.players.map(p => [p, m.antes.saldos[p.id]]).filter(([p, a]) => a && a !== p.saldo);
    desde = el('p', { class: 'mf-desde' }, el('b', {}, `Desde a rodada de ${diaMes(m.antes.data)}: `),
      mud.length ? mud.map(([p, a], k) => `${k ? '; ' : ''}${nomeP(p.id)} foi de ${SALDO3[a] || a} para ${SALDO3[p.saldo]}`).join('') + '.' : 'nenhum player mudou de saldo.');
  }
  // a análise do dia (o texto maior que o Jean pediu)
  const longa = m.analise.length > 700, toda = !!st.analiseToda;
  const analise = m.analise ? el('section', { class: 'mf3-analise' }, rot('A análise do dia, pela ótica do jogo'),
    el('p', { class: 'mf3-texto' + (longa && !toda ? ' curta' : '') }, m.analise),
    longa ? el('button', { type: 'button', class: 'mf-link', onclick: () => muda(() => { st.analiseToda = !toda; }) }, toda ? 'ler menos' : 'ler a análise inteira') : null) : null;
  // a cama maior: os 7 players, que também filtram o tabuleiro
  const cama = el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, 'A cama maior', el('small', {}, 'os 7 players, que não se veem no tabuleiro')),
    el('div', { class: 'mf3-cama', role: 'group', 'aria-label': 'Os 7 players: tocar mostra só as casas e as jogadas dele' }, m.players.map(p =>
      el('button', { type: 'button', class: 'mf3-player mf3-s-' + p.saldo, 'aria-pressed': String(st.player === p.id), onclick: () => muda(() => { st.player = st.player === p.id ? null : p.id; st.sel = null; }) },
        bola(p.id), el('span', { class: 'mf3-pn' }, nomeP(p.id)), el('span', { class: 'mf3-ps' }, SALDO3[p.saldo])))));
  // o tabuleiro
  const tab = svgTabuleiro(m, st), desenho = tab.vazio ? el('p', { class: 'mf-peq' }, 'Nenhuma casa nesta rodada.') : deSvg(tab.html);
  const ligar = (g, tipo, id) => { g.addEventListener('click', () => muda(() => { st.sel = sel && sel.tipo === tipo && sel.id === id ? null : { tipo, id }; })); g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); muda(() => { st.sel = { tipo, id }; }); } }); };
  if (!tab.vazio) {
    desenho.querySelectorAll('[data-casa]').forEach(g => ligar(g, 'casa', g.getAttribute('data-casa')));
    desenho.querySelectorAll('[data-jogada]').forEach(g => ligar(g, 'jogada', Number(g.getAttribute('data-jogada'))));
  }
  const amostra = t => deSvg(`<svg class="mf-amostra" viewBox="0 0 30 10" aria-hidden="true"><path class="mf-seta mf-${t}" d="M1,5 L${t === 'negocia' ? 29 : 23},5"/>${t === 'negocia' ? '' : `<path class="mf-ponta mf-pt-${t}" d="M22,1 L29,5 L22,9 z"/>`}</svg>`);
  const legenda = el('div', { class: 'mf-legenda' },
    el('div', {}, [['ataca', 'ataca'], ['pressiona', 'pressiona'], ['apoia', 'apoia ou move'], ['negocia', 'negocia'], ['lucra', 'lucra com']].map(([t, r]) => el('span', {}, amostra(t), r))),
    el('div', {}, el('span', {}, 'cada fileira é um domínio; o quadrado é uma casa, com a borda na cor do player dono; o ponto colorido é uma peça; a seta sai da casa de quem joga')));
  // o detalhe da casa ou da jogada escolhida
  let detalhe = el('p', { class: 'mf-dica' }, 'Toque numa casa ou numa seta para ver o que aconteceu, as peças e as fontes. Toque num player da cama maior para ver só as jogadas dele.');
  const fechar = el('button', { type: 'button', class: 'mf-btn', onclick: () => muda(() => { st.sel = null; }) }, 'fechar');
  if (sel && sel.tipo === 'casa') {
    const c = m.casas.find(x => x.id === sel.id);
    if (c) {
      const dentro = m.pecas.filter(p => p.casa === c.id), js = m.jogadas.map((j, n) => ({ j, n })).filter(({ j }) => j.de_casa === c.id || j.para_casa === c.id);
      detalhe = el('div', { class: 'mf-detalhe' },
        el('div', { class: 'mf-topo' }, el('span', { class: 'mf-tab' }, 'casa · ' + DOMINIOS[c.dominio]), c.dono ? el('span', { class: 'mf3-dono' }, bola(c.dono), ' de ' + nomeP(c.dono)) : el('span', { class: 'mf3-dono' }, 'sem dono claro'),
          el('span', { class: 'mf-mola' }), selo(c.confianca), fechar),
        el('h3', { class: 'mf-h' }, c.nome), el('p', {}, c.aconteceu),
        dentro.length ? [rot('As peças nesta casa'), el('ul', { class: 'mf-suas' }, dentro.map(p => el('li', {}, bola(p.dono), ' ', el('b', {}, p.nome), p.cargo ? el('small', {}, ' · ' + p.cargo) : null, ': ', p.fez, ' ', selo(p.confianca))))] : null,
        js.length ? [rot('As jogadas'), el('ul', { class: 'mf-lacos' }, js.map(({ j, n }) => el('li', {}, el('button', { type: 'button', class: 'mf-link', onclick: () => muda(() => { st.sel = { tipo: 'jogada', id: n }; }) },
          `${nomeP(j.de)} ${TIPOS3[j.tipo]}${j.para ? ' ' + nomeP(j.para) : ''}`), el('small', {}, ` · de ${nomeC(j.de_casa)} para ${nomeC(j.para_casa)}`))))] : null,
        fontesEl(c.fontes, 'c:' + c.id), dentro.map(p => p.fontes.length ? det('fp:' + p.id, `Fontes de ${p.nome} · ${p.fontes.length}`, el('ul', { class: 'mf-fontes' }, p.fontes.map(f => el('li', {}, el('a', { href: f.url, target: '_blank', rel: 'noopener noreferrer' }, f.nome || f.url))))) : null));
    }
  } else if (sel && sel.tipo === 'jogada' && m.jogadas[sel.id]) {
    const j = m.jogadas[sel.id];
    detalhe = el('div', { class: 'mf-detalhe' },
      el('div', { class: 'mf-topo' }, el('span', { class: 'mf-tab' }, 'jogada'), el('span', { class: 'mf-mola' }), selo(j.confianca), fechar),
      el('h3', { class: 'mf-h' }, `${nomeP(j.de)} ${TIPOS3[j.tipo]}${j.para ? ' ' + nomeP(j.para) : ''}`),
      el('p', { class: 'mf-peq' }, `De ${nomeC(j.de_casa)} para ${nomeC(j.para_casa)}` + (j.peca ? `, com a peça ${nomePc(j.peca)}` : '') + '.'),
      el('p', {}, j.texto), fontesEl(j.fontes, 'j:' + sel.id));
  }
  // o dia de cada player
  const dias = el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, 'O dia de cada player'),
    m.players.map(p => {
      const suas = m.pecas.filter(x => x.dono === p.id), casasP = m.casas.filter(x => x.dono === p.id), js = m.jogadas.filter(j => j.de === p.id || j.para === p.id);
      return det('dia:' + p.id, [bola(p.id), ' ', el('b', {}, nomeP(p.id)), el('span', { class: 'mf3-ps mf3-s-' + p.saldo }, ' ' + SALDO3[p.saldo])],
        el('div', { class: 'mf3-dia' }, el('p', { class: 'mf-peq' }, PLAYERS[p.id][1] + '. Na lista: ' + PLAYERS[p.id][2] + '.'),
          p.dia ? el('p', { class: 'mf3-texto' }, p.dia) : el('p', { class: 'mf-peq' }, 'Sem movimento visível hoje.'),
          p.ganhos.length ? el('ul', { class: 'mf-lados' }, p.ganhos.map(x => el('li', { class: 'mf-l-ganha' }, el('b', {}, '▲ '), x.texto, x.confianca && x.confianca !== 'fato' ? el('small', {}, ` (${CONF[x.confianca]})`) : null))) : null,
          p.perdas.length ? el('ul', { class: 'mf-lados' }, p.perdas.map(x => el('li', { class: 'mf-l-perde' }, el('b', {}, '▼ '), x.texto, x.confianca && x.confianca !== 'fato' ? el('small', {}, ` (${CONF[x.confianca]})`) : null))) : null,
          suas.length || casasP.length ? el('p', { class: 'mf-peq' }, 'No tabuleiro: ' + [...suas.map(x => x.nome), ...casasP.map(x => x.nome)].join(', ') + '.') : null,
          js.length ? el('p', { class: 'mf-peq' }, 'Jogadas: ' + js.map(j => `${nomeP(j.de)} ${TIPOS3[j.tipo]}${j.para ? ' ' + nomeP(j.para) : ''}`).join('; ') + '.') : null,
          fontesEl(p.fontes, 'pd:' + p.id)));
    }));
  // o placar Trump e China
  let trump = null;
  if (m.trump) {
    const t = m.trump, hist = t.historico.length ? t.historico : [{ data: '', dia: t.dia, total: t.total }];
    const pende = t.total > 0.5 ? 'pende a favor da hipótese' : t.total < -0.5 ? 'pende contra a hipótese' : 'empatado';
    const desde_ = hist[0] && hist[0].data ? diaMes(hist[0].data) : '';
    trump = el('section', { class: 'mf-sec mf3-tc' }, el('h3', { class: 'mf-sub' }, 'Trump a serviço da China? O placar'),
      el('p', { class: 'mf-peq' }, 'Uma hipótese em teste, dentro do jogo. Cada movimento do governo Trump ganha um peso de 1 a 5 pelo impacto (1: fala sem efeito; 5: mudança estratégica). A favor soma, contra subtrai, e a confiança pesa junto: fato conta inteiro, provável 0,6, hipótese 0,3. A evidência direta (ordem, dinheiro, acordo escondido) vale em dobro e pede duas fontes.' + (desde_ ? ` O placar começou em ${desde_}, com os movimentos dos 30 dias anteriores.` : '')),
      el('div', { class: 'mf3-tc-placar' },
        el('div', {}, el('b', { class: 'mf3-n ' + (t.total >= 0 ? 'favor' : 'contra') }, num(t.total)), el('span', {}, 'no total' + (desde_ ? ', desde ' + desde_ : ''))),
        el('div', {}, el('b', { class: 'mf3-n ' + (t.dia >= 0 ? 'favor' : 'contra') }, num(t.dia)), el('span', {}, 'nesta rodada')),
        el('div', {}, el('b', { class: 'mf3-pende' }, pende))),
      hist.length > 1 ? deSvg(svgHistorico(hist)) : null,
      t.movimentos.length ? el('ul', { class: 'mf3-movs' }, t.movimentos.map(x => el('li', { class: 'mf3-mv-' + x.sentido },
        el('span', { class: 'mf3-pts' }, num(x.pontos)),
        el('div', {}, el('p', {}, el('b', {}, (x.sentido === 'favor' ? 'A favor · ' : 'Contra · ') + diaMes(x.data) + ' · '), x.texto),
          el('p', { class: 'mf-peq' }, el('span', { class: 'mf3-peso', 'aria-label': `peso ${x.peso} de 5` }, '●'.repeat(x.peso) + '○'.repeat(5 - x.peso)), ' ', x.porquePeso, x.tipo === 'evidencia-direta' ? ' · evidência direta' : ''),
          selo(x.confianca), fontesEl(x.fontes, 'tc:' + x.id))))) : el('p', { class: 'mf-peq' }, 'Nenhum movimento novo nesta rodada.'),
      t.leitura ? el('div', { class: 'mf-leitura' }, rot('A leitura do placar'), el('p', {}, t.leitura)) : null,
      el('p', { class: 'mf-peq' }, 'Um movimento que favorece a China não prova serviço: mostra quem ganha com o ato. Só a evidência direta toca a hipótese de frente.'));
  }
  // as hipóteses da lista
  const pl = m.placar && m.placar.hipoteses ? m.placar : null;
  const comPlacar = pl ? Object.keys(HIPOTESES).filter(h => pl.hipoteses[h]) : [];
  const semSinal = Object.keys(HIPOTESES).filter(h => !comPlacar.includes(h));
  const hipEl = el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, 'As hipóteses da lista, em teste'),
    el('p', { class: 'mf-peq' }, 'Cada rodada procura fatos que combinam (✓) ou não combinam (✗) com o que a lista afirma. Um sinal não é prova.'),
    m.sinais.length ? el('ul', { class: 'mf-sinais' }, m.sinais.map((h, k) => el('li', { class: 'mf-s-' + h.sinal },
      el('span', { class: 'mf-marca' }, h.sinal === 'contra' ? '✗' : '✓'),
      el('div', {}, el('p', { class: 'mf-hip' }, HIPOTESES[h.id][1]), el('p', {}, h.porque), selo(h.confianca), fontesEl(h.fontes, 'h:' + h.id + k))))) : el('p', { class: 'mf-peq' }, 'Nenhum sinal nesta rodada.'),
    pl ? det('placar', `O placar desde ${diaMes(pl.desde)} · ${pl.rodadas} ${pl.rodadas === 1 ? 'rodada' : 'rodadas'}`,
      comPlacar.length ? el('ul', { class: 'mf-placar' }, comPlacar.map(h => el('li', {}, el('span', { class: 'mf-conta-h' }, `✓ ${pl.hipoteses[h].favor} · ✗ ${pl.hipoteses[h].contra}`), ' ', HIPOTESES[h][1]))) : null,
      semSinal.length ? el('p', { class: 'mf-peq' }, `Ainda sem sinal (${semSinal.length}): ` + semSinal.map(h => HIPOTESES[h][1].replace(/\.$/, '')).join('; ') + '.') : null) : null);

  return [
    el('div', { class: 'mf-cab' }, el('h2', { id: 'mf-tit', class: 'mf-tit' }, 'O mapa de forças'),
      el('span', { class: 'mf-apagado-txt' }, 'a cama maior, as peças e as casas: como os 7 players se moveram hoje')),
    desde, analise, cama, desenho, legenda, detalhe, dias, trump, hipEl,
    el('p', { class: 'mf-pe' }, `Um jogo de hipóteses, um experimento lúdico levado a sério: os players são a cama maior, que decide o porquê; as peças são as pessoas que executam, o como; as casas são as instituições e os lugares onde o poder opera, o quando e o onde. Só os players ganham ou perdem. A ligação de uma peça ou casa a um player é a hipótese da lista; os fatos têm fonte. Exercício lúdico: nada aqui afirma a realidade.${m.por ? ' Feito por ' + m.por + '.' : ''}`),
  ];
}

function desenhar(o) {   // o = {edicao: {data, itens, mapa (já limpo)}, estado: {} guardado por quem chama, rolar(id), idCartao(item)}
  const m = o && o.edicao && o.edicao.mapa;
  if (!m) return null;
  const st = o.estado || {};
  st.abertos = st.abertos || [];
  const caixa = el('section', { class: 'mf-caixa', id: 'inf-mapa', 'aria-labelledby': 'mf-tit' });
  const pintar = () => caixa.replaceChildren(...(m.versao === 3 ? partes3 : partes)(o, m, st, pintar).filter(Boolean));
  pintar();
  return caixa;
}

window.MapaDeForcas = { PLAYERS, HIPOTESES, limpar, desenhar };
})();
