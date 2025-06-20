// jest.config.js

// Importe a função do next/jest. A convenção é usar o nome 'nextJest'.
const nextJest = require("next/jest");

// Passo 1: Chame nextJest() passando um objeto com a propriedade 'dir'.
// Isso informa ao Jest onde encontrar seu aplicativo Next.js.
const createJestConfig = nextJest({
  dir: "./",
});

// Passo 2: Crie sua configuração personalizada do Jest em um objeto separado.
const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>"],
  // Você pode adicionar outras configurações do Jest aqui, se necessário.
  // Por exemplo:
  // testEnvironment: 'jest-environment-jsdom',
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

// Passo 3: Exporte o resultado da função createJestConfig passando sua configuração personalizada.
// O next/jest irá mesclar a configuração padrão do Next.js com a sua.
module.exports = createJestConfig(customJestConfig);
