const config = {
  verbose: true,
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/utils/logger.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.{js,ts}",
    "!src/**/*.spec.{js,ts}",
  ],
};

export default config;
