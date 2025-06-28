// ✅ TOKEN FIXO DA BARBEARIA (troque antes de vender)
const TOKEN_DA_BARBEARIA = "bar1234";

// === FORMULÁRIO PARA DIGITAR O TOKEN (validação simples) ===
document.getElementById("tokenForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const tokenDigitado = document.getElementById("tokenInput").value.trim();

  if (tokenDigitado !== TOKEN_DA_BARBEARIA) {
    alert("Token inválido. Acesso negado.");
    return;
  }

  document.getElementById("tokenForm").style.display = "none";
  document.getElementById("painel").style.display = "block";

  carregarAgendamentos();
});

// === BUSCA OS AGENDAMENTOS DA BARBEARIA FIXA ===
function carregarAgendamentos() {
  const lista = document.getElementById("agendamentos-lista");
  lista.innerHTML = "<p>Carregando agendamentos...</p>";

  db.collection("barbearias")
    .doc(TOKEN_DA_BARBEARIA)
    .collection("agendamentos")
    .orderBy("criadoEm", "desc")
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        lista.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
        return;
      }

      let html = "";

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Zera horas para comparar apenas a data

      snapshot.forEach(doc => {
        const ag = doc.data();
        const id = doc.id;

        if (ag.criadoEm && ag.criadoEm.toDate() < hoje) {
          // 🔥 Se o agendamento for de outro dia, exclui automaticamente
          db.collection("barbearias")
            .doc(TOKEN_DA_BARBEARIA)
            .collection("agendamentos")
            .doc(id)
            .delete();
        } else {
          // ✅ Agendamentos do dia atual são exibidos
          html += `
            <div class="card-agendamento">
              <p><strong>🧍 Nome do cliente:</strong><br> ${ag.nome}</p>
              <p><strong>✂️ Barbeiro escolhido:</strong><br> ${ag.barbeiro}</p>
              <p><strong>🕒 Horário marcado:</strong><br> ${ag.horario}</p>
              <p class="data-criacao">📅 ${ag.criadoEm?.toDate().toLocaleString() || 'Sem data'}</p>
              <a href="https://wa.me/55${ag.telefone?.replace(/\D/g, '')}?text=Olá!%20Confirmando%20seu%20agendamento%20para%20hoje%20às%20${ag.horario}%20com%20o%20barbeiro%20${ag.barbeiro}" target="_blank">
                <button class="btn-whatsapp">📩 Enviar WhatsApp</button>
              </a>
              <button class="btn-excluir" onclick="excluirAgendamento('${id}')">🗑️ Excluir</button>
            </div>
          `;
        }
      });

      lista.innerHTML = html || "<p>Nenhum agendamento para hoje.</p>";
    });
}

function excluirAgendamento(id) {
  if (confirm("Tem certeza que deseja excluir este agendamento?")) {
    db.collection("barbearias")
      .doc(TOKEN_DA_BARBEARIA)
      .collection("agendamentos")
      .doc(id)
      .delete()
      .then(() => {
        alert("Agendamento excluído com sucesso.");
      })
      .catch(error => {
        console.error("Erro ao excluir agendamento:", error);
        alert("Ocorreu um erro ao tentar excluir.");
      });
  }
}

