# 全局配置

组件的内建文案默认是英文，日期时间类组件另接受 `locale`，尺寸档默认为 `md`，浮层默认挂在 portal 落点上。这些配置逐个实例传入既冗长又容易遗漏，每个适配器都有一处全局出口，在应用根注入一次：

| 适配器 | 出口 | 作用范围 |
| --- | --- | --- |
| Vue | `provideXhConfig(config)` | 走 provide/inject，可按子树覆盖 |
| React | `<XhConfigProvider config={…}>` | 包住的子树，嵌套的 Provider 同样按子树覆盖 |
| Web Components | `setXhConfig(config)` / `<xh-config>` | 前者模块级、整个文档一份，后者管它包住的子树，见[自定义元素侧](#自定义元素侧) |

```ts
import { provideXhConfig } from "@xihan-ui/vue";

provideXhConfig({
  locale: "zh-CN",
  size: "sm",
  translations: {
    "dialog": { close: "关闭" },
    "file-upload": { dropzone: "把文件拖到这里" },
  },
});
```

```tsx
import { XhConfigProvider } from "@xihan-ui/react";

<XhConfigProvider config={{ locale: "zh-CN", size: "sm" }}>
  <App />
</XhConfigProvider>;
```

取值优先级只有一条：实例 props > 最近一层注入 > 外层注入 > 组件内建默认（英文）。不注入时组件按原路径运行，零开销。内建语言包本身就是一份配置，整份交给出口即可，见[国际化 · 内建语言包](../guide/i18n#内建语言包)。

## 字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `locale` | `string` | BCP 47 语言标记，供日期时间类组件（`calendar-*` / `date-*` / `time-*`）使用。它只决定这些组件的日期时间格式，不切换文案。 |
| `translations` | `XhTranslationOverrides` | 按组件 id 分组的文案覆盖。每个组件的可覆盖键即其 `<Pascal>Translations` 中的字段，组件页的 Props 表可以查到。 |
| `size` | `'sm' \| 'md' \| 'lg'` | 尺寸档的默认值，作用于每个声明了三档 `size` 的组件，包括运行状态机与不运行状态机的（按钮、徽标、空状态等）。它与 `data-density` 是两条独立的轴：`size` 切换控件高度与字号档，密度只收紧间距。`floating-panel` 的 `size` 是一对像素数、同名不同义，不受它影响。 |
| `portalContainer` | `() => Element \| null` | 指定同一 Document 内的浮层目标，未配置时由运行时提供默认 Portal。现有组件通常允许返回 `null` 使用默认目标；Vue DatePicker 的严格规则见下文。它不负责切换 Scope，跨 Document 目标会失败。Vue 与 React 可配置；Web Components 在 `<xh-config>` 上经 property 设置，作用于它的子树。 |
| `scrollRoot` | `() => HTMLElement \| null` | 实际滚动的元素。宿主把滚动移进内容容器（`body` 本身不滚动）时必须提供，否则模态浮层的滚动锁是空操作。返回 `null` 明确锁定页面，不自动探测后代滚动容器；同一 Document 的并行锁必须指向同一规范化目标。 |
| `visualEnvironment` | 控制器选项 | 本层的八轴视觉环境，见下文[视觉环境](#视觉环境)。 |
| `defaults` | 按组件名分桶的对象 | 组件级缺省 props，见下文[组件级缺省](#组件级缺省)。 |

方向不在这里。`dir` 走 DOM：写在 `<html dir="rtl">` 或任意祖先上即可，行为层从计算样式读取，皮肤中的 `[dir='rtl']` 规则也随之生效。在这份配置中再加 JS 侧的 `dir` 只会多一条不一致的通道。

::: details Vue DatePicker 的 Scope 与落点

Vue `DatePicker` 从实际渲染出的根节点建立运行时 Scope：整棵应用挂在 iframe 内时，即使不配置 `portalContainer`，浮层、LayerRegistry、定位与滚动条也都留在该 iframe Document。显式容器必须属于同一 Document；该组件需要默认落点时应省略字段，显式 getter 返回 `null` 或其他非 Element 值会失败。组件不会为了迁就无效目标改绑来源 Scope，也不会回落主页面的全局 `document`。目标 getter 只会在真实根和同轮渲染树中的兄弟 ref 都已提交、浮层真正选择 Portal 落点时读取。初始展开的服务端输出与客户端 hydration 首帧都先保留来源内结构，运行时就绪后再执行同 Document 搬运。

:::

服务端直出时，所有浮层都在来源位置原地输出，不写进 `body`：服务端没有运行时落点，客户端的落点却是 `portalContainer` 或运行时容器，两边对不上，按落点水合会把同页多个浮层的节点认错。Vue 的 hydration 首帧同样原地渲染，挂载后搬到落点；纯客户端挂载直接落在落点。React 服务端同样原地输出。

## 运行期切语言

Vue 侧传入 ref 或 getter，不传裸对象：注入的是 `MaybeRefOrGetter<XhConfig>`，提供响应式来源后，切换语言时使用这些文案的组件随之重渲染。

```ts
import { provideXhConfig } from "@xihan-ui/vue";
import { enUS, zhCN } from "@xihan-ui/vue/locale";
import { computed, ref } from "vue";

const lang = ref<"zh" | "en">("zh");
provideXhConfig(computed(() => (lang.value === "zh" ? zhCN : enUS)));
```

传裸对象也可以使用，但从此固定，这是最常见的误用。React 侧把新的一份交给 `XhConfigProvider` 的 `config`，随渲染生效；自定义元素侧再调一次 `setXhConfig(enUS)`，已挂载的元素随之重渲染。

## 文案的合并方式

`translations` 按键合并而不是整块替换：全局提供 `{ close: '关闭', open: '展开' }`、实例提供 `{ close: '收起' }`，组件最终得到 `{ close: '收起', open: '展开' }`。因此全局只需要写需要修改的条目，不必抄全一个组件的文案。

## 视觉环境

`visualEnvironment` 把一棵子树交给一台局部的视觉环境控制器。它必须显式给出所管的 DOM 根，不推测出口对应的元素；嵌套的出口自动接父控制器，局部 `motion` 只投影当前根、不修改全局 JS override。物理 Portal 由 Core 从该根桥接已解析八轴到实例壳，适配器不另存一份视觉状态。控制器本身见[设计令牌与主题](../guide/theme#父作用域、portal-与回收)。

```ts
provideXhConfig({
  locale: "zh-CN",
  visualEnvironment: {
    root: workspaceElement,
    initial: { mode: "dark", density: "compact", motion: "reduce" },
  },
});
```

React 写进 `XhConfigProvider` 的 `config`，字段相同。自定义元素的 `<xh-config>` 本身就是 Light DOM 局部 scope，八轴直接写成属性：

```html
<xh-config
  mode="dark"
  brand="acme"
  density="compact"
  direction="rtl"
  contrast="more"
  motion="reduce"
  transparency="reduce"
>
  <my-workspace></my-workspace>
</xh-config>
```

`<xh-config>` 的局部 `motion` 只降低该子树的 CSS 动效，不隐式调用全局 `setMotionOverride`。应用根需要同时驱动 JS 动画时，用 `setXhConfig({ visualEnvironment: { root, initial, motionSink } })` 显式绑定。

## 组件级缺省

组件级缺省写在 `defaults` 里，按组件名分桶。实例没写的 prop 取这里的值，优先于应用级的 `size` 与 `locale`；嵌套的出口按组件逐键合并，内层胜出。只收外观与行为开关：`value`、`default*` 初值、`on*` 回调与 `translations` 写在这里不生效（文案走 `translations`）。

```ts
provideXhConfig({
  defaults: {
    "text-field": { variant: "subtle", clearable: true },
    "button": { tone: "neutral" },
  },
});
```

React 同样写进 `XhConfigProvider` 的 `config`。Vue 侧没在模板上写的布尔 prop 同样取得到缺省，不会被裸 `Boolean` 的 `false` 挡住。自定义元素的 `defaults` 是对象，只能经 `<xh-config>` 的 property 设置：

```js
document.querySelector("xh-config").defaults = {
  "text-field": { variant: "subtle", clearable: true },
  "button": { tone: "neutral" },
};
```

## 作用域：全局与局部

Vue 侧就是 provide/inject，React 侧是嵌套的 `XhConfigProvider`，因此按组件树作用域生效，不是全局单例。同一个应用中可以在不同子树注入不同配置：整站中文，某个内嵌的第三方面板保持英文，各自注入即可。

嵌套注入逐键合并，不整份遮蔽：内层只写 `translations` 时，外层的 `locale` 与 `size` 仍然生效；同一个组件下的文案也按键合并，内层只覆盖它写了的条目。键缺席与写成 `undefined` 都视为该层未声明。

```ts
// 应用根
provideXhConfig({ locale: "zh-CN", size: "sm" });

// 某个子树中：只改文案，locale 与 size 仍从外层继承
provideXhConfig({ translations: { dialog: { close: "Close" } } });
```

## 自定义元素侧

两条出口，语义与 Vue 侧一一对应：`setXhConfig` 管理整页，`<xh-config>` 管理一棵子树。前者是模块级单例，后者沿 DOM 祖先链解析：Vue 侧查找组件树，这里查找 DOM 树，合并规则完全一致。

```html
<script type="module">
  import { setXhConfig } from '@xihan-ui/web-components'

  setXhConfig({ locale: 'zh-CN', size: 'sm' })
</script>

<!-- 这一小块保持英文，size 仍从全局继承 -->
<xh-config id="panel">
  <xh-dialog>…</xh-dialog>
</xh-config>

<script type="module">
  document.getElementById('panel').translations = { dialog: { close: 'Close' } }
</script>
```

`locale` 与 `size` 两条属性写在标签上即可；`translations` 是对象、`scrollRoot` 是函数，只能通过 property 设置。子树中每个元素都沿祖先链解析，运行状态机与不运行状态机的组件一致；`scrollRoot` 由 `xh-dialog` / `xh-drawer` / `xh-image-viewer` / `xh-command` 开启模态时读取，修改后下一次打开生效。`<xh-config>` 自身不渲染任何内容，也不接线任何角色节点：它是 `display: contents`，布局上完全让开。

浮层打开后内容搬进 Portal 落点，里面的元素照它们在原来 DOM 里的位置解析：Portal 实例壳登记了来源，解析走到壳时跳回来源接着往上找，与 Vue 侧浮层沿组件树取配置一致。包着对话框的 `<xh-config>` 因此照样管得到对话框里的下拉、开关与文案，打开期间改它，搬走的元素跟着更新；浮层里再放的 `<xh-config>` 承接外层的视觉环境，禁用的 `xh-fieldset` 也压进组里开的浮层内容。

`setXhConfig` 是整份替换（不深合并），修改一处需要传入整份配置；`<xh-config>` 之间以及它与全局配置之间才是逐键合并。

运行状态机的元素把沿祖先链解析到的那份结果缓存起来：状态机每读一个 prop 都要经过这一步，而解析一次要逐层往上找配置作用域。缓存在全局那份改了、任一 `<xh-config>` 改了或进出文档时整体作废，元素自己被搬到另一棵子树时随断开重连作废。因此**改配置要走 `setXhConfig` 或 `<xh-config>` 的 property**，就地改写已经交出去的那个配置对象不会被看见——这一条本来就成立（子树里已挂载的元素也不会因此重渲），缓存只是让它更明显。

## 与其他库的对应关系

| 其他库 | 本库 |
| --- | --- |
| Element Plus `<el-config-provider>` | `provideXhConfig()` / `<xh-config>` |
| Ant Design `<ConfigProvider>` | `provideXhConfig()` / `<xh-config>`（`componentSize` 即这里的 `size`） |
| Naive UI `<n-config-provider>` | `provideXhConfig()`（主题部分见[设计令牌与主题](../guide/theme)） |
| Semi Design `<LocaleProvider>` | `provideXhConfig()` 的 `locale` 与 `translations` |

主题不在这里。上述库的 ConfigProvider 同时管理主题，本库的主题属于 CSS 令牌层：切换主题是修改 CSS 自定义属性、切换 `data-theme` 等属性，随 DOM 继承，局部主题天然可嵌套，与这份配置无关。

Vue 与 React 的浮层搬到 Portal 时，每个实例会把逻辑来源最近声明的 `data-theme`、`data-brand`、`data-density`、`data-contrast`、`data-motion`、`data-transparency` 和 `dir` 投影到自己的无盒壳，并复制来源解析出的 CSS 自定义属性；共享 Portal 根不带这些属性。同一落点里的两个局部主题因此互不覆盖。来源没有声明的轴与变量继续继承显式 `portalContainer`，普通计算样式不会被复制。

Web Components 的浮层展开后同样搬进所属 Document 的运行时 Portal（或 `portalContainer` 给的落点），使用独占无盒壳桥接上述视觉轴，关闭或断连后恢复作者原位置。

`shape` 是组件自身形态，不是主题环境轴。系统 `prefers-reduced-transparency` 媒体路径在同一浏览器中天然同时作用于来源与 Portal；`data-transparency="reduce"` 是同源的显式视觉轴，令牌层会在该局部范围将材质实体化并由实例壳继承，业务皮肤也可消费它扩展自己的非材质降级。
