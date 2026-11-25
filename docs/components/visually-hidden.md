# VisuallyHidden 视觉隐藏

一段在屏幕上看不见、读屏照读的内容。内容仍在无障碍树、布局与表单里，只是在屏幕上缩成一个被裁掉的 1×1 盒；打开 `focusable` 后，里面的链接或按钮获得焦点时整段显出来。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/visually-hidden" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/visually-hidden.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/visually-hidden" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/visually-hidden" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/visually-hidden.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

几个「阅读全文」链接各自补上藏起来的文章标题：屏幕上看着一样，读屏按链接列表浏览时分得清

<XhDemo src="visually-hidden/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="visually-hidden"`：**`root`**

## 示例

### 跳转链接

打开 focusable：平时藏着，按 Tab 进来时显出，按下直达正文

<XhDemo src="visually-hidden/02-skip-link" />

### 补全样式里的意思

删除线只给眼睛看，读屏只会连读两个数字；把「原价」「现价」写成藏起来的文字

<XhDemo src="visually-hidden/03-styled-meaning" />

## 设计指引

### 何时使用

- 看得见的文字说不全，读屏需要补一句上下文：几个「阅读全文」链接各自补上文章标题，划掉的价格前补上「原价」。
- 页面最前的「跳到正文」跳转链接：平时藏着，用键盘按 Tab 进来时显出。
- 控件要一段补充说明、又不必显示出来：说明写进视觉隐藏，控件用 `aria-describedby` 指向它。

### 何时不用

- 内容对谁都不该出现：用 `hidden` 属性或 `display: none`。两者把内容同时从屏幕和无障碍树里拿掉，读屏读不到，也不占布局。
- 内容只给眼睛看、不给读屏：用 `aria-hidden="true"`，方向正相反，装饰图标就是这样处理的。
- 只给一个按钮、链接或带角色的控件起名、又不需要这段文字出现在正文里：直接写 `aria-label` 更省事；仅图标的[按钮](./button)（`iconOnly`）就要求写它。
- 状态变化要读屏主动播报：写进带 `aria-live` 的活动区域。视觉隐藏只决定看不看得见，不会让内容被播报。

### 特性

- 与 `hidden`、`display: none` 不同：内容留在无障碍树里，读屏照读；根仍是一个可定位的盒，放在里面的原生表单控件照常参与提交，原生校验提示也有地方落。
- 与 `aria-label` 不同：藏起来的是真实的文字节点，不是属性值。它可以放在任何元素里（`aria-label` 写在没有角色的 `span`、`div` 上，读屏不认），浏览模式下逐字读得到，也能与看得见的文字连成一句；页面翻译工具常常跳过属性值，文字节点则照常翻译。
- 藏法与工具类 `.xh-visually-hidden` 是同一组声明：绝对定位的 1×1 盒，`clip-path: inset(50%)` 裁掉，`white-space: nowrap` 防止文字在窄盒里折成竖排。工具类照旧可用，给不经组件渲染的节点用。
- `focusable` 只在焦点进入根（`:focus-within`）时撤掉隐藏、回到正常排版，焦点离开再藏回去；不另铺面，显出来的样子与聚焦环都归里面那个可聚焦元素。
- 根是行内的 `span`，内容由作者写；Web Components 由作者写一个 `data-xh-part="root"` 的行内容器，元素不改动其中的节点。

### 组合

- 跳转链接用[按钮](./button)的 `as="a"` 形态，显出来就是一颗按钮。
- 补充说明放在[排印](./typography)的链接与删除线文字里：读屏按链接列表浏览时分得清每一条，也读得出哪个是原价。

### 最佳实践

- 藏起来的文字与看得见的文字连读要通顺，比如「阅读全文」后接「：设计令牌入门」。
- 补充说明写短：读屏每次经过这里都会读一遍。

### 反模式

- 把可聚焦的元素放进不带 `focusable` 的视觉隐藏：焦点落进去，屏幕上什么也看不到。
- 用它在屏幕和读屏上讲两件不同的事：藏起来的内容只补全看得见的内容，不与它矛盾。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-visually-hidden>` |
| Vue 组件 | `XhVisuallyHidden` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/visually-hidden.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `focusable` | `boolean` |  | 获得焦点时显出来：给「跳到正文」这类跳转链接用。缺省一直藏着。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

- 根不写 role、`aria-hidden`、`tabindex`：内容按它本来的语义朗读，根自身不进焦点序。
- 放在按钮、链接里时，藏起来的文字并入它们的可及名。
- 用作 `aria-describedby` 的目标时，给根写 `id`，由控件指向它。
- 跳转链接放在页面最前、排在导航之前，`href` 指向正文容器的 `id`；按下后再按 Tab 从正文往后走。

## 样式参考

### 皮肤

`@xihan-ui/styles/visually-hidden.css` 按 `[data-scope="visually-hidden"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-visually-hidden` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-focusable` | ''（条件成立时才出现） |

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
