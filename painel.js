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
      hoje.setHours(0, 0, 0, 0);

      snapshot.forEach(doc => {
        const ag = doc.data();
        const id = doc.id;

        if (ag.criadoEm && ag.criadoEm.toDate() < hoje) {
          db.collection("barbearias")
            .doc(TOKEN_DA_BARBEARIA)
            .collection("agendamentos")
            .doc(id)
            .delete();
        } else {
          const dataFormatada = ag.criadoEm?.toDate().toLocaleDateString() || "Sem data";

          html += `
            <div class="agendamento-card">
              <div class="info-linha"><span class="label">Cliente:</span><span class="valor">${ag.nome}</span></div>
              <div class="info-linha"><span class="label">Barbeiro:</span><span class="valor">${ag.barbeiro}</span></div>
              <div class="info-linha"><span class="label">Horário:</span><span class="valor">${ag.horario}</span></div>
              <div class="info-linha"><span class="label">Serviço:</span><span class="valor">${ag.servico || "—"}</span></div>
              <div class="info-linha"><span class="label">Valor:</span><span class="valor">R$ ${ag.valor || "0,00"}</span></div>
              <div class="info-linha"><span class="label">Contato:</span><span class="valor">${ag.telefone || "—"}</span></div>
              <div class="info-linha"><span class="label">Criado em:</span><span class="valor">${dataFormatada}</span></div>
              <div class="botoes-card">
                <a href="https://wa.me/55${ag.telefone?.replace(/\D/g, '')}?text=Olá!%20Confirmando%20seu%20agendamento%20para%20hoje%20às%20${ag.horario}%20com%20o%20barbeiro%20${ag.barbeiro}" target="_blank">
                  <button class="btn-whatsapp">📩 WhatsApp</button>
                </a>
                <button class="btn-excluir" onclick="excluirAgendamento('${id}')">🗑️ Excluir</button>
              </div>
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

