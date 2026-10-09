/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_RAW_MATERIAL_RECEPTIONS_ENDPOINT_PATH: string;
  readonly VITE_PRODUCTION_BATCHES_ENDPOINT_PATH: string;
  readonly VITE_PRODUCTION_RECORDS_ENDPOINT_PATH: string;
  readonly VITE_QUALITY_ASSESSMENTS_ENDPOINT_PATH: string;
  readonly VITE_WASTE_RECORDS_ENDPOINT_PATH: string;
  readonly VITE_MACHINES_ENDPOINT_PATH: string;
  readonly VITE_MAINTENANCE_RECORDS_ENDPOINT_PATH: string;
  readonly VITE_PRIME_UI_LICENSE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
