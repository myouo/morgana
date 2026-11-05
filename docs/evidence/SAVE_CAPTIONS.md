# 原空书签提示恢复（2026-11-05）

审查时实测序章有效图文槽显示No Data。补查源后确认这些标签的书签名本来
为空，原中文saveload显示“没有记忆”；不能将其归因为缺章节名或丢档。

saveArtwork现在只静态读取该原字面量，保留八语原文本和法语原空字符串，
未知表达式拒绝。SaveLayout新增可选emptyCaption，旧数据缺失时保持旧回退；
SourceSaveMenu消费该展示字段，不重写槽位、章节标题或存档。

refresh-save-captions只更新八语title数据中的这一字段。八语加载结果核对源
字面量，删除新字段后与冻结父title逐字段完全相同；主Program、来源/素材/
书签表及存档身份不改。原始KS/TJS、生成pb、冻结副本与日志仍ignore。

实际命令：

- `pnpm exec tsx --test tests/save-caption.test.ts tests/history-parts.test.ts`：6通过，含八语原字面量、法语空值及未知表达式拒绝。
- `pnpm exec tsx tooling/refresh-save-captions.ts generated/integrated`：八语完成。
- `pnpm exec tsx artifacts/startup-optimization/verify-captions.ts`：八语精确差异及实际解析通过。

这是源提示本地化修补，不等于F-16跨文件书签名称继承完成。当前为本地候选，
中文实际读取菜单验证通过；SDK合批检查见READING_POLISH，不冒称已发布。
