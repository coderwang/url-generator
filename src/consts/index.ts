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

// Profile 的唯一标识就是它的 name
export const DEFAULT_PROFILE_ID = "Default";

export const createDefaultProfile = (): Profile => ({
  id: DEFAULT_PROFILE_ID,
  name: DEFAULT_PROFILE_ID,
  originConfig: createOriginConfig(),
});
