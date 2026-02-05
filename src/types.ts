export type Platform = 'H5' | 'PC' | 'App';
export type Environment = 'Qa' | 'Pre' | 'Prod';

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
