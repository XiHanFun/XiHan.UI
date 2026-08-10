# 步骤条 <Badge type="info" text="steps" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

不传 step 即为非受控；方向键只搬焦点，按 Enter 或空格才切步，进退方法由 root 的插槽交出来

<XhDemo src="steps/01-basic" />

### 受控

传了 step 就由宿主说了算，组件自己不再改步序；v-model:step 是它的语法糖

<XhDemo src="steps/02-controlled" />

### 线性模式

linear 下还没走到的步一律禁用，只能回头看走过的；它只拦界面上的乱跳，逐步前进照常

<XhDemo src="steps/03-linear" />

### 竖排

orientation="vertical" 把步骤列与面板并排摆，方向键随之改收上下键

<XhDemo src="steps/04-vertical" />

### 语气

tone 决定已完成与当前这两步的标记、连接线用哪族颜色；示例预置到第 2 步，第 1 步已走完

<XhDemo src="steps/05-tone" />

### 尺寸

size 换序号圆点的直径与标题、说明的字号，不传 size 即默认档

<XhDemo src="steps/06-size" />

### 点击切步与禁用某步

点标签直接切到那一步；单步标了 disabled 就点不动，方向键也跳过它

<XhDemo src="steps/07-click" />

### 出错的那一步

步序只认下标，「这一步出错了」是宿主自己的数据：在那一步的 item 上换掉标记与颜色令牌

<XhDemo src="steps/08-error-step" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-steps>` |
| Vue 组件 | `XhStepsContent` `XhStepsDescription` `XhStepsIndicator` `XhStepsItem` `XhStepsList` `XhStepsRoot` `XhStepsSeparator` `XhStepsTitle` `XhStepsTrigger` |
| 组合式函数 | `useSteps` |
| 状态机 | `stepsMachine` |
| 皮肤 | `@xihan-ui/styles/steps.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="steps"`：**`root`** · **`list`** · **`item`** · **`trigger`** · `indicator` · `title` · `description` · `separator` · `content`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `step` | `number` |  | 当前步序（0 起）。给定即受控：内部不再自改，只发 onStepChange。 |
| `defaultStep` | `number` |  | 非受控初值，默认 0。 |
| `count` | `number` |  | 总步数，是步序的上界与读屏"第 k 步，共 n 步"的分母。 缺省按 0 处理：此时 root 带 data-empty，步序被夹死在 0。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `linear` | `boolean` |  | 线性模式：只能回头看走过的步。未解锁（index &gt; step）的 trigger 一律禁用。 只拦跳转，goToNextStep 逐步前进照常可用。 |
| `disabled` | `boolean` |  | 整组不可交互：trigger 全部退出 Tab 序列，指针与键盘都不认。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onStepChange` | `(details: StepsStepChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 状态机

**状态**：`idle`

**事件**：`STEP.SET` · `STEP.PREV` · `STEP.NEXT` · `TRIGGER.FOCUS` · `LIST.BLUR`

## connect API

`useSteps` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `step` | `number` | 当前步序，恒在 [0, count] 内：count 变小后停在越界步也读得到一个可用的值。 |
| `count` | `number` |  |
| `complete` | `boolean` | 全部走完（step 走到 count）。此时没有任何一步是 current，作者据此渲染完成页。 |
| `focusedStep` | `number \| null` | 焦点在组外时为 null。 |
| `getItemState` | `(props: StepsItemProps) => StepsItemState` |  |
| `setStep` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count]。 不认 linear：linear 只拦界面上的乱跳，不拦作者的命令式调用。 |
| `goToNextStep` | `() => void` |  |
| `goToPrevStep` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: StepsItemProps) => T['element']` |  |
| `getTriggerProps` | `(props: StepsItemProps) => T['button']` |  |
| `getIndicatorProps` | `(props: StepsItemProps) => T['element']` |  |
| `getTitleProps` | `(props: StepsItemProps) => T['element']` |  |
| `getDescriptionProps` | `(props: StepsItemProps) => T['element']` |  |
| `getSeparatorProps` | `(props: StepsItemProps) => T['element']` |  |
| `getContentProps` | `(props: StepsItemProps) => T['element']` | 面板按 index 与当前步配对；未命中的常挂并带 hidden。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个可停留 trigger（禁用与 linear 未解锁的跳过，尽头不回绕）；步序不变 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个可停留 trigger；步序不变 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, 未禁用且已解锁 | 把当前步切到焦点所在的那一步 |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底 |
