import { Client } from "pg";

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return process.env.NODE_ENV === "production" ? true : false;
}

// MANTIDO: Uma única versão da função é o suficiente, pois eram idênticas.
// A outra versão foi REMOVIDA.
async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();
  return client;
}

// MANTIDO: Esta função estava correta e não tinha duplicatas.
async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    // Adicionado "await" para garantir que a conexão seja fechada corretamente.
    if (client) {
      await client.end();
    }
  }
}
const database = {
  query,
  getNewClient,
};

// Exporte a constante
export default database;
