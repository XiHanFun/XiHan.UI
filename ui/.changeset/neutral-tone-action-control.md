---
'@xihan-ui/styles': major
---

**调整** 按钮一类的动作控件（Button、Toggle、ToggleGroup 条目、Pagination 条目、Clipboard、FloatButton 等投影了 Action Control 配方的部件）上，`tone="neutral"` 与不写等价：描边、淡底、幽灵形态不再另铺 neutral 淡底、不再换深色描边，就是缺省的中性面，同一个次要动作只有一副长相。语气写在组类的根上、由条目继承时同样等价；条目自己另写的语气照常生效。实心形态（如 `variant="solid" tone="neutral"` 的 Button）仍是中性那一族的实心底。Tag、Alert、Badge 等不是动作控件的语气面，neutral 照旧取 neutral 淡底。
