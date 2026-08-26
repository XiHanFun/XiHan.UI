# @xihan-ui/web-components

## 1.0.0

### Major Changes

- bc7eeed: 徽标收窄成「只做角标」，并补齐角标该有的能力。

  原先 badge 与 tag 是一对孪生：`variant` 三形态、`size` 三档、默认插槽放任意内容，
  连档位取值都逐个相同。两个组件做同一件事，使用者只能靠猜。

  现在 badge 只做一件事——挂在别的元素角上的一枚标记：

  ```vue
  <XhBadge :count="5" tone="danger" label="5 条未读">
    <XhButton>收件箱</XhButton>
  </XhBadge>
  ```

  - 解剖从单层 `root` 变成 `root`（锚点）+ `indicator`（角标），定位归组件自己管，
    不再要宿主手写 `position: relative` 与负偏移。
  - 新增 `placement`：`top-end`（默认）/ `top-start` / `bottom-end` / `bottom-start`，
    用逻辑属性写，rtl 下自动落到另一侧。
  - `size` 换的是圆点直径、两位数时的最小宽度与字号，不再是药丸那套内衬与行高。
  - Vue 侧另出 `XhBadgeRoot` / `XhBadgeIndicator`，要往角标里塞自定义内容时用它们。

  **破坏性**：删掉 `variant`；行内的状态药丸请改用 `tag`（`XhTagRoot` + `XhTagLabel`）。
  `data-size` 与 `data-tone` 从 `root` 挪到 `indicator`。

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
  `onSelectionChange`。

  - `TransferSelectedChangeDetails` → `TransferSelectionChangeDetails`。
  - Vue 事件 `@selected-change` → `@selection-change`；WC 的 `selected-change` 事件同改。

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

  **「移除列表里的一项」统一叫 `item-delete-trigger`。** 同一个动作四个组件三个名字：tags-input
  与 file-upload 已经是 `item-delete-trigger`，select 叫 `tag-remove`、dynamic-input 叫
  `remove-trigger`。tag 的 `close-trigger` 不动——它关的是标签自身，不是列表里的一项。

  迁移点：

  - select：`data-part='tag-remove'` → `'item-delete-trigger'`；皮肤覆盖槽
    `--xh-select-tag-remove-*` → `--xh-select-item-delete-*`（6 个）；
    `SelectApi.getTagRemoveProps` → `getItemDeleteTriggerProps`；Vue 组件 `XhSelectTagRemove` →
    `XhSelectItemDeleteTrigger`；WC 的 `::part(tag-remove)` → `::part(item-delete-trigger)`。
  - dynamic-input：`data-part='remove-trigger'` → `'item-delete-trigger'`；皮肤覆盖槽
    `--xh-dynamic-input-remove-fg-hover` → `--xh-dynamic-input-item-delete-fg-hover`；
    `DynamicInputApi.getRemoveTriggerProps` → `getItemDeleteTriggerProps`；Vue 组件
    `XhDynamicInputRemoveTrigger` → `XhDynamicInputItemDeleteTrigger`；WC 的
    `::part(remove-trigger)` → `::part(item-delete-trigger)`。

  **这枚按钮的文案键统一叫 `deleteItem`。** 四个组件的签名各不相同，统一的是命名形态。

  - select：`SelectTranslations.removeTag: string` → `deleteItem: (label: string) => string`，
    由定值串改成接收标签文本的函数，缺省 `Delete ${label}`。
  - tags-input：`deleteTagTrigger` → `deleteItem`。
  - file-upload：`deleteFile` → `deleteItem`；`FileUploadApi.deleteFile` 方法与 `FILE.DELETE`
    事件名不动——那是动作不是文案。
  - dynamic-input：`removeTrigger` → `deleteItem`。

  **没有合并的一处，记在这里免得后人重新翻案。** 就绪度审计说 pin-input 的 `onValueComplete`、
  editable 的 `onValueCommit`、slider 的 `onValueChangeEnd` 是「三个名字表达同一语义」，
  逐条读过源码后判定不成立：`onValueComplete` 是「每格都填满的那一刻」（值的形状谓词），
  `onValueCommit` 是「提交那一刻」（用户显式确认），`onValueChangeEnd` 是「一次操作结束」
  （手势结束，splitter 的 `onSizesChangeEnd` 用的是同一套）。三件不同的事，合并会让 API 更差。

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

- 5a1aedd: 轻提示与通知分家：新增 notification，toast 收窄成操作反馈，toaster 删除。

  原先 toast 一个组件担了两件事——「用户刚点了一下，告诉他结果」和「系统主动推来一条消息」。
  两者的信息量、停留时长、落位习惯、谁触发都不一样，混在一起的结果是标题加正文两层文本、
  九宫格落位、堆叠上限这些只有后者需要的东西全压在轻提示上，而轻提示自己反倒要靠一个
  额外的容器组件才能用起来。

  **通知（新增）**

  ```vue
  <XhNotificationRoot v-slot="{ create, dismiss }">
    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem :id="item.id" :title="item.title" :description="item.description">
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
  ```

  队列与卡片是同一个组件的两层：`root`（队列的作用域包装）/ `group`（某个位置上的那一摞，也是 `role=region` 的地标）/ `item` 起是单条卡片。
  九宫格落位、`max` 上限、同 id 就地改写、逐条计时与暂停都在这里。
  Web Components 侧是 `<xh-notification>` 与 `<xh-notification-item>`。

  单条卡片的生命周期复用 toast 那台机器——「会自己消失的卡片」这一行为与消息来源无关。

  通知另有命令式的 `createNotificationService`：推送连接的回调、后台任务的收尾、
  拦截器里的一条系统消息，调用点都在组件之外，让它们各自去找一份队列上下文并不现实。
  队列要长在页面结构里（通知中心那一栏自己排版）时用组件形态，两者不共享队列。

  **轻提示（收窄）**

  - 解剖去掉 `description`：一次操作的结果一句话说得完，说不完的那是通知。
  - 新增 `group` 部件：同时在场的几条叠成一摞。这一摞由全局服务渲染，没有对应的容器组件——
    反馈落在哪儿是整个服务的口径，不该让每个业务页面各挂一份容器再各自决定。
  - `createToastService` 的队列改为服务内部私有，`info` / `success` / `warning` / `error` /
    `loading` / `create` / `update` / `dismiss` / `dismissAll` 签名不变，调用点零改动。
    服务选项新增 `placement`（默认 `top`）、`max`（默认 5）、`gap`。

  **破坏性**

  - 删除 toaster：`XhToasterRoot` / `XhToasterGroup` / `useToaster` / `<xh-toaster>` /
    `connectToaster` / `toasterMachine` / `toasterAnatomy` / `@xihan-ui/styles/toaster.css` 等
    一并移除。组件树内的通知队列改用 notification，命令式轻提示继续用 `createToastService`。
  - toast 删掉 `description` 部件与 `getDescriptionProps`；`<xh-toast>` 的 `description` 属性同时移除。
    机器上的 `description` prop 保留——notification 的卡片复用同一台机器。
  - `ToastOptions` / `ToastRecord` 不再带 `placement`：轻提示的落位归服务，不逐条各去一处。
  - 覆盖槽 `--xh-toaster-inset` / `--xh-toaster-layer` 改名为 `--xh-notification-inset` /
    `--xh-notification-layer`；`--xh-toast-description-*` 随部件一起移除。

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

- 089db90: 清空 / 关闭 / 移除按钮收成四类契约（`开发设计/UI.ClearTrigger.Contract.md`），`check-clear-trigger` 门禁固化。

  **内嵌清空钮**（cascader · tree-select · combobox · date-picker · time-picker · text-field · tags-input · select，以及新增部件的 popselect · date-field · time-field）统一为：`tabindex=-1` 不占 Tab 位但**不再 aria-hidden**——读屏按 `aria-label` 找得到它，文案统一走 `translations.clearTrigger`（缺省 `'Clear'`；select 的 `clear` 键改名）；pointerdown 不夺焦，点完发 `VALUE.CLEAR` 并把焦点送回宿主（trigger / input / 第一段）；没值就 `hidden`，不再同时打 `disabled`/`data-disabled`、皮肤也不再留一颗永远看不见的灰钮；尺寸与圆角统一为 `var(--xh-<c>-action-size, var(--xh-control-action-size))` / `var(--xh-<c>-action-radius, var(--xh-shape-control))`——text-field 此前与输入框等高、select / tags-input 按指示符尺寸走 pill，`--xh-text-field-clear-*` / `--xh-tags-input-clear-*` / `--xh-select-clear-*` 槽改名 `action-*`；互斥一律由 connect 在被让位的部件上打 `data-clearable`、皮肤一条 `display: none`——select 去掉了 `:has()` 让位与 `:hover` 才显形（触屏此前根本看不到清空钮），清空钮改为 trigger 的兄弟并排（`--xh-select-control-gap`）。

  **键盘清空**：select · cascader · tree-select · popselect 此前没有任何键盘清空路径。现在焦点在 trigger、有值且可编辑时 **Delete 清空全部、Backspace 单选清空 / 多选去掉最后一个**，键盘表与一致性套件同步。

  **select** 补 `readOnly`（浮层照常展开、值改不动、清不掉）与 `VALUE.CLEAR` 事件（`api.clear()` 不再借 `VALUE.SET []`）；Vue 的 select / combobox Root 新增 `clearable`（缺省 false）决定 collection 自动渲染树是否带清空钮——combobox 此前无条件渲染，示例已补 `clearable`。

  **独立动作钮**（file-upload · signature-pad）：file-upload 的 `api.clearFiles()` 改名 `clear()`、`translations.clearFiles` 改名 `clearTrigger`；列表为空时不再原生 disabled（清完焦点会掉回 body），只打 `data-empty` 压淡。

  **浮层关闭钮**（dialog · drawer · popover · tour · toast · alert · floating-panel · image-viewer）统一 `var(--xh-<c>-close-size, var(--xh-control-h-sm))` / `var(--xh-<c>-close-radius, var(--xh-shape-control))`，dialog / drawer / popover / tour 补上使用者槽；image-viewer 保持 `--xh-control-h-lg`（全屏看片的 chrome 钮按触控靶走）但圆角归 control。**标签内移除钮**（tag · tags-input item · select tag）尺寸基准 `--xh-control-indicator-size`、圆角 `--xh-shape-inset`；行级删除钮（file-upload item · dynamic-input）按 `--xh-control-action-size` / `--xh-shape-control`。

  四类按钮都补了 `:active` 按压反馈（`--xh-motion-scale-press`），27 处登记进 `check-press-feedback`。

  `--xh-select-clear-*` / `--xh-tags-input-clear-*` / `--xh-text-field-clear-*` 共 20 个槽名变更是公开面删减，基线已推。

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

- ada8a01: 全局配置做成真正的 ConfigProvider：全局默认 + 局部覆盖，两个适配器一份语义。

  **嵌套注入改成逐键合并。** 此前子树里再 `provideXhConfig` 会把外层整份遮蔽——只想改一句文案，外层的 `locale` 与 `portalContainer` 一并丢掉，而文档一直把「不同子树各注各的」当卖点。现在键缺席与写成 `undefined` 都算「这一层没说」，一律回落外层；同一个组件下的文案也按键并。

  **Web Components 侧补上作用域。** 新增 `<xh-config>`：包住一棵子树，里面的元素沿 DOM 祖先链解析配置，合并规则与 Vue 侧完全一样（那边找组件树，这边找 DOM 树）。`setXhConfig` 仍管整页。元素自己不渲染任何东西，`display: contents`。

  **新增两个字段。** `size` 是尺寸档的应用级默认（对齐 AntD 的 `componentSize`），落到每个声明了三轴 `size` 的组件上；`floating-panel` 的 `size` 是一对像素数、同名不同义，两侧都在豁免名单里。`scrollRoot` 交出真正在滚的那个元素——宿主把滚动搬进内容容器时 `body` 本身不滚，模态浮层的滚动锁此前是空操作。`dir` 刻意不收：它走 DOM，行为层从计算样式读，再加一条 JS 通道只会对不上。

  **补上三处漏接。** `context-menu` 与 `tree-select` 声明了 `translations` 却没走 `withXhConfig`，全局文案对它们一直静默失效；`XhTranslationOverrides['date-field']` 指的是 `DatePickerTranslations`（`startDate` / `endDate`），而 `date-field` 的文案是逐段映射，类型过得去、运行期 100% 不命中，现改为 `DateFieldTranslations` 并把它从空接口填成段位映射。

  新增 `check-config-wiring` 门禁：两侧配置面字段必须一致、`size` 豁免名单两侧一致且与 headless 的类型对得上、声明了 `translations` 或三轴 `size` 的 Vue 组件必须真接上配置通道。

- f1b2c16: date-picker 补上 `defaultFocusedValue`，决定展开时先落在哪一页。

  日历一直有这个 prop，date-picker 没往外露：它的聚焦日单元格默认值写死为 `null`，只能退回首个选中值、再退回今天。没有初始值又想让面板先停在某个月（报表默认看上个月、排期表默认看下个月）此前没有出口。

  补上之后三路收口不变：写过的聚焦日 → `defaultFocusedValue` → 首个选中值 → 今天。表单重置回到 `defaultFocusedValue`，与其余 `default*` 一致。Web Components 那侧是 `default-focused-value`。

  顺带说明一处已有的误用：`defaultFocusedValue` 此前不是 date-picker 的 prop，测试里写了也不生效，那几条其实是靠「今天」恰好落在同一个月才通过的。现在它们真的按写的那一天算。

- 7f8021e: 日期区间的框选改成逐行横杠，面板数按区间跨不跨页现算，面板号写在日历上一处即可。

  **区间底色画成了一整块实心方块。** 底色铺在格子的背景上，格子上下的内衬也算背景区，
  而行与行之间没有间距——七月一整月被选中时，五行底色首尾相接连成一个大方块，
  两端那两枚圆点像是被按在方块上，看不出区间是一天一天连起来的。

  底色改由格子的 `::before` 铺：横向铺满格子，相邻两格接成一条；纵向收在格子内衬里，
  行与行之间留出 4px 空当。每一行的行首与行尾各自收圆，跨周的区间于是是一行一条两头圆的横杠。
  摆了周序号格的行里，行首那一格排在周序号后面，圆角跟着落到它身上。

  **两端那一格只铺半格**，另外半格由选中圆片占满：区间收在圆点上而不是收在格子边上。
  起止落在同一天时两条一起生效，底色宽度归零，只剩那枚圆点。

  **邻月的日子不再吃区间底色与选中圆片。** 并排两张面板里同一天会各出现一次
  （7 月 31 日既在七月的末行、也在八月的首行），两张都画就成了两个端点、两段底色。
  邻月的日子回到「压暗的数字」这一档。

  **粗粒度视图的邻月判定修正。** 月/季度/年三档里格子的值是那一段的第一天，与面板起点比月份恒不相等，
  于是除首格外整页都被判成邻月、整页压暗。这三档改用网格自报的 `inView`。

  **区间默认铺几个面板改成现算**：已选的两端落在同一页里就一张，跨页才并排两张；
  只落了一端（还在挑）时仍按两张算。日历同时恒渲染六行（新 prop `fixedWeeks`，默认开），
  并排的两张面板等高，翻页时浮层高度也不再跟着月份变。

  **面板号写在 `XhDatePickerCalendar` 上一处即可**：新增 `index` prop，面板内的
  `Heading` / `HeadingYearTrigger` / `HeadingMonthTrigger` / `Grid` / `Cell` 不写就跟着它走，
  自己写了仍按自己写的算。此前这五个部件各要写一遍，漏掉任何一个都会静默落到面板 0——
  两张面板显示同一个月份、第二张面板的邻月判定整片错位，都是这么来的。五个 prop 一并兼收字符串。

  **快捷选项列的高度由并排的日历给。** 此前这一列按内容收、上限写死一档，
  右侧那道分隔线只画到最后一条选项，比日历矮一截；它与旁边那张日历之间也补上了与两张日历之间同样的空当。

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

- 04a85b4: Web Components 侧接上表单重置。

  上一版只接了 Vue：`MachineController` 里一处都没有，`xh-radio-group` 这类元素放进 `<form>` 点重置
  一动不动。机器那侧 17 条 `FORM.RESET` 声明全在，事件却永远送不进去。

  `MachineController` 现在在 `hostConnected` 里挂桥、`hostDisconnected` 里撤桥。元素自己就是锚点
  （Light DOM），断连再重连会重建——搬出表单再搬回来仍然认新那份表单的重置。桥挂在 `mount` 之后：
  挂上就可能有事件送进来，而 mount 之前送会撞上 `SEND_BEFORE_MOUNT`。

  **门禁补上了让这次假绿成为可能的那一半。** `check-form-reset` 此前只查 headless 声明了事件，
  不查适配器接没接——所以 WC 一直没接线，它一直是绿的。现在多一条总闸检查：两个适配器各自唯一的
  接入点必须还在。桥一拆，17 个组件的重置会一起静默失效而每一条声明看着都还在，这正是逐组件检查
  天生看不见的那类。拆掉 WC 那座桥实跑过，如期变红。

- 1e90ce6: 热力图新增 `palette` 色板轴：`green` / `blue` / `orange` / `purple` / `red` / `gray`，直接按颜色点名色阶满档那一端，三种形态与图例一起跟着走。它是装饰性的一条轴，不是第四条语义轴——与 `tone` 同时写时听色板的，两条都压不过作者自己写的 `--xh-heatmap-ink`；不写时行为与之前逐字一致。

  令牌层随之补上紫色原语 `--xh-color-purple-600`：明度与彩度照 danger 的 600 档，只把色相换成 302。

- 091bbef: 补上动效地基的四个缺口。

  **减弱动效此前基本是失效的。** `tokens.css` 里一个 `prefers-reduced-motion` 都没有，降级靠 19 份皮肤各写各的 `@media`，而它们只把 `animation-duration` 压到 `0.01ms`——位移与缩放是写死的字面量，压时长压不掉。前庭不适恰恰来自大位移与缩放，所以「减弱动效」的用户看到的是瞬间跳完整段位移。现在幅度走 `--xh-motion-distance-sm/-md` 与 `--xh-motion-scale-enter`，令牌层在 reduce 下把它们归零，皮肤不必自带 `@media`。删掉 8 份已经冗余的降级块（含 8 条 `!important`）；marquee / skeleton / spinner 那几处有讲得通的自定义降级，保留。

  **dialog 与 image-viewer 的退场动画从来没播过。** 皮肤给挂着退场动画的 `content` 补了 `[hidden]{display:none}`，收起时元素当场不生成盒子，动画不启动，退场探测器放弃申领租约、就地卸载。drawer 早就绕开了这个坑，它的注释还写着「与 dialog 一致」——而 dialog 恰恰是反的。现在真的一致了，四条退场动画同时补上 `forwards`。

  **Web Components 端全域没有退场动画。** 三个浮层元素把收起写死在展开态上，与 `data-state="closed"` 同帧写内联 `display:none`。现在收起跟着 presence 走；Light DOM 下被拉长的不是节点存在的时间，而是可见的时间。

  **破坏性程度**：进场缩放统一到 `0.96`（此前 0.98 与 0.96 混用），dialog / toast 进场 / color-picker 的起势略明显一点。button 的加载转圈不再被压成 `0.01ms`——转圈是「系统还在做事」的唯一可感知信号，压掉等于把加载态变成假死。

  回归测试进了 `tests/browser/`：jsdom 不把样式表里的 animation 算进 `getComputedStyle`，这三件事在 jsdom 里结构性测不到。

- 689ed0f: 13 个宿主的滚动层自带自绘滚动条：滚动时或指针在这一片时露出、静止后收起，浮在内容之上不占宽度。

  **哪些宿主**：12 个浮层族的 `content`（cascader / color-picker / combobox / context-menu / date-picker / hover-card / mention / menu / pagination / popover / popselect / tree-select）与 json-viewer 的 `tree`、`text`，共 14 个滚动容器。条子由库自己建，作者一个部件都不用写：它是滚动层的兄弟，绝对定位贴在组件既有的壳上（浮层族是 `positioner`，json-viewer 是 `root`）。轴按各自的溢出方向摆——cascader 只摆横的，tree-select 与 json-viewer 竖横都摆、两条都溢出时各让出交叉口那一格，其余只摆竖的。

  挂上条子的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此把原生条藏成零宽：容器的可用宽度一点不减，也不再需要为原生条留空道。露面时机、尺寸档、拖动、触屏交给原生滚动这些全是 `scrollbar` 那一套，与手写 `<XhScrollbar>` / `<xh-scrollbar>` 挂上去的完全一致，缺省档是 `scroll-hover`。

  **json-viewer 换档跟随**：树档与原文档互斥，换档时条子跟到此刻在场的那个容器，节点不重建（换档不会把滚动条闪一下）。

  **按在 `positioner` 上不再消解浮层**：条子住在 `positioner` 里、是 `content` 的兄弟，浮层的层分支因此把 `positioner` 一并记上——不记的话按住条子拖动那一下会被判成层外交互，面板当场收起。副作用是 `positioner` 的其他子节点也算进了层内：吃指针的只有 combobox 的 `empty` 空态占位，按它不再关闭候选面板（此前会关）。其余 11 个浮层的 `positioner` 除了条子没有吃指针的子节点（`positioner` 自身是 `pointer-events: none`），按在面板之外仍照旧消解。

  **皮肤侧要跟着改的**：自带皮肤给这 13 个壳补了 `--xh-scrollbar-track-bg: transparent`（浮在内容上的条子不该有实色轨道），json-viewer 的 `root` 补了 `position: relative`（条子贴它的内边距盒）。第三方皮肤若整份接管这些 part，同样要给壳一个定位上下文，并把轨道底色关掉。滚动条自身的 `root` 补了 `pointer-events: auto`，抵消 `positioner` 那句 `none`。

- 843e17a: json-viewer 补原文视图：`view="text"` 直接出缩进过的 JSON 原文。

  树档是拿来"翻"的——折叠、逐层看结构；而"核对这份报文与后端下发的是不是一字不差"、
  "把它整段拷走"这两件事树档做不到：值受 `maxStringLength` 截断、成员受 `maxItems` 折减，
  分支摘要与把手还带 `user-select: none`，框选拿到的不是原文。原文档就是补这一件事，
  因此它刻意不吃那两个折减选项。

  `api.text` 在两档下都取得到，作者要做"复制原文"按钮时不必自己再序列化一遍。
  序列化与树同源：同一个 `jsonEntries` 排键（`sortKeys` 一样生效）、同一条祖先链判环
  （环落成 `"[Circular]"`，两条不相干分支共享同一个对象照样摊开），
  `bigint` / `undefined` / 函数这些 JSON 没有写法的值退回树上那份文本并按字符串写出，
  整份始终解析得动。

  新增 headless 出口 `jsonText` 与类型 `JsonViewerView`，解剖新增 `text` 部件。
  皮肤与树档共用同一套边框、内衬与高度令牌，两档切过去盒子不跳。

- 8d35702: 动效与浮层口径收口（`开发设计/UI.MotionOverlay.Contract.md`）。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- 3c033ca: 通知按卡片重排：左侧类型字形、右上角关闭钮、两列网格。

  它的皮肤是从旧的 toast 卡片逐字搬来的，搬完没人按「通知该长什么样」审过一遍，
  于是留下三处硬伤：

  - **叉掉到了卡片左下方**。`item` 是竖排 flex，而叉上写着
    `align-self: flex-start` + `margin-inline-start: auto`——交叉轴上的 auto 外边距
    会让对齐属性整条失效（flexbox §9.6），`align-self` 那行一点作用都没有，
    叉成了正文下面的第三行。实测它落在距卡片顶 55px 处，卡片因此高出一截。
    三家参考实现（Ant Design / Element Plus / Naive UI）都是绝对定位钉在右上角内衬处。
  - **组件路径下一个类型指示物都没有**。徽记只由服务档的默认模板画，
    12 份示例与所有 Web Components 使用者拿到的卡片，语气全靠起始侧那条 4px 色条承载，
    而它压在卡片底上只有 1.9–2.8:1，`loading` 与 `info` 除颜色外完全同形。
  - **字号比轻提示还小一档**（13px），标题与说明只差 7.7%，两层文字挤成一片。

  现在：

  - 新增 `item-indicator` 部件。作者留空即由皮肤按 `data-type` 画一枚兜底字形
    （info / success / warning / error 各一枚，`loading` 给转圈），
    颜色取 `--xh-_tone-fg`——与 alert 的状态图标同档，压在卡片底上十二组最低 4.08:1。
  - **两列网格**：左列字形、右列标题与说明；叉绝对定位钉在右上角，标题自动让位
    （写法照 dialog / drawer）。起始侧那条语气色条随之删除——三家都没有，
    语气改由字形承载。
  - 卡片宽 320 → 384px（`--xh-overlay-max-w-lg`，与 Ant Design 同值），
    内衬四边 16px，字号回到正文档 14px。
  - 服务档的默认模板改成四个节点平铺（不再套一层皮肤够不着的行容器），
    说明部件恒渲染——`aria-describedby` 是无条件发的，节点缺席就成了悬空引用。
  - 地标 `role="region"` 从 `root` 搬到 `group`。root 是 `display: contents` 的作用域包装，
    量出来 0×0，地标挂在它身上跳过去落不到任何看得见的地方；那一摞才是真盒子。

  顺带补上三处从来没有门禁看管的地方：`check-elevation-role`、`check-press-feedback`、
  `check-clear-trigger` 三份名单都没登记过 notification，眼下合规纯属巧合。

  **破坏性**：删掉 `--xh-notification-accent` 与 `--xh-notification-accent-width`
  两个覆盖槽（色条没了）。另有几个槽的默认值变了：`--xh-notification-w`（20rem → 24rem）、
  `--xh-notification-py` / `-px`（12/16 → 16/16）、`--xh-notification-font-size`（13 → 14）、
  `--xh-notification-gap` 的语义从「行距」改为「图标与正文的列距」（行距另开
  `--xh-notification-row-gap`）。地标从 root 挪到 group，按 `root[role=region]` 写过
  自动化断言的要跟着改。

- 1a36b7e: 省略号能摊开了：折进去的那几页现在有路走到。

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

- 911d0b7: 每页条数控制器随分页一起给了。

  ```vue
  <XhPaginationPageSizeSelect v-slot="{ options }">
    <option v-for="o in options" :key="o" :value="String(o)">{{ o }} 条 / 页</option>
  </XhPaginationPageSizeSelect>
  ```

  用**原生 `<select>`** 而不是再造一个浮层：档位就那么几档，浮层带不来什么，
  却要多接一层定位、消解与键盘；原生控件在 Web Components 侧也一样能用，键盘天然可达。
  不给插槽时按 `pageSizeOptions` 渲染默认档位。

  受控时会把 DOM 的选中项同步回填：宿主不写回的话，用户改过的原生 select 与真正生效的
  档位会对不上，而 vdom 那边没有变化就不会打补丁——这一条两个适配器共用。

- 720cf75: 每页条数从只读 prop 升成真状态。

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

- d738f78: `date-picker` 与 `time-picker` 新增快捷选项：给 `presets` 数据就在浮层里多排一列（「今天」「近 7 天」「此刻」这类），点一条整份写进值。新增 `presets` / `preset` 两个部件、`getPresetsProps` / `getPresetProps` 两个产出与两条键盘行；这一列自成一套 listbox 键盘，与日历网格、时分秒那几列互不抢键。

  单日的值就是一条 ISO 日期串，区间用 ISO 8601 的区间写法把两端拼起来（`2026-08-15/2026-08-21`），一个串同时充当这一项的身份。日子由使用者算好传进来——连接层每帧求值，`today()` 放进渲染期会跨零点算出两个答案；headless 备了 `datePickerPresetDay` / `-Range` / `-Month` / `-Year` 与 `timePickerPresetNow` 五个纯函数。

  date-picker 的收起沿用 `closeOnSelect` 那条守卫（区间要两端齐、showTime 仍由确认按钮收口）；time-picker 的快捷选项给的是整份时间，写完即收。

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

- a41b931: 进度条新增环形与仪表盘两种形态。

  - 新增 `variant` 轴：`line`（缺省，行为逐字不变）/ `circle` / `dashboard`，以及 `canvas`（承载环的 svg）与 `label`（环心那一块）两个可缺省部件。
  - 新增 props：`strokeWidth`（环的线宽，viewBox 单位，缺省 6）、`gapDegree` 与 `gapPosition`（仪表盘的缺口，缺省 75 度朝下）、`valueText`（进度不是百分比时给读屏念的那句话）。线宽是 prop 不是令牌——它改的是几何，半径要跟着往里收；线形的厚度仍走 `--xh-progress-thickness`。
  - 环的直径、底槽色、进度色与端点形状走令牌（`--xh-progress-size` / `-track` / `-range` / `-linecap`），几何由连接层算好写进标记，皮肤只上色。

  顺带两处修正：

  - 退化输入不再算成满进度：`max` 不为正或不是数时回落 100，`value` 不是数时按 0 处理（此前 `max=0` 会让进度算成满格）。
  - 线形的长度不再取整：`value=3 / max=8` 由 38% 改为 37.5%，相邻两档不会再看起来一样长。

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

- 9548330: 新增 `scrollbar` 组件：自绘滚动条，挂在**任意一个**滚动容器上——表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行，不必是本组件的后代。此前这套东西焊在 `scroll-area` 里，只有连视口带内容一起交出去的场景用得上。

  解剖 `root` / `track` / `thumb` 三层必需、`corner` 可选（横竖两条同时摆着时写在其中一条里补交叉口，配合 `gutter` 让两条各自让出那一格）；四种露面时机（`auto` / `always` / `scroll` / `hover`）带收起延时；拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限、成段的 `scroll-start` / `scroll-end` 与 `drag-start` / `drag-end` 都在库里。`focusable` 打开后滑块进 Tab 序、报 `role="scrollbar"` 与三个 `aria-value*`，方向键 / 翻页键 / Home / End 可用；缺省不进 Tab 序也对读屏隐藏——滚动本身由滚动容器报，同一件事没必要报两遍。触屏（粗指针）上默认交给原生滚动，整条不画并带 `data-native`，`forceVisible` 打开才画。收起不再打 `hidden`，而是 `data-state=hidden` 由皮肤淡出（`visibility` 随退场播完才收），露出同样淡入；根上另有 `data-hover` 标指针在不在这一片。

  **`scroll-area` 改由 `scrollbar` 组装。** 滚动区不再有自己的机器：它是视口加两条 scrollbar——`scrollbar` 角色节点是那条滚动条的挂载点、同时充当它的根，里面照 scrollbar 的写法摆 `track` / `thumb` / `corner`（戴 `data-scope="scrollbar"`），显隐、拖动、键盘、几何、触屏原生、淡入淡出全是 scrollbar 那一套，两个组件共用一份滚动条。Vue 新增 `XhScrollAreaTrack`；交叉口 `corner` 改写在竖条的挂载点里，两条都显形时才露；`scroll-area` 新增 `size` / `forceVisible`；视口的占道改打在视口自己身上（`data-lane-vertical` / `data-lane-horizontal`），不再依赖 `:has()`。原 `--xh-scroll-area-thumb-*` / `-bar-*` / `-corner-bg` 那几个槽随之归到 `--xh-scrollbar-*` 名下；`scrollAreaMachine` / `ScrollAreaSchema` / `SCROLL_AREA_*` 导出不再有，连接层改收两台 scrollbar 机器与 props（`scrollAreaScrollbarProps` 给出每台的 props）。挂了自绘滚动条的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此藏掉原生滚动条的外观——表格放进滚动区即可滚（吸顶表头与吸附列钉在视口上），虚拟滚动的视口给个 id 用 `controls` 挂上即可。

  滚动容器换了会自动把监听挪过去（`scrollable` / `controls` 指向另一个节点、或条件渲染的容器重建）；查不到时投一条 `scrollbar.missing-scrollable` 诊断，不静默，容器后到时调一次 `api.measure()` 即接上。容器里内容长短变了会自动重量（`MutationObserver` 盯着子树，一拍内合并成一次），量不到的场合另有 `api.measure()`。

- abe790b: 滚动条新增 `scroll-hover` 档，并把它定为缺省档。

  **新增 `'scroll-hover'`**：滚动时露出，指针进入滚动容器或滚动条时也露出；指针占着容器时滚动只重画滑块、不起收起倒计时，指针离开或停手满 `hideDelay` 才收起。它是 `hover` 与 `scroll` 两档显形条件的并集，与那两档一样浮在内容之上——`data-lane-*` 的判据只认 `auto` / `always`，视口宽度一点不减（横条同理不占高度）。

  **缺省档由 `'hover'` 改为 `'scroll-hover'`**：`scrollbar` 与 `scroll-area` 不写 `type` 时都走新档。显形集合是原缺省档的严格超集，没有一条本来看得见的滚动条会消失；占道与否、触屏交给原生滚动那一路都不变。

  **需要跟着改的代码**：对 `ScrollbarType` 做穷尽 `switch` / 映射表的地方要补 `'scroll-hover'` 分支；读 `ScrollbarApi.type` 或 `data-type` 并按值分派的代码会收到这个新值。

  状态机的两个判据改了名：`isHoverType` → `showsOnHover`、`isScrollType` → `showsOnScroll`（原名在新档下会读成谎话）。判据名只在机器内部与文档的「状态机」小节露面，不进公开 API。

  日志的视口那条 `scrollbar-gutter` 收窄到「还在用原生条」的情形：带 `data-xh-scrollbar` 的容器原生条已被藏成零宽，空道对它没有布局作用。没挂自绘条时空道照留，原生滚动条出现与消失仍不推动文字。

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

- f942e75: 表格补列偏好：一份可序列化的状态 + 几个写入口。

  ```ts
  interface TableColumnPreference {
    order?: string[]; // 列序
    hidden?: string[]; // 藏起来的列
    widths?: Record<string, number | string>; // 列宽覆盖
    sticky?: Record<string, boolean | "start" | "end">; // 冻结覆盖
  }
  ```

  `columnPreference` 给定即受控，`defaultColumnPreference` 非受控，
  变更走 `onColumnPreferenceChange`。写入口四个：`setColumnHidden` / `moveColumn` /
  `setColumnWidth` / `setColumnPreference`。

  **存到哪儿归使用者**——存 localStorage、存后端、跟着用户设置同步，都是应用的事；
  把存储通道焊进组件库只会让它绑死一种后端。库只负责把偏好算进生效列。

  三条语义值得单说：

  - `order` 只列一部分也成立：列到的排在前面，没列到的按原顺序跟在后面，
    于是「把某一列挪到最前」不必把全表列一遍。
  - 隐藏列**不占列号**，其余列跟着重排——让它继续占，读屏会报出一个数不到的格子。
  - 前缀列不受偏好摆布：它们是结构性的，由 `prefixColumns` 说了算。

- 9b8a795: 表格补前缀列、树形子行与行号。

  **前缀列**：`prefixColumns: ['index', 'select', 'expand']` 按给定顺序插在最前面，
  并**占住列号**——不占的话右侧所有列的 `aria-colindex` 会整体串位，而这正是使用者
  手工往 `columns` 里塞假列的原因。作者照 `api.columns` 渲染即可，每一项自报 `kind`。
  默认一列都不插，现有用法一行不用改。

  **树形子行**：`TableRowDef.parentId` 指父行。有子行的行不再产出详情行——
  一行不可能同时既展开出子行、又展开出一块详情。`aria-level` / `aria-posinset` /
  `aria-setsize` 从写死的 1 与 2 改成按真实层级给。

  **行号** `api.rowNumber(rowId)`：

  - 平表是**分页全局序号** `(page - 1) * pageSize + 可见序`，翻到第二页不会又从 1 开始；
    `page` / `pageSize` 只用来算序号，不参与切片（切片归调用方或分页组件的 `api.slice`）。
  - 树形是**大纲编号**（`1` / `1.1` / `1.2`），取的是「在父的 children 里的下标」
    而不是可见序：**收起某一枝时，仍在场的行编号一个都不变**。取可见序的话收起一枝，
    其后所有行的号会整体前移，用户看到的是「序号跳了」。

- a69cead: 树补一条 `leafOrientation`：末端那一层可以横排。

  只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层。一个菜单下十几个按钮，
  横排一行铺完，省掉大量纵向翻找：

  ```vue
  <XhTreeRoot :collection="menus" leaf-orientation="horizontal" />
  ```

  **中间层与整棵树恒是竖排，不提供开关。** 它们承载的是层级本身，横过来层级就读没了。
  判据是「这一层不再往下分」而不是「深度等于几」：同一棵树里各枝深浅不一，
  按深度判会把浅枝的中间层也横过来。

  **方向键不跟着改。** 树上左右是层级操作（收起 / 展开、回父层 / 进子层）、上下走可见行，
  这是 treeview 的规范语义，横排只是排布。

  顺带修一处：叶子行在竖排下会自己补出「箭头那一格」与同级分支对齐，横排下补出来的
  是节点之间的空隙而不是层级，那条规则因此按行盒**所在的那层容器**判定方向。

- e7d404a: 树补 `multiple` 布尔，`selectionMode` 转为它的旧写法。

  `TreeSelectionMode` 只有 `single | multiple` 两个取值，与一个布尔完全等价；而同族的
  `tree-select` 与另外六家（accordion / cascader / combobox / listbox / select / toggle-group）
  表达同一件事时用的都是 `multiple?: boolean`。同一个概念，树上要写
  `selection-mode="multiple"`、下拉树上要写 `multiple`——记不住是必然的。

  树现在也收 `multiple`（Vue 的 prop、自定义元素的 `multiple` 属性、api 上的 `multiple` 布尔）。
  `selectionMode` 保留一个大版本，标为 deprecated；**两者同时给时以 `selectionMode` 为准**，
  与 listbox 的规矩一致——所以已经在用 `selectionMode` 的代码行为一点不变，不必赶着改。

  `listbox` 的 `selectionMode` 不动：它有 `single | multiple | extended` 三个取值，
  不是布尔能表达的。`calendar` / `date-picker` 的同名 prop 同理。

- c5c5f7f: 两个适配器接上视觉层，各自走独立子入口 `@xihan-ui/vue/backgrounds` 与 `@xihan-ui/web-components/backgrounds`。

  `@xihan-ui/backgrounds` 声明为**可选 peer**：主入口一行都不引它，不用视觉效果的应用不会因为装了适配器
  而多出一个 WebGL 引擎。

  Vue 侧三种用法，从轻到重：`v-background` 指令、`XhBackground` 组件、`useBackground` 组合式函数。
  指令用在组件上时 Vue 会把它落到该组件的单一根元素上，所以给现成组件加背景不必改动组件本身。

  WC 侧是 `<xh-background>`：元素自身就是画布容器，内容照常写在里面，效果铺在内容底下，
  画布 `pointer-events: none` 不挡交互。参数走 `.params` property，点云走 `.setCloud()`。

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

- 67375fe: cascader 的空态占位在 WC 侧补齐，两个适配器不再分叉。

  空态占位在 Vue 侧由 `XhCascaderContent` 内部无条件渲染，作者一个字都不用写；WC 是 Light DOM、
  解剖归作者，`put('empty', …)` 遇不到节点就是空操作。于是同一份标记在 Vue 上有 `empty`、在 WC
  上没有——逐帧比对的 cascader 一整套 22 条从加空态那天起就是红的，而当时只补了 Vue 侧的单独用例。

  WC 侧改成：标记里没写 `empty` 就在 `content` 末尾补一个，位置与 Vue 侧一致，文案按当前视图取
  `noMatch` 或 `empty`。作者写了就用作者那份，只接线不新建，文案也一概不碰（判定沿用 `value-text`
  那套「首次见到该节点时若已有内容即判为归作者」）。

  顺带补上 `translations` 属性：cascader 是 WC 侧少数几个没声明它的元素之一，不补的话补出来的
  占位文案改不动。

  迁移点：无。作者已经写了 `empty` 的标记行为逐字不变；没写的从「什么都没有」变成「有一个按需
  显隐的占位」。

- 34bcedc: `custom-elements.json` 补上 `cssProperties` 与 `events` 的 `type`。

  analyzer 自己吐不出这两样:覆盖槽的事实源在皮肤里,事件 detail 类型在元素源码的 notify 签名上。
  新增 `scripts/enrich-cem.mjs` 在 `cem analyze` 之后就地从两边补写——1945 条皮肤覆盖槽、
  122 个事件里的 118 个带上了 detail 类型(其余 4 个是 composer#stop 这类没有 detail 的事件)。
  `pnpm --filter @xihan-ui/web-components cem` 的产出由 `gate:cem` 的 git diff 校验钉进流水线:
  改皮肤或改事件类型而不重跑,门禁当场失败。

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

- Updated dependencies [906b712]
- Updated dependencies [bc7eeed]
- Updated dependencies [e73b671]
- Updated dependencies [6456704]
- Updated dependencies [e12e337]
- Updated dependencies [ff84a16]
- Updated dependencies [97cbb2a]
- Updated dependencies [a55c76e]
- Updated dependencies [a19bbaa]
- Updated dependencies [ea78591]
- Updated dependencies [089db90]
- Updated dependencies [72dc39c]
- Updated dependencies [a7e8755]
- Updated dependencies [ada8a01]
- Updated dependencies [1461cec]
- Updated dependencies [f1b2c16]
- Updated dependencies [7f8021e]
- Updated dependencies [e2292bf]
- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [3469066]
- Updated dependencies [0be028c]
- Updated dependencies [378d511]
- Updated dependencies [82afde0]
- Updated dependencies [bc65cb7]
- Updated dependencies [1b7a5f1]
- Updated dependencies [e50a7c9]
- Updated dependencies [98d7ffe]
- Updated dependencies [ed01a81]
- Updated dependencies [1e90ce6]
- Updated dependencies [56310b8]
- Updated dependencies [84b1aa3]
- Updated dependencies [843e17a]
- Updated dependencies [a321a50]
- Updated dependencies
- Updated dependencies [8d35702]
- Updated dependencies [d43624c]
- Updated dependencies [3c033ca]
- Updated dependencies [ac885c9]
- Updated dependencies [b04e182]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [1a36b7e]
- Updated dependencies [911d0b7]
- Updated dependencies [720cf75]
- Updated dependencies [e31cc0a]
- Updated dependencies [d738f78]
- Updated dependencies [93fdcb8]
- Updated dependencies [516bd46]
- Updated dependencies [a41b931]
- Updated dependencies [0a57e2f]
- Updated dependencies [466f143]
- Updated dependencies [24721f4]
- Updated dependencies [9548330]
- Updated dependencies [abe790b]
- Updated dependencies [35c9b65]
- Updated dependencies [bbc3431]
- Updated dependencies [e788896]
- Updated dependencies [d0202b2]
- Updated dependencies [7a5d898]
- Updated dependencies [309feb2]
- Updated dependencies [fb97d76]
- Updated dependencies [f942e75]
- Updated dependencies [9b8a795]
- Updated dependencies [902cc49]
- Updated dependencies [8d6e450]
- Updated dependencies [bb47c3d]
- Updated dependencies [5a1aedd]
- Updated dependencies [52729a1]
- Updated dependencies [0148cf7]
- Updated dependencies [1126110]
- Updated dependencies [a69cead]
- Updated dependencies [e7d404a]
- Updated dependencies [4b949c2]
- Updated dependencies [35c9b65]
- Updated dependencies [46b82b0]
- Updated dependencies [ba3b3aa]
- Updated dependencies [520b847]
- Updated dependencies [c2b9748]
  - @xihan-ui/headless@1.0.0
  - @xihan-ui/kernel@1.0.0
  - @xihan-ui/backgrounds@1.0.0
  - @xihan-ui/machine@1.0.0
  - @xihan-ui/behavior@1.0.0
  - @xihan-ui/position@1.0.0
  - @xihan-ui/code-highlight@1.0.0
  - @xihan-ui/motion@1.0.0

## 1.0.0-preview.0

### Major Changes

- bc7eeed: 徽标收窄成「只做角标」，并补齐角标该有的能力。

  原先 badge 与 tag 是一对孪生：`variant` 三形态、`size` 三档、默认插槽放任意内容，
  连档位取值都逐个相同。两个组件做同一件事，使用者只能靠猜。

  现在 badge 只做一件事——挂在别的元素角上的一枚标记：

  ```vue
  <XhBadge :count="5" tone="danger" label="5 条未读">
    <XhButton>收件箱</XhButton>
  </XhBadge>
  ```

  - 解剖从单层 `root` 变成 `root`（锚点）+ `indicator`（角标），定位归组件自己管，
    不再要宿主手写 `position: relative` 与负偏移。
  - 新增 `placement`：`top-end`（默认）/ `top-start` / `bottom-end` / `bottom-start`，
    用逻辑属性写，rtl 下自动落到另一侧。
  - `size` 换的是圆点直径、两位数时的最小宽度与字号，不再是药丸那套内衬与行高。
  - Vue 侧另出 `XhBadgeRoot` / `XhBadgeIndicator`，要往角标里塞自定义内容时用它们。

  **破坏性**：删掉 `variant`；行内的状态药丸请改用 `tag`（`XhTagRoot` + `XhTagLabel`）。
  `data-size` 与 `data-tone` 从 `root` 挪到 `indicator`。

- 5a1aedd: 轻提示与通知分家：新增 notification，toast 收窄成操作反馈，toaster 删除。

  原先 toast 一个组件担了两件事——「用户刚点了一下，告诉他结果」和「系统主动推来一条消息」。
  两者的信息量、停留时长、落位习惯、谁触发都不一样，混在一起的结果是标题加正文两层文本、
  九宫格落位、堆叠上限这些只有后者需要的东西全压在轻提示上，而轻提示自己反倒要靠一个
  额外的容器组件才能用起来。

  **通知（新增）**

  ```vue
  <XhNotificationRoot v-slot="{ create, dismiss }">
    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem :id="item.id" :title="item.title" :description="item.description">
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
  ```

  队列与卡片是同一个组件的两层：`root`（队列的作用域包装）/ `group`（某个位置上的那一摞，也是 `role=region` 的地标）/ `item` 起是单条卡片。
  九宫格落位、`max` 上限、同 id 就地改写、逐条计时与暂停都在这里。
  Web Components 侧是 `<xh-notification>` 与 `<xh-notification-item>`。

  单条卡片的生命周期复用 toast 那台机器——「会自己消失的卡片」这一行为与消息来源无关。

  通知另有命令式的 `createNotificationService`：推送连接的回调、后台任务的收尾、
  拦截器里的一条系统消息，调用点都在组件之外，让它们各自去找一份队列上下文并不现实。
  队列要长在页面结构里（通知中心那一栏自己排版）时用组件形态，两者不共享队列。

  **轻提示（收窄）**

  - 解剖去掉 `description`：一次操作的结果一句话说得完，说不完的那是通知。
  - 新增 `group` 部件：同时在场的几条叠成一摞。这一摞由全局服务渲染，没有对应的容器组件——
    反馈落在哪儿是整个服务的口径，不该让每个业务页面各挂一份容器再各自决定。
  - `createToastService` 的队列改为服务内部私有，`info` / `success` / `warning` / `error` /
    `loading` / `create` / `update` / `dismiss` / `dismissAll` 签名不变，调用点零改动。
    服务选项新增 `placement`（默认 `top`）、`max`（默认 5）、`gap`。

  **破坏性**

  - 删除 toaster：`XhToasterRoot` / `XhToasterGroup` / `useToaster` / `<xh-toaster>` /
    `connectToaster` / `toasterMachine` / `toasterAnatomy` / `@xihan-ui/styles/toaster.css` 等
    一并移除。组件树内的通知队列改用 notification，命令式轻提示继续用 `createToastService`。
  - toast 删掉 `description` 部件与 `getDescriptionProps`；`<xh-toast>` 的 `description` 属性同时移除。
    机器上的 `description` prop 保留——notification 的卡片复用同一台机器。
  - `ToastOptions` / `ToastRecord` 不再带 `placement`：轻提示的落位归服务，不逐条各去一处。
  - 覆盖槽 `--xh-toaster-inset` / `--xh-toaster-layer` 改名为 `--xh-notification-inset` /
    `--xh-notification-layer`；`--xh-toast-description-*` 随部件一起移除。

### Minor Changes

- f1b2c16: date-picker 补上 `defaultFocusedValue`，决定展开时先落在哪一页。

  日历一直有这个 prop，date-picker 没往外露：它的聚焦日单元格默认值写死为 `null`，只能退回首个选中值、再退回今天。没有初始值又想让面板先停在某个月（报表默认看上个月、排期表默认看下个月）此前没有出口。

  补上之后三路收口不变：写过的聚焦日 → `defaultFocusedValue` → 首个选中值 → 今天。表单重置回到 `defaultFocusedValue`，与其余 `default*` 一致。Web Components 那侧是 `default-focused-value`。

  顺带说明一处已有的误用：`defaultFocusedValue` 此前不是 date-picker 的 prop，测试里写了也不生效，那几条其实是靠「今天」恰好落在同一个月才通过的。现在它们真的按写的那一天算。

- 7f8021e: 日期区间的框选改成逐行横杠，面板数按区间跨不跨页现算，面板号写在日历上一处即可。

  **区间底色画成了一整块实心方块。** 底色铺在格子的背景上，格子上下的内衬也算背景区，
  而行与行之间没有间距——七月一整月被选中时，五行底色首尾相接连成一个大方块，
  两端那两枚圆点像是被按在方块上，看不出区间是一天一天连起来的。

  底色改由格子的 `::before` 铺：横向铺满格子，相邻两格接成一条；纵向收在格子内衬里，
  行与行之间留出 4px 空当。每一行的行首与行尾各自收圆，跨周的区间于是是一行一条两头圆的横杠。
  摆了周序号格的行里，行首那一格排在周序号后面，圆角跟着落到它身上。

  **两端那一格只铺半格**，另外半格由选中圆片占满：区间收在圆点上而不是收在格子边上。
  起止落在同一天时两条一起生效，底色宽度归零，只剩那枚圆点。

  **邻月的日子不再吃区间底色与选中圆片。** 并排两张面板里同一天会各出现一次
  （7 月 31 日既在七月的末行、也在八月的首行），两张都画就成了两个端点、两段底色。
  邻月的日子回到「压暗的数字」这一档。

  **粗粒度视图的邻月判定修正。** 月/季度/年三档里格子的值是那一段的第一天，与面板起点比月份恒不相等，
  于是除首格外整页都被判成邻月、整页压暗。这三档改用网格自报的 `inView`。

  **区间默认铺几个面板改成现算**：已选的两端落在同一页里就一张，跨页才并排两张；
  只落了一端（还在挑）时仍按两张算。日历同时恒渲染六行（新 prop `fixedWeeks`，默认开），
  并排的两张面板等高，翻页时浮层高度也不再跟着月份变。

  **面板号写在 `XhDatePickerCalendar` 上一处即可**：新增 `index` prop，面板内的
  `Heading` / `HeadingYearTrigger` / `HeadingMonthTrigger` / `Grid` / `Cell` 不写就跟着它走，
  自己写了仍按自己写的算。此前这五个部件各要写一遍，漏掉任何一个都会静默落到面板 0——
  两张面板显示同一个月份、第二张面板的邻月判定整片错位，都是这么来的。五个 prop 一并兼收字符串。

  **快捷选项列的高度由并排的日历给。** 此前这一列按内容收、上限写死一档，
  右侧那道分隔线只画到最后一条选项，比日历矮一截；它与旁边那张日历之间也补上了与两张日历之间同样的空当。

- 689ed0f: 13 个宿主的滚动层自带自绘滚动条：滚动时或指针在这一片时露出、静止后收起，浮在内容之上不占宽度。

  **哪些宿主**：12 个浮层族的 `content`（cascader / color-picker / combobox / context-menu / date-picker / hover-card / mention / menu / pagination / popover / popselect / tree-select）与 json-viewer 的 `tree`、`text`，共 14 个滚动容器。条子由库自己建，作者一个部件都不用写：它是滚动层的兄弟，绝对定位贴在组件既有的壳上（浮层族是 `positioner`，json-viewer 是 `root`）。轴按各自的溢出方向摆——cascader 只摆横的，tree-select 与 json-viewer 竖横都摆、两条都溢出时各让出交叉口那一格，其余只摆竖的。

  挂上条子的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此把原生条藏成零宽：容器的可用宽度一点不减，也不再需要为原生条留空道。露面时机、尺寸档、拖动、触屏交给原生滚动这些全是 `scrollbar` 那一套，与手写 `<XhScrollbar>` / `<xh-scrollbar>` 挂上去的完全一致，缺省档是 `scroll-hover`。

  **json-viewer 换档跟随**：树档与原文档互斥，换档时条子跟到此刻在场的那个容器，节点不重建（换档不会把滚动条闪一下）。

  **按在 `positioner` 上不再消解浮层**：条子住在 `positioner` 里、是 `content` 的兄弟，浮层的层分支因此把 `positioner` 一并记上——不记的话按住条子拖动那一下会被判成层外交互，面板当场收起。副作用是 `positioner` 的其他子节点也算进了层内：吃指针的只有 combobox 的 `empty` 空态占位，按它不再关闭候选面板（此前会关）。其余 11 个浮层的 `positioner` 除了条子没有吃指针的子节点（`positioner` 自身是 `pointer-events: none`），按在面板之外仍照旧消解。

  **皮肤侧要跟着改的**：自带皮肤给这 13 个壳补了 `--xh-scrollbar-track-bg: transparent`（浮在内容上的条子不该有实色轨道），json-viewer 的 `root` 补了 `position: relative`（条子贴它的内边距盒）。第三方皮肤若整份接管这些 part，同样要给壳一个定位上下文，并把轨道底色关掉。滚动条自身的 `root` 补了 `pointer-events: auto`，抵消 `positioner` 那句 `none`。

- 843e17a: json-viewer 补原文视图：`view="text"` 直接出缩进过的 JSON 原文。

  树档是拿来"翻"的——折叠、逐层看结构；而"核对这份报文与后端下发的是不是一字不差"、
  "把它整段拷走"这两件事树档做不到：值受 `maxStringLength` 截断、成员受 `maxItems` 折减，
  分支摘要与把手还带 `user-select: none`，框选拿到的不是原文。原文档就是补这一件事，
  因此它刻意不吃那两个折减选项。

  `api.text` 在两档下都取得到，作者要做"复制原文"按钮时不必自己再序列化一遍。
  序列化与树同源：同一个 `jsonEntries` 排键（`sortKeys` 一样生效）、同一条祖先链判环
  （环落成 `"[Circular]"`，两条不相干分支共享同一个对象照样摊开），
  `bigint` / `undefined` / 函数这些 JSON 没有写法的值退回树上那份文本并按字符串写出，
  整份始终解析得动。

  新增 headless 出口 `jsonText` 与类型 `JsonViewerView`，解剖新增 `text` 部件。
  皮肤与树档共用同一套边框、内衬与高度令牌，两档切过去盒子不跳。

- 3c033ca: 通知按卡片重排：左侧类型字形、右上角关闭钮、两列网格。

  它的皮肤是从旧的 toast 卡片逐字搬来的，搬完没人按「通知该长什么样」审过一遍，
  于是留下三处硬伤：

  - **叉掉到了卡片左下方**。`item` 是竖排 flex，而叉上写着
    `align-self: flex-start` + `margin-inline-start: auto`——交叉轴上的 auto 外边距
    会让对齐属性整条失效（flexbox §9.6），`align-self` 那行一点作用都没有，
    叉成了正文下面的第三行。实测它落在距卡片顶 55px 处，卡片因此高出一截。
    三家参考实现（Ant Design / Element Plus / Naive UI）都是绝对定位钉在右上角内衬处。
  - **组件路径下一个类型指示物都没有**。徽记只由服务档的默认模板画，
    12 份示例与所有 Web Components 使用者拿到的卡片，语气全靠起始侧那条 4px 色条承载，
    而它压在卡片底上只有 1.9–2.8:1，`loading` 与 `info` 除颜色外完全同形。
  - **字号比轻提示还小一档**（13px），标题与说明只差 7.7%，两层文字挤成一片。

  现在：

  - 新增 `item-indicator` 部件。作者留空即由皮肤按 `data-type` 画一枚兜底字形
    （info / success / warning / error 各一枚，`loading` 给转圈），
    颜色取 `--xh-_tone-fg`——与 alert 的状态图标同档，压在卡片底上十二组最低 4.08:1。
  - **两列网格**：左列字形、右列标题与说明；叉绝对定位钉在右上角，标题自动让位
    （写法照 dialog / drawer）。起始侧那条语气色条随之删除——三家都没有，
    语气改由字形承载。
  - 卡片宽 320 → 384px（`--xh-overlay-max-w-lg`，与 Ant Design 同值），
    内衬四边 16px，字号回到正文档 14px。
  - 服务档的默认模板改成四个节点平铺（不再套一层皮肤够不着的行容器），
    说明部件恒渲染——`aria-describedby` 是无条件发的，节点缺席就成了悬空引用。
  - 地标 `role="region"` 从 `root` 搬到 `group`。root 是 `display: contents` 的作用域包装，
    量出来 0×0，地标挂在它身上跳过去落不到任何看得见的地方；那一摞才是真盒子。

  顺带补上三处从来没有门禁看管的地方：`check-elevation-role`、`check-press-feedback`、
  `check-clear-trigger` 三份名单都没登记过 notification，眼下合规纯属巧合。

  **破坏性**：删掉 `--xh-notification-accent` 与 `--xh-notification-accent-width`
  两个覆盖槽（色条没了）。另有几个槽的默认值变了：`--xh-notification-w`（20rem → 24rem）、
  `--xh-notification-py` / `-px`（12/16 → 16/16）、`--xh-notification-font-size`（13 → 14）、
  `--xh-notification-gap` 的语义从「行距」改为「图标与正文的列距」（行距另开
  `--xh-notification-row-gap`）。地标从 root 挪到 group，按 `root[role=region]` 写过
  自动化断言的要跟着改。

- 1a36b7e: 省略号能摊开了：折进去的那几页现在有路走到。

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

- 911d0b7: 每页条数控制器随分页一起给了。

  ```vue
  <XhPaginationPageSizeSelect v-slot="{ options }">
    <option v-for="o in options" :key="o" :value="String(o)">{{ o }} 条 / 页</option>
  </XhPaginationPageSizeSelect>
  ```

  用**原生 `<select>`** 而不是再造一个浮层：档位就那么几档，浮层带不来什么，
  却要多接一层定位、消解与键盘；原生控件在 Web Components 侧也一样能用，键盘天然可达。
  不给插槽时按 `pageSizeOptions` 渲染默认档位。

  受控时会把 DOM 的选中项同步回填：宿主不写回的话，用户改过的原生 select 与真正生效的
  档位会对不上，而 vdom 那边没有变化就不会打补丁——这一条两个适配器共用。

- 720cf75: 每页条数从只读 prop 升成真状态。

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

- abe790b: 滚动条新增 `scroll-hover` 档，并把它定为缺省档。

  **新增 `'scroll-hover'`**：滚动时露出，指针进入滚动容器或滚动条时也露出；指针占着容器时滚动只重画滑块、不起收起倒计时，指针离开或停手满 `hideDelay` 才收起。它是 `hover` 与 `scroll` 两档显形条件的并集，与那两档一样浮在内容之上——`data-lane-*` 的判据只认 `auto` / `always`，视口宽度一点不减（横条同理不占高度）。

  **缺省档由 `'hover'` 改为 `'scroll-hover'`**：`scrollbar` 与 `scroll-area` 不写 `type` 时都走新档。显形集合是原缺省档的严格超集，没有一条本来看得见的滚动条会消失；占道与否、触屏交给原生滚动那一路都不变。

  **需要跟着改的代码**：对 `ScrollbarType` 做穷尽 `switch` / 映射表的地方要补 `'scroll-hover'` 分支；读 `ScrollbarApi.type` 或 `data-type` 并按值分派的代码会收到这个新值。

  状态机的两个判据改了名：`isHoverType` → `showsOnHover`、`isScrollType` → `showsOnScroll`（原名在新档下会读成谎话）。判据名只在机器内部与文档的「状态机」小节露面，不进公开 API。

  日志的视口那条 `scrollbar-gutter` 收窄到「还在用原生条」的情形：带 `data-xh-scrollbar` 的容器原生条已被藏成零宽，空道对它没有布局作用。没挂自绘条时空道照留，原生滚动条出现与消失仍不推动文字。

- f942e75: 表格补列偏好：一份可序列化的状态 + 几个写入口。

  ```ts
  interface TableColumnPreference {
    order?: string[]; // 列序
    hidden?: string[]; // 藏起来的列
    widths?: Record<string, number | string>; // 列宽覆盖
    sticky?: Record<string, boolean | "start" | "end">; // 冻结覆盖
  }
  ```

  `columnPreference` 给定即受控，`defaultColumnPreference` 非受控，
  变更走 `onColumnPreferenceChange`。写入口四个：`setColumnHidden` / `moveColumn` /
  `setColumnWidth` / `setColumnPreference`。

  **存到哪儿归使用者**——存 localStorage、存后端、跟着用户设置同步，都是应用的事；
  把存储通道焊进组件库只会让它绑死一种后端。库只负责把偏好算进生效列。

  三条语义值得单说：

  - `order` 只列一部分也成立：列到的排在前面，没列到的按原顺序跟在后面，
    于是「把某一列挪到最前」不必把全表列一遍。
  - 隐藏列**不占列号**，其余列跟着重排——让它继续占，读屏会报出一个数不到的格子。
  - 前缀列不受偏好摆布：它们是结构性的，由 `prefixColumns` 说了算。

- 9b8a795: 表格补前缀列、树形子行与行号。

  **前缀列**：`prefixColumns: ['index', 'select', 'expand']` 按给定顺序插在最前面，
  并**占住列号**——不占的话右侧所有列的 `aria-colindex` 会整体串位，而这正是使用者
  手工往 `columns` 里塞假列的原因。作者照 `api.columns` 渲染即可，每一项自报 `kind`。
  默认一列都不插，现有用法一行不用改。

  **树形子行**：`TableRowDef.parentId` 指父行。有子行的行不再产出详情行——
  一行不可能同时既展开出子行、又展开出一块详情。`aria-level` / `aria-posinset` /
  `aria-setsize` 从写死的 1 与 2 改成按真实层级给。

  **行号** `api.rowNumber(rowId)`：

  - 平表是**分页全局序号** `(page - 1) * pageSize + 可见序`，翻到第二页不会又从 1 开始；
    `page` / `pageSize` 只用来算序号，不参与切片（切片归调用方或分页组件的 `api.slice`）。
  - 树形是**大纲编号**（`1` / `1.1` / `1.2`），取的是「在父的 children 里的下标」
    而不是可见序：**收起某一枝时，仍在场的行编号一个都不变**。取可见序的话收起一枝，
    其后所有行的号会整体前移，用户看到的是「序号跳了」。

- a69cead: 树补一条 `leafOrientation`：末端那一层可以横排。

  只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层。一个菜单下十几个按钮，
  横排一行铺完，省掉大量纵向翻找：

  ```vue
  <XhTreeRoot :collection="menus" leaf-orientation="horizontal" />
  ```

  **中间层与整棵树恒是竖排，不提供开关。** 它们承载的是层级本身，横过来层级就读没了。
  判据是「这一层不再往下分」而不是「深度等于几」：同一棵树里各枝深浅不一，
  按深度判会把浅枝的中间层也横过来。

  **方向键不跟着改。** 树上左右是层级操作（收起 / 展开、回父层 / 进子层）、上下走可见行，
  这是 treeview 的规范语义，横排只是排布。

  顺带修一处：叶子行在竖排下会自己补出「箭头那一格」与同级分支对齐，横排下补出来的
  是节点之间的空隙而不是层级，那条规则因此按行盒**所在的那层容器**判定方向。

- e7d404a: 树补 `multiple` 布尔，`selectionMode` 转为它的旧写法。

  `TreeSelectionMode` 只有 `single | multiple` 两个取值，与一个布尔完全等价；而同族的
  `tree-select` 与另外六家（accordion / cascader / combobox / listbox / select / toggle-group）
  表达同一件事时用的都是 `multiple?: boolean`。同一个概念，树上要写
  `selection-mode="multiple"`、下拉树上要写 `multiple`——记不住是必然的。

  树现在也收 `multiple`（Vue 的 prop、自定义元素的 `multiple` 属性、api 上的 `multiple` 布尔）。
  `selectionMode` 保留一个大版本，标为 deprecated；**两者同时给时以 `selectionMode` 为准**，
  与 listbox 的规矩一致——所以已经在用 `selectionMode` 的代码行为一点不变，不必赶着改。

  `listbox` 的 `selectionMode` 不动：它有 `single | multiple | extended` 三个取值，
  不是布尔能表达的。`calendar` / `date-picker` 的同名 prop 同理。

### Patch Changes

- Updated dependencies [bc7eeed]
- Updated dependencies [e73b671]
- Updated dependencies [6456704]
- Updated dependencies [f1b2c16]
- Updated dependencies [7f8021e]
- Updated dependencies [378d511]
- Updated dependencies [82afde0]
- Updated dependencies [56310b8]
- Updated dependencies [843e17a]
- Updated dependencies [3c033ca]
- Updated dependencies [1a36b7e]
- Updated dependencies [911d0b7]
- Updated dependencies [720cf75]
- Updated dependencies [abe790b]
- Updated dependencies [fb97d76]
- Updated dependencies [f942e75]
- Updated dependencies [9b8a795]
- Updated dependencies [902cc49]
- Updated dependencies [5a1aedd]
- Updated dependencies [0148cf7]
- Updated dependencies [1126110]
- Updated dependencies [a69cead]
- Updated dependencies [e7d404a]
  - @xihan-ui/headless@1.0.0-preview.0
  - @xihan-ui/kernel@1.0.0-preview.0
  - @xihan-ui/machine@1.0.0-preview.0
  - @xihan-ui/behavior@1.0.0-preview.0
  - @xihan-ui/motion@1.0.0-preview.0
  - @xihan-ui/code-highlight@1.0.0-preview.0
  - @xihan-ui/position@1.0.0-preview.0
  - @xihan-ui/backgrounds@1.0.0-preview.0

## 1.0.0-alpha.3

### Major Changes

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

- 34bcedc: `custom-elements.json` 补上 `cssProperties` 与 `events` 的 `type`。

  analyzer 自己吐不出这两样:覆盖槽的事实源在皮肤里,事件 detail 类型在元素源码的 notify 签名上。
  新增 `scripts/enrich-cem.mjs` 在 `cem analyze` 之后就地从两边补写——1945 条皮肤覆盖槽、
  122 个事件里的 118 个带上了 detail 类型(其余 4 个是 composer#stop 这类没有 detail 的事件)。
  `pnpm --filter @xihan-ui/web-components cem` 的产出由 `gate:cem` 的 git diff 校验钉进流水线:
  改皮肤或改事件类型而不重跑,门禁当场失败。

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

## 1.0.0-alpha.2

### Minor Changes

- 091bbef: 补上动效地基的四个缺口。

  **减弱动效此前基本是失效的。** `tokens.css` 里一个 `prefers-reduced-motion` 都没有，降级靠 19 份皮肤各写各的 `@media`，而它们只把 `animation-duration` 压到 `0.01ms`——位移与缩放是写死的字面量，压时长压不掉。前庭不适恰恰来自大位移与缩放，所以「减弱动效」的用户看到的是瞬间跳完整段位移。现在幅度走 `--xh-motion-distance-sm/-md` 与 `--xh-motion-scale-enter`，令牌层在 reduce 下把它们归零，皮肤不必自带 `@media`。删掉 8 份已经冗余的降级块（含 8 条 `!important`）；marquee / skeleton / spinner 那几处有讲得通的自定义降级，保留。

  **dialog 与 image-viewer 的退场动画从来没播过。** 皮肤给挂着退场动画的 `content` 补了 `[hidden]{display:none}`，收起时元素当场不生成盒子，动画不启动，退场探测器放弃申领租约、就地卸载。drawer 早就绕开了这个坑，它的注释还写着「与 dialog 一致」——而 dialog 恰恰是反的。现在真的一致了，四条退场动画同时补上 `forwards`。

  **Web Components 端全域没有退场动画。** 三个浮层元素把收起写死在展开态上，与 `data-state="closed"` 同帧写内联 `display:none`。现在收起跟着 presence 走；Light DOM 下被拉长的不是节点存在的时间，而是可见的时间。

  **破坏性程度**：进场缩放统一到 `0.96`（此前 0.98 与 0.96 混用），dialog / toast 进场 / color-picker 的起势略明显一点。button 的加载转圈不再被压成 `0.01ms`——转圈是「系统还在做事」的唯一可感知信号，压掉等于把加载态变成假死。

  回归测试进了 `tests/browser/`：jsdom 不把样式表里的 animation 算进 `getComputedStyle`，这三件事在 jsdom 里结构性测不到。

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

### Patch Changes

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

- 04a85b4: Web Components 侧接上表单重置。

  上一版只接了 Vue：`MachineController` 里一处都没有，`xh-radio-group` 这类元素放进 `<form>` 点重置
  一动不动。机器那侧 17 条 `FORM.RESET` 声明全在，事件却永远送不进去。

  `MachineController` 现在在 `hostConnected` 里挂桥、`hostDisconnected` 里撤桥。元素自己就是锚点
  （Light DOM），断连再重连会重建——搬出表单再搬回来仍然认新那份表单的重置。桥挂在 `mount` 之后：
  挂上就可能有事件送进来，而 mount 之前送会撞上 `SEND_BEFORE_MOUNT`。

  **门禁补上了让这次假绿成为可能的那一半。** `check-form-reset` 此前只查 headless 声明了事件，
  不查适配器接没接——所以 WC 一直没接线，它一直是绿的。现在多一条总闸检查：两个适配器各自唯一的
  接入点必须还在。桥一拆，17 个组件的重置会一起静默失效而每一条声明看着都还在，这正是逐组件检查
  天生看不见的那类。拆掉 WC 那座桥实跑过，如期变红。

- a41b931: 进度条新增环形与仪表盘两种形态。

  - 新增 `variant` 轴：`line`（缺省，行为逐字不变）/ `circle` / `dashboard`，以及 `canvas`（承载环的 svg）与 `label`（环心那一块）两个可缺省部件。
  - 新增 props：`strokeWidth`（环的线宽，viewBox 单位，缺省 6）、`gapDegree` 与 `gapPosition`（仪表盘的缺口，缺省 75 度朝下）、`valueText`（进度不是百分比时给读屏念的那句话）。线宽是 prop 不是令牌——它改的是几何，半径要跟着往里收；线形的厚度仍走 `--xh-progress-thickness`。
  - 环的直径、底槽色、进度色与端点形状走令牌（`--xh-progress-size` / `-track` / `-range` / `-linecap`），几何由连接层算好写进标记，皮肤只上色。

  顺带两处修正：

  - 退化输入不再算成满进度：`max` 不为正或不是数时回落 100，`value` 不是数时按 0 处理（此前 `max=0` 会让进度算成满格）。
  - 线形的长度不再取整：`value=3 / max=8` 由 38% 改为 37.5%，相邻两档不会再看起来一样长。

### Patch Changes

- 67375fe: cascader 的空态占位在 WC 侧补齐，两个适配器不再分叉。

  空态占位在 Vue 侧由 `XhCascaderContent` 内部无条件渲染，作者一个字都不用写；WC 是 Light DOM、
  解剖归作者，`put('empty', …)` 遇不到节点就是空操作。于是同一份标记在 Vue 上有 `empty`、在 WC
  上没有——逐帧比对的 cascader 一整套 22 条从加空态那天起就是红的，而当时只补了 Vue 侧的单独用例。

  WC 侧改成：标记里没写 `empty` 就在 `content` 末尾补一个，位置与 Vue 侧一致，文案按当前视图取
  `noMatch` 或 `empty`。作者写了就用作者那份，只接线不新建，文案也一概不碰（判定沿用 `value-text`
  那套「首次见到该节点时若已有内容即判为归作者」）。

  顺带补上 `translations` 属性：cascader 是 WC 侧少数几个没声明它的元素之一，不补的话补出来的
  占位文案改不动。

  迁移点：无。作者已经写了 `empty` 的标记行为逐字不变；没写的从「什么都没有」变成「有一个按需
  显隐的占位」。

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
