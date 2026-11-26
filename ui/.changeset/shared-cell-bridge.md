---
'@xihan-ui/core': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**新增** `createCell`：受控 / 非受控桥的读写规则收进 core，内置运行时与 Vue、React、Web Components 三端的 `cell` 都改用它，只各自交出值的容器与通知方式。

**修复** 四份实现的写入次序不一致：响应跟引用、报告跟 `isEqual`。非受控时写进内容一样的另一份（清空时 `[]` 换成另一份 `[]`），React 与 Web Components 现在也落下新引用并刷新一次，盯引用的监听（日历区间据此作废挑到一半的起点）三端一致；此前 React 写入了却不刷新，Web Components 直接丢掉。按 `isEqual` 真变了才报 `onChange`，与原来相同。
