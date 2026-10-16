import Tippy from "@tippyjs/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { hideAll } from "tippy.js";
import "tippy.js/animations/shift-away-subtle.css";
import "tippy.js/dist/tippy.css";
import { DEFAULT_PROFILE_ID } from "../consts";
import { ProfilesStorage, SnapshotsStorage } from "../types";
import Dropdown from "./Dropdown";
import styles from "./Snapshot.module.less";

const ALL_PROFILES = "__all__";

const Snapshot: React.FC = () => {
  const [snapshots, setSnapshots] = useState<SnapshotsStorage>({});
  const [profiles, setProfiles] = useState<ProfilesStorage>({});
  const [filterProfileId, setFilterProfileId] = useState<string>(ALL_PROFILES);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 200ms 防抖：searchInput 变化后 200ms 才同步到 debouncedKeyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchInput);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 加载快照和 profiles
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    chrome.storage.local.get(["snapshots", "profiles"], (result) => {
      const loadedProfiles: ProfilesStorage = result.profiles || {};

      // 旧版迁移：profiles 的 key 是随机 id，需要转换为 name 作为 key
      const profileNeedsMigration = Object.entries(loadedProfiles).some(
        ([key, p]) => key !== p.name || p.id !== p.name
      );

      let profilesMap: ProfilesStorage = loadedProfiles;
      const idToName: Record<string, string> = {};
      if (profileNeedsMigration) {
        profilesMap = {};
        Object.values(loadedProfiles).forEach((p) => {
          idToName[p.id] = p.name;
          profilesMap[p.name] = { ...p, id: p.name };
        });
      }
      setProfiles(profilesMap);

      if (result.snapshots) {
        const loaded: SnapshotsStorage = result.snapshots;
        // 旧数据迁移：
        // 1) 缺少 profileId 的快照归入 Default profile
        // 2) 若 profiles 经历了随机 id → name 的迁移，快照的 profileId 也要跟着换
        let migrated = false;
        const next: SnapshotsStorage = {};
        Object.entries(loaded).forEach(([key, snapshot]) => {
          let profileId = snapshot.profileId;
          if (!profileId) {
            profileId = DEFAULT_PROFILE_ID;
            migrated = true;
          } else if (profileNeedsMigration && idToName[profileId]) {
            profileId = idToName[profileId];
            migrated = true;
          }
          next[key] = { ...snapshot, profileId };
        });
        if (migrated) {
          chrome.storage.local.set({ snapshots: next });
        }
        setSnapshots(next);
      }
    });
  };

  // 复制快照到剪贴板
  const copySnapshot = (name: string) => {
    const snapshot = snapshots[name];
    if (snapshot) {
      navigator.clipboard.writeText(snapshot.urls);
      toast.success(`Copied snapshot "${name}" to clipboard!`);
    }
  };

  // 重命名快照
  const renameSnapshot = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const { value: newName } = await Swal.fire({
      title: "Rename Snapshot",
      input: "text",
      inputValue: name,
      showCancelButton: true,
      heightAuto: false,
      scrollbarPadding: false,
      width: 320,
      padding: "1.5em",
      confirmButtonText: "Rename",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value.trim()) return "Snapshot name is required";
        if (value.trim() !== name && snapshots[value.trim()])
          return "A snapshot with this name already exists";
        return undefined;
      },
    });

    if (!newName || !newName.trim() || newName.trim() === name) return;

    const trimmedName = newName.trim();
    const newSnapshots = { ...snapshots };
    const snapshotData = newSnapshots[name];

    // 删除旧 key，创建新 key
    delete newSnapshots[name];
    newSnapshots[trimmedName] = {
      ...snapshotData,
      name: trimmedName,
    };

    chrome.storage.local.set({ snapshots: newSnapshots }, () => {
      setSnapshots(newSnapshots);
      toast.success(`Renamed to "${trimmedName}"`);
    });
  };

  // 编辑快照内容
  const editSnapshot = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const snapshot = snapshots[name];
    if (!snapshot) return;

    const { value: newUrls } = await Swal.fire({
      title: `Edit "${name}"`,
      input: "textarea",
      inputValue: snapshot.urls,
      showCancelButton: true,
      heightAuto: false,
      scrollbarPadding: false,
      width: 480,
      padding: "1.5em",
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputAttributes: {
        style:
          "font-size: 12px; font-family: 'Courier New', monospace; line-height: 1.5; min-height: 200px; resize: vertical;",
      },
      inputValidator: (value) =>
        value.trim() ? undefined : "Content cannot be empty",
    });

    if (newUrls === undefined || newUrls === snapshot.urls) return;

    const newSnapshots = { ...snapshots };
    newSnapshots[name] = {
      ...snapshot,
      urls: newUrls,
    };

    chrome.storage.local.set({ snapshots: newSnapshots }, () => {
      setSnapshots(newSnapshots);
      toast.success(`Snapshot "${name}" updated!`);
    });
  };

  // 删除快照
  const deleteSnapshot = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const { isConfirmed } = await Swal.fire({
      title: `Delete snapshot "${name}"?`,
      icon: "warning",
      iconHtml: "!",
      showCancelButton: true,
      heightAuto: false,
      scrollbarPadding: false,
      width: 300,
      padding: "1.5em",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!isConfirmed) return;

    const newSnapshots = { ...snapshots };
    delete newSnapshots[name];

    chrome.storage.local.set({ snapshots: newSnapshots }, () => {
      setSnapshots(newSnapshots);
      toast.success(`Snapshot "${name}" deleted!`);
    });
  };

  const exportSnapshots = () => {
    if (Object.keys(snapshots).length === 0) {
      toast.error("No snapshots to export");
      return;
    }
    const data = JSON.stringify(snapshots, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snapshots_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Snapshots exported!");
  };

  const importSnapshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(
          event.target?.result as string
        ) as SnapshotsStorage;

        const entries = Object.values(imported);
        if (
          !entries.length ||
          !entries.every(
            (s) => typeof s.name === "string" && typeof s.urls === "string"
          )
        ) {
          toast.error("Invalid snapshot file format");
          return;
        }

        // 读取最新的 profiles（不依赖 state，避免闭包捕获过期数据）
        const storageData = await chrome.storage.local.get(["profiles"]);
        const currentProfiles: ProfilesStorage = storageData.profiles || {};

        // 兼容旧格式 + 修复悬空 profileId：
        // - 缺少 profileId 或类型不对 → Default
        // - profileId 在当前 profiles 中不存在（跨设备/已删除） → Default
        const normalized: SnapshotsStorage = {};
        let orphanCount = 0;
        Object.entries(imported).forEach(([key, snapshot]) => {
          let profileId = snapshot.profileId;
          if (typeof profileId !== "string" || !profileId) {
            profileId = DEFAULT_PROFILE_ID;
          } else if (!currentProfiles[profileId]) {
            profileId = DEFAULT_PROFILE_ID;
            orphanCount++;
          }
          normalized[key] = { ...snapshot, profileId };
        });

        const hasExisting = Object.keys(snapshots).length > 0;

        if (hasExisting) {
          const result = await Swal.fire({
            title: "Import Snapshots",
            text: `Found ${entries.length} snapshot(s). How to handle existing data?`,
            icon: "question",
            showCancelButton: true,
            heightAuto: false,
            scrollbarPadding: false,
            width: 360,
            padding: "1.5em",
            confirmButtonText: "Merge",
            cancelButtonText: "Cancel",
            showDenyButton: true,
            denyButtonText: "Replace All",
            denyButtonColor: "#d33",
          });

          if (result.isDismissed) return;

          const orphanTip =
            orphanCount > 0
              ? ` (${orphanCount} snapshot(s) with unknown profile were assigned to Default)`
              : "";

          if (result.isDenied) {
            chrome.storage.local.set({ snapshots: normalized }, () => {
              setSnapshots(normalized);
              toast.success(
                `Replaced with ${entries.length} imported snapshot(s)${orphanTip}`
              );
            });
          } else {
            const merged = { ...snapshots, ...normalized };
            chrome.storage.local.set({ snapshots: merged }, () => {
              setSnapshots(merged);
              toast.success(
                `Merged ${entries.length} snapshot(s)${orphanTip}`
              );
            });
          }
        } else {
          const orphanTip =
            orphanCount > 0
              ? ` (${orphanCount} snapshot(s) with unknown profile were assigned to Default)`
              : "";
          chrome.storage.local.set({ snapshots: normalized }, () => {
            setSnapshots(normalized);
            toast.success(
              `Imported ${entries.length} snapshot(s)${orphanTip}`
            );
          });
        }
      } catch {
        toast.error("Failed to parse file. Please select a valid JSON file.");
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const allSnapshots = Object.values(snapshots);

  // 按 Profile 过滤
  const profileFilteredSnapshots =
    filterProfileId === ALL_PROFILES
      ? allSnapshots
      : allSnapshots.filter((s) => s.profileId === filterProfileId);

  const showSearch = allSnapshots.length >= 1;

  // 模糊搜索：按名称和 URL 内容匹配（不区分大小写）
  const filteredSnapshots = debouncedKeyword
    ? profileFilteredSnapshots.filter((s) => {
        const keyword = debouncedKeyword.toLowerCase();
        return (
          s.name.toLowerCase().includes(keyword) ||
          s.urls.toLowerCase().includes(keyword)
        );
      })
    : profileFilteredSnapshots;

  const profileOptions = [
    { value: ALL_PROFILES, label: "All Profiles" },
    ...Object.values(profiles).map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <h2>Snapshots</h2>
        <button
          className={styles.toolbarBtn}
          onClick={() => fileInputRef.current?.click()}
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Import</span>
        </button>
        <button className={styles.toolbarBtn} onClick={exportSnapshots}>
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Export</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={importSnapshots}
        />
      </div>
      <p className={styles.desc}>
        Click on a snapshot to copy its URLs to clipboard
      </p>

      {Object.keys(profiles).length > 0 && (
        <div className={styles.profileFilterBar}>
          <label className={styles.profileFilterLabel}>Profile</label>
          <Dropdown
            options={profileOptions}
            value={filterProfileId}
            onChange={setFilterProfileId}
          />
        </div>
      )}

      {showSearch && (
        <div className={styles.searchBar}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search snapshots by name or URL"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              className={styles.searchClear}
              onClick={() => setSearchInput("")}
              onMouseDown={(e) => e.preventDefault()}
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
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {allSnapshots.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No snapshots yet</p>
          <p className={styles.emptyHint}>
            Generate URLs and click "Save Snapshot" to create one
          </p>
        </div>
      ) : filteredSnapshots.length === 0 ? (
        <div className={styles.emptyState}>
          {debouncedKeyword ? (
            <>
              <p>No matching snapshots</p>
              <p className={styles.emptyHint}>
                Try a different search keyword
              </p>
            </>
          ) : (
            <>
              <p>No snapshots in this profile</p>
              <p className={styles.emptyHint}>
                Switch to another profile or select "All Profiles"
              </p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.snapshotsGrid}>
          {filteredSnapshots.map((snapshot) => (
            <div
              key={snapshot.name}
              className={styles.snapshotBubble}
              onClick={() => copySnapshot(snapshot.name)}
            >
              <div className={styles.snapshotHeader}>
                <div className={styles.snapshotTitleRow}>
                  <h3 className={styles.snapshotName} title={snapshot.urls}>
                    {snapshot.name}
                  </h3>
                  {filterProfileId === ALL_PROFILES &&
                    profiles[snapshot.profileId] && (
                      <span className={styles.profileTag}>
                        {profiles[snapshot.profileId].name}
                      </span>
                    )}
                </div>
                <Tippy
                  content={
                    <div
                      className={styles.menu}
                      onClickCapture={() => hideAll()}
                    >
                      <div
                        className={styles.menuItem}
                        onClick={(e) => renameSnapshot(snapshot.name, e)}
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
                        <span>Rename</span>
                      </div>
                      <div
                        className={styles.menuItem}
                        onClick={(e) => editSnapshot(snapshot.name, e)}
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
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                        <span>Edit</span>
                      </div>
                      <div className={styles.menuDivider} />
                      <div
                        className={`${styles.menuItem} ${styles.menuItemDanger}`}
                        onClick={(e) => deleteSnapshot(snapshot.name, e)}
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
                        <span>Delete</span>
                      </div>
                    </div>
                  }
                  interactive={true}
                  trigger="mouseenter"
                  placement="bottom-start"
                  animation="shift-away-subtle"
                  duration={[150, 100]}
                  offset={[0, 4]}
                  arrow={false}
                  theme="menu"
                  appendTo="parent"
                >
                  <button
                    className={styles.moreBtn}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                    >
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                </Tippy>
              </div>
              <div className={styles.snapshotPreview}>{snapshot.urls}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Snapshot;
