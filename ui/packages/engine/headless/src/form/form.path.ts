/**
 * 表单字段身份。字符串永远是一整个字段名；只有作者显式传数组时才表示层级路径。
 * 因此 `user.email` 与 `['user', 'email']` 从不互相解释或碰撞。
 */
export type FormPathSegment = string | number
export type FormPath = string | readonly FormPathSegment[]
export type FormPathKey = string

/** 一组可变行发生的结构变更；下标永远指向变更前的数组。 */
export type FormArrayMutation
  = | { type: 'insert', index: number }
    | { type: 'remove', index: number }
    | { type: 'move', from: number, to: number }
  /** 整份替换时按位置保留仍在范围内的子字段，截掉越界行。 */
    | { type: 'replace', length: number }

interface PathEntry<T> {
  path: readonly FormPathSegment[]
  value: T
}

/**
 * 字符串字段继续以自身为对象键，保留既有值表的可读性；数组路径绝不被 JS 隐式
 * `toString()` 后塞进 Record，而是放进这个不可枚举索引。这样 `['a', 'b']` 不会
 * 与字符串 `a,b` 碰撞，也不会让 values/errors 回调泄漏实现用的键。
 */
const PATH_ENTRIES: unique symbol = Symbol('xh.form.path-entries')

export type FormPathRecord<T> = Record<string, T> & {
  readonly [PATH_ENTRIES]?: ReadonlyMap<FormPathKey, PathEntry<T>>
}

function validArrayPath(path: readonly FormPathSegment[]): void {
  if (path.length === 0 || path.some(segment => typeof segment !== 'string' && (typeof segment !== 'number' || !Number.isFinite(segment))))
    throw new TypeError('[xh] FormPath 数组必须至少含一段有效 string 或 finite number')
}

/** 稳定且带类型标签的内部键；不要把它展示给用户。 */
export function formPathKey(path: FormPath): FormPathKey {
  if (typeof path === 'string')
    return `string:${JSON.stringify(path)}`
  validArrayPath(path)
  return `path:${JSON.stringify(path)}`
}

/** 面向文案与诊断的可读表示；它不是存储键，也不解析字符串中的点。 */
export function formPathDisplay(path: FormPath): string {
  if (typeof path === 'string')
    return path
  validArrayPath(path)
  return JSON.stringify(path)
}

/**
 * FieldArray 的第 index 行子字段路径。
 *
 * 父字段即使是字符串，也只把它作为数组路径的一个段，而不解析其中的点或方括号；
 * 因而 `user.email` 仍是一个段，不会与 `['user', 'email']` 混淆。
 */
export function formArrayItemPath(name: FormPath, index: number): readonly FormPathSegment[] {
  if (!Number.isInteger(index) || index < 0)
    throw new TypeError('[xh] FieldArray 行下标必须是非负整数')
  return [...(typeof name === 'string' ? [name] : name), index]
}

function arrayPrefix(name: FormPath): readonly FormPathSegment[] {
  return typeof name === 'string' ? [name] : name
}

function sameSegments(a: readonly FormPathSegment[], b: readonly FormPathSegment[]): boolean {
  return a.length === b.length && a.every((segment, index) => Object.is(segment, b[index]))
}

/**
 * 把一条显式数组路径按某个 FieldArray 的结构变更改写。
 *
 * 字符串字段永远不参加：它们没有可解释的下标。父字段自身也不改；只有其数组子字段
 * 的第一层数字下标会迁移。删掉的行返回 null，调用方据此删除关联状态。
 */
export function rebaseFormArrayPath(path: FormPath, name: FormPath, mutation: FormArrayMutation): FormPath | null {
  if (typeof path === 'string')
    return path
  const prefix = arrayPrefix(name)
  if (path.length <= prefix.length || !sameSegments(path.slice(0, prefix.length), prefix))
    return path
  const current = path[prefix.length]
  if (typeof current !== 'number' || !Number.isInteger(current) || current < 0)
    return path

  let next = current
  switch (mutation.type) {
    case 'insert':
      if (current >= mutation.index)
        next++
      break
    case 'remove':
      if (current === mutation.index)
        return null
      if (current > mutation.index)
        next--
      break
    case 'move':
      if (current === mutation.from)
        next = mutation.to
      else if (mutation.from < mutation.to && current > mutation.from && current <= mutation.to)
        next--
      else if (mutation.to < mutation.from && current >= mutation.to && current < mutation.from)
        next++
      break
    case 'replace':
      if (current >= mutation.length)
        return null
      break
  }
  if (next === current)
    return path
  const out = [...path]
  out[prefix.length] = next
  return out
}

function entriesOf<T>(record: FormPathRecord<T>): ReadonlyMap<FormPathKey, PathEntry<T>> {
  return record[PATH_ENTRIES] ?? new Map()
}

/** 按路径取值；字符串始终只读自己的单键。 */
export function getFormPathValue<T>(record: FormPathRecord<T> | undefined, path: FormPath): T | undefined {
  if (!record)
    return undefined
  if (typeof path === 'string')
    return record[path]
  return entriesOf(record).get(formPathKey(path))?.value
}

/** 是否明确存有这个路径（值可以恰好为 undefined）。 */
export function hasFormPathValue<T>(record: FormPathRecord<T> | undefined, path: FormPath): boolean {
  if (!record)
    return false
  return typeof path === 'string'
    ? Object.hasOwn(record, path)
    : entriesOf(record).has(formPathKey(path))
}

/**
 * 结构共享地写一条路径。数组路径只进不可枚举 Map，绝不作为 Record 的隐式数组键。
 */
export function setFormPathValue<T>(record: FormPathRecord<T>, path: FormPath, value: T): FormPathRecord<T> {
  if (typeof path === 'string') {
    if (Object.hasOwn(record, path) && Object.is(record[path], value))
      return record
    const out = cloneFormPathRecord(record)
    out[path] = value
    return out
  }
  const key = formPathKey(path)
  const current = entriesOf(record).get(key)
  if (current && Object.is(current.value, value))
    return record
  const next = new Map(entriesOf(record))
  next.set(key, { path: [...path], value })
  const out = { ...record } as FormPathRecord<T>
  Object.defineProperty(out, PATH_ENTRIES, { value: next })
  return out
}

/** 删除一条路径；主要给逐字段错误合并使用。 */
export function deleteFormPathValue<T>(record: FormPathRecord<T>, path: FormPath): FormPathRecord<T> {
  if (typeof path === 'string') {
    if (!Object.hasOwn(record, path))
      return record
    const out = cloneFormPathRecord(record)
    delete out[path]
    return out
  }
  const key = formPathKey(path)
  if (!entriesOf(record).has(key))
    return record
  const next = new Map(entriesOf(record))
  next.delete(key)
  const out = { ...record } as FormPathRecord<T>
  Object.defineProperty(out, PATH_ENTRIES, { value: next })
  return out
}

/** 所有路径，先保留字符串对象键的插入顺序，再保留数组路径的显式插入顺序。 */
export function formPathEntries<T>(record: FormPathRecord<T> | undefined): Array<readonly [FormPath, T]> {
  if (!record)
    return []
  const out: Array<readonly [FormPath, T]> = Object.keys(record).map(key => [key, record[key]!] as const)
  for (const { path, value } of entriesOf(record).values())
    out.push([path, value])
  return out
}

/** 创建带数组路径的一张表；字符串项仍可直接读取。 */
export function createFormPathRecord<T>(entries: Iterable<readonly [FormPath, T]>): FormPathRecord<T> {
  let out = {} as FormPathRecord<T>
  for (const [path, value] of entries)
    out = setFormPathValue(out, path, value)
  return out
}

/** 浅拷贝时保留不可枚举的数组路径索引。 */
export function cloneFormPathRecord<T>(record: FormPathRecord<T> | undefined): FormPathRecord<T> {
  const out = { ...(record ?? {}) } as FormPathRecord<T>
  const entries = entriesOf(record ?? out)
  if (entries.size)
    Object.defineProperty(out, PATH_ENTRIES, { value: new Map(entries) })
  return out
}

/**
 * 迁移一张路径表中某个 FieldArray 的子字段。没有任何命中的字段时保留原引用，
 * 以免受控宿主收到无意义的更新。
 */
export function rebaseFormPathRecord<T>(
  record: FormPathRecord<T>,
  name: FormPath,
  mutation: FormArrayMutation,
): FormPathRecord<T> {
  let changed = false
  const next: Array<readonly [FormPath, T]> = []
  for (const [path, value] of formPathEntries(record)) {
    const mapped = rebaseFormArrayPath(path, name, mutation)
    if (mapped === null) {
      changed = true
      continue
    }
    if (formPathKey(mapped) !== formPathKey(path))
      changed = true
    next.push([mapped, value])
  }
  return changed ? createFormPathRecord(next) : record
}

export function sameFormPathRecords<T>(a: FormPathRecord<T>, b: FormPathRecord<T> | undefined): boolean {
  if (!b)
    return false
  const aKeys = Object.keys(a)
  if (aKeys.length !== Object.keys(b).length || !aKeys.every(key => Object.hasOwn(b, key) && Object.is(a[key], b[key])))
    return false
  const aEntries = entriesOf(a)
  const bEntries = entriesOf(b)
  if (aEntries.size !== bEntries.size)
    return false
  for (const [key, entry] of aEntries) {
    const other = bEntries.get(key)
    if (!other || !Object.is(entry.value, other.value))
      return false
  }
  return true
}
