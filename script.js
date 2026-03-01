import { db, ref, onValue, push, set, update } from "./firebase.js";

let pessoas = {};

const pessoasRef = ref(db, "pessoas");

onValue(pessoasRef, (snapshot) => {
  pessoas = snapshot.val() || {};
  console.log("Dados recebidos do Firebase:", pessoas); // Adicione este log
  atualizarLista();
  atualizarRanking();
});

window.adicionarPessoa = function () {
  let nome = document.getElementById("novoNome").value;
  if (nome == "") return;

  let novaRef = push(pessoasRef);
  set(novaRef, {
    nome: nome,
    M: 0,
    D: 0,
    O: 0,
  })
    .then(() => {
      console.log("Membro adicionado com sucesso:", nome);
    })
    .catch((error) => {
      console.error("Erro ao adicionar membro:", error);
    });

  document.getElementById("novoNome").value = "";
};

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

  document.getElementById("meditacao").value = "";
  document.getElementById("decoracao").value = "";
  document.getElementById("oracao").value = "";
};

function atualizarLista() {
  let select = document.getElementById("nome");
  select.innerHTML = "";

  for (let id in pessoas) {
    let option = document.createElement("option");
    option.value = id;
    option.innerText = pessoas[id].nome;
    select.appendChild(option);
  }
}

function atualizarRanking() {
  let rankingDiv = document.getElementById("ranking");
  rankingDiv.innerHTML = "";

  let lista = Object.entries(pessoas);

  lista.sort((a, b) => {
    let totalA = a[1].M + a[1].D + a[1].O;
    let totalB = b[1].M + b[1].D + b[1].O;
    return totalB - totalA;
  });

  let pos = 1;

  lista.forEach(([id, pessoa]) => {
    let card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div>
        <span class="posicao">#${pos}</span>
        ${pessoa.nome}
      </div>
      <div>
        M${pessoa.M} - D${pessoa.D} - O${pessoa.O}
      </div>
    `;

    rankingDiv.appendChild(card);

    pos++;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const formAdd = document.getElementById("formAdd");
  const formMDO = document.getElementById("formMDO"); // Adicione esta linha

  // Evento para o formulário de adicionar pessoa
  formAdd.addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o comportamento padrão do formulário
    adicionarPessoa(); // Chama a função adicionarPessoa
  });

  // Evento para o formulário de lançar MDO
  formMDO.addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o comportamento padrão do formulário
    lancarMDO(); // Chama a função lancarMDO
  });
});
