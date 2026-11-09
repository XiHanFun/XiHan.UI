# 动效

动效只做四件事：确认操作、交代去向、提示进行中与变化，以及在极少数情况下引导注意。全库动效归为下面的角色，组件只选择角色，不自定时长、缓动与幅度；时长、曲线与幅度全部是令牌，关键帧集中在 `family/motion.css`，皮肤只引用。

## 角色

| 角色 | 用途 | 可动属性 | 时长 / 缓动 | 减弱动效 |
| --- | --- | --- | --- | --- |
| 按压 | 确认按下 | `scale` + 换面 | `press` / `press`，`release` / `release` | 只换面 |
| 状态 | hover、选中、焦点、校验的换色 | 颜色、描边色、阴影、`opacity` | `micro` / `enter` | 保留淡变 |
| 切换 | 开关滑块、单选圆点、勾选标记 | `translate`、`scale`；勾选标记另动 `clip-path`（描线）与 `mask-size`（全选 / 半选换形） | `nudge` / `continuous`（勾选标记的缓动取 `enter`，取消时倒擦走 `exit` / `exit`）；短边不超过 32px 的缩放可用 `settle` | 瞬时；勾选标记只剩淡变 |
| 指示 | 选中指示器在项之间移动 | `translate`；尺寸为登记例外 | `move` / `continuous` | 瞬时 |
| 披露 | 内容展开收起 | `grid-template-rows` | `expand` / `enter-strong`；`collapse` / `exit` | 瞬时 |
| 出现 | 挂载与卸载 | `opacity`、小幅 `translate` / `scale` | `enter` / `enter` 或 `enter-strong`；`exit` / `exit` | 淡变 |
| 列表 | 加入、移除、重排、错开 | 同出现；重排用 `translate` | 同出现；重排 `move` / `continuous` | 淡变，无错开 |
| 导航 | 整幅位移：抽屉、覆盖式侧栏、走马灯翻页、平滑滚动 | `translate`、滚动位置 | 进 `slide` / `slide`；出 `exit` / `exit` | 抽屉类淡变，其余瞬时 |
| 数值 | 进度、计数、倒计时 | `translate`、`clip-path`、文本 | `move` / `continuous` | 瞬时；倒计时按秒分段 |
| 手势 | 拖拽跟手、松手归位、快甩、越界回弹 | `translate`、`scale` | 跟手无过渡；松手用弹簧并交接松手速度 | 瞬时归位 |
| 循环 | 转圈、微光、光标、不定进度、呼吸 | `rotate`、`background-position`、`opacity`、`translate` | 循环周期 / `loop` | 停止并显示静态替代 |
| 注意 | 抖动、脉冲强调 | — | 只在 [`@xihan-ui/animations`](/guide/animations) 中使用：`attention` | 不播放 |
| 数据 | 图表入场、更新、退出 | 几何参数、`stroke-dashoffset`、`opacity` | 入场 `reveal` / `enter`，描线 `reveal` / `continuous`；更新与删除 `morph` / `continuous`；缩放换窗 `move` / `continuous`；淡入 `enter` | 几何瞬时，淡变保留 |
| 氛围 | 动态背景、跑马灯 | 着色器时间轴、`translate` | 由速度决定 | 冻结或停止 |

表中时长省略前缀 `--xh-motion-duration-`，缓动省略前缀 `--xh-motion-ease-`。

- 带位移、缩放、旋转或尺寸变化的动画不用 `micro`、`enter`、`exit` 三支时长：这三支在减弱动效下保留为淡变。例外是进出场（出现、列表加入与移除、整幅滑出）：其中的位移与缩放只取幅度令牌，减弱动效下归零，剩下的只有淡变，所以照常取 `enter` / `exit`。
- `move` 与 `nudge` 的分界：跨位置的换位与尺寸变化（指示器滑移、进度增长、堆叠重排、视口长高）取 `move`；原地的小幅几何变化（开关滑块、勾选标记、展开箭头）与跟手的让位、查看器缩放平移取 `nudge`。
- 勾选标记只有一份实现（`family/check-mark.css`，Checkbox、CheckboxGroup、Transfer、Table、QuestionFlow 多选共用），标记常驻、不按状态生成或撤掉：勾上从左往右描出，先露短边再露长边，同时淡入；取消倒擦回去并淡出；全选与半选之间，勾与横杠两层遮罩以中心为原点交叉缩放。进出未选态时形状切换延后一个 `micro`，半选淡出途中不会闪出一枚勾。勾的字形不随书写方向镜像，RTL 下同样从左往右描；减弱动效下不描线、不换形，只剩淡变。
- 屏内换位与尺寸变化（占位式侧栏折叠、分栏折叠、标签带滚动）归 `move`，不归导航：导航只管以视口尺度移动的整幅位移。通知从边缘推入是出现，取 `enter` / `exit`。
- 焦点环即时出现、即时撤下，不淡入：键盘用户要焦点当场落位；字段的描边与底色换色照常淡变。
- 日历翻月与视图切换不做方向动画：横移途中读格会读错，方向由标题的年月交代；新的一页网格原地淡入（`enter`），区间并排的两面一起淡入。
- Menubar 在同一条里的两张之间换，瞬时换张，与操作系统的菜单栏一致；NavigationMenu 换张时旧的一张当场撤下、新的一张原地淡入，共享外壳留在原处、尺寸补到新的一张（`move` / `continuous`）。两者都只有首开进场、末收退场。
- Slider 按下时点到轨道上的那一跳、键盘与程序改值，拇指与区间从旧位置补到新位置（`move` / `continuous`）；按住之后一挪动就跟手，不带过渡。

## 令牌

### 时长

| 令牌 | 取值 | 减弱动效 | 角色 |
| --- | ---: | ---: | --- |
| `--xh-motion-duration-micro` | 150ms | 150ms | 状态 |
| `--xh-motion-duration-enter` | 200ms | 150ms | 出现、列表加入 |
| `--xh-motion-duration-exit` | 150ms | 150ms | 出现、列表移除、导航出 |
| `--xh-motion-duration-move` | 200ms | 1ms | 指示、列表重排、数值 |
| `--xh-motion-duration-expand` | 200ms | 1ms | 披露展开 |
| `--xh-motion-duration-collapse` | 200ms | 1ms | 披露收起 |
| `--xh-motion-duration-slide` | 320ms | 1ms | 导航进 |
| `--xh-motion-duration-nudge` | 200ms | 1ms | 切换、跟手让位 |
| `--xh-motion-duration-press` / `-release` | 150 / 200ms | 1ms | 按压 |
| `--xh-motion-duration-attention` | 640ms | 1ms（预设不播） | 注意 |
| `--xh-motion-duration-reveal` | 960ms | 1ms | 数据首次出现 |
| `--xh-motion-duration-morph` | 400ms | 1ms | 数据更新 |
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
| `--xh-motion-ease-enter-strong` | `out-strong` | 带位移的入场、原地形变 |
| `--xh-motion-ease-exit` | `in` | 退场 |
| `--xh-motion-ease-disclosure` | `in-out` | 面级内容的展开与收起，正文与指示器同用 |
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
| `--xh-motion-travel` | 100% | 0 | 整幅位移：抽屉、叠放的通知 |
| `--xh-motion-travel-opacity` | 1 | 0 | 整幅位移两端的不透明度：减弱动效下位移归零，改由淡变表达 |
| `--xh-motion-scale-enter` / `-exit` | 0.96 / 0.98 | 1 | 出现 |
| `--xh-motion-scale-press` | 1 | 1 | 按压：缺省只换面不缩放；主题把它写回 0.97 即恢复按下回弹 |
| `--xh-motion-scale-drag` | 1.12 | 1 | 拖起 |
| `--xh-motion-scale-stack` | 0.95 | 1 | 通知叠放（轻提示预设的缺省）每往后一层的收拢比例 |
| `--xh-motion-scale-squash` | 0.86 | 1 | liquid 档指示器拉长时另一向的压扁下限 |
| `--xh-motion-scale-breathe` / `-halo` | 0.82 / 2.6 | 1 | 呼吸的吸气最小值与光环外扩 |

组件不自设缩放与位移的字面量。JS 侧 `@xihan-ui/motion` 的 `motionDurations`、`motionEasings`、`motionDistances`、`motionStaggerStep` 与弹簧预设和令牌逐条对账（门禁 `check-motion-source`）；读得到计算样式时以 `readMotion(el)` 为准，作者对组件槽的覆盖与容器上的 `data-motion` 同时生效。

## 编排

- **进出不对称**：进场比退场长一档（`enter` 200ms、`exit` 150ms），进场减速、退场加速；退场是让路。
- **方向**：从哪来回哪去——锚定浮层从锚点一侧滑出，抽屉从所在边推入，通知从视口边缘进出；RTL 下横向位移随书写方向翻转。
- **错开**：只对同一批到达的条目按到达顺序计数，步长 `--xh-motion-stagger-step`，最多 5 步，后面的与第 5 步同时出现；不按 DOM 位置（`nth-child`）计数。每次都是同一批一起露面的（浮动按钮列表、级联列、问答选项）位次就是到达顺序。
- **分层**：遮罩与面板同时开始、同时退场，在最长的那个结束后卸载；面板内列表的错开从面板进场开始计时。
- **首帧不播进场**：初始渲染时已存在的内容（默认展开的披露、默认打开的浮层、历史消息、初始列表）直接呈现，只有用户操作或新数据带来的出现才播进场。Headless 以 `data-instant` 标记这类内容，皮肤把进场写在 `:not([data-instant])` 下；标记挂在条目上，只有它自己变了才撤，撤掉祖先上的标记会让下面所有静止的元素同时重播进场。
- **打断与反转**：退场中途重新打开时取消退场，从当前透明度继续进场，不先跳回不可见；换位中途再换，从当前位置接着走。
- **焦点与事件**：进场开始即移入焦点，退场开始即归还；退场中的节点不可命中、不接收键盘；业务回调不等待动画。
- **不闪**：任意一秒内明暗交替不超过三次（WCAG 2.3.1）。皮肤里的 CSS 动画由门禁 `check-attention-flash` 核，`@xihan-ui/animations` 的配方在播放入口按同一套数法校验。

## 按压触感

定尺的独立动作控件（按钮、把手、方框、星、日历格、色块、排序钮）投影 Action Control 配方，按下与释放走同一条时间线。缺省只换面：缩放倍率 `--xh-motion-scale-press` 取 1，按下时底色进入 active、尺寸不变；主题把它写回 0.97 就恢复按下回弹，时间线不用改：

| 阶段 | 时长 | 结果 | 缓动 |
| --- | ---: | --- | --- |
| 按下 | 150ms（`--xh-motion-duration-press`） | 底进入 active；scale 1 → `--xh-motion-scale-press`（缺省 1） | `--xh-motion-ease-press` |
| 释放 | 200ms（`--xh-motion-duration-release`） | 底、描边、字色按 150ms（`--xh-motion-duration-micro`）回到 hover / rest；scale 回到 1 | `--xh-motion-ease-release` |

- transform origin 固定居中；指针 `:active`、键盘 Space / Enter 与 Headless 投影的 `data-pressed` 三者一致。
- 行级条目与 disclosure trigger（菜单项、树节点、表格行、手风琴标题）只换面，不缩放整个条目；不允许零反馈。
- 共边相接的分段（按钮组、切换组、工具条分组里的按钮）按下只换面：缩放任一段都会撕开两侧接缝。
- 换面（底、描边、字色）悬停进入与按压释放同一时长 micro：CSS 分不出这两种来路，200ms 的释放只给缩放。
- 不用点击波纹；不允许组件自设 0.94 / 0.96 / 0.98 等缩放。
- 业务事件不等动画结束：按下首帧先于异步 loading 可见；pending 后锁定重复操作，不持续缩放。
- hover + pressed 时 pressed 优先；focus-visible + pressed 保留焦点环、按压只改内部表面；selected / danger + pressed 保留各自身份，在其上派生 active 面。

## 披露

- Surface 级展开（Accordion、Collapsible、Reasoning、ToolCall）内容的行高 `minmax(0, 0fr) → minmax(0, 1fr)`，内缩与 `opacity` 同帧动：展开 `--xh-motion-duration-expand`、收起 `--xh-motion-duration-collapse`，两支等长、同一条 `--xh-motion-ease-disclosure`（缓起缓停），单开切换时一收一展的总高度一路单调；指示器随内容同时长、同曲线转向，减弱动效下两者都瞬时完成。
- 内容区的 `hidden` 跟退场走，退场播完才落：宿主有 `[hidden]{display:none!important}`（Tailwind preflight）时退场照样播完。
- 开合不换字重、不铺底、不画占高度的线，层次只靠字色。
- 密集展开（Tree、TreeSelect、JsonViewer、SideNav 内联子层）子层里排着多行、套不上单行网格，由 `trackDisclosureMotion` 按实测高度补间：展开时块尺寸从 0 补到实测高度、同帧淡入，收起时在原处放一个替身从原高度缩到 0、同帧淡出，播完即移除；父级的行距随高度一起让出，展开第一帧与收起最后一帧都不跳。时长与曲线和 Surface 级展开同档（`expand` / `collapse`、`disclosure`），指示器随子层同时长、同曲线转向；收起中途再展开从替身此刻的高度接着长。搜索换枝、侧栏折叠换装与一次翻动超过三枝的批量展开当场落定；虚拟滚动的行会被回收复用，不补。替身不可交互、不进条目查询与键盘导航。
- Table 详情行与上面几种同一套补间：详情行随它的数据行一起来去（收起父行）时交给行的进退场，不另补。
- FloatingPanel 收拢与还原时内容面的高度从旧的一档补到新的一档：收拢时正文当场藏起，原处的替身随内容面一路收短、同帧淡出；还原时正文当场露出，随内容面展开。
- Alert 关掉之后再显示时按实测高度展开（`expandIn`：块尺寸、内缩、边框与透明度从 0 补到原样，父级的行距随之让出），与退场的「先淡出、再收占位」对称；挂载时就显示着的直接呈现。Skeleton 加载完之后再开始加载时淡入，挂载时就在加载的直接呈现。
- Truncate 铺开与收回由 `tweenBlockSize` 补块尺寸：状态改之前量下此刻的高度，宿主提交之后从它补到新排法的高度；收回时补间里仍按铺开的排法摆着，盒子收到夹紧的高度那一刻才换回行数夹紧与省略号，多出来的行随盒子收进去，不先被一刀裁掉。
- 初始即展开的内容直接呈现，不播展开动画。

## 浮层进出场

带退场的部件，`hidden` 与内联 `display: none` 都跟退场闸门走，退场播完才落：connect 给的 `hidden` 跟着开合走，由适配器按闸门覆盖。宿主的 `[hidden]{display:none!important}`（Tailwind preflight、VitePress 默认主题都有这条）压得过皮肤声明的 `display`，`hidden` 跟着开合走退场就一帧都播不出来。退场窗口内靠 `inert` 或 Layer 状态挡住交互。

按面的类型分组，关键帧集中在 `family/motion.css`，皮肤不得重定义。弹层只有一套进出场，锚定关系只决定有没有位移：贴着锚点的面从锚点一侧短移，不贴锚点的面原地淡入放大：

| 关系 | 关键帧 | 组件 |
| --- | --- | --- |
| 弹层（锚定与无锚定同一套） | `xh-overlay-pop-in` / `xh-pop-out`：淡入 + 从 `--xh-motion-scale-enter` 放大 + 从锚点一侧移 `--xh-motion-distance-sm`，无锚定时位移为 0 | 锚定：Menu、Select、Combobox、Cascader、ContextMenu、Menubar、Mention、TreeSelect、Date / Time picker、ColorPicker、SideNav 弹出分支、Pagination 页码面板、Tooltip、Popover、HoverCard、Popconfirm、Tour、Command；无锚定：NavigationMenu、FloatingPanel、FloatButton 列表、BackTop、Log / MessageFeed 回底按钮 |
| 面板（sheet） | `xh-sheet-in / out` | Dialog、Notification |
| 整幅滑入 | `xh-slide-in / out` | Drawer、Layout 抽屉式侧栏：入场 `slide` + `ease-slide`，退场 `exit` + `ease-exit` |

遮罩与全屏面 `xh-fade-in / out`。图表提示框与热力图详情条是派生显隐：出现淡入、隐去淡出，隐去时 Headless 留着上一回露面的内容与落点（`retainChartTooltip`），淡出途中不先变空、不跳回绘图区原点。有进场就有退场：退场一律经 Presence 等浏览器实际起播的退场动画播完再卸载或藏起，不用固定计时器；常挂的部件（回到顶部、回到底部）收起时先播完退场再带上 `hidden`。

## 列表

- 加入用 `xh-item-in`（淡入 + `distance-md` 上移），移除用 `xh-fade-out`；重排用 FLIP：读取旧位置、写入新布局、以 `translate` 反向补偿后过渡到 0，`move` + `continuous`。
- 条目由作者渲染、删掉即卸载的集合（TagsInput、FieldArray）由列表动效原语 `trackListMotion` 接住离场：在原位置放一个退场态的替身，绝对定位在原排布位、不可交互，播完即移除；留下来的条目从旧位置滑到新位置。作者的列表写法不变。
- 启用列表增删动效的集合：TagsInput、FieldArray、GridList、FilterBuilder，以及 Notification、MessageFeed、Command、Cascader；树形表格只在展开、收起子行的那一批播，排序、换页与刷新换来的整批行直接呈现；Transfer 只在搬运那一批播：搬过去的在目标一侧进场，原来那一侧由替身淡出；Tabs 增删标签时新加的原地放大淡入、关掉的由替身收小淡出（标签带位移占着 translate，进退场只动 scale 与 opacity）；Breadcrumb 换路径时新到的层级与分隔符淡入、走掉的由替身淡出、留下来的滑到新位置。InfiniteScroll（批量追加作者节点）不启用；DiffView 点开折叠格露出来的行播入场，收起折回的是一整段上下文，与一次翻一大片的批量展开同一条规则，当场落定。

## 数值与指示

- 进度类填充（Progress、LoadingBar、FileUpload 进度）不动 `inline-size`：填充铺满轨道、按比例 `translate`，由轨道裁掉，只走合成。倒计时条自己就是填充，用 `clip-path` 裁切收起；减弱动效下按秒分段。
- 不定进度以固定宽度的一段做 `translate` 往复。
- 数值补间（NumberAnimation）的时长由属性给出，减弱动效下直接落到终值。
- 滑动指示器（Tabs、单选组 segmented 形态的滑块、Anchor、NavigationMenu）取当前项相对列表容器的 `offset*` 排布位：不用 `getBoundingClientRect`，祖先的进场缩放会让测量值失真。位置用 `translate`，尺寸用 `inline-size` / `block-size`。Tabs 的标签带滚动已经占了 `translate`，指示条的位置叠在 `transform` 上，两者互不覆盖。

## 布局动画例外与 will-change

优先动可合成的属性：`translate`、`scale`、`rotate`、`opacity`；`clip-path` 只触发重绘，可以使用。动布局属性只允许这几处：

| 例外 | 理由 |
| --- | --- |
| 披露内容 `grid-template-rows` 与内缩 | 唯一可行的内容高度过渡 |
| 密集展开子层的 `block-size`、上下内缩与起始外边距 | 子层里排着多行，单行网格的行高套不上；只在开合那一段由脚本补间，静止时不留任何内联样式 |
| Truncate 铺开与收回的 `block-size` | 同一个盒子换一副排法，新高度只有排完才知道；只在换档那一段由脚本补间 |
| FloatingPanel 收拢与还原时内容面的 `block-size` | 收拢的高度是 auto，过渡补不过去；只在换档那一段由脚本补间 |
| Alert 重新显示时根的 `block-size`、内缩、边框与起始外边距 | 与退场的收占位对称，新高度只有露面之后才量得到；只在展开那一段由脚本补间 |
| NavigationMenu 共享外壳换张时的 `inline-size` / `block-size` | 外壳按装进来的那一张的自然尺寸排开，新尺寸只有排完才知道；只在换张那一段由脚本补间 |
| Slider 拇指的 `inset-inline-start` / `inset-block-end` 与区间的长度 | 位置由连接层写成比例；只在跳位、键盘与程序改值时过渡，跟手时撤掉 |
| 指示器的 `inline-size` / `block-size` | 绝对定位的独立小元素，不影响其他元素 |
| Switch 滑块按下伸长、Carousel 当前指示点伸长 | 部件很小，影响范围只有自己 |
| Layout 侧栏折叠 | 必须让出内容区宽度 |
| Splitter 面板折叠与展开 | 必须让出相邻面板的空间；拖拽与步进跟手，不带过渡 |
| QuestionFlow 视口高度、Notification 叠摞高度 | 容器必须随内容增减高度 |
| Tour 聚光框的位置与尺寸、进度点伸长 | 聚光框是 `position: fixed` 的独立框，不在文档流里；进度点只有几像素 |

新增一处布局动画，要么改成可合成的写法，要么把理由登记进门禁 `check-motion-layout` 的例外表。

`will-change` 只写在正在动的状态下：拖拽中（`data-dragging`）、机器驱动的补间进行中（`data-animating`），以及 Presence 管理的部件的收起态（`data-state="closed"`，只在退场那一段留在屏上）。常驻的 `will-change` 一直占着合成层，静止画面的文字与 1px 分隔线会发虚；不可合成的属性不写 `will-change`。

## 书写

transition 列表写长名：`background-color`、`border-color`、`outline-color`、`box-shadow`、`opacity`、`translate`、`scale`、`rotate`，不写 `background`、`border`、`outline` 与 `transform` 简写（门禁 `check-motion-role`）。位置、旋转与缩放用独立的 `translate` / `rotate` / `scale`，连接层内联写的位移也一样；只有独立属性表达不了的组合才写 `transform` 并登记理由——现在只有 Tabs 的指示条：标签带滚动已经占了 `translate`，指示条的位置叠在 `transform` 上。不写 `transition: all`。

## 弹簧与 JS 动画

- 手势松手（Carousel 翻页、Sortable 放下、ImageViewer 平移惯性、Switch 拖动拇指）用 `@xihan-ui/motion` 的弹簧，交接松手速度；liquid 档的切换与指示也用弹簧。其余角色用曲线：出现与披露经 Presence 等待动画结束，弹簧没有确定的结束时间；数值必须精确落在终值。
- JS 动效只经 `@xihan-ui/motion`：不直接排帧循环，不写固定毫秒；时长与缓动从元素读取令牌（`readMotion`），判断减弱动效传入组件自己的元素（`resolveMotionPreference(el)`）。适配器中不写动画代码。
- `animate()` 缺省取 `durations.normal`，`@xihan-ui/animations` 的配方缺省取 `slide`。见 [动效原语](/guide/motion) 与 [动画层](/guide/animations)。

## 减弱动效

`data-motion="reduce"`（偏好 `system` 时跟 `prefers-reduced-motion`）去掉位移、保留淡变：位移、缩放、旋转与尺寸变化瞬时完成（几何类时长为 1ms，位移与整幅位移归零，缩放归 1，错开步长归 0），换色与出现的淡变保留为 150ms（`micro` / `enter` / `exit`）。按下仍然换底，浮层仍然淡入淡出、退场照样等 150ms 的淡出播完再卸载，只是不再滑动与缩放；抽屉与覆盖式侧栏改为淡入淡出；循环动画停止并显示静态替代；`@xihan-ui/animations` 的预设不播。

`data-motion="default"` 恢复完整动效：系统要求减弱、而产品设置或某个局部容器选择完整动效时，该子树的令牌回到基线取值。两者可以嵌套，最近的一层生效。JS 侧经 `resolveMotionPreference(el)` 按元素读同一个答案——Presence、贴底滚动、平滑滚动、数字动画、轮播起播、背景层全部走这一条通道；产品自己的「减弱动效」设置用 `setMotionOverride` 一处设置、处处生效。

提示延迟、自动播放间隔、轻提示停留这类等待不是动效，不受减弱动效影响，见 [停留时长](/design/dwell)；自动播放是例外，减弱动效下不自动起播。

## 相关

- [停留时长](/design/dwell) · [阴影与材质](/design/shadow) · [组件家族与模式](/design/patterns)
- 指南：[动效原语](/guide/motion) · [动画层](/guide/animations) · [设计令牌与主题 · 点击触感](/guide/theme#点击触感)
