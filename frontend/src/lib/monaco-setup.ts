// Wires up Monaco to use the locally-bundled `monaco-editor` package instead of
// fetching it from a CDN (jsDelivr), so the editor works offline / inside the
// Docker dev container. Imported once for its side effects before the editor
// first renders.
import { loader } from "@monaco-editor/react";
// Import the core editor API only — NOT the full `monaco-editor` barrel, which
// bundles every built-in language (perl, ruby, sql, …) and the TS/JSON language
// services. We register HCL ourselves via Monarch and only need the base editor.
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// Only the base editor worker is needed — we render plain HCL, not TS/JSON, so
// the language-service workers aren't required.
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

// Tell Monaco how to spin up its web worker from the bundled asset.
self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

let registered = false;

function registerHcl() {
  if (registered) return;
  registered = true;

  monaco.languages.register({ id: "hcl" });

  monaco.languages.setMonarchTokensProvider("hcl", {
    keywords: [
      "resource",
      "variable",
      "output",
      "provider",
      "module",
      "data",
      "terraform",
      "locals",
      "true",
      "false",
      "null",
    ],
    tokenizer: {
      root: [
        [/#.*$/, "comment"],
        [/\/\/.*$/, "comment"],
        [
          /[a-zA-Z_]\w*/,
          { cases: { "@keywords": "keyword", "@default": "identifier" } },
        ],
        [/"/, { token: "string.quote", next: "@string" }],
        [/-?\d+(\.\d+)?/, "number"],
        [/[{}()\[\]]/, "@brackets"],
        [/[=:,.]/, "delimiter"],
      ],
      string: [
        [/\$\{/, { token: "delimiter.bracket", next: "@interp" }],
        [/[^"\\$]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, { token: "string.quote", next: "@pop" }],
      ],
      interp: [
        [/\}/, { token: "delimiter.bracket", next: "@pop" }],
        [/[a-zA-Z_]\w*/, "variable"],
        [/[.\[\]]/, "delimiter"],
        [/"/, { token: "string.quote", next: "@string" }],
      ],
    },
  });
}

let configured = false;

// Idempotent: safe to call from every editor mount.
export function setupMonaco() {
  if (!configured) {
    loader.config({ monaco });
    configured = true;
  }
  registerHcl();
}
