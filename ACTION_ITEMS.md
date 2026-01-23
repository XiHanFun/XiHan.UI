# XiHan.UI 架构改进行动清单

> **生成时间**: 2026-01-23  
> **项目版本**: v0.9.8  
> **目标**: V1.0 发布准备

## 📋 执行摘要

本文档是对 XiHan.UI 架构分析的**行动清单**，按优先级列出了需要完成的具体任务。

**总体评分**: 6.5/10  
**距离 V1.0 就绪**: 需要完成 12 周的改进工作

---

## ✅ 已完成改进（2026-01-23）

- [x] 创建 `ARCHITECTURE_ANALYSIS.md` - 详细架构分析报告
- [x] 创建 `ARCHITECTURE.md` - 完整架构文档
- [x] 创建 `CONTRIBUTING.md` - 贡献指南
- [x] 创建 `QUICK_START.md` - 快速开始指南
- [x] 创建 `SECURITY.md` - 安全策略
- [x] 添加 `vitest.config.ts` - 根级别测试配置
- [x] 添加 `.github/workflows/ci.yml` - CI 工作流
- [x] 添加 `.github/workflows/release.yml` - 发布工作流
- [x] 更新 `README.md` 和 `README_CN.md` - 添加文档导航
- [x] 改进 `ui/package.json` - 添加更多测试脚本

---

## 🔥 P0 - 必须立即修复（阻塞 V1.0）

### 1. 修复主题系统文档不一致 ⚠️

**问题**: `packages/themes/src/README.md` 描述的功能未实现

**任务**:
- [ ] 审查 `packages/themes/src/README.md`
- [ ] 移除或标记未实现功能（LRU Cache, StyleEngine, ResponsiveManager）
- [ ] 或者实现这些功能（预计 2 周）
- [ ] 确保文档与代码一致

**预计时间**: 2 天（仅更新文档）或 2 周（实现功能）

**负责人**: 待分配

---

### 2. 提升测试质量 ⚠️

**问题**: 测试覆盖率低，测试深度不足

**任务**:
- [ ] 增强现有测试（不仅仅是快照测试）
  - 添加行为测试
  - 添加边界条件测试
  - 添加事件测试
- [ ] 运行覆盖率报告: `pnpm test:coverage`
- [ ] 识别覆盖率低的模块
- [ ] 为关键组件添加深度测试
- [ ] 目标：整体覆盖率 > 70%

**预计时间**: 1-2 周

**负责人**: 待分配

**示例改进**:
```typescript
// 之前：仅快照测试
it('should render correctly', () => {
  const wrapper = mount(Button)
  expect(wrapper).toMatchSnapshot()
})

// 之后：增加行为测试
it('should emit click event', async () => {
  const wrapper = mount(Button)
  await wrapper.trigger('click')
  expect(wrapper.emitted('click')).toBeTruthy()
})

it('should handle disabled state', () => {
  const wrapper = mount(Button, { props: { disabled: true } })
  expect(wrapper.classes()).toContain('disabled')
  expect(wrapper.element.disabled).toBe(true)
})
```

---

### 3. 验证 CI/CD 工作流 ✅

**问题**: CI/CD 刚刚添加，需要验证

**任务**:
- [ ] 触发 CI 工作流（提交 PR 或 push 到 main）
- [ ] 确保所有 jobs 通过：
  - lint
  - typecheck
  - test
  - build
- [ ] 修复任何失败的检查
- [ ] 配置 Codecov（可选）
- [ ] 添加状态徽章到 README

**预计时间**: 2-3 天

**负责人**: 待分配

---

### 4. 检查循环依赖 ⚠️

**问题**: 包之间依赖关系复杂，可能存在循环依赖

**任务**:
- [ ] 安装 madge: `pnpm add -D madge`
- [ ] 运行检查: `madge --circular --extensions ts,tsx ui/packages`
- [ ] 如果发现循环依赖，重构代码消除它们
- [ ] 生成依赖图: `madge --image deps.png ui/packages`
- [ ] 将依赖图添加到 `ARCHITECTURE.md`

**预计时间**: 2 天

**负责人**: 待分配

**命令**:
```bash
cd /home/runner/work/XiHan.UI/XiHan.UI
pnpm add -D madge
cd ui
madge --circular --extensions ts,tsx packages
```

---

## ⚡ P1 - 高优先级（V1.0 前完成）

### 5. CLI 工具决策

**问题**: `@xihan-ui/cli` 包为空

**任务**:
- [ ] 团队讨论：是否在 V1.0 实现 CLI
- [ ] **选项 A**: 从 V1.0 移除 CLI
  - 更新 `DEVELOPMENT_PLAN.md`
  - 移除 `@xihan-ui/cli` 包引用
  - 延后到 V1.1
- [ ] **选项 B**: 实现基础 CLI
  - 实现 `create-component` 命令
  - 实现 `create-hook` 命令
  - 编写 CLI 文档

**预计时间**: 1 天（决策）或 1 周（实现）

**负责人**: 待分配

---

### 6. 完善 JSDoc 注释

**问题**: 组件缺少 API 文档

**任务**:
- [ ] 为所有公共组件添加 JSDoc
- [ ] 为所有公共 API 添加类型注释
- [ ] 为 props 添加描述和默认值
- [ ] 为 events 添加参数说明

**预计时间**: 1 周

**负责人**: 待分配

**进度跟踪**:
- [ ] Button 组件 JSDoc
- [ ] Input 组件 JSDoc
- [ ] Select 组件 JSDoc
- [ ] ... (其他 55+ 组件)

---

### 7. 添加 E2E 测试框架

**问题**: 缺少端到端测试

**任务**:
- [ ] 安装 Playwright: `pnpm add -D @playwright/test`
- [ ] 创建 `playwright.config.ts`
- [ ] 编写关键用户流程的 E2E 测试
  - 表单提交流程
  - 弹窗交互流程
  - 导航流程
- [ ] 将 E2E 测试添加到 CI

**预计时间**: 1 周

**负责人**: 待分配

---

## 📌 P2 - 中优先级（V1.1 前完成）

### 8. 集成国际化到组件

**问题**: locales 包存在但未集成

**任务**:
- [ ] 在组件中集成 i18n
- [ ] 为内置文案添加多语言支持
- [ ] 在 Playground 中添加语言切换
- [ ] 更新文档说明 i18n 使用

**预计时间**: 5 天

**负责人**: 待分配

---

### 9. 完善图标系统

**问题**: 图标系统实现不明确

**任务**:
- [ ] 明确图标实现方案（SVG 组件 / 图标字体 / SVG Sprite）
- [ ] 完善图标导入机制
- [ ] 添加图标文档和示例
- [ ] 在 Playground 中展示所有图标

**预计时间**: 3 天

**负责人**: 待分配

---

### 10. 优化构建配置

**问题**: 构建配置较基础

**任务**:
- [ ] 添加 bundle 分析: `rollup-plugin-visualizer`
- [ ] 配置更激进的 tree-shaking
- [ ] 设置 bundle 体积限制
- [ ] 优化 chunk 分割
- [ ] 生成体积报告

**预计时间**: 3 天

**负责人**: 待分配

---

## 🟢 P3 - 低优先级（V1.1+ 完成）

### 11. 建立文档站点

**任务**:
- [ ] 选择文档工具（VitePress / Docusaurus）
- [ ] 创建文档站点结构
- [ ] 自动生成 API 文档
- [ ] 添加交互式示例
- [ ] 部署文档站点

**预计时间**: 2 周

**负责人**: 待分配

---

### 12. 添加代码覆盖率徽章

**任务**:
- [ ] 注册 Codecov 账号
- [ ] 配置 Codecov token
- [ ] 在 CI 中上传覆盖率
- [ ] 添加徽章到 README

**预计时间**: 1 天

**负责人**: 待分配

---

## 📅 时间线规划

### 第 1-2 周：P0 任务
- 修复主题文档
- 提升测试质量
- 验证 CI/CD
- 检查循环依赖

### 第 3-4 周：P1 任务
- CLI 决策
- JSDoc 注释
- E2E 测试框架

### 第 5-8 周：P2 任务
- 国际化集成
- 图标系统
- 构建优化

### 第 9-12 周：测试与完善
- 全面测试
- 文档审查
- 性能优化
- V1.0 准备

---

## 📊 成功指标

### V1.0 发布准备就绪标准

- [x] 所有 P0 任务完成
- [ ] 测试覆盖率 > 70%
- [ ] CI/CD 流程正常运行
- [ ] 所有文档完善
- [ ] 无循环依赖
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误
- [ ] 构建成功
- [ ] 无已知的严重 Bug

---

## 👥 团队协作建议

### 分工建议

1. **架构组**: 负责 P0-1, P0-4（主题系统、循环依赖）
2. **测试组**: 负责 P0-2, P1-7（测试质量、E2E）
3. **DevOps**: 负责 P0-3（CI/CD 验证）
4. **文档组**: 负责 P1-5, P1-6（CLI、JSDoc）
5. **功能组**: 负责 P2-8, P2-9（i18n、图标）

### 沟通建议

- **每周同步会**: 周一讨论本周任务
- **每日站会**: 15 分钟同步进度和阻塞
- **Code Review**: 所有 PR 必须 review
- **文档优先**: 先更新文档，再编码

---

## 🆘 遇到问题？

如果在执行任务时遇到问题：

1. 查阅相关文档（ARCHITECTURE.md、CONTRIBUTING.md）
2. 在 GitHub Issues 中搜索类似问题
3. 在 GitHub Discussions 中提问
4. 联系项目维护者：me@zhaifanhua.com

---

## 📝 更新日志

### 2026-01-23
- ✅ 创建本行动清单
- ✅ 完成 P0 中的文档和 CI/CD 基础设施
- 📝 待团队分配具体任务和负责人

---

**下次审查**: 每周五更新进度  
**V1.0 目标日期**: 2026 年 Q1 末（约 12 周后）
