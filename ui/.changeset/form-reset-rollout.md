---
"@xihan-ui/headless": minor
---

其余 16 个表单字段组件全部接上表单重置，并立一道门禁盯着以后新加的。

现在 17 个带 `name` 的组件——checkbox-group、color-picker、date-field、date-picker、editable、
file-upload、number-field、pin-input、radio-group、rating、select、slider、tags-input、text-field、
time-field、time-picker、tree-select——放进 `<form>` 里点重置，都会回到各自的默认值。

**逐组件不是一刀切**，几处照直做会错的地方分别绕开了：

- `file-upload` 直写 cell，不走 `FILES.SET`：它的 intake 只在有文件通过校验时才写，空数组是空操作、清不掉列表。
- `date-picker` 的重置不带 `src`：带了会命中 `closesOnSelect` 顺手收起浮层，或走进区间选择的截断分支。
- `pin-input` 直写 cell，不走 `commitValue`：默认值是满格时它会白发一次「填完了」。
- `color-picker` 的锚只在非受控时丢：锚是按值串缓存的色相，值受控时它还对应着宿主那份值，
  丢了会让灰度色的色相塌回 0°——值一个字节没变而色相滑块当场跳。
- `rating` 一并清悬停缓冲，否则指针悬着会盖住重置后的显示。
- `editable` 的 `committedValue`（Escape 撤销的落点）跟着值一起写：它的 cell 默认是 `prop('value') ?? …`，
  受控时直接重置会把它停在宿主旧值。
- `tags-input` 的 `value` 与 `inputValue` 是两条独立受控轴，各判各的。
- `tree-select` 的展开态不动：它不带 `name`、不参与提交，还原只会多派一次 `onExpandedChange`。
- 焦点锚点、悬停位置、浮层开合、能力探测这类非表单 UI 状态一律不动——原生重置也不碰它们。

**新增门禁 `check-form-reset`**：分母从源码扫出来（`*.types.ts` 的 props 里有 `name?: string` 即表单字段），
不是手写名单——新加一个表单组件它自动进等式，忘了接线就红。豁免要写明理由，理由过期也报错。
拿改动前的仓库实跑过它有分辨力。
