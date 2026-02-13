import Tippy from "@tippyjs/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { hideAll } from "tippy.js";
import "tippy.js/animations/shift-away-subtle.css";
import "tippy.js/dist/tippy.css";
import { SnapshotsStorage } from "../types";
import styles from "./Snapshot.module.less";

const Snapshot: React.FC = () => {
  const [snapshots, setSnapshots] = useState<SnapshotsStorage>({});

  // 加载快照
  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = () => {
    chrome.storage.local.get(["snapshots"], (result) => {
      if (result.snapshots) {
        setSnapshots(result.snapshots);
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
      timestamp: Date.now(), // 更新时间戳
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

  const snapshotList = Object.values(snapshots).sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <div className={styles.container}>
      <h2>Snapshots</h2>
      <p className={styles.desc}>
        Click on a snapshot to copy its URLs to clipboard
      </p>

      {snapshotList.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No snapshots yet</p>
          <p className={styles.emptyHint}>
            Generate URLs and click "Save Snapshot" to create one
          </p>
        </div>
      ) : (
        <div className={styles.snapshotsGrid}>
          {snapshotList.map((snapshot) => (
            <div
              key={snapshot.name}
              className={styles.snapshotBubble}
              onClick={() => copySnapshot(snapshot.name)}
            >
              <div className={styles.snapshotHeader}>
                <h3 className={styles.snapshotName} title={snapshot.urls}>
                  {snapshot.name}
                </h3>
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
                  placement="bottom-end"
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
