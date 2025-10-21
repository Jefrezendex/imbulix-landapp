const backend = "https://imbulix-landapp.onrender.com"; // update if different
const btnBuscar = document.getElementById('btnBuscar');
const codigoInput = document.getElementById('codigo');
const mensagem = document.getElementById('mensagem');
const viewerArea = document.getElementById('viewerArea');
const docFrame = document.getElementById('docFrame');
const historicoTableBody = document.querySelector('#historicoTable tbody');

let lastCodigo = "";
let lastEnvio = "";
let lastClasse = "";

btnBuscar.addEventListener('click', buscar);

async function buscar(){
  const codigo = codigoInput.value.trim();
  mensagem.textContent = '';
  if(!/^\d{8}$/.test(codigo)){ alert('Digite um código válido de 8 dígitos.'); return; }
  mensagem.textContent = 'Buscando documento...';
  try{
    const res = await fetch(`${backend}/buscar/${codigo}`);
    if(!res.ok){ const err = await res.json(); mensagem.textContent = 'Erro: ' + (err.detail || 'Não encontrado'); return; }
    const data = await res.json();
    lastCodigo = codigo;
    lastEnvio = data.envio || 'Não encontrada';
    lastClasse = data.classe || 'Não encontrada';
    docFrame.src = data.url;
    viewerArea.classList.remove('hidden');
    mensagem.textContent = `Envio: ${lastEnvio} — Classe: ${lastClasse}`;
  }catch(e){
    console.error(e);
    mensagem.textContent = 'Erro ao buscar: ' + e.message;
  }
}

async function registrar(status){
  if(!lastCodigo){ alert('Busque um documento antes de registrar.'); return; }
  try{
    const payload = { codigo: lastCodigo, envio: lastEnvio, classe: lastClasse, status };
    const res = await fetch(`${backend}/registrar`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if(!res.ok){ const err = await res.json(); alert('Erro: ' + (err.detail||'')); return; }
    alert('Registrado com sucesso.');
    carregarHistorico();
  }catch(e){ alert('Erro ao registrar: ' + e.message); }
}

async function carregarHistorico(){
  try{
    const res = await fetch(`${backend}/historico`);
    const dados = await res.json();
    historicoTableBody.innerHTML = '';
    dados.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r['Envio']}</td><td>${r['Código']}</td><td>${r['Classe do Material']}</td><td>${r['Valor']}</td><td style="color:${r['Status']==='Aceito'?'green':'red'}">${r['Status']}</td>`;
      historicoTableBody.appendChild(tr);
    });
  }catch(e){ console.error(e); }
}

function baixarExcel(){
  window.location.href = `${backend}/download_excel`;
}

// load history on open
carregarHistorico();
