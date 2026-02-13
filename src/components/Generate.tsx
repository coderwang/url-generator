import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { ENVIRONMENTS, PLATFORMS } from "../consts";
import { AllOriginConfig, PathConfig, Platform } from "../types";
import styles from "./Generate.module.less";

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

    PLATFORMS.forEach((platform) => {
      ENVIRONMENTS.forEach((env) => {
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

  // 获取当前标签页的 pathname
  const getCurrentTabPath = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        const tab = tabs[0];
        if (tab?.url) {
          try {
            const url = new URL(tab.url);
            // 拼接 pathname + search + hash，保留完整路径信息
            const fullPath = url.pathname + url.search + url.hash;
            resolve(fullPath);
          } catch {
            reject(new Error("Invalid URL"));
          }
        } else {
          reject(new Error("Cannot access current tab URL"));
        }
      });
    });
  };

  // 填充单个平台的 pathname
  const fillPathForPlatform = async (platform: Platform) => {
    try {
      const path = await getCurrentTabPath();
      updatePath(platform, path);
      toast.success(`Filled ${platform} pathname from current page`);
    } catch {
      toast.error("Unable to get current page path");
    }
  };

  // 一键填充所有平台的 pathname
  const fillAllPaths = async () => {
    try {
      const path = await getCurrentTabPath();
      setPathConfig({
        H5: path,
        PC: path,
        App: path,
      });
      toast.success("Filled all pathnames from current page");
    } catch {
      toast.error("Unable to get current page path");
    }
  };

  const placeholder = {
    H5: "e.g. /scan",
    PC: "e.g. /recommend",
    App: "e.g. /openwith?type=openGeekF1",
  };

  const getAllUrls = () => {
    let urls = "";
    if (generatedUrls) {
      ENVIRONMENTS.forEach((env, index) => {
        urls += `${env}\n`;
        PLATFORMS.forEach((platform, idx) => {
          urls += `${platform}: ${generatedUrls[platform][env]}`;
          if (
            index !== ENVIRONMENTS.length - 1 ||
            idx !== PLATFORMS.length - 1
          ) {
            urls += "\n";
          }
        });
        index !== ENVIRONMENTS.length - 1 && (urls += "\n");
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
    <div className={styles.container}>
      <h2>Generate URLs</h2>
      <p className={styles.desc}>
        Enter the pathname for each platform, and generate the complete URL
      </p>

      <div className={styles.pathInputs}>
        <button className={styles.fetchPathBtn} onClick={fillAllPaths}>
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
          </svg>
          Fetch Current Page Path
        </button>
        {PLATFORMS.map((platform) => (
          <div key={platform} className={styles.inputGroup}>
            <label>{platform} Pathname</label>
            <div className={styles.inputWithAction}>
              <input
                type="text"
                placeholder={placeholder[platform]}
                value={pathConfig[platform]}
                onChange={(e) => updatePath(platform, e.target.value)}
              />
              <button
                className={styles.inputActionBtn}
                onClick={() => fillPathForPlatform(platform)}
                title={`Fetch current page path for ${platform}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className={styles.mainActionBtn}
        style={{ marginBottom: "24px" }}
        onClick={generateUrls}
      >
        Generate URLs
      </button>

      {generatedUrls && (
        <>
          <div className={styles.resultContainer}>
            <h3>Generated URLs</h3>
            {PLATFORMS.map((platform) => (
              <div key={platform} className={styles.resultSection}>
                <div className={styles.platformContainer}>
                  <div className={styles.platformName}>{platform}</div>
                  <div
                    className={styles.copyPlatformBtn}
                    onClick={() => {
                      copyPlatformUrls(platform);
                    }}
                  >
                    Copy
                  </div>
                </div>
                <div className={styles.urlList}>
                  {ENVIRONMENTS.map((env) => (
                    <div
                      key={env}
                      className={styles.urlItem}
                      onClick={() => {
                        if (generatedUrls[platform][env]) {
                          navigator.clipboard.writeText(
                            generatedUrls[platform][env]
                          );
                          toast.success("Copied URL successfully!");
                        }
                      }}
                    >
                      <span className={styles.envLabel}>{env}:</span>
                      <div className={styles.urlValue}>
                        {generatedUrls[platform][env] || "Not configured"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button className={styles.mainActionBtn} onClick={copyAllUrls}>
              Copy All URLs
            </button>
            <button className={styles.mainActionBtn} onClick={saveSnapshot}>
              Save Snapshot
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Generate;
