// A dualidade do INFO (pedido do Jean em 10/11/2026, à noite; Sistemas/INFO.md, "A dualidade"): um segundo quadro, como o mapa de forças,
// pela ótica de uma hipótese dele, como exercício especulativo e imaginativo levado a sério. Há uma transição de poder da elite antiga
// (o petróleo, a finança tradicional, o establishment de republicanos e democratas até 2016, Gates, Obama) para a nova elite (os donos das
// Big Techs, Peter Thiel, quem monta a tecnocracia), e Trump é um negociador mercenário, que acena ora para um lado, ora para o outro.
// O desenho: um cabo de guerra entre as duas elites (o nó é a transição somada) e Trump pendurado no meio, como um pêndulo (o lado para onde
// os acenos dele pesam). Os pontos saem do info.py dualidade, sempre iguais: + vai para a nova elite, - para a antiga.
// Um arquivo só, usado pelo aX2 (OS/modulos/info.js) e pelo app aberto (OS/info-app/app.js; o info.py app copia este arquivo para lá).
// O que vem do banco vira só texto, com limite de tamanho; link só http(s).
'use strict';
(() => {
const POLOS = {   // id: [o nome, quem a hipótese do Jean põe nele]
  antiga: ['Elite antiga', 'o petróleo e a finança tradicional, o establishment de republicanos e democratas até a eleição de Trump, Bill Gates, Obama'],
  nova: ['Nova elite', 'os donos das Big Techs, Peter Thiel e a rede dele, quem está montando a tecnocracia'],
  trump: ['Trump', 'o negociador mercenário: apoia quem der mais, acenando ora para um lado, ora para o outro'],
};
const HIP = {   // os mesmos ids do info.py (HIP_DUAL)
  'd-transicao': 'Há uma transição de poder: a elite antiga, do petróleo e da finança tradicional, perde lugar para a nova elite da Big Tech.',
  'd-elite-antiga': 'Os governos de republicanos e democratas até a eleição de Trump serviram à mesma elite antiga.',
  'd-mercenario': 'Trump é um negociador mercenário: apoia quem der mais, acenando ora para a elite antiga, ora para a nova.',
  'd-tecnocracia': 'A nova elite monta uma tecnocracia: poder de Estado exercido por plataformas, dados e IA.',
};
const CAMPOS = { energia: 'energia', dinheiro: 'dinheiro', politica: 'política', tecnologia: 'tecnologia', informacao: 'informação', territorio: 'território' };
const CORES = { antiga: '#D9A55B', nova: '#4FD1C5', trump: '#F2705F' };
const CONF = { fato: 'fato', provavel: 'provável', hipotese: 'hipótese' };

// ---------- ferramentas (as mesmas do mapa de forças, aqui dentro para o arquivo andar sozinho)
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
const lado = v => v === 'nova' ? 'nova' : 'antiga';
const diaMes = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : (d || '');
const num = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', ',');
const peso = p => Math.max(1, Math.min(5, Math.round(Number(p) || 1)));
const serie = s => s && typeof s === 'object' ? { dia: Number(s.dia) || 0, total: Number(s.total) || 0,
  historico: lista(s.historico).slice(-60).map(h => ({ data: str(h && h.data, 10), dia: Number(h && h.dia) || 0, total: Number(h && h.total) || 0 })).filter(h => h.data),
  antiga: Number(s.antiga) || 0, nova: Number(s.nova) || 0 } : { dia: 0, total: 0, historico: [], antiga: 0, nova: 0 };

function limpar(d) {
  if (!d || typeof d !== 'object') return null;
  const fontes = v => lista(v).slice(0, 3).map(f => ({ nome: str(f && f.nome, 200).trim(), url: url(f && f.url), data: str(f && f.data, 40) })).filter(f => f.url);
  const pol = d.polos && typeof d.polos === 'object' ? d.polos : {};
  const polos = Object.fromEntries(Object.keys(POLOS).map(k => [k, { dia: str(pol[k] && pol[k].dia, 800) }]));
  const pecas = lista(d.pecas).slice(0, 16).map(x => ({ id: slug(x && x.id), nome: str(x && x.nome, 40), polo: tem(POLOS, x && x.polo) ? x.polo : 'antiga',
    papel: str(x && x.papel, 160), fez: str(x && x.fez, 200), confianca: conf(x && x.confianca), fontes: fontes(x && x.fontes) })).filter(x => x.id && x.nome);
  const pids = new Set(pecas.map(x => x.id));
  const lances = lista(d.lances).slice(0, 12).map(x => ({ id: slug(x && x.id), data: str(x && x.data, 10), polo: lado(x && x.polo), rumo: lado(x && x.rumo),
    campo: tem(CAMPOS, x && x.campo) ? x.campo : 'politica', texto: str(x && x.texto, 240), peso: peso(x && x.peso), porquePeso: str(x && x.porquePeso, 200),
    confianca: conf(x && x.confianca), pontos: Number(x && x.pontos) || 0, peca: pids.has(x && x.peca) ? x.peca : '', fontes: fontes(x && x.fontes) })).filter(x => x.texto);
  const acenos = lista(d.acenos).slice(0, 8).map(x => ({ id: slug(x && x.id), data: str(x && x.data, 10), para: lado(x && x.para), texto: str(x && x.texto, 240),
    recebeu: str(x && x.recebeu, 200), peso: peso(x && x.peso), porquePeso: str(x && x.porquePeso, 200), confianca: conf(x && x.confianca),
    pontos: Number(x && x.pontos) || 0, fontes: fontes(x && x.fontes) })).filter(x => x.texto);
  const sinais = lista(d.sinais).slice(0, 4).map(h => ({ id: tem(HIP, h && h.id) ? h.id : '', sinal: h && h.sinal === 'contra' ? 'contra' : 'a-favor',
    porque: str(h && h.porque, 240), confianca: conf(h && h.confianca), fontes: fontes(h && h.fontes) })).filter(h => h.id);
  const pl = d.placar && typeof d.placar === 'object' ? d.placar : null;
  const placar = pl ? { desde: str(pl.desde, 10), rodadas: Number(pl.rodadas) || 0,
    hipoteses: Object.fromEntries(Object.entries(pl.hipoteses && typeof pl.hipoteses === 'object' ? pl.hipoteses : {}).filter(([k]) => tem(HIP, k))
      .map(([k, v]) => [k, { favor: Number(v && v.favor) || 0, contra: Number(v && v.contra) || 0 }])) } : null;
  return { versao: 1, polos, pecas, lances, acenos, sinais, transicao: serie(d.transicao), pendulo: serie(d.pendulo), placar,
    analise: str(d.analise, 2000), leitura: str(d.leitura, 600), por: str(d.por, 60) };
}

function svgCabo(d) {   // o cabo de guerra: a elite antiga puxa para a esquerda, a nova elite para a direita; Trump pende do meio
  const W = 360, H = 118, M = 46, Y = 82, R = Math.max(6, Math.ceil(Math.max(Math.abs(d.transicao.total), Math.abs(d.pendulo.total)) * 1.25));
  const x = v => W / 2 + Math.max(-1, Math.min(1, v / R)) * (W / 2 - M);
  const xt = x(d.transicao.total), xp = x(d.pendulo.total), f1 = v => v.toFixed(1);
  const marcas = [-R, -R / 2, 0, R / 2, R].map(v => `<line class="du-marca" x1="${f1(x(v))}" y1="${Y - 4}" x2="${f1(x(v))}" y2="${Y + 4}"/>`).join('');
  return `<svg class="du-cabo" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`O cabo de guerra: a transição está em ${num(d.transicao.total)} e o pêndulo de Trump em ${num(d.pendulo.total)}; positivo é para a nova elite`)}">`
    + `<text class="du-ponta" x="2" y="${Y + 26}" fill="${CORES.antiga}">ELITE ANTIGA</text><text class="du-ponta" x="${W - 2}" y="${Y + 26}" text-anchor="end" fill="${CORES.nova}">NOVA ELITE</text>`
    + `<line class="du-corda" x1="${M - 30}" y1="${Y}" x2="${W - M + 30}" y2="${Y}" style="stroke:url(#du-grad)"/>${marcas}`
    + `<defs><linearGradient id="du-grad" gradientUnits="userSpaceOnUse" x1="${M - 30}" x2="${W - M + 30}" y1="${Y}" y2="${Y}"><stop offset="0" stop-color="${CORES.antiga}"/><stop offset="1" stop-color="${CORES.nova}"/></linearGradient></defs>`
    + `<line class="du-meio" x1="${W / 2}" y1="${Y - 14}" x2="${W / 2}" y2="${Y + 14}"/>`
    + `<circle class="du-no" cx="${f1(xt)}" cy="${Y}" r="8"/><text class="du-rot" x="${f1(xt)}" y="${Y - 14}" text-anchor="middle">transição ${esc(num(d.transicao.total))}</text>`
    + `<line class="du-fio" x1="${W / 2}" y1="6" x2="${f1(xp)}" y2="44"/><circle class="du-pendulo" cx="${f1(xp)}" cy="50" r="9" fill="${CORES.trump}"/>`
    + `<text class="du-rot" x="${f1(xp)}" y="${xp > W / 2 ? 54 : 54}" dx="${xp >= W / 2 ? 14 : -14}" text-anchor="${xp >= W / 2 ? 'start' : 'end'}">Trump ${esc(num(d.pendulo.total))}</text>`
    + `<circle class="du-gancho" cx="${W / 2}" cy="6" r="3"/></svg>`;
}

function svgHist(d) {   // as duas linhas no tempo: a transição (o nó) e o pêndulo (Trump); só a partir de 2 rodadas
  const t = d.transicao.historico, p = d.pendulo.historico;
  const dias = [...new Set([...t, ...p].map(h => h.data))].sort();
  if (dias.length < 2) return '';
  const W = 360, H = 70, M = 6, vals = [...t, ...p].map(h => Math.abs(h.total)), max = Math.max(1, ...vals);
  const xx = i => M + i * (W - 2 * M) / (dias.length - 1), yy = v => H / 2 - v / max * (H / 2 - 6);
  const linha = (hs, cls) => `<polyline class="${cls}" points="${hs.map(h => `${xx(dias.indexOf(h.data)).toFixed(1)},${yy(h.total).toFixed(1)}`).join(' ')}"/>`;
  return `<svg class="du-hist" viewBox="0 0 ${W} ${H}" role="img" aria-label="A transição e o pêndulo de Trump, rodada a rodada"><line class="mf3-zero" x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}"/>`
    + linha(t, 'du-l-transicao') + linha(p, 'du-l-pendulo') + '</svg>';
}

function partes(d, st, pintar) {
  const muda = f => { f(); pintar(); };
  const det = (k, sum, ...corpo) => {
    const x = el('details', { class: 'mf-det' }, el('summary', {}, sum), ...corpo);
    if (st.abertos.includes(k)) x.open = true;
    x.addEventListener('toggle', () => { st.abertos = st.abertos.filter(y => y !== k); if (x.open) st.abertos.push(k); });
    return x;
  };
  const fontesEl = (fs, k) => fs.length ? det('f:' + k, `Fontes · ${fs.length}`, el('ul', { class: 'mf-fontes' }, fs.map(f =>
    el('li', {}, el('a', { href: f.url, target: '_blank', rel: 'noopener noreferrer' }, f.nome || f.url), f.data ? el('small', {}, ' · ' + f.data) : null)))) : null;
  const selo = c => c ? el('span', { class: 'mf-selo mf-c-' + c }, CONF[c]) : null;
  const rot = t => el('p', { class: 'mf-rot' }, t);
  const bola = id => el('span', { class: 'mf3-bola', style: `background:${CORES[id]}`, 'aria-hidden': 'true' });
  const pesoEl = x => el('span', { class: 'mf3-peso', role: 'img', 'aria-label': `peso ${x.peso} de 5` }, '●'.repeat(x.peso) + '○'.repeat(5 - x.peso));
  const rumo = v => el('span', { class: 'du-rumo du-r-' + v, title: v === 'nova' ? 'vai para a nova elite' : 'vai para a elite antiga' }, v === 'nova' ? 'para a nova ▶' : '◀ para a antiga');
  const t = d.transicao, p = d.pendulo;
  const pende = v => v > 0.5 ? 'pende para a nova elite' : v < -0.5 ? 'pende para a elite antiga' : 'no meio';
  const desde = d.placar && d.placar.desde ? diaMes(d.placar.desde) : (t.historico[0] && t.historico[0].data ? diaMes(t.historico[0].data) : '');

  const placar = el('div', { class: 'mf3-tc-placar du-placar' },
    el('div', {}, el('b', { class: 'mf3-n du-n ' + (t.total >= 0 ? 'nova' : 'antiga') }, num(t.total)), el('span', {}, `a transição no total${desde ? ', desde ' + desde : ''} (${num(t.dia)} nesta rodada): ${pende(t.total)}`)),
    el('div', {}, el('b', { class: 'mf3-n du-n ' + (p.total >= 0 ? 'nova' : 'antiga') }, num(p.total)), el('span', {}, `o pêndulo de Trump (${num(p.dia)} nesta rodada): ${pende(p.total)}`)),
    el('div', {}, el('b', { class: 'mf3-pende' }, `${p.antiga} ${p.antiga === 1 ? 'aceno' : 'acenos'} para a antiga, ${p.nova} para a nova`), el('span', {}, 'desde o começo')));
  const longa = d.analise.length > 700, toda = !!st.analiseToda;
  const analise = d.analise ? el('section', { class: 'mf3-analise' }, rot('A análise do dia, pela dualidade'),
    el('p', { class: 'mf3-texto' + (longa && !toda ? ' curta' : '') }, d.analise),
    longa ? el('button', { type: 'button', class: 'mf-link', onclick: () => muda(() => { st.analiseToda = !toda; }) }, toda ? 'ler menos' : 'ler a análise inteira') : null) : null;
  const polos = el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, 'Os dois polos e Trump', el('small', {}, 'quem a hipótese põe em cada um, e o dia deles')),
    el('div', { class: 'du-polos' }, ['antiga', 'trump', 'nova'].map(k => {
      const ps = d.pecas.filter(x => x.polo === k);
      return el('div', { class: 'du-polo du-p-' + k },
        el('p', { class: 'du-pn' }, bola(k), ' ', POLOS[k][0]), el('p', { class: 'mf-peq' }, POLOS[k][1] + '.'),
        d.polos[k].dia ? el('p', { class: 'du-dia' }, d.polos[k].dia) : el('p', { class: 'mf-peq' }, 'Sem movimento visível nesta rodada.'),
        ps.length ? det('pc:' + k, `As peças · ${ps.length}`, el('ul', { class: 'mf-suas' }, ps.map(x => el('li', {},
          el('b', {}, x.nome), ': ', x.fez, ' ', selo(x.confianca), el('p', { class: 'mf-peq' }, x.papel), fontesEl(x.fontes, 'p:' + x.id))))) : null);
    })));
  const lances = el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, 'Os lances da transição', el('small', {}, 'quem jogou, onde, e para que lado empurrou')),
    d.lances.length ? el('ul', { class: 'mf3-movs du-lances' }, d.lances.map(x => el('li', { class: 'du-mv-' + x.rumo },
      el('span', { class: 'mf3-pts' }, num(x.pontos)),
      el('div', {}, el('p', {}, el('b', {}, `${POLOS[x.polo][0]} · ${CAMPOS[x.campo]} · ${diaMes(x.data)} · `), x.texto),
        el('p', { class: 'mf-peq' }, rumo(x.rumo), ' ', pesoEl(x), ' ', x.porquePeso),
        selo(x.confianca), fontesEl(x.fontes, 'l:' + x.id))))) : el('p', { class: 'mf-peq' }, 'Nenhum lance novo nesta rodada.'));
  const acenos = el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, 'Os acenos de Trump', el('small', {}, 'para que lado, e o que ele levou')),
    d.acenos.length ? el('ul', { class: 'mf3-movs du-acenos' }, d.acenos.map(x => el('li', { class: 'du-mv-' + x.para },
      el('span', { class: 'mf3-pts' }, num(x.pontos)),
      el('div', {}, el('p', {}, el('b', {}, `${x.para === 'nova' ? 'Para a nova elite' : 'Para a elite antiga'} · ${diaMes(x.data)} · `), x.texto),
        x.recebeu ? el('p', { class: 'du-recebeu' }, el('b', {}, 'O que levou: '), x.recebeu) : null,
        el('p', { class: 'mf-peq' }, pesoEl(x), ' ', x.porquePeso), selo(x.confianca), fontesEl(x.fontes, 'a:' + x.id))))) : el('p', { class: 'mf-peq' }, 'Nenhum aceno novo nesta rodada.'));
  const pl = d.placar && d.placar.hipoteses ? d.placar : null;
  const hip = el('section', { class: 'mf-sec' }, el('h3', { class: 'mf-sub' }, 'As hipóteses da dualidade, em teste'),
    d.sinais.length ? el('ul', { class: 'mf-sinais' }, d.sinais.map((h, k) => el('li', { class: 'mf-s-' + h.sinal },
      el('span', { class: 'mf-marca' }, h.sinal === 'contra' ? '✗' : '✓'),
      el('div', {}, el('p', { class: 'mf-hip' }, HIP[h.id]), el('p', {}, h.porque), selo(h.confianca), fontesEl(h.fontes, 'h:' + h.id + k))))) : el('p', { class: 'mf-peq' }, 'Nenhum sinal nesta rodada.'),
    pl ? det('placar', `O placar desde ${diaMes(pl.desde)} · ${pl.rodadas} ${pl.rodadas === 1 ? 'rodada' : 'rodadas'}`,
      el('ul', { class: 'mf-placar' }, Object.keys(HIP).map(h => el('li', {}, el('span', { class: 'mf-conta-h' }, `✓ ${(pl.hipoteses[h] || {}).favor || 0} · ✗ ${(pl.hipoteses[h] || {}).contra || 0}`), ' ', HIP[h])))) : null);
  const hist = svgHist(d);
  return [
    el('div', { class: 'mf-cab' }, el('h2', { id: 'du-tit', class: 'mf-tit' }, 'A dualidade'),
      el('span', { class: 'mf-apagado-txt' }, 'elite antiga x nova elite, e Trump no meio: um exercício especulativo')),
    deSvg(svgCabo(d)),
    el('p', { class: 'mf-peq' }, 'Cada lance ganha um peso de 1 a 5 pelo impacto. O que vai para a nova elite soma, o que vai para a antiga subtrai, e a confiança pesa junto (fato inteiro, provável 0,6, hipótese 0,3). O nó do cabo é a transição somada; Trump pende para o lado dos acenos dele.'),
    placar,
    hist ? [deSvg(hist), el('p', { class: 'mf-peq du-hist-leg' }, el('span', { class: 'du-leg-t' }, '▬ a transição'), ' · ', el('span', { class: 'du-leg-p' }, '▬ o pêndulo de Trump'), ', rodada a rodada')] : null,
    analise, polos, lances, acenos,
    d.leitura ? el('div', { class: 'mf-leitura' }, rot('A leitura'), el('p', {}, d.leitura)) : null,
    hip,
    el('p', { class: 'mf-pe' }, `Um exercício especulativo e imaginativo, pedido pelo Jean e levado a sério: a dualidade é uma hipótese em teste, e o INFO procura fatos nos dois sentidos com o mesmo cuidado. Pôr uma pessoa ou empresa num polo é hipótese; os fatos têm fonte; um aceno não prova troca. Nada aqui afirma a realidade.${d.por ? ' Feito por ' + d.por + '.' : ''}`),
  ];
}

function desenhar(o) {   // o = {dualidade (já limpa), estado: {} guardado por quem chama}
  const d = o && o.dualidade;
  if (!d) return null;
  const st = o.estado || {};
  st.abertos = st.abertos || [];
  const caixa = el('section', { class: 'mf-caixa du-caixa', id: 'inf-dualidade', 'aria-labelledby': 'du-tit' });
  const pintar = () => caixa.replaceChildren(...partes(d, st, pintar).flat().filter(Boolean));
  pintar();
  return caixa;
}

window.Dualidade = { POLOS, HIP, limpar, desenhar };
})();
