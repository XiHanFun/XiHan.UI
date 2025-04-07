import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

/**
 * 删除指定目录下的 dist
 * @param {string} dir 目录路径
 */
function cleanDist(dir) {
  const distPath = path.join(dir, "dist");
  if (fs.existsSync(distPath)) {
    console.log(`Cleaning: ${distPath}`);
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log(`✓ Cleaned: ${distPath}`);
  }
}

/**
 * 清理所有 dist 目录
 */
function cleanAll() {
  try {
    // 清理根目录
    cleanDist(rootDir);

    // 清理 packages 下的所有子目录
    const packagesDir = path.join(rootDir, "packages");
    if (fs.existsSync(packagesDir)) {
      const packages = fs.readdirSync(packagesDir);
      packages.forEach(pkg => {
        const pkgPath = path.join(packagesDir, pkg);
        if (fs.statSync(pkgPath).isDirectory()) {
          cleanDist(pkgPath);
        }
      });
    }

    console.log("\n✨ All dist directories have been cleaned successfully!");
  } catch (error) {
    console.error("\n❌ Error while cleaning dist directories:", error);
    process.exit(1);
  }
}

cleanAll();
