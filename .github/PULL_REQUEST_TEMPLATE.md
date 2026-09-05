<!-- 感谢贡献！提交前请阅读贡献指南，并完整填写以下内容。 -->

## 关联 Issue

<!-- 关联的 Issue，如 #123；无则填「无」 -->

## 变更类型

<!-- 勾选本次涉及的类型（可多选），并确保提交信息使用对应的约定式前缀 -->

- [ ] feat：新功能
- [ ] fix：缺陷修复
- [ ] refactor：重构（非新功能、非缺陷）
- [ ] perf：性能优化
- [ ] docs：文档
- [ ] style：格式（不影响逻辑）
- [ ] test：测试
- [ ] build：构建 / 依赖
- [ ] ci：持续集成
- [ ] chore：杂项
- [ ] revert：回滚

## 变更说明

<!-- 说明这次改动做了什么、为什么这样做 -->

## 影响范围

<!-- 包 / 领域：core / tokens / position / pointer / motion / code-highlight / markdown / chat-stream /
     backgrounds / animations / sound / headless / styles / vue / web-components / icons / tooling（构建工程）/ 文档 -->
<!-- 相关组件 / 包名：如 @xihan-ui/vue 的 XhButton -->

## 自测清单

- [ ] `pnpm build` 通过
- [ ] 类型检查（tsc）通过
- [ ] ESLint / Prettier 通过
- [ ] 单元 / 组件测试通过（Vitest）
- [ ] 已添加 changeset（如涉及版本发布）
- [ ] 未破坏现有组件 API / props / 事件 / 插槽 / 部件名（`data-part`）契约
- [ ] 如为破坏性变更，已在下方「破坏性变更」中说明

## 门禁看不住的改动

<!-- 下面四类改动没有脚本拦得住，全绿也不代表对，只能靠人读；本次都没涉及则填「无」 -->

- **改了 `tooling/scripts/state-vocabulary.json`**：逐条写明新增的族或取值是什么语义、
  现有的族为什么装不下它（同一族内取值互斥，塞进不该去的族会让皮肤同时命中两个状态），
  以及配对哪一个 ARIA 状态（确实没有可配对的就写「无」并说明为什么）。
- **动了 `tests/browser/__screenshots__` 下的基线 PNG**：写明改了哪几张、为什么该变。
  位图在 diff 里只显示「二进制文件已变」，`pnpm visual:baseline --update` 一把跑下去，
  真实的视觉回归会被连同预期改动一起洗成新基线。
- **改了 `BUILTIN_MOTION_NAMES` / `BUILTIN_SOUND_NAMES` 里的预设名**：按破坏性变更处理。
  公开面基线采集的是标识符，这两处的预设名是数组里的字符串字面量、不在采集范围内，
  改名后 `pnpm gate:surface` 照样绿，而使用者按名字取的预设会取空。
- **往某道门禁的例外表里加了条目**（各 `check-*.mjs` 的 `EXEMPT` / `ALLOWED` / `ALLOWLIST` /
  `HOOKS`，以及 `parity.spec.ts` 的 `EXCLUDED`）：逐条写明这一处为什么确实不归那道门禁管，
  并说明它是永久性结论、不是等以后再修的欠账。条目的键会不会过期由脚本自己核（登了却没被
  用到就报错），但理由那句话没有任何东西核得了——加一条就是让那道门禁在这一处不再判断，
  之后绿的是名单，不是代码。

## 破坏性变更

<!-- 如无请填「无」 -->

## 补充说明 / 截图

<!-- 相关截图、验证结果或其他上下文 -->
