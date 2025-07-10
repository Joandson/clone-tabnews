import migrationRunner from "node-pg-migrate";
// Corrigido: O correto é importar "path" e usar "resolve" a partir dele.
import path from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      // Corrigido: Usando "path.resolve"
      dir: path.resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    // ALTERAÇÃO 1: Em vez de "throw", envie uma resposta de erro controlada.
    return response.status(500).json({
      error: "An error occurred during the migrations.",
    });
  } finally {
    // ALTERAÇÃO 2: Verifique se o cliente existe antes de fechar a conexão.
    if (dbClient) {
      await dbClient.end();
    }
  }
}
