// 构建期读令牌产物 tokens.css，按环境档拆出各档改写的取值：深色、紧凑、减弱动效、高对比。
// 令牌包的 JS 入口只导出缺省档（浅色、comfortable、不减弱），设计册要并排列出各档时从这里取。
// 拆分逻辑与 CLI 离线文档共用令牌包里的同一份（ui/packages/design/tokens/build/token-modes.mjs）。
import type { TokenData } from "../../../ui/packages/design/tokens/build/token-modes.mjs";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { collectTokenData } from "../../../ui/packages/design/tokens/build/token-modes.mjs";

export type { TokenData, TokenMode } from "../../../ui/packages/design/tokens/build/token-modes.mjs";

const require = createRequire(import.meta.url);
const TOKENS_CSS = require.resolve("@xihan-ui/tokens/tokens.css");

export default {
  watch: [TOKENS_CSS],
  load(): TokenData {
    return collectTokenData(readFileSync(TOKENS_CSS, "utf8"));
  },
};

declare const data: TokenData;
export { data };
