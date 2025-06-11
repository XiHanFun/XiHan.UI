/**
 * 样式分析器
 * 分析样式使用情况、性能问题等
 */

// =============================================
// 样式分析器
// =============================================

export class StyleAnalyzer {
  private styleSheets: CSSStyleSheet[] = [];
  private unusedRules: CSSRule[] = [];

  constructor() {
    this.collectStyleSheets();
  }

  /**
   * 收集所有样式表
   */
  private collectStyleSheets(): void {
    this.styleSheets = Array.from(document.styleSheets).filter(sheet => {
      try {
        // 检查是否可以访问样式表规则
        sheet.cssRules;
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * 分析未使用的 CSS 规则
   */
  analyzeUnusedRules(): CSSRule[] {
    this.unusedRules = [];

    this.styleSheets.forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            if (!document.querySelector(selector)) {
              this.unusedRules.push(rule);
            }
          }
        });
      } catch (error) {
        console.warn("Cannot analyze stylesheet:", error);
      }
    });

    return this.unusedRules;
  }

  /**
   * 获取样式统计信息
   */
  getStyleStats(): {
    totalRules: number;
    unusedRules: number;
    totalSelectors: number;
    duplicateRules: number;
  } {
    let totalRules = 0;
    let totalSelectors = 0;
    const selectorMap = new Map<string, number>();

    this.styleSheets.forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            totalRules++;
            const selector = rule.selectorText;
            totalSelectors++;
            selectorMap.set(selector, (selectorMap.get(selector) || 0) + 1);
          }
        });
      } catch (error) {
        console.warn("Cannot analyze stylesheet:", error);
      }
    });

    const duplicateRules = Array.from(selectorMap.values()).filter(count => count > 1).length;

    return {
      totalRules,
      unusedRules: this.unusedRules.length,
      totalSelectors,
      duplicateRules,
    };
  }

  /**
   * 分析 CSS 变量使用情况
   */
  analyzeCSSVariables(): {
    defined: string[];
    used: string[];
    unused: string[];
  } {
    const defined = new Set<string>();
    const used = new Set<string>();

    // 收集定义的 CSS 变量
    this.styleSheets.forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const property = style[i];
              if (property.startsWith("--")) {
                defined.add(property);
              }
              const value = style.getPropertyValue(property);
              const varMatches = value.match(/var\((--[^,)]+)/g);
              if (varMatches) {
                varMatches.forEach(match => {
                  const varName = match.replace("var(", "");
                  used.add(varName);
                });
              }
            }
          }
        });
      } catch (error) {
        console.warn("Cannot analyze CSS variables:", error);
      }
    });

    const definedArray = Array.from(defined);
    const usedArray = Array.from(used);
    const unused = definedArray.filter(variable => !used.has(variable));

    return {
      defined: definedArray,
      used: usedArray,
      unused,
    };
  }

  /**
   * 生成分析报告
   */
  generateReport(): {
    stats: ReturnType<StyleAnalyzer["getStyleStats"]>;
    variables: ReturnType<StyleAnalyzer["analyzeCSSVariables"]>;
    unusedRules: CSSRule[];
    recommendations: string[];
  } {
    const stats = this.getStyleStats();
    const variables = this.analyzeCSSVariables();
    const unusedRules = this.analyzeUnusedRules();

    const recommendations: string[] = [];

    if (stats.unusedRules > 0) {
      recommendations.push(`发现 ${stats.unusedRules} 个未使用的 CSS 规则，建议清理`);
    }

    if (stats.duplicateRules > 0) {
      recommendations.push(`发现 ${stats.duplicateRules} 个重复的选择器，建议合并`);
    }

    if (variables.unused.length > 0) {
      recommendations.push(`发现 ${variables.unused.length} 个未使用的 CSS 变量，建议删除`);
    }

    return {
      stats,
      variables,
      unusedRules,
      recommendations,
    };
  }
}

// =============================================
// 导出实例
// =============================================

export const styleAnalyzer = new StyleAnalyzer();
