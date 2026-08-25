---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

每页条数从只读 prop 升成真状态。

原先 `pageSize` 只是个 prop：组件读它算总页数，改档只能由宿主自己写回，
换档后当前页越界还得宿主自己夹。现在它住进 cell，与 `page` 同一套受控/非受控语义：

- `pageSize` 给定即受控——**与升级前一字不差**，现有写法一行不用改；
- 只给 `defaultPageSize` 则由组件自持；
- 新增 `pageSizeOptions`（缺省 `[10, 20, 50, 100]`，升序去重、每档至少 1）、
  `onPageSizeChange`、`api.setPageSize()`。

**换档时页码跟着换算，而不是夹取。** 10 条一页看到第 5 页（第 41 条起），换成 50 条一页时
夹取会给出第 2 页（第 51 条起）——刚在看的那条反而不见了。改为按改档前第一条换算，
给出第 1 页，第 41 条仍在页内。换算结果天然落在合法区间，不必再夹一次。

`onPageChange` 报出的 `pageSize` 现在取自当下的档位；非受控改档后它跟着变，
不再是 prop 上那个陈旧值。
