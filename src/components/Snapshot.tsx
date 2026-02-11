import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { SnapshotsStorage } from "../types";
import "./Snapshot.css";

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

  // 删除快照
  const deleteSnapshot = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发复制

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
    <div className="snapshot-container">
      <h2>Snapshots</h2>
      <p className="snapshot-desc">
        Click on a snapshot to copy its URLs to clipboard
      </p>

      {snapshotList.length === 0 ? (
        <div className="empty-state">
          <p>No snapshots yet</p>
          <p className="empty-hint">
            Generate URLs and click "Save Snapshot" to create one
          </p>
        </div>
      ) : (
        <div className="snapshots-grid">
          {snapshotList.map((snapshot) => (
            <div
              key={snapshot.name}
              className="snapshot-bubble"
              onClick={() => copySnapshot(snapshot.name)}
            >
              <div className="snapshot-header">
                <h3 className="snapshot-name" title={snapshot.urls}>
                  {snapshot.name}
                </h3>
                <button
                  className="delete-btn"
                  onClick={(e) => deleteSnapshot(snapshot.name, e)}
                  title="Delete snapshot"
                >
                  ✕
                </button>
              </div>
              <div className="snapshot-preview">{snapshot.urls}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Snapshot;
