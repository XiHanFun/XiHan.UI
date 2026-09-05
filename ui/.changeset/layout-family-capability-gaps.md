---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
"@xihan-ui/tokens": minor
---

**新增**布局与滚动族的能力补齐（滚动区的边缘渐隐单独一份变更集）。全部是加法，缺省档逐值等于改动前。

**拖动能撤销了**。`splitter` 新增 `DRAG.CANCEL` 事件，拖动态在文档上听 Escape：按下即把布局退回按下那一刻的快照，`onSizesChangeEnd` 不发。`resizable` 的 `resizing` 态挂同一条通路，Escape 走既有的 `RESIZE.CANCEL`，尺寸与位移一起退回。两条键盘表各多一行 `cancel`。此前拖过头只能再拖回去猜原值，而错值已经发出去了。

**骨架有名字了**。`splitter` 立 `SplitterTranslations { root, resizeTrigger(index, total) }`，根与每条分隔条从此各带一个 `aria-label`（兜底 `Split panels` / `Resize panel N`）。多条分隔条对读屏不再是一串同名盒子。Vue 侧接 `withXhConfig('splitter')`，Web Components 侧收 `translations` property。

**拖动排序看得见落点**。`sortable` 新增 `drop-indicator` 部件：拾起时机器记下容器原点，连接层按当前落点算出那条缝并写进内联 `transform`，落点回到起点即 `hidden`。竖排画横线、横排与换行网格画竖线。换行网格里两个方向的项都在动，此前看不出会落到哪一格。同批把 `item-drag-trigger` 的禁用从 `aria-disabled` 改为**同时**发 `data-disabled`（`aria-disabled` 原样保留），全局 `[data-disabled]` 规则从此命中得到它。

**侧栏会自己收了**。`layout` 新增 `siderBreakpoint`（`sm` / `md` / `lg` / `xl`，落根上的 `data-sider-breakpoint`）：没达到那一档时侧栏按折叠宽显示；同时发 `onSiderBreakpoint({ matched })`，宿主据此换成抽屉。断点像素值现读 `--xh-breakpoint-<档>` 令牌，JS 里不另抄一份。

**栅格接得住真实版面**。`grid` 新增 `rows`（显式行轨道）、`minColWidth`（四档，走新令牌 `--xh-layout-col-min-xs|sm|md|lg`，皮肤改用 `repeat(auto-fill, minmax(…, 1fr))`，从此做得了「卡片最小 N，放得下几列就几列」）、`rowGap` / `columnGap`（排在 `gap` 档位之后取胜）。`span` 与 `offset` 另外收断点对象：

```vue
<XhGridRoot :cols="{ base: 1, md: 2, lg: 3 }">
  <XhGridItem :span="{ base: 1, lg: 2 }">…</XhGridItem>
</XhGridRoot>
```

窄屏收成一列时 `span=6` 那一格不再溢出。两个适配器都收 JSON 串写法。

**未做**：拖起态的观感调整、分隔条的抓手字形、瀑布流的换档动效——三条都是视觉/动效条目，且后者依赖「列与项交给作者持有」那次结构变更。
