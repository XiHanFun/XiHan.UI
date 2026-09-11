---
'@xihan-ui/headless': major
'@xihan-ui/react': patch
'@xihan-ui/vue': patch
'@xihan-ui/web-components': patch
---

TextField textarea 的 `autoSize` 现在用所属 Document 内短暂挂载的 textarea 镜像测量内容与单行高度。
`line-height: normal` 不再退回 `font-size * 1.2` 或固定 `20px`；`minRows` / `maxRows` 会按浏览器
实际行盒换算。

量高同时区分 `content-box` 与 `border-box`：内容的 padding-box、块轴内距和边框先换到同一种
声明尺寸口径再夹取，避免 content-box 重复计入内距、遗漏边框或在 maxRows 处错误开启滚动。
现有 helper 管理的是纵向滚动，因此当前只接受 `writing-mode: horizontal-tb`；其他书写模式会明确失败
并归还 autoSize 接管前的内联声明，不再产生轴向错误的高度。

对已公开量高函数的书写模式约束改为显式拒绝，因此 Headless 按 major 记录。
Vue 输入部件也改在挂载或更新完成后量高，不会再从尚未接入 Document 的模板 ref 回调读取排版。
