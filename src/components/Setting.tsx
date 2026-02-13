import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  createDefaultProfile,
  createOriginConfig,
  DEFAULT_PROFILE_ID,
  ENVIRONMENTS,
  generateProfileId,
  PLATFORMS,
} from "../consts";
import { Environment, Platform, Profile, ProfilesStorage } from "../types";
import Dropdown from "./Dropdown";
import styles from "./Setting.module.less";

const Setting: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfilesStorage>({
    [DEFAULT_PROFILE_ID]: createDefaultProfile(),
  });
  const [activeProfileId, setActiveProfileId] =
    useState<string>(DEFAULT_PROFILE_ID);

  // 当前激活的 profile
  const activeProfile = profiles[activeProfileId] || createDefaultProfile();

  // 加载 profiles 和 activeProfileId（兼容旧版 originConfig 迁移）
  useEffect(() => {
    chrome.storage.local.get(
      ["profiles", "activeProfileId", "originConfig"],
      (result) => {
        if (result.profiles) {
          // 已有 profiles 数据
          setProfiles(result.profiles);
          setActiveProfileId(result.activeProfileId || DEFAULT_PROFILE_ID);
        } else if (result.originConfig) {
          // 旧版数据迁移：将 originConfig 迁移到 Default profile
          const migrated: ProfilesStorage = {
            [DEFAULT_PROFILE_ID]: {
              id: DEFAULT_PROFILE_ID,
              name: "Default",
              originConfig: result.originConfig,
            },
          };
          setProfiles(migrated);
          setActiveProfileId(DEFAULT_PROFILE_ID);
          // 持久化迁移结果，同时保留旧的 originConfig 以兼容
          chrome.storage.local.set({
            profiles: migrated,
            activeProfileId: DEFAULT_PROFILE_ID,
          });
        }
      }
    );
  }, []);

  // 持久化 profiles 和 activeProfileId 的辅助函数
  const persistProfiles = (
    newProfiles: ProfilesStorage,
    newActiveId: string
  ) => {
    // 同时更新 originConfig 保持向后兼容（Generate 页也读它）
    const activeConfig =
      newProfiles[newActiveId]?.originConfig || createOriginConfig();
    chrome.storage.local.set({
      profiles: newProfiles,
      activeProfileId: newActiveId,
      originConfig: activeConfig,
    });
  };

  // 切换 profile
  const switchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    const activeConfig =
      profiles[profileId]?.originConfig || createOriginConfig();
    chrome.storage.local.set({
      activeProfileId: profileId,
      originConfig: activeConfig,
    });
    toast.success(`Switched to "${profiles[profileId]?.name}"`);
  };

  // 创建新 profile
  const createProfile = async () => {
    const { value: name } = await Swal.fire({
      title: "New Profile",
      input: "text",
      inputPlaceholder: "Enter profile name",
      showCancelButton: true,
      heightAuto: false,
      scrollbarPadding: false,
      width: 320,
      padding: "1.5em",
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
      inputValidator: (value) =>
        value.trim() ? undefined : "Profile name is required",
    });

    if (!name || !name.trim()) return;

    const id = generateProfileId();
    const newProfile: Profile = {
      id,
      name: name.trim(),
      originConfig: createOriginConfig(),
    };
    const newProfiles = { ...profiles, [id]: newProfile };

    setProfiles(newProfiles);
    setActiveProfileId(id);
    persistProfiles(newProfiles, id);
    toast.success(`Profile "${name.trim()}" created!`);
  };

  // 重命名当前 profile
  const renameProfile = async () => {
    const { value: newName } = await Swal.fire({
      title: "Rename Profile",
      input: "text",
      inputValue: activeProfile.name,
      showCancelButton: true,
      heightAuto: false,
      scrollbarPadding: false,
      width: 320,
      padding: "1.5em",
      confirmButtonText: "Rename",
      cancelButtonText: "Cancel",
      inputValidator: (value) =>
        value.trim() ? undefined : "Profile name is required",
    });

    if (!newName || !newName.trim() || newName.trim() === activeProfile.name)
      return;

    const newProfiles = {
      ...profiles,
      [activeProfileId]: {
        ...activeProfile,
        name: newName.trim(),
      },
    };

    setProfiles(newProfiles);
    persistProfiles(newProfiles, activeProfileId);
    toast.success(`Renamed to "${newName.trim()}"`);
  };

  // 删除当前 profile
  const deleteProfile = async () => {
    const profileKeys = Object.keys(profiles);
    if (profileKeys.length <= 1) {
      toast.error("Cannot delete the last profile");
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: `Delete "${activeProfile.name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      iconHtml: "!",
      showCancelButton: true,
      heightAuto: false,
      scrollbarPadding: false,
      width: 320,
      padding: "1.5em",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!isConfirmed) return;

    const newProfiles = { ...profiles };
    delete newProfiles[activeProfileId];

    // 切换到第一个可用的 profile
    const nextId = Object.keys(newProfiles)[0];
    setProfiles(newProfiles);
    setActiveProfileId(nextId);
    persistProfiles(newProfiles, nextId);
    toast.success(`Profile "${activeProfile.name}" deleted!`);
  };

  // 更新当前 profile 的 origin 配置
  const updateOrigin = (
    platform: Platform,
    env: Environment,
    value: string
  ) => {
    setProfiles((prev) => ({
      ...prev,
      [activeProfileId]: {
        ...prev[activeProfileId],
        originConfig: {
          ...prev[activeProfileId].originConfig,
          [platform]: {
            ...prev[activeProfileId].originConfig[platform],
            [env]: value,
          },
        },
      },
    }));
  };

  // 保存当前 profile 的配置
  const saveConfig = () => {
    persistProfiles(profiles, activeProfileId);
    toast.success("Config saved successfully!");
  };

  const placeholder = {
    H5: {
      Qa: "e.g. https://m.domain.com",
      Pre: "e.g. https://m.domain.com",
      Prod: "e.g. https://m.domain.com",
    },
    PC: {
      Qa: "e.g. https://www.domain.com",
      Pre: "e.g. https://www.domain.com",
      Prod: "e.g. https://www.domain.com",
    },
    App: {
      Qa: "e.g. market://stories.app",
      Pre: "e.g. market://stories.app",
      Prod: "e.g. market://stories.app",
    },
  };

  const profileList = Object.values(profiles);

  return (
    <div className={styles.container}>
      <h2>Environment Configuration</h2>
      <p className={styles.desc}>
        Configure the environment Origin for each platform
      </p>

      {/* Profile 选择器 */}
      <div className={styles.profileBar}>
        <Dropdown
          options={profileList.map((p) => ({
            value: p.id,
            label: p.name,
          }))}
          value={activeProfileId}
          onChange={switchProfile}
        />
        <div className={styles.profileActions}>
          <button
            className={styles.profileActionBtn}
            onClick={createProfile}
            title="New profile"
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
          <button
            className={styles.profileActionBtn}
            onClick={renameProfile}
            title="Rename profile"
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
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
          <button
            className={`${styles.profileActionBtn} ${styles.profileActionBtnDanger}`}
            onClick={deleteProfile}
            title="Delete profile"
            disabled={profileList.length <= 1}
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {PLATFORMS.map((platform) => (
        <div key={platform} className={styles.platformSection}>
          <h3>{platform}</h3>
          <div className={styles.envInputs}>
            {ENVIRONMENTS.map((env) => (
              <div key={env} className={styles.inputGroup}>
                <label>{env}</label>
                <input
                  type="text"
                  placeholder={placeholder[platform][env]}
                  value={activeProfile.originConfig[platform][env]}
                  onChange={(e) => updateOrigin(platform, env, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className={styles.saveBtn} onClick={saveConfig}>
        Save Configuration
      </button>
    </div>
  );
};

export default Setting;
