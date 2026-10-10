---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

图表进入视口才播入场：直角坐标图、漏斗图、关系图、层级图、饼图、雷达图、桑基图、迷你图与热力图新增 `animateInView`（Web Components 为 `animate-in-view`），缺省开启。

- 绘图区还没进入视口或页面在后台时，入场停在第一帧、时钟不走；露出第一像素时才起跑，只播一次，滚出再回来不重播
- 停着的时候标记照常在场，键盘仍能 Tab 进来；根上投影 `data-deferred`，描线、逐个出现的点与标签、环形中心与热力图的填色由样式暂停在起点
- 看不见时的数据变化直接落到终态，不再空转；打印前没播完的入场与过渡直接落到终态
- 视口观察全窗口共用一个交叉观察器，看板上的图再多也只有一份

要恢复挂载即播，写 `animateInView={false}`（Web Components 写 `animate-in-view="false"`）。
