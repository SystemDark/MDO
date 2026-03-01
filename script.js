import { db, ref, onValue, push, set, update } from "./firebase.js";

let pessoas = {};
let idEditando = null;

const pessoasRef = ref(db, "pessoas");

onValue(pessoasRef, (snapshot) => {
    pessoas = snapshot.val() || {};
    atualizarLista();
    atualizarRanking();
    atualizarResumo();
});

// ADICIONAR
window.adicionarPessoa = function () {
    let nome = document.getElementById("novoNome").value.trim();
    if (!nome) return;

    let novaRef = push(pessoasRef);
    set(novaRef, {
        nome,
        M: 0,
        D: 0,
        O: 0,
        presencas: 0,
        faltas: 0
    });

    document.getElementById("novoNome").value = "";
};

// LANÇAR
window.lancarMDO = function () {
    let id = document.getElementById("nome").value;
    if (!id) return;

    let M = parseInt(document.getElementById("meditacao").value) || 0;
    let D = parseInt(document.getElementById("decoracao").value) || 0;
    let O = parseInt(document.getElementById("oracao").value) || 0;

    let pessoa = pessoas[id];

    update(ref(db, "pessoas/" + id), {
        M: pessoa.M + M,
        D: pessoa.D + D,
        O: pessoa.O + O,
    });

    limparCampos();
};

// PRESENÇA
window.marcarPresenca = function () {
    let id = document.getElementById("nomePresenca").value;
    if (!id) return;

    update(ref(db, "pessoas/" + id), {
        presencas: (pessoas[id].presencas || 0) + 1
    });
};

window.marcarFalta = function () {
    let id = document.getElementById("nomePresenca").value;
    if (!id) return;

    update(ref(db, "pessoas/" + id), {
        faltas: (pessoas[id].faltas || 0) + 1
    });
};

// RANKING
function atualizarRanking() {
    let rankingDiv = document.getElementById("ranking");
    rankingDiv.innerHTML = "";

    let lista = Object.entries(pessoas);

    lista.sort((a, b) =>
        (b[1].M + b[1].D + b[1].O) -
        (a[1].M + a[1].D + a[1].O)
    );

    let pos = 1;

    lista.forEach(([id, pessoa]) => {
        let total = pessoa.M + pessoa.D + pessoa.O;

        let card = document.createElement("div");
        card.className = "ranking-card";

        card.innerHTML=`
<div>
<strong>#${pos} ${pessoa.nome}</strong><br>
M${pessoa.M} - D${pessoa.D} - O${pessoa.O}
<br>
P${(pessoa.presencas||[]).length} - F${(pessoa.faltas||[]).length}
</div>

<div>
<button onclick="editarPessoa('${id}')">Editar</button>
</div>
`;

        rankingDiv.appendChild(card);
        pos++;
    });
}

// MODAL
window.abrirModal = function (id) {
    idEditando = id;
    let pessoa = pessoas[id];

    document.getElementById("editNome").value = pessoa.nome;
    document.getElementById("editM").value = pessoa.M;
    document.getElementById("editD").value = pessoa.D;
    document.getElementById("editO").value = pessoa.O;

    document.getElementById("modalEditar").style.display = "flex";
};

window.fecharModal = function () {
    document.getElementById("modalEditar").style.display = "none";
};

window.salvarEdicao = function () {
    if (!idEditando) return;

    update(ref(db, "pessoas/" + idEditando), {
        nome: document.getElementById("editNome").value,
        M: parseInt(document.getElementById("editM").value) || 0,
        D: parseInt(document.getElementById("editD").value) || 0,
        O: parseInt(document.getElementById("editO").value) || 0,
    });

    fecharModal();
};

// OUTROS
function atualizarLista() {
    let select = document.getElementById("nome");
    let selectPresenca = document.getElementById("nomePresenca");

    select.innerHTML = "";
    selectPresenca.innerHTML = "";

    for (let id in pessoas) {
        let option = document.createElement("option");
        option.value = id;
        option.innerText = pessoas[id].nome;

        select.appendChild(option.cloneNode(true));
        selectPresenca.appendChild(option);
    }
}

function atualizarResumo() {
    document.getElementById("totalMembros").innerText =
        Object.keys(pessoas).length;

    let totalGeral = 0;
    for (let id in pessoas) {
        totalGeral += pessoas[id].M + pessoas[id].D + pessoas[id].O;
    }

    document.getElementById("totalVersiculos").innerText = totalGeral;
}

function limparCampos() {
    document.getElementById("meditacao").value = "";
    document.getElementById("decoracao").value = "";
    document.getElementById("oracao").value = "";
}

window.deletarPessoa = function(id,nome){

let confirmar = confirm(`Tem certeza que deseja excluir ${nome}?`);

if(!confirmar) return;

remove(ref(db,"pessoas/"+id));

}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formAdd").addEventListener("submit", (e) => {
        e.preventDefault();
        adicionarPessoa();
    });

    document.getElementById("formMDO").addEventListener("submit", (e) => {
        e.preventDefault();
        lancarMDO();
    });
});
