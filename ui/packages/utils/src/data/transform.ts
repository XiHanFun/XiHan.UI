/**
 * 数据结构转换工具
 */

/**
 * 树节点接口
 */
export interface TreeNode<T = any> {
  /**
   * 节点ID
   */
  id: string | number;

  /**
   * 父节点ID
   */
  parentId?: string | number | null;

  /**
   * 子节点
   */
  children?: TreeNode<T>[];

  /**
   * 其他属性
   */
  [key: string]: any;
}

/**
 * 列表转树配置选项
 */
export interface ListToTreeOptions {
  /**
   * ID字段名，默认为'id'
   */
  idKey?: string;

  /**
   * 父ID字段名，默认为'parentId'
   */
  parentIdKey?: string;

  /**
   * 子节点字段名，默认为'children'
   */
  childrenKey?: string;

  /**
   * 根节点的父ID值，默认为null
   */
  rootParentId?: string | number | null;
}

/**
 * 将平铺列表转换为树结构
 * @param list 平铺列表
 * @param options 配置选项
 * @returns 树结构
 */
export function listToTree<T extends Record<string, any>>(
  list: T[],
  options: Partial<ListToTreeOptions> = {},
): TreeNode<T>[] {
  const { idKey = "id", parentIdKey = "parentId", childrenKey = "children", rootParentId = null } = options;

  // 创建节点映射表
  const nodeMap = new Map<string | number, TreeNode<T>>();
  const result: TreeNode<T>[] = [];

  // 先构建所有节点的映射
  for (const item of list) {
    const id = item[idKey];
    // 确保节点符合TreeNode接口要求
    const node: TreeNode<T> = {
      id,
      ...item,
    };

    // 初始化子节点数组
    node[childrenKey] = [];

    nodeMap.set(id, node);
  }

  // 构建树结构
  for (const item of list) {
    const id = item[idKey];
    const parentId = item[parentIdKey];
    const node = nodeMap.get(id)!;

    if (parentId === rootParentId) {
      // 根节点直接添加到结果中
      result.push(node);
    } else {
      // 非根节点添加到父节点的子节点列表中
      const parentNode = nodeMap.get(parentId);

      if (parentNode) {
        parentNode[childrenKey].push(node);
      } else {
        // 找不到父节点时作为根节点处理
        result.push(node);
      }
    }
  }

  return result;
}

/**
 * 树转列表配置选项
 */
export interface TreeToListOptions {
  /**
   * 子节点字段名，默认为'children'
   */
  childrenKey?: string;

  /**
   * 是否在结果中保留子节点数组，默认为false
   */
  keepChildren?: boolean;
}

/**
 * 将树结构转换为平铺列表
 * @param tree 树结构
 * @param options 配置选项
 * @returns 平铺列表
 */
export function treeToList<T extends Record<string, any>>(tree: T[], options: Partial<TreeToListOptions> = {}): T[] {
  const { childrenKey = "children", keepChildren = false } = options;

  const result: T[] = [];

  const flatten = (nodes: T[]) => {
    for (const node of nodes) {
      const children = node[childrenKey] as T[];

      // 克隆节点，避免修改原始数据
      const clonedNode = { ...node };

      // 是否保留子节点数组
      if (!keepChildren) {
        delete clonedNode[childrenKey];
      }

      result.push(clonedNode);

      if (Array.isArray(children) && children.length > 0) {
        flatten(children);
      }
    }
  };

  flatten(tree);

  return result;
}

/**
 * 查找树节点配置选项
 */
export interface FindTreeNodeOptions {
  /**
   * 子节点字段名，默认为'children'
   */
  childrenKey?: string;
}

/**
 * 在树结构中查找节点
 * @param tree 树结构
 * @param predicate 查找条件函数
 * @param options 配置选项
 * @returns 找到的节点或undefined
 */
export function findTreeNode<T>(
  tree: T[],
  predicate: (node: T) => boolean,
  options: Partial<FindTreeNodeOptions> = {},
): T | undefined {
  const { childrenKey = "children" } = options;

  for (const node of tree) {
    if (predicate(node)) {
      return node;
    }

    const children = node[childrenKey as keyof T] as T[];

    if (Array.isArray(children) && children.length > 0) {
      const found = findTreeNode(children, predicate, options);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/**
 * 过滤树节点配置选项
 */
export interface FilterTreeOptions {
  /**
   * 子节点字段名，默认为'children'
   */
  childrenKey?: string;

  /**
   * 是否返回匹配节点的所有父节点，默认为false
   */
  includeParents?: boolean;
}

/**
 * 过滤树结构
 * @param tree 树结构
 * @param predicate 过滤条件函数
 * @param options 配置选项
 * @returns 过滤后的树结构
 */
export function filterTree<T>(
  tree: T[],
  predicate: (node: T) => boolean,
  options: Partial<FilterTreeOptions> = {},
): T[] {
  const { childrenKey = "children", includeParents = false } = options;

  const result: T[] = [];

  for (const node of tree) {
    const children = node[childrenKey as keyof T] as T[];
    let filteredChildren: T[] = [];

    if (Array.isArray(children) && children.length > 0) {
      filteredChildren = filterTree(children, predicate, options);
    }

    const nodeMatches = predicate(node);
    const hasMatchingChildren = filteredChildren.length > 0;

    if (nodeMatches || (includeParents && hasMatchingChildren)) {
      // 创建节点的副本
      const clonedNode = { ...node } as any;

      // 设置过滤后的子节点
      if (hasMatchingChildren) {
        clonedNode[childrenKey] = filteredChildren;
      } else if (nodeMatches) {
        clonedNode[childrenKey] = Array.isArray(children) ? [] : children;
      }

      result.push(clonedNode);
    }
  }

  return result;
}

/**
 * 遍历树结构配置选项
 */
export interface TraverseTreeOptions {
  /**
   * 子节点字段名，默认为'children'
   */
  childrenKey?: string;

  /**
   * 遍历模式，默认为'pre'（前序遍历）
   */
  mode?: "pre" | "post";
}

/**
 * 遍历树结构
 * @param tree 树结构
 * @param callback 回调函数
 * @param options 配置选项
 */
export function traverseTree<T>(
  tree: T[],
  callback: (node: T, index: number, parent: T | null) => void | boolean,
  options: Partial<TraverseTreeOptions> = {},
  parent: T | null = null,
): void {
  const { childrenKey = "children", mode = "pre" } = options;

  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];

    // 前序遍历：先访问当前节点，再访问子节点
    if (mode === "pre") {
      // 如果回调返回false，则停止遍历
      if (callback(node, i, parent) === false) {
        return;
      }
    }

    const children = node[childrenKey as keyof T] as T[];

    if (Array.isArray(children) && children.length > 0) {
      traverseTree(children, callback, options, node);
    }

    // 后序遍历：先访问子节点，再访问当前节点
    if (mode === "post") {
      // 如果回调返回false，则停止遍历
      if (callback(node, i, parent) === false) {
        return;
      }
    }
  }
}

/**
 * 将对象数组转换为Map
 * @param arr 对象数组
 * @param key 作为键的属性名
 * @returns 转换后的Map
 */
export function arrayToMap<T extends Record<string, any>, K extends keyof T>(arr: T[], key: K): Map<T[K], T> {
  return arr.reduce((map, item) => {
    map.set(item[key], item);
    return map;
  }, new Map<T[K], T>());
}

/**
 * 将对象数组按指定键分组
 * @param arr 对象数组
 * @param key 分组依据的属性名
 * @returns 分组结果
 */
export function groupBy<T extends Record<string, any>, K extends keyof T>(arr: T[], key: K): Record<string, T[]> {
  return arr.reduce(
    (result, item) => {
      const groupKey = String(item[key]);

      if (!result[groupKey]) {
        result[groupKey] = [];
      }

      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * 对象数组去重
 * @param arr 对象数组
 * @param key 唯一标识的属性名
 * @returns 去重后的数组
 */
export function uniqueBy<T extends Record<string, any>, K extends keyof T>(arr: T[], key: K): T[] {
  const map = new Map<any, T>();

  for (const item of arr) {
    map.set(item[key], item);
  }

  return Array.from(map.values());
}

/**
 * 对象数组排序
 * @param arr 对象数组
 * @param key 排序依据的属性名
 * @param order 排序顺序，默认为'asc'
 * @returns 排序后的数组
 */
export function sortBy<T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  key: K,
  order: "asc" | "desc" = "asc",
): T[] {
  const result = [...arr];

  result.sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA === valueB) {
      return 0;
    }

    const compareResult = valueA < valueB ? -1 : 1;
    return order === "asc" ? compareResult : -compareResult;
  });

  return result;
}

/**
 * 是否为简单对象 (由Object构造函数创建的对象或对象字面量)
 * @param obj 检查的对象
 * @returns 是否为简单对象
 */
export function isPlainObject(obj: any): boolean {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(obj);
  return proto === Object.prototype || proto === null;
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param sources 源对象
 * @returns 合并后的对象
 */
export function deepMerge<T>(target: T, ...sources: any[]): T {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (source === undefined) {
    return target;
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    const targetObj = target as Record<string, any>;
    for (const key in source) {
      const sourceObj = source as Record<string, any>;
      if (isPlainObject(sourceObj[key])) {
        if (!targetObj[key]) {
          Object.assign(targetObj, { [key]: {} });
        }

        deepMerge(targetObj[key], sourceObj[key]);
      } else if (Array.isArray(sourceObj[key])) {
        Object.assign(targetObj, { [key]: [...sourceObj[key]] });
      } else {
        Object.assign(targetObj, { [key]: sourceObj[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}
