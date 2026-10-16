// [símbolo, nome, massa atômica arredondada (nêutrons = massa - Z)]; Z = posição + 1
const DADOS = [
    ['H', 'Hidrogênio', 1], ['He', 'Hélio', 4], ['Li', 'Lítio', 7], ['Be', 'Berílio', 9], ['B', 'Boro', 11],
    ['C', 'Carbono', 12], ['N', 'Nitrogênio', 14], ['O', 'Oxigênio', 16], ['F', 'Flúor', 19], ['Ne', 'Neônio', 20],
    ['Na', 'Sódio', 23], ['Mg', 'Magnésio', 24], ['Al', 'Alumínio', 27], ['Si', 'Silício', 28], ['P', 'Fósforo', 31],
    ['S', 'Enxofre', 32], ['Cl', 'Cloro', 35], ['Ar', 'Argônio', 40], ['K', 'Potássio', 39], ['Ca', 'Cálcio', 40],
    ['Sc', 'Escândio', 45], ['Ti', 'Titânio', 48], ['V', 'Vanádio', 51], ['Cr', 'Cromo', 52], ['Mn', 'Manganês', 55],
    ['Fe', 'Ferro', 56], ['Co', 'Cobalto', 59], ['Ni', 'Níquel', 59], ['Cu', 'Cobre', 64], ['Zn', 'Zinco', 65],
    ['Ga', 'Gálio', 70], ['Ge', 'Germânio', 73], ['As', 'Arsênio', 75], ['Se', 'Selênio', 79], ['Br', 'Bromo', 80],
    ['Kr', 'Criptônio', 84],
];

// elétrons por camada (K, L, M, N) como no modelo de Bohr usado no ensino médio
function camadas(z) {
    if (z === 24) return [2, 8, 13, 1]; // exceções reais: Cr e Cu
    if (z === 29) return [2, 8, 18, 1];
    if (z <= 2) return [z];
    if (z <= 10) return [2, z - 2];
    if (z <= 18) return [2, 8, z - 10];
    if (z <= 20) return [2, 8, 8, z - 18];
    if (z <= 30) return [2, 8, z - 20 + 8, 2];
    return [2, 8, 18, z - 28];
}

const ELEMENTOS = DADOS.map(([simbolo, nome, massa], i) => {
    const z = i + 1;
    return { z, simbolo, nome, protons: z, eletrons: z, neutrons: massa - z, camadas: camadas(z) };
});

// autoteste: cada distribuição soma Z e nenhum elemento tem nêutrons negativos
for (const e of ELEMENTOS) {
    console.assert(e.camadas.reduce((a, b) => a + b, 0) === e.z, 'camadas erradas: ' + e.nome);
    console.assert(e.neutrons >= 0, 'nêutrons errados: ' + e.nome);
}

const NIVEIS = [
    { nome: 'Nível 1', icone: 'atom', acerto: 5, erro: 3, simbolo: true, dados: true,
      descricao: 'Símbolo, camadas, prótons, nêutrons, elétrons e modelo de Bohr' },
    { nome: 'Nível 2', icone: 'orbit', acerto: 8, erro: 2, simbolo: true, dados: false, particulas: true,
      descricao: 'Símbolo, prótons, nêutrons, elétrons e modelo de Bohr' },
    { nome: 'Nível 3', icone: 'eye-off', acerto: 10, erro: 1, simbolo: false, dados: false, particulas: true,
      descricao: 'Modelo de Bohr com prótons, nêutrons e elétrons' },
];
