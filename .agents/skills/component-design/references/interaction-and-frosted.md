# XiHan.UI 交互触感与柔和模糊材质规范

状态：已生效。本文是《统一组件设计方案》的强制执行细则。

## 1. 小圆角体系

### 1.1 形状映射

| 语义角色 | 圆角 | 适用对象 |
| --- | ---: | --- |
| inset | 4px | 内嵌项、菜单项、标签内部、微型状态块 |
| control | 4px | Button、Input、Select Trigger、Toggle、分页按钮 |
| surface | 8px | Card、Alert、Panel、列表容器、Segmented 与 Tabs segment 轨道 |
| overlay | 12px | Popover、Menu、Dialog、Drawer、Toast |
| circle | 50% | 宽高相等的圆形对象（头像、单选指示器、thumb、steps / timeline indicator、加载环）与悬浮于内容之上的单图标动作（FloatButton、BackTop、翻页、回底） |
| pill | 9999px | 状态 chip（Badge、Tag、ToolCall status、Approval / QuestionFlow result）与一维对象（轨道、track / range、tick、hairline 分隔线、滑动指示条、手柄、scrollbar thumb、skeleton text、位置指示点当前拉长态） |

规则：

1. 普通按钮、字段和浮层不得因为“更现代”而使用 pill。
2. 同一组件的内外层圆角遵循嵌套关系：内层圆角不得大于外层圆角减去内边距。
3. 相连组件消除相接侧圆角；不通过负 margin 伪造连接。
4. 圆角值只能来自语义形状令牌，不允许组件 CSS 写 6px、10px 等散值。
5. 圆形和 pill 是形状身份，不进入 control/surface/overlay 的大小阶梯。
6. 正方盒必须取 circle，不得用 pill 冒充圆。
7. 位置指示点统一 8px 圆点 + 当前项 20px 胶囊；序号状态圆点 circle，可点分页按钮 control。
8. 取 circle / pill 的新部件必须在 check-shape-scale 的身份表登记。

### 1.2 验收

- 默认 Button 的四角为 4px，不呈胶囊形。
- Card 和静态容器为 8px。
- Popover、Dialog、Toast 等浮层不超过 12px。
- 亮色、暗色和 compact 不改变圆角身份。
- Tag 为胶囊，与 Button 4px 形成可点 / 不可点识别差。
- Segmented / Tabs segment 轨道为 8px，滑块 ≥ 4px。

## 2. 统一点击触感

### 2.1 Action Feedback 时间线

```text
rest
  └─ pointerdown / Space / Enter
       └─ 0–120ms：scale 1 → 0.97，背景进入 active
            └─ release / keyup
                 └─ 0–200ms：scale 0.97 → 1，背景回到 hover/rest
```

固定参数：

| 参数 | 值 | 说明 |
| --- | ---: | --- |
| press duration | `--xh-motion-duration-press`（120ms） | 必须先于业务请求反馈 |
| release duration | `--xh-motion-duration-release`（200ms） | 允许轻微回弹但不得过冲明显 |
| press scale | `--xh-motion-scale-press`（0.97） | 所有离散 Action Control 一致 |
| press easing | `--xh-motion-ease-press` | 按下稳定，不使用弹簧 |
| release easing | `--xh-motion-ease-release` | 快速恢复，末端柔和 |
| transform origin | center | 不因布局方向改变 |

### 2.2 使用范围

判据是几何身份，不是组件名：

必须使用 0.97 缩放并同时换底（inline-size 由 Action Control profile 决定的定尺部件）：

- Button、Icon Button、Close / Clear Button。
- Toggle、ToggleGroup item、分页按钮、步骤操作按钮。
- 工具栏按钮、轮播控制、日期翻页按钮、日历格、星、色块、把手。
- 视觉上是一枚独立按钮的 trigger（投影 `data-xh-action-control`）。

使用同节奏但只换面（主体规则含 `inline-size: 100%`、`flex: 1`、含文本的 grid / flex，或高度随内容多行）：

- Menu Item、Listbox Item、Tree Node、Table Row、Transfer Item、SideNav link、Tabs line trigger、Anchor link、Breadcrumb link、NavigationMenu / Menubar trigger（投影 `data-xh-collection-item`；横向导航这五件投影 `nav` 语境）。
- Accordion / Collapsible / Reasoning / ToolCall trigger、CodeView fold-trigger、DiffView gap-trigger（`disclosure-trigger` profile）。
- Tabs card / segment trigger、Segmented item、load-more trigger。
- 大面积 Card Action、导航项、可选择列表行。

这些部件在 120ms 内切到 active 面，200ms 回到 hover / rest；不允许零反馈。原因是缩放整行会让文字发虚、边界漂移并影响相邻内容感知。

不播放点击反馈（须在门禁登记理由）：

- disabled、只读、装饰节点。
- 扩大命中区的标签（checkbox / switch / editable label、slider tick-label）。
- 拖拽轨道、字段外壳与值区、作者内容区（dropzone、image-viewer trigger、truncate root）。
- 已经进入 dismissing / unmounted 的临时反馈。
- 拖拽过程中的重复 pointermove。

### 2.3 输入通道一致性

- 指针按下使用 `:active` 或 Headless 的 pressed 事实。
- Space/Enter 必须由 Headless 投影为同一 `data-pressed`，不能只有鼠标能看到缩放。
- 触摸使用相同参数，不追加第二套 tap 动画。
- 程序化触发业务动作不伪造 pressed；只有真实用户激活才显示触感。
- pending 在按下首帧之后进入，随后锁定重复操作并显示进度。

### 2.4 状态叠加

| 组合状态 | 规则 |
| --- | --- |
| hover + pressed | pressed 优先，背景使用 active，scale 0.97 |
| focus-visible + pressed | 焦点环保留，按压只改变内部表面 |
| selected + pressed | 保留 selected 身份，在其上派生 active 面 |
| danger + pressed | 仍使用 danger 语气，不回落到品牌色 |
| loading + pressed | 首次激活后进入 loading，不持续脉冲缩放 |
| disabled | 无 hover、pressed、scale 或业务事件 |

### 2.5 Reduced Motion

全库语义见《统一组件设计方案》§14.4：去位移、留淡变。

- 取消 scale、translate 和回弹。
- 保留 active 背景/前景变化，确保用户仍收到操作确认；颜色淡变不属于运动，减弱动效下保留。
- 时长收敛为全局 reduced-motion 通道，不在组件内另写媒体查询散值。
- Spinner 等持续动画停止时必须保留静态状态图形或文字。

### 2.6 禁止项

- 不采用点击波纹。
- 不允许 Button 0.96、Toggle 0.98、Close Button 0.94 等各自取值。
- 不对大面积列表行或 Card 整体缩放。
- 不使用会改变布局尺寸的 `width/height/padding` 作为按压动画。
- 不让 CSS 动画延迟 click/press 事件。

### 2.7 Disclosure

参数与《统一组件设计方案》§9.4 一致：

| 对象 | 高度 | 时长 / 曲线 |
| --- | --- | --- |
| Surface 级（Accordion、Collapsible、Reasoning、ToolCall） | `grid-template-rows: 0fr → 1fr` | 展开 `--xh-motion-duration-expand` / `--xh-motion-ease-enter-strong`；收起 `--xh-motion-duration-collapse` / `--xh-motion-ease-exit`；指示器同档；初始即展开的内容不播动画 |
| 密集（Tree、TreeSelect、JsonViewer、SideNav 内联、Table 展开行、Truncate） | 不动高度，刻意瞬时 | 树族指示器 `--xh-motion-duration-micro` |

### 2.8 浮层进出场

参数与《统一组件设计方案》§9.5 一致：

| 锚定关系 | 关键帧 |
| --- | --- |
| 锚定列表 / 菜单 / tooltip（含 ColorPicker） | `xh-overlay-slide-in / out`；tooltip 入场 `--xh-motion-duration-enter` |
| 锚定面板（Popover、HoverCard、Popconfirm、Tour、Command） | `xh-overlay-pop-in` / `xh-pop-out` |
| 无锚定弹出（NavigationMenu、SideNav popout、FloatingPanel、FloatButton 列表、BackTop、回底按钮） | `xh-pop-in / out` |
| 面板（Dialog、Notification） | `xh-sheet-in / out` |
| 整幅滑入（Drawer、Layout 抽屉式侧栏） | `xh-slide-in / out`，位移 `--xh-motion-travel`；入 `--xh-motion-duration-slide` / `--xh-motion-ease-slide`，出 `--xh-motion-duration-exit` / `--xh-motion-ease-exit` |
| 遮罩与全屏面 | `xh-fade-in / out` |

共享关键帧集中在 `family/motion.css`；皮肤不得重定义。进场必有退场，退场经 Presence；分层、打断与焦点规则见《统一组件设计方案》§9.5。`xh-sheet`、`xh-slide`、`--xh-motion-travel` 尚待落地（同文 §19）。

## 3. Frosted 柔和模糊材质

### 3.1 定义

Frosted 是可读性优先的半透明柔和模糊面。它允许隐约感知背后环境，但不模拟玻璃反射、大面积高光或强透明；1px 内侧顶部边界光是边界的一部分，不是反射。

建议配方：

| 通道 | 默认意图 |
| --- | --- |
| background | surface/overlay 与透明混合，最终不透明度约 82%–90% |
| backdrop | blur 16px，saturate 不高于 1.08 |
| border | 1px 低对比边界，确保浅色与暗色都能识别轮廓 |
| shadow | 使用 floating 或 sheet 海拔角色，不自定义另一套彩色影 |
| foreground | 使用正常 overlay foreground，不降低正文透明度 |
| highlight | 允许 1px 内侧顶部边界光（`--xh-material-frosted-highlight`，只表达厚度），不允许更大范围的玻璃高光或反射线；Tooltip 反白 compact 档不画 |

具体颜色不在组件内写死，由亮色、暗色和 contrast-more 主题派生。

### 3.2 允许使用

- 内容为短列表、菜单、tooltip、气泡的锚定瞬态浮层（Popover、Dropdown、Context Menu、Select、Combobox、HoverCard、Tooltip）。
- 桌面式 Floating Panel、临时工具面板。
- 确实需要保留背景空间感的顶部/侧边悬浮导航。

### 3.3 默认不使用

- Button、Input、Card、Table、Alert 等常驻内容。
- 大段正文、表单主体和数据密集列表。
- Dialog/Drawer 的主要阅读面；它们默认使用稳定的 sheet/elevated 实体面。
- Toast/Notification；它们默认使用 sheet，避免运动背景影响短时阅读。
- 嵌套在另一 frosted 面里的子浮层，除非能证明层级仍清楚。
- 含网格或多列的锚定面板（NavigationMenu content、Date / Time / DateRange / TimeRange picker content）；它们使用 floating：solid 底 + `--xh-border-default` + `--xh-elevation-floating`。

### 3.4 环境通道

| 环境 | 处理 |
| --- | --- |
| light | 高不透明浅色 surface + 低对比边界 + blur |
| dark | 深色 overlay + 可见内边界 + blur，不能仅靠黑影分层 |
| contrast-more | 提高不透明度与边界，不提高模糊强度 |
| reduced-transparency | 使用同语义的实体 overlay，移除 backdrop blur |
| forced-colors | Canvas/CanvasText/ButtonText 系统色，移除 blur 和透明混合 |
| print | 使用实体白/纸面语义，移除 blur、透明和浮层阴影 |

`reduced-transparency` 和 `forced-colors` 是同一 frosted 角色的环境投影，不是 glass 的兼容兜底。

### 3.5 Glass 退役规则

- 删除 `material.glass` 角色及其 bg、backdrop、border、highlight、shadow、separator、fg、fg-muted、focus-surface 槽。
- 删除组件对 glass 的 variant/recipe 引用。
- 删除文档、示例、CEM、公开面、门禁基线和视觉截图中的 glass。
- 不保留 `glass → frosted` 别名，不自动迁移非法值。
- 若属于公开 API，使用 major changeset，并在迁移说明中给出显式替代：作者应改为 `frosted` 或实体材质。
- 按组件逐个迁移和提交；先迁移真实消费者，再删除全局角色，避免未完成状态下破坏构建。

## 4. 新组件检查表

### 4.1 形状

- [ ] 已归入 inset/control/surface/overlay/circle/pill 之一。
- [ ] 普通 control 为 4px，未自行使用 pill。
- [ ] 嵌套圆角关系正确。
- [ ] 正方盒取 circle，状态 chip 与一维对象取 pill，轨道取 surface。

### 4.2 触感

- [ ] 定尺离散 Action Control 接入 120ms/0.97/200ms 配方并同时换底。
- [ ] 行级与 disclosure trigger 只换面，无零反馈。
- [ ] 指针、触摸和键盘 Press 的视觉一致（`data-pressed`）。
- [ ] disabled、pending、selected、danger 组合状态明确。
- [ ] reduced motion 下仍有非位移反馈。
- [ ] disclosure 与浮层进出场按 §2.7、§2.8 取关键帧与时长。
- [ ] 动效已按《统一组件设计方案》§9 选定角色；有进场即有退场；初始内容不播进场。

### 4.3 边界与选中

- [ ] 根面取描边 / 淡底 / 无壳之一；raised 带 border-default 且已登记。
- [ ] 字段静息为描边式；variant 缺省 outline。
- [ ] selected / current 按语义表取唯一标记；open 与 hover 同档。
- [ ] 交互阶梯按承载面；缺省语气正确。

### 4.4 滚动

- [ ] 滚动面归入自绘条或原生细条；无手写 scrollbar-*；gutter / overscroll 按规则。

### 4.5 材质

- [ ] 没有使用 glass 名称、令牌或变体。
- [ ] frosted 仅用于允许的瞬态浮层。
- [ ] frosted 有足够实体背景和边界，不只依赖 backdrop-filter。
- [ ] light/dark/contrast/reduced-transparency/forced-colors/print 均验证。

### 4.6 验证

- [ ] 计算样式断言圆角、按压 scale、时长和材质通道。
- [ ] Chromium 验证 pointer、keyboard、coarse pointer 与 reduced motion。
- [ ] 亮暗视觉截图不存在胶囊化扩散、玻璃高光或文字发虚。
- [ ] 三端适配器只消费同一 Headless pressed 状态和共享 CSS。
