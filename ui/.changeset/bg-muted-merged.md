---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
---

**破坏性** 删掉 `--xh-bg-muted` 与 `--xh-bg-muted-opaque`，并回 `--xh-bg-subtle` / `--xh-bg-subtle-opaque`。两支在浅色、深色档都与淡底同值（neutral 100 / 800），却在皮肤里一半当禁用面、一半当头部带与图标底，同一语义两个名字。库内的十一处用法已换过去，画面不变。

| 删掉的令牌 | 改写成 |
| --- | --- |
| `--xh-bg-muted` | `--xh-bg-subtle` |
| `--xh-bg-muted-opaque` | `--xh-bg-subtle-opaque` |
