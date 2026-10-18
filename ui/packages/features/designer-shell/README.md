# @xihan-ui/designer-shell

画布式设计器共用的界面零件：属性面板、标尺与参考线、变换覆盖层、物料面板与拖放、问题列表、小地图与外框。打印、流程、表单、报表四款设计器用同一套零件，名字、手势与事件对齐。

**谁会装它**：做画布式设计器的人。普通页面用不到它，它也不随适配器安装。

## 只出 Web Components

这个包是本库「组件三端齐备」惯例的例外，经用户批准：

- 只有 Web Components，没有 headless 契约、没有 Vue / React 版本，不进三端一致性套件。四款设计器都以原生 Web Components 交付，这些零件只给设计器用，不是通用组件。
- 元素自己生成内部结构，不要求作者写 `data-xh-part` 的 Light DOM；部件用 `data-part` 标出，供样式与测试选取。作者内容用 `slot="<名>"` 标在零件的直接子节点上，零件把它搬进对应区域。
- 内部用到的库内元素（字段、开关、选择器、标签等）按需注册，不全量注册 `@xihan-ui/web-components`。
- 样式随包发 `@xihan-ui/designer-shell/style.css`，只消费语义令牌，不进 `@xihan-ui/styles` 的组件槽与无层产物。

## 用法

```ts
import { defineDesignerShell } from '@xihan-ui/designer-shell'
import '@xihan-ui/designer-shell/style.css'

defineDesignerShell() // 注册全部零件；也可以用 defineDesignerShellElement(tag, ctor) 按需注册
```

## 约定

- 零件不持有文档、不碰历史栈：只吃数据、吐事件；改文档与记撤销由设计器做。
- 坐标只认 `@xihan-ui/designer-kit` 的视口：屏幕 = 世界 × `zoom` + (`x`, `y`)。世界单位由设计器定，`zoom` 就是一个世界单位等于多少屏幕像素；控制柄大小、吸附阈值、标尺厚度等固定尺寸一律按屏幕像素。
- 事件一律 `CustomEvent`，冒泡并穿过 shadow 边界，名字用短横线、不带前缀。
- 每个零件都有 `readonly`：只能浏览与选择，不出编辑手势、不派发修改类事件。
- 文案键是零件的标签名，自带英文缺省；各语言的文案在子入口 `@xihan-ui/designer-shell/locale`，与 UI 的内建语言包一一对应（`jaJP` 对 `designerShellJaJP`），各产品把同一语言的这一份并进自己的语言包。
