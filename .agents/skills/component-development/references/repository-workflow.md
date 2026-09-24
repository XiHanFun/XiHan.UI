# XiHan.UI 仓库工作流

仅在修改 XiHan.UI 仓库时读取。

## 1. 工作目录

- 仓库根：Git、AGENTS、skills 和跨目录检查。
- `ui/`：pnpm monorepo、包源码、测试、生成器和主门禁。
- `docs/`：VitePress 文档开发、lint 与生产构建。

仓库根没有 package.json，不要在根目录运行 pnpm 脚本。

## 2. 开始检查

```bash
git branch --show-current
git status --short
git log -5 --oneline
```

- 保存当前 HEAD 和已有改动范围。
- 用户改动与任务无关时不暂存、不格式化、不清理。
- 发现同文件已有改动时先读 diff，再做最小补丁。

## 3. 源码落点

| 内容 | 真源 |
| --- | --- |
| 跨组件行为 | `ui/packages/engine/core/src` |
| 组件行为 | `ui/packages/engine/headless/src/<component>` |
| Vue | `ui/packages/adapters/vue/src/components/<component>` |
| React | `ui/packages/adapters/react/src/components/<component>` |
| Web Components | `ui/packages/adapters/web-components/src/elements` |
| 设计令牌 | `ui/packages/design/tokens` |
| 共享皮肤 | `ui/packages/design/styles/css/<component>.css` |
| 三端一致性套件 | `ui/tooling/testing/src/suites` |
| 组件文档文案 | Headless 的 `<component>.doc.md` |
| 示例 | `docs/.vitepress/demos/<component>` |
| 总览预览 | `docs/.vitepress/catalog/<component>.vue` |
| 文档清单 | `ui/scripts/component-docs.manifest.json` |

生成文件必须由真源生成，不要直接修生成结果。

## 4. 实现顺序

### 4.1 行为改动

1. 修改 Core 公共原语或 Headless 组件契约。
2. 添加 Headless 单测。
3. 构建 Core，再构建 Headless。
4. 修改三端适配器。
5. 更新一致性套件和适配器专项测试。
6. 更新文档、示例、CEM 和公开面。

### 4.2 纯样式改动

1. 用浏览器或截图复现问题。
2. 在真实浏览器测试里写可观察失败断言。
3. 修改组件 CSS 或 Family Recipe 真源。
4. 重新生成组件令牌和无层 CSS。
5. 验证标准/compact、亮/暗和相关环境轴。

### 4.3 公开面改动

1. 删除或重命名时先全库搜索消费者。
2. 同步 Headless、三端导出、CEM、文档、示例、测试和公开面。
3. 不提供旧名称兼容层，除非用户明确要求。
4. 使用 major changeset。

## 5. 构建顺序

共享 dist 的消费者不得与构建并行：

```bash
cd ui
pnpm --filter @xihan-ui/core build
pnpm --filter @xihan-ui/headless build
pnpm --filter @xihan-ui/testing build
pnpm --filter @xihan-ui/vue build
pnpm --filter @xihan-ui/react build
pnpm --filter @xihan-ui/web-components build
```

只构建任务需要的包。需要完整依赖顺序时使用：

```bash
pnpm build
```

## 6. 生成物

按改动选择：

```bash
cd ui
pnpm --filter @xihan-ui/tokens gen
pnpm --filter @xihan-ui/styles gen
pnpm --filter @xihan-ui/web-components cem
pnpm gen:docs
pnpm surface:update
```

生成后检查 diff，确认只包含源改动必然产生的内容。门禁中的 `git diff --exit-code` 用于发现生成漂移；本地验证时先确认并暂存预期生成物，再运行相应 gate。

## 7. 测试选择

| 风险 | 最低验证 |
| --- | --- |
| Headless 纯函数 | 对应 `tests/<component>.spec.ts` |
| 状态机/生命周期 | Headless 单测 + 三端一致性 |
| Adapter 绑定/卸载 | 对应适配器专项 jsdom 测试 |
| 布局/计算样式 | Chromium browser test |
| Portal/焦点/动画结束 | Chromium browser test |
| 三端 DOM 一致性 | `@xihan-ui/testing` conformance/parity |
| 文档示例 | demo gate + VitePress 生产构建 |

浏览器用例按包运行，例如：

```bash
pnpm --filter @xihan-ui/vue exec vitest run tests/browser/<file>.spec.ts --config vitest.browser.config.ts
```

不要把 jsdom 的零尺寸布局或模拟 animationend 当作真实视觉证据。

## 8. 完成门禁

开发中改了哪一块，先跑对应模块（`pnpm gate skin visual`，`pnpm gate --list` 列出十个模块）；检查脚本在 `tooling/scripts/<模块>/` 下，模块清单是 `tooling/scripts/gate.modules.mjs`。

任务相关检查通过后，至少运行：

```bash
cd ui
pnpm gate
pnpm build
```

文档改变时再运行：

```bash
cd docs
pnpm build
```

如果全量命令暴露明确无关的既有失败，记录原命令和失败文件；不要为让本任务变绿而修改无关组件。

## 9. Changeset 与提交

- 发布包行为、样式或公开面变化必须添加 changeset。
- breaking 删除/改名使用 major；兼容新增通常 minor；缺陷修复通常 patch。
- 一个组件或一个共享配方一个提交。
- 提交消息使用 `<type>(<scope>): <中文说明>`。
- 提交前运行 `git diff --check`，确认未暂存用户无关文件。
- 不 push、不 publish，除非用户明确要求。
