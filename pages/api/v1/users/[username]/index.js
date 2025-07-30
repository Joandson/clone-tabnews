import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

// As rotas GET e PATCH continuam sendo direcionadas para suas respectivas funções
router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

//   FUNÇÃO GET CORRIGIDA
async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);

  if (!userFound) {
    return response.status(404).json({
      name: "NotFoundError",
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username está digitado corretamente.",
      status_code: 404,
    });
  }

  const safeResponse = {
    id: userFound.id,
    username: userFound.username,
    email: userFound.email,
    created_at: userFound.created_at,
    updated_at: userFound.updated_at,
  };

  // 3. Retorno da resposta de sucesso com o objeto seguro
  return response.status(200).json(safeResponse);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const updatedUser = await user.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
