/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DEFAULT_USER_ID?: string;
  readonly VITE_DEFAULT_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
