// clean-lock.js
import fs from "fs";
import path from "path";

const filesToDelete = ["pnpm-lock.yaml", "package-lock.json"];

// 删除文件
filesToDelete.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
