来源：https://ui.docs.xihanfun.com/design/principles

# 设计原则

这几条贯穿所有组件，其余页面里的每张表都是它们在某个维度上的展开。每条都对应门禁或测试，不是口号。

## 行为与表现分开

组件的状态机、默认值、事件、键盘与 ARIA 住在框架无关的 Headless 层；Vue、React 与 Web Components 只做响应式、DOM 引用、Portal 与原生监听；皮肤只消费语义令牌、部件（`data-part`）与状态事实（`data-state`、`data-disabled`……）。三端消费同一份 CSS，所以三端长得一样不是"尽量对齐"，而是结构上没有第二份。

推论：皮肤不得从内容或 DOM 顺序猜业务状态，适配器不得复制跨框架行为，同一语义不允许存在两套 prop、事件、状态属性或令牌名。

## 先归族，再画样式

每个组件先归入六个家族之一（Action Control、Field Chrome、Collection Item、Surface、Overlay、Feedback），家族配方给出尺寸、状态、焦点、禁用与按压；组件只映射自己的覆盖槽。一个组件可以横跨多个家族，但**一个部件只能有一个主要身份**：Select 的 trigger 是 Field Chrome，option 是 Collection Item，content 是 Overlay。

家族边界见 [组件家族与模式](/design/patterns)。

## 一切尺度只走令牌

颜色、间距、圆角、阴影、描边、动效不写散值。间距走 4px 网格（2 / 6 / 10 只作几何补偿）；圆角只有 4 / 8 / 12 三档加 pill 与 circle 两种身份；描边只有 1 / 2 / 3px；阴影只按海拔角色取；时长与缓动只从 `--xh-motion-*` 取。皮肤里每个数字都能回溯到一支令牌，门禁按此逐条扫描。

## 边界只由描边承担

根面与主面只能取三选一：描边（outline，缺省）、淡底（subtle）、无壳（ghost）。阴影与淡底都不是边界：Card 的 raised 影是加成，描边必须在；字段静息不消费 raised 影。所有带边框的控件盒——输入框壳、勾选框、单选圈、开关轨道、输入组壳、拖放区——描边取同一支 `--xh-border-control`，它在缺省档与浮层面板、卡片的装饰边 `--xh-border-default` 同色，页面里只有一种边线重量；这些盒静息不填底，露出宿主的面。

## 缺省克制

页面主体保持中性。只有 Button 缺省品牌实心；其余按钮形触发器缺省中性，写了 `data-tone` 才切到语气淡底。品牌淡底 `--xh-bg-brand-subtle` 专属"选中 / 当前"语义，不用于 today、completed、open 这类未选中语义。状态色表达任务结果，不表达空间层级。

## 交互阶梯按承载面

悬停与按下不按家族取值，按控件坐在哪块面上：白底上 hover 100 → pressed 200，淡底上 hover 200 → pressed 300；300 只留给 pressed，白底上 hover 不许直接落 200。open / in-path 与所在家族的 hover 同档；selected / current 按语义只有一种标记（浮层集合是行尾对号，页内集合是淡底，导航是指示条或字色，格状当前是实心品牌）。

## 有反馈，且反馈一致

定尺的独立动作控件按下 120ms 缩放到 0.97 并换底，释放 200ms 回到 1；行级条目与 disclosure trigger 只换面、不缩放；不允许零反馈。错误、选择、加载与警告不能只靠颜色，必须有图标、形状、文案或结构通道；disabled 不能只降低 opacity，必须同时调整前景或背景并关闭交互。

## 九个切面一起成立

亮色、暗色、comfortable / compact、RTL、粗指针、减弱动效、减少透明度、强制色与打印是同一份皮肤的九个切面。密度只收紧高度、内距与间隙，不缩字号和字形；RTL 由逻辑属性驱动；粗指针命中区至少 44×44px，用伪元素扩展、不改布局盒；减少透明度把磨砂切成实体；强制色改由 `Canvas` / `CanvasText` / `Highlight` 表达。

## 是否新增组件

同时满足才新增：解决一个稳定、可重复的用户任务；现有组件组合无法在不复制行为的前提下完成；有明确的语义、状态或生命周期边界；能定义稳定 anatomy；至少有一个可验证的无障碍与交互契约。只是换颜色 / 圆角 / 间距、只是某个页面的固定排列、只为省几行模板、需要大量互斥 props 才能解释身份——都不新增。

## 相关

- [色彩](/design/colors) · [形状与边界](/design/shape) · [动效](/design/motion)
- 指南：[皮肤与样式分层](/guide/styling) · [设计令牌与主题](/guide/theme) · [测试与质量门禁](/guide/testing)
