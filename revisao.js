// A semana e o mês do INFO (pedido do Jean em 10/11/2026; Sistemas/INFO.md, "A semana e o mês"): o primeiro INFO da semana traz também a
// análise geral da semana que passou, e o primeiro do mês traz a da semana e a do mês. Tudo sai das edições guardadas, sem busca nova: a conta
// (o jogo dia a dia, o placar Trump e China, a dualidade, as hipóteses) vem do info.py; o texto, do Opus, conferido pelo Sonnet.
// Um arquivo só, usado pelo aX2 (OS/modulos/info.js) e pelo app aberto (OS/info-app/app.js; o info.py app copia este arquivo para lá).
// O que vem do banco vira só texto, com limite de tamanho.
'use strict';
(() => {
const TABS = { geopolitica: 'Geopolítica', maquinas: 'Máquinas', bola: 'Bola', exopolitica: 'Exopolítica', ufologia: 'Ufologia', capao: 'Capão' };
const SALDO = { ganha: 'ganha', perde: 'perde', disputa: 'em disputa', parado: 'parado' };
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
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
const str = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
const lista = v => Array.isArray(v) ? v : [];
const tem = (o, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
const ehDia = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
const diaMes = d => ehDia(d) ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : (d || '');
const num = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', ',');
const nomeP = id => (window.MapaDeForcas && MapaDeForcas.PLAYERS[id] ? MapaDeForcas.PLAYERS[id][0] : id);
const textoHip = id => (window.MapaDeForcas && MapaDeForcas.HIPOTESES[id] ? MapaDeForcas.HIPOTESES[id][1] : window.Dualidade && Dualidade.HIP[id] ? Dualidade.HIP[id] : id);
const serie = s => s && typeof s === 'object' ? { inicio: Number(s.inicio) || 0, fim: Number(s.fim) || 0, variacao: Number(s.variacao) || 0,
  dias: lista(s.dias).slice(0, 40).map(x => ({ data: str(x && x.data, 10), dia: Number(x && x.dia) || 0, total: Number(x && x.total) || 0 })).filter(x => ehDia(x.data)) } : null;

function limpar(r) {
  if (!r || typeof r !== 'object' || !['semana', 'mes'].includes(r.tipo)) return null;
  const jogo = r.jogo && typeof r.jogo === 'object' ? { dias: lista(r.jogo.dias).filter(ehDia).slice(0, 40),
    players: lista(r.jogo.players).slice(0, 7).map(p => ({ id: str(p && p.id, 40), saldos: lista(p && p.saldos).slice(0, 40).map(s => tem(SALDO, s) ? s : 'parado') })) } : null;
  const tc = serie(r.trumpChina), du = r.dualidade && typeof r.dualidade === 'object' ? r.dualidade : {};
  return { tipo: r.tipo, data: ehDia(r.data) ? r.data : '', de: ehDia(r.de) ? r.de : '', ate: ehDia(r.ate) ? r.ate : '', numero: Number(r.numero) || 0,
    titulo: str(r.titulo, 200), abertura: str(r.abertura, 1500), analise: str(r.analise, 4000), bola: str(r.bola, 1200), capao: str(r.capao, 1200),
    destaques: lista(r.destaques).slice(0, 12).map(x => ({ edicao: ehDia(x && x.edicao) ? x.edicao : '', id: str(x && x.id, 90), tabuleiro: str(x && x.tabuleiro, 30),
      manchete: str(x && x.manchete, 240), porque: str(x && x.porque, 300) })).filter(x => x.manchete),
    players: lista(r.players).slice(0, 7).map(p => ({ id: str(p && p.id, 40), resumo: str(p && p.resumo, 400) })).filter(p => p.resumo),
    jogo, trumpChina: tc ? { ...tc, leitura: str(r.trumpChina.leitura, 600) } : null,
    dualidade: du.transicao || du.pendulo ? { transicao: serie(du.transicao), pendulo: serie(du.pendulo), leitura: str(du.leitura, 600) } : null,
    hipoteses: Object.entries(r.hipoteses && typeof r.hipoteses === 'object' ? r.hipoteses : {}).slice(0, 19).map(([k, v]) => ({ id: str(k, 40), favor: Number(v && v.favor) || 0, contra: Number(v && v.contra) || 0 })),
    contagem: r.contagem && typeof r.contagem === 'object' ? { edicoes: Number(r.contagem.edicoes) || 0, noticias: Number(r.contagem.noticias) || 0,
      porTabuleiro: Object.entries(r.contagem.porTabuleiro || {}).filter(([k]) => tem(TABS, k)).map(([k, v]) => [k, Number(v) || 0]) } : null,
    vigiar: lista(r.vigiar).slice(0, 6).map(x => str(x, 200)).filter(Boolean) };
}

function periodo(r) {
  if (r.tipo === 'mes' && r.de) return `${MESES[Number(r.de.slice(5, 7)) - 1]} de ${r.de.slice(0, 4)}`;
  return `de ${diaMes(r.de)} a ${diaMes(r.ate)}/${r.ate.slice(0, 4)}`;
}

function svgBarras(dias) {   // o saldo de cada dia do placar no período, com a linha do total
  if (!dias.length) return '';
  const W = 360, H = 60, M = 4, max = Math.max(1, ...dias.map(x => Math.abs(x.dia)), ...dias.map(x => Math.abs(x.total)));
  const bw = Math.min(26, (W - 2 * M) / dias.length - 4), meio = H / 2, e = v => v / max * (H / 2 - 6);
  const xs = dias.map((x, i) => M + i * ((W - 2 * M) / dias.length) + bw / 2 + 2);
  return `<svg class="mf3-hist" viewBox="0 0 ${W} ${H}" role="img" aria-label="O placar dia a dia no período"><line class="mf3-zero" x1="0" y1="${meio}" x2="${W}" y2="${meio}"/>`
    + dias.map((x, i) => { const v = e(x.dia); return `<rect class="mf3-barra ${x.dia >= 0 ? 'favor' : 'contra'}" x="${(xs[i] - bw / 2).toFixed(1)}" y="${(v >= 0 ? meio - v : meio).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(v)).toFixed(1)}" rx="2"/>`; }).join('')
    + (dias.length > 1 ? `<polyline class="mf3-linha" points="${dias.map((x, i) => `${xs[i].toFixed(1)},${(meio - e(x.total)).toFixed(1)}`).join(' ')}"/>` : '') + '</svg>';
}

function desenhar(o) {   // o = {revisao (já limpa), link(edicao, id): o endereço do cartão daquela notícia}
  const r = o && o.revisao;
  if (!r) return null;
  const rot = t => el('p', { class: 'mf-rot' }, t);
  const sec = (tit, ...corpo) => el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, tit), ...corpo);
  const texto = t => el('p', { class: 'mf3-texto' }, t);
  const nome = r.tipo === 'mes' ? 'O mês' : 'A semana';
  const temJogo = !!(r.jogo && r.jogo.dias.length);   // a tabela só existe quando o período teve mapa de forças (desde 10/11/2026); o resumo de cada player, sempre
  const jogo = temJogo || r.players.length ? sec(temJogo ? 'O jogo no período' : 'Os players no período',
    temJogo ? [el('p', { class: 'mf-peq' }, 'O saldo de cada player, dia a dia, no mapa de forças: verde ganha, vermelho perde, azul em disputa, cinza parado.'),
      el('div', { class: 'rv-tabela', role: 'table', 'aria-label': 'O saldo de cada player, dia a dia' },
        el('div', { class: 'rv-linha rv-cab', role: 'row' }, el('span', { role: 'columnheader' }, 'player'), r.jogo.dias.map(d => el('span', { role: 'columnheader', class: 'rv-d' }, diaMes(d)))),
        r.jogo.players.map(p => el('div', { class: 'rv-linha', role: 'row' }, el('span', { role: 'rowheader', class: 'rv-p' }, nomeP(p.id)),
          p.saldos.map((s, k) => el('span', { role: 'cell', class: 'rv-c rv-' + s, title: `${diaMes(r.jogo.dias[k])}: ${SALDO[s]}` }, el('span', { class: 'rv-sr' }, SALDO[s]))))))]
      : el('p', { class: 'mf-peq' }, 'O período é de antes do mapa de forças (que começou em 10/11/2026): o resumo de cada player sai das notícias, e a ligação a um player é hipótese.'),
    r.players.length ? el('ul', { class: 'mf-suas rv-resumos' }, r.players.map(p => el('li', {}, el('b', {}, nomeP(p.id) + ': '), p.resumo))) : null) : null;
  const tc = r.trumpChina ? sec('Trump a serviço da China? O placar no período',
    el('p', { class: 'mf-peq' }, `Começou o período em ${num(r.trumpChina.inicio)} e terminou em ${num(r.trumpChina.fim)}: ${num(r.trumpChina.variacao)} no período (positivo pende a favor da hipótese).`),
    r.trumpChina.dias.length ? deSvg(svgBarras(r.trumpChina.dias)) : null, r.trumpChina.leitura ? el('div', { class: 'mf-leitura' }, el('p', {}, r.trumpChina.leitura)) : null) : null;
  const du = r.dualidade ? sec('A dualidade no período',
    r.dualidade.transicao ? el('p', { class: 'mf-peq' }, `A transição foi de ${num(r.dualidade.transicao.inicio)} a ${num(r.dualidade.transicao.fim)} (${num(r.dualidade.transicao.variacao)}; positivo vai para a nova elite).`) : null,
    r.dualidade.pendulo ? el('p', { class: 'mf-peq' }, `O pêndulo de Trump foi de ${num(r.dualidade.pendulo.inicio)} a ${num(r.dualidade.pendulo.fim)} (${num(r.dualidade.pendulo.variacao)}).`) : null,
    r.dualidade.leitura ? el('div', { class: 'mf-leitura' }, el('p', {}, r.dualidade.leitura)) : null) : null;
  const hip = r.hipoteses.length ? sec('As hipóteses no período', el('ul', { class: 'mf-placar' }, r.hipoteses.map(h => el('li', {}, el('span', { class: 'mf-conta-h' }, `✓ ${h.favor} · ✗ ${h.contra}`), ' ', textoHip(h.id))))) : null;
  return el('section', { class: 'mf-caixa rv-caixa', id: 'inf-revisao-' + r.tipo, 'aria-labelledby': 'rv-tit-' + r.tipo },
    el('div', { class: 'mf-cab' }, el('h2', { id: 'rv-tit-' + r.tipo, class: 'mf-tit' }, nome + ', ' + periodo(r)),
      r.contagem ? el('span', { class: 'mf-apagado-txt' }, `${r.contagem.edicoes} edições, ${r.contagem.noticias} notícias: ` + r.contagem.porTabuleiro.map(([k, v]) => `${TABS[k]} ${v}`).join(', ')) : null),
    r.titulo ? el('h3', { class: 'rv-titulo' }, r.titulo) : null,
    r.abertura ? texto(r.abertura) : null,
    r.analise ? el('section', { class: 'mf3-analise' }, rot('A análise geral'), texto(r.analise)) : null,
    r.destaques.length ? sec('Os destaques', el('ol', { class: 'rv-destaques' }, r.destaques.map(x => el('li', {},
      el('p', {}, el('span', { class: 'mf-tab' }, (TABS[x.tabuleiro] || x.tabuleiro) + ' · ' + diaMes(x.edicao)), ' ',
        o.link && x.edicao ? el('a', { href: o.link(x.edicao, x.id), class: 'rv-man' }, x.manchete) : el('b', {}, x.manchete)),
      x.porque ? el('p', { class: 'mf-peq' }, x.porque) : null)))) : null,
    jogo, tc, du, hip,
    r.bola ? sec('A Bola no período', texto(r.bola)) : null,
    r.capao ? sec('O Capão no período', texto(r.capao)) : null,
    r.vigiar.length ? sec('O que vigiar', el('ul', { class: 'mf-lados' }, r.vigiar.map(v => el('li', {}, '→ ', v)))) : null,
    el('p', { class: 'mf-pe' }, `Feita a partir das edições do período, sem busca nova: os números saem da conta do INFO, e o texto foi conferido contra as edições. Exercício lúdico: nada aqui afirma a realidade.`));
}

window.Revisao = { limpar, desenhar, periodo };
})();
