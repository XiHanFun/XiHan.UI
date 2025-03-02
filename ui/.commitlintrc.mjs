export default {
  extends: ["@commitlint/config-conventional"],
  // 自定义规则
  rules: {
    // 提交类型限制
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复
        "docs", // 文档
        "style", // 样式修改
        "refactor", // 重构
        "perf", // 性能优化
        "test", // 测试相关
        "build", // 构建系统或外部依赖相关
        "ci", // CI/CD相关
        "chore", // 其他修改
        "revert", // 回退提交
        "wip", // 开发中
        "types", // 类型定义
        "release", // 发布
      ],
    ],
    // 提交长度限制
    "subject-max-length": [2, "always", 100],
    // 提交标题不能为空
    "subject-empty": [2, "never"],
    // 类型不能为空
    "type-empty": [2, "never"],
    // 类型必须小写
    "type-case": [2, "always", "lower-case"],
  },
  // 忽略特定规则
  ignores: [(message) => message.includes("WIP")],
  // 自定义提示消息
  prompt: {
    questions: {
      type: {
        description: "选择你要提交的类型:",
        enum: {
          feat: {
            description: "新功能",
            title: "Features",
            emoji: "✨",
          },
          fix: {
            description: "修复bug",
            title: "Bug Fixes",
            emoji: "🐛",
          },
          docs: {
            description: "文档更新",
            title: "Documentation",
            emoji: "📚",
          },
          style: {
            description: "代码风格或UI样式更改(不影响功能)",
            title: "Styles",
            emoji: "💎",
          },
          refactor: {
            description: "代码重构(既不修复bug也不添加特性)",
            title: "Code Refactoring",
            emoji: "📦",
          },
          perf: {
            description: "性能优化",
            title: "Performance Improvements",
            emoji: "🚀",
          },
          test: {
            description: "添加或修改测试",
            title: "Tests",
            emoji: "🚨",
          },
          build: {
            description: "影响构建系统或外部依赖项",
            title: "Builds",
            emoji: "🛠",
          },
          ci: {
            description: "CI配置文件和脚本的更改",
            title: "Continuous Integrations",
            emoji: "⚙️",
          },
          chore: {
            description: "其他修改(不修改src或测试文件)",
            title: "Chores",
            emoji: "♻️",
          },
          revert: {
            description: "回退先前的提交",
            title: "Reverts",
            emoji: "🗑",
          },
        },
      },
      scope: {
        description: "修改的范围是什么(例如：组件或文件名)",
      },
      subject: {
        description: "写一个简短的描述",
      },
      body: {
        description: "提供更详细的更改说明",
      },
      isBreaking: {
        description: "有破坏性更新吗?",
      },
      breakingBody: {
        description: "破坏性变更的提交需要一个主体。请输入对变更的详细描述",
      },
      breaking: {
        description: "描述破坏性变更",
      },
      isIssueAffected: {
        description: "是否影响任何开放的问题?",
      },
      issuesBody: {
        description: "如果问题已解决，则提交需要一个主体。请输入对变更的详细描述",
      },
      issues: {
        description: '添加问题引用 (例如 "fix #123", "re #123".)',
      },
    },
  },
};
