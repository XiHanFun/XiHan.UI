# 动效

动效只做四件事：确认操作、交代去向、提示进行中与变化，以及在极少数情况下引导注意。全库动效归为下面的角色，组件只选择角色，不自定时长、缓动与幅度；时长、曲线与幅度全部是令牌，关键帧集中在 `family/motion.css`，皮肤只引用。

## 角色

| 角色 | 用途 | 可动属性 | 时长 / 缓动 | 减弱动效 |
| --- | --- | --- | --- | --- |
| 按压 | 确认按下 | `scale` + 换面 | `press` / `press`，`release` / `release` | 只换面 |
| 状态 | hover、选中、焦点、校验的换色 | 颜色、描边色、阴影、`opacity` | `micro` / `enter` | 保留淡变 |
| 切换 | 开关滑块、单选圆点、勾选标记 | `translate`、`scale` | `nudge` / `continuous`；短边不超过 32px 的缩放可用 `settle` | 瞬时 |
| 指示 | 选中指示器在项之间移动 | `translate`；尺寸为登记例外 | `move` / `continuous` | 瞬时 |
| 披露 | 内容展开收起 | `grid-template-rows` | `expand` / `enter-strong`；`collapse` / `exit` | 瞬时 |
| 出现 | 挂载与卸载 | `opacity`、小幅 `translate` / `scale` | `enter` / `enter` 或 `enter-strong`；`exit` / `exit` | 淡变 |
| 列表 | 加入、移除、重排、错开 | 同出现；重排用 `translate` | 同出现；重排 `move` / `continuous` | 淡变，无错开 |
| 导航 | 抽屉、侧栏、走马灯、标签带滚动、平滑滚动 | `translate`、滚动位置 | 进 `slide` / `slide`；出 `exit` / `exit` | 抽屉类淡变，其余瞬时 |
| 数值 | 进度、计数、倒计时 | `translate`、`clip-path`、文本 | `move` / `continuous` | 瞬时；倒计时按秒分段 |
| 手势 | 拖拽跟手、松手归位、快甩、越界回弹 | `translate`、`scale` | 跟手无过渡；松手用弹簧并交接松手速度 | 瞬时归位 |
| 循环 | 转圈、微光、光标、不定进度、呼吸 | `rotate`、`background-position`、`opacity`、`translate` | 循环周期 / `loop` | 停止并显示静态替代 |
| 注意 | 抖动、脉冲强调 | — | 只在 [`@xihan-ui/animations`](/guide/animations) 中使用：`attention` | 不播放 |
| 数据 | 图表入场、更新、退出 | 几何参数、`scale`、`stroke-dashoffset`、`opacity` | `move` / `continuous`；淡入 `enter` | 几何瞬时，淡变保留 |
| 氛围 | 动态背景、跑马灯 | 着色器时间轴、`translate` | 由速度决定 | 冻结或停止 |

表中时长省略前缀 `--xh-motion-duration-`，缓动省略前缀 `--xh-motion-ease-`。

- 带位移、缩放、旋转或尺寸变化的动画不用 `micro`、`enter`、`exit` 三支时长：这三支在减弱动效下保留为淡变。例外是进出场（出现、列表加入与移除、整幅滑出）：其中的位移与缩放只取幅度令牌，减弱动效下归零，剩下的只有淡变，所以照常取 `enter` / `exit`。
- `move` 与 `nudge` 的分界：跨位置的换位与尺寸变化（指示器滑移、进度增长、堆叠重排、视口长高）取 `move`；原地的小幅几何变化（滑块、勾选标记、展开箭头、拇指缩放）与跟手的让位、查看器缩放平移取 `nudge`。

## 令牌

### 时长

| 令牌 | 取值 | 减弱动效 | 角色 |
| --- | ---: | ---: | --- |
| `--xh-motion-duration-micro` | 120ms | 120ms | 状态 |
| `--xh-motion-duration-enter` | 200ms | 120ms | 出现、列表加入 |
| `--xh-motion-duration-exit` | 120ms | 120ms | 出现、列表移除、导航出 |
| `--xh-motion-duration-move` | 200ms | 1ms | 指示、列表重排、数值、数据 |
| `--xh-motion-duration-expand` | 200ms | 1ms | 披露展开 |
| `--xh-motion-duration-collapse` | 120ms | 1ms | 披露收起 |
| `--xh-motion-duration-slide` | 320ms | 1ms | 导航进 |
| `--xh-motion-duration-nudge` | 120ms | 1ms | 切换、跟手让位 |
| `--xh-motion-duration-press` / `-release` | 120 / 200ms | 1ms | 按压 |
| `--xh-motion-duration-attention` | 640ms | 1ms（预设不播） | 注意 |
| `--xh-motion-stagger-step` | 40ms | 0ms | 错开步长 |

几何类在减弱动效下取 1ms 而不是 0：动画名照常变化、`animationend` 照常派发，进出场的时序不分叉。

循环周期不降级，减弱动效下由皮肤停掉动画、换成静态替代：

<XhTokenTable
  :names="['--xh-motion-loop-spin', '--xh-motion-loop-caret', '--xh-motion-loop-shimmer', '--xh-motion-loop-breathe']"
  :notes="{
    '--xh-motion-loop-spin': '旋转指示器转一圈',
    '--xh-motion-loop-caret': '文本光标闪一次',
    '--xh-motion-loop-shimmer': '骨架屏与在跑文字的微光扫过一遍',
    '--xh-motion-loop-breathe': '进行中状态点的一次呼吸',
  }"
/>

### 缓动

| 令牌 | 原语 | 用途 |
| --- | --- | --- |
| `--xh-motion-ease-continuous` | `standard` | 在屏内被推到新位置：指示器、重排、数值 |
| `--xh-motion-ease-loop` | `linear` | 匀速的无限循环 |
| `--xh-motion-ease-enter` | `out` | 淡入与换色 |
| `--xh-motion-ease-enter-strong` | `out-strong` | 带位移的入场、展开、原地形变 |
| `--xh-motion-ease-exit` | `in` | 退场、收起 |
| `--xh-motion-ease-slide` | `out-fluid` | 整幅位移：抽屉推入、轮播换页 |
| `--xh-motion-ease-sweep` | `in-out` | 往返型循环的折返 |
| `--xh-motion-ease-press` / `-release` | `standard` / `out-strong` | 按压时间线 |
| `--xh-motion-ease-settle` | `out-back` | 短边不超过 32px 的小件过冲落位 |
| `--xh-motion-ease-breathe` | `sine-in-out` | 呼吸 |
| `--xh-motion-ease-emphasis` | `emphasized` | `@xihan-ui/animations` 的表现性进场，组件皮肤不用 |

缓动不降级：曲线形状不引起前庭不适，减弱动效靠时长与幅度收敛。原语：

<XhTokenTable
  :names="['--xh-ease-standard', '--xh-ease-in', '--xh-ease-out', '--xh-ease-out-strong', '--xh-ease-out-fluid', '--xh-ease-in-out', '--xh-ease-out-back', '--xh-ease-sine-in-out', '--xh-ease-emphasized']"
/>

### 幅度

| 令牌 | 取值 | 减弱动效 | 用途 |
| --- | ---: | ---: | --- |
| `--xh-motion-distance-sm` / `-md` | 4 / 8px | 0 | 浮层滑入、面板与列表条目入场 |
| `--xh-motion-distance-lg` | 16px | 0 | `@xihan-ui/animations` 的表现性进场 |
| `--xh-motion-travel` | 100% | 0 | 整幅位移：抽屉、轻提示 |
| `--xh-motion-travel-opacity` | 1 | 0 | 整幅位移两端的不透明度：减弱动效下位移归零，改由淡变表达 |
| `--xh-motion-scale-enter` / `-exit` | 0.96 / 0.98 | 1 | 出现 |
| `--xh-motion-scale-press` | 0.97 | 1 | 按压 |
| `--xh-motion-scale-drag` | 1.12 | 1 | 拖起 |
| `--xh-motion-scale-stack` | 0.95 | 1 | 轻提示叠放每往后一层的收拢比例 |
| `--xh-motion-scale-squash` | 0.86 | 1 | liquid 档指示器拉长时另一向的压扁下限 |
| `--xh-motion-scale-breathe` / `-halo` | 0.82 / 2.6 | 1 | 呼吸的吸气最小值与光环外扩 |

组件不自设缩放与位移的字面量。JS 侧 `@xihan-ui/motion` 的 `motionDurations`、`motionEasings`、`motionDistances`、`motionStaggerStep` 与弹簧预设和令牌逐条对账（门禁 `check-motion-source`）；读得到计算样式时以 `readMotion(el)` 为准，作者对组件槽的覆盖与容器上的 `data-motion` 同时生效。

## 编排

- **进出不对称**：进场比退场长一档（`enter` 200ms、`exit` 120ms），进场减速、退场加速；退场是让路。
- **方向**：从哪来回哪去——锚定浮层从锚点一侧滑出，抽屉从所在边推入，轻提示从视口边缘进出；RTL 下横向位移随书写方向翻转。
- **错开**：只对同一批到达的条目按到达顺序计数，步长 `--xh-motion-stagger-step`，最多 5 步，后面的与第 5 步同时出现；不按 DOM 位置（`nth-child`）计数。每次都是同一批一起露面的（浮动按钮列表、级联列、问答选项）位次就是到达顺序。
- **分层**：遮罩与面板同时开始、同时退场，在最长的那个结束后卸载；面板内列表的错开从面板进场开始计时。
- **首帧不播进场**：初始渲染时已存在的内容（默认展开的披露、默认打开的浮层、历史消息、初始列表）直接呈现，只有用户操作或新数据带来的出现才播进场。Headless 以 `data-instant` 标记这类内容，皮肤把进场写在 `:not([data-instant])` 下；标记挂在条目上，只有它自己变了才撤，撤掉祖先上的标记会让下面所有静止的元素同时重播进场。
- **打断与反转**：退场中途重新打开时取消退场，从当前透明度继续进场，不先跳回不可见；换位中途再换，从当前位置接着走。
- **焦点与事件**：进场开始即移入焦点，退场开始即归还；退场中的节点不可命中、不接收键盘；业务回调不等待动画。

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

## 披露

- Surface 级展开（Accordion、Collapsible、Reasoning、ToolCall）内容走 `grid-template-rows: 0fr → 1fr`：展开 `--xh-motion-duration-expand` + `--xh-motion-ease-enter-strong`，收起 `--xh-motion-duration-collapse` + `--xh-motion-ease-exit`；指示器随内容同档转向，减弱动效下两者都瞬时完成。
- 密集展开（Tree、TreeSelect、JsonViewer、SideNav 内联子层、Table 展开行、Truncate）不动高度，刻意瞬时；树族只旋转指示器 `--xh-motion-duration-nudge`。
- 初始即展开的内容直接呈现，不播展开动画。

## 浮层进出场

按锚定关系与面的类型分组，关键帧集中在 `family/motion.css`，皮肤不得重定义：

| 关系 | 关键帧 | 组件 |
| --- | --- | --- |
| 锚定列表 / 菜单 | `xh-overlay-slide-in / out` | Menu、Select、Combobox、Cascader、ContextMenu、Menubar、Mention、TreeSelect、Date / Time picker、ColorPicker、Tooltip |
| 锚定面板 | `xh-overlay-pop-in` / `xh-pop-out` | Popover、HoverCard、Popconfirm、Tour、Command |
| 无锚定弹出 | `xh-pop-in / out` | NavigationMenu、SideNav popout、FloatingPanel、FloatButton 列表、Pagination 弹层、BackTop、Log / MessageFeed 回底按钮 |
| 面板（sheet） | `xh-sheet-in / out` | Dialog、Notification |
| 整幅滑入 | `xh-slide-in / out` | Drawer、Layout 抽屉式侧栏：入场 `slide` + `ease-slide`，退场 `exit` + `ease-exit` |

遮罩与全屏面 `xh-fade-in / out`。有进场就有退场：退场一律经 Presence 等浏览器实际起播的退场动画播完再卸载或藏起，不用固定计时器；常挂的部件（回到顶部、回到底部）收起时先播完退场再带上 `hidden`。

## 列表

- 加入用 `xh-item-in`（淡入 + `distance-md` 上移），移除用 `xh-fade-out`；重排用 FLIP：读取旧位置、写入新布局、以 `translate` 反向补偿后过渡到 0，`move` + `continuous`。
- 条目由作者渲染、删掉即卸载的集合（TagsInput、FieldArray）由列表动效原语 `trackListMotion` 接住离场：在原位置放一个退场态的替身，绝对定位在原排布位、不可交互，播完即移除；留下来的条目从旧位置滑到新位置。作者的列表写法不变。
- 启用列表增删动效的集合：TagsInput、FieldArray，以及 Toast、Notification、MessageFeed、Command、Cascader；Transfer（两侧同时变化）与 InfiniteScroll（批量追加）不启用。

## 数值与指示

- 进度类填充（Progress、LoadingBar、FileUpload 进度）不动 `inline-size`：填充铺满轨道、按比例 `translate`，由轨道裁掉，只走合成。倒计时条自己就是填充，用 `clip-path` 裁切收起；减弱动效下按秒分段。
- 不定进度以固定宽度的一段做 `translate` 往复。
- 数值补间（NumberAnimation）的时长由属性给出，减弱动效下直接落到终值。
- 滑动指示器（Tabs、Segmented、Anchor、NavigationMenu）取当前项相对列表容器的 `offset*` 排布位：不用 `getBoundingClientRect`，祖先的进场缩放会让测量值失真。位置用 `translate`，尺寸用 `inline-size` / `block-size`。Tabs 的标签带滚动已经占了 `translate`，指示条的位置叠在 `transform` 上，两者互不覆盖。

## 布局动画例外与 will-change

优先动可合成的属性：`translate`、`scale`、`rotate`、`opacity`；`clip-path` 只触发重绘，可以使用。动布局属性只允许这几处：

| 例外 | 理由 |
| --- | --- |
| 披露内容 `grid-template-rows` 与内缩 | 唯一可行的内容高度过渡 |
| 指示器的 `inline-size` / `block-size` | 绝对定位的独立小元素，不影响其他元素 |
| Switch 滑块按下伸长、Carousel 当前指示点伸长 | 部件很小，影响范围只有自己 |
| Layout 侧栏折叠 | 必须让出内容区宽度 |
| QuestionFlow 视口高度、Toast 堆叠高度 | 容器必须随内容增减高度 |

`will-change` 只写在正在动的状态下：拖拽中（`data-dragging`）、机器驱动的补间进行中（`data-animating`），以及 Presence 管理的部件的收起态（`data-state="closed"`，只在退场那一段留在屏上）。常驻的 `will-change` 一直占着合成层，静止画面的文字与 1px 分隔线会发虚；不可合成的属性不写 `will-change`。

## 书写

transition 列表写长名：`background-color`、`border-color`、`outline-color`、`box-shadow`、`opacity`、`translate`、`scale`、`rotate`，不写 `background`、`border`、`outline` 简写（门禁 `check-motion-role`）。位置用独立的 `translate` 属性；只有需要一次性组合多个变换且顺序敏感时才写 `transform`。不写 `transition: all`。

## 弹簧与 JS 动画

- 手势松手（Carousel 翻页、Sortable 放下、ImageViewer 平移惯性、Switch 拖动拇指）用 `@xihan-ui/motion` 的弹簧，交接松手速度；liquid 档的切换与指示也用弹簧。其余角色用曲线：出现与披露经 Presence 等待动画结束，弹簧没有确定的结束时间；数值必须精确落在终值。
- JS 动效只经 `@xihan-ui/motion`：不直接排帧循环，不写固定毫秒；时长与缓动从元素读取令牌（`readMotion`），判断减弱动效传入组件自己的元素（`resolveMotionPreference(el)`）。适配器中不写动画代码。
- `animate()` 缺省取 `durations.normal`，`@xihan-ui/animations` 的配方缺省取 `slide`。见 [动效原语](/guide/motion) 与 [动画层](/guide/animations)。

## 减弱动效

`data-motion="reduce"`（偏好 `system` 时跟 `prefers-reduced-motion`）去掉位移、保留淡变：位移、缩放、旋转与尺寸变化瞬时完成（几何类时长为 1ms，位移与整幅位移归零，缩放归 1，错开步长归 0），换色与出现的淡变保留为 120ms（`micro` / `enter` / `exit`）。按下仍然换底，浮层仍然淡入淡出、退场照样等 120ms 的淡出播完再卸载，只是不再滑动与缩放；抽屉与覆盖式侧栏改为淡入淡出；循环动画停止并显示静态替代；`@xihan-ui/animations` 的预设不播。

`data-motion="default"` 恢复完整动效：系统要求减弱、而产品设置或某个局部容器选择完整动效时，该子树的令牌回到基线取值。两者可以嵌套，最近的一层生效。JS 侧经 `resolveMotionPreference(el)` 按元素读同一个答案——Presence、贴底滚动、平滑滚动、数字动画、轮播起播、背景层全部走这一条通道；产品自己的「减弱动效」设置用 `setMotionOverride` 一处设置、处处生效。

提示延迟、自动播放间隔、轻提示停留这类等待不是动效，不受减弱动效影响，见 [停留时长](/design/dwell)；自动播放是例外，减弱动效下不自动起播。

## 相关

- [停留时长](/design/dwell) · [阴影与材质](/design/shadow) · [组件家族与模式](/design/patterns)
- 指南：[动效原语](/guide/motion) · [动画层](/guide/animations) · [设计令牌与主题 · 点击触感](/guide/theme#点击触感)
