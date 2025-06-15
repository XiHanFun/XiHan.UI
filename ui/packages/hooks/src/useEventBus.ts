import { ref, onUnmounted } from "vue";
import type { Ref } from "vue";

type EventHandler = (...args: any[]) => void;
type EventMap = Map<string, Set<EventHandler>>;

export interface EventBus {
  /** 事件映射 */
  events: Ref<EventMap>;
  /** 监听事件 */
  on: (event: string, handler: EventHandler) => void;
  /** 取消监听事件 */
  off: (event: string, handler: EventHandler) => void;
  /** 触发事件 */
  emit: (event: string, ...args: any[]) => void;
  /** 清空所有事件 */
  clear: () => void;
}

/**
 * 使用事件总线
 * @returns 事件总线
 */
export function useEventBus(): EventBus {
  const events = ref<EventMap>(new Map());

  const on = (event: string, handler: EventHandler) => {
    if (!events.value.has(event)) {
      events.value.set(event, new Set());
    }
    events.value.get(event)?.add(handler);
  };

  const off = (event: string, handler: EventHandler) => {
    const handlers = events.value.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        events.value.delete(event);
      }
    }
  };

  const emit = (event: string, ...args: any[]) => {
    const handlers = events.value.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  };

  const clear = () => {
    events.value.clear();
  };

  onUnmounted(() => {
    clear();
  });

  return {
    events,
    on,
    off,
    emit,
    clear,
  };
}
