import type { Layer, Service } from '@xihan-ui/core'
import type { CommandApi, CommandSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { commandMachine, connectCommand } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface CommandContext extends OverlayWiring {
  service: Service<CommandSchema>
  api: CommandApi
  contentRef: RefObject<HTMLElement | null>
  backdropRef: RefObject<HTMLElement | null>
  listRef: RefObject<HTMLElement | null>
  inputRef: RefObject<HTMLInputElement | null>
}

export function useCommand(props: CommandSchema['props']): CommandContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const contentRef = useRef<HTMLElement | null>(null)
  const backdropRef = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const serviceRef = useRef<Service<CommandSchema> | null>(null)
  const modalRef = useRef(props.modal)
  modalRef.current = props.modal

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'modal',
    branches: () => [],
    isModal: () => modalRef.current ?? true,
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    additionalExitNodes: () => [backdropRef.current],
    surfaces: () => [backdropRef.current].filter(Boolean) as Element[],
    refs: (service) => {
      service.refs.set('getContentEl', (() => contentRef.current) as never)
      service.refs.set('getListEl', (() => listRef.current) as never)
      service.refs.set('getInputEl', (() => inputRef.current) as never)
    },
  })

  const service = useMachine(commandMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  return {
    ...overlay,
    service,
    api: connectCommand(service, reactNormalize),
    contentRef,
    backdropRef,
    listRef,
    inputRef,
  }
}
