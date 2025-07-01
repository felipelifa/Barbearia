
const TOKEN_VALIDO = "bar1234";

function verificarToken() {
  const tokenInput = document.getElementById("tokenInput").value.trim();
  if (tokenInput === "bar1234") {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("painelContainer").style.display = "block";
    
    carregarAgendamentos();             // Mostra os agendamentos
    limparAgendamentosAnteriores();    // Limpa os antigos
  } else {
    alert("Token inválido. Tente novamente.");
  }
}


function carregarAgendamentos() {
  const lista = document.getElementById("agendamentosLista");
  lista.innerHTML = "<p>Buscando agendamentos...</p>";

  db.collection("barbearias")
    .doc(TOKEN_VALIDO)
    .collection("agendamentos")
    .orderBy("criadoEm", "desc")
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        lista.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
        return;
      }

      let html = "";
      snapshot.forEach(doc => {
        const ag = doc.data();
        const id = doc.id;
        const data = ag.criadoEm?.toDate().toLocaleString("pt-BR") || "sem data";
        const telFormatado = ag.telefone.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(`Olá ${ag.nome}, tudo bem? Aqui é da Barbearia. Seu agendamento está confirmado para ${ag.diaSemana || "—"} às ${ag.horario}.`);

        html += `
          <div class="card-agendamento">
            <p><strong>Cliente:</strong> ${ag.nome}</p>
            <p><strong>Barbeiro:</strong> ${ag.barbeiro}</p>
            <p><strong>Serviço:</strong> ${ag.servico}</p>
            <p><strong>Dia:</strong> ${ag.diaSemana || "—"} | <strong>Hora:</strong> ${ag.horario}</p>
            <p><strong>Valor:</strong> R$ ${ag.valor}</p>
            <p><strong>Telefone:</strong> ${ag.telefone}</p>
            <p><strong>Agendado em:</strong> ${data}</p>
            <button onclick="excluirAgendamento('${id}')">🗑️ Excluir</button>
            <a href="https://wa.me/55${telFormatado}?text=${msg}" target="_blank">
              <button>💬 WhatsApp</button>
            </a>
          </div>
        `;
      });

      lista.innerHTML = html;
    });
}

function excluirAgendamento(id) {
  if (confirm("Tem certeza que deseja excluir este agendamento?")) {
    db.collection("barbearias")
      .doc(TOKEN_VALIDO)
      .collection("agendamentos")
      .doc(id)
      .delete()
      .then(() => alert("Agendamento excluído!"))
      .catch(error => console.error("Erro ao excluir:", error));
  }
}
function limparAgendamentosAnteriores() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zera a hora

  db.collection("barbearias")
    .doc(TOKEN_VALIDO)
    .collection("agendamentos")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const agendamento = doc.data();
        const criadoEm = agendamento.criadoEm?.toDate();

        if (criadoEm && criadoEm < hoje) {
          doc.ref.delete().then(() => {
            console.log("Agendamento antigo removido:", agendamento.nome);
          });
        }
      });
    })
    .catch(err => {
      console.error("Erro ao limpar agendamentos antigos:", err);
    });
}
