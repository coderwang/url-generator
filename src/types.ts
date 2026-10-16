export type Platform = "H5" | "PC" | "App";
export type Environment = "Qa" | "Pre" | "Prod";

export interface OriginConfig {
  Qa: string;
  Pre: string;
  Prod: string;
}

export interface AllOriginConfig {
  H5: OriginConfig;
  PC: OriginConfig;
  App: OriginConfig;
}

export interface PathConfig {
  H5: string;
  PC: string;
  App: string;
}

export interface Profile {
  // id 与 name 保持一致：name 即唯一标识
  id: string;
  name: string;
  originConfig: AllOriginConfig;
}

// key 为 profile 的 name（与 Profile.id / Profile.name 一致）
export interface ProfilesStorage {
  [name: string]: Profile;
}

export interface Snapshot {
  name: string;
  urls: string;
  profileId: string;
}

export interface SnapshotsStorage {
  [key: string]: Snapshot;
}
