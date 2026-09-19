---
'@xihan-ui/headless': major
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Breadcrumb 链接接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
面包屑此前没有状态机，按 button 的先例补最小机器 `breadcrumbMachine`（state `idle`，context `pressedValue`
按链接 value 记，事件 `PRESS.START { value, current }` / `PRESS.END { value }`，守卫 `canPress` 把当前页那条
挡在外面——它带 `aria-current` 与 `aria-disabled`，是不可点的终点）。

**破坏性：`connectBreadcrumb` 第一参由 props 改为 `Service<BreadcrumbSchema>`**，与其余跑机器的组件同构；
`BreadcrumbProps` 仍导出（= `BreadcrumbSchema['props']`），新增导出 `breadcrumbMachine` 与 `BreadcrumbSchema`。
`BreadcrumbLinkProps` 新增必填的 `value`（链接身份，按压通道按它记）。直接调用 headless 的使用者需改为先建机器。

三端：Vue / React / Web Components 的 Breadcrumb 改跑 `breadcrumbMachine`（公开 props 不变）；Link 部件新增可选
`value`（Vue / React prop、WC 的 `value` 属性），未声明时由适配器派生一个实例内稳定的键，只作按压通道的键、不写回 DOM；
按 collection 铺开时取节点的 value。键盘表新增 `breadcrumb.kbd.press`。
