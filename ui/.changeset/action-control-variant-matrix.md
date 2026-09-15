---
'@xihan-ui/styles': minor
---

**Action Control 家族配方增加形态颜色矩阵、承载面阶梯与行级 profile。** 配方 JSON 升到 version 2：
solid / subtle / outline / ghost 四种形态 × rest / hover / pressed / focus-visible / disabled / loading
六态的底色、前景、描边由 `data-xh-action-variant` 在家族层统一给出，无属性时等价 subtle。既有消费者
（button、toggle、clipboard、download-trigger、text-field、color-field）在没有 `data-tone` 的上下文里
零视觉变化；家族缺省从裸 `--xh-bg-subtle` / `--xh-fg-default` 改为 `--xh-_tone-subtle` / `--xh-_tone-fg`
链之后，消费者皮肤没有设满的桥接槽在写了 `data-tone` 时会从中性面改取语气色：button 的 subtle /
outline / ghost 形态在 focus-visible 与 loading 态的底改为语气 12% 淡底、前景改为语气前景；text-field /
color-field 传了 `tone` 时清空钮 pressed 态的前景、focus-visible 态的底与前景同样改为语气色。这几档
随各消费者迁入配方形态矩阵的提交收口。ghost / outline 的悬停与按下面改按承载面取阶梯——画布承载
100 → 200，容器可用 `--xh-action-host-bg-hover` / `--xh-action-host-bg-pressed` 下发淡底承载的
200 → 300；深色主题品牌实心面上收进家族；新增 `row` 与 `disclosure-trigger` 两个铺满宽度、只换面不缩放
的 profile（新增桥接槽 `--xh-action-padding-block`）。生成物 `family/action-control.css` 与
`index.unlayered.css` 同步再生成。
