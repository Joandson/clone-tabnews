import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  if (!response.ok) {
    throw new Error("Falha na rede ou API fora do ar.");
  }
  const responseBody = await response.json();
  return responseBody;
}

function UpdatedAt() {
  const { data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "carregando...";
  if (data?.updated_at) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR", {
      dateStyle: "long",
      timeStyle: "medium",
    });
  }

  return (
    <div>
      Última atualização em: <strong>{updatedAtText}</strong>
    </div>
  );
}

function SlowQueriesList({ queries }) {
  // Se a lista de queries não existir ou estiver vazia, mostra uma mensagem positiva.
  if (!queries || queries.length === 0) {
    return (
      <div
        style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#e8f5e9",
          color: "#2e7d32",
          borderRadius: "4px",
        }}
      >
        ✅ Nenhuma consulta lenta detectada.
      </div>
    );
  }

  return (
    <div style={{ marginTop: "15px" }}>
      <h4>Consultas Mais Lentas em Execução:</h4>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {/* Itera sobre a lista de queries e cria um item para cada uma */}
        {queries.map((q) => {
          // Define a cor da duração com base no quão lenta é a query
          const durationColor = q.duration_seconds > 30 ? "#d32f2f" : "#f57c00"; // Vermelho se > 30s, Laranja se não

          return (
            <li
              key={q.pid}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            >
              <div>
                <div>Versão: {data.dependencies.database.version}</div>
                <strong>Duração:</strong>{" "}
                <span style={{ color: durationColor, fontWeight: "bold" }}>
                  {q.duration_seconds} segundos
                </span>
              </div>
              <div style={{ marginTop: "5px" }}>
                <code
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    wordBreak: "break-all",
                  }}
                >
                  {q.query_snippet}
                </code>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DatabaseStatus({ dbData }) {
  if (!dbData) return null;

  const usagePercentage =
    (dbData.opened_connections / dbData.max_connections) * 100;

  const usageColor = !isNaN(usagePercentage)
    ? usagePercentage > 90
      ? "red"
      : usagePercentage > 75
        ? "orange"
        : "green"
    : "grey";

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        margin: "16px 0",
        borderRadius: "8px",
      }}
    >
      <h3>Banco de Dados</h3>
      <p>Versão: {dbData.version ?? "N/D"}</p>

      {/* Informações de Conexão */}
      <p>
        Conexões Abertas: <strong>{dbData.opened_connections ?? "?"}</strong> /{" "}
        {dbData.max_connections ?? "?"}
      </p>
      <div>
        <p>
          Consultas Ativas no Momento:{" "}
          <strong>{dbData.queries?.active_count ?? "N/D"}</strong>
        </p>
        <SlowQueriesList queries={dbData.queries?.slowest} />
      </div>
    </div>
  );
}
export default function StatusPage() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fetchAPI);

  if (error)
    return (
      <div style={{ color: "red" }}>
        <h1>Erro!</h1>
      </div>
    );
  if (isLoading)
    return (
      <div>
        <h1>Verificando Status...</h1>
      </div>
    );

  return (
    <>
      <h1>Status do Sistema</h1>
      <UpdatedAt />
      <DatabaseStatus dbData={data?.dependencies?.database} />
    </>
  );
}
