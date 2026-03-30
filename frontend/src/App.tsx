import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Landing from "./pages/Landing";
import Canvas from "./pages/Canvas";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Canvas />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}
