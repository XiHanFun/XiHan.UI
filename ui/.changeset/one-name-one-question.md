---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**一名多义收口：`data-type` 拆成五个名字，`data-phase` 并进 `data-state`。** 一个属性名只答一个问题。`data-type` 此前同时答五个：这个值是什么形态、这条消息有多严重、这道题单选还是多选、滚动条什么时候露面、时间按什么格式渲染——使用者看见 `[data-type]` 猜不出选中的是什么，写 `[data-type='error']` 也说不清命中的是哪一类组件。`data-phase` 是同一件事的反面：相位在词汇表里早就属于 `data-state` 的 `phase` 族，`tool-call` 另开了第二个名字，于是想给「出错的那一档」写一条统一规则的人必须写两条。两处都按同一条规矩改完：**不留别名、不留过渡期。**

**破坏性：下表左列的属性名在 DOM 上不再出现，选它的规则一条也不会再命中。** 这一介质没有 IDE 提示，改名之后选择器只会静默失配，不报错也不降级——请在自己的代码库里全文搜索左列，逐条换成右列。

| 删掉的名字 | 改成 | 组件 / 部件 | 取值 |
| --- | --- | --- | --- |
| `data-type` | `data-value-type` | `json-viewer` 的 `item` / `item-value` / `branch` | `array` / `boolean` / `null` / `number` / `object` / `string` |
| `data-type` | `data-severity` | `toast` 的 `root`，`notification` 的 `item` | `info` / `success` / `warning` / `error` / `loading` |
| `data-type` | `data-select-mode` | `question-flow` 的 `option-group` / `option` / `option-indicator` | `single` / `multiple` |
| `data-type` | `data-reveal-mode` | `scroll-area` 的 `root` / `scrollbar`，`scrollbar` 的 `root` | `auto` / `always` / `scroll` / `hover` / `scroll-hover` |
| `data-type` | `data-format` | `time` 的 `root` | `date` / `datetime` / `relative` |
| `data-phase` | `data-state` | `tool-call` 的 `name` / `summary` / `status` / `duration` / `approval` / `input` / `output` / `error` | `input-streaming` / `input-available` / `awaiting-approval` / `output-available` / `output-error` |

各组件的 `type` / `phase` prop 一个都没动，默认渲染逐像素不变。

**`tool-call` 的 `root` 与 `trigger` 不再报阶段。** 阶段与开合是两条正交的轴，一个属性只装得下一条：这两个部件的 `data-state` 是开合（`open` / `closed`，与其余折叠件一致），阶段落在上表那八个部件上。自带皮肤里「出错换描边色」那条改成从后代读阶段（`[data-part='root']:has([data-scope='tool-call'][data-state='output-error'])`），八个部件渲出任何一个都命中。要按阶段给整张卡片写规则的，照这个写法接。

**五个新取值进了 `data-state` 的 `phase` 族**（`input-streaming` / `input-available` / `awaiting-approval` / `output-available` / `output-error`），族内互斥的规矩照旧；`phase` 族的其余 25 个取值不变。

**门禁补了「一名多义」的另一半。** 原先只认得出「同一个名字既当布尔又当枚举」，认不出「两个组件都当枚举、取值域却完全不相干」——`data-type` 正是后者，一路攒到六种含义都没有一条判据会响。判据⑨两头收取值域（连接层的字面量 + 皮肤选择器选中的值），发现互不相交的一对就要求在 `state-vocabulary.json` 的 `enum` 段写明这个名字问的是什么；一句话说不清的即须拆名。形态、摆位这类「同一个问题、各家自己的取值」的名字逐条登记在案，登记了却不再互不相交的算名单过期，同样判红。`retired` 段补进 `data-open` / `data-phase` / `data-type` 三条，发了或选了都判红。
