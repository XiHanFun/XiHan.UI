---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

密码框（PasswordInput）放进字段时，输入框自己的描述链（大写锁定提示）不再顶掉字段的说明与错误文案：两段拼在一起，字段的在前，大写锁定打开时三条都念得到。headless 新增 `withFieldDescription(props, describedBy)`，三端合并字段接线时都经它拼接描述链，重复的 id 只留一份。
