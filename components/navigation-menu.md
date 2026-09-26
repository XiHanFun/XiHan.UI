来源：https://ui.docs.xihanfun.com/components/navigation-menu

# NavigationMenu 导航菜单

用于站点顶部的多级导航菜单。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/navigation-menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/navigation-menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/navigation-menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/navigation-menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/navigation-menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

从顶部入口展开站点导航

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  { value: "resources", label: "资源" },
];
const panels: Record<string, Array<{ href: string; title: string; description: string }>> = {
  products: [
    { href: "#/products/headless", title: "无头内核", description: "框架无关的行为与状态" },
    { href: "#/products/adapters", title: "多端适配器", description: "Vue、React 与 Web Components" },
  ],
  docs: [
    { href: "#/docs/guide", title: "快速开始", description: "安装并创建第一个组件" },
    { href: "#/docs/components", title: "组件文档", description: "浏览组件与 API" },
  ],
  resources: [
    { href: "#/resources/themes", title: "主题", description: "令牌与视觉定制" },
    { href: "#/resources/examples", title: "示例", description: "常见界面组合" },
  ],
};
</script>

<template>
  <div style="inline-size: min(720px, 100%); padding-block-end: 180px">
    <XhNavigationMenuRoot :collection="entries">
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="item in panels[node.value]"
          :key="item.href"
          :href="item.href"
          style="align-items: flex-start"
        >
          <span style="display: grid; gap: 2px">
            <strong>{{ item.title }}</strong>
            <span style="color: var(--xh-fg-muted)">{{ item.description }}</span>
          </span>
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: min(720px, 100%); padding-block-end: 180px">
  <xh-navigation-menu style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item"><button data-xh-part="trigger" value="products">产品</button><div data-xh-part="content" value="products"><a data-xh-part="link" href="#/products/headless"><span><strong>无头内核</strong><br><span style="color: var(--xh-fg-muted)">框架无关的行为与状态</span></span></a><a data-xh-part="link" href="#/products/adapters"><span><strong>多端适配器</strong><br><span style="color: var(--xh-fg-muted)">Vue、React 与 Web Components</span></span></a></div></li>
        <li data-xh-part="item"><button data-xh-part="trigger" value="docs">文档</button><div data-xh-part="content" value="docs"><a data-xh-part="link" href="#/docs/guide"><span><strong>快速开始</strong><br><span style="color: var(--xh-fg-muted)">安装并创建第一个组件</span></span></a><a data-xh-part="link" href="#/docs/components"><span><strong>组件文档</strong><br><span style="color: var(--xh-fg-muted)">浏览组件与 API</span></span></a></div></li>
        <li data-xh-part="item"><button data-xh-part="trigger" value="resources">资源</button><div data-xh-part="content" value="resources"><a data-xh-part="link" href="#/resources/themes"><span><strong>主题</strong><br><span style="color: var(--xh-fg-muted)">令牌与视觉定制</span></span></a><a data-xh-part="link" href="#/resources/examples"><span><strong>示例</strong><br><span style="color: var(--xh-fg-muted)">常见界面组合</span></span></a></div></li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
```

## 组件结构

加粗的是必需部件。

`data-scope="navigation-menu"`：**`root`** · **`list`** · **`item`** · `trigger` · `trigger-indicator` · `content` · **`link`** · `indicator` · `viewport`

## 示例

### 竖向排列

在侧栏旁展开子级导航

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "system", label: "系统管理" },
  { value: "monitor", label: "运行监控" },
  { value: "tool", label: "系统工具" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  system: [
    { href: "#/system/user", label: "用户" },
    { href: "#/system/role", label: "角色" },
  ],
  monitor: [
    { href: "#/monitor/online", label: "在线用户" },
    { href: "#/monitor/job", label: "定时任务" },
  ],
  tool: [{ href: "#/tool/codegen", label: "代码生成" }],
};
</script>

<template>
  <div style="inline-size: min(480px, 100%); padding-block-end: 40px">
    <XhNavigationMenuRoot
      :collection="entries"
      orientation="vertical"
      style="inline-size: 180px"
    >
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: min(480px, 100%); padding-block-end: 40px">
  <xh-navigation-menu orientation="vertical" style="display: contents">
    <nav data-xh-part="root" style="inline-size: 180px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="system">系统管理</button>
          <div data-xh-part="content" value="system">
            <a data-xh-part="link" href="#/system/user">用户</a>
            <a data-xh-part="link" href="#/system/role">角色</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="monitor">运行监控</button>
          <div data-xh-part="content" value="monitor">
            <a data-xh-part="link" href="#/monitor/online">在线用户</a>
            <a data-xh-part="link" href="#/monitor/job">定时任务</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="tool">系统工具</button>
          <div data-xh-part="content" value="tool">
            <a data-xh-part="link" href="#/tool/codegen">代码生成</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
```

### 直达链接

混合下拉入口与普通链接

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  { value: "changelog", label: "更新日志", href: "#/changelog" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  products: [
    { href: "#/products/runtime", label: "运行时内核" },
    { href: "#/products/vue", label: "Vue 适配器" },
  ],
  docs: [
    { href: "#/docs/guide", label: "上手指南" },
    { href: "#/docs/anatomy", label: "部件解剖" },
  ],
};
</script>

<template>
  <div style="inline-size: min(640px, 100%); padding-block-end: 150px">
    <XhNavigationMenuRoot :collection="entries">
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: min(640px, 100%); padding-block-end: 150px">
  <xh-navigation-menu style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="products">产品</button>
          <div data-xh-part="content" value="products">
            <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
            <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="docs">文档</button>
          <div data-xh-part="content" value="docs">
            <a data-xh-part="link" href="#/docs/guide">上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="item">
          <a data-xh-part="link" href="#/changelog">更新日志</a>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
```

### 共享面板

在固定位置切换不同导航内容

```vue
<script setup lang="ts">
import {
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhNavigationMenuViewport,
} from "@xihan-ui/vue";

const groups = [
  {
    value: "products",
    label: "产品",
    links: [
      { href: "#/products/runtime", label: "运行时内核" },
      { href: "#/products/vue", label: "Vue 适配器" },
      { href: "#/products/wc", label: "Web Components 适配器" },
    ],
  },
  {
    value: "docs",
    label: "文档",
    links: [{ href: "#/docs/guide", label: "上手指南" }],
  },
  {
    value: "about",
    label: "关于",
    links: [
      { href: "#/about/team", label: "团队" },
      { href: "#/about/contact", label: "联系我们" },
    ],
  },
];
</script>

<template>
  <div style="inline-size: min(640px, 100%); padding-block-end: 180px">
    <XhNavigationMenuRoot>
      <XhNavigationMenuList>
        <XhNavigationMenuItem v-for="g in groups" :key="g.value">
          <XhNavigationMenuTrigger :value="g.value">
            {{ g.label }}
          </XhNavigationMenuTrigger>
        </XhNavigationMenuItem>
      </XhNavigationMenuList>

      <XhNavigationMenuViewport>
        <XhNavigationMenuContent
          v-for="g in groups"
          :key="g.value"
          :value="g.value"
        >
          <XhNavigationMenuLink
            v-for="l in g.links"
            :key="l.href"
            :href="l.href"
          >
            {{ l.label }}
          </XhNavigationMenuLink>
        </XhNavigationMenuContent>
      </XhNavigationMenuViewport>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: min(640px, 100%); padding-block-end: 180px">
  <xh-navigation-menu style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="products">产品</button>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="docs">文档</button>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="about">关于</button>
        </li>
      </ul>

      <div data-xh-part="viewport">
        <div data-xh-part="content" value="products">
          <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
          <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
          <a data-xh-part="link" href="#/products/wc">Web Components 适配器</a>
        </div>
        <div data-xh-part="content" value="docs">
          <a data-xh-part="link" href="#/docs/guide">上手指南</a>
        </div>
        <div data-xh-part="content" value="about">
          <a data-xh-part="link" href="#/about/team">团队</a>
          <a data-xh-part="link" href="#/about/contact">联系我们</a>
        </div>
      </div>
    </nav>
  </xh-navigation-menu>
</div>
```

## 设计指引

### 何时使用

- 门户、营销站或文档站具有多组导航链接。

### 何时不用

- 操作命令使用[菜单](./menu)。
- 后台层级导航使用[侧栏导航](./side-nav)。

### 特性

- 支持横向和竖向排列、延迟展开与键盘导航。
- 没有子级的入口可直接渲染为链接。
- `viewport` 可让所有面板在同一位置切换。
- 当前链接使用 `aria-current="page"`，并自带一条静态指示线（横排的直达链接贴底边，竖排与面板里的链接贴起始缘）；`indicator` 部件指的是开着的面板，两者各说各的。

### 组合

- 窄屏时切换为抽屉或侧栏导航，不压缩顶部入口。

### 最佳实践

- 使用短标题和简洁说明组织链接。
- 保留默认展开延时，避免指针经过时连续闪动。

### 反模式

- 不要在导航面板中放置表单或一次性命令。
- 不要在窄屏中强行保留完整横向导航。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-navigation-menu>` |
| Vue 组件 | `XhNavigationMenuContent` `XhNavigationMenuIndicator` `XhNavigationMenuItem` `XhNavigationMenuLink` `XhNavigationMenuList` `XhNavigationMenuRoot` `XhNavigationMenuTrigger` `XhNavigationMenuTriggerIndicator` `XhNavigationMenuViewport` |
| 组合式函数 | `useNavigationMenu` |
| 状态机 | `navigationMenuMachine` |
| 皮肤 | `@xihan-ui/styles/navigation-menu.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `NavigationMenuNode[]` |  | 入口数据，入口文本与禁用的事实源。提供后 trigger 部件只需声明 value。 未提供时回到文本与禁用都写在部件上的方式。 |
| `value` | `string \| null` |  | 当前展开项，提供即受控；null 表示全部收起。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal。 |
| `delayDuration` | `number` |  | 悬停 / 聚焦到 trigger 后等待多久才展开，默认 200ms。 |
| `skipDelayDuration` | `number` |  | 收起之后的静默窗口，默认 300ms；窗口内再次触及任意 trigger 直接展开。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `disabled` | `boolean` |  | 整套导航禁用：所有入口都为 aria-disabled，面板不再展开。 |
| `translations` | `Partial<NavigationMenuTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: NavigationMenuValueChangeDetails) => void` |  | value 变化回调。 |

### NavigationMenuNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 入口文本；默认回退为 value。 |
| `disabled` | `boolean` |  | 入口禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 |
| `href` | `string` |  | 直达目标。提供后该项即为一条链接，没有面板。 |
| `current` | `boolean` |  | 指向当前页面的直达入口：输出 aria-current="page"。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `NavigationMenuValueChangeDetails` | 展开项变化；detail 为 `{ value: string \| null }` |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhNavigationMenuContent` | `value` | `string` | 是 |  |
| `XhNavigationMenuLink` | `current` | `boolean` |  |  |
| `XhNavigationMenuRoot` | `renderPanel` | `(node: NavigationMenuNodeMeta) => ReactNode` |  | 每张面板的内容；只提供 collection 时由它承载。 |
| `XhNavigationMenuRoot` | `children` | `ReactNode` |  |  |
| `XhNavigationMenuTrigger` | `value` | `string` | 是 |  |
| `XhNavigationMenuTrigger` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhNavigationMenuTriggerIndicator` | `value` | `string` | 是 |  |
| `XhNavigationMenuTriggerIndicator` | `disabled` | `boolean` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `trigger-indicator` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `viewport` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle` · `opening` · `skipping`

**事件**：`TRIGGER.POINTER` · `TRIGGER.FOCUS` · `TRIGGER.TOGGLE` · `DISMISS` · `VALUE.SET` · `PRESENCE.SET` · `after.delayDuration` · `after.skipDelayDuration` · `PRESS.START` · `PRESS.END`

**判据**：`hasValue` · `isCurrent` · `shouldKeepOpen` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前展开的项；全部收起时为 null。 |
| `collection` | `readonly NavigationMenuNodeMeta[]` | 由 collection 推导的入口元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `open` | `boolean` | 是否有面板展开。 |
| `isOpen` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: NavigationMenuTriggerProps) => T['button']` |  |
| `getTriggerIndicatorProps` | `(props: NavigationMenuTriggerProps) => T['element']` |  |
| `getContentProps` | `(props: NavigationMenuContentProps) => T['element']` |  |
| `getLinkProps` | `(props: NavigationMenuLinkProps) => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | held on trigger / link, 导航未禁用且入口未禁用 | 按住期间入口或面板链接投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，链接随面板收起一并撤下。开合与激活语义照旧由这一次按键承担 |
| `ArrowRight` / `ArrowDown` | focus in trigger, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；随后的自动展开走 delayDuration |
| `ArrowLeft` / `ArrowUp` | focus in trigger, 按键与 orientation 同轴 | 焦点移到上一个 trigger |
| `Home` | focus in trigger | 焦点移到首个可停留 trigger |
| `End` | focus in trigger | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 立即展开对应面板（不走 delayDuration）；面板是自动弹出来的那一次不收起，再按一次才收起 |
| `Escape` | open | 收起面板并把焦点归还对应 trigger；静默窗口内这一次归还不会把面板重新弹出来 |
| `Tab` / `Shift+Tab` | open, focus in trigger | 走进展开的面板：面板就在 trigger 之后，收起的面板带 hidden 因而被整个跳过 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger-indicator` | `aria-hidden` | 'true' |
| `content` | `aria-hidden` | !isOpen \|\| undefined |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'group' |
| `link` | `aria-current` | 'page' \| undefined |
| `indicator` | `aria-hidden` | 'true' |
| `viewport` | `aria-hidden` | !open \|\| undefined |

## 样式参考

### 皮肤

`@xihan-ui/styles/navigation-menu.css` 使用 `[data-scope="navigation-menu"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-in-path` | ''（条件成立时才出现） |
| `trigger` | `data-orientation` | props.orientation |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-collection-context` | 'nav' |
| `trigger` | `data-xh-collection-item` | '' |
| `trigger` | `data-xh-collection-size` | props.size |
| `trigger-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `trigger-indicator` | `data-orientation` | props.orientation |
| `trigger-indicator` | `data-state` | 'open' \| 'closed' |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-pressed` | ''（条件成立时才出现） |
| `link` | `data-xh-collection-context` | 'nav' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-value` | context.get('value') |
| `viewport` | `data-orientation` | props.orientation |
| `viewport` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-navigation-menu-content-bg` | `content`<br>`viewport` | `background` | `default` | `--xh-bg-surface` | navigation-menu 的 content、viewport 部件 background 覆盖槽。 |
| `--xh-navigation-menu-content-border` | `content`<br>`viewport` | `border` | `default` | `--xh-border-default` | navigation-menu 的 content、viewport 部件 border 覆盖槽。 |
| `--xh-navigation-menu-content-gap` | `content` | `gap` | `default` | `--xh-space-1` | navigation-menu 的 content 部件 gap 覆盖槽。 |
| `--xh-navigation-menu-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | navigation-menu 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-navigation-menu-content-offset` | `content`<br>`viewport` | `inset-block-start`<br>`inset-inline-start` | `default`<br>`orientation=vertical` | `--xh-space-1` | navigation-menu 的 content、viewport 部件 inset-block-start、inset-inline-start 覆盖槽。 |
| `--xh-navigation-menu-content-p` | `content` | `padding` | `default` | `--xh-surface-pad-xs` | navigation-menu 的 content 部件 padding 覆盖槽。 |
| `--xh-navigation-menu-content-radius` | `content`<br>`viewport` | `border-radius` | `default` | `--xh-shape-overlay` | navigation-menu 的 content、viewport 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-content-shadow` | `content`<br>`viewport` | `box-shadow` | `default` | `--xh-elevation-floating` | navigation-menu 的 content、viewport 部件 box-shadow 覆盖槽。 |
| `--xh-navigation-menu-fg` | `root` | `color` | `default` | `--xh-fg-default` | navigation-menu 的 root 部件 color 覆盖槽。 |
| `--xh-navigation-menu-font-size` | `root`<br>`trigger` | `font-size` | `default` | `--xh-_navigation-menu-font-size` | navigation-menu 的 root、trigger 部件 font-size 覆盖槽。 |
| `--xh-navigation-menu-gap` | `list` | `gap` | `default` | `--xh-space-1` | navigation-menu 的 list 部件 gap 覆盖槽。 |
| `--xh-navigation-menu-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | navigation-menu 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-navigation-menu-indicator-color` | `indicator`<br>`link` | `background` | `current`<br>`default` | `--xh-_navigation-menu-accent` | navigation-menu 的 indicator、link 部件 background 覆盖槽。 |
| `--xh-navigation-menu-indicator-radius` | `indicator`<br>`link` | `border-radius` | `current`<br>`default` | `--xh-shape-pill` | navigation-menu 的 indicator、link 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-indicator-thickness` | `indicator`<br>`item`<br>`link`<br>`list` | `block-size`<br>`inline-size`<br>`inset-block-end` | `current`<br>`default`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` | navigation-menu 的 indicator、item、link、list 部件 block-size、inline-size、inset-block-end 覆盖槽。 |
| `--xh-navigation-menu-layer` | `content`<br>`viewport` | `z-index` | `default` | `--xh-_layer` | navigation-menu 的 content、viewport 部件 z-index 覆盖槽。 |
| `--xh-navigation-menu-link-bg-hover` | `link` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_navigation-menu-highlight-bg` | navigation-menu 的 link 部件 background-color 覆盖槽。 |
| `--xh-navigation-menu-link-bg-pressed` | `link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` | navigation-menu 的 link 部件 background-color 覆盖槽。 |
| `--xh-navigation-menu-link-fg` | `link` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-fg-default` | navigation-menu 的 link 部件 color 覆盖槽。 |
| `--xh-navigation-menu-link-fg-current` | `link` | `color` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-fg-brand-strong` | navigation-menu 的 link 部件 color 覆盖槽。 |
| `--xh-navigation-menu-link-font-size` | `link` | `font-size` | `default` | `--xh-_navigation-menu-link-font-size` | navigation-menu 的 link 部件 font-size 覆盖槽。 |
| `--xh-navigation-menu-link-font-weight-current` | `link` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-font-weight-medium` | navigation-menu 的 link 部件 font-weight 覆盖槽。 |
| `--xh-navigation-menu-link-px` | `link` | `padding-inline` | `default` | `--xh-_navigation-menu-link-px` | navigation-menu 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-navigation-menu-link-py` | `link` | `padding-block` | `default` | `--xh-_navigation-menu-link-py` | navigation-menu 的 link 部件 padding-block 覆盖槽。 |
| `--xh-navigation-menu-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | navigation-menu 的 link 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-trigger-bg-active` | `trigger` | `background-color` | `in-path`<br>`xh-collection-context=nav` | `--xh-_navigation-menu-highlight-bg` | navigation-menu 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-navigation-menu-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_navigation-menu-highlight-bg` | navigation-menu 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-navigation-menu-trigger-bg-pressed` | `trigger` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` | navigation-menu 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-navigation-menu-trigger-fg` | `trigger` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` | navigation-menu 的 trigger 部件 color 覆盖槽。 |
| `--xh-navigation-menu-trigger-font-weight` | `trigger` | `font-weight` | `default`<br>`xh-collection-context=nav` | `--xh-font-weight-regular` | navigation-menu 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-navigation-menu-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_navigation-menu-trigger-gap` | navigation-menu 的 trigger 部件 gap 覆盖槽。 |
| `--xh-navigation-menu-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_navigation-menu-trigger-h` | navigation-menu 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-navigation-menu-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_navigation-menu-trigger-px` | navigation-menu 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-navigation-menu-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | navigation-menu 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-navigation-menu-viewport-p` | `viewport` | `padding` | `default` | `--xh-space-2` | navigation-menu 的 viewport 部件 padding 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换 · 指示与换位 · 出现（锚定面板） · 出现（无锚定弹出）（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`block-size` · `inline-size` · `rotate` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
