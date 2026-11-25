---
'@xihan-ui/web-components': major
---

**破坏性** Web Components 的 `createLoadingBarService` 入参删掉 `color`：它从来没接到进度条上，写了也不生效；Vue 与 React 的同名服务本就没有这一项。进度条的颜色经 `tone` / `errorTone` 取语气，或在宿主上改 `--xh-loading-bar-range` 覆盖槽。
