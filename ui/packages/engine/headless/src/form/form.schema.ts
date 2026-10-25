/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表单接 Standard Schema（zod、valibot、arktype 的 schema 都带着它）：只依赖接口，不引入任何运行时。
// 校验时把值表整理成 schema 认得的嵌套对象交给它，它报的问题按路径折成错误表，再与作者的 validate 并成一份；
// 机器归一 props 时把这一份装成 validate，提交、逐字段、validateAll 几条路都不必另接。

import type { FormErrorPatch } from './form.errors'
import type { FormPath, FormPathSegment } from './form.path'
import type { FormStandardIssue, FormStandardResult, FormStandardSchema, FormValues } from './form.types'
import { formPathEntries, getFormPathValue, setFormPathValue } from './form.path'

/** 往一个嵌套对象里按路径写值：沿途的容器都复制一份再改，缺的按下一段是不是数字补数组或对象。 */
function writeIn(target: unknown, path: readonly FormPathSegment[], value: unknown): unknown {
  if (path.length === 0)
    return value
  const [head, ...rest] = path as [FormPathSegment, ...FormPathSegment[]]
  const base = target != null && typeof target === 'object'
    ? (Array.isArray(target) ? [...target] : { ...target as Record<string, unknown> })
    : (typeof head === 'number' ? [] : {})
  const container = base as Record<string | number, unknown>
  container[head] = writeIn(container[head], rest, value)
  return base
}

/**
 * 交给 schema 的值：字符串字段名照旧是对象上的键，数组路径（数组行、嵌套对象里的字段）按段写进嵌套结构，
 * 后写的盖过先写的。值表本身不动。
 */
export function formSchemaInput(values: FormValues): Record<string, unknown> {
  let out: Record<string, unknown> = { ...values }
  for (const [path, value] of formPathEntries(values)) {
    if (typeof path !== 'string')
      out = writeIn(out, path, value) as Record<string, unknown>
  }
  return out
}

/** 一个问题指向的字段：一段的字符串路径即字段名，多段即数组路径；没有路径（或认不出）的记在空字段名下。 */
export function formIssuePath(issue: FormStandardIssue): FormPath {
  const segments: FormPathSegment[] = []
  for (const raw of issue.path ?? []) {
    const key = typeof raw === 'object' && raw !== null ? raw.key : raw
    if (typeof key === 'string' || (typeof key === 'number' && Number.isFinite(key)))
      segments.push(key)
    else
      return ''
  }
  if (segments.length === 0)
    return ''
  return segments.length === 1 && typeof segments[0] === 'string' ? segments[0] : segments
}

/** schema 的问题折成错误表：同一个字段报了几条只留第一条。 */
export function formSchemaErrors(result: FormStandardResult<unknown>): FormErrorPatch {
  let errors: FormErrorPatch = {}
  for (const issue of result.issues ?? []) {
    const path = formIssuePath(issue)
    if (!getFormPathValue(errors, path))
      errors = setFormPathValue(errors, path, issue.message)
  }
  return errors
}

type FormValidate = (values: FormValues) => FormErrorPatch | Promise<FormErrorPatch>

/** 两份错误表并成一份：后一份（作者的 validate）有文案的字段盖过前一份（schema）。 */
function overlay(base: FormErrorPatch, top: FormErrorPatch): FormErrorPatch {
  let out = base
  for (const [path, message] of formPathEntries(top)) {
    if (message)
      out = setFormPathValue(out, path, message)
  }
  return out
}

/** schema 与作者的 validate 并成一个 validate：两边都同步时同步交回，有一边异步就等两边都落定。 */
export function formValidateWithSchema(schema: FormStandardSchema, validate: FormValidate | undefined): FormValidate {
  return (values) => {
    const checked = schema['~standard'].validate(formSchemaInput(values))
    const own = validate?.(values)
    if (checked instanceof Promise || own instanceof Promise)
      return Promise.all([checked, own]).then(([result, patch]) => overlay(formSchemaErrors(result), patch ?? {}))
    return overlay(formSchemaErrors(checked), own ?? {})
  }
}
