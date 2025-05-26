/**
 * 样式缓存系统
 * 基于 @utils 功能构建的高性能样式缓存
 */

import { generateId } from "@xihan-ui/utils";
import type { StyleCacheConfig, IStyleCache, CompiledStyle } from "./types";

/**
 * LRU 缓存节点
 */
interface CacheNode {
  key: string;
  value: CompiledStyle;
  timestamp: number;
  prev?: CacheNode;
  next?: CacheNode;
}

/**
 * 样式缓存实现
 */
export class StyleCache implements IStyleCache {
  private cache = new Map<string, CacheNode>();
  private head?: CacheNode;
  private tail?: CacheNode;
  private readonly config: Required<StyleCacheConfig>;

  constructor(config: StyleCacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000,
      ttl: config.ttl ?? 5 * 60 * 1000, // 5分钟
      lru: config.lru ?? true,
    };
  }

  /**
   * 获取缓存项
   */
  get(key: string): CompiledStyle | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;

    // 检查是否过期
    if (this.isExpired(node)) {
      this.delete(key);
      return undefined;
    }

    // LRU 策略：移动到头部
    if (this.config.lru) {
      this.moveToHead(node);
    }

    return node.value;
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: CompiledStyle): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      // 更新现有节点
      existingNode.value = value;
      existingNode.timestamp = Date.now();
      if (this.config.lru) {
        this.moveToHead(existingNode);
      }
      return;
    }

    // 创建新节点
    const newNode: CacheNode = {
      key,
      value,
      timestamp: Date.now(),
    };

    this.cache.set(key, newNode);

    if (this.config.lru) {
      this.addToHead(newNode);
    }

    // 检查缓存大小限制
    if (this.cache.size > this.config.maxSize) {
      this.evictLRU();
    }
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    if (this.isExpired(node)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.cache.delete(key);

    if (this.config.lru) {
      this.removeNode(node);
    }

    return true;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.head = undefined;
    this.tail = undefined;
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
  getStats() {
    const now = Date.now();
    let expiredCount = 0;

    for (const node of this.cache.values()) {
      if (this.isExpired(node)) {
        expiredCount++;
      }
    }

    return {
      total: this.cache.size,
      expired: expiredCount,
      active: this.cache.size - expiredCount,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    const expiredKeys: string[] = [];

    for (const [key, node] of this.cache.entries()) {
      if (this.isExpired(node)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
    return expiredKeys.length;
  }

  // 私有方法

  private isExpired(node: CacheNode): boolean {
    return Date.now() - node.timestamp > this.config.ttl;
  }

  private moveToHead(node: CacheNode): void {
    this.removeNode(node);
    this.addToHead(node);
  }

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

  private evictLRU(): void {
    if (!this.tail) return;

    const key = this.tail.key;
    this.delete(key);
  }

  private hitCount = 0;
  private missCount = 0;

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total === 0 ? 0 : this.hitCount / total;
  }
}

/**
 * 创建样式缓存实例
 */
export function createStyleCache(config?: StyleCacheConfig): StyleCache {
  return new StyleCache(config);
}

/**
 * 全局样式缓存实例
 */
export const globalStyleCache = createStyleCache({
  maxSize: 2000,
  ttl: 10 * 60 * 1000, // 10分钟
  lru: true,
});

/**
 * 缓存工具函数
 */
export const cacheUtils = {
  /**
   * 生成缓存键
   */
  generateKey(styles: object): string {
    const styleString = JSON.stringify(styles);
    return generateId(`cache-${styleString}`);
  },

  /**
   * 批量清理过期缓存
   */
  batchCleanup(caches: StyleCache[]): number {
    return caches.reduce((total, cache) => total + cache.cleanup(), 0);
  },

  /**
   * 获取所有缓存统计
   */
  getAllStats(caches: StyleCache[]) {
    return caches.map(cache => cache.getStats());
  },
};
