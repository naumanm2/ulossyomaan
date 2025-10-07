import fs from "fs";
import path from "path";

const basePath = path.resolve(process.cwd(), "data");

export const system_prompt = () => {
  return fs.readFileSync(
    path.resolve(basePath, "../data/system_prompt.txt"),
    "utf-8",
  );
};