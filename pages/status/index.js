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

// CORREÇÃO 1: Adicionamos 'version' como uma propriedade (prop)
function SlowQueriesList({ queries, version }) {
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
        {queries.map((q) => {
          const durationColor = q.duration_seconds > 30 ? "#d32f2f" : "#f57c00";

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
                {/* CORREÇÃO 1: Usamos a prop 'version' em vez de 'data' */}
                <div>Versão: {version}</div>
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
      ? "#d32f2f" // Vermelho
      : usagePercentage > 75
        ? "#f57c00" // Laranja
        : "#4caf50" // Verde
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

      <p>
        Conexões Abertas: <strong>{dbData.opened_connections ?? "?"}</strong> /{" "}
        {dbData.max_connections ?? "?"}
      </p>

      {/* CORREÇÃO 2: Adicionamos uma barra de progresso para usar 'usageColor' */}
      <div
        style={{
          backgroundColor: "#e0e0e0",
          borderRadius: "4px",
          overflow: "hidden",
          marginTop: "5px",
        }}
      >
        <div
          style={{
            width: isNaN(usagePercentage) ? "100%" : `${usagePercentage}%`,
            backgroundColor: usageColor,
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          {!isNaN(usagePercentage) && `${usagePercentage.toFixed(1)}%`}
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <p>
          Consultas Ativas no Momento:{" "}
          <strong>{dbData.queries?.active_count ?? "N/D"}</strong>
        </p>
        {/* CORREÇÃO 1: Passamos a versão do DB como prop para o componente filho */}
        <SlowQueriesList
          queries={dbData.queries?.slowest}
          version={dbData.version}
        />
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fetchAPI);

  if (error)
    return (
      <div style={{ color: "red", padding: "20px" }}>
        <h1>Erro ao carregar o status.</h1>
        <p>{error.message}</p>
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
