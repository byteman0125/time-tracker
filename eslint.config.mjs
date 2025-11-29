import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
];

export default config;

