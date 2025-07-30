import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    // Teste 1: Busca com o nome de usuário exato
    test("With exact case match", async () => {
      // Primeiro, cria o usuário para o teste
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "MesmoCase",
          email: "mesmo.case@curso.dev",
          password: "senha123",
        }),
      });

      // Agora, busca o usuário que acabamos de criar
      const response = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      // Verificação CORRIGIDA: removemos o campo 'password'
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MesmoCase",
        email: "mesmo.case@curso.dev",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      // Validações adicionais
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    // Teste 2: Busca com o nome de usuário em caixa baixa
    test("With case mismatch", async () => {
      // Primeiro, cria o usuário para o teste
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "CaseDiferente",
          email: "case.diferente@curso.dev",
          password: "senha123",
        }),
      });

      // Agora, busca o usuário com o nome em letras minúsculas
      const response = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      // Verificação CORRIGIDA: removemos o campo 'password'
      // O username esperado é o original ("CaseDiferente")
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "CaseDiferente",
        email: "case.diferente@curso.dev",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      // Validações adicionais
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    // Teste 3: Busca por um usuário que não existe
    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
