import { db, ref, push, set, onValue, update, remove } from "./firebase.js";

let pessoas = {};
const pessoasRef = ref(db, "pessoas");

/* ===============================
   CARREGAR DADOS EM TEMPO REAL
================================= */

onValue(pessoasRef, (snapshot) => {
  pessoas = snapshot.val() || {};
  atualizarLista();
  atualizarRanking();
});

/* ===============================
   ADICIONAR NOVA PESSOA
================================= */

window.adicionarPessoa = function () {
  let nome = document.getElementById("novoNome").value.trim();
  if (!nome) return alert("Digite um nome válido.");

  let novaRef = push(pessoasRef);

  set(novaRef, {
    nome: nome,
    M: 0,
    D: 0,
    O: 0,
    presencas: [],
    faltas: []
  });

  document.getElementById("novoNome").value = "";
};

/* ===============================
   LANÇAR MDO
================================= */

window.lancarMDO = function () {
  let id = document.getElementById("nomePessoa").value;
  if (!id) return;

  let M = parseInt(document.getElementById("meditacao").value) || 0;
  let D = parseInt(document.getElementById("decoracao").value) || 0;
  let O = parseInt(document.getElementById("oracao").value) || 0;

  if (M === 0 && D === 0 && O === 0) {
    return alert("Digite ao menos um valor.");
  }

  let pessoa = pessoas[id];

  update(ref(db, "pessoas/" + id), {
    M: (pessoa.M || 0) + M,
    D: (pessoa.D || 0) + D,
    O: (pessoa.O || 0) + O
  });

  limparCampos();
};

function limparCampos() {
  document.getElementById("meditacao").value = "";
  document.getElementById("decoracao").value = "";
  document.getElementById("oracao").value = "";
}

/* ===============================
   PRESENÇA / FALTA COM DATA
================================= */

function dataHoje() {
  let hoje = new Date();
  let dia = String(hoje.getDate()).padStart(2, "0");
  let mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

window.marcarPresenca = function () {
  let id = document.getElementById("nomePessoa").value;
  if (!id) return;

  let pessoa = pessoas[id];
  let lista = pessoa.presencas || [];

  lista.push(dataHoje());

  update(ref(db, "pessoas/" + id), {
    presencas: lista
  });
};

window.marcarFalta = function () {
  let id = document.getElementById("nomePessoa").value;
  if (!id) return;

  let pessoa = pessoas[id];
  let lista = pessoa.faltas || [];

  lista.push(dataHoje());

  update(ref(db, "pessoas/" + id), {
    faltas: lista
  });
};

/* ===============================
   ATUALIZAR SELECT
================================= */

function atualizarLista() {
  let select = document.getElementById("nomePessoa");
  select.innerHTML = "";

  for (let id in pessoas) {
    let option = document.createElement("option");
    option.value = id;
    option.innerText = pessoas[id].nome;
    select.appendChild(option);
  }
}

/* ===============================
   RANKING
================================= */

function atualizarRanking() {
  let rankingDiv = document.getElementById("ranking");
  rankingDiv.innerHTML = "";

  let lista = Object.entries(pessoas);

  lista.sort((a, b) => {
    let totalA = (a[1].M || 0) + (a[1].D || 0) + (a[1].O || 0);
    let totalB = (b[1].M || 0) + (b[1].D || 0) + (b[1].O || 0);
    return totalB - totalA;
  });

  let pos = 1;

  lista.forEach(([id, pessoa]) => {
    let card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div>
        <strong>#${pos} ${pessoa.nome}</strong><br>
        M${pessoa.M || 0} - D${pessoa.D || 0} - O${pessoa.O || 0}<br>
        P${(pessoa.presencas || []).length} - F${(pessoa.faltas || []).length}
      </div>

      <div style="display:flex; gap:6px;">
        <button onclick="editarPessoa('${id}')">Editar</button>
        <button onclick="deletarPessoa('${id}','${pessoa.nome}')"
        style="background:#c1121f;">
        Excluir
        </button>
      </div>
    `;

    rankingDiv.appendChild(card);
    pos++;
  });
}

/* ===============================
   EDITAR MDO
================================= */

window.editarPessoa = function (id) {
  let pessoa = pessoas[id];

  let novoM = prompt("Editar Meditação:", pessoa.M || 0);
  if (novoM === null) return;

  let novoD = prompt("Editar Decoração:", pessoa.D || 0);
  if (novoD === null) return;

  let novoO = prompt("Editar Oração:", pessoa.O || 0);
  if (novoO === null) return;

  update(ref(db, "pessoas/" + id), {
    M: parseInt(novoM) || 0,
    D: parseInt(novoD) || 0,
    O: parseInt(novoO) || 0
  });
};

/* ===============================
   DELETAR MEMBRO
================================= */

window.deletarPessoa = function (id, nome) {
  let confirmar = confirm(`Tem certeza que deseja excluir ${nome}? Essa ação não pode ser desfeita.`);
  if (!confirmar) return;

  remove(ref(db, "pessoas/" + id));
};

/* ===============================
   GERAR PDF MENSAL
================================= */

window.gerarPDF = function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let mesAtual = new Date().getMonth() + 1;
  let mesFormatado = String(mesAtual).padStart(2, "0");

  doc.setFontSize(18);
  doc.text("RELATÓRIO MDO DO ACRO", 20, 20);

  doc.setFontSize(12);

  let y = 35;

  let lista = Object.entries(pessoas);

  lista.sort((a, b) => {
    let totalA = (a[1].M || 0) + (a[1].D || 0) + (a[1].O || 0);
    let totalB = (b[1].M || 0) + (b[1].D || 0) + (b[1].O || 0);
    return totalB - totalA;
  });

  lista.forEach(([id, pessoa], index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(`${index + 1}º ${pessoa.nome}`, 20, y);
    y += 6;

    doc.text(`M${pessoa.M || 0} - D${pessoa.D || 0} - O${pessoa.O || 0}`, 25, y);
    y += 6;

    let presMes = (pessoa.presencas || []).filter(d => d.split("/")[1] === mesFormatado);
    let faltMes = (pessoa.faltas || []).filter(d => d.split("/")[1] === mesFormatado);

    doc.text(`Presenças (${presMes.length}): ${presMes.join(", ")}`, 25, y);
    y += 6;

    doc.text(`Faltas (${faltMes.length}): ${faltMes.join(", ")}`, 25, y);
    y += 10;
  });

  doc.save(`Relatorio_MDO_${mesFormatado}.pdf`);
};
