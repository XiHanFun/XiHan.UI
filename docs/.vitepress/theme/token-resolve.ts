// 设计册的令牌取值：从构建期拆出的各环境档里取一个令牌的值，按 CSS 的 var() 规则展开。
// 内部变量（--xh-_ 开头，如高对比的空格开关）总是展开，读者看到的是这一档真正生效的那条写法；
// resolve 打开时连公开的别名也一路展开到字面量（150ms、4px），关着时保留 var(--xh-…) 写法。
import type { TokenData, TokenMode } from "./token-modes.data";

export type TokenEnv = "default" | TokenMode;

/** 找出 text 里从 start 起那个 var( 的参数区间：名字与回退值（逗号之后的全部）。 */
function readVar(text: string, start: number): { end: number; name: string; fallback?: string } | null {
  let depth = 0;
  let comma = -1;
  for (let i = start + 4; i < text.length; i++) {
    const char = text[i];
    if (char === "(") {
      depth++;
    }
    else if (char === ")") {
      if (depth === 0) {
        const inner = text.slice(start + 4, i);
        const split = comma < 0 ? inner.length : comma - (start + 4);
        return {
          end: i + 1,
          name: inner.slice(0, split).trim(),
          fallback: comma < 0 ? undefined : inner.slice(split + 1).trim(),
        };
      }
      depth--;
    }
    else if (char === "," && depth === 0 && comma < 0) {
      comma = i;
    }
  }
  return null;
}

export function createTokenResolver(data: TokenData): {
  raw: (name: string, env: TokenEnv) => string | undefined;
  value: (name: string, env: TokenEnv, resolve: boolean) => string | undefined;
} {
  const raw = (name: string, env: TokenEnv): string | undefined =>
    (env === "default" ? undefined : data.modes[env][name]) ?? data.base[name];

  function expand(text: string, env: TokenEnv, resolve: boolean, depth: number): string {
    if (depth > 32 || !text.includes("var("))
      return text;
    let out = "";
    let i = 0;
    while (i < text.length) {
      const at = text.indexOf("var(", i);
      if (at < 0) {
        out += text.slice(i);
        break;
      }
      const ref = readVar(text, at);
      if (!ref) {
        out += text.slice(i);
        break;
      }
      out += text.slice(i, at);
      const internal = ref.name.startsWith("--xh-_");
      if (internal || resolve) {
        const own = raw(ref.name, env);
        // 未定义或 initial：取回退值；空串：替换成空（空格开关的「关」）
        const picked = own === undefined || own.trim() === "initial" ? ref.fallback ?? "" : own;
        out += expand(picked, env, resolve, depth + 1);
      }
      else {
        out += text.slice(at, ref.end);
      }
      i = ref.end;
    }
    return out.replace(/\s+/g, " ").trim();
  }

  return {
    raw,
    value(name, env, resolve) {
      const own = raw(name, env);
      return own === undefined ? undefined : expand(own, env, resolve, 0);
    },
  };
}
