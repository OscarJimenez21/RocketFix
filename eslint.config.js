// Revisión automática del código (npm run lint). Avisa de errores comunes antes de publicar:
// reglas de React (ganchos mal usados), de TypeScript y de accesibilidad.
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  { ignores: ["dist", "legacy", "node_modules", "coverage"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, jsxA11y.flatConfigs.recommended],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Un «!» le dice a TypeScript «esto existe, créeme»: mejor comprobarlo
      "@typescript-eslint/no-non-null-assertion": "error",
      // HTML sin escapar: solo donde verificar-catalogo.mjs ya revisa el contenido (cada uso lleva su permiso y su razón)
      "no-restricted-syntax": ["error", {
        selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
        message: "HTML sin escapar. Solo con contenido propio que scripts/verificar-catalogo.mjs revise."
      }]
    }
  },
  {
    files: ["*.config.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.node }
  },
  {
    files: ["scripts/**/*.mjs", "*.config.js"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node }
  }
);
