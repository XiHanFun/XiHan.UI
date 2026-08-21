# 全局配置

组件的内建文案默认是英文，日期时间系组件另收一个 `locale`，尺寸档缺省是 `md`，浮层默认挂在 portal 落点上。这几样逐个实例传一遍既啰嗦又容易漏，`provideXhConfig` 让你在应用根上注入一次。

```ts
import { provideXhConfig } from '@xihan-ui/vue'

provideXhConfig({
  locale: 'zh-CN',
  size: 'sm',
  translations: {
    'dialog': { close: '关闭' },
    'file-upload': { dropzone: '把文件拖到这里' },
  },
})
```

取值优先级只有一条：**实例 props > 最近一层注入 > 外层注入 > 组件内建默认（英文）**。不注入时组件走原路，零开销。

## 五个字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `locale` | `string` | BCP 47 语言标记，喂给日期时间系组件（`calendar` / `date-*` / `time-*`）。它只管这几个组件的日期时间格式，不换文案。 |
| `translations` | `XhTranslationOverrides` | 按组件 id 分组的文案覆盖。每个组件的可覆盖键就是它 `<Pascal>Translations` 里的字段，组件页的 Props 表里能查到。 |
| `size` | `'sm' \| 'md' \| 'lg'` | 尺寸档的默认值，落到每个声明了三轴 `size` 的组件上——跑机器的与不跑机器的（按钮、徽标、空状态这些）都算。它与 `data-density` 是两条独立的轴：`size` 换的是控件高度与字号档，密度只收紧间距。`floating-panel` 的 `size` 是一对像素数、同名不同义，不受它影响。 |
| `portalContainer` | `() => Element \| null` | 浮层默认挂到哪个容器；返回 `null` 即挂 `body`。实例上写了容器的以实例为准。仅 Vue 适配器有——Web Components 是 Light DOM，浮层不搬运。 |
| `scrollRoot` | `() => HTMLElement \| null` | 真正在滚的那个元素。宿主把滚动搬进内容容器（`body` 本身不滚）时必须给，否则模态浮层加的滚动锁是空操作、背后照样能滚。返回 `null` 即交给滚动锁自行探测。 |

**方向不在这里。** `dir` 走 DOM：写在 `<html dir="rtl">` 或任意祖先上即可，行为层从计算样式读它，皮肤里的 `[dir='rtl']` 规则也跟着走。往这份配置里再加一个 JS 侧的 `dir` 只会多一条对不上的通道。

## 运行期切语言

传 ref 或 getter，不要传裸对象——注入的是 `MaybeRefOrGetter<XhConfig>`，给了响应式来源，切语言时组件会跟着重渲。

```ts
import { computed } from 'vue'
import { provideXhConfig } from '@xihan-ui/vue'

const locale = ref<'zh-CN' | 'en-US'>('zh-CN')

provideXhConfig(() => ({
  locale: locale.value,
  translations: locale.value === 'zh-CN' ? zhTranslations : {},
}))
```

传裸对象也能用，只是从此定死——这是最常见的一处误用。

## 文案怎么合并

`translations` 是**按键合并**而不是整块替换：全局给了 `{ close: '关闭', open: '展开' }`、实例给了 `{ close: '收起' }`，组件最终拿到的是 `{ close: '收起', open: '展开' }`。所以全局只需要写你要改的那几条，不必把一个组件的文案抄全。

## 作用域：全局与局部

它就是 Vue 的 provide/inject，因此**按组件树作用域生效**，不是全局单例。同一个应用里可以在不同子树注入不同配置：整站中文，某个内嵌的第三方面板保持英文，各注各的即可。

嵌套注入**逐键合并**，不整份遮蔽：内层只写 `translations` 时，外层的 `locale` 与 `size` 仍然生效；同一个组件下的文案也按键并，内层只覆盖它写了的那几条。键缺席与写成 `undefined` 都算「这一层没说」。

```ts
// 应用根
provideXhConfig({ locale: 'zh-CN', size: 'sm' })

// 某个子树里：只改文案，locale 与 size 照旧从外层继承
provideXhConfig({ translations: { dialog: { close: 'Close' } } })
```

## 自定义元素怎么办

两条出口，语义与 Vue 侧一一对应：`setXhConfig` 管整页，`<xh-config>` 管一棵子树。前者是模块级单例，后者沿 DOM 祖先链解析——Vue 那边找的是组件树，这边找的是 DOM 树，合并规则完全一样。

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

`locale` 与 `size` 两条属性写在标签上就行；`translations` 是对象、`scrollRoot` 是函数，只能走 property。子树里每个元素都沿祖先链解析，跑机器的与不跑机器的一视同仁；`scrollRoot` 由 `xh-dialog` / `xh-drawer` / `xh-image-viewer` 开模态时现读，改了下一次打开就生效。`<xh-config>` 自己不渲染任何东西，也不接线任何角色节点——它是 `display: contents`，布局上完全让开。

`setXhConfig` 是**整份替换**（不深合并），想改一处就把整份拿去改；`<xh-config>` 之间以及它与全局那份之间才是逐键合并。

## 与别的库的对应关系

| 别的库 | 这里 |
| --- | --- |
| Element Plus `<el-config-provider>` | `provideXhConfig()` / `<xh-config>` |
| Ant Design `<ConfigProvider>` | `provideXhConfig()` / `<xh-config>`（`componentSize` 即这里的 `size`） |
| Naive UI `<n-config-provider>` | `provideXhConfig()`（主题部分见[设计令牌与主题](../guide/theme)） |
| Semi Design `<LocaleProvider>` | `provideXhConfig()` 的 `locale` 与 `translations` |

**主题不在这里。** 那几家的 ConfigProvider 同时管主题，这里的主题是 CSS 令牌层的事：换主题是改 CSS 自定义属性、切 `data-theme` 这类属性，跟着 DOM 继承走，局部主题天然可嵌套，与这份配置无关。
