---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
'@xihan-ui/headless': patch
---

**形状令牌按设计真源回正为 4 / 8 / 12px 小圆角阶梯，新增 `--xh-shape-circle`，全部组件按家族身份重新归位圆角。**

`--xh-shape-control` 由 8px 改为 4px，`--xh-shape-surface` 由 12px 改为 8px，`--xh-shape-overlay` 由 24px 改为 12px；新增 `--xh-shape-circle: 50%` 表示正圆身份。`--xh-shape-inset`（4px）与 `--xh-shape-pill` 不变。

皮肤按家族身份消费形状令牌：Button、ButtonGroup、Toggle、ToggleGroup、Toolbar 条目、Clipboard 复制钮、DownloadTrigger 从胶囊改为 control 4px；Tabs 分段变体的标签带与 Segmented 轨道改为 surface 8px、标签本体 control 4px；字段外壳（TextField、DateField、DatePicker、DateRangePicker、TimeField、TimePicker、TimeRangePicker、Select、ColorField、NumberField、Field、InputGroup）改为 control 4px；Popover、Menu、ContextMenu、Menubar、HoverCard、Popconfirm、Tour、Dialog、Drawer、Notification、FloatingPanel、Select / Combobox / Cascader / TreeSelect / Mention / DatePicker / DateRangePicker / TimePicker / TimeRangePicker / ColorPicker 的浮层内容、NavigationMenu 内容、Pagination 面板、SideNav 弹出面改为 overlay 12px；Card 改为 surface 8px；日历格子改为 inset 4px；Avatar、AvatarGroup 溢出项、BackTop、FloatButton、Carousel 翻页钮与指示点、Spinner、Steps 指示器、Timeline 指示器、Switch 滑块、Skeleton 圆形、QuestionFlow 圆点、IconWrapper、ImageCropper 把手、Slider / ColorSlider / ColorPicker 拇指、RadioGroup 指示器、Log / MessageFeed 回到底部钮、Dialog 指示器改为 circle。Action Control 家族的 floating profile 同样改为 circle。

破坏性：依赖旧默认圆角的自定义样式与视觉基线需要更新；`--xh-shape-*` 的值改变会影响所有未显式覆盖组件圆角槽的消费者。定位引擎的箭头端距改为对齐 `--xh-shape-overlay`。
