import { createRoot } from "react-dom/client";
import App from "./App";

// 当DOM加载完成后，挂载React应用
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  );
}

// Chrome插件API示例
console.log("Chrome Extension with React loaded!");
