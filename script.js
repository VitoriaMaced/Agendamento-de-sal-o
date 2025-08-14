let appointments = [];
let editIndex = null;

// Carregar dados
window.onload = function(){
  const stored = localStorage.getItem("appointments");
  if(stored) appointments = JSON.parse(stored);
  renderAppointments();
  generateMaintenanceReminders();
};

// Salvar localStorage
function saveToStorage(){
  localStorage.setItem("appointments", JSON.stringify(appointments));
}

// Login
function login(){
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if(user==="admin" && pass==="1234"){
    document.getElementById("loginSection").style.display="none";
    document.getElementById("scheduleSection").style.display="block";
  }else{
    alert("Usuário ou senha incorretos!");
  }
}

// Adicionar
function addAppointment(){
  const date = document.getElementById("dateInput").value;
  const time = document.getElementById("timeInput").value;
  const client = document.getElementById("clientName").value;
  const serviceInput = document.getElementById("serviceName").value;
  if(!serviceInput){ alert("Selecione o serviço"); return; }
  const [serviceName, servicePrice] = serviceInput.split("|");
  if(!date||!time||!client){ alert("Preencha todos os campos"); return; }

  appointments.push({date,time,client,service:serviceName,price:servicePrice});
  saveToStorage();
  renderAppointments();
  clearForm();
}

function clearForm(){
  document.getElementById("dateInput").value="";
  document.getElementById("timeInput").value="";
  document.getElementById("clientName").value="";
  document.getElementById("serviceName").value="";
}

// Renderizar
function renderAppointments(list=appointments){
  const container = document.getElementById("appointmentList");
  container.innerHTML="";
  if(list.length===0){
    container.innerHTML="<em>Nenhum agendamento cadastrado.</em>";
    return;
  }
  list.forEach((app,index)=>{
    const div = document.createElement("div");
    div.className="appointment-item";
    div.innerHTML=`
      <div>${formatDate(app.date)} ${app.time} - ${app.client} (${app.service}) - R$${app.price}</div>
      <div class="buttons">
        <button onclick="openEditModal(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
        <button onclick="deleteAppointment(${index})"><i class="fa-solid fa-trash"></i></button>
        <button onclick="sendWhatsapp(${index})"><i class="fa-brands fa-whatsapp"></i></button>
      </div>
    `;
    container.appendChild(div);
  });
}

// Formatar data DD/MM/AAAA
function formatDate(dateStr){
  const parts = dateStr.split("-");
  return parts[2]+"/"+parts[1]+"/"+parts[0];
}

// Editar
function openEditModal(index){
  editIndex = index;
  const app = appointments[index];
  document.getElementById("editDate").value = app.date;
  document.getElementById("editTime").value = app.time;
  document.getElementById("editClient").value = app.client;
  document.getElementById("editService").value = app.service+"|"+app.price;
  document.getElementById("editPrice").value = app.price;
  document.getElementById("editModal").style.display="flex";
}

function closeModal(){ document.getElementById("editModal").style.display="none"; }

function saveEdit(){
  const app = {
    date: document.getElementById("editDate").value,
    time: document.getElementById("editTime").value,
    client: document.getElementById("editClient").value,
    service: document.getElementById("editService").value.split("|")[0],
    price: document.getElementById("editPrice").value
  };
  appointments[editIndex] = app;
  saveToStorage();
  closeModal();
  renderAppointments();
}

// Deletar
function deleteAppointment(index){
  if(confirm("Deseja realmente remover este agendamento?")){
    appointments.splice(index,1);
    saveToStorage();
    renderAppointments();
  }
}

// WhatsApp
function sendWhatsapp(index){
  const app = appointments[index];
  const msg = `Olá ${app.client}, seu agendamento está confirmado para ${formatDate(app.date)} às ${app.time}, serviço: ${app.service} - R$${app.price}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}

// Filtrar
function filterByDate(){
  const filterDate = document.getElementById("filterDate").value;
  if(!filterDate){ renderAppointments(); return; }
  const filtered = appointments.filter(a=>a.date===filterDate);
  renderAppointments(filtered);
}

// Impressão
function printSchedule(){
  let printContent = "<h2>Agenda</h2>";
  appointments.forEach(a=>{
    printContent += `<p>${formatDate(a.date)} ${a.time} - ${a.client} (${a.service}) - R$${a.price}</p>`;
  });
  const newWin = window.open("");
  newWin.document.write(printContent);
  newWin.print();
  newWin.close();
}

/* PARTICULAS DE BRILHO */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const colors = ['#ffd1dc','#ffb6c1','#ffc0cb'];

for(let i=0;i<80;i++){
  particles.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    size:Math.random()*4+1,
    speedX:(Math.random()-0.5)/2,
    speedY:(Math.random()-0.5)/2,
    color:colors[Math.floor(Math.random()*colors.length)]
  });
}

function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x+=p.speedX;
    p.y+=p.speedY;
    if(p.x<0)p.x=canvas.width;
    if(p.x>canvas.width)p.x=0;
    if(p.y<0)p.y=canvas.height;
    if(p.y>canvas.height)p.y=0;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fillStyle=p.color;
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}

animateParticles();
window.addEventListener('resize', ()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
function generateMaintenanceReminders(){
  const reminderPanel = document.getElementById("reminderPanel");
  reminderPanel.innerHTML = "";
  const today = new Date();

  appointments.forEach((app,index) => {
    const serviceLower = app.service.toLowerCase();
    if(serviceLower.includes("fibra") || serviceLower.includes("gel")){
      // Criando objeto Date de forma confiável
      const [year, month, day] = app.date.split("-");
      const appDate = new Date(year, month-1, day); // meses começam do 0
      const diffTime = today - appDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if(diffDays >= 30){
        const div = document.createElement("div");
        div.className = "maintenance-reminder";
        div.innerHTML = `
          ⚠️ ${app.client} precisa de manutenção de ${app.service} (já se passaram ${diffDays} dias)
          <button onclick="sendMaintenanceWhatsapp(${index})">
            <i class="fa-brands fa-whatsapp"></i>
          </button>
        `;
        reminderPanel.appendChild(div);
      }
    }
  });
}
function sendMaintenanceWhatsapp(index) {
  const app = appointments[index];
  if (!app) return;

  const parts = app.date.split("-"); // [ano, mês, dia]
  const appDate = new Date(parts[0], parts[1]-1, parts[2]);
  const today = new Date();

  // Calcula dias desde a aplicação
  const diffDays = Math.floor((today - appDate) / (1000 * 60 * 60 * 24));

  // Mensagem personalizada
  const msg = `Olá ${app.client}, já se passaram ${diffDays} dias desde sua aplicação de ${app.service}. É hora da manutenção! Agende seu horário.`;

  // Abre WhatsApp Web ou app no celular
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}
