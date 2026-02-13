import {
  AllOriginConfig,
  Environment,
  PathConfig,
  Platform,
  Profile,
} from "../types";

export const PLATFORMS: Platform[] = ["H5", "PC", "App"];
export const ENVIRONMENTS: Environment[] = ["Qa", "Pre", "Prod"];

export const createOriginConfig = (): AllOriginConfig => ({
  H5: { Qa: "", Pre: "", Prod: "" },
  PC: { Qa: "", Pre: "", Prod: "" },
  App: { Qa: "", Pre: "", Prod: "" },
});

export const createPathConfig = (): PathConfig => ({
  H5: "",
  PC: "",
  App: "",
});

export const DEFAULT_PROFILE_ID = "default";

export const createDefaultProfile = (): Profile => ({
  id: DEFAULT_PROFILE_ID,
  name: "Default",
  originConfig: createOriginConfig(),
});

export const generateProfileId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
