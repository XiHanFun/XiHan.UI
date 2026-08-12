// 声明式校验规则的纯运算：不碰 DOM、不看状态机。
// 语义：非 required 规则对空值放行（空值只由 required 拦）；一个字段按规则声明序首败即停；
// 文案取 rule.message → 表单 validateMessages 模板 → 内置模板，模板里 {name}/{min}/{max} 现场代入。
import type { FormErrorPatch, FormErrors } from './form.errors'
import type { FormValues } from './form.types'
import { normalizeFormErrors } from './form.errors'

/** 内置类型检查档位。 */
export type FormRuleType = 'string' | 'number' | 'integer' | 'email' | 'url' | 'array'

/** 一条声明式规则；各检查项都可缺省，validator 支持异步。 */
export interface FormRule {
  /** 必填：空值（undefined / null / 空串 / 空数组）拦下。 */
  required?: boolean
  /** 类型检查档位；数值/整数会把字符串数字也认作数。 */
  type?: FormRuleType
  /** 下限：字符串/数组比长度，数值比大小。 */
  min?: number
  /** 上限：语义同 min。 */
  max?: number
  /** 正则检查；只对字符串值生效。 */
  pattern?: RegExp
  /**
   * 自定义检查：返回错误文案即失败，返回空即通过；允许返回 Promise（远程校验）。
   * 第二参是整表值，跨字段规则从这里读。
   */
  validator?: (value: unknown, values: FormValues) => string | undefined | null | Promise<string | undefined | null>
  /** 本条规则的文案，赢过模板。 */
  message?: string
}

/** 字段名 → 一条或一组规则。 */
export type FormRules = Record<string, FormRule | FormRule[]>

/** 文案模板，{name}/{min}/{max} 现场代入；缺省用内置英文模板。 */
export interface FormValidateMessages {
  required?: string
  type?: Partial<Record<FormRuleType, string>>
  /** 字符串/数组的长度下限模板。 */
  minLength?: string
  maxLength?: string
  /** 数值的大小界限模板。 */
  minNumber?: string
  maxNumber?: string
  pattern?: string
}

const DEFAULT_MESSAGES: Required<Omit<FormValidateMessages, 'type'>> & { type: Record<FormRuleType, string> } = {
  required: '{name} is required',
  type: {
    string: '{name} must be a string',
    number: '{name} must be a number',
    integer: '{name} must be an integer',
    email: '{name} is not a valid email',
    url: '{name} is not a valid URL',
    array: '{name} must be an array',
  },
  minLength: '{name} must be at least {min} characters',
  maxLength: '{name} cannot exceed {max} characters',
  minNumber: '{name} must be at least {min}',
  maxNumber: '{name} cannot exceed {max}',
  pattern: '{name} does not match the required pattern',
}

/** 这组规则里有没有 required：字段的必填标记（aria-required 与星号）从这里推。 */
export function hasRequiredRule(rules: FormRule | FormRule[] | undefined): boolean {
  if (!rules)
    return false
  return (Array.isArray(rules) ? rules : [rules]).some(rule => !!rule.required)
}

/** 空值判定：required 拦的就是这些。 */
export function isEmptyFormValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '')
    return true
  return Array.isArray(value) && value.length === 0
}

function interpolate(template: string, slots: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const hit = slots[key]
    return hit === undefined ? whole : String(hit)
  })
}

const EMAIL_RE = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

function numeric(value: unknown): number | null {
  if (typeof value === 'number')
    return Number.isNaN(value) ? null : value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

function typeError(type: FormRuleType, value: unknown): boolean {
  switch (type) {
    case 'string': return typeof value !== 'string'
    case 'number': return numeric(value) === null
    case 'integer': {
      const n = numeric(value)
      return n === null || !Number.isInteger(n)
    }
    case 'email': return typeof value !== 'string' || !EMAIL_RE.test(value)
    case 'url': {
      if (typeof value !== 'string')
        return true
      try {
        void new URL(value)
        return false
      }
      catch {
        return true
      }
    }
    case 'array': return !Array.isArray(value)
  }
}

/**
 * min/max 的度量：规则声明了数值类型就按数值比（字符串数字也认），
 * 其余数值直接比大小、字符串与数组比长度；量不出来的不拦。
 */
function measure(value: unknown, type: FormRuleType | undefined): { size: number, byLength: boolean } | null {
  if (type === 'number' || type === 'integer') {
    const n = numeric(value)
    return n === null ? null : { size: n, byLength: false }
  }
  const n = numeric(value)
  if (typeof value !== 'string' && n !== null)
    return { size: n, byLength: false }
  if (typeof value === 'string')
    return { size: value.length, byLength: true }
  if (Array.isArray(value))
    return { size: value.length, byLength: true }
  return null
}

/**
 * 跑一个字段的一组规则，首败即停。
 * 全同步时同步返回，任何一条 validator 给了 Promise 才转异步——调用方据此保住同步捷径。
 */
export function runFieldRules(
  rules: FormRule | FormRule[],
  value: unknown,
  values: FormValues,
  name: string,
  messages: FormValidateMessages | undefined,
): string | undefined | Promise<string | undefined> {
  const list = Array.isArray(rules) ? rules : [rules]

  const messageOf = (rule: FormRule, kind: keyof FormValidateMessages | 'type', slots: Record<string, string | number | undefined>, type?: FormRuleType): string => {
    if (rule.message)
      return rule.message
    if (kind === 'type') {
      const t = type!
      return interpolate(messages?.type?.[t] ?? DEFAULT_MESSAGES.type[t], slots)
    }
    const template = (messages?.[kind] as string | undefined) ?? DEFAULT_MESSAGES[kind]
    return interpolate(template, slots)
  }

  const checkSync = (rule: FormRule): string | undefined | 'validator' => {
    const slots = { name, min: rule.min, max: rule.max }
    if (rule.required && isEmptyFormValue(value))
      return messageOf(rule, 'required', slots)
    // 非必填规则对空值放行：空不空归 required 管
    if (isEmptyFormValue(value))
      return rule.validator ? 'validator' : undefined
    if (rule.type && typeError(rule.type, value))
      return messageOf(rule, 'type', slots, rule.type)
    if (rule.min !== undefined || rule.max !== undefined) {
      const m = measure(value, rule.type)
      if (m) {
        if (rule.min !== undefined && m.size < rule.min)
          return messageOf(rule, m.byLength ? 'minLength' : 'minNumber', slots)
        if (rule.max !== undefined && m.size > rule.max)
          return messageOf(rule, m.byLength ? 'maxLength' : 'maxNumber', slots)
      }
    }
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value))
      return messageOf(rule, 'pattern', slots)
    return rule.validator ? 'validator' : undefined
  }

  /** 从第 i 条起继续跑；遇到异步 validator 才把余下的挂进 Promise 链。 */
  const runFrom = (i: number): string | undefined | Promise<string | undefined> => {
    for (let at = i; at < list.length; at++) {
      const rule = list[at]!
      const verdict = checkSync(rule)
      if (verdict === undefined)
        continue
      if (verdict !== 'validator')
        return verdict
      const out = rule.validator!(value, values)
      if (out instanceof Promise) {
        return out.then((message) => {
          if (typeof message === 'string' && message !== '')
            return rule.message ?? message
          return runFrom(at + 1) as string | undefined | Promise<string | undefined>
        })
      }
      if (typeof out === 'string' && out !== '')
        return rule.message ?? out
    }
    return undefined
  }

  return runFrom(0)
}

/**
 * 整表跑：声明式规则逐字段跑完，再并入 validate 函数的结果（同字段两边都报错时规则赢）。
 * 全同步时同步返回 FormErrors；任何一边转异步才返回 Promise。
 */
export function runFormRules(
  rules: FormRules | undefined,
  validate: ((values: FormValues) => FormErrorPatch | Promise<FormErrorPatch>) | undefined,
  values: FormValues,
  messages: FormValidateMessages | undefined,
): FormErrors | Promise<FormErrors> {
  const ruleOutcomes: Record<string, string | undefined> = {}
  const pending: Array<Promise<void>> = []
  for (const name of Object.keys(rules ?? {})) {
    const out = runFieldRules(rules![name]!, values[name], values, name, messages)
    if (out instanceof Promise)
      pending.push(out.then((message) => { ruleOutcomes[name] = message }))
    else
      ruleOutcomes[name] = out
  }

  const custom = validate?.(values)

  const merge = (customErrors: FormErrorPatch | undefined): FormErrors => {
    const out = normalizeFormErrors(customErrors)
    for (const name of Object.keys(ruleOutcomes)) {
      const message = ruleOutcomes[name]
      if (message !== undefined)
        out[name] = message
      // 规则说没错但 validate 报了错：保留 validate 的那条（跨字段规则常写在那儿）
    }
    return out
  }

  if (pending.length === 0 && !(custom instanceof Promise))
    return merge(custom)
  return Promise.all([Promise.all(pending), Promise.resolve(custom)]).then(([, customErrors]) => merge(customErrors))
}
