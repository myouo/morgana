# 工具导航

常用命令集中在根 `package.json`；阶段编译/验收工具保留直接入口，避免每个实验都占一个顶层命令。统一在仓库根目录使用 `pnpm exec tsx tooling/<name>.ts [参数]`。不要仅根据文件名对未知父版执行 promote/stage。

| 任务 | 入口 |
| --- | --- |
| 重现/更新 SDK 实包 | `pnpm sdk:build` / `pnpm sdk:update` |
| 提取与组织检查 | `pnpm extract --source <安装目录>`、`pnpm inspect`、`pnpm analyze:kag` |
| KAG/宏/原配置数据模型 | [kag.ts](kag.ts)、[kag-ast.ts](kag-ast.ts)、[source-macros.ts](source-macros.ts)、`source-*.ts` |
| PO 检查与章节整理 | `pnpm locales:check`、`pnpm chapters:check`、`pnpm chapters:convert` |
| 首门转换基线 | `pnpm convert` → `generated/site`，不是整作一键构建 |
| 主线编译 | `compile-integrated.ts`、`compile-*-connected.ts`、`compile-native-connected.ts` |
| 章节独立编译/遍历 | `compile-full-door.ts`、`compile-*-door.ts`、`drive-*.ts` |
| 展示/历史增量 | `compile-history-*.ts`、`verify-history-*.ts`、`source-history-*.ts` |
| 保存迁移与保留旧来源 | `freeze-*.ts`、`verify-*-upgrades.ts`，配合 `src/*-migration.ts` |
| 校验与提升已验收父版 | `verify-*.ts`、`stage-*.ts`、`promote-*.ts` |
| 站点/资源/Worker | `prepare-edge.ts`、`prepare-production.ts`、`publication-assets.ts`；见[部署说明](../deployment/README.md) |

例如，在已准备对应原资料和基线的本机，检查完整二门或历史前缀：

```sh
pnpm exec tsx tooling/compile-full-door.ts en
pnpm exec tsx tooling/drive-full-door.ts en
pnpm exec tsx tooling/verify-history-prefix.ts
```

具体参数和前置文件以工具源码及对应 `docs/evidence/` 记录为准。[开发说明](../docs/DEVELOPMENT.md)列出主要阶段的证据顺序；缺少父版或旧来源时工具应失败，不能删断言来继续。

历史文档中的 `pnpm doorN:*`、`integration:*`、`interfaces:*` 等阶段别名已从常用命令中移除，底层仍有效的工具保留。例如 `door2:build` 对应 `compile-full-door.ts`，`integration:build` 对应 `compile-integrated.ts`；浏览器配置统一在 `tests/config/`。局部二门 `compile-next-door.ts` / `drive-next-door.ts`、早期首门体积探针及旧苏醒段初始化工具已删除，由完整章节工具、当前单元/原资料测试与正式PO维护流程取代。

原脚本只作数据处理。不要执行 TJS/eval、把未知指令静默丢弃，或在实例复制SDK实现。报告/清单/切点写 `artifacts/`，游戏、字体、二进制生成物和依赖实包保持 ignored。
