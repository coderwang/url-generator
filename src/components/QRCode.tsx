import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import styles from "./QRCode.module.less";

const CACHE_KEY = "qrcode_input";

const QRCode: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    chrome.storage.local.get([CACHE_KEY], (result) => {
      const cached = result[CACHE_KEY];
      if (cached) {
        setInputValue(cached);
        setQrValue(cached);
      }
    });
  }, []);

  const qrRef = useRef<HTMLDivElement>(null);

  const handleGetCurrentPage = async () => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tab = tabs[0];
      if (tab?.url) {
        setInputValue(tab.url);
        toast.success("Filled successfully!");
      } else {
        toast.error("Failed to fill");
      }
    } catch {
      toast.error("Failed to fill");
    }
  };

  const handleGenerate = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setQrValue(trimmed);
    chrome.storage.local.set({ [CACHE_KEY]: trimmed });
    toast.success("QR Code generated successfully!");
  };

  const handleCopyQR = useCallback(async () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      try {
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/png")
        );
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("QR Code copied to clipboard!");
      } catch {
        toast.error("Failed to copy QR Code");
      }
    };
    img.src = url;
  }, []);

  return (
    <div className={styles.container}>
      <h2>QR Code</h2>
      <p className={styles.desc}>
        Enter text or URL below to generate a QR code
      </p>

      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label>Content</label>
          <button
            className={styles.currentPageBtn}
            onClick={handleGetCurrentPage}
          >
            Get current page URL
          </button>
        </div>
        <textarea
          placeholder="e.g. https://example.com"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />
      </div>

      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={!inputValue.trim()}
      >
        Generate QR Code
      </button>

      {qrValue && (
        <div className={styles.qrcodeResult}>
          <div
            ref={qrRef}
            className={styles.qrcodeWrapper}
            onClick={handleCopyQR}
            title="Click to copy"
          >
            <QRCodeSVG value={qrValue} size={160} level="M" />
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCode;
