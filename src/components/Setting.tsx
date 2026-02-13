import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ENVIRONMENTS, PLATFORMS } from "../consts";
import { AllOriginConfig, Environment, Platform } from "../types";
import "./Setting.css";

const Setting: React.FC = () => {
  const [config, setConfig] = useState<AllOriginConfig>({
    H5: { Qa: "", Pre: "", Prod: "" },
    PC: { Qa: "", Pre: "", Prod: "" },
    App: { Qa: "", Pre: "", Prod: "" },
  });

  // 从Chrome Storage加载配置
  useEffect(() => {
    chrome.storage.local.get(["originConfig"], (result) => {
      if (result.originConfig) {
        setConfig(result.originConfig);
      }
    });
  }, []);

  // 保存配置到Chrome Storage
  const saveConfig = () => {
    chrome.storage.local.set({ originConfig: config }, () => {
      toast.success("Config saved successfully!");
    });
  };

  // 更新单个配置项
  const updateOrigin = (
    platform: Platform,
    env: Environment,
    value: string
  ) => {
    setConfig((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [env]: value,
      },
    }));
  };

  const placeholder = {
    H5: {
      Qa: "e.g. https://hk-m-qa.weizhipin.com",
      Pre: "e.g. https://m-pre.offertoday.com",
      Prod: "e.g. https://m.offertoday.com",
    },
    PC: {
      Qa: "e.g. https://hongkong-victoria-web-qa.weizhipin.com",
      Pre: "e.g. https://www-pre.offertoday.com",
      Prod: "e.g. https://www.offertoday.com",
    },
    App: {
      Qa: "e.g. otd://offertoday.app",
      Pre: "e.g. otd://offertoday.app",
      Prod: "e.g. otd://offertoday.app",
    },
  };

  return (
    <div className="setting-container">
      <h2>Environment Configuration</h2>
      <p className="setting-desc">
        Configure the environment Origin for each platform
      </p>

      {PLATFORMS.map((platform) => (
        <div key={platform} className="platform-section">
          <h3>{platform}</h3>
          <div className="env-inputs">
            {ENVIRONMENTS.map((env) => (
              <div key={env} className="input-group">
                <label>{env}</label>
                <input
                  type="text"
                  placeholder={placeholder[platform][env]}
                  value={config[platform][env]}
                  onChange={(e) => updateOrigin(platform, env, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="save-btn" onClick={saveConfig}>
        Save Configuration
      </button>
    </div>
  );
};

export default Setting;
