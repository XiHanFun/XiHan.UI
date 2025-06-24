/**
 * 样式缓存系统
 * 高性能的 LRU 缓存实现，专注于样式编译结果缓存
 */

import type { CompiledStyle, StyleCache } from "../foundation/types";
import { generateHash, deepClone } from "../foundation/utils";
import { globalEvents } from "../foundation/events";

/**
 * 缓存节点接口
 */
interface CacheNode {
  key: string;
  value: CompiledStyle;
  timestamp: number;
  accessCount: number;
  prev?: CacheNode;
  next?: CacheNode;
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 最大缓存数量 */
  maxSize: number;
  /** 缓存过期时间（毫秒） */
  ttl: number;
  /** 是否启用访问计数 */
  enableAccessCount: boolean;
  /** 清理间隔（毫秒） */
  cleanupInterval: number;
}

/**
 * 样式缓存统计信息
 */
export interface CacheStats {
  size: number;
  maxSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  memoryUsage: number;
}

/**
 * LRU 样式缓存实现
 */
export class LRUStyleCache implements StyleCache {
  private cache = new Map<string, CacheNode>();
  private head?: CacheNode;
  private tail?: CacheNode;
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  private cleanupTimer?: number;

  private readonly config: Required<CacheConfig>;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      ttl: 300000, // 5分钟
      enableAccessCount: true,
      cleanupInterval: 60000, // 1分钟
      ...config,
    };

    // 启动定时清理
    this.startCleanupTimer();
  }

  /**
   * 获取缓存项
   */
  get(key: string): CompiledStyle | undefined {
    const node = this.cache.get(key);

    if (!node) {
      this.missCount++;
      return undefined;
    }

    // 检查是否过期
    if (this.isExpired(node)) {
      this.delete(key);
      this.missCount++;
      return undefined;
    }

    this.hitCount++;

    // 更新访问信息
    if (this.config.enableAccessCount) {
      node.accessCount++;
    }

    // 移动到头部（最近使用）
    this.moveToHead(node);

    // 触发缓存命中事件
    globalEvents.emit("cache-hit", { key, value: deepClone(node.value) });

    return deepClone(node.value);
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: CompiledStyle): void {
    const node: CacheNode = {
      key,
      value: deepClone(value),
      timestamp: Date.now(),
      accessCount: 0,
    };

    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, node);
    this.addToHead(node);

    // 触发缓存设置事件
    globalEvents.emit("cache-set", { key, value: deepClone(value) });
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    const node = this.cache.get(key);
    return node !== undefined && !this.isExpired(node);
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }

    this.cache.delete(key);
    this.removeNode(node);
    return true;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.head = undefined;
    this.tail = undefined;
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate,
      evictionCount: this.evictionCount,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * 手动清理过期项
   */
  cleanup(): number {
    const expiredKeys: string[] = [];
    const now = Date.now();

    for (const [key, node] of this.cache) {
      if (now - node.timestamp > this.config.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
    }

    return expiredKeys.length;
  }

  /**
   * 获取热点数据（访问次数最多的前N项）
   */
  getHotData(limit: number = 10): Array<{ key: string; accessCount: number; value: CompiledStyle }> {
    if (!this.config.enableAccessCount) {
      return [];
    }

    const nodes = Array.from(this.cache.values());
    nodes.sort((a, b) => b.accessCount - a.accessCount);

    return nodes.slice(0, limit).map(node => ({
      key: node.key,
      accessCount: node.accessCount,
      value: node.value,
    }));
  }

  /**
   * 预热缓存（批量设置）
   */
  warmup(entries: Array<{ key: string; value: CompiledStyle }>): void {
    for (const { key, value } of entries) {
      this.set(key, value);
    }
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
  }

  /**
   * 检查节点是否过期
   */
  private isExpired(node: CacheNode): boolean {
    return Date.now() - node.timestamp > this.config.ttl;
  }

  /**
   * 移动节点到头部
   */
  private moveToHead(node: CacheNode): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * 添加节点到头部
   */
  private addToHead(node: CacheNode): void {
    node.prev = undefined;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  /**
   * 移除节点
   */
  private removeNode(node: CacheNode): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  /**
   * 驱逐最少使用的节点
   */
  private evictLRU(): void {
    if (this.tail) {
      this.cache.delete(this.tail.key);
      this.removeNode(this.tail);
      this.evictionCount++;
    }
  }

  /**
   * 估算内存使用量
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    for (const node of this.cache.values()) {
      // 估算节点大小
      totalSize += node.key.length * 2; // key (Unicode)
      totalSize += node.value.className.length * 2; // className
      totalSize += node.value.css.length * 2; // css
      totalSize += node.value.hash.length * 2; // hash
      totalSize += 64; // 其他字段和对象开销
    }

    return totalSize;
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = window.setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
  }

  /**
   * 停止清理定时器
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
}

/**
 * 简单内存缓存实现（无过期和LRU）
 */
export class SimpleStyleCache implements StyleCache {
  private cache = new Map<string, CompiledStyle>();
  private hitCount = 0;
  private missCount = 0;

  get(key: string): CompiledStyle | undefined {
    const value = this.cache.get(key);
    if (value) {
      this.hitCount++;
      return value;
    } else {
      this.missCount++;
      return undefined;
    }
  }

  set(key: string, value: CompiledStyle): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: Infinity,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate,
      evictionCount: 0,
      memoryUsage: 0,
    };
  }
}

/**
 * 创建样式缓存实例
 */
export function createStyleCache(config?: Partial<CacheConfig>): StyleCache {
  return new LRUStyleCache(config);
}

/**
 * 创建简单样式缓存实例
 */
export function createSimpleStyleCache(): StyleCache {
  return new SimpleStyleCache();
}

/**
 * 缓存工具函数
 */
export const cacheUtils = {
  /**
   * 生成缓存键
   */
  generateCacheKey(data: any): string {
    return generateHash(JSON.stringify(data));
  },

  /**
   * 批量清理多个缓存
   */
  batchCleanup(caches: StyleCache[]): number {
    let totalCleaned = 0;
    for (const cache of caches) {
      if (cache instanceof LRUStyleCache) {
        totalCleaned += cache.cleanup();
      }
    }
    return totalCleaned;
  },

  /**
   * 获取所有缓存的统计信息
   */
  getAllStats(caches: StyleCache[]): CacheStats[] {
    return caches.map(cache => {
      if (cache instanceof LRUStyleCache || cache instanceof SimpleStyleCache) {
        return cache.getStats();
      }
      return {
        size: cache.size(),
        maxSize: 0,
        hitCount: 0,
        missCount: 0,
        hitRate: 0,
        evictionCount: 0,
        memoryUsage: 0,
      };
    });
  },

  /**
   * 创建分层缓存（L1 + L2）
   */
  createTieredCache(l1Config?: Partial<CacheConfig>, l2Config?: Partial<CacheConfig>): StyleCache {
    const l1Cache = new LRUStyleCache({ maxSize: 100, ...l1Config });
    const l2Cache = new LRUStyleCache({ maxSize: 1000, ...l2Config });

    return {
      get(key: string): CompiledStyle | undefined {
        // 先查L1缓存
        let value = l1Cache.get(key);
        if (value) {
          return value;
        }

        // 再查L2缓存
        value = l2Cache.get(key);
        if (value) {
          // 提升到L1缓存
          l1Cache.set(key, value);
          return value;
        }

        return undefined;
      },

      set(key: string, value: CompiledStyle): void {
        l1Cache.set(key, value);
        l2Cache.set(key, value);
      },

      has(key: string): boolean {
        return l1Cache.has(key) || l2Cache.has(key);
      },

      delete(key: string): boolean {
        const deleted1 = l1Cache.delete(key);
        const deleted2 = l2Cache.delete(key);
        return deleted1 || deleted2;
      },

      clear(): void {
        l1Cache.clear();
        l2Cache.clear();
      },

      size(): number {
        return l1Cache.size() + l2Cache.size();
      },
    };
  },
};
