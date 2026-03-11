import React, { useState } from "react";
import { Toaster } from "sonner";
import "sweetalert2/dist/sweetalert2.min.css";
import styles from "./App.module.less";
import Generate from "./components/Generate";
import QRCode from "./components/QRCode";
import Setting from "./components/Setting";
import Snapshot from "./components/Snapshot";

type Page = "generate" | "snapshot" | "setting" | "qrcode";

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
      <div className={styles.appContainer}>
        <div className={styles.sidebar}>
          <h1 className={styles.appTitle}>URL Generator</h1>
          <nav className={styles.navMenu}>
            <button
              className={`${styles.navItem} ${
                currentPage === "generate" ? styles.active : ""
              }`}
              onClick={() => setCurrentPage("generate")}
            >
              Generate
            </button>
            <button
              className={`${styles.navItem} ${
                currentPage === "snapshot" ? styles.active : ""
              }`}
              onClick={() => setCurrentPage("snapshot")}
            >
              Snapshot
            </button>
            <button
              className={`${styles.navItem} ${
                currentPage === "qrcode" ? styles.active : ""
              }`}
              onClick={() => setCurrentPage("qrcode")}
            >
              QR Code
            </button>
            <button
              className={`${styles.navItem} ${
                currentPage === "setting" ? styles.active : ""
              }`}
              onClick={() => setCurrentPage("setting")}
            >
              Setting
            </button>
          </nav>
        </div>
        <div className={styles.mainContent}>
          {currentPage === "generate" && <Generate />}
          {currentPage === "snapshot" && <Snapshot />}
          {currentPage === "qrcode" && <QRCode />}
          {currentPage === "setting" && <Setting />}
        </div>
      </div>
    </>
  );
};

export default App;
