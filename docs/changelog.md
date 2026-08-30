# 更新日志 · XiHan.UI

本文件记录 XiHan.UI 各版本的变更。每条标注 **新增 / 修复 / 优化 / 调整 / 移除** 类别。库以 npm 包形式发布，18 个公开包锁步同版；升级前请留意「调整」类中的破坏性变更。

## v1.1.0 (2026-08-31)

19 份变更集，18 个公开包锁步同版。

这一版的主线是**把拖拽做完**：`table` 的列、行与列宽，`tree` 的节点搬家，`tabs` 的标签换位，外加两个新组件 `sortable` 与 `resizable`——落点判定、乐观让位、读屏播报与键盘路径全归库，宿主只留「按意图改数组」那一段。支撑这一批的指针几何独立成第 18 个公开包 `@xihan-ui/pointer`。

- **新增** `@xihan-ui/pointer`：指针原语包，自研零依赖。单指会话把跟手、过滤与收尾收在一处（gzip 316 B），七个此前各写一遍文档监听循环的组件（`slider` · `splitter` · `scrollbar` · `color-picker` · `image-cropper` · `floating-panel` · `signature-pad`）统一改走它、行为不变；另有多指会话与双指几何（间距、中点、连线角度，以及相对起始那一刻的缩放、位移、转角）、拖放几何（排序投影、让位计算、激活阈值、边缘滚动）与尺寸调整几何（八向边推动带上下限 / 宽高比 / 吸附步进 / 容器夹取），后两层全是纯函数
- **新增** `sortable` 组件：列表 / 网格拖拽排序，两个适配器同批可用。落点走乐观投影——拖动中其余条目实时让位，松手即定，不是拖完才跳一下；`orientation` 三档（竖排、横排，以及换行网格按最近中心判），排版方向由首尾两项的先后推出，从右往左排时自动反向；按下要走够 `activationDistance`（默认 5px）才算拖动，条目本身仍然可以点击，拖到容器边缘会自动滚动。键盘路径默认开着且关不掉——空格拾起、方向键挪一格、空格放下、Esc 取消，每一步都写进视觉隐藏的播报区；`sort` 事件直接给出重排好的 `ids`，Vue 侧支持 `v-model:ids`
- **新增** `resizable` 组件：一块能拖着改尺寸的区域，八条边都能推，键盘也能推。`edges` 决定开放哪几条边，`minWidth` / `maxWidth` / `minHeight` / `maxHeight` 夹住范围，`aspectRatio` 锁宽高比，`step` 吸附到整数倍；`onSizeChange` 拖动途中连着发，`onSizeChangeEnd` 收尾才发一次，存尺寸用后者。键盘按屏幕方向推，Home / End 直接推到两端；推西边与北边时容器起点会动，那段位移写成 root 的 `left` / `top`，皮肤已给 `position: relative`
- **新增** `table` 的列拖拽排序：列上标了 `reorderable` 才产出拖拽把手，把手自占一个 Tab 位，方向键挪一格、Home / End 挪到可拖区段的首末。落点按列 id 认而不是按第几个，隐藏列自然留在原本的邻居旁边；不可拖的列与冻结列都是屏障，可拖范围被它们切成段。新增部件 `column-drag-trigger` 与 `live-region`、属性 `data-drop`，以及 `api.draggableColumns` / `api.dropTarget` / `api.announcement`
- **新增** `table` 的行拖拽排序：`rowReorderable` 打开后整行都是拖动源，焦点在表体里时 `Alt` + 上下键挪一格；搬完发 `onRowMove`，载荷是 `{ id, parent, index, ids }`。树形行照样搬——落点分三档（上下两端是插在它前后、中段是落进它里面认它当父），`Alt` + 左右键改缩进层级，落进自己的后代会拖出一个环、库自己拦下，`allowRowDrop` 收业务侧的规矩。排序链非空或宿主只渲了一段时降级，理由从 `api.rowReorderDisabledReason` 读得出来
- **新增** `table` 的列宽拖拽：列上标了 `resizable` 就产出改宽把手，拖动与方向键都能调（一次 8px，按住 Shift 一次 40px，rtl 下左右两键对调而语义恒是「加宽 / 收窄」）。把手是可聚焦的分隔条，报出当前列宽与上下限，宽度落在列偏好里可以直接存起来下次还原；列宽写成百分比这类算不出 px 的写法时不认可改宽
- **新增** `tree` 的节点拖拽搬家：`draggable` 打开后整个节点都是拖动源，落点三档——`before` / `after` 插在同层，`inside` 落进这个分支，叶子上只有前后两档；焦点在树里时 `Alt` + 上下键在同层兄弟间挪、`Alt` + 左右键改缩进层级；搬完发 `onNodeMove`，载荷是 `{ value, parent, index }`。新增 `allowDrop` 与 `translations` 两个 prop、`live-region` 部件，以及 `api.dropTarget` / `api.announcement`
- **新增** `tabs` 的标签拖拽换位：`reorderable` 打开后整个标签都是拖动源，焦点在标签带里时 `Alt` + 主轴方向键挪一位；搬完发 `onTabMove`，载荷是 `{ value, from, to, values }`。轴向跟随 `orientation`，另一轴的方向键照常放行给页面滚动与读屏，横排 rtl 下左右对调。新增 `live-region` 部件、`translations` prop 与标签上的三个 `data-*`
- **新增** 三个触屏拖动把手 `row-drag-trigger` / `node-drag-trigger` / `tab-drag-trigger`：整块起手不认触屏——纵向手势在按下那一刻就归了浏览器滚动，而把整行设成 `touch-action: none` 又会让长列表滚不动；把手是一小块专门让出去的地方，自带 `touch-action: none`、按下即拖。把手不占 Tab 位，键盘那一路仍由容器上的 `Alt` + 方向键承担
- **新增** 选中原语 `applySelection` / `toggleSelectAll` / `rangeBetween`：带锚点的范围选与全选，纯集合运算，不碰 DOM。`table` / `tree` / `transfer` 三处接上 Shift 范围选（此前只有 `listbox` 有），`table` 另加 `Ctrl` / `Cmd` + A 全选；范围选带基线，连着按 Shift 往回点收得回来。`tree` 按展开后的可见序取、级联模式不接，`transfer` 的锚点跨到另一侧时退化成普通切换
- **新增** `image-viewer` 的双指缩放：两指撑开放大、捏合缩小，两指整体平移时只动偏移不动缩放。缩放与位移都相对起始那一刻算而不是相对上一帧，点数一变就重拍基准
- **新增** `@xihan-ui/kernel/vite` 子入口：启动横幅打在开发者跑项目的那个终端里，标志逐字符横向彩虹。另导出 `getXiHanUiBanner()`（只出文本）与 `printXiHanUiBanner()`（打到 stdout），不认识 Vite 的 Node 脚本也能调；要不要上色的判据与 `picocolors` 逐条对齐，`NO_COLOR` / `--no-color` 一票否决

- **调整** 浏览器控制台的启动摘要**默认不打**（`setMetadataAutoPrint(true)` 可以打开）：浏览器控制台是访问网站的人也看得见的地方，横幅是给开发者看的，两者不该混在一起
- **调整** `XIHAN_UI_LOGO` 与 `XIHAN_UI_SEND_WORD` 从 `XIHAN_UI_METADATA` 对象里摘出来单独导出，`getMetadataSummary()` / `getMetadataDetails()` 随之不再带寄语那几行——对象被整体引用时打包器摇不掉它里面的字段，改之前标志与寄语确实出现在生产构建里。读过 `XIHAN_UI_METADATA.logo` / `.sendWord` 的代码改取这两个导出
- **调整** `tree` 的拖拽播报报出落脚处：`Moved 甲 into 收件箱, position 1 of 3.`，父为 `null` 的根层报 `the top level`。新增 `DragAnnounceInput.into` 与 `DragTranslations` 的 `movedInto` / `droppedInto` / `canceledInto` / `rootLevel`；`table` 的行与列、`tabs` 的标签是一维重排，位次已经够用，三处播报一个字没变
- **调整** `tree` 对禁用节点的落点判定收窄成只拦 `inside`：往一个禁用的分支里塞东西说不通，但在它前后插只是绕着它排序，`table` 与 `tabs` 本来就是这个口径
- **调整** `carousel` 的划动与 `image-viewer` 的单指平移收进多指会话：监听改挂在文档上，手划出轨道、划出窗口都跟得住，系统收走指针也会收尾——原先靠指针捕获，这两种情形的表现随浏览器而异

- **修复** `dialog` / `drawer` / `image-viewer` 的 `closeOnEscape` 与 `closeOnInteractOutside` 改为交互当时现读。这两个开关此前在浮层展开那一刻就求了值，而那个效应每次展开只挂一次，于是浮层开着的时候改它们不算数，得关掉重开才认——提交期间把弹窗锁住这一路直接失效
- **修复** 按住切换类的键不放时会来回翻转：按住 `Ctrl` / `Cmd` + A 在全选与全不选之间一直闪，按住空格反复拾起放下。12 处切换类的按键分支补上自动重复守卫（`table` / `listbox` / `transfer` / `sortable` / `json-viewer` / `menubar` / `combobox` / `color-picker` / `tags-input` / `editable`）；步进类的按键不挡，按住连发正是它们的用法，新增门禁 `check-key-repeat` 守住这条界线
- **修复** 八个 Vue 组件收不到全局配置里的读屏文案：`combobox` / `popselect` / `resizable` / `sortable` / `table` / `tabs` / `text-field` / `tree`；`table` 连实例上的 `translations` prop 都没有，一并补上
- **修复** `XhTableRoot` 丢掉作者写在它上面的 `class` / `aria-*` / 监听器——它渲的是 Fragment（表格本体 + 播报区），而 Vue 只在单个元素根上自动透传 attrs
- **修复** `table` 与 `tree` 的键盘处理器吞掉落在可编辑单元格 / 节点内容里的按键：打空格被当成「切换这一行的选中」、`Ctrl` + A 全选行、方向键换行。输入法组合中的按键与落在可编辑控件上的按键现在一律放行
- **修复** 开着 `striped` 的表里，偶数行既不响应悬停也显不出选中——斑马纹那条的祖先链比悬停与选中都高。行底色的先后自此是：基础底 < 斑马纹 < 选中 < 悬停 / 键盘锚点 < 换父落点，由一个跑在真实 Chromium 上的用例钉住

## v1.0.0 (2026-08-26)

::: warning 版本与兼容性
首个正式版。从这一版起，[版本与兼容性政策](/guide/versioning)的全部条款生效——导出名、prop、部件与 `data-*` 属性、CSS 令牌与 `@layer` 名、自定义元素标签，改名与删除一律走主版本。

尚未提供：内建语言包（组件文案只内建英文，中文等要自备 `translations`，全局注入口已就绪）、令牌浏览器、AI 组件族的 MarkdownStream / Reasoning 与 ToolCall 折叠 / 工具审批、企业业务组件。
:::

- **新增** 框架无关的无头内核：一个组件的状态、交互与无障碍逻辑住在 `@xihan-ui/headless`，适配器只把 `connect()` 产出的属性挂到宿主元素上；同一份内核在 Vue 与 Web Components 两端跑同一套一致性套件，逐帧比对归一化后的 DOM
- **新增** 样式与逻辑解耦：皮肤只认 `data-scope` / `data-part` / `data-*` 状态属性，不认框架、不认类名，整包换皮肤不用碰一行 JS
- **新增** 17 个公开包由 changesets 的 `fixed` 组锁步同版，运行时第三方依赖只有一个（`@internationalized/date`，仅日期族使用）；浮层定位、虚拟滚动、代码着色、流式 Markdown、Web Components 响应式基类均为自研
- **新增** `@xihan-ui/kernel` 结构原语：anatomy、`mergeProps`、`normalizeProps`、Scope、context、id；另有运行期锁步版本检查（混装两个版本在 dev 下报 `core.version-mismatch`）与框架元数据
- **新增** `@xihan-ui/machine` 状态机运行时：`createMachine`、解释器契约、受控 / 非受控值绑定
- **新增** `@xihan-ui/behavior` 行为原语：消解层、焦点域、滚动锁、进出场、集合、typeahead、悬停意图、滚动跟随与粘底
- **新增** `@xihan-ui/motion` 动效原语：缓动单一真源、纯补间、帧循环、减弱动效偏好、解析解弹簧、Web Animations 薄封装
- **新增** `@xihan-ui/position` 浮层定位：放置、翻转、贴边、箭头锚点、rtl，自研无第三方依赖
- **新增** `@xihan-ui/vue` Vue 3 适配器，729 个部件：受控 / 非受控、`v-model`、带类型的作用域插槽；`behavior` 子入口收五个行为原语的组合式；命令式服务四件（轻提示、通知、对话框 `confirm` / `prompt`、顶部进度条），配置源与文案可运行期换
- **新增** `@xihan-ui/web-components` 适配器，121 个自定义元素：元素不生成结构，作者写带 `data-xh-part` 的 Light DOM 子节点，元素把 `connect()` 产出打上去；运行期增删子节点会重新接线；随包出 `custom-elements.json`
- **新增** 119 个组件，每个同时产出无头内核、Vue 组件、自定义元素与默认皮肤，行为由内核唯一定义
- **新增** 通用 15 个：按钮、按钮组、剪贴板、下载触发器、文本省略、浮动按钮、渐变文字、快捷键、图标、图标块、滚动条、切换按钮、切换按钮组、排印、水印
- **新增** 布局 8 个：弹性布局、栅格、布局、瀑布流、滚动区域、分隔线、间距、分栏
- **新增** 导航 16 个：固钉、锚点、回到顶部、面包屑、右键菜单、菜单、菜单栏、导航菜单、页头、分页、分段控制器、侧栏导航、步骤条、标签页、工具栏、引导
- **新增** 数据录入 32 个：级联选择、复选框、复选框组、颜色选择器、组合框、日期输入、日期选择器、动态录入、就地编辑、表单字段、字段集、文件上传、表单、图片裁切、列表框、提及、数字输入、密码输入、分格输入、弹出选择、单选组、评分、选择器、签名板、滑块、开关、标签输入、文本输入、时间输入、时间选择器、穿梭框、树选择
- **新增** 数据展示 30 个：手风琴、头像、头像组、日历、卡片、走马灯、代码块、折叠区域、倒计时、描述列表、空状态、热力图、文本高亮、图片、图片预览、无限滚动、JSON 视图、列表、日志、跑马灯、数值动画、二维码、统计数值、表格、标签、时间、时间线、计时器、树、虚拟滚动
- **新增** 反馈 9 个：警告提示、徽标、加载条、进度条、结果页、骨架屏、加载指示器、通知、轻提示
- **新增** 浮层 7 个：对话框、抽屉、浮动面板、悬浮卡片、弹出确认、气泡卡片、文字提示
- **新增** AI 对话 2 个：消息编辑器、会话线程
- **新增** `@xihan-ui/tokens` 设计令牌：源是 DTCG，构建期产出 CSS 变量——原语 95、语义 158，另有紧凑 49、浅色 41、深色 44、减弱动效 8 条覆盖，运行时不做 CSS-in-JS
- **新增** `@xihan-ui/styles` 默认皮肤 125 份，按 `@layer` 分层（`xihan.reset` → `tokens` → `base` → `components` → `overrides`），使用者的覆盖恒排在最后
- **新增** 三条视觉轴：`variant` 管形态、`tone` 管语气（六族）、`size` 管尺寸；语气色共享一层，实心底上的前景与交互态挪动方向由语气色按 WCAG 相对亮度现推，换肤下配对自动成立
- **新增** 主题五个维度独立切换：明暗、品牌、密度、对比度、书写方向，带 `createThemeController` 与品牌色派生
- **新增** 兜底字形二十个 `--xh-glyph-mark-*` 令牌，构建期内联图标包 SVG，跨系统长相一致
- **新增** 浮层一律 Teleport 到单一落点 `#xh-portal-root`，层号不受宿主祖先的层叠上下文影响；13 个滚动宿主自带自绘滚动条，浮在内容之上不占宽度
- **新增** `@xihan-ui/animations` 可序列化的动效配方、内置进场与注意动效、错开起播、文字拆分
- **新增** `@xihan-ui/sound` 纯 Web Audio 程序化 UI 音效，零音频文件，三套主题
- **新增** `@xihan-ui/backgrounds` WebGL2 效果与数据驱动的粒子云，框架无关
- **新增** `@xihan-ui/icons` 首方图标集，`IconRecord` 结构化记录、渲染端逐节点建元素，运行期不解析 SVG 字符串；另有 SVG → `IconRecord` 的构建期转换器，可把任意 SVG 目录转成可摇树的运行期模块
- **新增** `@xihan-ui/chat-stream` AI 协议内核：SSE 读取 → 协议归一 → parts 归约 → 会话 store，零 DOM、零框架
- **新增** `@xihan-ui/markdown` 流式 Markdown 渲染内核：增量切块 + 稳定 key + 消毒，CommonMark 子集一致率 489/652
- **新增** `@xihan-ui/code-highlight` 代码着色，自研粗粒度词法器
- **新增** 键盘交互依 W3C APG 落地，77 份机读键盘规格表共 463 行键位，它同时是测试的分母：少覆盖一行即判套件失败
- **新增** 无障碍扫描跑在真实 Chromium（axe），存量违规登记表只剩两条，另有一条 breadcrumb 的步骤重放豁免；焦点环、按下反馈、禁用态对比度与语气配色（2 档主题 × 6 族，158 组配对）都由门禁逐条守住
- **新增** 119 个组件都留了文案位并挂进覆盖表，全局 `ConfigProvider` 一处注入；日期族的默认语言跟随宿主；书写方向用逻辑属性写，rtl 下浮层放置、方向键语义与图形朝向一并对调
- **新增** 24 个表单字段组件认原生表单重置，11 个单一控件封装把字段状态与字段标签接到真控件上；`field` 提供标签、描述、错误与 `asChild` 逃生口
- **新增** `pnpm gate` 一条命令跑 67 项结构检查：令牌产物、层序、皮肤在场、部件接线、浮层策略、聚焦环、语气对比度、键盘套件、导出、角色组、文档数字对账等，生成物一律由门禁核对
- **新增** 单元与跨适配器一致性用例 10089 条；真实浏览器另跑无障碍扫描、浮层定位契约与 Web Components 示例
- **新增** 体积棘轮 27 条产物限额，摇树是真的：只引一枚图标 149 B、整集合 7.37 kB，`XhButton` 1.38 kB、`XhDialogRoot` 15 kB（均 gzip）
- **新增** 产物契约由 `publint` + `attw` 守住；ESM-only，子路径导出都带类型
- **新增** 组件文档由 headless 产物与 TS 类型生成，示例引的是真实组件，Vue 与 Web Components 两套写法并排
- **调整** 元数据的宿主行不再报锁步一致性，只报宿主与版本

## v1.0.0-preview.0 (2026-08-26)

45 份变更集，17 个公开包锁步同版，走 `preview` dist-tag。

这一版的主线是**把 alpha 里遗留的形状问题一次改完**：两对做着同一件事的组件分家（toast / notification、badge / tag），三处与同族对不上的 prop 名归位，语气色从逐族写死改为按底色现推。

- **新增** `notification` 组件，与 `toast` 分家：前者是系统推来的卡片（左侧类型字形、右上角关闭钮、两列网格、九宫格落位），后者收窄成操作反馈（顶部居中、宽度包着内容、一行图标加一句话）
- **新增** 分页的省略号能摊开：折进去的那几页有了入口，分页因此升级成浮层族（新增 `positioner` / `content`）；每页条数从只读 prop 升成真状态，配 `XhPaginationPageSizeSelect` 与 `pageSizeOptions`
- **新增** 表格的前缀列（行号 / 勾选 / 展开，按给定顺序插在最前并占住列号）、树形子行，以及一份可序列化的列偏好（列序 / 隐藏列 / 列宽）
- **新增** 树的 `multiple`、`leafOrientation`（末端全是叶子的那层横排）与节点级 `childrenOrientation`
- **新增** json-viewer 的原文视图 `view="text"`：直接出缩进过的 JSON，可整段拷走，值不再受截断与折减
- **新增** 13 个宿主的滚动层自带自绘滚动条：12 个浮层族的 `content` 与 json-viewer 的两档，作者一个部件都不用写；滚动条同时新增 `scroll-hover` 档并定为缺省
- **新增** Vue 侧三条逃生口：`@xihan-ui/vue/behavior` 子入口（五个行为原语的组合式）、`useHotkeys`（只注册不渲染键帽）、`XhFieldControl` 的 `asChild` 与配套 `useFieldControl`
- **新增** 命令式服务补齐三件：`createLoadingBarService`（句柄上是在途计数而不是布尔开关）、取值型 `prompt`、配置源可运行期换（应用切语言后服务子树跟着变）
- **新增** `@xihan-ui/tokens` 导出颜色能力：相对亮度、对比度、择色、混色与深浅——这套数学此前在四处各写了一份，判据各走各的
- **新增** date-picker 的 `defaultFocusedValue`，决定展开时先落在哪一页
- **新增** thread 补 `provideThread` / `useThreadContext`，与孪生组件 log 对称

- **调整** **badge 收窄成「只做角标」**：删掉 `variant`，解剖从单层 `root` 拆成 `root`（锚点）+ `indicator`（角标），新增 `placement`，定位归组件自己管。**行内的状态药丸请改用 `tag`**
- **调整** **生命周期相位改走 `data-state`**，`data-status` 退回「结果种类」一轴——此前一条 `[data-status='error']` 会同时命中「加载失败的头像」和「一整页 500 报错」
- **调整** 树的 `selectionMode` 转为 `multiple` 的旧写法，与同族七家对齐
- **调整** 实心底上的前景色与交互态挪动方向改由语气色现推（WCAG 相对亮度，白字黑字的交叉点 `0.179` 是解析解），换肤下配对自动成立；装饰档 `--xh-_tone-soft` 从 500 提到与控件边界同一档，六族十二组都够到 3:1
- **调整** 描边档的标签改用「可操作区边界」那一档语气色，边相对面的对比从 1.44–2.18 抬到 4.56–7.83（浅色）
- **调整** 浮层里的条目之间加 2px 行距，新增语义令牌 `--xh-list-option-gap` 统一这把尺——此前库内自己就有 0 / 2 / 4px 三种方言
- **调整** select 的盒不再自带 320px 宽度上限，框宽交回布局
- **调整** 上一页 / 下一页默认就画两枚箭头，不再要每份示例手写「上一页 / 下一页」四个字
- **调整** 147 个注入键改用 `Symbol.for`：模块被加载成两份时不再整棵子树白屏

- **修复** 点字段的标题聚不到复合控件的焦点；套进字段的复合控件读屏**一个名字都没有**——标签的 `for` 指向 `div` 时什么也不会发生，而且不报错
- **修复** `useStickToBottom` 吞掉句柄，最常见的用法（两个 getter 读模板 ref）下根本没挂上
- **修复** `XhJsonViewerRoot` 的 `value` 在类型上被推成 `undefined`，任何跑 vue-tsc 的工程传真实数据都编译不过
- **修复** 命令式服务的宿主挂不起来时连累调用方：一条轻提示能让整次导航失败、整站白屏，现在退化成空操作并发一条说得清的诊断
- **修复** 日历的「大步翻」两颗钮被一条 `display: none` 无条件收掉，从来就没画出来过
- **修复** date-picker 展开态初值为真且铺了格子时抛 `SEND_BEFORE_MOUNT`
- **修复** 条目之间一有缝，select / combobox / popselect 的高亮就一跨一闪，读屏跟着一路播报
- **修复** 四处被祖先 `overflow` 裁掉的聚焦环改成往内收
- **修复** 树上三个对读屏隐藏的把手不再被指针聚焦（浏览器告警「aria-hidden 的后代仍持有焦点」）；叶子行补上箭头那一格的缩进，层级关系读得出来了
- **修复** 菜单族两家（context-menu / menubar）的勾选标记没跟着语气走

- **优化** 不可关闭的标签走快路不建状态机：400 枚从 39.1ms 降到 18.3ms
- **优化** 进度条服务的宿主自己渲染，不再经 provide/inject 拿 api

- **移除** `toaster`：轻提示不再需要额外的容器组件
- **移除** `@xihan-ui/kernel` 的 `DATA_SCROLL_SHARD`：配套的分片机制从未实现，声明处之外全库零引用

## v1.0.0-alpha.3 (2026-08-23)

40 份变更集，17 个公开包锁步同版。这一版的主线是**一致性收口**：把「同一件事在不同组件里有几种做法」逐条查出来、裁一种、再写成门禁钉住。结构门禁从 21 道增到 57 道。

- **新增** `scrollbar` 组件：自绘滚动条可以挂在任意一个滚动容器上，不必是本组件的后代
- **新增** `date-picker` / `time-picker` 的快捷选项（`presets`）：给数据就在浮层里多排一列，自成一套 listbox 键盘
- **新增** 日历的多面板、按月 / 季度 / 年 / 周挑、快速翻年、周选整周预览；周序号成为一等部件 `week-number`
- **新增** select 浮层的底部操作区，「新建」「全选」这类按钮有了位置
- **新增** 热力图的 `palette` 色板轴（六色），与语气轴各管各的
- **新增** number-field 的 `parse` / `format` 与可选 `control` 部件；pin-input 的 `pattern`
- **新增** 全局配置做成真正的 ConfigProvider：全局默认 + 局部覆盖，两个适配器一份语义

- **调整** **浮层搬进单一落点**：19 个浮层的 positioner 一律 Teleport 到 `#xh-portal-root`。宿主祖先只要建了层叠上下文，原地渲染的浮层层号就退化成局部序号——这是库无法从自身约束的。**按 `wrapper.querySelector` 取浮层节点的代码要改从 `document` 取**
- **调整** **盒的定义统一**：有 `control` 部件就是盒，`trigger` 退化成盒内的 `flex: 1` 按钮。此前 16 个输入 / 选择控件有三种盒，盒是 `<button>` 的那五家没法把清空钮放进框里
- **调整** **清空 / 关闭 / 移除按钮收成四类契约**：焦点模型、空态、尺寸、圆角、互斥、文案键、键盘路径逐条统一；select / cascader / tree-select / popselect 补上了此前完全缺席的键盘清空
- **调整** **状态属性收成一套词汇**：当前项一律 `data-current`，`data-active` 的一名三义拆成 `data-in-path` 与 `data-passed`，组级混合态归 `checked | unchecked | indeterminate`
- **调整** **默认语言跟随运行时**：日期系兜底从写死 `zh-CN` 改成「显式 locale → 全局配置 → 宿主语言 → `en-US`」。**默认周首日随之从周一变成周日**，要固定就显式传 `locale` 或 `firstDayOfWeek`
- **调整** 「移除这一枚 chip / 这一行」统一叫 `item-delete-trigger`，四个文案键归成 `deleteItem`
- **调整** 选择态一族（table / tree / transfer）的选中集合统一叫 `selection`，载荷键统一 `{ value }`
- **调整** 兜底字形改用真图标（`--xh-glyph-mark-*` 二十个令牌），不再是跨系统长相各异的 Unicode 字符
- **调整** 减弱动效只剩一条通道，CSS 侧新增 `[data-motion='reduce']` 钩子；缓动与时长的真源是令牌
- **调整** 并排成对的面板定高——穿梭框搬走条目后整体不再变矮
- **调整** 菜单族三家（menu / menubar / context-menu）逐条同值：menubar 此前根本没有「子菜单触发项展开态」这条规则

- **修复** side-nav 折叠成图标栏后，行按钮与链接**没有可及名**——读屏用户完全不知道每一项是什么（真机 axe 扫出，critical）
- **修复** date-picker / time-picker / combobox 有值时下拉钮被藏掉：鼠标用户没有打开入口，Escape 收起时焦点掉到 `body`
- **修复** 日历周序号在周日起算时整列少 1（ISO 周里周日属于上一周）
- **修复** `TimeProps.locale` 的窄联合与全局 BCP 47 locale 对不上，配 `de-DE` 会拿到中文用词
- **修复** 4 条子路径导出的类型文件根本不存在，`publint` / `attw` 判红——发布链路当场卡住

- **优化** 无障碍：真机 axe 覆盖到 dialog / drawer / image-viewer 三个模态，全部通过
- **优化** 新增 37 道门禁，其中 `check-doc-numbers` 把「文档里写死的数字」变成可判的——README 与文档站的组件数、令牌数、门禁道数不会再各说各话
- **优化** 版本策略页按实测重算：`data-state` 取值清单删掉 4 个库里已不存在的，WC 命令式方法从 22 条改成 29 条

## v1.0.0-alpha.2 (2026-08-16)

13 份变更集，17 个公开包锁步同版。`@xihan-ui/motion` 与 `@xihan-ui/animations` 是新包，这一版首次发布。

- **新增** `@xihan-ui/motion` 动效原语与 `@xihan-ui/animations` 现成动效两个包，并补齐动效地基的四个缺口
- **新增** `@xihan-ui/icons` 的 SVG → `IconRecord` 构建期转换器：`xihan-icons` 命令与 `@xihan-ui/icons/codegen` 子路径，把任意 SVG 目录转成可摇树的运行期模块
- **新增** 首方图标集扩到覆盖中后台界面的常用语义，共 179 枚手绘图标，分九类；只引一枚仍是 149 B（gzip），集合变大不影响你的产物
- **新增** 自定义元素的全局文案层 `setXhConfig()`
- **新增** `startSkinCheck()` 开发期探测与 `styles.missing-skin` 诊断码——漏引皮肤不再静默
- **新增** `check-style-entries` 门禁：每份皮肤都必须进得了全量入口、也够得着按需入口

- **优化** 75 个组件的插槽写上真类型，`vue-tsc` 从此接得住插槽名与载荷键名的拼写错误
- **优化** 104 个组件全部留出 `<Comp>Translations` 的位，哪怕眼下一句文案都没有——后面要加时不必改结构
- **优化** 每份皮肤都能单独引入，动画不再指望别处的文件在场

- **修复** 官网作为第一个真实消费方落地时暴露的四条问题（宿主定位、图层序等），全部改代码而非只改文档

- **调整** 「collection 铺开的结构凑齐必备部件」由人工判据改成机检，三档语义写进文档
- **调整** 体积棘轮改成量使用者真正下载的那个数

## v1.0.0-alpha.1 (2026-08-13)

25 份变更集，15 个公开包锁步同版。`@xihan-ui/sound` 是新包，这一版首次发布；`@xihan-ui/icons` 在上一版没能发出去，这一版补齐。

- **新增** `@xihan-ui/sound` 声音层：纯 Web Audio 的程序化 UI 音效，零音频文件、零第三方依赖、框架无关；命令式反馈服务已接上
- **新增** 进度条的环形与仪表盘两种形态（`variant` 由 `line` 扩成 `line` / `circle` / `dashboard`）
- **新增** 级联选择的空态兜底：`empty` 部件、`data-empty` 标记与文案覆盖
- **新增** checkbox / switch / combobox / color-picker 能进 HTML 表单，表单字段组件由 18 个变 20 个，五个缺口清完
- **新增** 复合控件响应表单重置：机制本体加 17 个组件全部接上，另立一道门禁盯着以后新加的；Web Components 侧同步
- **新增** `--xh-border-control` / `--xh-border-control-hover` 两支控件边界令牌，`data-contrast` 随之接上
- **新增** popconfirm 与 float-button 的组件文档页第一次有了 Props 表

- **修复** 摇树第一次真的生效：只用一个组件不再拖来整个库。此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效。实测只用 `XhBadge` 由 168,947 B 降到 **538 B**
- **修复** RTL 下浮层的 `start` / `end` 第一次真的翻过来
- **修复** 浮层箭头指向锚点，不再钉死在浮层中点
- **修复** `index.css` 的级联层序：层序声明挪到入口最顶，此前令牌与部分组件皮肤抢先立层
- **修复** 四处只在真实宿主里才现形的缺陷（含首屏即展开的对话框与抽屉能服务端直出、无 window 的宿主里不再抛异常）
- **修复** 带语气的 outline 控件边框补到 3:1，控件边界切到 `border.control`，WCAG SC 1.4.11 第一次真的达标
- **修复** 补齐 4 处「边框改不动」的覆盖槽
- **修复** combobox 展开按钮翻面只转箭头字形，不再带着悬停底色一起转
- **修复** 级联选择的空态占位在 Web Components 侧补齐，两个适配器不再分叉

- **调整** 跨组件已经分叉的名字统一回一套（7 处）。part 名与 prop 名在 1.0 之后就是公开 API，趁 alpha 一次改完，逐条迁移点见各包 CHANGELOG
- **调整** 下拉与列表族的条目度量与高亮档位统一成两档制，分两批铺完 12 个组件
- **调整** 级联选择皮肤翻修：展开路径改品牌淡底加粗、分支条目补右向箭头、列改内容撑宽定高
- **调整** `hideOutside` 的入参形状随真实宿主那四处修复一并变化

## v1.0.0-alpha.0 (2026-08-11) · 框架无关重写

### 基座

- **新增** `@xihan-ui/kernel` 结构原语：anatomy、`mergeProps`、`normalizeProps`、Scope、context、id 生成，以及浮层定位、虚拟滚动、代码着色三个端口的类型契约
- **新增** `@xihan-ui/machine` 自研薄状态机：定义层、`createService` 解释器与 vanilla 运行时，受控值绑定与效应生命周期
- **新增** `@xihan-ui/behavior` 交互行为原语：消解层、焦点域、滚动锁、进出场，随后补上条目集合导航（roving tabindex 底座）与首字母连打检索
- **新增** `@xihan-ui/tokens` 设计令牌体系与主题运行时，令牌从 DTCG 源产出 CSS / JSON / TS 三种形态
- **新增** `@xihan-ui/styles` 纯 CSS 皮肤层，后续补上 reset 层
- **新增** `@xihan-ui/kernel` 全局诊断通道，状态机错误投递进该通道而不是抛在使用者脸上

### 适配器

- **新增** `@xihan-ui/vue` Vue 3 适配器，Button / Dialog 纵切片先打穿全链路
- **新增** `@xihan-ui/web-components` Web Components 适配器，Light DOM 行为宿主；`xh-dialog` 把「有状态组件也能框架无关」这件事验证掉
- **新增** WC 侧观察 Light DOM 增删并重新接线，抹平「运行期增删条目」上的适配器分叉
- **新增** WC 角色节点契约校验与 Custom Elements Manifest 生成，两者都进门禁
- **新增** 跨适配器一致性套件（conformance）：同一批判据在两套宿主上逐帧比对归一化后的 DOM，套件数从 1 个扩到 102 个，排除项改为显式登记
- **调整** playground 拆成 `playground-vue` 与 `playground-wc` 两个独立包，一环境一包

### 组件

- **新增** 102 个组件逐批铺开，每个都同时产出无头内核、Vue 组件、自定义元素与默认皮肤：从 Button / Dialog 起，经 Switch、Checkbox / Collapsible / Separator、Toggle / Progress / Badge、RadioGroup / Tabs / Accordion、Tooltip / Popover、Menu、Select / Avatar / Field、NumberField，到日期族与最后一批，双适配器铺满
- **新增** alert / spinner / skeleton / empty-state 四个反馈类组件
- **新增** Checkbox 三态
- **调整** Select 支持多选，选中值由单值改为集合：`SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`，`SelectApi` 的 `value` / `valueText` 变数组，`setValue` 签名变 `(next: string | string[]) => void`；Vue 侧 `update:value` 载荷与 WC 侧 `value-change` 的 `detail` 随之变化。见[选择器](./components/select)

### 视觉词汇表

- **新增** 三个正交的视觉轴：`variant` 形态（`solid` / `subtle` / `outline` / `ghost`）、`tone` 语气（`brand` / `neutral` / `success` / `warning` / `danger` / `info`）、`size` 尺寸（`sm` / 缺省 / `lg`）。语气做成与组件无关的共享一层，各组件的形态规则只消费它声明的私有槽——加一个语气改一处，不是逐个组件写六遍
- **新增** 34 个组件接入这套词汇表：按钮族与表单控件、十个输入类组件、以及标签页、步骤条、菜单族、分页、表格、对话框、抽屉等。没写轴的组件外观与接入前逐值一致
- **调整** 实心底上的前景色按实测对比度分派而非统一白字：600 档上白字对 brand 5.08、neutral 7.80、danger 4.83 达标，而 success 3.04、warning 2.70、info 3.47 都不到 4.5，这三族配深字
- **调整** 破坏性变更：`alert` 的 `variant` 改名为 `tone`。它原本的取值是 `success` / `warning` / `danger`——那是语气不是形态，与全库词汇表冲突。取值不变，只改属性名；同时移除公开导出的 `AlertVariant` 类型
- **调整** `toast` 的配色改走共享语气层，由 `type` 内部派生（`error` → `danger`，`loading` → 中性），公开 API 不变
- **调整** 三条轴由裸 `string` 收成联合类型，从 `@xihan-ui/kernel` 导出：`Tone`（六档）、`Size`（`sm` / `md` / `lg`）、`ControlVariant`（`outline` / `subtle` / `ghost`，十二个输入控件）与 `ActionVariant`（前者再加 `solid`，按钮族）
- **修复** `checkbox` 半选态的横杠此前不可见：方框只在全选时填色，半选保持画布底，而横杠用的是实心底上的前景色，白压白等于没画

### 自研替换第三方

- **新增** `@xihan-ui/position` 自研浮层定位引擎（包含块解析、缩放换算、翻面与避让、跟随更新），**移除** `@floating-ui/dom`
- **新增** 自研虚拟滚动内核，**移除** `@tanstack/virtual-core`
- **新增** WC 自研响应式基类，**移除** `@lit/reactive-element`
- **新增** `@xihan-ui/markdown` 自研解析与渲染，**移除** `markdown-it`
- **新增** 代码着色走端口，内置自研粗粒度词法器，可换 Shiki
- **调整** 至此全部库包的运行时第三方依赖只剩一个（`@internationalized/date`，仅日期族使用）。见[包与依赖关系](./npm-package-dependency)

### AI 与 Markdown

- **新增** `@xihan-ui/chat-stream` 协议内核与 AI 组件族第一批：SSE 读取、协议归一、parts 归约、会话 store，配 Thread / Composer / CodeBlock 三件与粘底原语，双适配器
- **新增** `@xihan-ui/markdown` 流式渲染内核，增量切块 + 稳定 key + 消毒
- **优化** Markdown 接上 CommonMark 官方用例的一致率棘轮，逐步实现缩进代码块、Setext 标题、跨行链接引用定义与列表松紧排布，一致率由 375 提升至 489

### 视觉层

- **新增** `@xihan-ui/backgrounds`：WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。流场跑片元着色器、粒子走 `gl.POINTS`，两通道共用同一段 GLSL；内置 14 个效果，不支持 WebGL2 时降级为 CSS 静态背景
- **新增** 两个适配器接上视觉层，各走独立子入口 `@xihan-ui/vue/backgrounds` 与 `@xihan-ui/web-components/backgrounds`，`@xihan-ui/backgrounds` 声明为可选 peer
- **修复** 修复画面在真实页面里一片空白的三个成因

### 图标

- **新增** Icon 原语：`IconRecord` / `IconNode` / `IconTag` 类型、`connectIcon`、`XhIcon`、`<xh-icon>` 与 `icon.css`。图标数据是结构化节点数组而非 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML 解析器
- **移除** 旧 `@xihan-ui/icons`（27 个第三方图标集的聚合，约四万个图标）整包移除并在 npm 上弃用，重写为只收自研图标的首方集，第一批 29 个覆盖组件库自用的全部语义

### 无障碍与质量门禁

- **新增** 无障碍扫描接上真实浏览器 runner 与 axe，逐个组件扫
- **新增** 键盘规格表机读化，作为测试的分母：用例少覆盖一条即判套件失败
- **新增** 产物契约门禁（publint + attw）、foundation 层框架无关门禁、依赖拓扑门禁
- **修复** 存量无障碍违规登记表清零，由 24 条降到 2 条（WC 侧 `steps` 一条，外加一条步骤重放豁免）
- **修复** 令牌 `fg-subtle` 达到 AA，并给对比度立下判据
- **修复** 焦点陷阱抓不住第一次逃逸；移除持有焦点的条目后不再让整组脱离 Tab 序列；删掉文件上传条目后把焦点交回投放区
- **修复** 浮层族改用 fixed 坐标系，不再被 overflow 祖先裁掉
- **修复** 挡住输入法组合态
- **修复** Dialog 三处：模态背景失活、非模态焦点域、收起态 hidden
- **修复** Field 的名字关联不再依赖 control 是可标注元素；Splitter root 不再输出 `aria-orientation`
- **修复** 消解层只在展开期间入栈，不再与开合无关地常驻
- **修复** 状态机停机后送入的事件一律静默丢弃，dev 下不再抛

### 工程

- **调整** 皮肤层令牌成为唯一事实源，删掉全部字面量兜底，跨组件共享的默认值全部令牌化
- **调整** 全仓注释改为只讲功能，不带设计过程引用
- **调整** 行尾一律 LF（`.gitattributes`），署名统一为 XiHanFun and contributors
- **新增** changesets 发布配置就绪：14 个公开包锁步同版，私有包不发布不计版
