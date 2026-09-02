---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
---

**读屏文案与排布方向收成单一形状：不再收字符串文案，不再收 `direction` 别名。**

四处形状此前是为了不推翻既有调用方而放宽的：两处文案收「字符串或函数」的并集，两处排布方向收 `orientation` 与 `direction` 两个同义入参。并集与别名都已收回，只留一种写法。

### 删掉的名字

在自己的代码库里全文搜索以下字符串，命中处按下面的对照改写：

| 删掉的名字 | 出处 |
| --- | --- |
| `FlexDirection` | `@xihan-ui/headless` 的导出类型 |
| `direction` | `flex` 组件的 prop / `<xh-flex>` 的特性 |
| `direction` | `space` 组件的 prop / `<xh-space>` 的特性 |
| `data-direction` | `flex` 根部件发出的属性 |

`DiffViewTranslations.expandGap` 与 `MessageFeedTranslations.item` 名字仍在，但只收函数。

### 文案：字符串改成函数

`DiffViewTranslations.expandGap` 由 `string | ((count: number) => string)` 收成 `(count: number) => string`。

```ts
// 旧
translations: { expandGap: '展开' }
// 新：入参是这一格折起来的行数
translations: { expandGap: count => `展开折起的 ${count} 行` }
```

`MessageFeedTranslations.item` 由 `string | ((position, size, role?) => string)` 收成 `(position: number, size: number, role?: MessageFeedItemRole) => string`。

```ts
// 旧
translations: { item: '消息' }
// 新：入参是第几条、共几条、谁说的；size 为 -1 表示宿主没声明总数
translations: { item: (position, size, role) => `第 ${position}/${size} 条，${role}` }
```

不想插值的，把原来那句字符串包成常量函数即可：`item: () => '消息'`。

### 排布方向：direction 改成 orientation

`flex` 与 `space` 的 `direction` 入参删除，方向只由 `orientation` 一个入口给；`flex` 根部件不再另发 `data-direction`，方向只由 `data-orientation` 表出。

```html
<!-- 旧 -->
<xh-flex direction="column">   <xh-space direction="vertical">
<!-- 新 -->
<xh-flex orientation="vertical">   <xh-space orientation="vertical">
```

`flex` 的取值一并换词：`row` → `horizontal`、`column` → `vertical`，与全库其余组件的排布轴说同一句话。写在自己样式表里的 `[data-direction='column']` 一类选择器改成 `[data-orientation='vertical']`。
