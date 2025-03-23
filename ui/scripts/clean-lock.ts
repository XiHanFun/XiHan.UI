import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const LOCK_FILES: string[] = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock"];

/**
 * 删除指定目录下的锁文件
 * @param dir 目录路径
 */
function cleanLockFiles(dir: string): void {
  LOCK_FILES.forEach(lockFile => {
    const lockPath = path.join(dir, lockFile);
    if (fs.existsSync(lockPath)) {
      console.log(`Cleaning: ${lockPath}`);
      fs.unlinkSync(lockPath);
      console.log(`✓ Cleaned: ${lockPath}`);
    }
  });
}

/**
 * 清理所有锁文件
 */
function cleanAll(): void {
  try {
    // 清理根目录
    cleanLockFiles(rootDir);

    // 清理 packages 下的所有子目录
    const packagesDir = path.join(rootDir, "packages");
    if (fs.existsSync(packagesDir)) {
      const packages = fs.readdirSync(packagesDir);
      packages.forEach(pkg => {
        const pkgPath = path.join(packagesDir, pkg);
        if (fs.statSync(pkgPath).isDirectory()) {
          cleanLockFiles(pkgPath);
        }
      });
    }

    console.log("\n✨ All lock files have been cleaned successfully!");
  } catch (error) {
    console.error("\n❌ Error while cleaning lock files:", error);
    process.exit(1);
  }
}

cleanAll();
