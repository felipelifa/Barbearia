const TOKEN_DA_BARBEARIA = "bar1234";
const horariosDisponiveis = ["09:00", "10:00", "11:00"];
const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const diasContainer = document.getElementById("dias-semana");
const horariosContainer = document.getElementById("opcoesHorarios");
const form = document.getElementById("formAgendamento");

let horarioSelecionado = null;
let diaSelecionado = null;

const servicosComValor = {
  "Corte Tradicional": "30",
  "Barba Completa": "25",
  "Pacote Especial": "50"
};

document.getElementById("servico").addEventListener("change", () => {
  const servico = document.getElementById("servico").value;
  document.getElementById("valor").value = servicosComValor[servico] || "";
});

// Cria botões para os dias
diasSemana.forEach((dia, index) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = dia;
  btn.className = "dia-btn";
  btn.dataset.dia = index + 1;

  btn.addEventListener("click", () => {
    diaSelecionado = index + 1;
    document.querySelectorAll(".dia-btn").forEach(b => b.classList.remove("selecionado"));
    btn.classList.add("selecionado");
    mostrarHorariosParaDia(diaSelecionado);
  });

  diasContainer.appendChild(btn);
});

function mostrarHorariosParaDia(diaNumero) {
  horariosContainer.innerHTML = "<p>Carregando horários...</p>";

  db.collection("barbearias")
    .doc(TOKEN_DA_BARBEARIA)
    .collection("agendamentos")
    .get()
    .then(snapshot => {
      const agendamentos = snapshot.docs.map(doc => doc.data());
      horariosContainer.innerHTML = "";
      horarioSelecionado = null;

      horariosDisponiveis.forEach(horario => {
        const ocupado = agendamentos.some(ag =>
          ag.diaSemana === diaNumero && ag.horario === horario
        );

        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = horario;
        btn.className = "horario-btn";
        btn.disabled = ocupado;
        if (ocupado) btn.classList.add("ocupado");

        btn.addEventListener("click", () => {
          horarioSelecionado = horario;
          document.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("selecionado"));
          btn.classList.add("selecionado");
        });

        horariosContainer.appendChild(btn);
      });
    });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const nome = document.getElementById("nomeCliente").value.trim();
  const telefone = document.getElementById("telefoneCliente").value.trim();
  const barbeiro = document.getElementById("selecionarBarbeiro").value;
  const servico = document.getElementById("servico").value;
  const valor = document.getElementById("valor").value;

  if (!nome || !telefone || !barbeiro || !servico || !valor || !horarioSelecionado || !diaSelecionado) {
    alert("Preencha todos os campos e selecione um horário e um dia.");
    return;
  }

  const agendamento = {
    nome,
    telefone,
    barbeiro,
    servico,
    valor,
    horario: horarioSelecionado,
    diaSemana: diaSelecionado,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("barbearias")
    .doc(TOKEN_DA_BARBEARIA)
    .collection("agendamentos")
    .add(agendamento)
    .then(() => {
      alert("Agendamento realizado!");
      form.reset();
      diaSelecionado = null;
      horarioSelecionado = null;
      document.querySelectorAll(".dia-btn").forEach(b => b.classList.remove("selecionado"));
      horariosContainer.innerHTML = "";
    })
    .catch(error => {
      console.error("Erro:", error);
      alert("Erro ao salvar agendamento.");
    });
});
