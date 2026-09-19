# XiHan.UI 视图组件

XiHan.UI 是一套框架无关的组件库：状态机与无障碍逻辑位于无头内核，每个前端框架只有一层薄适配器。

当前提供 **134 个组件**，每个组件都有无头内核、Vue 组件、React 组件、自定义元素与默认皮肤。各层同源，行为由内核唯一定义，三个适配器负责接入各自的渲染与事件机制。

## 与常见组件库的区别

多数组件库把行为与某个框架的组件模型绑定在一起：更换框架需要整套重写，无障碍与键盘交互是重写中最容易丢失的部分。XiHan.UI 将这两层分离：

| 层 | 包 | 职责 |
| --- | --- | --- |
| 适配器 | `@xihan-ui/vue`、`@xihan-ui/react`、`@xihan-ui/web-components` | 将同一份属性和行为接到各自宿主 |
| 无头内核 | `@xihan-ui/headless` | 解剖、状态机与 `connect` |
| 原语 | `@xihan-ui/core`、`position`、`motion`、`pointer` | 运行时、定位、动效与指针会话 |
| 表现 | `@xihan-ui/tokens`、`@xihan-ui/styles` | 共享令牌与纯 CSS 皮肤 |

由此带来四条可验证的性质：

- 同一份行为，三种宿主。Vue、React 与自定义元素共享状态机和 `connect`；文档站提供对应框架示例，覆盖情况由示例门禁核对。
- 样式与逻辑解耦。皮肤只识别 `data-scope` / `data-part` / `data-*` 状态属性，不识别框架，也不识别类名。整体更换皮肤不需要修改 JS。
- 无障碍是判据。每个组件都有一份机读的键盘规格表（共 619 条），它同时是测试的分母：用例少覆盖一条即判套件失败。
- 依赖面收敛。全部库包的运行时第三方依赖只有一个（`@internationalized/date`，仅日期族使用）。定位、代码着色、Web Components 响应式基类均为自研。

## 从这里开始

| 目标 | 入口 |
| --- | --- |
| 了解整体架构 | [架构总览](./overview) |
| 接入现有项目 | [安装与接入](./installation) |
| 编写第一个组件 | [快速上手](./quickstart) |
| 查询组件的部件与键盘支持 | [组件总览](./components/) |
| 修改主题与皮肤 | [设计令牌与主题](./guide/theme)、[皮肤与样式分层](./guide/styling) |
| 使用 Vue / React / 原生自定义元素 | [Vue 适配器](./adapters/vue)、[React 适配器](./adapters/react)、[Web Components 适配器](./adapters/web-components) |
| 构建 AI 对话界面 | [AI 协议内核](./guide/ai) |

## 相关

- 源码仓库：[GitHub](https://github.com/XiHanFun/XiHan.UI) · [Gitee](https://gitee.com/XiHanFun/XiHan.UI) · [GitCode](https://gitcode.com/XiHanFun/XiHan.UI)
- 同生态的另外两个仓库：[XiHan.Framework 开发框架](https://framework.docs.xihanfun.com/)、[XiHan.BasicApp 基础应用](https://basicapp.docs.xihanfun.com/)

::: tip 与 XiHan.BasicApp 的关系
XiHan.BasicApp 的前端构建于 XiHan.UI 之上：自 BasicApp v4.0.0 起整体使用本库重建，是组件库在真实业务中的第一个大体量消费方。BasicApp 的前端约定见[基础应用前端手册](https://basicapp.docs.xihanfun.com/frontend/introduction)。
:::
