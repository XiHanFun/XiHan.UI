/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 作者写的正则：模板只能把正则存成源码与标志两个字符串，这里统一限定标志与长度、编译，并可包成整串匹配。

/** 编译失败的原因：标志不在允许范围或重复、源码超出长度上限、源码不是合法的正则。 */
export type FormPatternIssueCode = 'invalid-flags' | 'too-long' | 'invalid-pattern'

/** 编译选项。 */
export interface CompileFormPatternOptions {
  /** 标志，缺省无。 */
  readonly flags?: string
  /** 允许出现的标志，缺省 `imsu`；`g` 与 `y` 带状态，不在缺省范围内。 */
  readonly allowedFlags?: string
  /** 是否整串匹配：编译成 `^(?:源码)$`。缺省 `false`。 */
  readonly fullMatch?: boolean
  /** 源码长度上限（UTF-16 码元），缺省 1000。 */
  readonly maxLength?: number
}

/** 编译结果。 */
export type CompiledFormPattern
  = | { readonly ok: true, readonly regex: RegExp }
    | { readonly ok: false, readonly code: FormPatternIssueCode }

/**
 * 编译作者写的正则源码，不抛异常。只检查标志、长度与语法，不判断回溯开销，
 * 来自不受信方的正则仍应在服务端限时执行。
 */
export function compileFormPattern(source: string, options: CompileFormPatternOptions = {}): CompiledFormPattern {
  const flags = options.flags ?? ''
  const allowed = options.allowedFlags ?? 'imsu'
  if (typeof flags !== 'string' || [...flags].some(flag => !allowed.includes(flag)) || new Set(flags).size !== flags.length)
    return { ok: false, code: 'invalid-flags' }
  if (typeof source !== 'string')
    return { ok: false, code: 'invalid-pattern' }
  if (source.length > (options.maxLength ?? 1000))
    return { ok: false, code: 'too-long' }
  let regex: RegExp
  try {
    regex = new RegExp(source, flags)
  }
  catch {
    return { ok: false, code: 'invalid-pattern' }
  }
  return { ok: true, regex: options.fullMatch === true ? new RegExp(`^(?:${source})$`, flags) : regex }
}
