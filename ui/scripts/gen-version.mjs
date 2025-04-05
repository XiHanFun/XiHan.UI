// gen-version.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.resolve(__dirname, "..", "package.json");
const { version } = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

/**
 * 更新指定目录下所有包的版本号
 * @param {string} directoryPath 目录路径
 */
function updatePackageVersions(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return;
  }

  const packages = fs
    .readdirSync(directoryPath)
    .filter(pkg => fs.statSync(path.join(directoryPath, pkg)).isDirectory());

  packages.forEach(pkg => {
    const pkgJsonPath = path.join(directoryPath, pkg, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
      pkgJson.version = version;
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
      console.log(`Updated version for ${pkg} to: ${version}`);
    }
  });
}

// 修改 packages 下所有 package.json 的 version
const packagesDir = path.resolve(__dirname, "..", "packages");
updatePackageVersions(packagesDir);

// 修改 internal 下所有 package.json 的 version
const internalDir = path.resolve(__dirname, "..", "internal");
updatePackageVersions(internalDir);

console.log(`✨ Updated version for all packages to: ${version}`);
