/**
 * IndexedDB 数据库管理工具
 * 提供简单的类似键值对的操作接口，封装了复杂的 IndexedDB 操作
 */

// 导出IDBConfig接口
export interface IDBConfig {
  dbName: string;
  storeName: string;
  version?: number;
}

interface IDBPromise<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

/**
 * IndexedDB 存储类
 */
class IndexedDBStorage {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  /**
   * 创建 IndexedDB 存储实例
   * @param config 数据库配置
   */
  constructor(config: IDBConfig) {
    this.dbName = config.dbName;
    this.storeName = config.storeName;
    this.version = config.version || 1;
  }

  /**
   * 初始化数据库连接
   * @returns Promise 返回连接成功或失败的结果
   */
  public async init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(true);
        return;
      }

      if (!window.indexedDB) {
        reject(new Error("浏览器不支持 IndexedDB"));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = event => {
        reject(new Error("打开数据库失败"));
      };

      request.onsuccess = event => {
        this.db = (event.target as IDBRequest).result;
        resolve(true);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };
    });
  }

  /**
   * 执行数据库操作的通用方法
   * @param mode 事务模式
   * @param handler 操作处理函数
   * @returns Promise 返回操作结果
   */
  private async executeRequest<T>(
    mode: IDBTransactionMode,
    handler: (store: IDBObjectStore, dbPromise: IDBPromise<T>) => void,
  ): Promise<T> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }

      try {
        const transaction = this.db.transaction(this.storeName, mode);
        const store = transaction.objectStore(this.storeName);

        handler(store, { resolve, reject });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 存储数据到 IndexedDB
   * @param key 键
   * @param value 值
   * @returns Promise 返回操作结果
   */
  public async set(key: string, value: any): Promise<boolean> {
    return this.executeRequest<boolean>("readwrite", (store, { resolve, reject }) => {
      const request = store.put({ key, value });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error("存储数据失败"));
    });
  }

  /**
   * 从 IndexedDB 获取数据
   * @param key 键
   * @returns Promise 返回查询结果
   */
  public async get(key: string): Promise<any | null> {
    return this.executeRequest<any | null>("readonly", (store, { resolve, reject }) => {
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(new Error("获取数据失败"));
    });
  }

  /**
   * 从 IndexedDB 删除数据
   * @param key 键
   * @returns Promise 返回操作结果
   */
  public async remove(key: string): Promise<boolean> {
    return this.executeRequest<boolean>("readwrite", (store, { resolve, reject }) => {
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error("删除数据失败"));
    });
  }

  /**
   * 清空 IndexedDB 存储对象中的所有数据
   * @returns Promise 返回操作结果
   */
  public async clear(): Promise<boolean> {
    return this.executeRequest<boolean>("readwrite", (store, { resolve, reject }) => {
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error("清空数据失败"));
    });
  }

  /**
   * 获取所有数据
   * @returns Promise 返回所有数据的数组
   */
  public async getAll(): Promise<Array<{ key: string; value: any }>> {
    return this.executeRequest<Array<{ key: string; value: any }>>("readonly", (store, { resolve, reject }) => {
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(new Error("获取所有数据失败"));
    });
  }

  /**
   * 批量存储数据
   * @param items 要存储的键值对数组
   * @returns Promise 返回操作结果
   */
  public async setMany(items: Array<{ key: string; value: any }>): Promise<boolean> {
    return this.executeRequest<boolean>("readwrite", (store, { resolve, reject }) => {
      try {
        items.forEach(item => {
          store.put({ key: item.key, value: item.value });
        });
        resolve(true);
      } catch (error) {
        reject(new Error("批量存储数据失败"));
      }
    });
  }
}

/**
 * 创建 IndexedDB 存储实例
 * @param dbName 数据库名称
 * @param storeName 存储对象名称
 * @param version 数据库版本
 * @returns IndexedDB 存储实例
 */
export function createIndexedDBStorage(dbName: string, storeName: string, version?: number): IndexedDBStorage {
  return new IndexedDBStorage({ dbName, storeName, version });
}
