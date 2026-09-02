---
"@xihan-ui/styles": minor
---

**修复**四处令牌与档位没对齐。

**list 的 lg 档描述行还是中号字。** 三个尺寸档各换一组私有槽，`--xh-_list-description-size` 唯独 lg 那一档漏了声明：大号列表的标题跟着放大，描述行原地不动，两行字的级差在这一档塌成了零。补上 `--xh-control-caption-lg`，与 sm / md 同取一把尺。`check-size-ladder` 的判据是三档齐全才比，缺一档整个槽直接跳过——补齐之后这个槽才落进门禁管辖。

**list 条目的悬停底色比同族深一档。** 列表条目的轻档在库里一律是中性灰的 `--xh-bg-subtle`（listbox / select / combobox / menu 都是这一档），只有 list 的兜底取了更深的 `--xh-bg-subtle-hover`：同一份数据换个组件渲，鼠标划过的深浅就跳一档。兜底改回 `--xh-bg-subtle`；显式写过 `--xh-list-item-bg-hover` 的用法不受影响。

**新增使用者槽 `--xh-signature-pad-control-border-invalid`。** 画布的校验失败描边此前直接读语义令牌，是库里同类声明里唯一没留覆盖入口的一处——只想改这块画布的报错色，就得连带改掉全库所有控件的。

**splitter 的禁用不透明度留出使用者槽 `--xh-splitter-disabled-opacity`（默认 0.6）。** 原先是写死的字面量，改不动。它没有跟着 `--xh-state-disabled-opacity`（0.5）走：那一档压的是控件自己的图形，而分栏这一层压的是宿主塞进面板里的正文，0.5 会把黑字白底压到 3.94:1、读不出字。
