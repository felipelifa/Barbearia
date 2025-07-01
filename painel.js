
const TOKEN_VALIDO = "bar1234";

function verificarToken() {
  const tokenInput = document.getElementById("tokenInput").value.trim();
  if (tokenInput === "bar1234") {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("painelContainer").style.display = "block";
    carregarAgendamentos(); // função que puxa do Firebase
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
        const data = ag.criadoEm?.toDate().toLocaleString("pt-BR") || "sem data";

        html += `
          <div class="card-agendamento">
            <p><strong>Cliente:</strong> ${ag.nome}</p>
            <p><strong>Barbeiro:</strong> ${ag.barbeiro}</p>
            <p><strong>Serviço:</strong> ${ag.servico}</p>
            <p><strong>Dia:</strong> ${ag.diaSemana || "—"} | <strong>Hora:</strong> ${ag.horario}</p>
            <p><strong>Valor:</strong> R$ ${ag.valor}</p>
            <p><strong>Telefone:</strong> ${ag.telefone}</p>
            <p><strong>Agendado em:</strong> ${data}</p>
          </div>
        `;
      });

      lista.innerHTML = html;
    });
}
