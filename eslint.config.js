// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    rules: {
      // Adicione ou anule regras aqui, se necessário
      "react/react-in-jsx-scope": "off", // Desnecessário com o novo JSX transform
      "react/prop-types": "off" // Desativado, pois usamos TypeScript para tipos
    }
  }
];