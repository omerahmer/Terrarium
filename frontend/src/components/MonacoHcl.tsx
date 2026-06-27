import Editor from "@monaco-editor/react";
import { setupMonaco } from "@/lib/monaco-setup";

// Configure Monaco (local bundle + HCL language) at module load, which only
// happens when this lazily-imported chunk is fetched.
setupMonaco();

interface MonacoHclProps {
  value: string;
  onChange: (value: string) => void;
  theme: "vs-dark" | "light";
}

export default function MonacoHcl({ value, onChange, theme }: MonacoHclProps) {
  return (
    <Editor
      height="100%"
      language="hcl"
      theme={theme}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      options={{
        minimap: { enabled: false },
        fontSize: 12,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        automaticLayout: true,
        tabSize: 2,
      }}
    />
  );
}
