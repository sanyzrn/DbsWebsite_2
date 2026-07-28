declare module "*workbox-shared-config.mjs" {
  export const workboxGlobPatterns: string[];
  export const workboxViteGlobIgnores: string[];
  export const workboxPostPrerenderGlobIgnores: string[];
  export const workboxNavigateFallback: string;
  export const workboxNavigateFallbackDenylist: RegExp[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const workboxRuntimeCaching: any[];
}
