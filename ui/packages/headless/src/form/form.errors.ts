// 错误表的纯运算。全部不碰 DOM、不看状态机，单独可测。
//
// 表的不变量只有一条：**在表里 = 这个字段此刻有错**。
// 所以空串与 undefined 一律不是"一条错误"，而是"把这条清掉"——
// 校验函数惯常写成 `{ email: ok ? '' : '格式不对' }`，不清掉的话空串会一直算作有错，
// 表单就再也提交不出去了。

/** 字段名 → 错误文案。只装真正有错的字段。 */
export type FormErrors = Record<string, string>

/**
 * 允许"清空"的错误表写法：校验函数的返回值与命令式的 setFieldError 都收这个形状，
 * 空串 / undefined / null 表示这条没有错误。
 */
export type FormErrorPatch = Record<string, string | undefined | null>

/** 自有属性判定。错误表是普通对象字面量，`'toString' in errors` 会被原型链骗过去。 */
function has(table: object, key: string): boolean {
  return Object.hasOwn(table, key)
}

function isMessage(value: unknown): value is string {
  return typeof value === 'string' && value !== ''
}

/**
 * 清理成规范的错误表：只留下非空字符串。
 * 校验函数的返回值、受控的 errors、defaultErrors 三条入口都要过这一道，
 * 否则"有几条错误"这件事在不同入口上会给出不同答案。
 */
export function normalizeFormErrors(raw: FormErrorPatch | undefined | null): FormErrors {
  const out: FormErrors = {}
  if (!raw)
    return out
  for (const key of Object.keys(raw)) {
    const message = raw[key]
    if (isMessage(message))
      out[key] = message
  }
  return out
}

/**
 * 按字段合并：patch 里给了文案就写上，给空的就删掉，没提到的字段原样不动。
 *
 * 逐字段校验（blur / change）全靠它：那两条路只该动用户刚碰过的那个字段，
 * 整表替换会把用户还没填到的字段全部当场标红。
 *
 * 没有任何改动时原样返回 current（同一个引用）：调用方据此可以跳过一次通知，
 * 每敲一个字符就发一遍 onErrorsChange 会让受控宿主一直重渲。
 */
export function mergeFormErrors(current: FormErrors, patch: FormErrorPatch): FormErrors {
  let changed = false
  const out: FormErrors = { ...current }
  for (const key of Object.keys(patch)) {
    const message = patch[key]
    if (isMessage(message)) {
      if (out[key] !== message) {
        out[key] = message
        changed = true
      }
      continue
    }
    if (has(out, key)) {
      delete out[key]
      changed = true
    }
  }
  return changed ? out : current
}

/** 表里的字段名，保持插入顺序。 */
export function formErrorNames(errors: FormErrors): string[] {
  return Object.keys(errors)
}

/**
 * 两张错误表逐键比。
 *
 * cell 的默认判等是 Object.is，在这里不成立：受控时每读一次都要把 prop 清理成一张新表，
 * 引用恒不相等——版本号会每读一次自增一次，onErrorsChange 也会为"其实没变"重复发。
 */
export function sameFormErrors(a: FormErrors, b: FormErrors | undefined): boolean {
  if (!b)
    return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length)
    return false
  return keys.every(key => has(b, key) && a[key] === b[key])
}

/**
 * 提交失败后焦点该落在哪个字段上：按**文档序**取第一个出错的字段。
 *
 * 判据刻意不是错误表的键序——那只反映 validate 里写 return 时的顺序，
 * 与用户在屏幕上看到的先后毫无关系。表单从上往下填，焦点就该落在最上面那个错处，
 * 否则用户会被拽到页面下方，还得自己往回找。
 *
 * domOrder 里一个都没命中时退回键序的第一条：字段容器可能压根没渲染
 * （分步表单的下一步、条件字段），此时给不出文档序，但至少得报出一个错处。
 */
export function firstFormErrorName(domOrder: readonly string[], errors: FormErrors): string | null {
  for (const name of domOrder) {
    if (has(errors, name))
      return name
  }
  return Object.keys(errors)[0] ?? null
}
