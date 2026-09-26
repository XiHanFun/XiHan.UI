---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

图表播放过渡动画：直角坐标图首次出现时柱沿数值轴从基线长出、折线从头描到尾、面积与点淡入，多个系列按图例次序错开；饼图整圈从起始角顺着扫开，标签与引导线随之淡入。之后的数据变化与图例切换从当前位置插值到新位置：留下的柱原地伸缩、扇区角度随之变化，新增的从基线长出，隐藏的收回基线并淡出后才移除；坐标轴刻度按值对齐，两边都有的刻度滑到新位置，其余淡入淡出。

新增 `animated` 属性（缺省 true），false 时直接画终态，Web Components 写 `animated="false"`。时长与曲线取动效令牌，在图或它的容器上改写 `--xh-motion-duration-move` 即可调快慢；系统减弱动效或容器写 `data-motion="reduce"` 时几何直接到位，只保留淡入淡出。视口尺寸变化与字体加载后的重排不播过渡。收场中的标记不进可访问树、不可聚焦。

共享关键帧新增 `xh-draw`（数据关系组），描线期间折线带 `data-drawing` 与 `pathLength="1"`。
