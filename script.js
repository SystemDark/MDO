import { db, ref, push, set, update, onValue, remove } from "./firebase.js";

let pessoas = {};
let editandoID = null;

const pessoasRef = ref(db, "pessoas");

onValue(pessoasRef, (snapshot) => {
  pessoas = snapshot.val() || {};
  atualizarLista();
  atualizarRanking();
  atualizarResumo();
});


// ================= ADICIONAR MEMBRO =================
document.getElementById("formAdd").addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("novoNome").value.trim();
  if (!nome) return;

  const novaRef = push(pessoasRef);

  set(novaRef, {
    nome,
    M: 0,
    D: 0,
    O: 0,
    P: 0,
    F: 0
  });

  document.getElementById("novoNome").value = "";
});


// ================= LANÇAR MDO =================
document.getElementById("formMDO").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("nome").value;
  if (!id) return;

  const M = parseInt(document.getElementById("meditacao").value) || 0;
  const D = parseInt(document.getElementById("decoracao").value) || 0;
  const O = parseInt(document.getElementById("oracao").value) || 0;

  const pessoa = pessoas[id];

  update(ref(db, "pessoas/" + id), {
    M: pessoa.M + M,
    D: pessoa.D + D,
    O: pessoa.O + O
  });

  limparCampos();
});


// ================= PRESENÇA =================
window.marcarPresenca = function () {
  const id = document.getElementById("nomePresenca").value;
  if (!id) return;

  const pessoa = pessoas[id];

  update(ref(db, "pessoas/" + id), {
    P: (pessoa.P || 0) + 1
  });
};

window.marcarFalta = function () {
  const id = document.getElementById("nomePresenca").value;
  if (!id) return;

  const pessoa = pessoas[id];

  update(ref(db, "pessoas/" + id), {
    F: (pessoa.F || 0) + 1
  });
};


// ================= LISTA =================
function atualizarLista() {
  const selectMDO = document.getElementById("nome");
  const selectPresenca = document.getElementById("nomePresenca");

  selectMDO.innerHTML = "";
  selectPresenca.innerHTML = "";

  for (let id in pessoas) {
    const option1 = document.createElement("option");
    option1.value = id;
    option1.innerText = pessoas[id].nome;

    const option2 = option1.cloneNode(true);

    selectMDO.appendChild(option1);
    selectPresenca.appendChild(option2);
  }
}


// ================= RANKING =================
function atualizarRanking() {
  const rankingDiv = document.getElementById("ranking");
  rankingDiv.innerHTML = "";

  const lista = Object.entries(pessoas);

  lista.sort((a, b) => {
    const totalA = a[1].M + a[1].D + a[1].O;
    const totalB = b[1].M + b[1].D + b[1].O;
    return totalB - totalA;
  });

  let pos = 1;

  lista.forEach(([id, pessoa]) => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div>
        <strong>#${pos} ${pessoa.nome}</strong><br>
        M${pessoa.M} - D${pessoa.D} - O${pessoa.O}<br>
        P${pessoa.P || 0} - F${pessoa.F || 0}
      </div>

      <div style="display:flex; gap:6px;">
        <button class="btn-small" onclick="abrirModal('${id}')">Editar</button>
        <button class="btn-small" style="background:#c1121f;" onclick="deletarPessoa('${id}','${pessoa.nome}')">
Excluir
</button>
      </div>
    `;

    rankingDiv.appendChild(card);
    pos++;
  });
}


// ================= EDITAR =================
window.abrirModal = function (id) {
  editandoID = id;
  const pessoa = pessoas[id];

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
  if (!editandoID) return;

  update(ref(db, "pessoas/" + editandoID), {
    nome: document.getElementById("editNome").value,
    M: parseInt(document.getElementById("editM").value) || 0,
    D: parseInt(document.getElementById("editD").value) || 0,
    O: parseInt(document.getElementById("editO").value) || 0
  });

  fecharModal();
};


// ================= DELETAR =================
window.deletarPessoa = function (id, nome) {
  const confirmar = confirm(`Tem certeza que deseja excluir ${nome}?`);
  if (!confirmar) return;

  remove(ref(db, "pessoas/" + id));
};


// ================= RESUMO =================
function atualizarResumo() {
  const totalMembros = Object.keys(pessoas).length;

  let totalGeral = 0;
  for (let id in pessoas) {
    totalGeral += pessoas[id].M + pessoas[id].D + pessoas[id].O;
  }

  document.getElementById("totalMembros").innerText = totalMembros;
  document.getElementById("totalVersiculos").innerText = totalGeral;
}


// ================= UTIL =================
function limparCampos() {
  document.getElementById("meditacao").value = "";
  document.getElementById("decoracao").value = "";
  document.getElementById("oracao").value = "";
}
