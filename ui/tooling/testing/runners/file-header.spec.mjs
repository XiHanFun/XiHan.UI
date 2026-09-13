// 验证代码文件头迁移的语法适配、前缀保留和幂等性。
import { describe, expect, it } from 'vitest'
import { applyFileHeader, removeFileHeader, stripFileHeader } from '../../file-header.mjs'

const copyright = 'Copyright (c) 2021-Present XiHanFun and contributors.'

describe('file header', () => {
  it('为 TypeScript 补版权头与功能注释，并保持幂等', () => {
    const source = `export const value = 1\n`
    const output = applyFileHeader('src/value.ts', source)
    expect(output.startsWith('/*\n * Copyright')).toBe(true)
    expect(output).toContain('// 提供 value 相关实现。')
    expect(applyFileHeader('src/value.ts', output)).toBe(output)
    expect(stripFileHeader(output)).toContain(source)
  })

  it('为 Vue 使用标记注释并保留示例说明', () => {
    const source = `<!-- 基础用法 | 展示行为 -->\n<template><div /></template>\n`
    const output = applyFileHeader('demos/example.vue', source)
    expect(output.startsWith('<!--\n  Copyright')).toBe(true)
    expect(output).toContain(source)
    expect(applyFileHeader('demos/example.vue', output)).toBe(output)
  })

  it('保留 shebang 与 UTF-8 BOM 的解释器位置', () => {
    const executable = applyFileHeader('scripts/check.mjs', '#!/usr/bin/env node\n// 检查入口。\n')
    const powershell = applyFileHeader('scripts/check.ps1', '\uFEFFWrite-Output "ok"\n')
    expect(executable.startsWith('#!/usr/bin/env node\n/*')).toBe(true)
    expect(executable).toContain(copyright)
    expect(powershell.startsWith('\uFEFF# Copyright')).toBe(true)
    expect(applyFileHeader('scripts/check.ps1', powershell)).toBe(powershell)
  })

  it('能从排除文件精确移除本工具生成的文件头和功能说明', () => {
    const source = `name: CI\n`
    const migrated = applyFileHeader('.github/workflows/ci.yml', source)
    expect(removeFileHeader('.github/workflows/ci.yml', migrated)).toBe(source)
    expect(removeFileHeader('.github/workflows/ci.yml', source)).toBe(source)
  })
})
