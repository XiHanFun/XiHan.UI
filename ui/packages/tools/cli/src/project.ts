/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 识别当前项目用的是哪个适配器、装的是哪一版 XiHan.UI。

import type { Framework } from './knowledge'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'

export interface ProjectInfo {
  /** 最近的 package.json 所在目录。 */
  readonly root: string | undefined
  /** 依赖里出现的适配器；同时出现多个时按 Vue、React、Web Components 取第一个。 */
  readonly framework: Framework | undefined
  /** node_modules 里实际装的 XiHan.UI 版本。 */
  readonly installedVersion: string | undefined
}

const ADAPTER_PACKAGES: readonly [Framework, string][] = [
  ['vue', '@xihan-ui/vue'],
  ['react', '@xihan-ui/react'],
  ['web-components', '@xihan-ui/web-components'],
]

function readJson(path: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
  }
  catch {
    return undefined
  }
}

function nearestPackageDir(start: string): string | undefined {
  let dir = start
  for (;;) {
    if (existsSync(join(dir, 'package.json')))
      return dir
    const parent = dirname(dir)
    if (parent === dir)
      return undefined
    dir = parent
  }
}

/** 从 start 向上逐级找 node_modules/<name>/package.json 里的版本。 */
function installedVersionOf(start: string, name: string): string | undefined {
  let dir = start
  for (;;) {
    const manifest = readJson(join(dir, 'node_modules', name, 'package.json'))
    if (typeof manifest?.version === 'string')
      return manifest.version
    const parent = dirname(dir)
    if (parent === dir)
      return undefined
    dir = parent
  }
}

export function detectProject(cwd: string = process.cwd()): ProjectInfo {
  const root = nearestPackageDir(cwd)
  if (!root)
    return { root: undefined, framework: undefined, installedVersion: undefined }
  const manifest = readJson(join(root, 'package.json')) ?? {}
  const declared = {
    ...(manifest.dependencies as Record<string, string> | undefined),
    ...(manifest.devDependencies as Record<string, string> | undefined),
  }
  const adapter = ADAPTER_PACKAGES.find(([, name]) => name in declared)
  const probe = adapter?.[1] ?? '@xihan-ui/core'
  return {
    root,
    framework: adapter?.[0],
    installedVersion: installedVersionOf(root, probe),
  }
}

/** 项目装的版本与 CLI 数据版本不一致时的提示；一致或未安装时返回 undefined。 */
export function versionNotice(project: ProjectInfo, dataVersion: string): string | undefined {
  if (!project.installedVersion || project.installedVersion === dataVersion)
    return undefined
  return `当前项目装的是 XiHan.UI ${project.installedVersion}，这份 CLI 的数据对应 ${dataVersion}。`
    + `要按项目版本查询，改用 npx -y @xihan-ui/cli@${project.installedVersion}。`
}
