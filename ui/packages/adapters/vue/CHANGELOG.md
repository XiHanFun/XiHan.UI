# @xihan-ui/vue

## 1.0.0-alpha.3

### Major Changes

- 516bd46: 浮层搬进单一落点，层号与背景失活跟着改口。

  ## 浮层不再原地渲染

  此前 20 个带 positioner 的浮层里只有 dialog / drawer / image-viewer 搬走，其余 16 个
  留在触发器旁边。坐标一直是对的（定位引擎特意处理了「祖先抢走包含块」），坏的是层叠序：
  宿主应用的祖先只要建了层叠上下文——`transform` / `translate` / `scale` / `filter` /
  `backdrop-filter` / `opacity` 小于 1 / `contain` / `will-change` / `position: sticky` /
  定位元素带 `z-index` / `isolation`——浮层的层号就退化成那个上下文里的局部序号，被任何
  上层兄弟盖住。这是库无法从自身约束的：宿主怎么写 DOM 不归库管。

  kernel 新增 `ensurePortalRoot(doc)`，在 body 末尾维护单一 `#xh-portal-root`，
  `RuntimeConfig.portalContainer` 的默认值指向它。Vue 侧 19 个浮层的 positioner
  （tour 连同 backdrop 与 spotlight）一律 Teleport 过去。落点自身一条样式都不写——
  子元素全是 `position: fixed`，不占布局，而任何 `position` / `transform` / `contain` /
  `isolation` 都会平白建出新的层叠上下文，正是要躲的东西。

  WC 适配器是 Light DOM，解剖契约就是「作者写在哪就在哪」，搬不动。改为在浮层展开时
  沿祖先链探一次层叠上下文，命中就投一条诊断，指名是哪个祖先的哪条属性。

  **破坏性**：浮层的 DOM 位置变了。按 `wrapper.querySelector` 之类以挂载根为基准取浮层
  节点的代码要改从 `document` 取。

  ## 遮罩式浮层并到同一档层号

  `--xh-z-drawer` 删除，`--xh-layer-drawer` 与 `--xh-layer-modal` 解析到同一个值。

  原先抽屉 1000 低于对话框 1100，而两者都在同一个栈上下文里，纯靠数字定序：从对话框里
  拉出抽屉时，抽屉连同自己的遮罩一起沉在对话框遮罩底下，用户只看到画面又暗一层、什么都
  没出现，而焦点已经陷进看不见的面板。反方向是对的，所以这是只在一个方向上炸的组合。
  并档之后先后交给 portal 顺序决定，与对话框套对话框的现有行为一致。

  **破坏性**：`--xh-z-drawer` 这个名字没有了。改用 `--xh-layer-drawer`。

  ## 背景失活改走祖先链

  `hideOutside` 此前只遍历 body 直接子元素，判据是「这个子元素包含 target 就整块放行」。
  WC 适配器的浮层长在作者写它的位置，应用只要有一层根容器（`#app` 之类）就会因包含浮层
  被整块豁免——模态对话框身后的整个应用对读屏依然完全可遍历，不认外点关闭的
  `alertdialog` 更是完全可点。改成沿每个 target 到 body 的祖先链逐层罩住其余兄弟。

  `data-xh-inert-exempt` 的语义随之扩大：带标记的元素及其后代不被罩住，**其祖先只递归、
  不整块罩住**。通知队列因此在任意嵌套深度都能保持可点，外点判定也一并豁免（点通知不再
  把模态关掉）。

  ## 其余
  - `--xh-editable-preview-line-height` 删除，改用 `--xh-editable-preview-min-h`：预览态
    原先拿行高冒充高度，实测比同组件的编辑态高 2px，切换时跳一下。
  - tooltip 与 navigation-menu 入层栈，Escape 不再连它们下面的对话框一起关掉。
  - 定位引擎新增 size 中间件，回报可用空间与锚点宽度；菜单族补上高度上限与内部滚动。
  - 包含块判定补齐 `translate` / `rotate` / `scale` 独立属性与 `backdrop-filter`。
  - 滚动锁补滚动条补偿与滚动根探测。

- d0202b2: **选择态一族（table / tree / transfer）的选中集合统一叫 `selection`。** 三个组件表达的是同一件事，
  却各叫各的：table 是 `selection`、tree 是 `selectedValue`、transfer 是 `selected`。1.0 之后 prop 名
  就是公开 API，趁 alpha 一次改完，不留别名。

  三家统一为 `selection` / `defaultSelection`，回调仍是 `onSelectionChange`，载荷字段一律 `{ value }`
  （全库同类载荷都用 `value`，transfer 的 `{ selected }` 是唯一破例）。

  迁移点：

  - tree：prop `selectedValue` → `selection`、`defaultSelectedValue` → `defaultSelection`；
    `TreeApi.selectedValue` → `selection`、`setSelectedValue` → `setSelection`；
    机器事件 `SELECTED.SET` → `SELECTION.SET`；Vue 的 `v-model:selectedValue` → `v-model:selection`；
    WC 的 `el.selectedValue` → `el.selection`、`el.defaultSelectedValue` → `el.defaultSelection`。
  - transfer：prop `selected` → `selection`、`defaultSelected` → `defaultSelection`；
    载荷 `TransferSelectionChangeDetails.selected` → `value`；
    `TransferApi.selected` → `selection`、`setSelected` → `setSelection`；
    机器事件 `SELECTED.SET { selected }` → `SELECTION.SET { value }`；
    纯函数入参与 `TransferMoveInput` / `TransferMoveResult` 的 `selected` 字段 → `selection`；
    Vue 的 `v-model:selected` → `v-model:selection`，默认插槽载荷 `selected` → `selection`、
    `setSelected` → `setSelection`；WC 的 `el.selected` → `el.selection`、
    `el.defaultSelected` → `el.defaultSelection`。
  - table 本来就是这套名字，不变。

  三者的语义各不相同，改的只是名字：table 的 `selection` 可以是 `'all'`，tree 分单选/复选，
  transfer 的 `selection` 是两侧的勾选集合，与「已搬到右侧」的 `value` 是两回事。

### Minor Changes

- 906b712: 真机 axe 扫出的无障碍缺陷逐条修，并把三个模态补进扫描名单。

  **dialog / drawer / image-viewer 此前从没被真机 axe 扫过**：它们的 presence 模型与共享套件对不上，各自单开了一份 WC 规格，因而不在扫描名单里——而焦点陷阱、`aria-modal`、背景 inert 恰恰最该在真浏览器里验。补进名单后三者全绿。

  同一次扫描照出四类既有缺陷：

  - **side-nav 折叠成图标栏后，行按钮与链接没有可及名**（critical + serious，14 条）：皮肤把 `branch-text` / `link-text` 整个 `display: none`，可及名随之归零——读屏用户在折叠侧栏里完全不知道每一项是什么。改成仓内既有的视觉隐藏配方（文字仍在无障碍树里），可及名恒等于可见文本，不必再让连接层去猜名字，也不会覆盖作者自己写的 `aria-label`。
  - **side-nav 的 `ul` 直接装 `a`**（serious，19 条）：Vue 适配器早就偷偷包了一层没登记的 `<li>`。把它提成正式的 `item` 部件（解剖 / connect / meta / 两个适配器 / 套件 / 示例同步），与同族的 breadcrumb、anchor、navigation-menu 一致。
  - **有值时下拉钮被藏掉**（date-picker / time-picker / combobox）：清空钮的互斥契约此前让「清空钮顶替下拉钮」，但这三家的 `trigger` 是打开浮层的那颗按钮而不是装饰箭头——藏掉它，鼠标用户在有值之后没有入口，浮层收起时的焦点归还也会落到隐藏节点上，键盘用户当场丢失位置（真机里 Escape 后焦点掉到 `body`）。改为只有纯装饰的 `indicator` 才让位（select / cascader / tree-select 那三家），这三家的清空钮与下拉钮并排显示。
  - select 的隐藏原生 `select` 在派生用例里被插了两份，第二份没有接线因而没有可及名——套件的 fixture 助手补幂等判断。

  `data-name` 这类写成常量再当计算键用的属性，此前公开面采集器的正则扫不到，基线漏登记；采集器补上常量形态。新增 `check-release-tag`：标签写的版本号必须与 changesets 的 pre 模式对得上，否则打 `v1.0.0` 却发出 `1.0.0-alpha.N`、或退出 pre 后打 `v1.0.0-rc.1` 直接占掉 `latest`。

- e12e337: 日历可以并排展示连续几个月，date-picker 的区间选择默认就是两个。

  区间的起止常常跨月，只有一个面板就得「点起点 → 翻页 → 点终点」，翻的时候还看不见起点在哪。
  两个并排是这类选择器的通行做法，也是这次补上的。

  - **calendar 新增 `visibleCount`**（默认 1）与 **`panels`**：一个锚点铺出 N 个连续月，
    翻页只动锚点、整窗一起走一个月，不是各翻各的。跨年自然接上（12 月的下一个面板是次年 1 月）。
  - **`getGridProps` / `getHeadingProps` 收面板下标**，每个面板一份标题 id，网格各由自己那行标题命名。
    不给下标即首个面板，旧调用一字不改。
  - **`CalendarCellProps` 多一个 `index`**：同一天会同时出现在两个面板里（8 月末那几天也铺在 9 月首行），
    「是不是本月」只有连着面板一起看才判得出来。
  - **往后翻的边界按整窗算**：新露出来的是窗口末尾再往后一个月。单面板时与从前逐字一致。
  - **date-picker 新增 `visibleCount`**，缺省单选 1、区间 2。
  - 皮肤只在 `content` 直接摆了两张日历时才横排（`:has`），并给第二张起画一道左分隔线——
    `showTime` 那套结构里 content 的直属子节点是作者自己的包裹块与确认行，无条件横排会把它们并到日历旁边去。

  旧字段 `weeks` / `visibleMonth` / `headingLabel` 保留，恒指首个面板。

- ff84a16: 日历补上按月 / 季度 / 年 / 周挑，并修掉多面板下的两处硬伤。

  **面板粒度 `view`**（`day` 默认 / `month` / `quarter` / `year`）

  格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态——min/max 比较、区间逻辑、
  不可用判定、表单出口于是全都原样复用。点 Q3 落的就是 `2026-07-01`。

  - 月面板一年 12 格、季度 4 格、年面板一页十年（两端各带一格邻十年，与日视图带邻月同一套做法）
  - 一页翻多久跟着视图走：日 1 个月、月与季度 12 个月、年 120 个月；翻页边界同样按整页算
  - 标题按 locale 出：`2026年8月` / `2026年` / `2020年-2029年`
  - 网格上多一个 `data-view`，皮肤据此换排布（月与年 3 列、季度 4 列）；日视图一个字没动

  **周选 `weekSelection`**：点任意一天落的是它所在的整整一周（两端一起给），周首日随 locale。
  只在 `view=day` 且区间模式下生效，其余情形照旧只落这一天。

  **修：点第二个面板里的日子会整窗往后翻一页**

  视窗起点此前直接由聚焦日反推，于是点右边那个面板 → 聚焦日落到下个月 → 整窗跟着走，
  看着就像「点一下翻一页、根本选不中」。现在视窗是独立的浏览位置，只在聚焦日走出视窗时
  才挪过去，挪到刚好把它露出来的那一端。

  **修：浮层展开后指针那条路没有出口**

  上一版把触发钮变成可选部件后，点输入行只能展开、不能收起——而段位里敲出来的值又不触发
  「选完即收」（那时人还在打字），于是浮层关不掉。现在点输入行是开合对称的，段上按 `Enter`
  也收起（`Alt+ArrowDown` 展开的对偶）。

- a55c76e: 日历补上快速翻年、周选整周预览，日期示例按粒度重整。

  **« / » 快速翻**：新增 `prev-year-trigger` / `next-year-trigger` 两个可选部件（不写即不渲染），
  步长跟着视图走——日视图一年，月与季度十年，年视图一百年（它的 `‹ ›` 本来就走十年，
  大步得更大才有用）。边界与 `‹ ›` 各判各的：上界卡在今年之内时，下一页还翻得动、整年跳出去就按不动了。

  **周选悬停整周亮**：`weekSelection` 下指针扫过哪一行哪一行整整七天一起亮，与点下去的结果对得上。
  此前沿用的是「起点 → 悬停点」那一段，一格一格拉出来的区间在周选里讲不通。不开周选时照旧。

  **示例重整**

  - 天 / 周 / 月 / 季度 / 年归拢成一个「五种粒度」示例，一套结构走完
  - 「区间选择」补齐五种粒度，都是并排两页
  - 删掉旧的「按月选择」——它是 `view` 出现之前手搓的一版面板（拿 `XhButton` 拼的），
    与新的 `view="month"` 长相不一致；它想演的「输入行只留年月两段」并进新示例，
    按年挑就只留年那一段

- 089db90: 清空 / 关闭 / 移除按钮收成四类契约（`开发设计/UI.ClearTrigger.Contract.md`），`check-clear-trigger` 门禁固化。

  **内嵌清空钮**（cascader · tree-select · combobox · date-picker · time-picker · text-field · tags-input · select，以及新增部件的 popselect · date-field · time-field）统一为：`tabindex=-1` 不占 Tab 位但**不再 aria-hidden**——读屏按 `aria-label` 找得到它，文案统一走 `translations.clearTrigger`（缺省 `'Clear'`；select 的 `clear` 键改名）；pointerdown 不夺焦，点完发 `VALUE.CLEAR` 并把焦点送回宿主（trigger / input / 第一段）；没值就 `hidden`，不再同时打 `disabled`/`data-disabled`、皮肤也不再留一颗永远看不见的灰钮；尺寸与圆角统一为 `var(--xh-<c>-action-size, var(--xh-control-action-size))` / `var(--xh-<c>-action-radius, var(--xh-shape-control))`——text-field 此前与输入框等高、select / tags-input 按指示符尺寸走 pill，`--xh-text-field-clear-*` / `--xh-tags-input-clear-*` / `--xh-select-clear-*` 槽改名 `action-*`；互斥一律由 connect 在被让位的部件上打 `data-clearable`、皮肤一条 `display: none`——select 去掉了 `:has()` 让位与 `:hover` 才显形（触屏此前根本看不到清空钮），清空钮改为 trigger 的兄弟并排（`--xh-select-control-gap`）。

  **键盘清空**：select · cascader · tree-select · popselect 此前没有任何键盘清空路径。现在焦点在 trigger、有值且可编辑时 **Delete 清空全部、Backspace 单选清空 / 多选去掉最后一个**，键盘表与一致性套件同步。

  **select** 补 `readOnly`（浮层照常展开、值改不动、清不掉）与 `VALUE.CLEAR` 事件（`api.clear()` 不再借 `VALUE.SET []`）；Vue 的 select / combobox Root 新增 `clearable`（缺省 false）决定 collection 自动渲染树是否带清空钮——combobox 此前无条件渲染，示例已补 `clearable`。

  **独立动作钮**（file-upload · signature-pad）：file-upload 的 `api.clearFiles()` 改名 `clear()`、`translations.clearFiles` 改名 `clearTrigger`；列表为空时不再原生 disabled（清完焦点会掉回 body），只打 `data-empty` 压淡。

  **浮层关闭钮**（dialog · drawer · popover · tour · toast · alert · floating-panel · image-viewer）统一 `var(--xh-<c>-close-size, var(--xh-control-h-sm))` / `var(--xh-<c>-close-radius, var(--xh-shape-control))`，dialog / drawer / popover / tour 补上使用者槽；image-viewer 保持 `--xh-control-h-lg`（全屏看片的 chrome 钮按触控靶走）但圆角归 control。**标签内移除钮**（tag · tags-input item · select tag）尺寸基准 `--xh-control-indicator-size`、圆角 `--xh-shape-inset`；行级删除钮（file-upload item · dynamic-input）按 `--xh-control-action-size` / `--xh-shape-control`。

  四类按钮都补了 `:active` 按压反馈（`--xh-motion-scale-press`），27 处登记进 `check-press-feedback`。

  `--xh-select-clear-*` / `--xh-tags-input-clear-*` / `--xh-text-field-clear-*` 共 20 个槽名变更是公开面删减，基线已推。

- ada8a01: 全局配置做成真正的 ConfigProvider：全局默认 + 局部覆盖，两个适配器一份语义。

  **嵌套注入改成逐键合并。** 此前子树里再 `provideXhConfig` 会把外层整份遮蔽——只想改一句文案，外层的 `locale` 与 `portalContainer` 一并丢掉，而文档一直把「不同子树各注各的」当卖点。现在键缺席与写成 `undefined` 都算「这一层没说」，一律回落外层；同一个组件下的文案也按键并。

  **Web Components 侧补上作用域。** 新增 `<xh-config>`：包住一棵子树，里面的元素沿 DOM 祖先链解析配置，合并规则与 Vue 侧完全一样（那边找组件树，这边找 DOM 树）。`setXhConfig` 仍管整页。元素自己不渲染任何东西，`display: contents`。

  **新增两个字段。** `size` 是尺寸档的应用级默认（对齐 AntD 的 `componentSize`），落到每个声明了三轴 `size` 的组件上；`floating-panel` 的 `size` 是一对像素数、同名不同义，两侧都在豁免名单里。`scrollRoot` 交出真正在滚的那个元素——宿主把滚动搬进内容容器时 `body` 本身不滚，模态浮层的滚动锁此前是空操作。`dir` 刻意不收：它走 DOM，行为层从计算样式读，再加一条 JS 通道只会对不上。

  **补上三处漏接。** `context-menu` 与 `tree-select` 声明了 `translations` 却没走 `withXhConfig`，全局文案对它们一直静默失效；`XhTranslationOverrides['date-field']` 指的是 `DatePickerTranslations`（`startDate` / `endDate`），而 `date-field` 的文案是逐段映射，类型过得去、运行期 100% 不命中，现改为 `DateFieldTranslations` 并把它从空接口填成段位映射。

  新增 `check-config-wiring` 门禁：两侧配置面字段必须一致、`size` 豁免名单两侧一致且与 headless 的类型对得上、声明了 `translations` 或三轴 `size` 的 Vue 组件必须真接上配置通道。

- e2292bf: date-picker 与 time-picker 补上三条视觉轴：`variant` / `tone` / `size`。

  这两个组件此前是全仓仅有的两处「有输入行却没有形态轴」——同一张表单里，
  文本框、数字框、分段日期、分段时间都能换档，唯独这两个换不了，只能靠覆盖令牌硬凑。
  它们各自内嵌的 `date-field` / 分段时间输入早就有三轴，缺的一直是外层这一份。

  轴的落法与全仓一致：三个属性只写在 `root` 上，输入行、日历格与浮层里的列都从那里继承皮肤声明的私有槽，
  所以换一档不必给每个部件各写一条选择器。

  皮肤同步把两份里原先散着的写死值收成私有槽：

  - 尺寸档换 `control-h` / `control-px` / 两档字号（time-picker 还多一个列表格子的内边距）
  - 形态档换底色与两档描边；输入类照例不做实心档——填满一个要往里打字的框，字与底没法同时读
  - 语气只落在聚焦环、段位反白、时间列选中与确认按钮上，正文与日期数字不归它管

  不写这三个属性时一个 `data-*` 都不产出，皮肤走缺省档，观感与之前逐像素一致。

- d0202b2: 开箱默认语言跟随运行时，兜底英文。

  此前是自相矛盾的：i18n 文档明写「内建文案默认是英文」，而日期系的兜底 locale 写死 `zh-CN`（calendar / heatmap / time 三处常量）——开箱就是**英文按钮配中文月份名**，热力图图例还是「少 / 多」。命令式 dialog 的按钮也硬编码着「确定 / 取消」，而那个服务自建 `createApp` 挂在 body 上，根本读不到组件树里的 `provideXhConfig`。

  现在 kernel 提供一条解析链 `resolveLocale(locale, scope)`：**作者显式传的 locale → 全局配置 → 宿主 `navigator.language` → `en-US`**。宿主读取一律经 `config.scope`（SSR 安全）。calendar / heatmap / date-field / date-picker / time 全部接上；`RuntimeConfig.locale` 的 `zh-CN` 兜底同改。

  **行为变更（预期之内）**：默认周首日随之从周一变成周日（`en-US` 口径）——要固定就显式传 `locale` 或 `firstDayOfWeek`。同时修掉一个此前没有测试覆盖的连带 bug：日历的周序号原先取每行**行首**那天算 ISO 周数，注释写着「行首正是周一」；周首日变成周日后，周日在 ISO 里属于上一周，整列周序号会集体少 1——改成取行内第 4 天，两种周首日下都必落在本行覆盖的那个 ISO 周内。

  `TimeProps.locale` 此前是 `'zh-CN' | 'en'` 的窄联合，与全局配置的 BCP 47 `locale` 对不上：配 `de-DE` 会让所有非 `'en'` 的语言（含 `en-US`）拿到中文用词。类型放开为 `string`，判据改成 `zh` 前缀匹配，`TimeLocale` 直接删除、不留别名。`HEATMAP_LEGEND_TEXT` 的「少 / 多」改 `Less / More`。

  `createDialogService` / `createToastService` 新增 `config?: XhConfig` 选项——服务在自己那棵子树里 `provideXhConfig` 一次，不造全局单例；按钮兜底改 `OK` / `Cancel`。

  登记未接的两处（都写进了 i18n 文档）：`time-picker` / `time-field` 的 `locale` 只影响小时制推断，接上宿主会让 `en-US` 环境静默翻成 12 时制，属另一条裁决；`heatmap` 的 `firstDayOfWeek` 是独立的 prop 轴，不随 locale 走。

- 0be028c: 抽屉可以挂在页面里的某一块区域上了，`portalContainer` 也不再是个死字段。

  `RuntimeConfig.portalContainer` 自打声明起就没人读过——全部浮层的搬运目标一律写死 `'body'`，
  所以「局部抽屉」根本做不出来。这次两头一起接：

  - **drawer 新增 `contained`**：遮罩与定位层从 `fixed` 换成 `absolute`，只罩住最近的定位祖先而不是盖满整屏。
    `data-contained` 同时落在 root / backdrop / positioner / content 上，页面里那半边与被搬走的那半边都能选到。
  - **Vue 新增 `container`**（选择器或元素）：浮层搬进那个容器，并**隐含 `contained`**——
    一处给定、两件事从它派生，不会出现「搬进去了但还画着全屏遮罩」这种两边各说各话。
    显式写了 `contained` 以显式的为准。
  - **`portalContainer` 真正接上**：`XhConfig` 多一个同名字段，应用级注入一次，
    没写 `container` 的浮层就落到它给的容器里；都没有才落 `body`。
  - **Web Components** 是 Light DOM，作者写在哪浮层就在哪，因此只需要 `contained` 这一个属性来让皮肤按容器画。

  那个容器要自己带 `position`（`relative` 之类），否则 `absolute` 会往上找到别的定位祖先——
  这一条写进了 props 说明与示例。

- 1b7a5f1: 统一性审计收口后的六条遗留项。

  **px 与 rem 按口径归位。** 字号七档 `--xh-font-size-xs…3xl` 从 px 改为 rem（0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75rem，根字号 16 时像素不变，使用者改根字号时整套排版随之缩放）；字形与控件几何改为 px：`--xh-glyph-size-sm/md/lg` 16 / 20 / 24px、`--xh-glyph-size-xl…4xl` 32 / 40 / 56 / 72px、`--xh-control-action-size` 24px（compact 20px）、`--xh-control-indicator-size` 16px（compact 14px）；color-picker 的动作钮与色块同样归 px。

  **side-nav 折叠态换枝播退场。** 机器里弹出面板的坐标改为按分支记账（`popoutPlacements`），换枝时旧面板保留坐标、`data-state=closed` 播 `xh-pop-out`，新面板同帧 `open` 播 `xh-pop-in`；此前旧面板的坐标在新枝 OPEN 那一拍被作废，退场瞬时。

  **tree-select 的 Vue Root 补 collection 自动渲染树。** 没给默认插槽且传了 `collection` 时自动铺 label? / trigger / clear-trigger? / positioner / content / tree（分支与叶子递归），新增 `label` prop 与插槽、`clearable` prop（缺省 false）；自动树与手写树 DOM 逐字同构，与 select / combobox 同口径。

  **门禁与测试整洁。** 三道浮层门禁共用 `tooling/scripts/lib/overlay-families.mjs`（名单与核实逻辑一份，各门禁的子集差异写明）；27 处测试里为旧 kernel 缺省桩的 `matchMedia` 删掉（减弱动效探测无 matchMedia 时已一律不减弱）。

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

- 1e90ce6: 热力图新增 `palette` 色板轴：`green` / `blue` / `orange` / `purple` / `red` / `gray`，直接按颜色点名色阶满档那一端，三种形态与图例一起跟着走。它是装饰性的一条轴，不是第四条语义轴——与 `tone` 同时写时听色板的，两条都压不过作者自己写的 `--xh-heatmap-ink`；不写时行为与之前逐字一致。

  令牌层随之补上紫色原语 `--xh-color-purple-600`：明度与彩度照 danger 的 600 档，只把色相换成 302。

- 8d35702: 动效与浮层口径收口（`开发设计/UI.MotionOverlay.Contract.md`）。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- d738f78: `date-picker` 与 `time-picker` 新增快捷选项：给 `presets` 数据就在浮层里多排一列（「今天」「近 7 天」「此刻」这类），点一条整份写进值。新增 `presets` / `preset` 两个部件、`getPresetsProps` / `getPresetProps` 两个产出与两条键盘行；这一列自成一套 listbox 键盘，与日历网格、时分秒那几列互不抢键。

  单日的值就是一条 ISO 日期串，区间用 ISO 8601 的区间写法把两端拼起来（`2026-08-15/2026-08-21`），一个串同时充当这一项的身份。日子由使用者算好传进来——连接层每帧求值，`today()` 放进渲染期会跨零点算出两个答案；headless 备了 `datePickerPresetDay` / `-Range` / `-Month` / `-Year` 与 `timePickerPresetNow` 五个纯函数。

  date-picker 的收起沿用 `closeOnSelect` 那条守卫（区间要两端齐、showTime 仍由确认按钮收口）；time-picker 的快捷选项给的是整份时间，写完即收。

- 9548330: 新增 `scrollbar` 组件：自绘滚动条，挂在**任意一个**滚动容器上——表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行，不必是本组件的后代。此前这套东西焊在 `scroll-area` 里，只有连视口带内容一起交出去的场景用得上。

  解剖 `root` / `track` / `thumb` 三层必需、`corner` 可选（横竖两条同时摆着时写在其中一条里补交叉口，配合 `gutter` 让两条各自让出那一格）；四种露面时机（`auto` / `always` / `scroll` / `hover`）带收起延时；拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限、成段的 `scroll-start` / `scroll-end` 与 `drag-start` / `drag-end` 都在库里。`focusable` 打开后滑块进 Tab 序、报 `role="scrollbar"` 与三个 `aria-value*`，方向键 / 翻页键 / Home / End 可用；缺省不进 Tab 序也对读屏隐藏——滚动本身由滚动容器报，同一件事没必要报两遍。触屏（粗指针）上默认交给原生滚动，整条不画并带 `data-native`，`forceVisible` 打开才画。收起不再打 `hidden`，而是 `data-state=hidden` 由皮肤淡出（`visibility` 随退场播完才收），露出同样淡入；根上另有 `data-hover` 标指针在不在这一片。

  **`scroll-area` 改由 `scrollbar` 组装。** 滚动区不再有自己的机器：它是视口加两条 scrollbar——`scrollbar` 角色节点是那条滚动条的挂载点、同时充当它的根，里面照 scrollbar 的写法摆 `track` / `thumb` / `corner`（戴 `data-scope="scrollbar"`），显隐、拖动、键盘、几何、触屏原生、淡入淡出全是 scrollbar 那一套，两个组件共用一份滚动条。Vue 新增 `XhScrollAreaTrack`；交叉口 `corner` 改写在竖条的挂载点里，两条都显形时才露；`scroll-area` 新增 `size` / `forceVisible`；视口的占道改打在视口自己身上（`data-lane-vertical` / `data-lane-horizontal`），不再依赖 `:has()`。原 `--xh-scroll-area-thumb-*` / `-bar-*` / `-corner-bg` 那几个槽随之归到 `--xh-scrollbar-*` 名下；`scrollAreaMachine` / `ScrollAreaSchema` / `SCROLL_AREA_*` 导出不再有，连接层改收两台 scrollbar 机器与 props（`scrollAreaScrollbarProps` 给出每台的 props）。挂了自绘滚动条的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此藏掉原生滚动条的外观——表格放进滚动区即可滚（吸顶表头与吸附列钉在视口上），虚拟滚动的视口给个 id 用 `controls` 挂上即可。

  滚动容器换了会自动把监听挪过去（`scrollable` / `controls` 指向另一个节点、或条件渲染的容器重建）；查不到时投一条 `scrollbar.missing-scrollable` 诊断，不静默，容器后到时调一次 `api.measure()` 即接上。容器里内容长短变了会自动重量（`MutationObserver` 盯着子树，一拍内合并成一次），量不到的场合另有 `api.measure()`。

- 35c9b65: 四家分段控件（date-field · time-field · date-picker · time-picker）的盒内布局统一。

  **解剖新增 `segment-group`**：包住全部段位与作者写在段间的分隔符。date-field / time-field /
  time-picker 三家新增这个部件，date-picker 已有的分段容器 `input` 改名为它——四家从此同名同职。
  time-picker 的 `input` 仍是段位本身（多实例），语义不动。

  破坏性改动：

  - `date-picker` 的 `input` 部件改名 `segment-group`，不留别名。
    - `getInputProps` → `getSegmentGroupProps`；`DatePickerInputProps` → `DatePickerSegmentGroupProps`。
    - Vue `XhDatePickerInput` → `XhDatePickerSegmentGroup`。
    - WC `@csspart input` → `@csspart segment-group`（作者标记写 `data-xh-part="segment-group"`）。
  - `--xh-time-field-segment-fg-placeholder` → `--xh-time-field-placeholder-fg`；
    `--xh-time-picker-segment-fg-placeholder` → `--xh-time-picker-placeholder-fg`。
  - `--xh-time-picker-column-max-h` → `--xh-time-picker-column-h`（列改定高）。
  - `--xh-date-picker-content-p` → `--xh-date-picker-content-py` / `-px`；
    `--xh-time-picker-content-p` → `--xh-time-picker-content-py` / `-px`。

  作者要把段位与分隔符挪进 `segment-group` 里，清空钮与展开钮留在 `control` 直属：

  ```html
  <div data-xh-part="control">
    <div data-xh-part="segment-group">
      <span data-xh-part="segment"></span>
      <span>:</span>
      <span data-xh-part="segment"></span>
    </div>
    <button data-xh-part="clear-trigger"></button>
  </div>
  ```

  行为与外观：

  - 尾部按钮一律靠框内末端，靠 `segment-group` 的 `flex: 1 1 auto` 顶；
    time-field 清空钮与 time-picker 展开钮的 `margin-inline-start: auto` 删掉。
  - 四家 `control` 的 `gap` / `block-size` / `padding-inline` / `min-inline-size` 逐条同值，
    `gap` 随尺寸档走 `--xh-control-gap-sm/md/lg`。
  - 时间列定高：`time-picker` 的 `column` 与 `date-picker` 的 `time-column` 走 `--xh-viewport-h-sm`，
    两家的快捷选项列同档；两家浮层补上最大高度。
  - 段位内衬统一 `--xh-space-1`；标题不再写 `cursor`；`:focus-within` 一律带 `:not([data-disabled])`；
    time-picker 聚焦时补画聚焦环；图标尺寸随尺寸档走 `--xh-glyph-size-sm/md/lg`。

- bbc3431: select 浮层多出一个底部操作区：「新建」「全选」这类按钮终于有地方放了。

  原来放不进去有两条硬理由，都不是样式能绕的：`content` 既是 `role="listbox"`
  （而 listbox 只许拥有 option 与 group，塞按钮进去是违规），又是那个 `overflow-y: auto` 的滚动容器
  （放进去的按钮会跟着条目滚走）。所以这次把两件事拆开：

  - **`content` 退成浮层外壳** —— 描边、底色、阴影、整体尺寸与键盘收口归它，它自己不滚。
  - **新增 `list` 部件** —— `role="listbox"`、条目的拥有关系、滚动与那个「无锚点时兜底的 Tab 位」全在它身上。
  - **新增 `footer` 部件** —— `list` 的兄弟。因此它既不进列表框的拥有关系，方向键与连打检索也走不到它，
    条目多到要滚时它仍贴在下沿不动。

  **破坏性变更（alpha 期）**：条目现在要写在 `list` 里。

  - Vue：`<XhSelectContent>` 与条目之间加一层 `<XhSelectList>`；底部操作区用新增的 `<XhSelectFooter>`。
    只传 `collection`、不写插槽的那条路由组件自己铺好，一个字都不用改。
  - Web Components：`<div data-xh-part="content">` 里加一层 `<div data-xh-part="list">` 包住条目。
    `list` 已列进 `requiredParts`，忘了写会在诊断通道上报 `wc.missing-part`，不会静默丢掉列表框语义。
  - `trigger` 的 `aria-controls` 随之改指 `list`（它才是那个列表框）。

- 4abe899: 统一性收口的头两批：先立门禁让跑偏能红，再补语义令牌把皮肤里的原语引用与互异的字面量收成一处。

  **海拔改按角色走。** `--xh-elevation-0…4` 五档删掉，换成三个角色：`raised`（静态抬起面：卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）、`floating`（锚定浮层：下拉、菜单、popover、hover-card、tooltip）、`sheet`（遮罩式与通知：dialog / drawer / toast / tour / floating-panel / float-button / back-top）。深色主题的三档更重、外加一圈 1px 浅描边，暗底上浮层才分得出层。34 份皮肤全部迁过去，`check-elevation-role` 校验每处阴影都走角色、且 27 个浮层/遮罩面的角色与部件对得上。这是公开面的删减，基线已推。

  **字号不再下探原语。** 新增 `--xh-control-font-sm/md/lg`（控件主文字，与 `--xh-control-h-*` 同构按档走）、`--xh-control-caption-sm/md/lg`（控件里的次级文字：提示、计数、快捷键、清空钮，比同档主文字低一级）、`--xh-text-heading-1/2-*`、`--xh-text-caption-size`、`--xh-text-secondary-size`。皮肤里两百三十处 `--xh-font-size-*` 引用全部换成语义档；typography 的六级标题与 rating 的星标是字号阶梯本身，登记为例外。`check-text-scale` 守住。

  **默认宽度、内衬、轨道、折叠面的共享字面量收成令牌。** `--xh-control-min-w`（12rem）统一了 select / combobox / tree-select / cascader / color-picker / date-picker 六个触发器此前的六个值，time-picker / text-field / date-field / time-field / password-input 五家此前没有任何宽度声明，现在同样接上；`--xh-surface-py/px-sm/md` 统一了 dialog / drawer / tour / floating-panel / toast 的内衬；`--xh-track-thickness` / `--xh-track-thumb-size` 给滑杆与进度条；`--xh-nav-link-max-w`、`--xh-viewport-max-h`、`--xh-motion-scale-drag`（减弱动效归 1）、`--xh-glyph-size-text`（跟文字走的字形尺寸）、`--xh-control-box-sm/md/lg`（pin-input 的方格，随 compact 收）、`--xh-switch-track-h-*`、`--xh-syntax-string/number/keyword`（code-block 与 json-viewer 的语法色，随主题明暗切换，皮肤里不再有 hex 字面量）。`check-shared-slots` 新增「同后缀跨组件字面量互异也报」。

  **聚焦态描边统一成一派。** 此前三派：描边不变只画环、描边跟着环色走（语气轴在这一派整个失效）、只画环不管描边。现在 21 份输入类皮肤都写 `border-color: var(--xh-<c>-<part>-border-focus, var(--xh-_tone, var(--xh-border-control-focus)))`，新令牌 `--xh-border-control-focus` 缺省等于 `--xh-border-control`；time-field 聚焦补上了此前缺的环。`check-focus-ring` 加校验。

  **图标尺寸接线。** 38 份画兜底字形的皮肤在 root（浮层族在 content）上声明 `--xh-icon-size: var(--xh-<c>-icon-size, var(--xh-glyph-size-text))`，兜底字形的盒同样按它量——作者往指示符槽塞 `<XhIcon>` 时不再从 1em 跳到 20px。`check-icon-size` 守住。

  **几何修正。** pin-input 的方格此前缺省引的是 lg 档高度、sm 档引 md；segmented 横排外盒此前 38px（item 32 + 轨道内衬 + 描边），现在外盒本身即一档控件高、段撑满轨道内侧；checkbox 的方框锚在 `--xh-control-indicator-size` 上随 compact 收；checkbox-group 的指示符不再是 16px 字面量。radio-group / checkbox-group / composer 的禁用态去掉叠加的不透明度（与容器一起变淡会把对比度压穿）。

  **门禁。** 新增 `check-stroke-scale`（描边宽度只走 `--xh-stroke-*` / ring）、`check-keyboard-suites`（键盘表非空 ⇒ 一致性套件存在且两个适配器都登记）；`check-control-height` 按「组件 → 控件本体部件」显式管辖（button / toggle / segmented / pagination 等此前在门禁外）并校验 sm/md/lg 档位与 `data-size` 对应；`check-disabled-contrast` 改正则并加跨块判定；`check-shape-scale` 扩到逻辑角与私有槽；`check-keyframe-refs` 增扫适配器源码里的内联动画名（反馈服务的加载徽记改用 Web Animations，不再依赖某份皮肤在场）；`check-state-vocabulary` 接上 `state-vocabulary.json` 真源（`data-state` 的 43 个取值分 9 个族，connect 字面量与皮肤选择器两头对表，并报告「发射但零引用」的属性）；`check-token-refs` 禁皮肤里的颜色字面量。

  **套件。** 补 image-viewer（8 行键盘表，Tab 循环两行 jsdom 豁免）与 side-nav（10 行含折叠态弹出）的一致性套件，Vue 与 WC 两侧登记。

- 35c9b65: 相似组件与组合组件的视觉、动效、行为收成一套口径（`开发设计/UI.VisualConsistency.Contract.md`）。

  **盒的定义统一了。** 此前 16 个输入 / 选择控件有三种「盒」：9 家由 `control` 画描边与底、5 家由 `trigger`（一个 `<button>`）当盒、2 家由 `input` 自画。盒是 button 的那 5 家（select · cascader · tree-select · popselect · color-picker）没法把清空钮放进框里，只能贴在框外——这就是「清空钮位置不统一」的总根因。现在判据只有一条：**解剖里有 `control` 就是盒**，`trigger` 退化成盒内那颗 `flex: 1 1 auto; border: 0; background: transparent` 的按钮，聚焦环改画在 `control:focus-within` 上。cascader / tree-select / popselect / color-picker / text-field 的解剖新增 `control` 部件。

  **尾部按钮一律在框内最右。** 盒内布局恒为「内容区 `flex: 1` → 尾钮组 `flex: none`」。段位并排、没有单一容器的四家（date-field · time-field · date-picker · time-picker）新增 `segment-group` 部件把段位与分隔符包起来当内容区（date-picker 原有的 `input` 分段容器改名 `segment-group`，四家从此同名同职），`margin-inline-start: auto` 那套 hack 删掉。行内动作钮（清空 / 展开 / 明暗切换 / 加减）一律 `--xh-control-action-size` 方钮——number-field 的加减钮与 password-input 的明暗钮此前是「贴边的控件高钮」。

  **并排成对的面板定高。** 新增 `--xh-viewport-h-sm/md/lg`（12/16/24rem，compact 同比例收）。transfer 两侧列表此前是 `min 8rem / max 16rem`，条目搬走后整个组件跟着变矮——现在定高 `--xh-viewport-h-md`，左右等高、空侧也占满。cascader 的列、date-picker / time-picker 的时间列同样定高；单个浮层面板仍内容驱动，但补上了此前缺失的高度上限。

  **菜单族三家逐条同值。** `menu` / `menubar` / `context-menu` 共用同一台机器，皮肤却各写各的：menubar 根本没有 `item[data-state='open']` 这条规则，所以「发送到…」展开时不像 menu 那样加粗高亮。现在条目内衬 / 字号 / 圆角 / 行高 / 展开态 / 高亮态 / `content` 外观 / `separator` / `group-label` 全族同值，menu 补齐 `group` / `group-label` / `separator` 部件，子菜单箭头走字形令牌。navigation-menu 与 side-nav 的弹出面板按同族口径归队。

  **浮层面板与输入族小件归队。** `content` 一律双槽内衬 + 族档 min-w / max-w；cascader 的 48rem、color-picker 的 15rem、tour 的 22rem 等裸值改令牌（新增 `--xh-overlay-max-w-xl`）；label 颜色与间距、图标尺寸随档、聚焦环私有槽（invalid 时变红）、`:focus-within` 的禁用守卫、disabled / readonly 的三样齐——逐条统一。password-input 的明暗钮用上了新的 `--xh-glyph-mark-eye` / `-eye-off` 字形令牌。

  **门禁**：`check-control-box`（盒结构 12 条判据）、`check-panel-height`（面板高度只走滚动面令牌、并排面板必须定高）、`check-family-parity`（菜单族 / 分段族 / 下拉族 / 气泡族逐条同值）。

  公开面：五家 `--xh-<c>-trigger-*` → `--xh-<c>-control-*` 槽改名、date-picker 的 `input` 部件与 `XhDatePickerInput` 组件改名 `segment-group` / `XhDatePickerSegmentGroup`、`--xh-hover-card-font-size` 与 transfer 的 `-list-min-h` / `-list-max-h` 删除，共 43 项，基线已推。

- 520b847: 周序号成为一等部件 `week-number`，不再由使用者自己拼一列出来。

  上一版只把数字算出来（`panel.weekNumbers`），列宽得作者用行内 `grid-template-columns` 自己撑，
  库不管它的皮——同一份东西在不同项目里会长得不一样，这不是组件库该留的样子。

  - 解剖新增 `week-number`（可选部件，不写即不渲染），语义是这一行的表头（`role=rowheader`）：
    在 `role=grid` 里，一行的标号本就该是 rowheader，而不是又一个可选的格子
  - `getWeekNumberProps` / `getWeekNumberText` 两条，文字由两个适配器各自填，保证同构；
    表头那一格是占位、不带值，解析不了不抛、给空串占住列宽
  - 皮肤接管列宽与字样：摆了周序号格的行自动让出行首一列
    （`--xh-calendar-week-number-w`，默认 2.25rem），数字比日子小一号、颜色压下去、不跟着选中态走
  - 新增 `XhCalendarWeekNumber` / `XhDatePickerWeekNumber`；WC 侧写
    `<span data-xh-part="week-number" value="行首那天">` 即可

  选择器那条列宽规则写的是 `:not([hidden]):has(...)`——同特指度的规则谁在后面谁赢，
  不带这一道的话收起态会被这条 `display` 掀开（上一轮刚栽过一次，已有门禁拦着）。

### Patch Changes

- 7da1272: 废弃提示落地：五种没有 IDE 提示的介质在 dev 里经诊断通道发 `warn`。

  版本政策承诺过「dev 构建下经诊断通道发 warn」，此前一直未落地。现在 `@xihan-ui/kernel` 新增
  废弃登记表与探测：维护者 `registerDeprecation({ medium, match, message, replaceWith, until })` 登记
  一条，消费方的旧用法在 dev 里变成一条带迁移方向的诊断。

  五种介质与探测面：

  - `css-var` / `layer` / `selector` —— 样式表（`<style>` 文本与 CSSOM，跨域样式表静默跳过）
  - `attribute` —— DOM 里 `xh-*` 元素上的废弃 attribute（业务元素同名属性不误报）
  - `part` —— 作者写的 `data-xh-part` 角色名，由 Web Components 适配器的部件契约校验带上下文投递

  两个适配器都在 dev 里自动启动探测（Vue 在第一个组件建机器时借路启动一次，Web Components 在
  `defineXhElements()` 里启动），生产构建跳过；登记表为空时扫描器直接早退，零开销。同一废弃名
  无论命中多少条规则只报一次（通道去重）。登记表当前为空，发废弃时随 changeset 一起登记第一条。

- ed01a81: 框架元数据：名称、版本与运行时信息的单一事实源，与 XiHan.Framework 的 `XiHanMetadata` 同构。

  `@xihan-ui/kernel/metadata` 子路径新增 `XIHAN_UI_METADATA` 与 `XIHAN_UI_VERSION`（与 Framework 的独立 Metadata 包同理，主入口保持结构原语，不背它的体积棘轮）：

  - **静态常量集中维护**：名称 / 显示名 / 版权 / 作者 / 组织 / 仓库 / 文档 / 许可证 / 关键词 /
    支持平台 / 适配器清单 / 标志 / 寄语，全部 `Object.freeze`。
  - **版本从 package.json 派生**：`version` 与 `majorVersion` / `minorVersion` / `patchVersion` /
    `prerelease` 自动解析，锁步发版下改版本只改 package.json 一处。
  - **运行时信息**：`getRuntimeInfo()` 报 dev/prod 模式与 SSR 状态；两个适配器启动时用
    `registerRuntimeHost()` 登记自己，元数据据此报出「运行在哪个适配器、什么版本」——
    Framework 侧 EntryAssembly 概念在浏览器语境下的对应物。
  - **输出**：`getMetadataSummary()` / `getMetadataDetails()` 返回格式化文本（宿主行如实报
    锁步一致性），`print` 版只在 dev 出声，生产静默。
  - **启动横幅**：对齐 Framework 的 `XiHanApplicationBase`——引用即打印。适配器启动时
    （Vue 首个组件建机器 / WC 注册元素）自动打一次 Logo + 摘要（整页一次、生产静默），
    `setMetadataAutoPrint(false)` 可关。

  文档见新章节「框架元数据」（guide/metadata）。

- a321a50: 锁步版本检查:混装版本在 dev 里报 `core.version-mismatch`,不再只靠自觉。

  17 包同版本是硬承诺,但包管理器不会拦「vue alpha.2 + kernel alpha.3」这种跨包组合——
  类型对不上、同一个 `xh-` 标签被两个版本注册直接抛错,全部静默到运行时。现在 `@xihan-ui/kernel`
  导出自己的 `VERSION` 与 `checkLockstepVersion()`,两个适配器在 dev 启动时(与废弃探测同一次
  借路)拿自身版本比对,不一致经诊断通道发一条 warn,生产构建跳过。

- ac885c9: number-field 新增可选 `control` 部件:加减按钮叠进输入框内,与输入框成为视觉一体。

  此前加减钮与输入框是兄弟节点,受 HTML 约束进不了框内,只能三件并排。现在把输入框与两个按钮
  放进 `control` 部件,皮肤把描边、底色、聚焦环(改为 `:focus-within`)整体画在 control 上:
  框内 input 退成透明,减钮在左、加钮在右、输入框居中(顺序由作者模板决定),前后缀图标/文字
  直接流式插在 input 两侧,不用绝对定位;悬停/按下/贴边禁用沿用原有语义色。

  - **Vue**:新增 `XhNumberFieldControl`;`data-disabled` / `data-readonly` / `data-invalid`
    三个状态属性由 connect 落到 control 上。
  - **Web Components**:作者写 `<div data-xh-part="control">` 包裹即得同样的一体式。
  - **不写 control 时完全退回旧观感**:control 是可选部件,旧模板一行不改照常渲染,三档
    variant / tone / size 与旧式并排布局一致。

  一致性测试的 fixture 改成一体的 control 结构,两个适配器的 conformance 同步通过。

- b04e182: number-field 新增 `parse` / `format`：千位分隔符、单位后缀这类带格式的数字，现在不用把组件拆开自己拼了。

  `parse` 把显示串读成数（默认 `Number()`，`'12abc'` 判为非法），`format` 把数写回显示串（默认 `String()`）。
  两个方向必须互逆——`format` 出来的串要能被 `parse` 读回同一个数，否则按一下加号值就会漂。

  落点分得很清楚：

  - **`parse` 管所有"读"**：步进、取端点、失焦规范化、`aria-valuenow`、`valueAsNumber`、贴边判定，
    全都从它拿数。读屏念的因此是数，不是那串带逗号的显示文本。
  - **`format` 只管组件自己改写显示的那三处**：步进、取端点、失焦规范化。
    用户正在打字时一律不碰——中途补格式会打断光标位置。

  界仍按数比而不按串比，越界时先夹回区间再补格式。作者的 `parse` 返回了非数按 `NaN` 处理、
  `format` 返回了非串退回 `String(value)`，坏的返回值不会顺着流进后续计算。

- 93fdcb8: pin-input 新增 `pattern`：每格接受哪些字符可以自己定，不再只有 numeric / alphabetic / alphanumeric 三档。

  `pattern` 收一段正则源码，内部补上首尾锚与 `u` 标志后逐个字符整格匹配——作者写 `[0-9A-Fa-f]`
  就够，不必自己写锚点，代理对（emoji 这类）也匹得上。给了它就盖过 `type` 的准入表；
  写坏了（编不成正则）**退回 `type` 的准入表而不是放行一切**，也不抛。

  敲、粘贴、外部 `setValue` 三条写值的路都过同一份准入表。

  `type` 保留原职：它仍然决定移动端弹哪种键盘。准入放宽到字母时记得把 `type` 一并改掉，
  否则弹的还是数字键盘、那几个字符敲不进来——这一条写进了 props 说明与示例。

- 8d6e450: 整洁度归队（统一性审计的最后一批）。

  **令牌**：dialog / drawer 的宽度档提为 `--xh-overlay-sheet-w-sm/md/lg`（24/32/48rem）与 `--xh-overlay-drawer-w-sm/md/lg`（16/20/28rem），empty-state / result 的图标档提为 `--xh-glyph-size-xl/2xl/3xl/4xl`；`--xh-control-gap-lg` 此前与 md 恒等，改为 space-3（compact space-2）；补 `--xh-fg-warning` / `--xh-fg-info`（与 success 同构）。tokens README 写明 px 与 rem 的口径，以及「单行控件本体的槽一律叫 control」。

  **皮肤**：number-field 的 `--xh-number-field-input-h` 在 control 上用错部件名，改 `--xh-number-field-control-h`；spinner 三档归 glyph 尺寸族、anchor / pagination / steps / composer / menubar 的内衬对齐 control-px 阶梯；back-top / card / float-button / switch / dynamic-input 的阴影补使用者槽；timeline / typography / field / slider 的字面残留改令牌；30 处与令牌同值却不引令牌的兜底改引（15 处登记理由）；checkbox-group / transfer 的指示符字形与 checkbox 同一配方。菜单与列表族的条目高亮只认 `[data-highlighted]`（菜单族此前还并挂 `:focus` / `:focus-visible`）。

  **无障碍**：select 的触发器按 APG select-only combobox 打 `role=combobox` + `aria-haspopup=listbox` + `aria-controls`（popselect 是按钮式弹出保持 button）；image-viewer 触发器补 `aria-controls`；83 处 `aria-hidden` 统一写布尔；iconOnly 按钮没有 `aria-label` / `aria-labelledby` 时开发模式提醒一次（Vue / WC 把作者写在根节点上的可及名转告连接层）。

  **共享配方**：visually-hidden 的 9 条声明收成 headless 的 `VISUALLY_HIDDEN_STYLE`，六份 connect 引它；七份皮肤各自那份必须与 `visually-hidden.css` 逐条一致。

  **门禁**：`check-literal-fallbacks`（兜底字面量与令牌同值即红）、`check-visually-hidden`、`check-tone-contrast`（自算 oklch → WCAG 对比度，六族 × 两主题 26 组配对，1 组已知例外登记理由）、`check-aria-shapes`（aria-hidden 字符串写法 / listbox 触发器角色）；`check-elevation-role` 增「阴影必须带使用者槽」。

- bb47c3d: time-picker 的上午/下午在浮层里也成列：从此点得中，不必回到输入行敲。

  此前 12 小时制下浮层只排时分秒三列，上下午只有输入行里那一段能改——指针用户点开浮层，
  挑完时与分还得把手挪回段上，一次选值走两个地方。

  - 列的单位与分段输入里的段同名同域（新增 `dayPeriod`），恒排在末位、只在 12 小时制下出现；
    两格写 `'00'` / `'01'`，与这一段在 `aria-valuenow` 上报的数同一个域，
    选中比对、写值换算于是全都复用现成的那条路，浮层里挑与段上按 a / p 落到同一个 `setTimeDayPeriod`。
  - 新增 `getItemText`：格子上的文字改由它给，数字列还是格子自己的值，上下午列按 locale 译成
    「上午 / 下午」。两个适配器都改用它填文本，保证同构。
  - 上下午列跟着 min / max 收窄：当前小时翻到另一半天即出界时，那一格不可选（与时列互为对方的裁剪条件）。
    这与段上按 a / p 的处置不同——段上照写只做越界标注，列里则直接裁掉，两条路本来的语义就不一样。
  - 两端那一段的外角与浮层其余列一致；`granularity` 与它无关，`hour` 档也照排。

  `TimePickerColumn` 因此带上了单位的类型参数（缺省仍是全集，写 `TimePickerColumn` 的地方不用改）。
  date-picker 内嵌的时间面板恒为 24 小时制，用新增的 `DatePickerTimeUnit` 把「没有上下午那一列」写进类型里。

  顺带把 `custom-elements.json` 与 `public-surface.json` 重新生成：前者自 number-field 的
  control 部件落地起就没跟着更新过，后者漏了 kernel 的两个子路径入口。

- Updated dependencies [906b712]
- Updated dependencies [e12e337]
- Updated dependencies [ff84a16]
- Updated dependencies [97cbb2a]
- Updated dependencies [a55c76e]
- Updated dependencies [089db90]
- Updated dependencies [ada8a01]
- Updated dependencies [1461cec]
- Updated dependencies [e2292bf]
- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [0be028c]
- Updated dependencies [1b7a5f1]
- Updated dependencies [ed01a81]
- Updated dependencies [1e90ce6]
- Updated dependencies [a321a50]
- Updated dependencies [8d35702]
- Updated dependencies [ac885c9]
- Updated dependencies [b04e182]
- Updated dependencies [e31cc0a]
- Updated dependencies [d738f78]
- Updated dependencies [93fdcb8]
- Updated dependencies [516bd46]
- Updated dependencies [9548330]
- Updated dependencies [35c9b65]
- Updated dependencies [bbc3431]
- Updated dependencies [d0202b2]
- Updated dependencies [309feb2]
- Updated dependencies [8d6e450]
- Updated dependencies [bb47c3d]
- Updated dependencies [35c9b65]
- Updated dependencies [520b847]
- Updated dependencies [c2b9748]
  - @xihan-ui/headless@1.0.0-alpha.3
  - @xihan-ui/kernel@1.0.0-alpha.3
  - @xihan-ui/motion@1.0.0-alpha.3
  - @xihan-ui/behavior@1.0.0-alpha.3
  - @xihan-ui/backgrounds@1.0.0-alpha.3
  - @xihan-ui/position@1.0.0-alpha.3
  - @xihan-ui/machine@1.0.0-alpha.3
  - @xihan-ui/code-highlight@1.0.0-alpha.3
  - @xihan-ui/sound@1.0.0-alpha.3

## 1.0.0-alpha.2

### Minor Changes

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

### Patch Changes

- 09b5ad8: 「collection 铺开的结构凑齐必备部件」这条判据改成机检，并把三档语义写进文档。

  `collection` 收了数据不等于会替你渲染结构，而这件事此前既没有对外判据、也没有任何东西守着：
  14 个组件里 13 个在根上代铺、popselect 只在 content 里铺，使用者只能一个个试。
  官网落地时那棵树就是把数据写了一遍、DOM 又手码了一遍，两份得自己保持同步。

  新增 `tests/collection-required-parts.spec.ts`：逐个组件只交 `collection`、不写任何部件，
  断言铺出来的 DOM 含该组件 `meta.requiredParts` 里的每一个部件。少一个就是渲染出一个
  看着正常、其实不工作的组件——浮层打不开、方向键找不到条目、同一份结构写到自定义元素那侧
  会报 `wc.missing-part`。给新组件加代铺时先往这份测试加一行，铺漏了当场红。

  顺带查出并钉住两处此前没人测的差别：`popselect` 的铺开落在 content 部件里而不是根上
  （`<XhPopselectRoot :collection>` 单独用什么都不出），`mention` 的候选浮层没有 `defaultOpen`、
  敲下前缀字符才铺开。

  `guide/anatomy.md` 补「collection 管不管铺开结构」一节，三档逐个列出组件名，
  并写明判据是结构的自由度：扁平集合的 DOM 形状是确定的，代铺挡不住任何写法；
  层级与多区（`tree` / `cascader` / `transfer`）的结构有太多合理变体，代铺只会逼作者推翻重写。

- ae21590: 75 个组件的插槽写上真类型，`vue-tsc` 从此接得住插槽名与载荷键名的拼写错误。

  组件是渲染函数写的，`.d.ts` 里插槽泛型一直是空的（`DefineComponent` 的 `S` 位是 `{}`），
  于是 `#panel="node"`、`v-slot="{ pages, page }"` 这些载荷在消费端全是 `any`：
  键名写错不报、插槽名写错不报，只在运行期渲染出 `undefined`。props 与 emits 早就有完整类型，
  唯独插槽这一层没有对外描述——而无头库恰恰是靠插槽把控制权交回作者的。

  现在每个带载荷的插槽都有具名载荷类型（`TabsPanelSlotProps`、`StepsRootSlotProps` 这样命名，
  均从主入口导出），组件上声明 `slots: Object as SlotsType<…>`：

  ```vue
  <template #panel="node">{{ node.lable }}</template>
  <!-- TS2551: Property 'lable' does not exist on type 'TabsNodeMeta'. Did you mean 'label'? -->
  ```

  两条形状上的取舍值得写下来：

  - **键一律可选**。非可选时 `slots.default ? 作者内容 : 按 collection 铺开` 这类判断在类型上恒为真，
    而它承载的正是「没写默认插槽就铺开整套结构」的核心行为——类型不能对着它撒谎。
  - **值一律写成函数类型**而不是裸载荷类型。Vue 的 `UnwrapSlotsType` 对函数类型原样保留、
    对裸类型套一层 `Slot<T>`，而 `Slot<T>` 的实参元组在 `T` 不 extends `undefined` 时是 `[T]`
    ——零参调用会变成非法，而库里到处是 `slots.default?.()`。

  新增 `check-slot-types` 门禁盯住这两条与「带载荷就必须声明」，`pnpm gate` 由十七项变十八项。

- ba3b3aa: 自定义元素补上全局文案层：`setXhConfig`。

  `provideXhConfig` 一直只有 Vue 适配器有。自定义元素拿不到 provide/inject，文案又是对象、
  只能走 property 不能走 attribute，于是 31 个元素只能在 JS 里逐实例各设一次 `.translations`——
  一个中文应用要为此写几十行。而 `guide/i18n.md` 通篇把 `provideXhConfig` 当作「这套机制」讲，
  一次都没提 Web Components，读的人会以为两端通用。

  现在两端各有一处全局出口，取值优先级一致：**实例 → 全局 → 组件内建默认（英文）**，
  `translations` 逐键合并。切语言再调一次 `setXhConfig` 即可，已挂载的元素跟着重渲。

  接线落在 `MachineController` 一处——31 个元素的机器 props 都从那里过，不必逐个改。

  `XhTranslationOverrides` 那张 31 条的映射表下沉到 `@xihan-ui/headless`，两个适配器共用一份。
  在 WC 侧另抄一份是唯一的替代方案，而两份 31 条的表迟早会漂。Vue 侧原样再导出，导出名不变。

  与 Vue 侧的两处差别写进文档了：`setXhConfig` 是整份替换而非深合并；它是模块级的，
  没有「只在某棵子树里换语言」的能力。

- Updated dependencies [3469066]
- Updated dependencies [466f143]
- Updated dependencies [7a5d898]
- Updated dependencies [52729a1]
- Updated dependencies [ba3b3aa]
  - @xihan-ui/backgrounds@1.0.0-alpha.2
  - @xihan-ui/headless@1.0.0-alpha.2
  - @xihan-ui/motion@1.0.0-alpha.2
  - @xihan-ui/behavior@1.0.0-alpha.2
  - @xihan-ui/kernel@1.0.0-alpha.2
  - @xihan-ui/machine@1.0.0-alpha.2
  - @xihan-ui/code-highlight@1.0.0-alpha.2
  - @xihan-ui/position@1.0.0-alpha.2
  - @xihan-ui/sound@1.0.0-alpha.2

## 1.0.0-alpha.1

### Major Changes

- d43624c: 把跨组件已经分叉的名字统一回一套。part 名与 prop 名在 1.0 之后就是公开 API——皮肤按
  `data-part` 选择、使用者按 prop 名调用——改名一律是破坏性变更，所以趁 alpha 一次改完。

  **time-picker 的列表条目由 `option` 改叫 `item`。** 另外 32 个组件的列表条目都叫 `item`，
  只有它是 `option`。ARIA 角色仍是 `role="option"`（那是角色不是部件名），列里的候选值集合
  `TimePickerColumn.options` 也不动（那是数据不是部件）。

  迁移点：

  - `data-part='option'` 改成 `data-part='item'`；皮肤覆盖槽 `--xh-time-picker-option-*`
    改成 `--xh-time-picker-item-*`（共 10 个）。
  - Vue 组件 `XhTimePickerOption` 改名 `XhTimePickerItem`。
  - WC 的 `::part(option)` 改成 `::part(item)`。
  - headless 导出：`timePickerOptionQuery` → `timePickerItemQuery`、`findTimePickerOption` →
    `findTimePickerItem`、`timePickerOptionValue` → `timePickerItemValue`、
    `TimePickerOptionProps` → `TimePickerItemProps`。
  - `TimePickerApi` 上：`getOptionProps` → `getItemProps`、`isOptionSelected` → `isItemSelected`、
    `isOptionDisabled` → `isItemDisabled`、`focusedOption` → `focusedItem`。
  - 键盘规格号 `time-picker.kbd.option-*` → `time-picker.kbd.item-*`。

  **transfer 的数据入口由 `items` 改叫 `collection`。** 另外 17 个集合组件的数据入口都叫
  `collection`。单条的类型名 `TransferItem`、某一侧看得见的条目 `visibleItems`、纯函数
  `transferVisibleItems` 都不动——它们说的是「条目」，不是「数据入口」。

  迁移点：

  - Vue：`<XhTransferRoot :items="…">` 改成 `:collection="…"`。
  - WC：`el.items = […]` 改成 `el.collection = […]`（这个入口表达不成属性，本来就只能走 property）。
  - `TransferApi.items` → `TransferApi.collection`。

  **checkbox-group 的组内子部件对齐 radio-group。** 同一语义两套名字：checkbox-group 用
  `item-control` / `item-hidden-input`，radio-group 用 `indicator` / `hidden-input`。裸名是全仓
  多数（`indicator` 13 处、`hidden-input` 10 处），checkbox-group 随大流。`item-text` 不动
  （21 份解剖都这么叫）。

  迁移点：

  - `data-part='item-control'` → `'indicator'`，`data-part='item-hidden-input'` → `'hidden-input'`。
  - 皮肤覆盖槽 `--xh-checkbox-group-control-*` → `--xh-checkbox-group-indicator-*`（10 个），
    与 radio-group 的 `--xh-radio-group-indicator-*` 对齐。
  - `CheckboxGroupApi.getItemControlProps` → `getIndicatorProps`，
    `getItemHiddenInputProps` → `getHiddenInputProps`（两个名字 radio-group 早就在用）。
  - Vue 组件 `XhCheckboxGroupItemControl` → `XhCheckboxGroupIndicator`。

  **table 的空态部件由 `empty-state` 改叫 `empty`。** 部件名不该与组件的 scope 名撞车——
  `empty-state` 是一个独立组件的 `data-scope`，再拿它当 table 的部件名，写皮肤时
  `[data-part='empty-state']` 与 `[data-scope='empty-state']` 混在一起读不出谁是谁。
  combobox 早就叫 `empty`。独立的 `empty-state` 组件本身不动。

  迁移点：

  - `data-part='empty-state'` → `'empty'`。
  - `TableApi.getEmptyStateProps` → `getEmptyProps`。
  - Vue 组件 `XhTableEmptyState` → `XhTableEmpty`（`XhEmptyState*` 那一族是另一个组件，不变）。
  - WC 的 `::part(empty-state)` → `::part(empty)`。

  **transfer 的 `onSelectedChange` 改叫 `onSelectionChange`。** table 与 tree 都叫
  `onSelectionChange`。受控的 `selected` prop 与载荷字段 `{ selected }` 不动——那是「被勾中的值」，
  与回调名说的不是一回事。

  - `TransferSelectedChangeDetails` → `TransferSelectionChangeDetails`。
  - Vue 事件 `@selected-change` → `@selection-change`；WC 的 `selected-change` 事件同改。
  - `v-model:selected` 不变。

  **`size` 不再一名两用。** 三轴里的 `size` 是语气枚举，而 qr-code 的 `size` 是像素数值、
  splitter 的 `size` 是百分比数组——两者占着同一个名字却是完全不同的类型，使用者写
  `size="md"` 得到的是静默的错。

  - qr-code：`size` → `pixelSize`（WC 属性 `size` → `pixel-size`）。中心 logo 挖空区的
    `QrCodeLogoArea.size` 是模块数标量，不动。
  - splitter：数组值的一律改复数——`size` → `sizes`、`defaultSize` → `defaultSizes`、
    `onSizeChange` → `onSizesChange`、`onSizeChangeEnd` → `onSizesChangeEnd`、载荷字段
    `{ size }` → `{ sizes }`、机器事件 `SIZE.SET` → `SIZES.SET`、Vue 的 `v-model:size` →
    `v-model:sizes`、WC 属性 `size` → `sizes`。标量的不动：每块面板的 `collapsedSize`、
    `BOUNDARY.SET` 的 `size`、`setPanelSize`、`SplitterPanelState.size`。

  **没有合并的一处，记在这里免得后人重新翻案。** 就绪度审计说 pin-input 的 `onValueComplete`、
  editable 的 `onValueCommit`、slider 的 `onValueChangeEnd` 是「三个名字表达同一语义」，
  逐条读过源码后判定不成立：`onValueComplete` 是「每格都填满的那一刻」（值的形状谓词），
  `onValueCommit` 是「提交那一刻」（用户显式确认），`onValueChangeEnd` 是「一次操作结束」
  （手势结束，splitter 的 `onSizesChangeEnd` 用的是同一套）。三件不同的事，合并会让 API 更差。

### Minor Changes

- a19bbaa: 级联选择补空态兜底：新增 empty 部件，搜索无候选或 collection 为空（根列没有条目）时露面，其余时候带 hidden。

  - headless：`getEmptyProps` 管空态占位的露面与收起；`getSearchListProps` 无候选时带 `data-empty`，`getContentProps` 根列没有条目时带 `data-empty`；新增 `translations` prop（`empty` / `noMatch` 两键，默认英文）与 api 上并入默认后的完整一份。
  - vue：`XhCascaderContent` 自动补渲空态占位，`empty` 插槽可换内容，缺省文案按视图取无匹配或无数据；`translations` prop 接入全局 `provideXhConfig` 注入点（`translations.cascader`）。
  - web-components：新增可缺省的 `empty` 部件，元素代管其 hidden，文案归作者。
  - styles：空态占位居中排版（`--xh-cascader-empty-min-h` / `--xh-cascader-empty-p` / `--xh-cascader-empty-fg` 可覆写）；无候选时候选列表不再占位，根列没有条目时空列让位。

- ea78591: checkbox 与 switch 能进 HTML 表单了。表单字段组件从 18 个变成 20 个，五个缺口清完。

  **先纠正一条我此前记错的约束**：我曾把这两个记为「要单独一轮，因为 HTML 内容模型禁止 button 有
  交互后代」。查规范后不成立——interactive content 的定义里 `input` 那条写的是「**type 属性不处于
  Hidden 状态时**」，所以 `<input type="hidden">` 不是交互内容，放进 `<button>` 里是合法的。
  DOM 不必重构，与 color-picker、combobox 同一条路。

  - 新增 `hidden-input` 部件、`name` 与 `value` 两个 prop（`value` 缺省 `'on'`，与原生一致）。
  - **勾上才带 `name`**：没勾就整条不参与提交，这是原生复选框的语义。
  - **半选按未勾处理**：原生里 indeterminate 只是外观，提交与否看 `checked`。
  - Vue 侧由组件自己渲染（单体控件没有子部件插槽，作者递不进来），**给了 `name` 才有这个节点**——
    没给就与从前逐字节相同。WC 侧照旧由作者写 `data-xh-part="hidden-input"`。

  **两者的重置走转移而不是写 context**：它们的值就是机器状态（`on` / `off` / `indeterminate`），
  没有值 cell 可 reset。`FORM.RESET` 因此是一组带守卫的转移，受控时只发意图、非受控才真的转过去；
  已经停在默认态就不白发一次通知。

  如实记一处限制：`onCheckedChange` 的载荷刻意只有布尔（「用户交互的落点只可能是全选或全不选」），
  表达不了半选。所以回落点是半选时状态照常转、通知不发；受控且默认半选的组合因此拿不到重置。
  不为这一处去改已公开的载荷类型。

- 72dc39c: color-picker 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 里提交，`FormData` 里没有这个字段。
  同仓 11 个组件早就做全了这件事，它是缺口之一。

  照仓内既成的形状补：新增 `hidden-input` 部件（`type=hidden`，排在解剖末位）、`name?: string` prop、
  `ColorPickerApi.getHiddenInputProps()`。影子产出的属性恰好五条——parts 属性、`type`、`name`、`value`、
  `disabled`——`type` 必须排在 `value` 前（改 type 会重置输入的值），`name` 不给就整条不产出、这份输入
  不参与提交，禁用时带原生 `disabled` 不提交值，只读照常提交。

  **这是纯增量**：影子是作者自己写的可选部件（Vue 侧新增 `XhColorPickerHiddenInput`，WC 侧新增
  `::part(hidden-input)`），不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。

- a7e8755: combobox 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 提交，`FormData` 里没有这个字段。

  **形状照 tree-select，不另起一套**：单个 `hidden-input` 部件（`type=hidden`，排在解剖末位），
  多选按逗号拼成一串。同为多值浮层选择器的 tree-select 已经是这个形状，combobox 换一种（比如
  一值一个影子输入、或隐藏 `<select multiple>`）会凭空造出第二套约定。

  如实记一笔：逗号拼串对含逗号的值不可逆，也不是原生的多值 `FormData`（`name=a&name=b`）。
  这是 tree-select 已有的性质，要改得两个一起改，是另一件事。

  纯增量：影子是作者自己写的可选部件，不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。
  判据也按这个形状加——只在本用例的 fixture 里挂影子，其余用例的 order/counts 一条没改。

  **顺带被门禁逼出来的一件事**：加了 `name` 之后 `check-form-reset` 当场变红——带 `name` 就是表单
  字段，就必须认表单重置。combobox 因此一并接上了 `FORM.RESET`：值与输入串是两条独立受控轴各判各的，
  高亮锚点一并清（它指向的条目可能已被过滤掉）。表单字段组件从 17 个变成 18 个。

- e50a7c9: 复合控件开始响应表单重置。这一版落地机制本身与首个组件 radio-group，其余 16 个随后。

  实测过的缺陷：把本库的控件放进 `<form>`，调 `form.reset()`（或点 `XhFormResetTrigger`），
  显示与提交值都停在用户改后的状态——原生重置只还原原生控件，而这些控件的值攥在机器里，
  没有任何一处监听所属表单的 reset。

  **机制**：认重置的机器在根级声明一条无守卫、无载荷的 `FORM.RESET`，动作只做一件事——
  对若干个 cell 各调一次 `context.reset(key)`，即**重新求一遍那个 cell 自己的 `defaultValue` 表达式**
  再走原来的 `set`。落点因此与 cell 定义是同一份代码，不会各写一份而漂移；受控分支原样保留，
  所以「受控只发意图」是免费守住的。适配器侧只在唯一的机器接入点（Vue 的 `useMachine`）挂桥，
  组件文件零改动。

  一句话：`FORM.RESET` = 「把这个组件变回它此刻挂载会长成的样子」。

  **落点不取挂载时冻结的 `initial`，而是按当下 props 重算**。宿主换了 `defaultValue`（比如切去编辑
  另一条记录）就该回到新的那一份，这与原生 `reset()` 回到「当下的 default」一致。

  **受控且宿主没声明 `defaultValue` 时一动不动。** 这是最要紧的一条：cell 里那句 `?? 兜底` 把
  「宿主声明的默认值」和「组件的空值」烘在同一个表达式里（radio-group 是 `null`、rating 是 `0`、
  tags-input 是空数组）。照直落下去，受控分支会把这个空值当意图发给宿主——重置就从「没反应」
  变成「把宿主的数据抹掉」。`resetDeclaredValue` 把这一步挡住了，并有专门的判据钉着。
  **受控组件要拿到重置，必须显式传 `defaultValue`**，这是本库与「受控 reset 是纯空操作」的分歧点。

  **监听挂在锚点的 root node 上**，不挂在那个 form 上：form 会被条件渲染换掉、组件也会被搬走。
  归属在事件那一刻用 `closest('form')` 现算，因此嵌套表单不会误伤。重置被 `preventDefault` 拦下时
  不动——那时同表单的原生控件也没还原，组件单方面还原会拼出半份默认值。

  无 form、无 DOM、作者没写影子输入三种情形都不需要特别处理：归属判定不命中、服务端根本不挂效应、
  锚点是组件根节点而不是影子输入。

  BREAKING CHANGE: `Bindable` 新增必填成员 `reset()`，`ContextFacade` 新增 `reset(key)`。
  自建 `ReactiveRuntime`（写第三个适配器）的实现方需要补上 `reset`。仓内三处实现已全部跟进。

- a41b931: 进度条新增环形与仪表盘两种形态。

  - 新增 `variant` 轴：`line`（缺省，行为逐字不变）/ `circle` / `dashboard`，以及 `canvas`（承载环的 svg）与 `label`（环心那一块）两个可缺省部件。
  - 新增 props：`strokeWidth`（环的线宽，viewBox 单位，缺省 6）、`gapDegree` 与 `gapPosition`（仪表盘的缺口，缺省 75 度朝下）、`valueText`（进度不是百分比时给读屏念的那句话）。线宽是 prop 不是令牌——它改的是几何，半径要跟着往里收；线形的厚度仍走 `--xh-progress-thickness`。
  - 环的直径、底槽色、进度色与端点形状走令牌（`--xh-progress-size` / `-track` / `-range` / `-linecap`），几何由连接层算好写进标记，皮肤只上色。

  顺带两处修正：

  - 退化输入不再算成满进度：`max` 不为正或不是数时回落 100，`value` 不是数时按 0 处理（此前 `max=0` 会让进度算成满格）。
  - 线形的长度不再取整：`value=3 / max=8` 由 38% 改为 37.5%，相邻两档不会再看起来一样长。

- 4b949c2: 摇树第一次真的生效：只用一个组件不再拖来整个库。

  此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效——
  使用者只 `import { XhBadge }`，打出来的东西和全量 barrel 一样大。

  产物改为保留模块结构（每个源文件一份产物），实测（esbuild 打真实 dist，gzip）：

  | 用例                | 改前      | 改后         |
  | ------------------- | --------- | ------------ |
  | 只用 `XhBadge`      | 168,947 B | **538 B**    |
  | 只用 `XhButton`     | 168,947 B | **1,029 B**  |
  | 只用 `XhDialogRoot` | 168,947 B | **11,374 B** |
  | 全量 barrel         | 173,005 B | 178,768 B    |

  单组件占全量从 **97.7% 降到 0.3%**。全量 barrel 略涨 3%，是模块边界不再被合并的代价，值得。

  **判据补上了此前没有的分辨力。** `.size-limit.json` 原有 18 条全是整包 barrel，改回单入口不会让任何
  一条变红。新增三条带 `import` 字段的按组件预算（badge / button / dialog），退回打包形态时它们会
  立刻超标一个数量级。

  顺带修掉两处被这次改动照出来的既有缺陷：

  - **公开面基线虚高 81 个名字。** `build-public-surface.mjs` 抽类型名的正则里 `export` 是可选的，
    于是把打包版 d.ts 里那些**没有导出**的内部类型别名（`AccordionProps` 这类局部别名共 72 个）也算
    成了受 semver 约束的公开名。实测确认它们从来就 import 不到（`TS2305: has no exported member`）。
    正则补上 `export`，基线随之收敛。
  - **文档生成器只认 `declare`。** 拆包后 barrel 里不再有 `declare`，导致 102 页组件文档的
    「Vue 组件」整列凭空消失。改成 import 与 export 两种形态都收。

  新增一个公开类型 `TweenEasing`：`NumberAnimationEasing` 本就是它的别名，拆包后别名要能被命名，
  这一支就必须公开。

### Patch Changes

- 89d8c54: 修四处在真实宿主里才现形的缺陷，`hideOutside` 的入参形状随之变化。

  **嵌套浮层不再被外层罩死。** 对话框里再开一个对话框（或抽屉），内层 portal 到 `body` 之后也是
  `body` 的直接子元素，会被外层背景失活的 `MutationObserver` 一并打上 `inert`——看得见、点不动。
  层注册表新增 `elementsAbove(layer)`，给出栈中位于该层之上的各层全部节点；`dialog` 与 `drawer`
  把它并进背景失活的目标集。

  **破坏性变更**：`hideOutside(targets, scope, options)` 的第一个参数由 `Element[]` 改为
  `() => Element[]`。施加 `inert` 的时机横跨整个展开期，晚于调用时刻才挂载的节点必须也能被算进目标，
  定死的数组做不到。调用点把数组包成箭头函数即可。同时 `LayerRegistry` 新增 `elementsAbove` 成员，
  自行实现该接口的需要补上。

  **破坏性变更**：`@xihan-ui/machine` 的 `Dict` 改为从 `@xihan-ui/kernel` 转出。两个包此前对同一个
  名字给出不同泛型元数（`Record<string, T>` 与 `Record<string, any>`），从哪个包导入会决定
  `Dict<string>` 编不编得过。

  **首屏即展开的对话框与抽屉能服务端直出了。** `rendered` 的初值此前整块圈在「有 document」的分支里，
  服务端算不出它，只发一个 23 字节的空占位：首屏没有对话框、没有可被索引与读屏读到的正文，
  客户端水合时再整棵补出来。初值改取状态机的展开态。

  **没有 window 的宿主里不再抛异常。** `prefersReducedMotion`、`onReducedMotionChange`、
  `createEnvSignals` 的默认参数写的是裸 `window`，而默认参数在函数体的守卫之前求值——三者的注释都
  承诺 SSR 期回落，实际是 `ReferenceError`。改走 `globalThis.window`，签名不变。

- Updated dependencies [b8afdb2]
- Updated dependencies [a19bbaa]
- Updated dependencies [ea78591]
- Updated dependencies [72dc39c]
- Updated dependencies [a7e8755]
- Updated dependencies [e50a7c9]
- Updated dependencies [98d7ffe]
- Updated dependencies [d43624c]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [a41b931]
- Updated dependencies [0a57e2f]
- Updated dependencies [24721f4]
- Updated dependencies [4b949c2]
  - @xihan-ui/sound@1.0.0-alpha.1
  - @xihan-ui/headless@1.0.0-alpha.1
  - @xihan-ui/machine@1.0.0-alpha.1
  - @xihan-ui/behavior@1.0.0-alpha.1
  - @xihan-ui/kernel@1.0.0-alpha.1
  - @xihan-ui/position@1.0.0-alpha.1
  - @xihan-ui/code-highlight@1.0.0-alpha.1
  - @xihan-ui/backgrounds@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

- 84b1aa3: 新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

  旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
  npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
  描边、`stroke-width` 2。

  用法：

  - `@xihan-ui/kernel` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
  - `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
  - `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/web-components` 注册 `<xh-icon>`
  - `@xihan-ui/styles` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

  图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
  解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
  整个失效。

  WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
  作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
  `<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

  可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
  输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
  读屏会念两遍。

- e788896: Select 支持多选，选中值由单值改为集合，公开 API 破坏性变更。

  多选打开方式是 `multiple`：点中条目即在集合里增删该项，列表不收起；单选行为不变，只是选中值
  的容器形状统一成了数组（单选恒为长度 ≤ 1）。

  迁移点：

  - `SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`。原先判空写 `details.value === null`
    的，改判 `details.value.length === 0`；取单选值写 `details.value[0]`。
  - `SelectApi` 的 `value` 与 `valueText` 由单值变数组，两者逐项对应；`setValue` 签名变
    `(next: string | string[]) => void`，裸串按单选简写处理；新增 `multiple`。
    想拿「显示成什么字」不必自己拼，用 `displayText`：有选中取选中项文本（多选按半角逗号加空格连起来），
    否则取 `placeholder`。
  - Vue 默认插槽暴露的 `value` 与 `setValue` 随之变化；`update:value` 的载荷由单值变数组，
    因此 `v-model:value` 绑定的变量类型要一并改。`value` / `default-value` 两个 prop 仍接受裸串与 `null`。
  - WC `value-change` 事件的 `detail` 由 `{ value: string | null }` 变 `{ value: string[] }`；
    新增 `multiple` 属性。`value` 属性只递得进单值，多选集合请写 property。
    表单影子 `hidden-select` 不再写 `value`，选中态一律由 `option` 的 `selected` 表达（多选时开原生
    `multiple`）—— 靠读 `hidden-select.value` 反查选中项的代码要改成读 `selectedOptions`。

### Minor Changes

- c5c5f7f: 两个适配器接上视觉层，各自走独立子入口 `@xihan-ui/vue/backgrounds` 与 `@xihan-ui/web-components/backgrounds`。

  `@xihan-ui/backgrounds` 声明为**可选 peer**：主入口一行都不引它，不用视觉效果的应用不会因为装了适配器
  而多出一个 WebGL 引擎。

  Vue 侧三种用法，从轻到重：`v-background` 指令、`XhBackground` 组件、`useBackground` 组合式函数。
  指令用在组件上时 Vue 会把它落到该组件的单一根元素上，所以给现成组件加背景不必改动组件本身。

  WC 侧是 `<xh-background>`：元素自身就是画布容器，内容照常写在里面，效果铺在内容底下，
  画布 `pointer-events: none` 不挡交互。参数走 `.params` property，点云走 `.setCloud()`。

### Patch Changes

- Updated dependencies [bc65cb7]
- Updated dependencies [84b1aa3]
- Updated dependencies [e788896]
- Updated dependencies [46b82b0]
  - @xihan-ui/kernel@1.0.0-alpha.0
  - @xihan-ui/machine@1.0.0-alpha.0
  - @xihan-ui/behavior@1.0.0-alpha.0
  - @xihan-ui/headless@1.0.0-alpha.0
  - @xihan-ui/position@1.0.0-alpha.0
  - @xihan-ui/code-highlight@1.0.0-alpha.0
  - @xihan-ui/backgrounds@1.0.0-alpha.0
