# FocusTrap 焦点圈定

激活期间焦点留在区域里：Tab 走到两端回绕，焦点被拉到外面时拉回来，停用时还给激活前的持有者。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/focus-trap" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/focus-trap.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/focus-trap" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/focus-trap" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/focus-trap.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

打开后焦点进到区域里，Tab 在三颗按钮之间回绕；完成后停用，焦点回到打开它的按钮

<XhDemo src="focus-trap/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="focus-trap"`：**`root`**

## 示例

### 不回绕

loop 为 false 时 Tab 停在最后一个、Shift+Tab 停在第一个，焦点仍出不去；autoFocus 为 false 时激活不挪焦点，等焦点进来再陷住

<XhDemo src="focus-trap/02-loop" />

### 不归还焦点

restoreFocus 为 false 时停用后焦点留在原处，适合停用后紧接着要把焦点交给别处的场合

<XhDemo src="focus-trap/03-restore" />

## 设计指引

### 何时使用

- 自己搭的浮层、全屏面板或引导步骤，打开期间键盘不该走出去。
- 原地展开的编辑区，编辑期间焦点只在几个输入框和保存、取消之间转。

### 何时不用

- 对话框、抽屉、模态气泡卡片已经陷住焦点，不要再套一层：用[对话框](./dialog)、[抽屉](./drawer)。
- 只想让一组控件用方向键切换：那是集合导航，用[工具栏](./toolbar)或[单选组](./radio-group)。

### 特性

- 激活时焦点移到第一个可聚焦元素，一个都没有时落到区域本身；`autoFocus` 为 false 时不挪，等焦点进来再陷住。
- `loop` 为 false 时 Tab 停在两端，不回绕。
- 停用或卸载时把焦点还给激活前的持有者；`restoreFocus` 为 false 时不还。
- 开在里面的浮层、压在上面的对话框打开期间它暂停，关掉后接着陷住。
- 不收 Escape：放在对话框里时 Escape 仍然关掉对话框。区域要用 Escape 退出时，作者自己监听并把 `active` 写回 false。

### 最佳实践

- 区域里放一个明确的出口（关闭、完成、取消），陷住焦点的同时要让人能主动离开。
- 打开时如果第一个可聚焦元素不是最该先操作的那个，把焦点交给它之前先调整顺序，不要靠 `tabindex` 正值。

### 反模式

- 不要一直开着：焦点圈定只在一段明确的交互期间激活，交互结束即停用。
- 不要用它代替模态：它不藏背景、不锁滚动，读屏用户仍能用浏览模式读到区域外面的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-focus-trap>` |
| Vue 组件 | `XhFocusTrap` |
| 组合式函数 | `useFocusTrap` |
| 状态机 | `focusTrapMachine` |
| 皮肤 | `@xihan-ui/styles/focus-trap.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `active` | `boolean` |  | 是否陷住焦点，缺省 true。由 true 变 false 时停用，按 restoreFocus 归还焦点。 |
| `loop` | `boolean` |  | Tab 走过最后一个可聚焦元素时回到第一个、Shift+Tab 反之，缺省 true；false 时停在两端。 |
| `autoFocus` | `boolean` |  | 激活时把焦点移进来，缺省 true：落到第一个可聚焦元素，一个都没有时落到根上。 false 时焦点留在原处，等它进来再陷住。 |
| `restoreFocus` | `boolean` |  | 停用或卸载时把焦点还给激活前的持有者，缺省 true。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhFocusTrap` | `children` | `ReactNode` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'active' \| 'inactive' |

以下名称仅用于内部状态机。

**状态**：`inactive` · `active`

**事件**：`ACTIVATE` · `DEACTIVATE`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `active` | `boolean` | 此刻是否陷住焦点。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | active | 移到下一个可聚焦元素；在最后一个上时回到第一个，loop 为 false 时停在最后一个 |
| `Shift+Tab` | active | 移到上一个可聚焦元素；在第一个上时回到最后一个，loop 为 false 时停在第一个 |

## 样式参考

### 皮肤

`@xihan-ui/styles/focus-trap.css` 按 `[data-scope="focus-trap"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-focus-trap` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | 'active' \| 'inactive' |

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
