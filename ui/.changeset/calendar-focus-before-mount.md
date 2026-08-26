---
"@xihan-ui/headless": patch
---

date-picker 展开态初值为真且铺了格子时，不再抛 `SEND_BEFORE_MOUNT`。

`defaultOpen` 为真时浮层在首帧就是展开的，编排机挂载那一刻焦点域把焦点送进了聚焦日那一格，格子的 `focus` 于是回调到日历机器的 `FOCUS.SET`。四台机器按创建顺序注册挂载回调，编排机排在日历前面——那一下发出去时日历还是 `NotStarted`，机器按契约抛错。

日历的 `focusAt` 加一道未挂载守卫：这一路只是「把焦点落在哪一格记下来」，而那一下的落点本就是按 props 算出来的聚焦日，记不记都一样，直接丢掉。键盘与点击那一路（`focusInGrid`）走的是另一个出口，不受影响。

`tests/date-picker-panel-index.spec.ts` 改用 `defaultOpen` 挂载，同时钉住这一条。
