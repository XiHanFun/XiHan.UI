// clean-dist.js
import fs from "fs";
import path from "path";

const directoriesToDelete = ["dist"];

// 删除文件夹
directoriesToDelete.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Deleted directory: ${dirPath}`);
  } else {
    console.warn(`Directory not found: ${dirPath}`);
  }
});
