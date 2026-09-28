---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

新增勾选标记家族配方 `family/check-mark.css`：勾选格里的勾与半选杠常驻，不再按勾选态生成或撤掉内容；按状态以 opacity 淡变（`--xh-motion-duration-micro`）并从 `--xh-motion-scale-enter` 回到原尺寸（`--xh-motion-duration-nudge`），减弱动效下只剩淡变；勾与半选杠叠成两层遮罩，半选淡出途中保持横杠。

连接层在画标记的节点上投影 `data-xh-check-mark`（`checked` / `indeterminate` / `unchecked`）与 `data-xh-check-mark-profile`（`box`：节点就是方框；`row`：方框画在整行的 `::before`，标记叠在方框正中）：

- Checkbox `indicator`、CheckboxGroup `indicator`、Transfer `item-checkbox`、Table `select-all-trigger` / `row-select-trigger` / `column-visibility-trigger`、QuestionFlow 多选题的 `item-indicator` 投影 `box`；
- CheckboxGroup 与 Transfer 的 `select-all-trigger` 投影 `row`。

随之对齐的取值：CheckboxGroup 勾中方框的填色与独立 Checkbox 同取保证 3:1 的语气 control 色；CheckboxGroup 全选格禁用时标记取 `--xh-fg-disabled`；Table 三颗勾选框不再把前景换成透明来藏勾，禁用且勾中时显示置灰的勾，与 Checkbox 同一档。GridList 行勾选框的描边、底色补上过渡，勾常驻并按同一副取值淡变。
