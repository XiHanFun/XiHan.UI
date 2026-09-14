# XiHan.UI 统一组件设计方案

状态：已生效。

本文只规定组件应当怎样设计、怎样确定样式、怎样实现和怎样验收。所有后续组件和现有组件重构必须遵守；单个组件不得自行偏离。

## 1. 规范级别

- **必须**：不满足即不能合并。
- **应当**：默认执行；只有存在明确的组件语义冲突时才能例外，并在文档和测试中说明。
- **可以**：按组件能力选择，不构成统一公开契约。

当局部组件需求与本规范冲突时，先修改本规范并完成评审，再改组件。禁止在组件 CSS、适配器或示例中偷偷形成第二套规则。

## 2. 组件设计步骤

每个组件按以下顺序设计，不得从画样式开始：

1. 确认组件是否有必要存在。
2. 定义用户任务、何时使用、何时不用。
3. 归入组件家族。
4. 定义 anatomy、状态、事件和键盘行为。
5. 确定受控/非受控、异步和生命周期契约。
6. 按统一规则确定尺寸、圆角、材质、颜色和动效。
7. 实现 Headless，再实现三个适配器和共享皮肤。
8. 完成文档、示例、生成物、测试和 changeset。
9. 验证通过后独立提交。

### 2.1 是否新增组件

同时满足以下条件才新增：

- 解决一个稳定、可重复出现的用户任务。
- 现有组件组合无法在不复制行为的前提下完成。
- 拥有明确的语义、状态或生命周期边界。
- 能定义稳定 anatomy，而不是某个页面的临时布局。
- 至少有一个可验证的无障碍和交互契约。

以下情况不新增：

- 只是现有组件换颜色、圆角或间距。
- 只是某个业务页面的固定排列。
- 只为缩短少量模板代码。
- 需要大量互斥 props 才能解释其身份。
- 与现有组件功能相同，仅名称不同。

## 3. 分层实现

```text
Primitive Tokens
  └─ Semantic Tokens
      └─ Family Recipes
          └─ Component Slots

Core Behaviors
  └─ Headless Component
      ├─ Vue Adapter
      ├─ React Adapter
      └─ Web Components Adapter
          └─ Shared CSS Skin
```

### 3.1 Core

Core 只放跨组件可复用的行为原语：

- 焦点、选区、集合导航、Portal、Dismiss、Presence。
- 图层仲裁、滚动锁定、表单重置、环境检测。
- 与框架、组件名称和具体 DOM 结构无关的算法。

### 3.2 Headless

Headless 是组件行为真源，必须包含：

- Props、Context、State、Event、Action、Guard 和 Effect。
- `connect` 产生的 DOM 属性、事件处理器和状态属性。
- anatomy、required parts、键盘表和元数据。
- 默认值、非法输入校验和可访问名称生成。

跨框架行为不得在适配器中重新实现。

### 3.3 适配器

Vue、React、Web Components 只负责：

- 框架响应式接入。
- DOM 引用、Portal 目标和原生监听器。
- 将同一 Headless API 渲染为各自节点。
- 生命周期的绑定与释放。

适配器不得改变状态语义、默认值、键盘行为或事件载荷。

### 3.4 共享皮肤

- 三端必须消费同一份 CSS。
- CSS 只依赖 `data-scope`、`data-part`、状态属性和语义令牌。
- 不以框架类名、组件实现细节或 DOM 顺序作为唯一选择依据。
- 组件状态由 Headless 发出，CSS 不通过内容猜测业务状态。

## 4. 组件家族

新组件必须先归族，再决定局部样式。

| 家族 | 典型组件 | 必须复用的规则 |
| --- | --- | --- |
| Action Control | Button、Toggle、分页按钮、图标按钮 | 高度、内边距、图标间距、按压、焦点、禁用、加载 |
| Field Chrome | Input、Select Trigger、Date Field、Combobox | 字段表面、placeholder、前后缀、清空、focus、invalid |
| Collection Item | Menu Item、Listbox Item、Tree Node、Table Row | highlighted、selected、pressed、disabled、缩进、指示器 |
| Surface | Card、Alert、Empty State、Panel | 标题、说明、正文、操作区、内边距、层级 |
| Overlay | Popover、Menu、Dialog、Drawer、Tooltip | Portal、定位、遮罩、边界、进退场、焦点归还 |
| Feedback | Toast、Notification、Progress、Skeleton | 状态语气、计时、暂停、消除、加载和即时反馈 |

新增 Family Recipe 必须满足以下任一条件：

- 已有两个明确消费者。
- 单个组件具有不可共享但稳定的结构身份，并经过专项评审。

禁止多个组件复制相同状态样式后再各自维护。

## 5. 样式确定方法

组件样式必须按以下决策顺序确定。

### 5.1 第一步：确定功能身份

| 问题 | 结果 |
| --- | --- |
| 用户是否直接触发动作 | Action Control |
| 用户是否输入或选择值 | Field Chrome |
| 用户是否在集合中导航、选择或操作条目 | Collection Item |
| 组件是否长期承载一组内容 | Surface |
| 组件是否脱离文档流并临时覆盖页面 | Overlay |
| 组件是否表达任务过程或结果 | Feedback |

一个组件可以组合多个家族，但每个部件只能有一个主要身份。例如 Select 的 trigger 属于 Field Chrome，option 属于 Collection Item，content 属于 Overlay。

### 5.2 第二步：确定视觉轴

只允许使用以下公共轴：

- `size`：sm、md、lg。
- `variant`：结构形态，不表达业务状态。
- `tone`：neutral、brand、info、success、warning、danger。
- `density`：standard、compact，由环境统一控制。
- `orientation`：horizontal、vertical，仅结构确实支持两种方向时提供。

禁止用 `type`、`color`、`status`、`danger` 等多套 props 重复表达同一视觉结果。

### 5.3 第三步：确定层级

从低到高：

```text
canvas → solid/soft → raised → floating/frosted → sheet
```

- 页面背景使用 canvas。
- 普通静态内容使用 solid 或 soft。
- Card 和可抬起区域使用 raised。
- 锚定瞬态浮层使用 floating；确实需要透景时使用 frosted。
- Dialog、Drawer、Toast 等强反馈或模态面使用 sheet。

同一页面不允许用更多阴影表达同一级别。层级优先通过间距、背景差和边框确定，阴影只表达真实抬升。

### 5.4 第四步：确定状态

先画 rest，再按固定顺序补齐：

```text
hover → active/pressed → focus-visible → selected/open
→ disabled → loading/pending → invalid/error → dismissing/unmounted
```

不能只完成默认状态。任何状态缺失都视为组件未完成。

### 5.5 第五步：确定环境变化

每个视觉决定必须回答：

- 暗色下是否仍保持相同层级。
- compact 下哪些尺寸和间距改变。
- RTL 下方向是否镜像。
- 粗指针下命中区是否足够。
- reduced motion 下如何保留反馈。
- reduced transparency 下模糊材质如何转为实体面。
- forced colors 下边界和状态如何可见。
- 打印时是否应隐藏、转实体或回到正常流。

## 6. 强制视觉尺度

### 6.1 间距

| 类型 | 允许值 |
| --- | --- |
| 基础网格 | 4px |
| 半阶补偿 | 2、6、10px |
| 常用间距 | 4、8、12、16、20、24、32px |

规则：

- 所有 padding、gap 和布局间距必须走令牌。
- 2/6/10px 只用于图标基线、紧凑控件和几何补偿。
- 不允许 5、7、9、13、15px 等散值。
- 信息关系越紧密，间距越小；不同信息组至少提升一个间距档位。

### 6.2 控件高度

| 密度 | sm | md | lg |
| --- | ---: | ---: | ---: |
| standard | 32px | 36px | 40px |
| compact | 28px | 32px | 36px |

- md 是默认尺寸。
- 同一 `size` 不随断点自动改变高度。
- 图标按钮视觉盒遵循同一高度。
- 粗指针命中区至少 44×44px；可以用伪元素扩展，不能改变布局盒。

### 6.3 小圆角

| 角色 | 圆角 | 用途 |
| --- | ---: | --- |
| inset | 4px | 内嵌项、微型状态块 |
| control | 4px | Button、Input、Select Trigger、Toggle |
| surface | 8px | Card、Alert、Panel、列表容器 |
| overlay | 12px | Popover、Menu、Dialog、Drawer、Toast |
| circle | 50% | 头像、圆形图标按钮、单选指示器 |
| pill | 9999px | Badge、Tag、胶囊轨道 |

强制规则：

- 普通按钮、字段、卡片和浮层不得使用 pill。
- 组件不得写 6px、10px 等独立圆角。
- 内层圆角不得大于外层圆角减去内边距。
- 相连控件消除相接侧圆角，不使用负 margin 伪造连接。
- 亮色、暗色和 compact 不改变形状身份。

### 6.4 排版

- 正文和控件默认使用 14px。
- 标题、正文、说明、占位和标签必须使用语义排版令牌。
- 层级通过字号、字重、行高和间距共同表达，不能只调颜色。
- 不使用极小字号换取信息密度。
- 单行控件文字必须垂直居中；多行内容使用正文行高。
- 标题、标签和按钮不写多余句号。

## 7. 颜色

### 7.1 语义角色

- 背景：canvas、surface、surface-raised、subtle、overlay。
- 前景：default、muted、subtle、disabled、inverse。
- 品牌：brand、brand-foreground、brand-subtle、brand-subtle-foreground。
- 状态：info、success、warning、danger、neutral。
- 边界：default、control、control-hover、control-focus、danger。

每个实色和柔和语气必须提供匹配的 foreground；组件不得自行计算文字颜色。

### 7.2 使用规则

1. 页面主体保持中性，品牌色只用于主要动作、选择、焦点和关键进度。
2. 状态色表达任务结果，不表达空间层级。
3. danger 动作与 error 状态分开定义，不共用业务语义。
4. hover、active、selected 从当前语义面派生，不切换到无关颜色。
5. disabled 不能只降低 opacity，必须同时调整前景或背景并关闭交互。
6. 错误、选择、加载和警告不能只靠颜色，必须有图标、形状、文案或结构通道。
7. 暗色不是简单反相；overlay 必须能从 canvas 和 surface 中辨认。
8. 所有背景/前景组合必须通过对比度门禁。

## 8. 材质

| 材质 | 用途 | 强制表达 |
| --- | --- | --- |
| solid | 普通静态容器 | 实体背景 + 必要边界 |
| soft | 次级操作、轻量状态 | 柔和淡底，不加无意义阴影 |
| raised | Card、可抬起区域 | 轻影；只有可交互时允许 hover 抬升 |
| floating | 普通瞬态浮层 | overlay 背景 + 明确边界 + 中等海拔 |
| frosted | 需要透景的瞬态浮层 | 柔和半透明面 + blur + 边界 + 海拔 |
| sheet | Dialog、Drawer、Toast | 稳定实体面 + 强层级海拔 |

### 8.1 Frosted

- 只用于需要保留背景空间感的瞬态浮层。
- 背景最终不透明度应在约 82%–90%。
- blur 使用 16px，saturate 不高于 1.08。
- 必须有 1px 可见边界，不能只依赖 `backdrop-filter`。
- 不使用顶部高光、反射线或高透明玻璃效果。
- 大段正文、表单、Card、Table、Toast、Dialog 主阅读面默认不使用 frosted。
- reduced transparency、forced colors 和 print 下移除 blur，使用同语义实体面。

### 8.2 禁止 Glass

- 不允许 `glass` 材质、variant、令牌或配方。
- 不允许将非法的 `glass` 值自动映射为 frosted。
- 发现旧 glass 消费者时必须显式迁移，并按公开面变化提供 changeset。

完整细则见《交互触感与柔和模糊材质规范》。

## 9. 统一点击触感

### 9.1 离散操作控件

Button、Toggle、图标按钮、分页按钮、工具栏按钮和同类 trigger 必须使用同一配方：

| 阶段 | 时长 | 结果 | 缓动 |
| --- | ---: | --- | --- |
| 按下 | 120ms | scale 1 → 0.97，背景进入 active | continuous |
| 释放 | 200ms | scale 0.97 → 1，背景回到 hover/rest | ease-out-strong |

- transform origin 固定为 center。
- 指针 `:active`、键盘 Press 和 Headless `data-pressed` 必须一致。
- 不采用点击波纹。
- 不允许组件自行设置 0.94、0.96、0.98 等缩放。
- 业务事件不能等待动画结束；按下首帧必须先于异步 loading 状态可见。

### 9.2 集合项

Menu Item、Listbox Item、Tree Node、Table Row 等大面积条目：

- 使用相同的 120ms 按下、200ms 释放节奏。
- 通过 active 背景和前景反馈。
- 不缩放整个条目，避免文字发虚和边界漂移。

### 9.3 状态叠加

| 状态 | 强制规则 |
| --- | --- |
| hover + pressed | pressed 优先，使用 active 面和 0.97 scale |
| focus-visible + pressed | 保留焦点环，按压只改变内部表面 |
| selected + pressed | 保留 selected 身份，在其上派生 active 面 |
| danger + pressed | 保持 danger 语气 |
| pending | 首次反馈后锁定重复操作，不持续缩放 |
| disabled | 无 hover、pressed、scale 和业务事件 |
| reduced motion | 取消 scale/translate，保留即时换面 |

## 10. Anatomy

- 每个可样式化节点必须有稳定 `data-scope` + `data-part`。
- 部件名表达语义，不表达位置、颜色或实现方式。
- Root 承担组件级状态；子部件只接自身状态。
- CSS Parts、Vue/React 导出和 Web Components 作者节点必须对应。
- 可选部件缺席时不得留下空布局。
- required part 缺失必须显式诊断。
- 部件不得因为样式方便重复表达同一语义。

## 11. 状态契约

每个交互组件至少覆盖：

| 状态 | 视觉要求 | 行为要求 |
| --- | --- | --- |
| rest | 可识别但不过度强调 | 原生语义成立 |
| hover | 面或前景变化 | 不能成为唯一入口 |
| active/pressed | 统一触感或集合项换面 | 不延迟事件 |
| focus-visible | 2px 可见焦点环 | 键盘路径完整 |
| disabled | 前景和表面同时降级 | 不响应、不提交 |
| loading/pending | 尺寸不跳动 | 防重复提交 |
| invalid/error | 语气 + 非颜色通道 | 关联错误说明 |
| selected/checked/open | 与 hover 明确区分 | 受控/非受控一致 |
| dismissing/unmounted | 退出和移除顺序明确 | 生命周期回调一次 |

集合和浮层还必须覆盖空、异步、部分成功、超长内容、滚动边界、嵌套和退出中的交互屏蔽。

## 12. API

### 12.1 公开模型

- 复杂组件使用 Compound Parts 暴露完整结构。
- 便利 props 只覆盖唯一、无歧义的常见写法。
- 不为减少几行模板增加会与 Parts 冲突的快捷入口。

### 12.2 Props

- 受控值统一 `value/onValueChange`。
- 开合统一 `open/onOpenChange`。
- 布尔 prop 使用肯定命名。
- 默认值在 Headless 定义，三个适配器不得各自设置。
- 非法组合立即报错，不静默修正。
- `asChild` 或 render prop 只在确实需要替换语义宿主时提供。
- 任意像素调整走 CSS 变量，不扩散成布局 props。

### 12.3 事件

- 复杂事件使用 details 对象。
- 事件名表达已发生事实或明确意图。
- 同一事件三端载荷结构一致。
- 原始 DOM 事件只在调用方确实需要时保留。
- 退出、完成、选择和变更回调必须定义触发时机和次数。

### 12.4 服务

- Toast、Notification、Dialog 等服务必须绑定 Provider 或目标文档。
- 不创建脱离当前配置上下文的静态渲染兜底。
- create/update/dismiss 使用稳定 id。
- update 保持原位置和生命周期，不先删除再创建。
- 跨边界队列只保存可序列化数据，业务回调由宿主侧按 id 管理。

## 13. 无障碍

- 优先使用原生 button、input、dialog、table、progress 等元素。
- 无原生语义时遵循 WAI-ARIA APG。
- 每个交互出口必须有可访问名称。
- 标题、说明、错误和状态必须与目标控件关联。
- 键盘表逐行写明按键、生效条件、行为和焦点结果。
- Modal、Popover、Menu 覆盖焦点进入、循环、关闭和归还。
- 非冒泡事件由适配器使用原生监听器。
- 状态不能只靠颜色。
- 视觉隐藏和 DOM 隐藏必须按语义选择，不能互相替代。

## 14. 跨环境

### 14.1 暗色

- 保持与亮色相同的层级关系。
- 浮层不能只靠黑色阴影分层，必须有背景差或内边界。
- 状态色重新校准前景对比，不直接复用亮色色值。

### 14.2 RTL

- 布局、间距、边界和定位使用逻辑属性。
- 只有物理键位、图表轴和时间方向等稳定身份可以固定方向。

### 14.3 SSR

- 首屏不得读取 `document`、`navigator` 或布局测量决定结构。
- 平台和尺寸测量在挂载后更新，服务端输出必须稳定。

### 14.4 Reduced Motion

- 取消缩放、位移、循环和回弹。
- 保留颜色、边界、图标或文案反馈。
- 不通过 0.01ms 动画规避生命周期逻辑。

### 14.5 Forced Colors 与打印

- 强制色使用系统颜色表达边界、焦点和状态。
- 瞬态浮层打印时隐藏。
- 必须打印的内容转为实体背景并移除模糊、透明和动画。

## 15. 文档

组件文档固定顺序：

1. 概述。
2. 用法。
3. 组件结构。
4. 示例。
5. 设计指引。
6. API 参考。
7. 无障碍。
8. 样式参考。

### 15.1 示例

- 第一个示例必须用最少结构展示核心用途。
- 一个示例只证明一个意图。
- 不为覆盖 API 保留重复或低质量示例。
- 组件总览使用独立极简预览。
- 复杂业务组合放到模式页，不塞进基础组件专页。
- 示例必须覆盖 Vue、React、Web Components；确实不适用时登记原因。

### 15.2 文案

- 使用短句、事实和约束。
- 先说用户能完成什么，不描述实现过程。
- 同一概念始终使用同一个词。
- 错误文案说明发生了什么以及下一步怎么做，不责怪用户。
- 标题、标签、按钮和单句提示不写多余标点。

### 15.3 自动生成内容

Props、事件、插槽、anatomy、键盘表、状态属性、CSS 变量和 CEM 必须由源码生成或校验，不允许手工维护两份不一致的事实。

## 16. 实现与验收顺序

### 16.1 实现

1. Core 公共原语。
2. Headless 状态机和 connect。
3. Headless 单测。
4. Vue、React、Web Components 适配器。
5. 共享 CSS 和组件令牌。
6. 三端一致性与真实浏览器测试。
7. 文档、示例、总览预览和生成物。
8. changeset。

不得在重建共享 dist 时并行运行依赖该 dist 的适配器测试。

### 16.2 必测内容

- Props 默认值、非法输入和受控/非受控。
- 键盘、焦点、表单和原生事件。
- 所有标准状态和状态叠加。
- 单行、多行、空、超长、异步和嵌套内容。
- standard/compact、light/dark、LTR/RTL。
- pointer、keyboard、coarse pointer。
- reduced motion、reduced transparency、forced colors、print。
- 进入、退出、卸载和回调次数。
- 三端 DOM、属性和计算样式一致性。

### 16.3 提交

- 一个组件或一个共享配方一个提交。
- 不混入无关格式化、重命名或清理。
- 公开面变化必须有 changeset。
- 生成物与源文件同一提交。
- 提交前必须通过相关测试、主门禁和生产构建。

## 17. Definition of Done

- [ ] 用户任务、何时不用和反模式已明确。
- [ ] 已归入正确组件家族。
- [ ] Core/Headless 是行为唯一真源。
- [ ] anatomy、状态、事件和键盘表完整。
- [ ] 三个适配器契约一致。
- [ ] 使用 4/8/12px 小圆角体系。
- [ ] 离散操作和集合项接入统一点击反馈。
- [ ] 未使用 glass；frosted 使用范围正确。
- [ ] 正常、交互、禁用、加载、错误和退出状态齐全。
- [ ] 亮暗、密度、RTL、指针和无障碍环境通过。
- [ ] 组件槽、文档、CEM 和公开面闭环。
- [ ] 示例无冗余，总览有独立预览。
- [ ] 单测、一致性、浏览器和构建门禁通过。
- [ ] changeset 和独立提交完成。

## 18. 禁止项

- 禁止在适配器复制跨框架行为。
- 禁止通过内容或 DOM 顺序猜测状态。
- 禁止同一语义存在多套 prop、事件、状态属性或令牌名。
- 禁止普通 control、Card 和 Overlay 使用 pill。
- 禁止组件写未登记的间距、圆角、颜色、阴影和动效散值。
- 禁止 glass 材质及其兼容别名。
- 禁止点击波纹和组件私有按压参数。
- 禁止只用颜色表达状态。
- 禁止只降低 opacity 表达 disabled。
- 禁止无边界的透明模糊面。
- 禁止静默修正非法输入和非法结构。
- 禁止脱离配置上下文创建服务实例。
- 禁止文档重复实现过程、营销描述和无用途示例。
- 禁止未验证就提交，或多个无关组件合并提交。
