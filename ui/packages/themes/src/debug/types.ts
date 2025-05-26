/**
 * 样式调试工具类型定义
 */

import type { StyleObject } from "../css-in-js/types";

/**
 * 样式检查结果
 */
export interface StyleInspectionResult {
  element: HTMLElement;
  computedStyles: CSSStyleDeclaration;
  appliedRules: CSSRule[];
  inheritedStyles: Record<string, string>;
  customProperties: Record<string, string>;
  conflicts: ConflictReport[];
  specificity: SpecificityInfo;
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  totalStyles: number;
  compilationTime: number;
  injectionTime: number;
  cacheHitRate: number;
  memoryUsage: MemoryUsage;
  renderTime: number;
  recommendations: string[];
}

/**
 * 样式冲突报告
 */
export interface ConflictReport {
  property: string;
  conflictingRules: ConflictingRule[];
  winner: ConflictingRule;
  reason: "specificity" | "importance" | "order";
  severity: "low" | "medium" | "high";
}

/**
 * 冲突规则
 */
export interface ConflictingRule {
  selector: string;
  value: string;
  specificity: number;
  important: boolean;
  source: string;
  line?: number;
}

/**
 * 样式覆盖链
 */
export interface OverrideChain {
  property: string;
  chain: OverrideStep[];
  finalValue: string;
}

/**
 * 覆盖步骤
 */
export interface OverrideStep {
  selector: string;
  value: string;
  specificity: number;
  important: boolean;
  overridden: boolean;
}

/**
 * 样式差异
 */
export interface StyleDiff {
  added: Record<string, any>;
  removed: Record<string, any>;
  changed: Record<string, { from: any; to: any }>;
  unchanged: Record<string, any>;
}

/**
 * 样式使用统计
 */
export interface StyleUsageStats {
  totalRules: number;
  usedRules: number;
  unusedRules: string[];
  duplicateRules: DuplicateReport[];
  averageSpecificity: number;
  complexityScore: number;
}

/**
 * 复杂度报告
 */
export interface ComplexityReport {
  score: number;
  factors: ComplexityFactor[];
  suggestions: string[];
  breakdown: {
    selectors: number;
    properties: number;
    nesting: number;
    mediaQueries: number;
  };
}

/**
 * 复杂度因子
 */
export interface ComplexityFactor {
  type: "selector" | "nesting" | "media" | "property";
  impact: number;
  description: string;
}

/**
 * 依赖图
 */
export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  cycles: string[][];
}

/**
 * 依赖节点
 */
export interface DependencyNode {
  id: string;
  type: "style" | "theme" | "component";
  name: string;
  size: number;
}

/**
 * 依赖边
 */
export interface DependencyEdge {
  from: string;
  to: string;
  type: "import" | "extend" | "reference";
  weight: number;
}

/**
 * 重复报告
 */
export interface DuplicateReport {
  selector: string;
  properties: string[];
  occurrences: DuplicateOccurrence[];
  similarity: number;
}

/**
 * 重复出现
 */
export interface DuplicateOccurrence {
  source: string;
  line: number;
  styles: StyleObject;
}

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  totalSize: number;
  cacheSize: number;
  injectedStyles: number;
  domNodes: number;
  breakdown: {
    cache: number;
    dom: number;
    listeners: number;
    other: number;
  };
}

/**
 * 特异性信息
 */
export interface SpecificityInfo {
  inline: number;
  ids: number;
  classes: number;
  elements: number;
  total: number;
  important: boolean;
}

/**
 * 调试配置
 */
export interface DebugConfig {
  enabled: boolean;
  logLevel: "error" | "warn" | "info" | "debug";
  showPerformance: boolean;
  showConflicts: boolean;
  showUnused: boolean;
  autoAnalyze: boolean;
}

/**
 * 样式快照
 */
export interface StyleSnapshot {
  timestamp: number;
  styles: Record<string, StyleObject>;
  performance: PerformanceReport;
  conflicts: ConflictReport[];
}
