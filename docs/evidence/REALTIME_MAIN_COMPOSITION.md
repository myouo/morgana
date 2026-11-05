# 主流程组合与历史滑块批次（2026-11-05）

已上线preview ca5086fd-12a2-4110-8ffd-b208ba8c4c97，regression
0e34664e-fa5e-4b65-9718-b92409e7dcb4。整作主线已到第九章/终章，包含两次
调查、badend1–7、原通关标题/六按钮菜单及奖励。按用户要求以拼接/继续为先，
其余表现差异记录，不把本批称为整作100%认证。

本批以已发布postclear-fixed为父，只替换postclear-third/同地址的sequence→
raster/原图过滤映射，第三门沿用旧布局。其余1022–1032函数逐字节保留，所有
旧素材契约不变。八语独立全文/每语8冷点、32个真实旧主包切点迁移通过；保留
原四层调用栈、正文和任务elapsed/duration。中文Canvas/WebGL×film/short/long
六项浏览器真实旧槽迁移/图文保存/刷新通过，流式驻留预算保持64MiB。

主Program重点跑中英：十二原章节入口/冷恢复、序章→第一门、完整第三门→
第一次调查及冷恢复、两种章节书返回页、旧标题状态迁移与两个旧终点接下一章。
英文3793、中文3948次正文等待后正常进入调查。最初all --third-handoff在英文/
法文完整通过后主动停止，改跑中文重点；其余六语未改菜单/后继使用明确父版
验收及当前精确差异，不将父报告重标为子版实跑。

实际命令：

- pnpm exec tsx tooling/verify-realtime-third-evidence.ts
- pnpm exec tsx tooling/verify-realtime-cleared-delta.ts all
- pnpm exec tsx tooling/verify-realtime-cleared-upgrades.ts <locale>（八语逐语）
- pnpm exec playwright test --config playwright.realtime-cleared-main.config.ts
- FATA_NATIVE_ROOT=generated/realtime-cleared-connected pnpm exec tsx tooling/verify-native-menus.ts zh --third-handoff（英文由上述all运行完成）
- pnpm exec tsx --test tests/raster-upgrade-guard.test.ts tests/history-scrollbar-source.test.ts
- pnpm exec tsx tooling/stage-realtime-cleared.ts --promote
- pnpm build

stage先核对父版、精确差异、独立全文、中英接续、旧档及浏览器的release/SDK
身份，再提升发布目录；未包含cuts。实例只消费实际SDK包与公开exports。
SDK来源29e46ecfbbf4645425a2d0c6092d944ac13df39b，包SHA256为
2eb4cb91afd349d903a73f47be75f94c8b543a5d55e1665d1af6a5d856889b76。

素材闭包与父版5132对象/1176627017字节全部key/SHA256/bytes一致，0新增/删除，
复用已验证不可变R2资源；没有重新上传原音画。仍保留历史快照所需旧素材，
不把独立第三门引用减少85MB冒充整包减少。

按顺序prepare-edge regression、wrangler deploy --env regression；线上验收：

- MORGANA_RUN=realtime-main-slots pnpm exec playwright test --config playwright.integrated.remote.config.ts：3项通过，中英旧交互槽/回忆继续、中文CDP慢网、损坏代码拒绝重试。
- MORGANA_RUN=realtime-history pnpm exec playwright test --config playwright.history-scrollbar.remote.config.ts：中英2项通过，正常播放进入历史自动暂停，滑块拖动/滚轮/键盘/缩放不推进正文。

共5项通过，0失败/0跳过。继而prepare-edge preview、wrangler deploy，分别上传
167个变化静态文件。两站前端指纹均为
0aa213b96ea10c9e4ab240a10e8d04aa6f8191dea6c7fbf6276cbd0b7c0aa9bd。
FATA_PREVIEW_VERSION=ca5086fd-12a2-4110-8ffd-b208ba8c4c97 pnpm preview:check
最终通过：4872文件/2366968102解码字节逐文件等于dist；匿名200、媒体Range206、
回归匿名401隔离通过，无traffic shaping。实际完成记录为
artifacts/realtime-cleared-preview-verification.json；公网结果为
artifacts/remote/realtime-main-slots-results.json、realtime-history-results.json。

[历史滑块详情](HISTORY_SCROLLBAR.md)与[剩余差异](../REPLICA_GAPS.md)包含历史
容量/注释、F-16书签继承、glyph/强制取消播放/音轨seek等；原作随机噪点像素
一致性与原生tft codec仍未认证。整作goal继续active。
