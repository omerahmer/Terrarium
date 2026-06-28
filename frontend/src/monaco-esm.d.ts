// The slim ESM entry `editor.api` ships JS but no separate type declarations.
// Its API surface is identical to the main `monaco-editor` package, so reuse
// those types.
declare module "monaco-editor/esm/vs/editor/editor.api" {
  export * from "monaco-editor";
}
