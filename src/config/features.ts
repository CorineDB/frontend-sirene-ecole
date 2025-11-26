// src/config/features.ts
export const features = {
  paymentSimulation: import.meta.env.DEV,
  analytics: import.meta.env.PROD,
  betaFeatures: import.meta.env.VITE_BETA_FEATURES === 'true',
  mockData: import.meta.env.DEV
}
