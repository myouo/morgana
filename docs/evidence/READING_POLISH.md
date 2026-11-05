# 阅读体验第一批收尾（2026-11-05）

本地候选完成启动展示数据四并发、当前已揭示正文历史及八语原空书签提示。
当前线上仍为HISTORY_RELEASE所列版本；本记录不把本地检查当作部署完成。

SDK W1-24/ADR0123已在SDK自身实现并本地追加提交ef6615d。实例经实际tarball
与公开exports安装：ccb42fb70f55c25e6435bc8500226ff60a7e8b835b935f210bf47f33ac1c5a0f。
没有SDK源码别名或实例端替代引擎。应用显式启用includeCurrentText，仍64条
显示/原快照和资源预算；只投影合法正文提示当前已揭示部分，不确认、不写
已读或回溯journal，确认后去重。被源recordHistory抑制的文字保持不进入历史。

SDK473单元/check、实际部分正文图文保存刷新、7项既有历史回归及隔离实包
消费已通过。SDK新例使用真实20ms/2字切点，默认UI只显示AB；实际记录与限制
见SDK docs/evidence/current-backlog/REPORT.md。

实例实际中英旧第四门槽经原来源清单及已注册迁移加载，当前未确认正文立即
进入原历史界面；查看前后帧、正文、已有历史和完整已读完全相同。真实快速
图文保存、刷新、新Player读回后仍同位置/原历史/完整已读，确认当前句后仅
产生一条普通历史。中英两例分别20.6/19.9秒通过，截图已实看。

实际命令：

- `pnpm sdk:update`：SDK来源ef6615de9a667b0dc175e883b8ecf4972fae98b1，包如上。
- `pnpm check`：类型、286689条章节控制关系和独立依赖/载荷边界通过。
- `pnpm exec tsx --test tests/history-parts.test.ts tests/save-caption.test.ts tests/history-merge-guard.test.ts tests/history-annotation-ir.test.ts`：8项通过。
- `pnpm exec playwright test --config playwright.reading-polish.config.ts`：两个真实旧槽用例通过；空槽提示例的首轮轮询早于原8秒标题淡入结束，随后改为显式等title:wait再使用原读取按钮，未缩短产品演出或修改计时。
- `pnpm exec playwright test --config playwright.reading-polish.config.ts --grep 'Chinese source'`：1项通过，12.2秒。
- `pnpm exec playwright test --config playwright.startup.config.ts`：最终新实包下3项通过，41.4秒，0失败/0跳过。
- `pnpm build`：通过；正式Vite产物和2456个protobuf压缩完成（原始1474163968字节/编码154772342字节）。

F-05仍未整体关闭：原中日增量/韩与西文延后换行、500/2000行计量/保留、
跨段追加和角色重置、其余章节历史注释及字体族对照继续；本批只解决合法
正文提示上的当前已揭示文字。旧程序已丢弃的历史不从已读标记编造。F-16
跨文件书签继承、glyph/强制取消Auto/Skip、音轨精确恢复、备份/原档与原作
完整对照仍开放。原作载荷、生成pb、tarball及证据全部ignore。

长开dev在更新tarball后仍缓存旧SDK时，includeCurrentText会被旧Schema正确拒绝。已重启本轮自建4184进程并使用Vite --force重做依赖预构建；不能靠忽略未知策略或SDK源码别名绕过。
