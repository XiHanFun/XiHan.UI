---
"@xihan-ui/kernel": major
"@xihan-ui/behavior": patch
---

**移除** `@xihan-ui/kernel` 上 12 个导出。

九个属性名常量全库零引用——`data-state` 这类名字库里一律直接写字面量，常量从来没人取：`DATA_STATE` `DATA_DISABLED` `DATA_ORIENTATION` `DATA_HIGHLIGHTED` `DATA_SIDE` `DATA_ALIGN` `DATA_LAYER` `DATA_LAYER_BRANCH` `DATA_COLLECTION_ITEM`。其中后三个还是幻影：`data-xh-layer` `data-xh-layer-branch` `data-xh-collection-item` 这三个属性没有任何代码往 DOM 上打过。需要这些名字的写字面量即可，它们是 CSS 里本来就要照着写的那一串。

三个重置函数是测试脚手架，生产代码零调用、文档零提及，却进了版本承诺：`resetSkinCheck` `resetRuntimeHost` `resetMetadataBanner`。需要出厂状态的用例改用 `vi.resetModules()` 重取一份模块。注意 `resetDiagnostics` 不在此列——诊断通道挂在 `globalThis` 上，重取模块清不掉它，那个函数是给宿主用的公开 API。

**修复**四个消解事件名的双真源。`xh.dismiss.escapeKeyDown` / `pointerDownOutside` / `focusOutside` / `interactOutside` 此前在 kernel 与 behavior 各写了一遍字面量，改一处不改另一处就会静默分叉。现在 `@xihan-ui/behavior` 的消解层从 kernel 引 `EV_ESCAPE_KEY_DOWN` / `EV_POINTER_DOWN_OUTSIDE` / `EV_FOCUS_OUTSIDE` / `EV_INTERACT_OUTSIDE`，与同包的聚焦域引 `EV_MOUNT_AUTO_FOCUS` 一个口径。事件名本身没变，监听方不受影响。
