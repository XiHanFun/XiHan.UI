# 动效

动效只做三件事：告诉你按到了、告诉你东西从哪来到哪去、告诉你什么在变。三档时长、一组语义缓动、一条按压时间线、三类浮层进出场——全部是令牌与共享关键帧，皮肤只引用，不自己发明。

## 时长与缓动

<XhTokenTable
  :names="['--xh-duration-fast', '--xh-duration-normal', '--xh-duration-slow']"
  :notes="{
    '--xh-duration-fast': '微反馈：换面、按下、退场',
    '--xh-duration-normal': '入场、释放、位移',
    '--xh-duration-slow': '大面积滑入：Drawer、Sheet',
  }"
/>

<XhTokenTable
  :names="['--xh-ease-standard', '--xh-ease-out', '--xh-ease-out-strong', '--xh-ease-out-fluid', '--xh-ease-in', '--xh-ease-in-out', '--xh-ease-out-back']"
  :notes="{
    '--xh-ease-standard': '连续变化：颜色、按下',
    '--xh-ease-out': '入场',
    '--xh-ease-out-strong': '强入场、释放回弹',
    '--xh-ease-out-fluid': '大面积滑入',
    '--xh-ease-in': '退场',
    '--xh-ease-in-out': '扫过：进度、指示条移动',
    '--xh-ease-out-back': '落定：拖动结束的轻微过冲',
  }"
/>

组件不直接取这两组原语，取语义层的 `--xh-motion-*`：

| 时长 | 值 | 用途 |
| --- | ---: | --- |
| `duration-micro` | 120ms | 状态换色：背景、描边、前景、阴影、透明度 |
| `duration-enter` / `duration-exit` | 200 / 120ms | 出现与消失：淡入淡出，以及只由幅度令牌驱动的小幅位移与缩放 |
| `duration-nudge` | 120ms | 紧跟操作的小幅几何变化：开关滑块、勾选标记、展开箭头、拖拽让位、查看器缩放平移 |
| `duration-move` | 200ms | 元素换位与尺寸变化：选中指示器、进度、堆叠重排、视口长高 |
| `duration-expand` / `duration-collapse` | 200 / 120ms | 内容展开与收起 |
| `duration-slide` | 320ms | 大尺度位移：抽屉、轮播换页 |
| `duration-press` / `duration-release` | 120 / 200ms | 按压时间线 |
| `stagger-step` | 40ms | 错开起播的步长 |

几何变化（位移、尺寸、缩放、旋转）不用 `micro / enter / exit`。缓动取 `ease-enter / enter-strong / exit / slide / sweep / press / release / settle / continuous / loop`；幅度取位移 `distance-sm / md`（4 / 8px）、整幅位移 `travel`（100%）、缩放 `scale-enter 0.96 / exit 0.98 / press 0.97 / drag 1.12`。CSS 串与 JS 侧 `@xihan-ui/motion` 的采样函数同一份来源，门禁 `check-motion-source` 比对。

## 按压触感

定尺的独立动作控件（按钮、把手、方框、星、日历格、色块、排序钮）投影 Action Control 配方，按下与释放走同一条时间线：

| 阶段 | 时长 | 结果 | 缓动 |
| --- | ---: | --- | --- |
| 按下 | 120ms（`--xh-motion-duration-press`） | scale 1 → 0.97，底进入 active | `--xh-motion-ease-press` |
| 释放 | 200ms（`--xh-motion-duration-release`） | scale 0.97 → 1，底回到 hover / rest | `--xh-motion-ease-release` |

- transform origin 固定居中；指针 `:active`、键盘 Space / Enter 与 Headless 投影的 `data-pressed` 三者一致。
- 行级条目与 disclosure trigger（菜单项、树节点、表格行、手风琴标题）只换面，不缩放整个条目；不允许零反馈。
- 不用点击波纹；不允许组件自设 0.94 / 0.96 / 0.98 等缩放。
- 业务事件不等动画结束：按下首帧先于异步 loading 可见；pending 后锁定重复操作，不持续缩放。
- hover + pressed 时 pressed 优先；focus-visible + pressed 保留焦点环、按压只改内部表面；selected / danger + pressed 保留各自身份，在其上派生 active 面。

## Disclosure

- Surface 级展开（Accordion、Collapsible、Reasoning、ToolCall）内容走 `grid-template-rows: 0fr → 1fr`：入场 `--xh-motion-duration-enter` + `--xh-motion-ease-enter-strong`，退场 `--xh-motion-duration-exit` + `--xh-motion-ease-exit`；指示器旋转与内容同档。
- 密集树形展开（Tree、TreeSelect、JsonViewer、SideNav 内联子层）不动高度，只旋转指示器 `--xh-motion-duration-micro`。

## 浮层进出场

按锚定关系三分，关键帧集中在 `family/motion.css`，皮肤不得重定义：

| 关系 | 关键帧 | 组件 |
| --- | --- | --- |
| 锚定列表 / 菜单 | `xh-overlay-slide-in / out` | Menu、Select、Combobox、Cascader、ContextMenu、Menubar、Mention、TreeSelect、Date / Time picker、Tooltip |
| 锚定面板 | `xh-overlay-pop-in` / `xh-pop-out` | Popover、HoverCard、Popconfirm、Tour、Command |
| 无锚定弹出 | `xh-pop-in / out` | NavigationMenu、SideNav popout、FloatingPanel、FloatButton 列表、Pagination 弹层 |

遮罩与全屏面 `xh-fade-in / out`；Dialog / Notification = 位移 md + `scale-enter`；Drawer 入场 `--xh-motion-duration-slide` + `--xh-motion-ease-slide`、退场 `--xh-motion-duration-exit` + `--xh-motion-ease-exit`。退场由 Presence 等动画真正结束再卸载节点。

## 弹簧与 JS 动画

指针跟手的东西（拖动、滑杆、轮播惯性）不用固定时长，用 `@xihan-ui/motion` 的弹簧：由刚度、阻尼与质量算终点，中途换目标不跳帧。`animate()` 默认取 `durations.normal`，`@xihan-ui/animations` 的配方默认取 `durations.slow`。见 [动效原语](/guide/motion) 与 [动画层](/guide/animations)。

## 减弱动效

`data-motion="reduce"`（偏好 `system` 时跟 `prefers-reduced-motion`）去掉位移、保留淡变：位移、缩放、旋转与尺寸变化瞬时完成（`move` / `nudge` / `expand` / `collapse` / `slide` / `press` / `release` 为 1ms，幅度令牌归零），换色与出现的淡变保留为 120ms（`micro` / `enter` / `exit`）。按下仍然换底、浮层仍然淡入，只是不再滑动与缩放；浮层退场在减弱动效下直接移除。`data-motion="default"` 恢复完整动效：系统要求减弱、而产品设置或某个局部容器选择完整动效时，该子树的令牌回到基线取值。两者可以嵌套，最近的一层生效。JS 侧经 `resolveMotionPreference` 读同一个值——退场租约、贴底滚动、数字动画、加载弧线、背景层全部走这一条通道，产品自己的"减弱动效"设置用 `setMotionOverride` 一处设置、处处生效。

## 相关

- [阴影与材质](/design/shadow) · [组件家族与模式](/design/patterns)
- 指南：[动效原语](/guide/motion) · [动画层](/guide/animations) · [设计令牌与主题 · 点击触感](/guide/theme#点击触感)
