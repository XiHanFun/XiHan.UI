---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**14 组 prop 改名、2 组事件改名。** 不留别名、不留旧名并存：下面左列的名字在无头层与两个适配器里都不再存在，写下它们等于没写。

## 一、几何值不再占用三轴的 `size`

`size` 在三轴里是 `'sm' | 'md' | 'lg'`，`resizable` 与 `floating-panel` 的却是一对像素数——同一个名字两个类型域，写 `size="md"` 得到的是静默的错。两家一并改名 `dimensions`。

| 组件 | 已删 | 换成 |
| --- | --- | --- |
| `resizable` | `size` / `defaultSize` / `onSizeChange` / `onSizeChangeEnd` | `dimensions` / `defaultDimensions` / `onDimensionsChange` / `onDimensionsChangeEnd` |
| `floating-panel` | `size` / `defaultSize` / `onSizeChange` | `dimensions` / `defaultDimensions` / `onDimensionsChange` |

连带：载荷字段 `{ size }` → `{ dimensions }`；机器事件 `SIZE.SET` → `DIMENSIONS.SET`（floating-panel 另有 `SIZE.NUDGE` → `DIMENSIONS.NUDGE`）；api 的 `size` → `dimensions`、`setSize` → `setDimensions`；Vue 的 `v-model:size` → `v-model:dimensions`、事件 `size-change` → `dimensions-change`、`size-change-end` → `dimensions-change-end`；WC 属性 `size` → `dimensions`、`default-size` → `default-dimensions`。

删掉的导出，逐个换名：

| 已删 | 换成 |
| --- | --- |
| `ResizableSize` | `ResizableDimensions` |
| `ResizableSizeChangeDetails` | `ResizableDimensionsChangeDetails` |
| `ResizableSizeChangeEndDetails` | `ResizableDimensionsChangeEndDetails` |
| `FloatingPanelSizeChangeDetails` | `FloatingPanelDimensionsChangeDetails` |
| `RESIZABLE_DEFAULT_SIZE` | `RESIZABLE_DEFAULT_DIMENSIONS`（值不变，仍是 `{ width: 240, height: 160 }`） |

标量的不动：`floating-panel` 的 `minSize` / `maxSize` 与类型 `FloatingPanelSize` 保持原样。

## 二、`floating-panel` 的形态轴不再叫 `stage`

`stage` 在库内另有「阶段」义（`data-state` 的 phase 族）。

| 已删 | 换成 |
| --- | --- |
| prop `stage` / `defaultStage` / `onStageChange` | `windowState` / `defaultWindowState` / `onWindowStateChange` |
| 类型 `FloatingPanelStage` / `FloatingPanelStageChangeDetails` / `FloatingPanelStageTriggerProps` | `FloatingPanelWindowState` / `FloatingPanelWindowStateChangeDetails` / `FloatingPanelWindowStateTriggerProps` |
| 部件 `stage-trigger` | `window-state-trigger` |
| `data-stage` / `data-target-stage` | `data-window-state` / `data-target-window-state` |
| Vue `<XhFloatingPanelStageTrigger>` | `<XhFloatingPanelWindowStateTrigger>` |
| WC 属性 `stage` / `default-stage`，形态钮上的 `stage="…"` | `window-state` / `default-window-state`，钮上写 `window-state="…"` |
| 事件 `stage-change`（Vue emit 与 WC CustomEvent 同名） | `window-state-change` |
| api `stage` / `setStage` / `getStageTriggerProps` | `windowState` / `setWindowState` / `getWindowStateTriggerProps` |

## 三、当前步序并进 `value` 家族

`step` 一名三义：增量（number-field / slider / time-picker）、键盘步进（已叫 `keyboardStep`）、当前步序。第三义并进受控三件套。

| 组件 | 已删 | 换成 |
| --- | --- | --- |
| `steps` / `tour` | `step` / `defaultStep` / `onStepChange` | `value` / `defaultValue` / `onValueChange` |

连带：载荷字段 `{ step }` → `{ value }`；事件 `step-change` → `value-change`；`v-model:step` → `v-model:value`；WC 属性 `step` → `value`、`default-step` → `default-value`；api `step` → `value`、`setStep` → `setValue`；类型 `StepsStepChangeDetails` / `TourStepChangeDetails` → `StepsValueChangeDetails` / `TourValueChangeDetails`。

`data-step`、`goToNextStep` / `goToPrevStep`、`TourCompleteDetails.step` / `TourSkipDetails.step` 不动——它们说的是「第几步」，不是那个受控值。

## 四、展开态收成两种形态

集合型的展开一律 `expandedValue` 三件套，布尔型的展开一律 `open` 三件套。

| 组件 | 已删 | 换成 |
| --- | --- | --- |
| `diff-view` / `table` | `expanded` / `defaultExpanded` | `expandedValue` / `defaultExpandedValue` |
| `json-viewer` | `flattenJson` 选项 `expanded` | `expandedValue` |
| `diff-view` / `json-viewer` / `side-nav` / `table` / `tree` / `tree-select` | `onExpandedChange`、事件 `expanded-change` | `onExpandedValueChange`、事件 `expanded-value-change` |
| `truncate` | `expanded` / `defaultExpanded` / `onExpandedChange` | `open` / `defaultOpen` / `onOpenChange` |

`truncate` 的 connect 本来发的就是 `aria-expanded` 加 `data-state='open' | 'closed'`，与 `collapsible` 逐字同构，prop 名却与状态编码分叉。连带：事件 `expanded-change` → `open-change`；`v-model:expanded` → `v-model:open`；WC 属性 `expanded` → `open`、`default-expanded` → `default-open`；api `expanded` / `setExpanded` → `open` / `setOpen`；机器状态 `collapsed` / `expanded` → `closed` / `open`；类型 `TruncateExpandedChangeDetails` → `TruncateOpenChangeDetails`。

`diff-view` 的载荷字段 `{ expanded }` 改成与另外五家一致的 `{ value }`；`diff-view` 的 api `expanded` / `setExpanded` 改成 `expandedValue` / `setExpandedValue`。六个载荷类型一并改名：

| 已删 | 换成 |
| --- | --- |
| `DiffViewExpandedChangeDetails` | `DiffViewExpandedValueChangeDetails` |
| `JsonViewerExpandedChangeDetails` | `JsonViewerExpandedValueChangeDetails` |
| `SideNavExpandedChangeDetails` | `SideNavExpandedValueChangeDetails` |
| `TableExpandedChangeDetails` | `TableExpandedValueChangeDetails` |
| `TreeExpandedChangeDetails` | `TreeExpandedValueChangeDetails` |
| `TreeSelectExpandedChangeDetails` | `TreeSelectExpandedValueChangeDetails` |

## 五、只读数据源一律 `collection`

| 组件 | 已删 | 换成 |
| --- | --- | --- |
| `image-viewer` | `items` | `collection` |
| `anchor` | `targets` | `collection` |

## 六、其余五条

| 组件 | 已删 | 换成 | 为什么 |
| --- | --- | --- | --- |
| `approval` / `prompt-input` | `busy` | `loading` | 同一件事全库两个名字，`loading` 是多数派，且它配的就是 `data-loading` 与 `aria-busy` |
| `skeleton` | `variant`（`text` / `circle` / `rect`）、类型 `SkeletonVariant` | `shape`、`SkeletonShape` | 三个取值是形状不是形态，与三轴的 `variant` 撞名。骨架条自报形状的属性也从 `variant` 改成 `shape` |
| `grid` | `justify`、`data-justify`、类型 `GridJustify` | `justifyItems`、`data-justify-items`、`GridJustifyItems` | `grid` 落的是 `justify-items`、`flex` 落的是 `justify-content`，同名不同 CSS 属性。`align` 两边落的都是 `align-items`，不动 |
| `card` | `segmented` | `split` | 与 `segmented` 组件撞名；它自己发的状态属性早就叫 `data-split` |
| `mention` | prop `prefix`、WC 属性 `prefix` | `triggerPrefix`、`trigger-prefix` | 与 `prefix` 部件撞名。WC 的 JS 字段本来就叫 `triggerPrefix`，这次属性名跟上 |

## 七、两组事件名归一

| 已删 | 换成 | 在哪 |
| --- | --- | --- |
| `onVisibleChange` / `visible-change` | `onVisibilityChange` / `visibility-change` | `back-top`；类型 `BackTopVisibleChangeDetails` → `BackTopVisibilityChangeDetails` |
| `onFinish` / `finish` | `onComplete` / `complete` | `number-animation`；类型 `NumberAnimationFinishDetails` → `NumberAnimationCompleteDetails` |

`onValueChangeEnd`（连续拖动结束）、`onValueComplete`（各段填满）、`onValueCommit`（就地编辑提交）三者答的是三个不同的问题，保持三名分立，已写进规范的事件名词汇表。
