# 历史追加与显式换行（2026-11-05）

已提升本地默认integrated，未部署。八语普通/通关第四门5672条历史专用指令
修为显式append:true，并恢复5494个经源核对的相邻hr尾换行。这是生成程序
里的静态操作数，不能等同一次游玩实际执行了全部分支。其余剧情指令、调用
返回/布局/正文身份、全局/UI/已读定义和资源目录保持；无新增媒体对象。

问题有两层：historyAnnotation已知道store是追加，但旧lowerer没把append传入
historyText，SDK按原默认独立段落处理；原hr又被旧“每条都是独立段落”的
近似吞掉，导致西文一行内的斜体片段被拆行。新源解析只静态识别相邻注释
之间的格式/历史开关与hr，不推断穿过条件、角色宏或剧情文本的换行。八语
MainWindow.hr处理器统一LF后指纹23fa5152…已核对，未知参数继续拒绝。

皮肤使用SDK公开只读groupHistoryEntries，不复制剧情或存储逻辑；明确追加
片段共用段落、保留原顺序/样式/名字文本，追加片段不再重复合成角色标题。
已有明确换行后的居中/左对齐切换保留；裁掉父记录时不补造父文字/名字。
源码/现有记录仍未完整描述的行缓冲、开头换行和角色reset状态继续列差异。

SDK W1-25/ADR0124本地提交8213f84，实际包SHA256：
a96c1fdc425f2be2a45f47e0f37baf60b89e25427c40a1bd778af2997e9e3b32。
SDK478单元/check、3真实保存刷新浏览器及最终隔离tarball消费者通过。实例
只经实际file依赖/public exports接入，没有源码别名或另一套剧情解释器。

旧槽迁移先由SDK验证原清单/代码/切点，再由公开rebaseHistoryAppends校验旧
history-only来源，仅更新追加标记、明确尾break及相应签名；原文字和样式
必须完全相同。随后沿原完整迁移重绑目标清单/UI/鉴赏签名，SDK再次验证。
没有删除旧记录或放宽来源检查；记录身份、顺序、数量与原时钟保持。

八语正常/通关共16个真实旧源切点迁移、冷恢复与继续通过。中英通关使用
原累计七结局进度（40175/40216条已读）；其余六语通关仍沿原声明的解锁
夹具，约52–54条片段已读，不冒称其完整累计通关。普通状态保留原15380–
15395条已读。冷恢复以同一原源SDK恢复作为独立参照：Host媒体attempt/phase
依正常恢复策略更新，不把新请求身份错误当作剧情变化，旧逻辑任务仍核对。

中英×普通/通关4项实际浏览器通过，84.9秒，0失败/0跳过：真实旧记录迁移、
原皮肤内追加/换行、真实图文保存、刷新冷读、完整已读保留。经SDK公共Store
直接读IndexedDB，验证旧槽前后编码字节与revision完全不变；不以兼容槽列表
是否显示旧版本作为持久化证明。截图已实看。没有生产限速或故障注入。

实际命令：

- `pnpm sdk:update`：消费上述实际包，SDK_SOURCE来源8213f84dd8a8c2797494e17d5b7b96d662bdb182。
- `pnpm exec tsx tooling/compile-history-appends.ts --clone`：独立候选，只有SHA不可变文件硬链接；可变清单独立副本/原子替换。
- `pnpm exec tsx tooling/compile-history-appends.ts zh`；其余七语同工具批量运行：只改历史专用标记和源尾换行，逐原标签/文字核对；完整SDK编译/链接和全部父代码SHA检查通过。
- `pnpm exec tsx tooling/verify-history-appends.ts zh,en`；其余六语同工具批量运行：16个切点通过，来源清单固定在compat，promote后仍可重验。
- `pnpm exec tsx --test tests/history-content.test.ts tests/history-linebreaks.test.ts tests/history-annotation-ir.test.ts tests/source-history-profile.test.ts tests/history-merge-guard.test.ts`：7项通过。
- `pnpm check`：严格类型、286689条章节控制与依赖/载荷边界通过。
- `pnpm exec playwright test --config playwright.history-appends.config.ts`：最终4项通过。
- `pnpm exec tsx tooling/promote-history-appends.ts`：先核全部八语差异/16切点及4浏览器的实际release/SDK，再提升默认树；所有旧SHA代码/素材保留。
- `pnpm build`：通过；2520个protobuf文件压缩完成（原始1523462898字节，编码159040885字节），生产前端按当前默认主包构建。

原始KS/TJS、pb、素材、存档、包、JSON/日志/截图/trace全部留ignored目录。
F-05仍开放：500/2000行缓冲、自动折行/开头换行/跨提示连续正文、角色重置、
其他章节注释及字体族/原作逐像素仍需完成。本批不声称原档tft互通或整作
100%还原，线上版本仍见STATUS。
