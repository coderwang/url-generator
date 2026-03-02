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
  id: string;
  name: string;
  originConfig: AllOriginConfig;
}

export interface ProfilesStorage {
  [id: string]: Profile;
}

export interface Snapshot {
  name: string;
  urls: string;
}

export interface SnapshotsStorage {
  [key: string]: Snapshot;
}
