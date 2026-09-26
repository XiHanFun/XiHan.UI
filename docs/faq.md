# 常见问题

## 与 XiHan.BasicApp 的前端是什么关系

BasicApp 的前端构建于 XiHan.UI 之上：自 BasicApp v4.0.0 起，它的前端整体使用本库重建。了解组件库在真实业务中的用法，可以阅读 BasicApp 前端的源码。

BasicApp 的前端约定见[基础应用前端手册](https://basicapp.docs.xihanfun.com/frontend/introduction)。

## 共有多少个组件

135 个。每个组件同时有无头内核、Vue / React 组件、自定义元素与默认皮肤。[组件总览](./components/)按分类列出全部组件，每个组件一页。

## 组件的 props 在哪里查看

以 TypeScript 类型为准。`@xihan-ui/headless` 为每个组件导出 `XxxSchema`（含 `props`、`context`、`event` 等）与 `XxxApi`，编辑器可以直接跳转，注释也在类型上。

文档侧给出的是结构契约（解剖部件、必备部件、键盘表），这部分无法从类型中直接读出。两者配合查看。

## 可以不使用默认皮肤吗

可以，这是设计上支持的用法。组件只向 DOM 写入 `data-scope` / `data-part` / `data-state` 等属性，不依赖 `@xihan-ui/styles` 的任何规则。

只引入令牌自行编写皮肤，或连令牌一起移除，都可以。见[皮肤与样式分层](./guide/styling#完全自定义皮肤)。

## 是否支持 React / Svelte / Solid

目前提供 Vue、React 与 Web Components 三个适配器。

自定义元素在各框架中都可以直接使用（Light DOM，无 Shadow DOM 封装），这是通用路径。编写原生适配器需要三个部分：一份 `ReactiveRuntime`（五个接口）、一份 `NormalizeProps`、一层组件包装。`@xihan-ui/core/vanilla` 是这套契约的参考实现。

## 自定义元素为什么需要自行编写 HTML

因为它是 Light DOM 行为宿主，不是 Shadow DOM 组件。Shadow DOM 会封闭结构：无法更换标签、无法插入自定义节点、外部 CSS 无法进入、表单关联与跨边界 `aria-*` 引用都需要额外机制。本库的定位是行为可复用、外观完全由使用者决定。

代价是需要编写结构。缺少必备部件不会静默失败，诊断通道会明确报告。见 [Web Components 适配器](./adapters/web-components)。

## 切换品牌为什么没有效果

品牌轴需要注册后才会换色：`registerBrand(id, 种子色)` 注入该 id 的原语取值块，切换到该品牌才有视觉变化；不注册只会把 `data-brand` 写到 DOM 上。

明暗、对比度、密度、书写方向四条轴默认即有取值，切换即生效。见[设计令牌与主题](./guide/theme#八轴视觉环境运行时)。

## 皮肤中的某条样式未生效

先检查是否引用了不存在的令牌名。孤儿引用不报错也不降级，整条声明在计算值阶段静默失效。仓库中的 `check-token-refs` 门禁专门检查这一点。

其次检查层序：按组件引入样式时必须先引入 `@xihan-ui/styles/layers.css` 或 `@xihan-ui/tokens/tokens.css` 之一（两者都带完整层序声明），否则级联顺序会退化为引入顺序。

## 浮层位置整体偏移了一个滚动距离

坐标系不一致。状态机传给定位引擎的 `strategy`、`connect` 产出的内联 `position`、皮肤中 `positioner` 规则的 `position`，三处必须为同一个值。

`check-overlay-strategy` 门禁检查这三处，但只覆盖登记在名单中的浮层组件。见[浮层定位](./guide/position#两套坐标系)。

## 受控组件点击后没有反应

这是预期行为。受控时组件不会自行改变：它只发出变更意图（`value-change` / `open-change`），由使用者写回新值后才真正改变。

传入受控属性就必须处理变更事件并写回。只需要初值、不需要管理后续时，使用 `default*` 走非受控。

## 关闭浮层时退场动画未播完就消失

检查 `data-state` 的提交时机。适配器必须在 `data-state` 已提交到 DOM 之后才通知进出场原语：先改属性再让 CSS 过渡启动，顺序相反时动画不会播放。

使用现成组件时这一条已经接好；自行使用 `api` 渲染时需要注意。

## 生产环境看不到诊断信息

默认如此。生产环境诊断阈值是 `silent`，投递直接丢弃，不产生开销。

需要在生产环境收集时，显式调用 `setDiagnosticsLevel('error')` 并挂载自己的订阅。见[诊断通道](./guide/diagnostics)。

## 如何新增组件

四份产物一起新增，缺一份即未完成：

1. `packages/engine/headless/src/<name>/`：解剖、状态机、`connect`、键盘规格表、元数据；
2. `packages/adapters/vue/src/components/<name>/`：组件与组合式函数；
3. `packages/adapters/web-components/src/elements/<name>.ts`：自定义元素，并在 `define.ts` 注册；
4. `packages/design/styles/css/<name>.css`：皮肤，并在 `index.css` 引入。

然后补充一致性套件（`tooling/testing/src/suites/<name>.suite.ts`），运行 `pnpm test`、`pnpm test:browser`、`pnpm gate`、`pnpm boundaries`、`pnpm gate:cem`。

键盘规格表是先行确立的契约：用例通过 `covers` 反查行 id，缺一行即套件失败。

## 无障碍问题何时修复

没有承诺的时间表。当前状态记录在[无障碍与键盘规格](./guide/a11y#存量违规登记表)：共用表中 tag 一条、WC 侧 steps 一条，全局登记表为空，另有 breadcrumb 一条步骤重放豁免。

登记表有一条自净规则：一条都不再命中时判定登记过期，修复后必须从表中删除。

## 如何让 AI 正确编写本库的代码

模型没有见过这套契约，凭印象编写的代码多数是 React 生态的写法：给组件传 `class`、用 `color` 作为形态 prop、样式中写死颜色与时长。提供以下文件即可，它们由文档站构建期生成，与库同源：

| 地址 | 内容 |
| --- | --- |
| [`/llms.txt`](https://ui.docs.xihanfun.com/llms.txt) | 全站索引，每行一页 |
| [`/llms-components.txt`](https://ui.docs.xihanfun.com/llms-components.txt) | 全部组件参考页 |
| [`/llms-guide.txt`](https://ui.docs.xihanfun.com/llms-guide.txt) | 核心概念、适配器与运行时 |
| [`/llms-tokens.txt`](https://ui.docs.xihanfun.com/llms-tokens.txt) | 令牌全表：名称、类型、默认取值 |

只需要一页时，把地址后缀改为 `.md`：`https://ui.docs.xihanfun.com/components/button.md` 即按钮页，示例已内联为代码块。每页正文右上角的“取本页 Markdown”指向的也是它。

支持 Agent Skills 的工具可以直接读取仓库根的 `.agents/skills/`：[`component-design`](https://ui.docs.xihanfun.com/skills/component-design/SKILL.md) 负责设计与视觉，[`component-development`](https://ui.docs.xihanfun.com/skills/component-development/SKILL.md) 负责实现与仓库流程，[`framework-adapters`](https://ui.docs.xihanfun.com/skills/framework-adapters/SKILL.md) 负责三端接法。开发技能提供四个只读脚本；脚本严格读取当前检出，找不到仓库时直接报错，不使用已发布站点的内容代替本地事实。

## 其他问题

- 源码仓库：[GitHub](https://github.com/XiHanFun/XiHan.UI) · [Gitee](https://gitee.com/XiHanFun/XiHan.UI) · [GitCode](https://gitcode.com/XiHanFun/XiHan.UI)
- 文档站的组件示例覆盖全部 135 个组件，Vue、React 与自定义元素的写法并排，行为问题优先在那里复现
