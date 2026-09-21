---
'@xihan-ui/styles': patch
---

Table 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-table-icon-size`（§6.5）：排序箭头 `::after` 三态取新增公开槽 `--xh-table-sort-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前恒 20px，比同一表头里 16px 的勾选框方盒与列头文字都大一圈）；三颗勾选框与展开箭头在自己身上把 `--xh-icon-size` 改接到方盒的尺——勾与半选杠按方盒边长 × 0.75（与 Checkbox / Tree 勾选格同比例，comfortable 12px / compact 10.5px；此前 20px 落在 14px 的盒里比盒还大），展开箭头的 chevron 与方盒同边长并钉住 `flex: none`；作者塞进这四颗把手里的 XhIcon 从此与兜底字形同一把尺。`--xh-table-icon-size` 仍只管作者放进单元格、列头与拖拽把手里的图标（md 20px 不变）。
