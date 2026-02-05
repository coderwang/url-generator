import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AllOriginConfig, Platform, Environment } from '../types';
import './Setting.css';

const Setting: React.FC = () => {
  const [config, setConfig] = useState<AllOriginConfig>({
    H5: { Qa: '', Pre: '', Prod: '' },
    PC: { Qa: '', Pre: '', Prod: '' },
    App: { Qa: '', Pre: '', Prod: '' },
  });

  // 从Chrome Storage加载配置
  useEffect(() => {
    chrome.storage.local.get(['originConfig'], (result) => {
      if (result.originConfig) {
        setConfig(result.originConfig);
      }
    });
  }, []);

  // 保存配置到Chrome Storage
  const saveConfig = () => {
    chrome.storage.local.set({ originConfig: config }, () => {
      toast.success('配置已保存！');
    });
  };

  // 更新单个配置项
  const updateOrigin = (platform: Platform, env: Environment, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [env]: value,
      },
    }));
  };

  const platforms: Platform[] = ['H5', 'PC', 'App'];
  const environments: Environment[] = ['Qa', 'Pre', 'Prod'];
  const placeholder = {
    H5: {
      Qa: '例如: https://hk-m-qa.weizhipin.com',
      Pre: '例如: https://m-pre.offertoday.com',
      Prod: '例如: https://m.offertoday.com',
    },
    PC: {
      Qa: '例如: https://hongkong-victoria-web-qa.weizhipin.com',
      Pre: '例如: https://www-pre.offertoday.com',
      Prod: '例如: https://www.offertoday.com',
    },
    App: {
      Qa: '例如: otd://offertoday.app',
      Pre: '例如: otd://offertoday.app',
      Prod: '例如: otd://offertoday.app',
    },
  }

  return (
    <div className="setting-container">
      <h2>环境配置</h2>
      <p className="setting-desc">配置各平台的环境Origin</p>

      {platforms.map((platform) => (
        <div key={platform} className="platform-section">
          <h3>{platform}</h3>
          <div className="env-inputs">
            {environments.map((env) => (
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
        保存配置
      </button>
    </div>
  );
};

export default Setting;
