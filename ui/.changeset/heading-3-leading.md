---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
---

**改进** 区块与面板标题（heading-3）的行高收成一支令牌：新增 `--xh-text-heading-3-leading`（1.5，16px 一行的行框 24px）。Dialog、Drawer、Notification、Card、Alert、Fieldset 组标题、Descriptions、Tour 的标题都取它，此前分别是 1.25、1.5、1.625 与不写（继承宿主）。

- Card、Alert、Fieldset 组标题的行框从 20px 变成 24px，Descriptions 的从 26px 变成 24px，Tour 不再随宿主的行高走。
- Card 头部条的块向内衬缺省从 8px 收到 6px：条高仍由最小高给（46px，紧凑 40px），一行标题照旧竖向居中，紧凑档不会被更高的行框撑过 40px。
- `--xh-card-title-leading`、`--xh-alert-title-leading`、`--xh-notification-title-leading` 照旧可改。
