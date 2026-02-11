import React, { useState } from "react";
import { Toaster } from "sonner";
import "sweetalert2/dist/sweetalert2.min.css";
import "./App.css";
import Generate from "./components/Generate";
import Setting from "./components/Setting";
import Snapshot from "./components/Snapshot";

type Page = "generate" | "snapshot" | "setting";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("generate");

  return (
    <>
      <Toaster
        position="top-right"
        duration={1500}
        richColors
        toastOptions={{
          style: {
            width: "fit-content",
            marginLeft: "auto",
            minWidth: "200px",
            paddingRight: "30px",
          },
        }}
      />
      <div className="app-container">
        <div className="sidebar">
          <h1 className="app-title">URL Generator</h1>
          <nav className="nav-menu">
            <button
              className={`nav-item ${
                currentPage === "generate" ? "active" : ""
              }`}
              onClick={() => setCurrentPage("generate")}
            >
              Generate
            </button>
            <button
              className={`nav-item ${
                currentPage === "snapshot" ? "active" : ""
              }`}
              onClick={() => setCurrentPage("snapshot")}
            >
              Snapshot
            </button>
            <button
              className={`nav-item ${
                currentPage === "setting" ? "active" : ""
              }`}
              onClick={() => setCurrentPage("setting")}
            >
              Setting
            </button>
          </nav>
        </div>
        <div className="main-content">
          {currentPage === "generate" && <Generate />}
          {currentPage === "snapshot" && <Snapshot />}
          {currentPage === "setting" && <Setting />}
        </div>
      </div>
    </>
  );
};

export default App;
