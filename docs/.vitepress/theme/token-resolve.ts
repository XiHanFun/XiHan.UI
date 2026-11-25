// 设计册的令牌取值：从构建期拆出的各环境档里取一个令牌的值，按 CSS 的 var() 规则展开。
// 展开规则与 CLI 离线文档共用令牌包里的同一份（ui/packages/design/tokens/build/token-modes.mjs）。
export { createTokenResolver } from "../../../ui/packages/design/tokens/build/token-modes.mjs";
export type { TokenEnv } from "../../../ui/packages/design/tokens/build/token-modes.mjs";
