# 常见问题

## 现在能用吗

不能用于生产。库包已发布到 npm，当前版本 `1.0.0-alpha.2`——这是预发布版本，不承诺语义化版本，接口还会变。无障碍存量违规还剩两条登记在案（共用表里 tag 的禁用态对比度、WC 侧 steps 的必需子节点），另有一条 breadcrumb 的步骤重放豁免。

能做的是：从 npm 装一份试用、克隆仓库把文档站跑起来看行为、读源码。见[安装与接入](./installation)。

## `npm install` 能装到哪些包

17 个公开包都在 npm 上，`latest` 与 `alpha` 两个 dist-tag 都指向 `1.0.0-alpha.2`。发布走 changesets，全部库包同属一个 fixed 版本组，一起升到同一版本号，所以内部依赖区间总是对齐的。

## 和 XiHan.BasicApp 的前端是什么关系

**没有依赖关系。** BasicApp 的前端基于 Naive UI 构建，不使用 XiHan.UI。两者是独立演进的两条线。

BasicApp 的前端约定请看[基础应用前端手册](https://basicapp.docs.xihanfun.com/frontend/introduction)。

## 到底有多少个组件

**119 个**。每个组件同时有无头内核、Vue 组件、自定义元素与默认皮肤四份产物，本文档的[组件总览](./components/)按分类列全，每个组件一页。

## 组件的 props 有哪些？文档里怎么没有

以 TypeScript 类型为准。`@xihan-ui/headless` 为每个组件导出 `XxxSchema`（含 `props`、`context`、`event` 等）与 `XxxApi`，编辑器里能直接跳转，注释也在类型上。

文档侧给出的是**结构契约**（解剖部件、必备部件、键盘表），这部分类型里读不出来，或者读起来很费劲。两边配合看。

## 能不用默认皮肤吗

能，而且是设计上就支持的。组件只往 DOM 上打 `data-scope` / `data-part` / `data-state` 等属性，不依赖 `@xihan-ui/styles` 的任何一行。

只引令牌自己写皮肤，或者连令牌一起丢，都行。见[皮肤与样式分层](./guide/styling#完全自己写皮肤)。

## 支持 React / Svelte / Solid 吗

目前只有 Vue 与 Web Components 两个适配器。

自定义元素在这些框架里都能直接用（Light DOM，无 Shadow DOM 封装），这是当前的通用路径。要写原生适配器的话需要三样东西：一份 `ReactiveRuntime`（五个口子）、一份 `NormalizeProps`、一层组件包装。`@xihan-ui/machine/vanilla` 是这套契约的参考实现。

## 为什么自定义元素要我自己写 HTML

因为它是 Light-DOM 行为宿主，不是 Shadow DOM 组件。Shadow DOM 会把结构封起来：改不了标签、插不进自己的节点、外部 CSS 进不去、表单关联与跨边界 `aria-*` 引用都要额外机制。这套库的定位是「行为可复用、外观完全由你定」。

代价就是你得写结构。漏写必备部件不会静默失败——诊断通道会明确报出来。见 [Web Components 适配器](./adapters/web-components)。

## 切换密度 / 高对比度 / 品牌为什么没效果

主题运行时对五个维度一视同仁地写属性，但令牌产物**目前只对 `data-theme` 的明暗两值给出了不同取值**。`data-density='compact'`、`data-contrast='more'`、`data-brand` 三个属性会被写到 DOM 上，令牌层还没有对应的取值块。

这三条轴是预留的接入点，接法已经确定，但还没落地。见[设计令牌与主题](./guide/theme#五个维度当前的落地程度)。

## 皮肤里的某条样式没生效

先查是不是引用了不存在的令牌名。孤儿引用不报错也不降级——整条声明在计算值阶段静默失效，CSS 不会告诉任何人。仓库里的 `check-token-refs` 门禁专门查这个。

其次查层序：按组件挑样式时必须先引 `@xihan-ui/styles/layers.css` 或 `@xihan-ui/tokens/tokens.css` 之一（两者都带完整层序声明），否则级联顺序就变成了引入顺序。

## 浮层位置整体偏了一个滚动距离

坐标系不一致。机器传给定位引擎的 `strategy`、`connect` 产出的内联 `position`、皮肤里 `positioner` 规则的 `position`——三处必须写同一个值。

`check-overlay-strategy` 门禁盯着这三处，但只覆盖登记在名单里的浮层组件。见[浮层定位](./guide/position#两套坐标系)。

## 受控组件点了没反应

这是预期行为。受控时组件**永远不会自己动**：它只发出变更意图（`value-change` / `open-change`），等你把新值写回来才真的改。

传了受控属性就必须接住变更事件并写回。只想要初值不想管后续，用 `default*` 走非受控。

## 关闭浮层时退场动画没播完就消失了

检查 `data-state` 的提交时机。适配器必须在 `data-state` **已提交到 DOM 之后**才通知进出场原语——先改属性再让 CSS 过渡起跑，顺序反了动画不会播。

用现成组件的话这条已经接好了，自己拿 `api` 渲染时要注意。

## 诊断信息在生产环境看不到

默认如此。生产环境诊断阈值是 `silent`，投递直接丢弃，不产生开销。

要在生产收集，显式 `setDiagnosticsLevel('error')` 并挂自己的订阅。见[诊断通道](./guide/diagnostics)。

## 怎么加一个新组件

四份产物一起加，缺一份就是没加完：

1. `packages/engine/headless/src/<name>/`——解剖、状态机、`connect`、键盘规格表、元数据；
2. `packages/adapters/vue/src/components/<name>/`——组件与组合式函数；
3. `packages/adapters/web-components/src/elements/<name>.ts`——自定义元素，并在 `define.ts` 注册；
4. `packages/design/styles/css/<name>.css`——皮肤，并在 `index.css` 引入。

然后补一致性套件（`tooling/testing/src/suites/<name>.suite.ts`），跑 `pnpm test`、`pnpm test:browser`、`pnpm gate`、`pnpm boundaries`、`pnpm gate:cem`。

键盘规格表是先立的契约：**用例通过 `covers` 反查行 id，缺一行即套件失败**。

## 无障碍问题什么时候能修完

没有承诺的时间表。当前状态诚实记录在[无障碍与键盘规格](./guide/a11y#存量违规登记表)：共用表里 tag 一条、WC 侧 steps 一条，全局登记表为空，另有 breadcrumb 一条步骤重放豁免。

登记表有一条自净规则：一条都不再命中时判登记过期，修好了必须从表里删掉。

## 还有别的问题

- 源码仓库：[GitHub](https://github.com/XiHanFun/XiHan.UI) · [Gitee](https://gitee.com/XiHanFun/XiHan.UI) · [GitCode](https://gitcode.com/XiHanFun/XiHan.UI)
- 文档站的组件示例覆盖全部 119 个组件，且 Vue 与自定义元素两套写法并排，行为问题优先在那里复现
