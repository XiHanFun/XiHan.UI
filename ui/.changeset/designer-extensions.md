---
'@xihan-ui/designer-kit': minor
'@xihan-ui/designer-shell': minor
'@xihan-ui/core': minor
---

设计器扩展的共有部分：四款设计器按实例收 `extensions`，这里给出骨架、合并查重、装卸与界面帮手。

- designer-kit：`DesignerExtensionCore` / `DesignerExtensionBase` 与命令、导入、导出、规则、编辑方式的类型；`mergeExtensions` 与 `createExtensionHost` 合并内置与传入的扩展，扩展 id、命令 id、快捷键、编辑方式、导入导出 id 与各款传入的名字重名时抛 `DesignerExtensionError`（`designer.extension-conflict`），装卸按 id 与引用比对；`extensionEditors`、`extensionControls`、`extensionCommands`、`runExtensionRules`（问题码须以扩展 id 末段加点开头）；快捷键沿用 `xh-kbd` 的写法，`shortcutKey`、`formatShortcut`、`commandForShortcut`；模板扩展数据 `getExtensionData`、`setExtensionData`、`extensionDataPath`、`checkExtensionData`。
- designer-kit 的属性描述：`checkProperties` 的 `checkCustom` 改为 `controls`（编辑方式表），既不是内建也没登记的编辑方式报新的通用问题码 `unknown-control`，不再静默跳过；新增 `mergePropertyEditorTables` 与 `PropertyEditorLayer`。新增对 `@xihan-ui/headless` 的依赖（快捷键）。
- designer-shell：`createPanelHost` 把扩展的面板登记到外框的区；`arrangeCommands` 按 `commandLayout` 或缺省排列分组，`createCommandToolbar` 与 `renderCommandMenu` 铺成工具栏按钮与右键菜单条目，`runCommand` 执行；`DesignerShellExtension`、`DesignerPanel` 类型。
- core：诊断码表新增 `designerExtensionConflict`（`designer.extension-conflict`）。
