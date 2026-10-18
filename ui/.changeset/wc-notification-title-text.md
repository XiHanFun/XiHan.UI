---
"@xihan-ui/web-components": major
---

`<xh-notification-item>` 的标题文案改写 `title-text`（property 仍是 `titleText`），`title` 不再当作配置。`title` 是 HTML 全局属性，写在宿主上时浏览器会在悬停时弹出原生提示，宿主还会以标题为内容多出一段可及描述，读屏把标题念两遍。现在标题只进 `item-title` 部件，卡片以它为名，宿主不带 `title`。

升级：写过 `<xh-notification-item title="已保存">` 的改成 `title-text="已保存"`；代码里设 `titleText` 的、经通知服务发出的不用改。Vue 与 React 的 `title` 不变。
