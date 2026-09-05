---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**侧栏能盖上来了**。`layout` 新增 `siderPresentation`（`inline` / `sheet`）：覆盖档下侧栏移出画外，展开时盖在内容之上并铺一层遮罩，侧栏那一列于是收成零宽、内容占满整宽。缺省仍是 `inline`，不写这个 prop 的骨架逐值等于改动前。

与已有的 `siderBreakpoint` 配着写就是「宽屏占一列、窄屏覆盖」：覆盖档只在未达那一档时成立，宽屏落回占位档；跨档时侧栏跟着开合（进覆盖档收起、免得一挂上来就盖住内容，回占位档展开），走的仍是 `siderCollapsed` 那条通道，受控宿主照常收到 `onSiderCollapsedChange`。解析后的档位落在根的 `data-sider-presentation` 与侧栏的 `data-presentation` 上，`api.siderPresentation` 读得到同一个值。

```vue
<XhLayoutRoot sider-breakpoint="md" sider-presentation="sheet">
  <XhLayoutHeader><XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger></XhLayoutHeader>
  <XhLayoutSiderBackdrop />
  <XhLayoutSider>…</XhLayoutSider>
  <XhLayoutContent>…</XhLayoutContent>
</XhLayoutRoot>
```

**新增 `sider-backdrop` 部件**（Vue 侧 `XhLayoutSiderBackdrop`，Web Components 侧同名 part）：点它收起侧栏；占位档下带 `hidden`，不占位也不吃指针。它与面板同一个层号，渲染时排在 `sider` 之前——谁盖谁由文档序决定。

**键盘表多一行**：覆盖档下 Escape 收起侧栏（`layout.kbd.dismiss-sider-sheet`）。覆盖档不锁焦点、不把背后的内容标成惰性——它是骨架里的一段，不是模态浮层；要模态用 `drawer`。

皮肤侧：面板贴死视口那条边、按自身宽度的百分比推出画外，位移与 `visibility` 同拍走 `--xh-motion-duration-slide` / `--xh-motion-ease-slide`；贴边的四条内衬与安全区取大的一头。新增使用者槽 `--xh-layout-sider-layer` / `--xh-layout-sider-shadow` / `--xh-layout-sider-backdrop-layer` / `--xh-layout-sider-backdrop-bg`。`layout.css` 的体积基线因这一档从 5742 涨到 7844 字节。
