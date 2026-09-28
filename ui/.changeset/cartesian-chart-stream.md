---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

直角坐标图支持流式数据与时间轴跟随。

- 图表订阅列式数据仓：`append` / `setLast` / `shift` / `clear` 之后同一帧里的多次推送合成一次刷新（场景、画布、摘要与数据表一起换）；指针停在绘图区里时按原位置重新拾取，准线与提示框跟着指针下面换了的数据走；追加出乱序的时间戳时报 `chart.columns-unsorted`。
- 新增 `follow` / `defaultFollow`（缺省 true）/ `onFollowChange`：放大后窗口右端贴着数据末端时随新数据右移、宽度不变；用户把窗口拖离末端即停止跟随，拖回或写成 true 恢复（写 true 时一步跳到末端）。对象数组换数据时同样跟随。Vue `v-model:follow` 与 `follow-change`，React `follow` / `onFollowChange`，Web Components `follow` / `default-follow` 属性与 `follow-change` 事件。
- 放大后 Tab 进来，焦点落在窗口里的第一个数据上，不落在窗外。
- Web Components 的数据表按位置复用行与单元格、文字变了才写：流式刷新时读屏的浏览缓冲不被整个换掉。
