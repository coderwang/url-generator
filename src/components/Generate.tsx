import React, { useState, useEffect } from 'react';
import { AllOriginConfig, PathConfig, Platform, Environment } from '../types';
import './Generate.css';
import { toast } from 'sonner';

const Generate: React.FC = () => {
  const [originConfig, setOriginConfig] = useState<AllOriginConfig>({
    H5: { Qa: '', Pre: '', Prod: '' },
    PC: { Qa: '', Pre: '', Prod: '' },
    App: { Qa: '', Pre: '', Prod: '' },
  });

  const [pathConfig, setPathConfig] = useState<PathConfig>({
    H5: '',
    PC: '',
    App: '',
  });

  const [generatedUrls, setGeneratedUrls] = useState<AllOriginConfig | null>(null);

  // 加载Origin配置和Pathname配置
  useEffect(() => {
    chrome.storage.local.get(['originConfig', 'pathConfig'], (result) => {
      if (result.originConfig) {
        setOriginConfig(result.originConfig);
      }
      if (result.pathConfig) {
        setPathConfig(result.pathConfig);
      }
    });
  }, []);

  // 更新pathname
  const updatePath = (platform: Platform, value: string) => {
    setPathConfig((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  // 生成URL
  const generateUrls = () => {
    // 保存pathname配置到Chrome Storage
    chrome.storage.local.set({ pathConfig }, () => {
      console.log('Pathname配置已保存');
    });

    const result: AllOriginConfig = {
      H5: { Qa: '', Pre: '', Prod: '' },
      PC: { Qa: '', Pre: '', Prod: '' },
      App: { Qa: '', Pre: '', Prod: '' },
    };

    const platforms: Platform[] = ['H5', 'PC', 'App'];
    const environments: Environment[] = ['Qa', 'Pre', 'Prod'];

    platforms.forEach((platform) => {
      environments.forEach((env) => {
        const origin = originConfig[platform][env];
        const pathname = pathConfig[platform];
        
        if (origin && pathname) {
          // 移除origin末尾的斜杠（如果有）
          const cleanOrigin = origin.replace(/\/$/, '');
          // 确保pathname以斜杠开头
          const cleanPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
          result[platform][env] = `${cleanOrigin}${cleanPathname}`;
        } else if (origin) {
          result[platform][env] = origin;
        }
      });
    });

    setGeneratedUrls(result);
    toast.success('URL生成成功！');
  };

  const platforms: Platform[] = ['H5', 'PC', 'App'];
  const environments: Environment[] = ['Qa', 'Pre', 'Prod'];
  const placeholder = {
    H5: '例如: /scan',
    PC: '例如: /recommend',
    App: '例如: /openwith?type=openGeekF1',
  }

  return (
    <div className="generate-container">
      <h2>生成URL</h2>
      <p className="generate-desc">输入各平台的pathname，生成完整URL</p>

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

      <button className="generate-btn" onClick={generateUrls}>
        OK - 生成URL
      </button>

      {generatedUrls && (
        <div className="result-container">
          <h3>生成的URL</h3>
          {platforms.map((platform) => (
            <div key={platform} className="result-section">
              <h4>{platform}</h4>
              <div className="url-list">
                {environments.map((env) => (
                  <div key={env} className="url-item">
                    <span className="env-label">{env}:</span>
                    <div className="url-value">
                      {generatedUrls[platform][env] || '未配置'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Generate;
