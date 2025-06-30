const TOKEN_DA_BARBEARIA = "bar1234";
const horariosDisponiveis = ["09:00", "10:00", "11:00"];
const containerHorarios = document.getElementById("opcoesHorarios");
let horarioSelecionado = null;

document.addEventListener("DOMContentLoaded", () => {
  db.collection("barbearias")
    .doc(TOKEN_DA_BARBEARIA)
    .collection("agendamentos")
    .get()
    .then(snapshot => {
      const horariosAgendados = snapshot.docs.map(doc => doc.data().horario);

      horariosDisponiveis.forEach(hora => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = hora;
        btn.className = "horario-btn";
        btn.dataset.horario = hora;

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
    });
});

const form = document.getElementById("formAgendamento");
// Mapeamento dos serviços com seus valores
const servicosComValor = {
  "Corte Tradicional": "30",
  "Barba Completa": "25",
  "Pacote Especial": "50"
};

// Atualiza o valor quando o serviço é selecionado
const selectServico = document.getElementById("servico");
const campoValor = document.getElementById("valor");

selectServico.addEventListener("change", () => {
  const servicoSelecionado = selectServico.value;
  campoValor.value = servicosComValor[servicoSelecionado] || "";
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const nomeCliente = document.getElementById("nomeCliente").value.trim();
  const telefoneCliente = document.getElementById("telefoneCliente").value.trim();
  const barbeiroEscolhido = document.getElementById("selecionarBarbeiro").value;
  const servico = document.getElementById("servico")?.value?.trim() || "";
  const valor = document.getElementById("valor")?.value?.trim() || "";

  if (!nomeCliente || !telefoneCliente || !barbeiroEscolhido || !horarioSelecionado) {
    alert("Por favor, preencha todos os campos e selecione um horário.");
    return;
  }

  const agendamento = {
    nome: nomeCliente,
    telefone: telefoneCliente,
    barbeiro: barbeiroEscolhido,
    horario: horarioSelecionado,
    servico,
    valor,
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
