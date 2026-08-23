# XiHan.UI 视图组件

XiHan.UI 是一套**框架无关**的组件库：状态机与无障碍逻辑沉在无头内核里，每个前端框架只得到一层薄适配器。

当前提供 **119 个组件**，每个组件同时产出四份东西——无头内核、Vue 组件、自定义元素、默认皮肤。四份同源，行为由内核唯一定义，适配器不重新实现任何逻辑。

::: warning 实验阶段
XiHan.UI 已发布到 npm，当前版本 `1.0.0-alpha.3`——这是预发布版本，不承诺语义化版本，接口仍会调整。无障碍扫描已经跑在真实 Chromium 上，首轮扫出的存量问题已经清完，登记表里只剩两条（共用表里 tag 的禁用态对比度、WC 侧 steps 的必需子节点），另有一条 breadcrumb 的步骤重放豁免。**请勿在生产环境依赖。**
:::

## 它和常见组件库有什么不一样

大多数组件库把「行为」和「某个框架的组件模型」焊在一起：换框架就得整套重写，而无障碍与键盘交互是最容易在重写中丢掉的部分。XiHan.UI 把这层拆开：

```
                    ┌──────────────┐  ┌──────────────┐
   适配器层          │ @xihan-ui/vue │  │ @xihan-ui/web-components │   ← 只做「把属性挂到宿主元素上」
                    └───────┬──────┘  └──────┬───────┘
                            └────────┬───────┘
                    ┌────────────────▼────────────────┐
   无头内核          │       @xihan-ui/headless        │   ← 解剖 + 状态机 + connect
                    └────────────────┬────────────────┘
              ┌──────────────┬───────┴───────┬──────────────┐
   原语层      │ kernel       │ machine       │ behavior     │ position
              └──────────────┴───────────────┴──────────────┘
                    ┌────────────────────────────────┐
   表现层            │ @xihan-ui/tokens  ·  styles     │   ← 令牌与皮肤，纯 CSS，与 JS 无关
                    └────────────────────────────────┘
```

由此带来四条可以直接兑现的性质：

- **同一份行为，两套宿主。** Vue 组件与自定义元素跑的是同一个状态机、同一份 `connect`。文档站每个组件页的示例两套写法并排，可以逐帧对照。
- **样式与逻辑解耦。** 皮肤只认 `data-scope` / `data-part` / `data-*` 状态属性，不认框架，也不认类名。整包换皮肤不用碰一行 JS。
- **无障碍是判据，不是口号。** 每个组件都有一份机读的**键盘规格表**（共 461 条），它同时是测试的分母：用例少覆盖一条即判套件失败。
- **依赖面收得很紧。** 全部库包的运行时第三方依赖只有一个（`@internationalized/date`，仅日期族使用）。定位、代码着色、Web Components 响应式基类都是自研。

## 从哪儿开始

| 你想做的事 | 去这里 |
| --- | --- |
| 先看清楚整体是怎么搭的 | [架构总览](./overview) |
| 把它接进现有项目 | [安装与接入](./installation) |
| 写出第一个能跑的组件 | [快速上手](./quickstart) |
| 查某个组件有哪些部件、支持哪些按键 | [组件总览](./components/) |
| 改主题、改皮肤 | [设计令牌与主题](./guide/theme)、[皮肤与样式分层](./guide/styling) |
| 用 Vue / 用原生自定义元素 | [Vue 适配器](./adapters/vue)、[Web Components 适配器](./adapters/web-components) |
| 做 AI 对话界面 | [AI 协议内核](./guide/ai) |

## 相关

- 源码仓库：[GitHub](https://github.com/XiHanFun/XiHan.UI) · [Gitee](https://gitee.com/XiHanFun/XiHan.UI) · [GitCode](https://gitcode.com/XiHanFun/XiHan.UI)
- 同生态的另外两个仓库：[XiHan.Framework 开发框架](https://framework.docs.xihanfun.com/)、[XiHan.BasicApp 基础应用](https://basicapp.docs.xihanfun.com/)

::: tip 与 XiHan.BasicApp 的关系
XiHan.BasicApp 的前端目前**不使用** XiHan.UI，它基于 Naive UI 构建。两者是独立演进的两条线，BasicApp 的前端约定请看[基础应用前端手册](https://basicapp.docs.xihanfun.com/frontend/introduction)。
:::
