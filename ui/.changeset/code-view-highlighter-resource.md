---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

CodeView 默认高亮器的异步请求、单例缓存、订阅与失败边界现由 Headless 资源控制器统一管理，三端适配器只注入可选模块 loader 并桥接各自响应式更新。
显式关闭高亮不会请求默认模块；明确缺少可选 peer 时保持纯文本，已安装模块的加载或初始化异常不再被静默吞掉。
