import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: ".",
});

const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
});

export default jestConfig;
