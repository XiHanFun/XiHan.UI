---
'@xihan-ui/designer-shell': minor
---

扩展新增 `paletteSources`：往物料面板里加几组，排在各款内置分组之后（如「我的物料」、行业模板）。一个来源是 `{ id, order?, groups(context), insert(item, context, at?) }`；`collectPaletteSources` 合起各扩展的来源并按 `order` 排，id 重名时抛 `DesignerExtensionError`（名字空间 `palette-source`）；`resolvePaletteSources(内置分组, 来源, 上下文)` 合成物料面板的分组，条目被激活或拖到画布上放下时经它的 `insert(itemId, context, at?)` 先交给所属来源，内置条目返回 `false` 照旧插入。落点的形状由各款定，写在 `DesignerShellExtension` 新加的最后一个类型参数 `At` 上。
