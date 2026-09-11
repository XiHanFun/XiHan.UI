import type { Cleanup, Disposable, Layer, LayerRegistry } from '../../kernel'
import type { DismissPathHit, DismissRouteEntry, DismissRouteReadiness } from './route'
import type { DismissLayerOptions, DismissReason, EscapeFallbackOptions } from './types'
import {
  DATA_INERT_EXEMPT,
  EV_ESCAPE_KEY_DOWN,
  EV_FOCUS_OUTSIDE,
  EV_INTERACT_OUTSIDE,
  EV_POINTER_DOWN_OUTSIDE,
  isHTMLElement,
} from '../../kernel'
import {
  dismissPathIncludes,
  isDismissRouteTerminal,
  matchesDismissPrefix,
  planOutsideDismissRoute,
} from './route'

type OutsideKind = 'pointer' | 'focus'

interface Lane {
  readonly registry: LayerRegistry
  readonly participants: Map<Layer, Participant>
  fallbacks: readonly EscapeFallbackToken[]
}

interface Participant {
  readonly hub: DismissHub
  readonly lane: Lane
  readonly layer: Layer
  readonly options: DismissLayerOptions
  readonly resolveNode: () => HTMLElement | null
  active: boolean
  armed: boolean
  justDismissed: boolean
  justDismissedFrame: number | null
}

interface LaneCapture {
  readonly lane: Lane
  readonly snapshot: readonly Layer[]
}

interface EscapeFallbackToken {
  readonly hub: DismissHub
  readonly lane: Lane
  readonly isEnabled: () => boolean
  readonly onEscape: (event: KeyboardEvent) => void
  active: boolean
}

interface EscapeLaneCapture extends LaneCapture {
  readonly fallbackSnapshot: readonly EscapeFallbackToken[]
}

interface EscapeFallbackState {
  readonly token: EscapeFallbackToken
  readonly enabled: boolean
}

interface EscapeLanePlan extends EscapeLaneCapture {
  /** capture 时存在任意 Layer；该 lane 的本次 Escape 已被上层消费。 */
  readonly consumed: boolean
  readonly fallbackStates: readonly EscapeFallbackState[]
  readonly fallback: EscapeFallbackToken | null
}

interface PlannedCandidate {
  readonly participant: Participant
  readonly layer: Layer
  readonly index: number
  readonly node: HTMLElement | null
}

interface LanePlan extends LaneCapture {
  readonly candidates: readonly PlannedCandidate[]
}

interface CandidateStage {
  readonly candidate: PlannedCandidate
  readonly snapshot: readonly Layer[]
  readonly node: HTMLElement | null
}

const hubs = new WeakMap<Document, DismissHub>()

function drainCleanups(cleanups: Cleanup[]): unknown[] {
  const errors: unknown[] = []
  while (cleanups.length) {
    try {
      cleanups.pop()!()
    }
    catch (error) {
      errors.push(error)
    }
  }
  return errors
}

function throwCollectedErrors(errors: unknown[], message: string): void {
  if (errors.length === 1)
    throw errors[0]
  if (errors.length > 1)
    throw new AggregateError(errors, message, { cause: errors[0] })
}

function throwWithCleanup(primary: unknown, cleanupErrors: unknown[], message: string): never {
  if (!cleanupErrors.length)
    throw primary
  throw new AggregateError([primary, ...cleanupErrors], message, { cause: primary })
}

function pathIsInertExempt(path: readonly EventTarget[]): boolean {
  return path.some((target) => {
    const candidate = target as { hasAttribute?: (name: string) => boolean }
    return typeof candidate.hasAttribute === 'function' && candidate.hasAttribute(DATA_INERT_EXEMPT)
  })
}

function assertFrozenSnapshot(snapshot: readonly Layer[]): void {
  if (!Object.isFrozen(snapshot))
    throw new Error('[xh] DismissableLayer 的 LayerRegistry.list() 必须返回冻结快照')
}

function participantReadiness(
  participant: Participant,
  kind: OutsideKind,
): Extract<DismissRouteReadiness, 'ready' | 'unarmed'> {
  if (!participant.active || !participant.armed || (kind === 'focus' && participant.justDismissed))
    return 'unarmed'
  return 'ready'
}

function participantTokenIsCurrent(
  participant: Participant,
  kind: 'escape' | OutsideKind,
): boolean {
  return participant.active
    && participant.armed
    && (kind !== 'focus' || !participant.justDismissed)
    && participant.lane.participants.get(participant.layer) === participant
}

function clearJustDismissed(participant: Participant): void {
  const frame = participant.justDismissedFrame
  participant.justDismissedFrame = null
  participant.justDismissed = false
  if (frame !== null)
    participant.hub.win.cancelAnimationFrame(frame)
}

function markJustDismissed(participant: Participant): void {
  clearJustDismissed(participant)
  participant.justDismissed = true
  try {
    participant.justDismissedFrame = participant.hub.win.requestAnimationFrame(() => {
      participant.justDismissedFrame = null
      participant.justDismissed = false
    })
  }
  catch (error) {
    participant.justDismissedFrame = null
    participant.justDismissed = false
    throw error
  }
}

function sameParticipant(lane: Lane, participant: Participant): boolean {
  return participant.active && lane.participants.get(participant.layer) === participant
}

class DismissHub {
  readonly lanes = new Map<LayerRegistry, Lane>()
  readonly listenerCleanups: Cleanup[] = []
  readonly escapePlans = new WeakMap<KeyboardEvent, readonly EscapeLanePlan[]>()
  leaseCount = 0
  dispatching = false
  teardownPending = false
  installed = false

  readonly onKeydownCapture = (event: KeyboardEvent): void => {
    if (event.key === 'Escape')
      this.routeEscapeCapture(event)
  }

  readonly onPointerDown = (event: PointerEvent): void => this.routeEvent('pointer', event)
  readonly onFocusIn = (event: FocusEvent): void => this.routeEvent('focus', event)
  readonly onKeydownBubble = (event: KeyboardEvent): void => {
    if (event.key === 'Escape')
      this.routeEscapeBubble(event)
  }

  constructor(
    readonly doc: Document,
    readonly win: Window & typeof globalThis,
  ) {
    this.installListeners()
  }

  private installListeners(): void {
    try {
      this.listenerCleanups.push(() => this.doc.removeEventListener('keydown', this.onKeydownCapture, true))
      this.doc.addEventListener('keydown', this.onKeydownCapture, true)
      this.listenerCleanups.push(() => this.doc.removeEventListener('pointerdown', this.onPointerDown, true))
      this.doc.addEventListener('pointerdown', this.onPointerDown, true)
      this.listenerCleanups.push(() => this.doc.removeEventListener('focusin', this.onFocusIn, true))
      this.doc.addEventListener('focusin', this.onFocusIn, true)
      this.listenerCleanups.push(() => this.doc.removeEventListener('keydown', this.onKeydownBubble))
      this.doc.addEventListener('keydown', this.onKeydownBubble)
      this.installed = true
    }
    catch (setupError) {
      throwWithCleanup(
        setupError,
        drainCleanups(this.listenerCleanups),
        '[xh] DismissableLayer Hub 初始化与回滚同时失败',
      )
    }
  }

  hasParticipant(registry: LayerRegistry, layer: Layer): boolean {
    return this.lanes.get(registry)?.participants.has(layer) ?? false
  }

  private getOrCreateLane(registry: LayerRegistry): Lane {
    let lane = this.lanes.get(registry)
    if (!lane) {
      lane = {
        registry,
        participants: new Map(),
        fallbacks: Object.freeze([]),
      }
      this.lanes.set(registry, lane)
    }
    return lane
  }

  addParticipant(options: DismissLayerOptions, resolveNode: () => HTMLElement | null): Disposable {
    const lane = this.getOrCreateLane(options.config.layerRegistry)
    if (lane.participants.has(options.layer))
      throw new Error('[xh] 同一 LayerRegistry 的同一 Layer 只能创建一个 DismissableLayer')

    const participant: Participant = {
      hub: this,
      lane,
      layer: options.layer,
      options,
      resolveNode,
      active: true,
      armed: false,
      justDismissed: false,
      justDismissedFrame: null,
    }
    lane.participants.set(participant.layer, participant)
    this.leaseCount += 1
    this.teardownPending = false

    try {
      this.win.queueMicrotask(() => {
        if (sameParticipant(lane, participant) && lane.registry.list().includes(participant.layer))
          participant.armed = true
      })
    }
    catch (setupError) {
      participant.active = false
      participant.armed = false
      throwWithCleanup(
        setupError,
        this.removeParticipant(participant),
        '[xh] DismissableLayer 参与者初始化与回滚同时失败',
      )
    }

    return {
      dispose: () => this.disposeParticipant(participant),
    }
  }

  addFallback(
    registry: LayerRegistry,
    isEnabled: () => boolean,
    onEscape: (event: KeyboardEvent) => void,
  ): Disposable {
    const lane = this.getOrCreateLane(registry)
    const fallback: EscapeFallbackToken = {
      hub: this,
      lane,
      isEnabled,
      onEscape,
      active: true,
    }
    lane.fallbacks = Object.freeze([...lane.fallbacks, fallback])
    this.leaseCount += 1
    this.teardownPending = false
    return {
      dispose: () => this.disposeFallback(fallback),
    }
  }

  private disposeParticipant(participant: Participant): void {
    if (!participant.active)
      return
    participant.active = false
    participant.armed = false
    const errors: unknown[] = []
    try {
      clearJustDismissed(participant)
    }
    catch (error) {
      errors.push(error)
    }
    errors.push(...this.removeParticipant(participant))
    throwCollectedErrors(errors, '[xh] DismissableLayer 参与者清理出现多个异常')
  }

  private removeParticipant(participant: Participant): unknown[] {
    const { lane } = participant
    if (lane.participants.get(participant.layer) !== participant)
      return []
    lane.participants.delete(participant.layer)
    return this.releaseLease(lane)
  }

  private disposeFallback(fallback: EscapeFallbackToken): void {
    if (!fallback.active)
      return
    fallback.active = false
    const { lane } = fallback
    const index = lane.fallbacks.indexOf(fallback)
    if (index < 0)
      return
    lane.fallbacks = Object.freeze([
      ...lane.fallbacks.slice(0, index),
      ...lane.fallbacks.slice(index + 1),
    ])
    throwCollectedErrors(
      this.releaseLease(lane),
      '[xh] EscapeFallback 清理出现多个异常',
    )
  }

  private releaseLease(lane: Lane): unknown[] {
    this.leaseCount -= 1
    if (lane.participants.size === 0 && lane.fallbacks.length === 0 && this.lanes.get(lane.registry) === lane)
      this.lanes.delete(lane.registry)
    if (this.leaseCount !== 0)
      return []
    if (this.dispatching) {
      this.teardownPending = true
      return []
    }
    return this.teardown()
  }

  private teardown(): unknown[] {
    this.teardownPending = false
    if (hubs.get(this.doc) === this)
      hubs.delete(this.doc)
    if (!this.installed)
      return []
    this.installed = false
    return drainCleanups(this.listenerCleanups)
  }

  private captureLane(lane: Lane): LaneCapture {
    if (lane.registry.ownerDocument !== this.doc)
      throw new Error('[xh] DismissableLayer lane 的 LayerRegistry 已跨出 Hub Document')
    const snapshot = lane.registry.list()
    assertFrozenSnapshot(snapshot)
    return Object.freeze({ lane, snapshot })
  }

  private captureEscapeLane(lane: Lane): EscapeLaneCapture {
    const fallbackSnapshot = lane.fallbacks
    if (!Object.isFrozen(fallbackSnapshot))
      throw new Error('[xh] EscapeFallback lane 必须持有冻结 token 快照')
    return Object.freeze({ ...this.captureLane(lane), fallbackSnapshot })
  }

  private escapeCaptureIsCurrent(capture: EscapeLaneCapture): boolean {
    return this.lanes.get(capture.lane.registry) === capture.lane
      && capture.lane.registry.list() === capture.snapshot
      && capture.lane.fallbacks === capture.fallbackSnapshot
  }

  private planEscapeFallback(capture: EscapeLaneCapture): EscapeLanePlan | null {
    if (capture.snapshot.length > 0) {
      return Object.freeze({
        ...capture,
        consumed: true,
        fallbackStates: Object.freeze([]),
        fallback: null,
      })
    }
    if (!this.escapeCaptureIsCurrent(capture))
      return null

    const fallbackStates: EscapeFallbackState[] = []
    let fallback: EscapeFallbackToken | null = null
    for (let index = capture.fallbackSnapshot.length - 1; index >= 0; index--) {
      const token = capture.fallbackSnapshot[index]!
      if (!token.active || token.hub !== this || token.lane !== capture.lane)
        return null
      const isEnabled = token.isEnabled
      const enabled = isEnabled()
      if (!this.escapeCaptureIsCurrent(capture) || !token.active)
        return null
      fallbackStates.push(Object.freeze({ token, enabled }))
      if (enabled) {
        fallback = token
        break
      }
    }
    return Object.freeze({
      ...capture,
      consumed: false,
      fallbackStates: Object.freeze(fallbackStates),
      fallback,
    })
  }

  private executeEscapeFallback(plan: EscapeLanePlan, event: KeyboardEvent): void {
    if (plan.consumed || plan.fallback === null || !this.escapeCaptureIsCurrent(plan))
      return

    let fallback: EscapeFallbackToken | null = null
    for (const state of plan.fallbackStates) {
      const { token } = state
      if (!token.active || token.hub !== this || token.lane !== plan.lane)
        return
      const isEnabled = token.isEnabled
      const enabled = isEnabled()
      if (!this.escapeCaptureIsCurrent(plan) || !token.active || enabled !== state.enabled)
        return
      if (enabled) {
        fallback = token
        break
      }
    }
    if (fallback !== plan.fallback || !fallback.active)
      return
    const onEscape = fallback.onEscape
    onEscape(event)
  }

  private planOutside(
    capture: LaneCapture,
    path: readonly EventTarget[],
    kind: OutsideKind,
    inertExempt: boolean,
  ): LanePlan {
    const entries: DismissRouteEntry<PlannedCandidate>[] = []
    if (capture.lane.registry.list() !== capture.snapshot)
      return Object.freeze({ ...capture, candidates: Object.freeze([]) })
    if (!inertExempt) {
      for (let index = capture.snapshot.length - 1; index >= 0; index--) {
        if (capture.lane.registry.list() !== capture.snapshot)
          return Object.freeze({ ...capture, candidates: Object.freeze([]) })
        const layer = capture.snapshot[index]!
        const participant = capture.lane.participants.get(layer)
        if (!participant) {
          entries.push({ readiness: 'missing-participant' })
          break
        }
        const readiness = participantReadiness(participant, kind)
        if (readiness !== 'ready') {
          entries.push({ readiness })
          break
        }
        const node = participant.resolveNode()
        if (capture.lane.registry.list() !== capture.snapshot
          || !participantTokenIsCurrent(participant, kind)) {
          return Object.freeze({ ...capture, candidates: Object.freeze([]) })
        }
        if (node === null) {
          entries.push({ readiness: 'missing-node' })
          break
        }
        let hit: DismissPathHit = 'outside'
        if (path.includes(node)) {
          hit = 'inside'
        }
        else {
          const branches = layer.branches()
          if (capture.lane.registry.list() !== capture.snapshot
            || !participantTokenIsCurrent(participant, kind)) {
            return Object.freeze({ ...capture, candidates: Object.freeze([]) })
          }
          const insideBranch = dismissPathIncludes(path, branches)
          if (capture.lane.registry.list() !== capture.snapshot
            || !participantTokenIsCurrent(participant, kind)) {
            return Object.freeze({ ...capture, candidates: Object.freeze([]) })
          }
          if (insideBranch) {
            hit = 'inside'
          }
          else {
            const surfaces = layer.surfaces()
            if (capture.lane.registry.list() !== capture.snapshot
              || !participantTokenIsCurrent(participant, kind)) {
              return Object.freeze({ ...capture, candidates: Object.freeze([]) })
            }
            hit = dismissPathIncludes(path, surfaces) ? 'surface' : 'outside'
            if (capture.lane.registry.list() !== capture.snapshot
              || !participantTokenIsCurrent(participant, kind)) {
              return Object.freeze({ ...capture, candidates: Object.freeze([]) })
            }
          }
        }
        const candidate: PlannedCandidate = { participant, layer, index, node }
        const entry: DismissRouteEntry<PlannedCandidate> = { candidate, hit, readiness: 'ready' }
        entries.push(entry)
        if (isDismissRouteTerminal(entry))
          break
      }
    }
    const plan = planOutsideDismissRoute(entries, inertExempt)
    return Object.freeze({ ...capture, candidates: plan.candidates })
  }

  private planEscape(capture: LaneCapture): LanePlan {
    if (capture.lane.registry.list() !== capture.snapshot)
      return Object.freeze({ ...capture, candidates: Object.freeze([]) })
    const index = capture.snapshot.length - 1
    if (index < 0)
      return Object.freeze({ ...capture, candidates: Object.freeze([]) })
    const layer = capture.snapshot[index]!
    const participant = capture.lane.participants.get(layer)
    if (!participant || !participant.active || !participant.armed)
      return Object.freeze({ ...capture, candidates: Object.freeze([]) })
    const node = participant.resolveNode()
    if (capture.lane.registry.list() !== capture.snapshot
      || !participantTokenIsCurrent(participant, 'escape')) {
      return Object.freeze({ ...capture, candidates: Object.freeze([]) })
    }
    return Object.freeze({
      ...capture,
      candidates: Object.freeze([{ participant, layer, index, node }]),
    })
  }

  private beginStage(
    plan: LanePlan,
    candidate: PlannedCandidate,
    expectedSnapshot: readonly Layer[],
    kind: 'escape' | OutsideKind,
  ): CandidateStage | null {
    const current = plan.lane.registry.list()
    assertFrozenSnapshot(current)
    if (current !== expectedSnapshot
      || !matchesDismissPrefix(current, plan.snapshot, candidate.index + 1)
      || current[current.length - 1] !== candidate.layer
      || !this.candidateIdentityIsCurrent(candidate, current, kind)) {
      return null
    }
    const node = candidate.participant.resolveNode()
    if (node !== candidate.node || !this.candidateIdentityIsCurrent(candidate, current, kind)) {
      return null
    }
    return Object.freeze({ candidate, snapshot: current, node })
  }

  private candidateIdentityIsCurrent(
    candidate: PlannedCandidate,
    snapshot: readonly Layer[],
    kind: 'escape' | OutsideKind,
  ): boolean {
    const { participant, layer } = candidate
    return participantTokenIsCurrent(participant, kind)
      && participant.lane.registry.list() === snapshot
      && participant.lane.registry.top() === layer
  }

  private stageIsCurrent(stage: CandidateStage, kind: 'escape' | OutsideKind): boolean {
    const { candidate } = stage
    if (!this.candidateIdentityIsCurrent(candidate, stage.snapshot, kind))
      return false
    const node = candidate.participant.resolveNode()
    return node === stage.node && this.candidateIdentityIsCurrent(candidate, stage.snapshot, kind)
  }

  private dispatchVote<T>(
    stage: CandidateStage,
    kind: 'escape' | OutsideKind,
    vote: CustomEvent<T>,
    callback?: (event: CustomEvent<T>) => void,
  ): boolean {
    stage.node?.dispatchEvent(vote)
    if (!this.stageIsCurrent(stage, kind))
      return false
    callback?.(vote)
    return this.stageIsCurrent(stage, kind)
  }

  private voteOutside(
    stage: CandidateStage,
    kind: OutsideKind,
    path: readonly EventTarget[],
  ): DismissPathHit | null {
    const { participant } = stage.candidate
    const specificType = kind === 'pointer' ? EV_POINTER_DOWN_OUTSIDE : EV_FOCUS_OUTSIDE
    const specificCallback = kind === 'pointer'
      ? participant.options.onPointerDownOutside
      : participant.options.onFocusOutside
    const specific = new this.win.CustomEvent(specificType, { bubbles: false, cancelable: true, detail: {} })
    if (!this.dispatchVote(stage, kind, specific, specificCallback))
      return null
    const interact = new this.win.CustomEvent(EV_INTERACT_OUTSIDE, { bubbles: false, cancelable: true, detail: {} })
    if (!this.dispatchVote(stage, kind, interact, participant.options.onInteractOutside))
      return null
    if (specific.defaultPrevented || interact.defaultPrevented || !this.stageIsCurrent(stage, kind))
      return null
    const hit = this.readStageHit(stage, kind, path)
    return hit !== null && hit !== 'inside' ? hit : null
  }

  private readStageHit(
    stage: CandidateStage,
    kind: OutsideKind,
    path: readonly EventTarget[],
  ): DismissPathHit | null {
    if (!this.stageIsCurrent(stage, kind))
      return null
    const { layer } = stage.candidate
    if (stage.node !== null && path.includes(stage.node))
      return 'inside'
    const branches = layer.branches()
    if (!this.stageIsCurrent(stage, kind))
      return null
    const insideBranch = dismissPathIncludes(path, branches)
    if (!this.stageIsCurrent(stage, kind))
      return null
    if (insideBranch)
      return 'inside'
    const surfaces = layer.surfaces()
    if (!this.stageIsCurrent(stage, kind))
      return null
    const onSurface = dismissPathIncludes(path, surfaces)
    return this.stageIsCurrent(stage, kind) ? (onSurface ? 'surface' : 'outside') : null
  }

  private stageOutsideHit(
    stage: CandidateStage,
    kind: OutsideKind,
    path: readonly EventTarget[],
  ): DismissPathHit | null {
    const hit = this.readStageHit(stage, kind, path)
    return hit !== 'inside' ? hit : null
  }

  private voteEscape(stage: CandidateStage, event: KeyboardEvent): boolean {
    const vote = new this.win.CustomEvent(EV_ESCAPE_KEY_DOWN, {
      bubbles: false,
      cancelable: true,
      detail: { originalEvent: event },
    })
    return this.dispatchVote(stage, 'escape', vote, stage.candidate.participant.options.onEscapeKeyDown)
      && !vote.defaultPrevented
  }

  private observeDismissTransition(
    plan: LanePlan,
    stage: CandidateStage,
    reason: DismissReason,
  ): readonly Layer[] | null {
    const snapshots: Array<readonly Layer[]> = []
    let observing = false
    const unsubscribe = plan.lane.registry.subscribe((snapshot) => {
      if (observing) {
        assertFrozenSnapshot(snapshot)
        snapshots.push(snapshot)
      }
    })
    let primaryFound = false
    let primaryError: unknown
    try {
      observing = true
      const onDismiss = stage.candidate.participant.options.onDismiss
      onDismiss(reason)
    }
    catch (error) {
      primaryFound = true
      primaryError = error
    }
    finally {
      observing = false
    }
    const cleanupErrors: unknown[] = []
    try {
      unsubscribe()
    }
    catch (error) {
      cleanupErrors.push(error)
    }
    if (primaryFound)
      throwWithCleanup(primaryError, cleanupErrors, '[xh] DismissableLayer onDismiss 与层栈观察清理同时失败')
    throwCollectedErrors(cleanupErrors, '[xh] DismissableLayer 层栈观察清理失败')

    const committed = snapshots[0]
    const current = plan.lane.registry.list()
    assertFrozenSnapshot(current)
    if (!committed
      || current !== committed
      || !matchesDismissPrefix(committed, plan.snapshot, stage.candidate.index)) {
      return null
    }
    return current
  }

  private dismissOutside(
    plan: LanePlan,
    stage: CandidateStage,
    kind: OutsideKind,
  ): readonly Layer[] | null {
    const participant = stage.candidate.participant
    if (kind === 'focus')
      return this.observeDismissTransition(plan, stage, 'focus-outside')

    markJustDismissed(participant)
    try {
      if (!this.stageIsCurrent(stage, kind)) {
        clearJustDismissed(participant)
        return null
      }
      return this.observeDismissTransition(plan, stage, 'pointer-down-outside')
    }
    catch (primaryError) {
      const cleanupErrors: unknown[] = []
      try {
        clearJustDismissed(participant)
      }
      catch (cleanupError) {
        cleanupErrors.push(cleanupError)
      }
      throwWithCleanup(
        primaryError,
        cleanupErrors,
        '[xh] DismissableLayer pointer 提交与焦点抑制清理同时失败',
      )
    }
  }

  private executeOutside(plan: LanePlan, kind: OutsideKind, path: readonly EventTarget[]): void {
    let expectedSnapshot = plan.snapshot
    for (const candidate of plan.candidates) {
      const stage = this.beginStage(plan, candidate, expectedSnapshot, kind)
      if (!stage)
        return
      const stageHit = this.stageOutsideHit(stage, kind, path)
      if (stageHit === null)
        return
      const finalHit = this.voteOutside(stage, kind, path)
      if (finalHit === null)
        return
      const nextSnapshot = this.dismissOutside(plan, stage, kind)
      if (!nextSnapshot)
        return
      if (stageHit === 'surface' || finalHit === 'surface')
        return
      expectedSnapshot = nextSnapshot
    }
  }

  private executeEscape(plan: LanePlan, event: KeyboardEvent): void {
    const candidate = plan.candidates[0]
    if (!candidate)
      return
    const stage = this.beginStage(plan, candidate, plan.snapshot, 'escape')
    if (stage && this.voteEscape(stage, event)) {
      const onDismiss = candidate.participant.options.onDismiss
      onDismiss('escape-key')
    }
  }

  private finishDispatch(errors: unknown[]): void {
    if (this.leaseCount === 0 && this.teardownPending)
      errors.push(...this.teardown())
    this.dispatching = false
  }

  private routeEscapeCapture(event: KeyboardEvent): void {
    if (this.dispatching)
      return
    this.dispatching = true
    const errors: unknown[] = []
    try {
      const captures: EscapeLaneCapture[] = []
      for (const lane of Array.from(this.lanes.values())) {
        try {
          captures.push(this.captureEscapeLane(lane))
        }
        catch (error) {
          errors.push(error)
        }
      }

      const fallbackPlans: EscapeLanePlan[] = []
      for (const capture of captures) {
        try {
          const plan = this.planEscapeFallback(capture)
          if (plan)
            fallbackPlans.push(plan)
        }
        catch (error) {
          errors.push(error)
        }
      }
      this.escapePlans.set(event, Object.freeze(fallbackPlans))

      const layerPlans: LanePlan[] = []
      for (const capture of captures) {
        try {
          layerPlans.push(this.planEscape(capture))
        }
        catch (error) {
          errors.push(error)
        }
      }
      for (const plan of layerPlans) {
        try {
          this.executeEscape(plan, event)
        }
        catch (error) {
          errors.push(error)
        }
      }
    }
    finally {
      this.finishDispatch(errors)
    }
    throwCollectedErrors(errors, '[xh] DismissableLayer Hub 多条 lane 处理失败')
  }

  private routeEscapeBubble(event: KeyboardEvent): void {
    const plans = this.escapePlans.get(event)
    if (!plans || this.dispatching)
      return
    this.escapePlans.delete(event)
    if (event.defaultPrevented)
      return

    this.dispatching = true
    const errors: unknown[] = []
    try {
      for (const plan of plans) {
        try {
          this.executeEscapeFallback(plan, event)
        }
        catch (error) {
          errors.push(error)
        }
      }
    }
    finally {
      this.finishDispatch(errors)
    }
    throwCollectedErrors(errors, '[xh] EscapeFallback Hub 多条 lane 处理失败')
  }

  private routeEvent(kind: OutsideKind, event: PointerEvent | FocusEvent): void {
    if (this.dispatching)
      return
    this.dispatching = true
    const errors: unknown[] = []
    try {
      let path: readonly EventTarget[] | null = null
      try {
        path = Object.freeze([...event.composedPath()])
      }
      catch (error) {
        errors.push(error)
      }

      const captures: LaneCapture[] = []
      for (const lane of Array.from(this.lanes.values())) {
        try {
          captures.push(this.captureLane(lane))
        }
        catch (error) {
          errors.push(error)
        }
      }

      if (path) {
        let inertExempt = false
        try {
          inertExempt = pathIsInertExempt(path)
        }
        catch (error) {
          errors.push(error)
          path = null
        }
        if (path) {
          const plans: LanePlan[] = []
          for (const capture of captures) {
            try {
              plans.push(this.planOutside(capture, path, kind, inertExempt))
            }
            catch (error) {
              errors.push(error)
            }
          }
          for (const plan of plans) {
            try {
              this.executeOutside(plan, kind, path)
            }
            catch (error) {
              errors.push(error)
            }
          }
        }
      }
    }
    finally {
      this.finishDispatch(errors)
    }
    throwCollectedErrors(errors, '[xh] DismissableLayer Hub 多条 lane 处理失败')
  }
}

function getOrCreateHub(doc: Document, win: Window & typeof globalThis): DismissHub {
  const current = hubs.get(doc)
  if (current) {
    if (current.win !== win)
      throw new Error('[xh] DismissableLayer 的同一 Document 不能绑定不同 Window')
    return current
  }
  const hub = new DismissHub(doc, win)
  hubs.set(doc, hub)
  return hub
}

export function registerDismissLayer(options: DismissLayerOptions): Disposable {
  const { config, layer } = options
  const registry = config.layerRegistry
  const doc = config.scope.getDoc()
  const win = config.scope.getWin()
  if (registry.ownerDocument !== doc)
    throw new Error('[xh] DismissableLayer 的 LayerRegistry 与 Scope 必须属于同一 Document')
  if (doc.defaultView !== win || win.document !== doc)
    throw new Error('[xh] DismissableLayer 的 Scope Document 与 Window 不一致')
  if (typeof win.CustomEvent !== 'function')
    throw new Error('[xh] DismissableLayer 所属 Window 不支持 CustomEvent')
  if (typeof win.queueMicrotask !== 'function')
    throw new Error('[xh] DismissableLayer 所属 Window 不支持 queueMicrotask')
  if (typeof win.requestAnimationFrame !== 'function' || typeof win.cancelAnimationFrame !== 'function')
    throw new Error('[xh] DismissableLayer 所属 Window 不支持动画帧调度')

  const existingHub = hubs.get(doc)
  if (existingHub?.hasParticipant(registry, layer))
    throw new Error('[xh] 同一 LayerRegistry 的同一 Layer 只能创建一个 DismissableLayer')

  const initialSnapshot = registry.list()
  assertFrozenSnapshot(initialSnapshot)
  if (!initialSnapshot.includes(layer))
    throw new Error('[xh] DismissableLayer 的 layer 必须已注册到 config.layerRegistry')

  const resolveNode = (): HTMLElement | null => {
    const current = layer.node()
    if (current === null)
      return null
    if (!isHTMLElement(current))
      throw new Error('[xh] DismissableLayer 的 layer.node() 必须是原生 HTMLElement')
    if (current.ownerDocument !== doc)
      throw new Error('[xh] DismissableLayer 的 layer.node() 必须属于 config.scope 的 Document')
    return current
  }

  resolveNode()
  const afterInitialNode = registry.list()
  if (afterInitialNode !== initialSnapshot || !afterInitialNode.includes(layer))
    throw new Error('[xh] DismissableLayer 的 layer.node() 在初始化期间改变了 LayerRegistry 快照')

  const hub = getOrCreateHub(doc, win)
  return hub.addParticipant(options, resolveNode)
}

export function registerEscapeFallback(options: EscapeFallbackOptions): Disposable {
  const { config } = options
  const isEnabled = options.isEnabled
  const onEscape = options.onEscape
  if (typeof isEnabled !== 'function' || typeof onEscape !== 'function')
    throw new TypeError('[xh] EscapeFallback 的 isEnabled 与 onEscape 必须是函数')
  const registry = config.layerRegistry
  const doc = config.scope.getDoc()
  const win = config.scope.getWin()
  if (registry.ownerDocument !== doc)
    throw new Error('[xh] EscapeFallback 的 LayerRegistry 与 Scope 必须属于同一 Document')
  if (doc.defaultView !== win || win.document !== doc)
    throw new Error('[xh] EscapeFallback 的 Scope Document 与 Window 不一致')
  assertFrozenSnapshot(registry.list())

  const hub = getOrCreateHub(doc, win)
  return hub.addFallback(registry, isEnabled, onEscape)
}
