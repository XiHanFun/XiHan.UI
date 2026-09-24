#!/usr/bin/env node
// 门禁：Vue 运行时 props 只在 Boolean 参与类型转换时保留 default: undefined。
//
// Vue 对 String/Number/Object/Array/Function 等普通类型本就以 undefined 表达缺席；重复写
// default 会把 `default: void 0` 送进每个组件的发布产物。Boolean 不同：缺省时 Vue 会转成
// false，显式 undefined 是维持三态作者合同的必要声明，因此必须保留。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import process from 'node:process'
import ts from 'typescript'

const ROOT = 'packages/adapters/vue/src/components'

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node))
    return node.text
  return null
}

function containsBooleanType(node) {
  if (ts.isIdentifier(node) && node.text === 'Boolean')
    return true
  let found = false
  ts.forEachChild(node, (child) => {
    if (!found && containsBooleanType(child))
      found = true
  })
  return found
}

function unwrap(node) {
  let current = node
  while (ts.isAsExpression(current)
    || ts.isSatisfiesExpression(current)
    || ts.isParenthesizedExpression(current)
    || ts.isNonNullExpression(current)) {
    current = current.expression
  }
  return current
}

function redundantDefaults(source, file) {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const bindings = new Map()
  const found = []
  const unresolved = []
  const seenObjects = new Set()

  const collectBindings = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer)
      bindings.set(node.name.text, node.initializer)
    ts.forEachChild(node, collectBindings)
  }
  collectBindings(sf)

  const resolveObject = (expression, label) => {
    const value = unwrap(expression)
    if (ts.isObjectLiteralExpression(value))
      return value
    if (ts.isIdentifier(value) && bindings.has(value.text))
      return resolveObject(bindings.get(value.text), label)
    const at = sf.getLineAndCharacterOfPosition(value.getStart(sf))
    unresolved.push(`${label}@${at.line + 1}:${at.character + 1}`)
    return null
  }

  const inspectOption = (option) => {
    let typeProperty
    let defaultProperty
    for (const property of option.properties) {
      if (!ts.isPropertyAssignment(property))
        continue
      const name = propertyName(property.name)
      if (name === 'type') {
        typeProperty = property
      }
      else if (name === 'default'
        && ts.isIdentifier(property.initializer)
        && property.initializer.text === 'undefined') {
        defaultProperty = property
      }
    }
    if (!typeProperty || !defaultProperty || containsBooleanType(typeProperty.initializer))
      return
    const at = sf.getLineAndCharacterOfPosition(defaultProperty.getStart(sf))
    const properties = [...option.properties]
    const index = properties.indexOf(defaultProperty)
    const previous = properties[index - 1]
    const next = properties[index + 1]
    found.push({
      line: at.line + 1,
      column: at.character + 1,
      start: previous ? previous.end : defaultProperty.getStart(sf),
      end: previous ? defaultProperty.end : (next?.getStart(sf) ?? defaultProperty.end),
    })
  }

  const inspectProps = (props) => {
    if (seenObjects.has(props))
      return
    seenObjects.add(props)
    for (const property of props.properties) {
      if (ts.isSpreadAssignment(property)) {
        const spread = resolveObject(property.expression, 'props spread')
        if (spread)
          inspectProps(spread)
        continue
      }
      if (!ts.isPropertyAssignment(property))
        continue
      const value = unwrap(property.initializer)
      if (ts.isObjectLiteralExpression(value)) {
        inspectOption(value)
      }
      else if (ts.isIdentifier(value) && bindings.has(value.text)) {
        const option = resolveObject(value, `prop ${propertyName(property.name) ?? '<computed>'}`)
        if (option)
          inspectOption(option)
      }
      // String / Boolean / [String, Boolean] 等构造器简写没有 default，无需展开。
      else if (!(ts.isIdentifier(value) || ts.isArrayLiteralExpression(value))) {
        const at = sf.getLineAndCharacterOfPosition(value.getStart(sf))
        unresolved.push(`prop ${propertyName(property.name) ?? '<computed>'}@${at.line + 1}:${at.character + 1}`)
      }
    }
  }

  const visit = (node) => {
    if (ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === 'defineComponent'
      && node.arguments[0]) {
      const options = resolveObject(node.arguments[0], 'defineComponent options')
      const propsProperty = options?.properties.find(property =>
        ts.isPropertyAssignment(property) && propertyName(property.name) === 'props')
      if (propsProperty && ts.isPropertyAssignment(propsProperty)) {
        const value = unwrap(propsProperty.initializer)
        if (ts.isArrayLiteralExpression(value)) {
          // 字符串数组声明没有运行时 default。
        }
        else {
          const props = resolveObject(value, 'defineComponent props')
          if (props)
            inspectProps(props)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return { found, unresolved }
}

async function sourceFiles(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await sourceFiles(path))
    else if (entry.isFile() && entry.name.endsWith('.ts'))
      out.push(path)
  }
  return out
}

function removeRedundantDefaults(source, file) {
  const { found, unresolved } = redundantDefaults(source, file)
  if (unresolved.length)
    throw new Error(`${file} 存在不可解析的 props 形态：${unresolved.join(', ')}`)
  let next = source
  for (const at of [...found].sort((a, b) => b.start - a.start))
    next = next.slice(0, at.start) + next.slice(at.end)
  return { source: next, count: found.length }
}

function rewritePolicyComments(source) {
  return source
    .replace(/\/\/ 全部 default: undefined，缺省值由([^\n]+)/g, '// 缺省值由$1；普通类型省略 default，Boolean 显式保留 undefined')
    .replace(/\/\/ 一律 default: undefined，缺省值由([^\n]+)/g, '// 缺省值由$1；普通类型省略 default，Boolean 显式保留 undefined')
    .replace(/，这里一律 default: undefined/g, '；普通类型省略 default，Boolean 显式保留 undefined')
    .replace(/prop 一律 default: undefined/g, 'prop：普通类型省略 default，Boolean 显式保留 undefined')
    .replace(/default: undefined 表示非受控/g, '缺席值 undefined 表示非受控')
}

function selfTest() {
  const sample = `
    const unrelated = { type: String, default: undefined }
    const shared = {
      text: { type: String, default: undefined },
    }
    defineComponent({ props: {
      ...shared,
      count: {
        type: Number as PropType<number>,
        default: undefined,
      },
      triState: { type: Boolean, default: undefined },
      mixed: { type: [String, Boolean], default: undefined },
    } })
  `
  const result = redundantDefaults(sample, 'fixture.ts')
  if (result.unresolved.length || result.found.length !== 2)
    throw new Error(`AST 自测失败：${JSON.stringify(result)}`)
  const fixed = removeRedundantDefaults(sample, 'fixture.ts').source
  if ((fixed.match(/default:\s*undefined/g) ?? []).length !== 3
    || fixed.includes('text: { type: String, default: undefined }')) {
    throw new Error(`修复自测失败：\n${fixed}`)
  }
  console.log('[check-vue-prop-defaults] AST/修复自测通过：普通类型 2 条命中，Boolean 两种形态均保留')
}

if (process.argv.includes('--self-test')) {
  selfTest()
}
else {
  const problems = []
  const files = await sourceFiles(ROOT)
  const scans = []
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    const { found, unresolved } = redundantDefaults(source, file)
    scans.push({ file, source, found, unresolved })
    for (const problem of unresolved)
      problems.push(`${relative(ROOT, file)}:${problem}`)
    for (const at of found)
      problems.push(`${relative(ROOT, file)}:${at.line}:${at.column}`)
  }

  if (process.argv.includes('--fix')) {
    const unresolved = scans.flatMap(scan => scan.unresolved.map(problem => `${relative(ROOT, scan.file)}:${problem}`))
    if (unresolved.length) {
      console.error('[check-vue-prop-defaults] ✗ 存在不可解析的 defineComponent props，拒绝部分改写：')
      for (const problem of unresolved)
        console.error(`  ${problem}`)
      process.exit(1)
    }
    let fixed = 0
    let comments = 0
    for (const scan of scans) {
      const result = removeRedundantDefaults(scan.source, scan.file)
      const next = rewritePolicyComments(result.source)
      if (next !== result.source)
        comments += 1
      if (next !== scan.source)
        await writeFile(scan.file, next)
      fixed += result.count
    }
    console.log(`[check-vue-prop-defaults] 已删除 ${fixed} 处冗余非 Boolean undefined default；更新 ${comments} 个文件的策略注释`)
    process.exit(0)
  }

  if (problems.length) {
    console.error('[check-vue-prop-defaults] ✗ 非 Boolean prop 重复声明 default: undefined：')
    for (const problem of problems)
      console.error(`  ${problem}`)
    console.error('普通类型缺省本就是 undefined；Boolean 的显式 undefined 才用于阻止 absent → false。')
    process.exit(1)
  }

  console.log(`[check-vue-prop-defaults] 通过：${files.length} 个 Vue 组件源码没有冗余非 Boolean undefined default`)
}
