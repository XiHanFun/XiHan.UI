---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**32 个部件改名，1 个部件并进另一个。** 不留别名、不留 `var(新名, 旧名)` 双写：下面列出的名字在解剖、连接层、两个适配器与皮肤里都不再存在。写旧名的节点拿不到任何属性，写旧槽名的覆盖不再生效。

改名分三类：一个字面量在库内指着不同的东西（一名多义）、同一件事全库两个名字（同义两名）、以及重造了一整套集合词汇。

## 一、一名多义

| 组件 | 旧部件 | 新部件 |
| --- | --- | --- |
| `slider` | `marks` / `mark` / `mark-label` | `tick-group` / `tick` / `tick-label` |
| `date-picker` · `time-picker` | `presets` | `preset-group` |
| `signature-pad` | `segment` | `path` |
| `diff-view` | `segment` · `stat` | `inline-change` · `summary` |
| `color-picker` | `area` | `saturation-area` |
| `editable` | `area` | **并进 `control`** |
| `timer` | `area` | `display` |
| `combobox` · `listbox` | `item-group` / `item-group-label` | `group` / `group-label` |
| `carousel` · `file-upload` | `item-group` | `list` |
| `pagination` | `ellipsis` | `ellipsis-trigger` |

`editable` 的 `area` 与 `control` 本是两个只作排版落点的盒，职责重叠：预览区与输入框在一个盒里、三颗按钮在另一个盒里。两者并成一个 `control`，DOM 少一层——`preview` / `input` 与三颗按钮现在是它的直接子节点。`XhEditableArea` 与 `getAreaProps` 一并删除。

## 二、同义两名

| 组件 | 旧部件 | 新部件 |
| --- | --- | --- |
| `time-picker` | `input` | `segment` |
| `page-header` | `subtitle` | `description` |
| `heatmap` | `week-day-label` | `week-day` |
| `card` | `cover` | `media` |
| `log` · `message-feed` | `scroll-button` | `scroll-to-end-trigger` |
| `clipboard` | `trigger` | `copy-trigger` |
| `prompt-input` | `input-row` | `control` |
| `skeleton` | `bone` | `item` |
| `avatar-group` | `overflow` | `overflow-item` |
| `alert` · `empty-state` | `icon` | `indicator` |

## 三、重造的集合词汇并回共享词汇

| 组件 | 旧部件 | 新部件 |
| --- | --- | --- |
| `question-flow` | `option-group` / `option` / `option-indicator` / `option-label` | `group` / `item` / `item-indicator` / `item-text` |
| `approval` | `scope-group` / `scope-item` / `scope-indicator` / `scope-label` | `group` / `item` / `item-indicator` / `item-text` |

`approval` 的授权项与 `question-flow` 的选项本来就是同一种「方框加文字的一行」，现在两家用同一套名字，皮肤那一层的行盒规则也就对得上了。`approval` 的授权项同批补上按下缩放，与 `question-flow` 的选项一致。

## 连带改动

**连接层的取属性函数**按部件名派生，逐条跟着改：`getMarksProps` / `getMarkProps` / `getMarkLabelProps` → `getTickGroupProps` / `getTickProps` / `getTickLabelProps`，`getPresetsProps` → `getPresetGroupProps`，`getSegmentProps`（signature-pad）→ `getPathProps`，`getStatProps` → `getSummaryProps`，`getSegmentProps`（diff-view）→ `getInlineChangeProps`，`getAreaProps` → `getSaturationAreaProps`（color-picker）/ `getDisplayProps`（timer），`getItemGroupProps` / `getItemGroupLabelProps` → `getGroupProps` / `getGroupLabelProps`（combobox / listbox）与 `getListProps`（carousel / file-upload），`getEllipsisProps` → `getEllipsisTriggerProps`，`getInputProps`（time-picker）→ `getSegmentProps`，`getSubtitleProps` → `getDescriptionProps`，`getWeekDayLabelProps` → `getWeekDayProps`，`getCoverProps` → `getMediaProps`，`getScrollButtonProps` → `getScrollToEndTriggerProps`，`getTriggerProps`（clipboard）→ `getCopyTriggerProps`，`getInputRowProps` → `getControlProps`，`getBoneProps` → `getItemProps`，`getOverflowProps` → `getOverflowItemProps`，`getIconProps`（alert / empty-state）→ `getIndicatorProps`，`getOption*Props` / `getScope*Props` → `getGroupProps` / `getItemProps` / `getItemIndicatorProps` / `getItemTextProps`。

**读口**：`showScrollButton` → `showScrollToEndTrigger`（log / message-feed）。

**类型与集合查询**：`SliderMarkProps` → `SliderTickProps`、`SliderMarksMarkSlotProps` → `SliderTickGroupTickSlotProps`、`TimePickerInputProps` → `TimePickerSegmentProps`、`timePickerInputQuery` → `timePickerSegmentQuery`、`DiffViewSegmentProps` → `DiffViewInlineChangeProps`、`ComboboxItemGroupProps` / `ListboxItemGroupProps` → `ComboboxGroupProps` / `ListboxGroupProps`、`PaginationEllipsisProps` → `PaginationEllipsisTriggerProps`、`HeatmapWeekDayLabelProps` → `HeatmapWeekDayProps`、`SkeletonBoneProps` → `SkeletonItemProps`、`QuestionFlowOptionProps` → `QuestionFlowItemProps`、`questionFlowOptionQuery` → `questionFlowItemQuery`。

**Vue 部件组件**逐个跟着部件名走：`XhSliderMarks` → `XhSliderTickGroup`、`XhDatePickerPresets` / `XhTimePickerPresets` → `Xh*PresetGroup`、`XhTimePickerInput` → `XhTimePickerSegment`、`XhSignaturePadSegment` → `XhSignaturePadPath`、`XhDiffViewStat` → `XhDiffViewSummary`、`XhColorPickerArea` → `XhColorPickerSaturationArea`、`XhTimerArea` → `XhTimerDisplay`、`XhComboboxItemGroup(Label)` / `XhListboxItemGroup(Label)` → `Xh*Group(Label)`、`XhCarouselItemGroup` / `XhFileUploadItemGroup` → `Xh*List`、`XhPaginationEllipsis` → `XhPaginationEllipsisTrigger`、`XhPageHeaderSubtitle` → `XhPageHeaderDescription`、`XhHeatmapWeekDayLabel` → `XhHeatmapWeekDay`、`XhCardCover` → `XhCardMedia`、`XhLogScrollButton` / `XhMessageFeedScrollButton` → `Xh*ScrollToEndTrigger`、`XhClipboardTrigger` → `XhClipboardCopyTrigger`、`XhPromptInputInputRow` → `XhPromptInputControl`、`XhSkeletonBone` → `XhSkeletonItem`、`XhAvatarGroupOverflow` → `XhAvatarGroupOverflowItem`、`XhAlertIcon` / `XhEmptyStateIcon` → `Xh*Indicator`、`XhQuestionFlowOption*` / `XhApprovalScope*` → `Xh*Group` / `Xh*Item` / `Xh*ItemIndicator` / `Xh*ItemText`。`XhSliderTickGroup` 的插槽 `mark` 改名 `tick`，载荷字段同名。

**自定义元素的 `::part`** 与角色节点的 `data-xh-part` 取值同步改名。

**覆盖槽**跟着部件段走：`--xh-slider-mark*-*` → `--xh-slider-tick*-*`、`--xh-date-picker-presets-*` / `--xh-time-picker-presets-*` → `-preset-group-*`、`--xh-diff-view-segment-*` → `-inline-change-*`、`--xh-color-picker-area-*` → `-saturation-area-*`、`--xh-editable-area-min-{h,w}` → `--xh-editable-control-min-{h,w}`、`--xh-timer-area-fg` → `--xh-timer-display-fg`、`--xh-combobox-item-group-gap` / `--xh-listbox-item-group-gap` → `--xh-*-group-gap`、`--xh-pagination-ellipsis-fg` → `--xh-pagination-ellipsis-trigger-fg`、`--xh-page-header-subtitle-*` → `-description-*`、`--xh-card-cover-*` → `-media-*`、`--xh-log-scroll-button-*` → `--xh-log-scroll-to-end-trigger-*`、`--xh-message-feed-button-*` → `--xh-message-feed-scroll-to-end-trigger-*`、`--xh-clipboard-trigger-*` → `-copy-trigger-*`、`--xh-skeleton-bone-*` → `-item-*`、`--xh-avatar-group-overflow-*` → `-overflow-item-*`、`--xh-alert-icon-{box,fg}` / `--xh-empty-state-icon-{fg,font-size}` → `-indicator-*`、`--xh-question-flow-option*-*` → `--xh-question-flow-{group,item,item-indicator,item-text}-*`、`--xh-approval-scope*-*` → `--xh-approval-{group,item,item-text}-*`。

`--xh-<组件>-icon-size` 是全库通用的图标尺度槽、不是部件槽，`alert` 与 `empty-state` 的这一支**不改名**。

**`--xh-combobox-group-gap` / `--xh-listbox-group-gap` 换了含义**：它们现在管一组内部条目之间的间距（与 `--xh-menu-group-gap` 同义），原先管的「相邻两组之间留白」移到新槽 `--xh-combobox-group-spacing` / `--xh-listbox-group-spacing`。两处都设过值的，两个名字都要改一遍。
