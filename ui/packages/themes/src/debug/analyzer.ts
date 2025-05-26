/**
 * 样式分析器
 * 提供样式使用统计、复杂度分析、依赖图生成等功能
 */

import { find } from "@xihan-ui/utils/dom";
import type {
  StyleUsageStats,
  ComplexityReport,
  DependencyGraph,
  DuplicateReport,
  ComplexityFactor,
  DependencyNode,
  DependencyEdge,
  DuplicateOccurrence,
} from "./types";
import type { StyleObject } from "../css-in-js/types";

/**
 * 样式分析器类
 */
export class StyleAnalyzer {
  private styleCache: Map<string, StyleObject> = new Map();
  private analysisCache: Map<string, any> = new Map();

  /**
   * 获取样式使用统计
   */
  getUsageStats(): StyleUsageStats {
    const cacheKey = "usage-stats";
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const allRules = this.getAllCSSRules();
    const usedRules = this.getUsedRules(allRules);
    const unusedRules = this.getUnusedRules(allRules);
    const duplicateRules = this.findDuplicates();
    const averageSpecificity = this.calculateAverageSpecificity(allRules);
    const complexityScore = this.calculateOverallComplexity();

    const stats: StyleUsageStats = {
      totalRules: allRules.length,
      usedRules: usedRules.length,
      unusedRules: unusedRules.map(rule => rule.selectorText),
      duplicateRules,
      averageSpecificity,
      complexityScore,
    };

    this.analysisCache.set(cacheKey, stats);
    return stats;
  }

  /**
   * 分析样式复杂度
   */
  analyzeComplexity(styles?: StyleObject): ComplexityReport {
    if (styles) {
      return this.analyzeStyleObjectComplexity(styles);
    }

    const cacheKey = "complexity-report";
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const allRules = this.getAllCSSRules();
    const factors: ComplexityFactor[] = [];
    let totalScore = 0;

    // 分析选择器复杂度
    const selectorComplexity = this.analyzeSelectorComplexity(allRules);
    factors.push(...selectorComplexity.factors);
    totalScore += selectorComplexity.score;

    // 分析嵌套复杂度
    const nestingComplexity = this.analyzeNestingComplexity();
    factors.push(...nestingComplexity.factors);
    totalScore += nestingComplexity.score;

    // 分析媒体查询复杂度
    const mediaComplexity = this.analyzeMediaQueryComplexity(allRules);
    factors.push(...mediaComplexity.factors);
    totalScore += mediaComplexity.score;

    // 分析属性复杂度
    const propertyComplexity = this.analyzePropertyComplexity(allRules);
    factors.push(...propertyComplexity.factors);
    totalScore += propertyComplexity.score;

    const report: ComplexityReport = {
      score: totalScore,
      factors,
      suggestions: this.generateComplexitySuggestions(factors, totalScore),
      breakdown: {
        selectors: selectorComplexity.score,
        properties: propertyComplexity.score,
        nesting: nestingComplexity.score,
        mediaQueries: mediaComplexity.score,
      },
    };

    this.analysisCache.set(cacheKey, report);
    return report;
  }

  /**
   * 生成依赖图
   */
  generateDependencyGraph(): DependencyGraph {
    const cacheKey = "dependency-graph";
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];
    const cycles: string[][] = [];

    // 分析样式表依赖
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach((sheet, index) => {
      if (sheet.href) {
        nodes.push({
          id: `stylesheet-${index}`,
          type: "style",
          name: sheet.href.split("/").pop() || `stylesheet-${index}`,
          size: this.getStylesheetSize(sheet),
        });
      }
    });

    // 分析 @import 依赖
    this.analyzeImportDependencies(stylesheets, edges);

    // 分析组件样式依赖
    this.analyzeComponentDependencies(nodes, edges);

    // 检测循环依赖
    const detectedCycles = this.detectCycles(nodes, edges);
    cycles.push(...detectedCycles);

    const graph: DependencyGraph = {
      nodes,
      edges,
      cycles,
    };

    this.analysisCache.set(cacheKey, graph);
    return graph;
  }

  /**
   * 查找重复样式
   */
  findDuplicates(): DuplicateReport[] {
    const cacheKey = "duplicates";
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const duplicates: DuplicateReport[] = [];
    const ruleGroups = new Map<string, DuplicateOccurrence[]>();

    // 收集所有规则
    const allRules = this.getAllCSSRules();
    allRules.forEach((rule, index) => {
      if (rule instanceof CSSStyleRule) {
        const properties = Array.from(rule.style).sort();
        const key = properties.join("|");

        if (!ruleGroups.has(key)) {
          ruleGroups.set(key, []);
        }

        ruleGroups.get(key)!.push({
          source: rule.parentStyleSheet?.href || "inline",
          line: index, // 简化的行号
          styles: this.cssRuleToStyleObject(rule),
        });
      }
    });

    // 查找重复
    ruleGroups.forEach((occurrences, key) => {
      if (occurrences.length > 1) {
        const properties = key.split("|");
        const similarity = this.calculateSimilarity(occurrences);

        duplicates.push({
          selector: String((occurrences[0].styles as any).selector || "unknown"),
          properties,
          occurrences,
          similarity,
        });
      }
    });

    this.analysisCache.set(cacheKey, duplicates);
    return duplicates;
  }

  /**
   * 分析样式表大小
   */
  analyzeSize(): {
    totalSize: number;
    breakdown: Record<string, number>;
    recommendations: string[];
  } {
    let totalSize = 0;
    const breakdown: Record<string, number> = {};

    // 分析内联样式
    const inlineStyles = find.all("[style]");
    const inlineSize = inlineStyles.reduce((size, el) => {
      return size + (el.getAttribute("style")?.length || 0);
    }, 0);
    breakdown.inline = inlineSize;
    totalSize += inlineSize;

    // 分析样式表
    Array.from(document.styleSheets).forEach((sheet, index) => {
      const size = this.getStylesheetSize(sheet);
      const name = sheet.href?.split("/").pop() || `stylesheet-${index}`;
      breakdown[name] = size;
      totalSize += size;
    });

    // 分析注入的样式
    const injectedStyles = find.all('style[data-xihan-ui="true"]');
    const injectedSize = injectedStyles.reduce((size, el) => {
      return size + (el.textContent?.length || 0);
    }, 0);
    breakdown.injected = injectedSize;
    totalSize += injectedSize;

    const recommendations = this.generateSizeRecommendations(totalSize, breakdown);

    return {
      totalSize,
      breakdown,
      recommendations,
    };
  }

  /**
   * 清除分析缓存
   */
  clearCache(): void {
    this.analysisCache.clear();
  }

  /**
   * 更新样式缓存
   */
  updateStyleCache(id: string, styles: StyleObject): void {
    this.styleCache.set(id, styles);
    this.clearCache(); // 清除分析缓存以确保数据一致性
  }

  // 私有方法

  private getAllCSSRules(): CSSRule[] {
    const rules: CSSRule[] = [];
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        const cssRules = Array.from(sheet.cssRules || []);
        rules.push(...cssRules);
      } catch (e) {
        // 忽略跨域样式表
      }
    });
    return rules;
  }

  private getUsedRules(rules: CSSRule[]): CSSRule[] {
    return rules.filter(rule => {
      if (rule instanceof CSSStyleRule) {
        try {
          return document.querySelector(rule.selectorText) !== null;
        } catch (e) {
          return false;
        }
      }
      return true; // 非样式规则默认认为是使用的
    });
  }

  private getUnusedRules(rules: CSSRule[]): CSSStyleRule[] {
    return rules.filter(rule => {
      if (rule instanceof CSSStyleRule) {
        try {
          return document.querySelector(rule.selectorText) === null;
        } catch (e) {
          return true; // 无效选择器认为是未使用的
        }
      }
      return false;
    }) as CSSStyleRule[];
  }

  private calculateAverageSpecificity(rules: CSSRule[]): number {
    const specificities = rules
      .filter(rule => rule instanceof CSSStyleRule)
      .map(rule => this.calculateSelectorSpecificity((rule as CSSStyleRule).selectorText));

    if (specificities.length === 0) return 0;

    const total = specificities.reduce((sum, spec) => sum + spec, 0);
    return total / specificities.length;
  }

  private calculateSelectorSpecificity(selector: string): number {
    // 简化的特异性计算
    const ids = (selector.match(/#/g) || []).length;
    const classes = (selector.match(/\./g) || []).length + (selector.match(/\[/g) || []).length;
    const elements = (selector.match(/[a-zA-Z]/g) || []).length - classes;

    return ids * 100 + classes * 10 + elements;
  }

  private calculateOverallComplexity(): number {
    const rules = this.getAllCSSRules();
    let complexity = 0;

    rules.forEach(rule => {
      if (rule instanceof CSSStyleRule) {
        // 选择器复杂度
        complexity += this.calculateSelectorSpecificity(rule.selectorText) / 10;

        // 属性数量
        complexity += rule.style.length;

        // 嵌套深度（简化计算）
        const nestingLevel = (rule.selectorText.match(/\s/g) || []).length;
        complexity += nestingLevel * 2;
      }
    });

    return Math.round(complexity);
  }

  private analyzeStyleObjectComplexity(styles: StyleObject): ComplexityReport {
    const factors: ComplexityFactor[] = [];
    let score = 0;

    // 分析属性数量
    const propertyCount = Object.keys(styles).length;
    if (propertyCount > 20) {
      factors.push({
        type: "property",
        impact: propertyCount - 20,
        description: `样式对象包含 ${propertyCount} 个属性，建议拆分`,
      });
      score += propertyCount - 20;
    }

    // 分析嵌套深度
    const nestingDepth = this.calculateNestingDepth(styles);
    if (nestingDepth > 3) {
      factors.push({
        type: "nesting",
        impact: (nestingDepth - 3) * 5,
        description: `嵌套深度为 ${nestingDepth}，建议减少嵌套`,
      });
      score += (nestingDepth - 3) * 5;
    }

    return {
      score,
      factors,
      suggestions: this.generateComplexitySuggestions(factors, score),
      breakdown: {
        selectors: 0,
        properties: propertyCount,
        nesting: nestingDepth,
        mediaQueries: 0,
      },
    };
  }

  private calculateNestingDepth(obj: any, depth = 0): number {
    let maxDepth = depth;

    Object.values(obj).forEach(value => {
      if (typeof value === "object" && value !== null) {
        const nestedDepth = this.calculateNestingDepth(value, depth + 1);
        maxDepth = Math.max(maxDepth, nestedDepth);
      }
    });

    return maxDepth;
  }

  private analyzeSelectorComplexity(rules: CSSRule[]): { score: number; factors: ComplexityFactor[] } {
    const factors: ComplexityFactor[] = [];
    let score = 0;

    const styleRules = rules.filter(rule => rule instanceof CSSStyleRule) as CSSStyleRule[];
    const complexSelectors = styleRules.filter(rule => {
      const specificity = this.calculateSelectorSpecificity(rule.selectorText);
      return specificity > 50;
    });

    if (complexSelectors.length > 0) {
      const impact = complexSelectors.length * 2;
      factors.push({
        type: "selector",
        impact,
        description: `发现 ${complexSelectors.length} 个高特异性选择器`,
      });
      score += impact;
    }

    return { score, factors };
  }

  private analyzeNestingComplexity(): { score: number; factors: ComplexityFactor[] } {
    const factors: ComplexityFactor[] = [];
    let score = 0;

    // 这里可以分析样式对象的嵌套复杂度
    // 由于我们主要处理 CSS-in-JS，这个分析会在样式对象级别进行

    return { score, factors };
  }

  private analyzeMediaQueryComplexity(rules: CSSRule[]): { score: number; factors: ComplexityFactor[] } {
    const factors: ComplexityFactor[] = [];
    let score = 0;

    const mediaRules = rules.filter(rule => rule instanceof CSSMediaRule);
    if (mediaRules.length > 10) {
      const impact = (mediaRules.length - 10) * 3;
      factors.push({
        type: "media",
        impact,
        description: `媒体查询数量过多 (${mediaRules.length})，建议合并`,
      });
      score += impact;
    }

    return { score, factors };
  }

  private analyzePropertyComplexity(rules: CSSRule[]): { score: number; factors: ComplexityFactor[] } {
    const factors: ComplexityFactor[] = [];
    let score = 0;

    const styleRules = rules.filter(rule => rule instanceof CSSStyleRule) as CSSStyleRule[];
    const totalProperties = styleRules.reduce((total, rule) => total + rule.style.length, 0);

    if (totalProperties > 1000) {
      const impact = Math.floor((totalProperties - 1000) / 100);
      factors.push({
        type: "property",
        impact,
        description: `CSS 属性总数过多 (${totalProperties})，建议优化`,
      });
      score += impact;
    }

    return { score, factors };
  }

  private generateComplexitySuggestions(factors: ComplexityFactor[], totalScore: number): string[] {
    const suggestions: string[] = [];

    if (totalScore > 100) {
      suggestions.push("整体复杂度较高，建议进行样式重构");
    }

    factors.forEach(factor => {
      switch (factor.type) {
        case "selector":
          suggestions.push("减少选择器特异性，使用更简单的选择器");
          break;
        case "nesting":
          suggestions.push("减少样式嵌套深度，提高可读性");
          break;
        case "media":
          suggestions.push("合并相似的媒体查询，减少重复");
          break;
        case "property":
          suggestions.push("拆分大型样式对象，提高可维护性");
          break;
      }
    });

    return [...new Set(suggestions)]; // 去重
  }

  private getStylesheetSize(sheet: CSSStyleSheet): number {
    try {
      const rules = Array.from(sheet.cssRules || []);
      return rules.reduce((size, rule) => size + rule.cssText.length, 0);
    } catch (e) {
      return 0;
    }
  }

  private analyzeImportDependencies(stylesheets: CSSStyleSheet[], edges: DependencyEdge[]): void {
    stylesheets.forEach((sheet, index) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule instanceof CSSImportRule) {
            edges.push({
              from: `stylesheet-${index}`,
              to: rule.href,
              type: "import",
              weight: 1,
            });
          }
        });
      } catch (e) {
        // 忽略跨域样式表
      }
    });
  }

  private analyzeComponentDependencies(nodes: DependencyNode[], edges: DependencyEdge[]): void {
    // 分析组件样式依赖关系
    // 这里可以根据实际的组件系统进行扩展
  }

  private detectCycles(nodes: DependencyNode[], edges: DependencyEdge[]): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(edge => edge.from === nodeId);
      outgoingEdges.forEach(edge => {
        dfs(edge.to, [...path, nodeId]);
      });

      recursionStack.delete(nodeId);
    };

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    });

    return cycles;
  }

  private cssRuleToStyleObject(rule: CSSStyleRule): StyleObject {
    const styles: StyleObject = {};

    for (let i = 0; i < rule.style.length; i++) {
      const property = rule.style[i];
      const value = rule.style.getPropertyValue(property);
      (styles as any)[property] = value;
    }

    // 添加选择器信息作为特殊属性
    (styles as any).selector = rule.selectorText;

    return styles;
  }

  private calculateSimilarity(occurrences: DuplicateOccurrence[]): number {
    if (occurrences.length < 2) return 0;

    const first = occurrences[0].styles;
    const similarities = occurrences.slice(1).map(occ => {
      const second = occ.styles;
      const firstKeys = Object.keys(first);
      const secondKeys = Object.keys(second);
      const commonKeys = firstKeys.filter(key => secondKeys.includes(key));

      return commonKeys.length / Math.max(firstKeys.length, secondKeys.length);
    });

    return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  }

  private generateSizeRecommendations(totalSize: number, breakdown: Record<string, number>): string[] {
    const recommendations: string[] = [];

    if (totalSize > 500000) {
      // 500KB
      recommendations.push("样式总大小超过 500KB，建议进行代码分割");
    }

    if (breakdown.inline > 50000) {
      // 50KB
      recommendations.push("内联样式过多，建议提取到样式表");
    }

    const largestFile = Object.entries(breakdown).reduce(
      (max, [name, size]) => {
        return size > max.size ? { name, size } : max;
      },
      { name: "", size: 0 },
    );

    if (largestFile.size > 100000) {
      // 100KB
      recommendations.push(`${largestFile.name} 文件过大，建议拆分`);
    }

    return recommendations;
  }
}

/**
 * 创建样式分析器实例
 */
export function createStyleAnalyzer(): StyleAnalyzer {
  return new StyleAnalyzer();
}
