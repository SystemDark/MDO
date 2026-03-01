import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

import {
getDatabase,
ref,
push,
set,
onValue,
update
}
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
apiKey: "SUA_API_KEY",
authDomain: "mdo-acro.firebaseapp.com",
databaseURL: "https://mdo-acro-default-rtdb.firebaseio.com",
projectId: "mdo-acro",
storageBucket: "mdo-acro.firebasestorage.app",
messagingSenderId: "957477543792",
appId: "1:957477543792:web:8009e8d70c2cc4e295f9b5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let pessoas = {};
let editandoID = null;

const pessoasRef = ref(db,"pessoas");

onValue(pessoasRef,(snapshot)=>{
pessoas = snapshot.val() || {};
atualizarLista();
atualizarRanking();
});

window.adicionarPessoa = function(){

let nome = document.getElementById("novoNome").value;
if(nome=="")return;

let novaRef = push(pessoasRef);

set(novaRef,{
nome:nome,
M:0,
D:0,
O:0,
P:0,
F:0
});

document.getElementById("novoNome").value="";
};

window.lancarMDO = function(){

let id = document.getElementById("nomePessoa").value;
if(!id)return;

let M = parseInt(document.getElementById("meditacao").value)||0;
let D = parseInt(document.getElementById("decoracao").value)||0;
let O = parseInt(document.getElementById("oracao").value)||0;

let pessoa = pessoas[id];

update(ref(db,"pessoas/"+id),{
M:pessoa.M+M,
D:pessoa.D+D,
O:pessoa.O+O
});

limparCampos();
};

window.marcarPresenca = function(){

let id = document.getElementById("nomePessoa").value;
if(!id)return;

let pessoa = pessoas[id];

update(ref(db,"pessoas/"+id),{
P:pessoa.P+1
});
};

window.marcarFalta = function(){

let id = document.getElementById("nomePessoa").value;
if(!id)return;

let pessoa = pessoas[id];

update(ref(db,"pessoas/"+id),{
F:pessoa.F+1
});
};

function atualizarLista(){
let select = document.getElementById("nomePessoa");
select.innerHTML="";

for(let id in pessoas){
let option=document.createElement("option");
option.value=id;
option.innerText=pessoas[id].nome;
select.appendChild(option);
}
}

function atualizarRanking(){

let rankingDiv=document.getElementById("ranking");
rankingDiv.innerHTML="";

let lista = Object.entries(pessoas);

lista.sort((a,b)=>{
let totalA=a[1].M+a[1].D+a[1].O;
let totalB=b[1].M+b[1].D+b[1].O;
return totalB-totalA;
});

let pos=1;

lista.forEach(([id,pessoa])=>{

let card=document.createElement("div");
card.className="card";

card.innerHTML=`
<div>
<strong>#${pos} ${pessoa.nome}</strong><br>
M${pessoa.M} - D${pessoa.D} - O${pessoa.O}
<br>
P${pessoa.P} - F${pessoa.F}
</div>

<div>
<button onclick="editarPessoa('${id}')">Editar</button>
</div>
`;

rankingDiv.appendChild(card);

pos++;

});
}

window.editarPessoa = function(id){

let pessoa = pessoas[id];

let novoM = prompt("Editar Meditação:", pessoa.M);
let novoD = prompt("Editar Decoração:", pessoa.D);
let novoO = prompt("Editar Oração:", pessoa.O);

if(novoM===null)return;

update(ref(db,"pessoas/"+id),{
M:parseInt(novoM)||0,
D:parseInt(novoD)||0,
O:parseInt(novoO)||0
});
};

function limparCampos(){
document.getElementById("meditacao").value="";
document.getElementById("decoracao").value="";
document.getElementById("oracao").value="";
}
