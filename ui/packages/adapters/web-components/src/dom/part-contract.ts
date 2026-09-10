// 角色节点契约校验：作者写的 Light DOM 与组件解剖对不上时投递诊断。
import type { ComponentMeta } from '@xihan-ui/headless'
import { DIAGNOSTIC_CODES, getDiagnostics, reportDiagnostic } from '@xihan-ui/core'

/** 只取校验用得上的两项，避免把 `Anatomy<具体 part 联合>` 收窄成 `Anatomy<string>` 时不可赋值。 */
export interface PartContract {
  readonly anatomy: { readonly name: string, readonly parts: readonly string[] }
  readonly meta: ComponentMeta
  /**
   * 部件必须用的标签名。只登记「写错了会静默失效」的那些——
   * 比如 field 的 label 不是原生 `<label>` 时，`for` 整条失效，点标签不再聚焦控件。
   */
  readonly tags?: Readonly<Record<string, readonly string[]>>
  /**
   * 委派出去的内嵌部件解剖。
   *
   * 有的宿主把内嵌部件的 DOM 摊在自己的 Light DOM 里接线（date-picker 之于 date-field 与
   * calendar 就是这样），这些角色节点归内嵌部件的 scope 管，本就不该出现在宿主自己的解剖里。
   * 不登记的话它们会被当成解剖外的野节点逐个报警，而它们恰恰是被正常接线的。
   *
   * `name` 须是已注册元素 `xh-<name>` 的解剖名；`parts` 是作者写的角色名。
   * 与宿主解剖重名的角色名归宿主，其余的接线后 data-scope 必须是 `name`。
   */
  readonly delegates?: readonly { readonly name: string, readonly parts: readonly string[] }[]
}

/** 元素类上挂的契约，只取校验用得上的那一项。 */
interface ContractHolder { partContract?: PartContract }

/** `name` 是否已注册为 `xh-<name>` 元素、且该元素的解剖名就是它。 */
export function isRegisteredScope(name: string): boolean {
  if (typeof customElements === 'undefined')
    return false
  const ctor = customElements.get(`xh-${name}`) as ContractHolder | undefined
  return ctor?.partContract?.anatomy.name === name
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
    if (parts.has(part))
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
      if (allowed.includes(tag))
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
  const unregistered = new Set<string>()
  for (const delegate of contract.delegates) {
    if (isRegisteredScope(delegate.name))
      continue
    unregistered.add(delegate.name)
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.invariant,
      level: 'error',
      message: `partContract.delegates 登记的 "${delegate.name}" 不是已注册元素 <xh-${delegate.name}> 的解剖名，委派给它的角色节点无从核对`,
      scope,
      instanceId,
      node: host,
      detail: { tag: host.tagName.toLowerCase(), delegate: delegate.name, parts: delegate.parts },
    })
  }

  queueMicrotask(() => validateDelegatedParts(contract, parts, host, instanceId, unregistered))
}

/**
 * 核对委派节点的接线结果：登记为归内嵌部件的角色节点，接线后 data-scope 必须是登记的 scope。
 * 没拿到 data-scope 即没被接线（多半是写错了位置），拿到别的 scope 即登记与接线对不上。
 * 已从宿主离场的节点与登记目标未注册的委派跳过。
 */
export function validateDelegatedParts(
  contract: PartContract,
  parts: ReadonlyMap<string, HTMLElement[]>,
  host: HTMLElement,
  instanceId: string,
  skipScopes: ReadonlySet<string> = new Set(),
): void {
  if (!host.isConnected || getDiagnostics().getLevel() === 'silent')
    return
  const scope = contract.anatomy.name
  for (const [part, scopes] of delegatedScopesOf(contract)) {
    const expected = [...scopes].filter(s => !skipScopes.has(s))
    if (expected.length === 0)
      continue
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
