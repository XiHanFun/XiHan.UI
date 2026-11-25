// 构建期读令牌产物 tokens.css，按环境档拆出各档改写的取值：深色、紧凑、减弱动效、高对比。
// 令牌包的 JS 入口只导出缺省档（浅色、comfortable、不减弱），设计册要并排列出各档时从这里取。
// 只认环境档自己的属性选择器（如 :where([data-theme='dark'])），@media 里与之同值的那一份不重复取。
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

export type TokenMode = "dark" | "compact" | "reduce" | "more";

export type TokenModes = Record<TokenMode, Record<string, string>>;

const MODE_SELECTORS: Record<TokenMode, string> = {
  dark: ":where([data-theme='dark'])",
  compact: ":where([data-density='compact'])",
  reduce: ":where([data-motion='reduce'])",
  more: ":where([data-contrast='more'])",
};

interface Block {
  selectors: string[];
  /** 包着这条规则的 @media / @supports；@layer 不算 */
  conditional: boolean;
  decls: Record<string, string>;
}

/** 按顶层分隔符切开，括号里的不切。 */
function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "(") {
      depth++;
    }
    else if (char === ")") {
      depth--;
    }
    else if (char === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map(part => part.trim()).filter(Boolean);
}

/** 只解析令牌产物用到的那部分 CSS：规则块、@layer / @media / @supports 嵌套与自定义属性声明。 */
export function parseBlocks(css: string): Block[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: Block[] = [];
  const stack: { prelude: string; body: string }[] = [];
  let buffer = "";
  for (const char of text) {
    if (char === "{") {
      stack.push({ prelude: buffer.trim(), body: "" });
      buffer = "";
    }
    else if (char === "}") {
      const frame = stack.pop();
      const body = (frame?.body ?? "") + buffer;
      buffer = "";
      if (!frame || frame.prelude.startsWith("@"))
        continue;
      const decls: Record<string, string> = {};
      for (const decl of splitTopLevel(body, ";")) {
        const colon = decl.indexOf(":");
        if (colon > 0 && decl.startsWith("--"))
          decls[decl.slice(0, colon).trim()] = decl.slice(colon + 1).trim().replace(/\s+/g, " ");
      }
      blocks.push({
        selectors: splitTopLevel(frame.prelude, ","),
        conditional: stack.some(outer => /^@(?:media|supports)\b/.test(outer.prelude)),
        decls,
      });
    }
    else {
      buffer += char;
      // 分号收口一条声明（或顶层的 @layer 语句），下一个块的选择器从这之后算起
      if (char === ";") {
        if (stack.length)
          stack[stack.length - 1].body += buffer;
        buffer = "";
      }
    }
  }
  return blocks;
}

export interface TokenData {
  /** 缺省档：:where(:root) 上的全部声明，含高对比开关这类内部变量 */
  base: Record<string, string>;
  modes: TokenModes;
}

function collect(blocks: Block[], selector: string): Record<string, string> {
  const decls: Record<string, string> = {};
  for (const block of blocks) {
    if (block.selectors.includes(selector))
      Object.assign(decls, block.decls);
  }
  return decls;
}

export function collectTokenData(css: string): TokenData {
  const blocks = parseBlocks(css).filter(block => !block.conditional);
  const modes = {} as TokenModes;
  for (const [mode, selector] of Object.entries(MODE_SELECTORS) as [TokenMode, string][])
    modes[mode] = collect(blocks, selector);
  return { base: collect(blocks, ":where(:root)"), modes };
}

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
