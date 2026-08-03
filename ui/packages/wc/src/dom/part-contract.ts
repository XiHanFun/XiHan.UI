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
}

/**
 * 比对已发现的角色节点与契约：缺必需 part 报 error，出现解剖外的 part 名报 warn。
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
}
