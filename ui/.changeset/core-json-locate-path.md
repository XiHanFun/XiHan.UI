---
'@xihan-ui/core': minor
---

`@xihan-ui/core/json` 新增 `locateJsonPath(text, path)`：在 JSON 文本里找路径指向的值，返回它在文本里的起止下标与起点的行号、列号，便于编辑框把光标移到某条问题所在的位置。路径写法同 `getJsonAt`，空路径指整个值；文本不是合法 JSON 或路径走不通时返回 `undefined`；对象里键重复时取最后一个，与 `JSON.parse` 一致。
