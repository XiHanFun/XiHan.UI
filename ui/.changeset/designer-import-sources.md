---
'@xihan-ui/designer-kit': minor
'@xihan-ui/designer-shell': minor
---

导入器的取用进共用包：designer-kit 新增 `findImporter(importers, sources)`，来源按先后、导入器按先后问 `accepts`，返回第一个接下的导入器与那个来源；designer-shell 新增 `importSources(data, kind)`，把粘贴与拖放带来的数据列成导入来源（先文件，再按链接、HTML、纯文本列出不为空的文本）。各款设计器的粘贴、拖放与打开文件不必各写一份。
