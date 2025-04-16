import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const workspaceFile = path.join(rootDir, "pnpm-workspace.yaml");

/**
 * 更新YAML文件中的catalog部分而不影响其他部分
 * @param {string} filePath YAML文件路径
 * @param {boolean} dryRun 是否只预演不实际更新
 * @param {string[] | null} [packagesToUpdate] 要更新的包，不传则更新所有包
 */
function updateCatalogInYaml(filePath, dryRun, packagesToUpdate) {
  try {
    // 读取原始文件内容
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 工作区配置文件不存在: ${filePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    // 查找catalog部分
    let inCatalogSection = false;
    let catalogStartIndex = -1;
    const catalogLines = [];

    // 提取catalog部分内容
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "catalog:") {
        inCatalogSection = true;
        catalogStartIndex = i;
        continue;
      }

      if (inCatalogSection) {
        // 如果遇到下一个顶级配置或文件结束，说明catalog部分结束
        if (line.trim() === "" || (line.search(/\S/) === 0 && line.includes(":"))) {
          inCatalogSection = false;
          break;
        }

        // 收集catalog下的依赖项
        if (line.trim() !== "") {
          catalogLines.push(line);
        }
      }
    }

    if (catalogStartIndex === -1) {
      console.error("❌ 在工作区配置文件中未找到catalog部分");
      process.exit(1);
    }

    // 解析catalog依赖项
    const catalogDeps = {};
    catalogLines.forEach(line => {
      const parts = line.trim().split(":");
      if (parts.length === 2) {
        const pkgName = parts[0].trim();
        const version = parts[1].trim();
        catalogDeps[pkgName] = version;
      }
    });

    // 确定要更新的包
    const packagesToProcess = packagesToUpdate || Object.keys(catalogDeps);
    const updates = {};

    console.log("\n📦 依赖更新概览:");

    // 获取并更新版本
    for (const pkg of packagesToProcess) {
      if (catalogDeps[pkg]) {
        const oldVersion = catalogDeps[pkg];
        const newVersion = getLatestVersion(pkg);

        if (newVersion && oldVersion !== newVersion) {
          console.log(`${pkg}: ${oldVersion} → ${newVersion}`);
          updates[pkg] = { old: oldVersion, new: newVersion };

          if (!dryRun) {
            catalogDeps[pkg] = newVersion;
          }
        } else {
          console.log(`${pkg}: ${oldVersion} 已是最新版本`);
        }
      }
    }

    // 打印更新信息
    if (Object.keys(updates).length === 0) {
      console.log("✅ 所有依赖已是最新版本");
      return;
    } else {
      if (dryRun) {
        console.log("\n🔍 这是一次预演，未实际修改文件");
        return;
      }
    }

    // 重建catalog部分
    const newCatalogLines = ["catalog:"];
    Object.entries(catalogDeps).forEach(([pkg, version]) => {
      newCatalogLines.push(`  ${pkg}: ${version}`);
    });

    // 重建完整的文件内容
    const newLines = [...lines];
    // 删除原始catalog部分的所有行
    newLines.splice(catalogStartIndex, catalogLines.length + 1);
    // 插入新的catalog部分
    newLines.splice(catalogStartIndex, 0, ...newCatalogLines);

    // 写回文件
    fs.writeFileSync(filePath, newLines.join("\n"));
    console.log("\n✨ catalog 已成功更新，建议运行 pnpm install 使更改生效");
  } catch (error) {
    console.error("❌ 更新catalog时出错:", error);
    process.exit(1);
  }
}

/**
 * 从npm registry获取包的最新版本
 * @param {string} packageName 包名
 * @returns {string} 最新版本号
 */
function getLatestVersion(packageName) {
  try {
    const output = execSync(`npm view ${packageName} version`, { encoding: "utf8" });
    return output.trim();
  } catch (error) {
    console.error(`获取 ${packageName} 最新版本失败:`, error);
    return "";
  }
}

// 解析命令行参数
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-d");

// 显示使用说明
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
📦 更新 catalog 依赖工具

用法:
  node update-catalog.mjs [选项]

选项:
  --dry-run, -d    预演模式，不实际修改文件
  --help, -h       显示帮助信息

示例:
  node update-catalog.mjs
  node update-catalog.mjs --dry-run
  `);
  process.exit(0);
}

// 运行更新程序，不传入 packages 参数，这样会更新所有包
updateCatalogInYaml(workspaceFile, dryRun, null);
