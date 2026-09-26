---
'@xihan-ui/headless': patch
---

SideNav 折叠态悬停弹出的等待挪进状态机：此前连接层用一个模块级的计时器写死 100ms，同页多台侧栏共用同一个句柄（一台的指针离开会撤掉另一台的等待），卸载时也不撤销，到点仍往停掉的机器送事件。现在每台机器各自持有等待，卸载时撤销；时长取 `HOVER_INTENT_OPEN_DELAY`，与 Menu 子菜单的缺省同源，取值不变。新增内部事件 `POPOUT.HOVER` / `POPOUT.HOVER_END`。
