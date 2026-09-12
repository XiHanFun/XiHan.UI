---
'@xihan-ui/headless': major
---

修复表单并发校验的忙碌状态，由当前有效异步任务统一派生。
任意字段变值、受控值更新、重置或卸载都会撤销旧快照的写回和提交资格，不自动重提。
整表提交取代先前的字段校验，避免晚到结果覆盖新结果。

公开类型 FormRefs.validation 改为有效任务 Map，不再保留 seq/fieldSeq 计数结构。
自定义适配器应由 formMachine 初始化 refs，不应继续手工构造旧批次对象。
