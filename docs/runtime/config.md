# 全局配置

组件的内建文案默认是英文，日期时间系组件另收一个 `locale`，浮层默认挂在 `body` 上。这三样逐个实例传一遍既啰嗦又容易漏，`provideXhConfig` 让你在应用根上注入一次。

```ts
import { provideXhConfig } from '@xihan-ui/vue'

provideXhConfig({
  locale: 'zh-CN',
  translations: {
    'dialog': { close: '关闭' },
    'file-upload': { dropzone: '把文件拖到这里' },
  },
})
```

取值优先级只有一条：**实例 props > 这里注入的全局值 > 组件内建默认（英文）**。不注入时组件走原路，零开销。

## 三个字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `locale` | `string` | BCP 47 语言标记，喂给日期时间系组件（`calendar` / `date-*` / `time-*`）。它只管这几个组件的日期时间格式，不换文案。 |
| `translations` | `XhTranslationOverrides` | 按组件 id 分组的文案覆盖。每个组件的可覆盖键就是它 `<Pascal>Translations` 里的字段，组件页的 Props 表里能查到。 |
| `portalContainer` | `() => Element \| null` | 浮层默认挂到哪个容器；返回 `null` 即挂 `body`。实例上写了容器的以实例为准。 |

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

## 作用域

它就是 Vue 的 provide/inject，因此**按组件树作用域生效**，不是全局单例。同一个应用里可以在不同子树注入不同配置：整站中文，某个内嵌的第三方面板保持英文，各注各的即可。

## 与别的库的对应关系

| 别的库 | 这里 |
| --- | --- |
| Element Plus `<el-config-provider>` | `provideXhConfig()` |
| Ant Design `<ConfigProvider>` | `provideXhConfig()` |
| Naive UI `<n-config-provider>` | `provideXhConfig()`（主题部分见[设计令牌与主题](../guide/theme)） |
| Semi Design `<LocaleProvider>` | `provideXhConfig()` 的 `locale` 与 `translations` |

**主题不在这里。** 那几家的 ConfigProvider 同时管主题，这里的主题是 CSS 令牌层的事，换主题是改 CSS 自定义属性，与这份配置无关，也就不需要把它挂进组件树。

## 自定义元素怎么办

`provideXhConfig` 是 Vue 适配器的东西。用自定义元素时，文案逐个元素通过 `translations` 属性传，或者在你自己的封装层里统一注入——Web Components 没有 provide/inject 这一层，库不替你造一个。
