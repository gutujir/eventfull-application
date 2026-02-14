export default {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/tests/**/*.test.(ts|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tests/tsconfig.json",
      },
    ],
  },
  watchman: false,
};
