import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.resolve(__dirname, "..", "package.json");
const { version } = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

// 修改 packages 下所有 package.json 的 version
const packagesDir = path.resolve(__dirname, "..", "packages");
const packages = fs.readdirSync(packagesDir).filter(pkg => fs.statSync(path.join(packagesDir, pkg)).isDirectory());

packages.forEach(pkg => {
  const pkgPath = path.join(packagesDir, pkg, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkgJson.version = version;
    fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + "\n");
  }
});

// 修改 internal 下所有 package.json 的 version
const internalDir = path.resolve(__dirname, "..", "internal");
const internal = fs.readdirSync(internalDir).filter(pkg => fs.statSync(path.join(internalDir, pkg)).isDirectory());

internal.forEach(pkg => {
  const pkgPath = path.join(internalDir, pkg, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkgJson.version = version;
    fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + "\n");
  }
});

console.log(`✨ Updated version for all packages to: ${version}`);
