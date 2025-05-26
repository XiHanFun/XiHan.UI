/**
 * 样式调试器
 * 提供样式检查、冲突检测、性能分析等调试功能
 */

import { find, style as domStyle, cssVar } from "@xihan-ui/utils/dom";
import type {
  StyleInspectionResult,
  PerformanceReport,
  ConflictReport,
  OverrideChain,
  StyleDiff,
  DebugConfig,
  StyleSnapshot,
  SpecificityInfo,
  ConflictingRule,
  OverrideStep,
  MemoryUsage,
} from "./types";
import type { StyleObject } from "../css-in-js/types";

/**
 * 样式调试器类
 */
export class StyleDebugger {
  private config: DebugConfig;
  private snapshots: StyleSnapshot[] = [];
  private performanceMarks: Map<string, number> = new Map();

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = {
      enabled: true,
      logLevel: "info",
      showPerformance: true,
      showConflicts: true,
      showUnused: true,
      autoAnalyze: false,
      ...config,
    };
  }

  /**
   * 检查元素样式
   */
  inspect(element: HTMLElement): StyleInspectionResult {
    if (!this.config.enabled) {
      throw new Error("StyleDebugger is disabled");
    }

    const computedStyles = window.getComputedStyle(element);
    const appliedRules = this.getAppliedRules(element);
    const inheritedStyles = this.getInheritedStyles(element);
    const customProperties = this.getCustomProperties(element);
    const conflicts = this.detectConflicts(element);
    const specificity = this.calculateSpecificity(element);

    const result: StyleInspectionResult = {
      element,
      computedStyles,
      appliedRules,
      inheritedStyles,
      customProperties,
      conflicts,
      specificity,
    };

    this.log("info", "Element inspection completed", result);
    return result;
  }

  /**
   * 分析性能
   */
  analyzePerformance(): PerformanceReport {
    const startTime = performance.now();

    // 收集性能数据
    const totalStyles = this.getTotalStylesCount();
    const compilationTime = this.getAverageCompilationTime();
    const injectionTime = this.getAverageInjectionTime();
    const cacheHitRate = this.getCacheHitRate();
    const memoryUsage = this.getMemoryUsage();
    const renderTime = performance.now() - startTime;

    const report: PerformanceReport = {
      totalStyles,
      compilationTime,
      injectionTime,
      cacheHitRate,
      memoryUsage,
      renderTime,
      recommendations: this.generateRecommendations({
        totalStyles,
        compilationTime,
        injectionTime,
        cacheHitRate,
        memoryUsage,
      }),
    };

    this.log("info", "Performance analysis completed", report);
    return report;
  }

  /**
   * 检测样式冲突
   */
  detectConflicts(element?: HTMLElement): ConflictReport[] {
    const elements = element ? [element] : find.all("*");
    const conflicts: ConflictReport[] = [];

    elements.forEach(el => {
      const computedStyles = window.getComputedStyle(el);
      const appliedRules = this.getAppliedRules(el);

      // 检查每个属性的冲突
      for (const property of Array.from(computedStyles)) {
        const conflictingRules = this.findConflictingRules(appliedRules, property);
        if (conflictingRules.length > 1) {
          const winner = this.determineWinner(conflictingRules);
          conflicts.push({
            property,
            conflictingRules,
            winner,
            reason: this.getConflictReason(conflictingRules, winner),
            severity: this.assessConflictSeverity(conflictingRules),
          });
        }
      }
    });

    return conflicts;
  }

  /**
   * 查找未使用的样式
   */
  findUnusedStyles(): string[] {
    const allStylesheets = Array.from(document.styleSheets);
    const usedSelectors = new Set<string>();
    const unusedSelectors: string[] = [];

    // 收集所有使用的选择器
    allStylesheets.forEach(stylesheet => {
      try {
        const rules = Array.from(stylesheet.cssRules || []);
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            try {
              if (document.querySelector(selector)) {
                usedSelectors.add(selector);
              } else {
                unusedSelectors.push(selector);
              }
            } catch (e) {
              // 忽略无效选择器
            }
          }
        });
      } catch (e) {
        // 忽略跨域样式表
      }
    });

    return unusedSelectors;
  }

  /**
   * 获取样式覆盖链
   */
  getOverrideChain(element: HTMLElement, property: string): OverrideChain {
    const appliedRules = this.getAppliedRules(element);
    const relevantRules = appliedRules.filter(rule => {
      if (rule instanceof CSSStyleRule) {
        return rule.style.getPropertyValue(property);
      }
      return false;
    });

    const chain: OverrideStep[] = relevantRules.map((rule, index) => {
      const cssRule = rule as CSSStyleRule;
      const value = cssRule.style.getPropertyValue(property);
      const important = cssRule.style.getPropertyPriority(property) === "important";
      const specificity = this.calculateSelectorSpecificity(cssRule.selectorText);

      return {
        selector: cssRule.selectorText,
        value,
        specificity: specificity.total,
        important,
        overridden: index < relevantRules.length - 1,
      };
    });

    const finalValue = window.getComputedStyle(element).getPropertyValue(property);

    return {
      property,
      chain,
      finalValue,
    };
  }

  /**
   * 比较样式差异
   */
  diffStyles(before: StyleObject, after: StyleObject): StyleDiff {
    const added: Record<string, any> = {};
    const removed: Record<string, any> = {};
    const changed: Record<string, { from: any; to: any }> = {};
    const unchanged: Record<string, any> = {};

    // 检查新增和修改
    Object.entries(after).forEach(([key, value]) => {
      if (!(key in before)) {
        added[key] = value;
      } else if (before[key] !== value) {
        changed[key] = { from: before[key], to: value };
      } else {
        unchanged[key] = value;
      }
    });

    // 检查删除
    Object.entries(before).forEach(([key, value]) => {
      if (!(key in after)) {
        removed[key] = value;
      }
    });

    return { added, removed, changed, unchanged };
  }

  /**
   * 创建样式快照
   */
  createSnapshot(): StyleSnapshot {
    const timestamp = Date.now();
    const styles = this.collectAllStyles();
    const performance = this.analyzePerformance();
    const conflicts = this.detectConflicts();

    const snapshot: StyleSnapshot = {
      timestamp,
      styles,
      performance,
      conflicts,
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * 获取所有快照
   */
  getSnapshots(): StyleSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * 清除快照
   */
  clearSnapshots(): void {
    this.snapshots = [];
  }

  /**
   * 启用/禁用调试器
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 私有方法

  private getAppliedRules(element: HTMLElement): CSSRule[] {
    const rules: CSSRule[] = [];
    const allStylesheets = Array.from(document.styleSheets);

    allStylesheets.forEach(stylesheet => {
      try {
        const cssRules = Array.from(stylesheet.cssRules || []);
        cssRules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            try {
              if (element.matches(rule.selectorText)) {
                rules.push(rule);
              }
            } catch (e) {
              // 忽略无效选择器
            }
          }
        });
      } catch (e) {
        // 忽略跨域样式表
      }
    });

    return rules;
  }

  private getInheritedStyles(element: HTMLElement): Record<string, string> {
    const inherited: Record<string, string> = {};
    const inheritableProperties = [
      "color",
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "text-align",
      "visibility",
    ];

    let parent = element.parentElement;
    while (parent) {
      const parentStyles = window.getComputedStyle(parent);
      inheritableProperties.forEach(prop => {
        if (!inherited[prop]) {
          inherited[prop] = parentStyles.getPropertyValue(prop);
        }
      });
      parent = parent.parentElement;
    }

    return inherited;
  }

  private getCustomProperties(element: HTMLElement): Record<string, string> {
    const customProps: Record<string, string> = {};
    const computedStyles = window.getComputedStyle(element);

    // 获取所有 CSS 变量
    for (let i = 0; i < computedStyles.length; i++) {
      const property = computedStyles[i];
      if (property.startsWith("--")) {
        customProps[property] = computedStyles.getPropertyValue(property);
      }
    }

    return customProps;
  }

  private calculateSpecificity(element: HTMLElement): SpecificityInfo {
    const appliedRules = this.getAppliedRules(element);
    let maxSpecificity = { inline: 0, ids: 0, classes: 0, elements: 0, total: 0, important: false };

    appliedRules.forEach(rule => {
      if (rule instanceof CSSStyleRule) {
        const specificity = this.calculateSelectorSpecificity(rule.selectorText);
        if (specificity.total > maxSpecificity.total) {
          maxSpecificity = specificity;
        }
      }
    });

    // 检查内联样式
    if (element.style.length > 0) {
      maxSpecificity.inline = 1;
      maxSpecificity.total += 1000;
    }

    return maxSpecificity;
  }

  private calculateSelectorSpecificity(selector: string): SpecificityInfo {
    let ids = 0;
    let classes = 0;
    let elements = 0;
    let important = false;

    // 简化的特异性计算
    ids = (selector.match(/#/g) || []).length;
    classes = (selector.match(/\./g) || []).length + (selector.match(/\[/g) || []).length;
    elements = (selector.match(/[a-zA-Z]/g) || []).length - classes;

    const total = ids * 100 + classes * 10 + elements;

    return { inline: 0, ids, classes, elements, total, important };
  }

  private findConflictingRules(rules: CSSRule[], property: string): ConflictingRule[] {
    const conflicting: ConflictingRule[] = [];

    rules.forEach(rule => {
      if (rule instanceof CSSStyleRule) {
        const value = rule.style.getPropertyValue(property);
        if (value) {
          const important = rule.style.getPropertyPriority(property) === "important";
          const specificity = this.calculateSelectorSpecificity(rule.selectorText).total;

          conflicting.push({
            selector: rule.selectorText,
            value,
            specificity,
            important,
            source: rule.parentStyleSheet?.href || "inline",
          });
        }
      }
    });

    return conflicting;
  }

  private determineWinner(rules: ConflictingRule[]): ConflictingRule {
    return rules.reduce((winner, current) => {
      if (current.important && !winner.important) return current;
      if (!current.important && winner.important) return winner;
      if (current.specificity > winner.specificity) return current;
      return winner;
    });
  }

  private getConflictReason(rules: ConflictingRule[], winner: ConflictingRule): "specificity" | "importance" | "order" {
    const hasImportant = rules.some(rule => rule.important);
    if (hasImportant) return "importance";

    const maxSpecificity = Math.max(...rules.map(rule => rule.specificity));
    const highSpecificityRules = rules.filter(rule => rule.specificity === maxSpecificity);
    if (highSpecificityRules.length === 1) return "specificity";

    return "order";
  }

  private assessConflictSeverity(rules: ConflictingRule[]): "low" | "medium" | "high" {
    const specificityRange = Math.max(...rules.map(r => r.specificity)) - Math.min(...rules.map(r => r.specificity));
    if (specificityRange > 100) return "high";
    if (specificityRange > 10) return "medium";
    return "low";
  }

  private getTotalStylesCount(): number {
    let count = 0;
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        count += sheet.cssRules?.length || 0;
      } catch (e) {
        // 忽略跨域样式表
      }
    });
    return count;
  }

  private getAverageCompilationTime(): number {
    // 这里应该从样式引擎获取实际数据
    return 0;
  }

  private getAverageInjectionTime(): number {
    // 这里应该从样式注入器获取实际数据
    return 0;
  }

  private getCacheHitRate(): number {
    // 这里应该从缓存系统获取实际数据
    return 0;
  }

  private getMemoryUsage(): MemoryUsage {
    const styleElements = find.all('style[data-xihan-ui="true"]');
    const totalSize = styleElements.reduce((size, el) => size + (el.textContent?.length || 0), 0);

    return {
      totalSize,
      cacheSize: 0, // 从缓存系统获取
      injectedStyles: styleElements.length,
      domNodes: document.querySelectorAll("*").length,
      breakdown: {
        cache: 0,
        dom: totalSize,
        listeners: 0,
        other: 0,
      },
    };
  }

  private generateRecommendations(data: any): string[] {
    const recommendations: string[] = [];

    if (data.totalStyles > 1000) {
      recommendations.push("考虑减少样式规则数量或使用样式拆分");
    }

    if (data.compilationTime > 100) {
      recommendations.push("样式编译时间较长，考虑启用缓存或优化样式结构");
    }

    if (data.cacheHitRate < 0.8) {
      recommendations.push("缓存命中率较低，考虑调整缓存策略");
    }

    return recommendations;
  }

  private collectAllStyles(): Record<string, StyleObject> {
    // 这里应该从样式引擎收集所有样式
    return {};
  }

  private log(level: string, message: string, data?: any): void {
    if (!this.config.enabled) return;

    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    const currentLevel = levels[this.config.logLevel as keyof typeof levels];
    const messageLevel = levels[level as keyof typeof levels];

    if (messageLevel <= currentLevel) {
      const logMethod = console[level as "error" | "warn" | "info" | "debug"] || console.log;
      if (typeof logMethod === "function") {
        logMethod(`[StyleDebugger] ${message}`, data);
      }
    }
  }
}

/**
 * 创建样式调试器实例
 */
export function createStyleDebugger(config?: Partial<DebugConfig>): StyleDebugger {
  return new StyleDebugger(config);
}
