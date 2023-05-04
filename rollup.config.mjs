import typescript from "@rollup/plugin-typescript";
import packageInfo from "./package.json" assert { type: "json" };

export default {
  input: "src/index.ts",
  output: [
    {
      file: packageInfo.main,
      format: "cjs",
    },
    {
      file: packageInfo.module,
      format: "es",
    },
  ],
  plugins: [typescript()],
};
