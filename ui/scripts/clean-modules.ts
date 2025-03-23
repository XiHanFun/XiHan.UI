import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

/**
 * 删除指定目录下的 node_modules
 * @param {string} dir 目录路径
 */
function cleanNodeModules(dir: string): void {
  const nodeModulesPath = path.join(dir, "node_modules");
  if (fs.existsSync(nodeModulesPath)) {
    console.log(`Cleaning: ${nodeModulesPath}`);
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log(`✓ Cleaned: ${nodeModulesPath}`);
  }
}

/**
 * 清理所有 node_modules
 */
function cleanAll(): void {
  try {
    // 清理根目录
    cleanNodeModules(rootDir);

    // 清理 packages 下的所有子目录
    const packagesDir = path.join(rootDir, "packages");
    if (fs.existsSync(packagesDir)) {
      const packages = fs.readdirSync(packagesDir);
      packages.forEach(pkg => {
        const pkgPath = path.join(packagesDir, pkg);
        if (fs.statSync(pkgPath).isDirectory()) {
          cleanNodeModules(pkgPath);
        }
      });
    }

    console.log("\n✨ All node_modules have been cleaned successfully!");
  } catch (error) {
    console.error("\n❌ Error while cleaning node_modules:", error);
    process.exit(1);
  }
}

function cleanPlayground(): void {
  try {
    // 清理根目录
    const playgroundDir = path.join(rootDir, "playground");
    cleanNodeModules(playgroundDir);

    console.log("\n✨ playground node_modules have been cleaned successfully!");
  } catch (error) {
    console.error("\n❌ Error while cleaning node_modules:", error);
    process.exit(1);
  }
}

cleanAll();
cleanPlayground();
