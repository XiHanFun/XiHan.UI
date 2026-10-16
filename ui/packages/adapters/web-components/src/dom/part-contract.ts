/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 角色节点契约校验：作者写的 Light DOM 与组件解剖对不上时投递诊断。
import type { ComponentMeta } from '@xihan-ui/headless'
import { DIAGNOSTIC_CODES, getDiagnostics, reportDiagnostic } from '@xihan-ui/core'

/** 只取校验用得上的两项，避免把 `Anatomy<具体 part 联合>` 收窄成 `Anatomy<string>` 时不可赋值。 */
export interface PartContract {
  readonly anatomy: { readonly name: string, readonly parts: readonly string[] }
  readonly meta: ComponentMeta
  /**
   * 部件必须使用的标签名。只登记写错后会静默失效的部件：
   * 例如 field 的 label 不是原生 `<label>` 时，`for` 整条失效，点击标签不再聚焦控件。
   */
  readonly tags?: Readonly<Record<string, readonly string[]>>
  /**
   * 委派出去的内嵌部件解剖。
   *
   * 有的宿主把内嵌部件的 DOM 摊在自己的 Light DOM 里接线（date-picker 之于 date-field 与
   * calendar 就是这样），这些角色节点归内嵌部件的 scope 管，本就不该出现在宿主自己的解剖里。
   * 不登记的话它们会被当成解剖外的野节点逐个报警，而它们恰恰是被正常接线的。
   *
   * `name` 是被委派的那个组件的解剖名，委派方自己跑它的状态机，不要求 `xh-<name>` 已注册；`parts` 是作者写的角色名。
   * 与宿主解剖重名的角色名归宿主，其余的接线后 data-scope 必须是 `name`。
   */
  readonly delegates?: readonly { readonly name: string, readonly parts: readonly string[] }[]
  /**
   * 双重身份的角色节点：作者按本组件的角色名写，接线后 data-part 却是同一 scope 里的另一个部件。
   *
   * 子菜单形态的 Menu 就是这样：作者写 data-xh-part="trigger"（它是本子菜单的触发器，发现与
   * 接线都按这个名找它），Headless 的 getSubmenuTriggerProps 却铺的是父菜单的 item 部件属性——
   * 父层的方向键、高亮与集合条目皮肤都按 data-part="item" 认它，三端 DOM 一致。
   * 不登记的话示例门禁会把它当成接错了名。键是作者写的角色名，值是允许接出来的 data-part。
   */
  readonly rewired?: Readonly<Record<string, readonly string[]>>
  /**
   * 可由宿主子树里的库内元素顶替的必需部件：部件名 → 选择器。
   *
   * 作者不写这个部件、而在宿主里放了匹配的元素时，必需部件校验算它在场。字段的 control 就是这样：
   * 库内控件放进 <xh-field> 时由字段按发现表接线，作者不另写 control 部件。
   */
  readonly fulfilledBy?: Readonly<Record<string, string>>
}

/** 必需部件在场：作者写了这个角色节点，或宿主子树里有契约登记的顶替元素。 */
export function requiredPartPresent(
  contract: PartContract,
  part: string,
  parts: ReadonlyMap<string, readonly HTMLElement[]>,
  host: Element,
): boolean {
  if (parts.has(part))
    return true
  const selector = contract.fulfilledBy?.[part]
  return selector != null && host.querySelector(selector) != null
}

/**
 * 委派登记里真正归内嵌部件管的作者名 → 允许的 scope 集合。
 * 与宿主解剖重名的角色名由宿主自己接线（date-picker 的 root / control 等），不进这张表。
 */
export function delegatedScopesOf(contract: PartContract): ReadonlyMap<string, ReadonlySet<string>> {
  const own = new Set(contract.anatomy.parts)
  const out = new Map<string, Set<string>>()
  for (const delegate of contract.delegates ?? []) {
    for (const part of delegate.parts) {
      if (own.has(part))
        continue
      const scopes = out.get(part)
      if (scopes)
        scopes.add(delegate.name)
      else
        out.set(part, new Set([delegate.name]))
    }
  }
  return out
}

/**
 * 比对已发现的角色节点与契约：缺必需 part 报 error，出现解剖外的 part 名报 warn，
 * 委派目标不是已注册元素的解剖名报 error。
 * 委派节点的接线结果排到微任务里核：宿主在本函数返回后同步接线，微任务里读到的已是接线后的 data-scope。
 * 通道静默时直接返回，不做扫描。
 */
export function validatePartContract(
  contract: PartContract,
  parts: ReadonlyMap<string, HTMLElement[]>,
  host: HTMLElement,
  instanceId: string,
): void {
  if (getDiagnostics().getLevel() === 'silent')
    return

  const scope = contract.anatomy.name

  for (const part of contract.meta.requiredParts) {
    if (requiredPartPresent(contract, part, parts, host))
      continue
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.wcMissingPart,
      level: 'error',
      message: `缺少必需的角色节点 data-xh-part="${part}"，该部件不会被接线`,
      scope,
      instanceId,
      part,
      node: host,
      detail: { tag: host.tagName.toLowerCase(), requiredParts: contract.meta.requiredParts },
    })
  }

  const known = new Set<string>(contract.anatomy.parts)
  for (const delegate of contract.delegates ?? []) {
    for (const part of delegate.parts)
      known.add(part)
  }
  for (const part of parts.keys()) {
    if (known.has(part))
      continue
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.wcUnknownPart,
      level: 'warn',
      message: `角色节点 data-xh-part="${part}" 不在 ${scope} 的解剖内，不会被接线`,
      scope,
      instanceId,
      part,
      node: parts.get(part)?.[0] ?? host,
      detail: { tag: host.tagName.toLowerCase(), knownParts: contract.anatomy.parts },
    })
  }

  for (const [part, allowed] of Object.entries(contract.tags ?? {})) {
    for (const el of parts.get(part) ?? []) {
      const tag = el.tagName.toLowerCase()
      // 嵌套组件当部件（asChild）：接线合进它自己的根节点，标签由它自己的契约去核
      if (allowed.includes(tag) || tag.startsWith('xh-'))
        continue
      reportDiagnostic({
        code: DIAGNOSTIC_CODES.wcWrongPartTag,
        level: 'warn',
        message: `角色节点 data-xh-part="${part}" 是 <${tag}>，须是 ${allowed.map(t => `<${t}>`).join(' 或 ')}，否则原生语义静默失效`,
        scope,
        instanceId,
        part,
        node: el,
        detail: { tag, allowed },
      })
    }
  }

  if (!contract.delegates?.length)
    return
  queueMicrotask(() => validateDelegatedParts(contract, parts, host, instanceId))
}

/**
 * 核对委派节点的接线结果：登记为归内嵌部件的角色节点，接线后 data-scope 必须是登记的 scope。
 * 没拿到 data-scope 即没被接线（多半是写错了位置），拿到别的 scope 即登记与接线对不上。
 * 已从宿主离场的节点跳过。
 */
export function validateDelegatedParts(
  contract: PartContract,
  parts: ReadonlyMap<string, HTMLElement[]>,
  host: HTMLElement,
  instanceId: string,
): void {
  if (!host.isConnected || getDiagnostics().getLevel() === 'silent')
    return
  const scope = contract.anatomy.name
  for (const [part, scopes] of delegatedScopesOf(contract)) {
    const expected = [...scopes]
    for (const el of parts.get(part) ?? []) {
      if (!host.contains(el))
        continue
      const wired = el.getAttribute('data-scope')
      if (wired !== null && expected.includes(wired))
        continue
      const target = expected.map(s => `"${s}"`).join(' 或 ')
      reportDiagnostic({
        code: wired === null ? DIAGNOSTIC_CODES.wcUnknownPart : DIAGNOSTIC_CODES.invariant,
        level: wired === null ? 'warn' : 'error',
        message: wired === null
          ? `角色节点 data-xh-part="${part}" 登记为委派给 ${target}，接线后没有 data-scope：没被接线，检查它是否放在了该放的部件里`
          : `角色节点 data-xh-part="${part}" 登记为委派给 ${target}，接线后 data-scope 却是 "${wired}"，契约登记与接线对不上`,
        scope,
        instanceId,
        part,
        node: el,
        detail: { tag: host.tagName.toLowerCase(), expectedScopes: expected, wiredScope: wired },
      })
    }
  }
}
