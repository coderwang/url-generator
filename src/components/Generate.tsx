import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { AllOriginConfig, Environment, PathConfig, Platform } from "../types";
import "./Generate.css";

const Generate: React.FC = () => {
  const [originConfig, setOriginConfig] = useState<AllOriginConfig>({
    H5: { Qa: "", Pre: "", Prod: "" },
    PC: { Qa: "", Pre: "", Prod: "" },
    App: { Qa: "", Pre: "", Prod: "" },
  });

  const [pathConfig, setPathConfig] = useState<PathConfig>({
    H5: "",
    PC: "",
    App: "",
  });

  const [generatedUrls, setGeneratedUrls] = useState<AllOriginConfig | null>(
    null
  );

  // 核心生成逻辑：接收参数，不依赖 state
  const doGenerateUrls = (
    currentOriginConfig: AllOriginConfig,
    currentPathConfig: PathConfig
  ) => {
    const result: AllOriginConfig = {
      H5: { Qa: "", Pre: "", Prod: "" },
      PC: { Qa: "", Pre: "", Prod: "" },
      App: { Qa: "", Pre: "", Prod: "" },
    };

    const platforms: Platform[] = ["H5", "PC", "App"];
    const environments: Environment[] = ["Qa", "Pre", "Prod"];

    platforms.forEach((platform) => {
      environments.forEach((env) => {
        const origin = currentOriginConfig[platform][env];
        const pathname = currentPathConfig[platform];

        if (origin && pathname) {
          // 移除origin末尾的斜杠（如果有）
          const cleanOrigin = origin.replace(/\/$/, "");
          // 确保pathname以斜杠开头
          const cleanPathname = pathname.startsWith("/")
            ? pathname
            : `/${pathname}`;
          result[platform][env] = `${cleanOrigin}${cleanPathname}`;
        } else if (origin) {
          result[platform][env] = origin;
        }
      });
    });

    setGeneratedUrls(result);
  };

  // 生成URL（从 state 读取，用于按钮点击）
  const generateUrls = () => {
    // 保存pathname配置到Chrome Storage
    chrome.storage.local.set({ pathConfig }, () => {
      console.log("Pathname配置已保存");
    });

    doGenerateUrls(originConfig, pathConfig);
    toast.success("URL generated successfully!");
  };

  // 加载Origin配置和Pathname配置
  useEffect(() => {
    chrome.storage.local.get(["originConfig", "pathConfig"], (result) => {
      const loadedOriginConfig = result.originConfig || originConfig;
      const loadedPathConfig = result.pathConfig || pathConfig;

      setOriginConfig(loadedOriginConfig);
      setPathConfig(loadedPathConfig);

      // 直接使用从 storage 拿到的值生成，不依赖 state
      doGenerateUrls(loadedOriginConfig, loadedPathConfig);
    });
  }, []);

  // 更新pathname
  const updatePath = (platform: Platform, value: string) => {
    setPathConfig((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const platforms: Platform[] = ["H5", "PC", "App"];
  const environments: Environment[] = ["Qa", "Pre", "Prod"];
  const placeholder = {
    H5: "e.g. /scan",
    PC: "e.g. /recommend",
    App: "e.g. /openwith?type=openGeekF1",
  };

  const getAllUrls = () => {
    let urls = "";
    if (generatedUrls) {
      environments.forEach((env, index) => {
        urls += `${env}\n`;
        platforms.forEach((platform, idx) => {
          urls += `${platform}: ${generatedUrls[platform][env]}`;
          if (
            index !== environments.length - 1 ||
            idx !== platforms.length - 1
          ) {
            urls += "\n";
          }
        });
        index !== environments.length - 1 && (urls += "\n");
      });
    }
    return urls;
  };

  const copyAllUrls = () => {
    const urls = getAllUrls();
    if (urls) {
      navigator.clipboard.writeText(urls);
      toast.success("Copied all URLs to clipboard!");
    }
  };

  const copyPlatformUrls = (platform: Platform) => {
    if (generatedUrls) {
      let urls = `${platform}\n`;
      Object.entries(generatedUrls[platform]).forEach(([env, url]) => {
        urls += `${env}: ${url}\n`;
      });
      navigator.clipboard.writeText(urls);
      toast.success(`Copied ${platform} URLs to clipboard!`);
    }
  };

  const saveSnapshot = async () => {
    const urls = getAllUrls();
    if (!urls) {
      toast.error("No URLs to save!");
      return;
    }

    const { value: snapshotName } = await Swal.fire({
      title: "Save Snapshot",
      input: "text",
      inputPlaceholder: "Enter snapshot name",
      showCancelButton: true,
      heightAuto: false,
      scrollbarPadding: false,
      width: 320,
      padding: "1.5em",
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputValidator: (value) =>
        value.trim() ? undefined : "Snapshot name is required",
    });

    if (!snapshotName || !snapshotName.trim()) {
      return;
    }

    // 读取现有的快照
    chrome.storage.local.get(["snapshots"], (result) => {
      const snapshots = result.snapshots || {};

      // 保存新快照
      snapshots[snapshotName.trim()] = {
        name: snapshotName.trim(),
        urls: urls,
        timestamp: Date.now(),
      };

      chrome.storage.local.set({ snapshots }, () => {
        toast.success(`Snapshot "${snapshotName}" saved!`);
      });
    });
  };

  return (
    <div className="generate-container">
      <h2>Generate URLs</h2>
      <p className="generate-desc">
        Enter the pathname for each platform, and generate the complete URL
      </p>

      <div className="path-inputs">
        {platforms.map((platform) => (
          <div key={platform} className="input-group">
            <label>{platform} Pathname</label>
            <input
              type="text"
              placeholder={placeholder[platform]}
              value={pathConfig[platform]}
              onChange={(e) => updatePath(platform, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        className="main-action-btn"
        style={{ marginBottom: "24px" }}
        onClick={generateUrls}
      >
        Generate URLs
      </button>

      {generatedUrls && (
        <>
          <div className="result-container">
            <h3>Generated URLs</h3>
            {platforms.map((platform) => (
              <div key={platform} className="result-section">
                <div className="platform-container">
                  <div className="platform-name">{platform}</div>
                  <div
                    className="copy-platform-btn"
                    onClick={() => {
                      copyPlatformUrls(platform);
                    }}
                  >
                    Copy
                  </div>
                </div>
                <div className="url-list">
                  {environments.map((env) => (
                    <div
                      key={env}
                      className="url-item"
                      onClick={() => {
                        if (generatedUrls[platform][env]) {
                          navigator.clipboard.writeText(
                            generatedUrls[platform][env]
                          );
                          toast.success("Copied URL successfully!");
                        }
                      }}
                    >
                      <span className="env-label">{env}:</span>
                      <div className="url-value">
                        {generatedUrls[platform][env] || "Not configured"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button className="main-action-btn" onClick={copyAllUrls}>
              Copy All URLs
            </button>
            <button className="main-action-btn" onClick={saveSnapshot}>
              Save Snapshot
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Generate;
