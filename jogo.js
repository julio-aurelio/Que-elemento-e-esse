const TEMPO = 60;
const TUTORIAL_EL = ELEMENTOS[5]; // carbono: poucas camadas, fácil de contar

const PASSOS = [
    { titulo: 'Que elemento é esse?', texto: 'Oi, eu sou a <b>Arly</b>! Sabe o "Quem é esse Pokémon"? Aqui é igual, só que com os <b>elementos da tabela periódica</b>. Vou te mostrar como funciona.' },
    { titulo: 'O modelo de Bohr', foco: '#modelo', texto: 'No meio fica o <b>núcleo</b>. Cada anel é uma <b>camada</b> (K, L, M, N) e cada bolinha girando é um <b>elétron</b>. Conte os elétrons: o total é o <b>número atômico</b>!' },
    { titulo: 'As pistas', foco: '#pistas', texto: 'No <b>Nível 1</b> você ganha todas as pistas: o <b>símbolo</b>, os elétrons por camada e o número de <b>prótons, nêutrons e elétrons</b>.' },
    { titulo: 'Responda!', foco: '#opcoes', pronto: () => estado.respondeu, texto: 'Agora <b>clique no nome</b> do elemento. Dica: o símbolo é <b>C</b> e ele tem 6 elétrons.' },
    { titulo: 'Tempo e pontos', foco: '#placar', confete: true, texto: 'Você tem <b>60 segundos</b> para acertar o máximo que puder. Cada nível dá menos pistas, mas vale mais pontos: <b>+5/−3</b>, <b>+8/−2</b> e <b>+10/−1</b>. Divirta-se!' },
];

// ===== ESTADO / UTIL =====
const $ = id => document.getElementById(id);
const icones = () => window.lucide?.createIcons();
const estado = { modo: 'niveis', passo: 0, nivel: 0, el: null, pontos: 0, acertos: 0, erros: 0, tempo: TEMPO, respondeu: false, relogio: null };
const ler = k => { try { return JSON.parse(localStorage.getItem(k)) ?? {}; } catch { return {}; } };
const salvar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const sortear = lista => lista[Math.floor(Math.random() * lista.length)];
const embaralhar = lista => lista.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(p => p[1]);

function confete() {
    for (let i = 0; i < 70; i++) {
        const c = document.createElement('div');
        c.className = 'confete';
        c.style.cssText = `left:${Math.random() * 100}vw;background:hsl(${Math.random() * 360},90%,60%);animation-duration:${1.5 + Math.random() * 2}s`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4000);
    }
}

// ===== PUBCHEM: dados reais da tabela periódica (se falhar, o jogo usa os dados locais) =====
const GRUPO_PT = { 'Nonmetal': 'Não metal', 'Noble gas': 'Gás nobre', 'Alkali metal': 'Metal alcalino', 'Alkaline earth metal': 'Metal alcalino-terroso',
    'Metalloid': 'Semimetal', 'Halogen': 'Halogênio', 'Post-transition metal': 'Metal representativo', 'Transition metal': 'Metal de transição' };
const ESTADO_PT = { Gas: 'Gasoso', Solid: 'Sólido', Liquid: 'Líquido' };
fetch('https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON')
    .then(r => r.json())
    .then(({ Table }) => {
        const col = Object.fromEntries(Table.Columns.Column.map((c, i) => [c, i]));
        for (const { Cell } of Table.Row) {
            const e = ELEMENTOS[+Cell[col.AtomicNumber] - 1];
            if (!e) continue;
            e.neutrons = Math.round(+Cell[col.AtomicMass]) - e.z;
            e.pubchem = { massa: (+Cell[col.AtomicMass]).toFixed(3), config: Cell[col.ElectronConfiguration],
                grupo: GRUPO_PT[Cell[col.GroupBlock]] ?? Cell[col.GroupBlock], estado: ESTADO_PT[Cell[col.StandardState]] ?? Cell[col.StandardState],
                ano: Cell[col.YearDiscovered] === 'Ancient' ? 'Antiguidade' : Cell[col.YearDiscovered] };
        }
    })
    .catch(() => console.warn('PubChem indisponível: usando dados locais'));

function cartaoPubchem(el) {
    const p = el.pubchem;
    if (!p) return '';
    const linha = (rotulo, valor) => `<div class="flex justify-between gap-2"><span class="text-gray-500">${rotulo}</span><span class="font-mono font-semibold text-blue-700 text-right">${valor}</span></div>`;
    return `<div class="pop mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm space-y-1">
        <h3 class="font-bold text-blue-700 mb-1"><i data-lucide="database"></i> ${el.nome} na PubChem</h3>
        ${linha('Massa atômica', p.massa + ' u')}${linha('Grupo', p.grupo)}${linha('Estado (25 °C)', p.estado)}
        ${linha('Configuração', p.config)}${linha('Descoberta', p.ano)}
    </div>`;
}

// ===== MODELO DE BOHR (SVG) =====
function desenharBohr(el, mostrarSimbolo) {
    const aneis = el.camadas.map((n, c) => {
        const r = 62 + c * 34;
        const eletrons = Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2;
            return `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="6" fill="#facc15" stroke="#fef08a" stroke-width="1.5"/>`;
        }).join('');
        return `<circle r="${r}" fill="none" stroke="#a78bfa" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="4 5"/>
            <text y="${-r - 9}" text-anchor="middle" font-size="11" fill="#c4b5fd" font-family="Fira Code">${'KLMN'[c]} · ${n}e⁻</text>
            <g class="orbita" style="animation-duration:${8 + c * 5}s">${eletrons}</g>`;
    }).join('');
    $('bohr').innerHTML = `
        <defs><radialGradient id="nucleo"><stop offset="0" stop-color="#c084fc"/><stop offset="1" stop-color="#6d28d9"/></radialGradient></defs>
        ${aneis}
        <circle r="40" fill="url(#nucleo)" stroke="#e9d5ff" stroke-width="2"/>
        <text y="-9" text-anchor="middle" dominant-baseline="central" font-size="24" font-weight="700" fill="#fff" font-family="Space Grotesk">${mostrarSimbolo ? el.simbolo : '?'}</text>
        <text y="12" text-anchor="middle" font-size="10" fill="#f5d0fe" font-family="Fira Code">${el.protons}p⁺</text>
        <text y="24" text-anchor="middle" font-size="10" fill="#f5d0fe" font-family="Fira Code">${el.neutrons}n</text>`;
}

// ===== RODADA =====
// cores e formas das alternativas no estilo Kahoot
const KAHOOT = [{ cor: 'k-vermelho', icone: 'triangle' }, { cor: 'k-azul', icone: 'diamond' }, { cor: 'k-amarelo', icone: 'circle' }, { cor: 'k-verde', icone: 'square' }];

function placar() {
    const N = NIVEIS[estado.nivel], tut = estado.modo === 'tutorial';
    $('placar').innerHTML = `
        <span class="font-game px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm"><i data-lucide="${tut ? 'book-open' : N.icone}"></i> ${tut ? 'Tutorial' : N.nome}</span>
        <span class="text-xs text-gray-500 font-mono">+${N.acerto} / −${N.erro}</span>
        <span class="ml-auto font-mono font-bold text-lg px-3 py-1 rounded-xl ${estado.tempo <= 10 ? 'bg-red-100 text-red-600' : 'bg-purple-50 text-purple-700'}"><i data-lucide="timer"></i> ${estado.tempo}s</span>
        <span class="font-mono font-bold text-lg px-3 py-1 rounded-xl bg-yellow-50 text-yellow-700"><i data-lucide="star"></i> ${estado.pontos}</span>`;
    icones();
}

function novaRodada(el) {
    if (!el) do el = sortear(ELEMENTOS); while (el === estado.el);
    const N = NIVEIS[estado.nivel];
    Object.assign(estado, { el, respondeu: false });
    desenharBohr(el, N.simbolo);
    $('revelar').innerHTML = '';
    const pista = (icone, rotulo, valor) => `
        <div class="flex items-center justify-between bg-purple-50 rounded-xl px-3 py-2">
            <span class="text-sm text-gray-600"><i data-lucide="${icone}" class="text-purple-500"></i> ${rotulo}</span>
            <span class="font-mono font-bold text-purple-700">${valor}</span>
        </div>`;
    $('pistas').innerHTML = `
        <h3 class="font-bold text-purple-700 mb-2"><i data-lucide="search"></i> Pistas</h3>
        <div class="space-y-1.5">
            ${N.simbolo ? pista('type', 'Símbolo', el.simbolo) : ''}
            ${N.dados ? pista('layers', 'Camadas', el.camadas.join(' · ')) : ''}
            ${N.dados || N.particulas ? pista('plus', 'Prótons', el.protons)
                + pista('circle', 'Nêutrons', el.neutrons) + pista('minus', 'Elétrons', el.eletrons) : ''}
        </div>`;
    const outros = embaralhar(ELEMENTOS.filter(e => e !== el)).slice(0, 3);
    $('opcoes').innerHTML = embaralhar([el, ...outros]).map((e, i) => `
        <button data-acao="responder" data-z="${e.z}" class="opcao ${KAHOOT[i].cor} text-white px-3 md:px-4 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg text-left flex items-center gap-2 transition hover:brightness-110">
            <i data-lucide="${KAHOOT[i].icone}" class="shrink-0"></i><span class="truncate">${e.nome}</span></button>`).join('');
    placar();
}

function responder(btn) {
    if (estado.respondeu) return;
    estado.respondeu = true;
    const N = NIVEIS[estado.nivel], certo = +btn.dataset.z === estado.el.z;
    if (estado.modo === 'jogo') {
        if (certo) { estado.pontos += N.acerto; estado.acertos++; } else { estado.pontos = Math.max(0, estado.pontos - N.erro); estado.erros++; }
    }
    document.querySelectorAll('#opcoes button').forEach(b => {
        b.disabled = true;
        if (+b.dataset.z === estado.el.z) b.classList.add('certa');
        else b.classList.add(b === btn ? 'errada' : 'apagada');
    });
    if (!certo) btn.classList.add('tremer');
    desenharBohr(estado.el, true);
    $('pistas').insertAdjacentHTML('beforeend', cartaoPubchem(estado.el));
    $('revelar').innerHTML = `<span class="pop inline-block font-game text-2xl md:text-3xl font-bold px-5 py-2 rounded-2xl ${certo ? 'bg-green-500' : 'bg-red-500'} text-white shadow-xl">
        <i data-lucide="${certo ? 'circle-check' : 'circle-x'}"></i> É o ${estado.el.nome}! ${estado.modo === 'jogo' ? (certo ? '+' + N.acerto : '−' + N.erro) : ''}</span>`;
    placar();
    if (estado.modo === 'tutorial') return setTimeout(() => estado.modo === 'tutorial' && mostrarPasso(estado.passo + 1), 900);
    setTimeout(() => estado.modo === 'jogo' && novaRodada(), estado.el.pubchem ? 2000 : 1100); // mais tempo para ler os dados
}

// ===== FLUXO: tutorial -> níveis -> jogo (60s) -> resultado =====
function telas(nivel) {
    $('telaNivel').hidden = !nivel;
    $('arena').hidden = nivel;
}

function pararRelogio() { clearInterval(estado.relogio); }

function jogar(n) {
    pararRelogio();
    Object.assign(estado, { modo: 'jogo', nivel: n, pontos: 0, acertos: 0, erros: 0, tempo: TEMPO, el: null });
    telas(false);
    novaRodada();
    estado.relogio = setInterval(() => {
        estado.tempo--;
        if (estado.tempo <= 0) return fimDeJogo();
        placar();
    }, 1000);
}

function fimDeJogo() {
    pararRelogio();
    estado.modo = 'fim';
    telas(true);
    const N = NIVEIS[estado.nivel];
    if (estado.acertos > 0) confete();
    $('telaNivel').innerHTML = `
        <img src="arly.png" alt="Arly" class="w-24 h-24 mx-auto object-contain flutuar">
        <h2 class="text-2xl md:text-3xl font-bold text-purple-700 mt-2"><i data-lucide="alarm-clock"></i> Acabou o tempo!</h2>
        <p class="text-sm text-gray-500 mb-6">${N.nome} · ${N.descricao}</p>
        <div class="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
            <div class="bg-yellow-50 rounded-2xl p-4"><i data-lucide="star" class="text-yellow-600"></i><div class="font-mono text-2xl font-bold text-yellow-700">${estado.pontos}</div><div class="text-xs text-gray-500">pontos</div></div>
            <div class="bg-green-50 rounded-2xl p-4"><i data-lucide="circle-check" class="text-green-600"></i><div class="font-mono text-2xl font-bold text-green-700">${estado.acertos}</div><div class="text-xs text-gray-500">acertos</div></div>
            <div class="bg-red-50 rounded-2xl p-4"><i data-lucide="circle-x" class="text-red-600"></i><div class="font-mono text-2xl font-bold text-red-700">${estado.erros}</div><div class="text-xs text-gray-500">erros</div></div>
        </div>
        <div class="flex flex-wrap justify-center gap-3">
            <button data-acao="nivel" data-i="${estado.nivel}" class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold btn-3d"><i data-lucide="rotate-ccw"></i> Jogar de novo</button>
            ${estado.nivel < NIVEIS.length - 1 ? `<button data-acao="nivel" data-i="${estado.nivel + 1}" class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold btn-3d"><i data-lucide="arrow-up"></i> Próximo nível</button>` : ''}
            <button data-acao="niveis" class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold btn-3d-cinza"><i data-lucide="layers"></i> Níveis</button>
        </div>`;
    icones();
}

function abrirNiveis() {
    pararRelogio();
    estado.modo = 'niveis';
    telas(true);
    $('telaNivel').innerHTML = `
        <img src="arly.png" alt="Arly" class="w-24 h-24 mx-auto object-contain flutuar">
        <h2 class="text-2xl md:text-3xl font-bold text-purple-700 mt-2">Escolha um nível</h2>
        <p class="text-sm text-gray-500 mb-6">Acerte o máximo de elementos em <b>60 segundos</b>. Quanto maior o nível, menos pistas!</p>
        <div class="grid sm:grid-cols-3 gap-4">
            ${NIVEIS.map((N, i) => `
            <button data-acao="nivel" data-i="${i}" class="cartao-nivel bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-2xl p-5 transition">
                <i data-lucide="${N.icone}" class="text-purple-600" style="width:2rem;height:2rem"></i>
                <div class="font-bold text-purple-700 mt-2">${N.nome}</div>
                <div class="text-xs text-gray-500 mt-1">${N.descricao}</div>
                <div class="text-xs font-mono mt-2"><span class="text-green-600">+${N.acerto} acerto</span> · <span class="text-red-500">−${N.erro} erro</span></div>
            </button>`).join('')}
        </div>`;
    icones();
}

function abrirTutorial() {
    pararRelogio();
    Object.assign(estado, { modo: 'tutorial', nivel: 0, pontos: 0, tempo: TEMPO });
    telas(false);
    novaRodada(TUTORIAL_EL);
    mostrarPasso(0);
}

function mostrarPasso(n) {
    estado.passo = n;
    const p = PASSOS[n];
    document.querySelectorAll('.foco').forEach(e => e.classList.remove('foco'));
    if (p.foco) document.querySelectorAll(p.foco).forEach(e => e.classList.add('foco'));
    if (p.confete) confete();
    $('veu').hidden = $('falas').hidden = false;
    const ultimo = n === PASSOS.length - 1;
    $('falas').innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border-2 border-purple-300 p-4 flex gap-3 items-start pop">
            <img src="arly.png" alt="Arly" class="w-16 h-16 object-contain flutuar shrink-0">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-bold text-purple-700">${p.titulo}</h3>
                    <span class="text-xs text-gray-400 font-mono">${n + 1}/${PASSOS.length}</span>
                    <button data-acao="pular" class="ml-auto text-sm text-gray-400 hover:text-gray-600 hover:underline">Pular tutorial <i data-lucide="skip-forward"></i></button>
                </div>
                <p class="text-sm text-gray-600">${p.texto}</p>
                ${p.pronto ? `<p class="text-xs text-purple-500 mt-2"><i data-lucide="mouse-pointer-click"></i> Faça a ação para continuar</p>` : `
                <div class="flex justify-end mt-3">
                    <button data-acao="${ultimo ? 'pular' : 'proximo'}" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold btn-3d">
                        ${ultimo ? 'Começar' : 'Próximo'} <i data-lucide="arrow-right"></i></button>
                </div>`}
            </div>
        </div>`;
    icones();
}

function fecharTutorial() {
    document.querySelectorAll('.foco').forEach(e => e.classList.remove('foco'));
    $('veu').hidden = $('falas').hidden = true;
    salvar('elementos-tutorial', { visto: true });
    abrirNiveis();
}

const ACOES = {
    tutorial: abrirTutorial,
    pular: fecharTutorial,
    proximo: () => mostrarPasso(estado.passo + 1),
    niveis: () => { if (estado.modo === 'tutorial') fecharTutorial(); else abrirNiveis(); },
    nivel: el => jogar(+el.dataset.i),
    responder,
};
document.addEventListener('click', e => {
    const b = e.target.closest('[data-acao]');
    if (b && !b.disabled) ACOES[b.dataset.acao](b);
});

if (ler('elementos-tutorial').visto) abrirNiveis(); else abrirTutorial();
