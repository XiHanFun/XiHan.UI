---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

省略号能摊开了：折进去的那几页现在有路走到。

原先省略位是 `aria-hidden` + `pointer-events: none` 的死占位，而 `pages` 序列
只说「这里折了一段」，说不出折的是哪几页——那几页除了手打跳页输入框没有任何入口。

分页因此升级成浮层族，新增 `positioner` 与 `content` 两个部件：

```vue
<XhPaginationRoot v-slot="{ pageItems }" :count="2000" :page-size="10">
  <template v-for="item in pageItems">
    <XhPaginationEllipsis v-if="item.type === 'ellipsis'" :side="item.side" />
    <XhPaginationItem v-else :value="item.value">{{ item.value }}</XhPaginationItem>
  </template>
  <XhPaginationPositioner>
    <XhPaginationContent v-slot="{ pages }">
      <XhPaginationItem v-for="p in pages" :key="p" :value="p">{{ p }}</XhPaginationItem>
    </XhPaginationContent>
  </XhPaginationPositioner>
</XhPaginationRoot>
```

- 新增 `api.pageItems`：与 `pages` 同一串序列，但省略位带着被折叠的那几页。
  `pages` 由它派生，两者的窗口数学只有一份。旧的 `pages` 写法一行不用改。
- 悬停摊开（`openDelay` / `closeDelay`），**点一下也摊开**——纯悬停会把键盘用户挡在外面。
  Escape 与点外面都能收起（走消解层）。
- 至多两个省略位，用 `side`（`'start' | 'end'`）区分；同时只开一个，一份定位层就够。
  Web Components 侧由作者在节点上写 `side="end"`，与页码按钮自报 `value` 同一套写法。
- 浮层 portal 到统一落点，三视觉轴在 `positioner` 上重打一遍。

**破坏性**：`getEllipsisProps()` 改为收 `{ side }`；省略位从 `<span>` 变 `<button>`、
不再带 `aria-hidden`。
