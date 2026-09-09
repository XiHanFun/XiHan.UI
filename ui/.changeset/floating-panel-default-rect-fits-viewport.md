---
"@xihan-ui/headless": patch
---

**`floating-panel` 的内建默认矩形现在会夹进视口。** 此前 360×240 落在 (24,24)，右缘恒在 384：375 宽的视口上面板连同右侧那三个改尺把手一起落在屏外，指针够不着、方向键也看不见。

现在挂载时量一次视口，先按「四边各留 24」收尺寸、再把落点推回视口内——375×667 上落成 327×240 在 (24,24)，768 与 1280 两档逐值等于改动前。尺寸不会被收到 `FLOATING_PANEL_MIN_SIZE`（160×120）以下；视口比下限还窄时落点归 0，面板宁可溢出也不塌成一条谁也点不着的窄缝。量不到视口（服务端渲染）时整个夹取跳过。

写了 `defaultPosition` / `defaultDimensions` 就照写的来，视口不插手：那是明说的落位。没写 `defaultPosition` 时 Enter / Space 送回的落点同样按当前尺寸与视口夹一次——面板被拖出视口后靠这一键收回来，收回去的落点自己不能又在屏外。

公开面不动：夹取函数只在几何层内部用，`FLOATING_PANEL_DEFAULT_POSITION` / `FLOATING_PANEL_DEFAULT_SIZE` 两个常量仍是 (24,24) 与 360×240。

作者显式写的 `defaultPosition` / `defaultDimensions` 一律照写的来，那是明说的落位，视口不插手。

夹取只在挂载时量一次，之后转屏或改窗不重算：面板一旦被用户拖过，位置就归用户，运行期再自动搬会抢走操作。开着面板转屏仍会把它留在屏外，靠 Enter / Space 收回来——这一键的落点也改成按当前尺寸与视口夹一次，收回去的落点自己不能又在屏外。

取视口这一步走 `floatingPanelViewportFrom(scope)`：`scope.getWin()` 在没有 DOM 的一侧会抛（它的 `getRootNode` 兜底到裸 `document`），而 `context` 与 `connect` 在服务端直出时照样各跑一遍。这一处是被 SSR 一致性套件抓出来的——它先红了 8 条，说明那条判据是活的。
