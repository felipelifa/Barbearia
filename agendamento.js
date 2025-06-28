// ✅ TOKEN FIXO para cada barbearia (muda conforme o cliente)
const TOKEN_DA_BARBEARIA = "bar1234";

// === HORÁRIOS DISPONÍVEIS ===
const horariosDisponiveis = ["09:00", "10:00", "11:00"];
const containerHorarios = document.getElementById("opcoesHorarios");
let horarioSelecionado = null;

// === FUNÇÃO PARA CARREGAR HORÁRIOS OCUPADOS ===
async function carregarHorariosOcupados(barbeiro) {
  const snapshot = await db.collection("barbearias")
    .doc(TOKEN_DA_BARBEARIA)
    .collection("agendamentos")
    .where("barbeiro", "==", barbeiro)
    .get();

  const horariosOcupados = snapshot.docs.map(doc => doc.data().horario);

  document.querySelectorAll(".horario-btn").forEach(btn => {
    const hora = btn.dataset.horario;
    if (horariosOcupados.includes(hora)) {
      btn.classList.add("ocupado");
      btn.disabled = true;
    } else {
      btn.classList.remove("ocupado");
      btn.disabled = false;
    }
  });
}

// === CRIAÇÃO DOS BOTÕES DE HORÁRIO ===
document.addEventListener("DOMContentLoaded", () => {
  // Primeiro, busca os horários já agendados
  db.collection("barbearias")
    .doc(TOKEN_DA_BARBEARIA)
    .collection("agendamentos")
    .get()
    .then(snapshot => {
      const horariosAgendados = snapshot.docs.map(doc => doc.data().horario);

      // Agora cria os botões de horário
      horariosDisponiveis.forEach(hora => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = hora;
        btn.className = "horario-btn";
        btn.dataset.horario = hora;

        // Verifica se o horário está agendado
        if (horariosAgendados.includes(hora)) {
          btn.classList.add("ocupado");
          btn.disabled = true;
        } else {
          btn.addEventListener("click", () => {
            horarioSelecionado = hora;
            document.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("selecionado"));
            btn.classList.add("selecionado");
          });
        }

        containerHorarios.appendChild(btn);
      });
    })
    .catch(error => {
      console.error("Erro ao buscar horários agendados:", error);
    });
});


// === FORMULÁRIO DE AGENDAMENTO ===
const form = document.getElementById("formAgendamento");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const nomeCliente = document.getElementById("nomeCliente").value.trim();
  const telefoneCliente = document.getElementById("telefoneCliente").value.trim(); // ✅ Coloque essa linha aqui
  const barbeiroEscolhido = document.getElementById("selecionarBarbeiro").value;

  if (!nomeCliente || !telefoneCliente || !barbeiroEscolhido || !horarioSelecionado) {
    alert("Por favor, preencha todos os campos e selecione um horário.");
    return;
  }

  const agendamento = {
    nome: nomeCliente,
    telefone: telefoneCliente, // ✅ Isso será salvo no banco
    barbeiro: barbeiroEscolhido,
    horario: horarioSelecionado,
    dataAgendada: new Date().toLocaleDateString("pt-BR"),
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("barbearias")
    .doc(TOKEN_DA_BARBEARIA)
    .collection("agendamentos")
    .add(agendamento)
    .then(() => {
      alert("Agendamento realizado com sucesso!");
      form.reset();
      horarioSelecionado = null;
      document.querySelectorAll(".horario-btn").forEach(btn => btn.classList.remove("selecionado"));
    })
    .catch((error) => {
      console.error("Erro ao salvar agendamento: ", error);
      alert("Erro ao agendar. Tente novamente.");
    });
});
