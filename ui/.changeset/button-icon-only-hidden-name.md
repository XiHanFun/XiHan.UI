---
'@xihan-ui/core': minor
'@xihan-ui/headless': major
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**变更** 仅图标按钮（`iconOnly`）的缺名提醒改到挂载后读真实节点：根上的 `aria-label` / `aria-labelledby` / `title`，或按钮里除去 `aria-hidden` 的部分有文字（放一段视觉隐藏的文字即可），都算有名字。提醒改走诊断通道，新码 `button.missing-name`，生产构建不报。headless 的 `ButtonSchema` 撤掉只为这条提醒而设的 `ariaLabel` / `ariaLabelledby` 两个 prop，属性本身照旧由宿主写在根节点上。
