# 主流程组合与历史滑块批次（2026-11-05）

当前已发布完整主线至第九章、两次调查、坏结局1–7、通关前四门/调查分支、
原通关菜单及奖励。按用户要求，本批以组合接续和旧档延续为主，避免重复
打磨非阻塞细节。源KS/TJS只静态解析，运行标准Program及正式SDK实际包。

候选generated/realtime-cleared-connected以已发布postclear-fixed为父，只替换
postclear-third/函数的同地址sequence→raster/原图过滤映射；第三门布局沿用旧
地址，不引入额外dynamicGeometry。其余1022–1032个函数逐字节保留，旧素材
目录全部保留供历史快照校验，因此不宣称整个发布包缩小了85MB。

八语实时第三门独立全文/每语8冷点、原地址/任务时钟/文本身份核对通过。
主包八语32个实际旧通关第三门切点，通过已注册来源及imageAliases迁移；
保留原四层调用栈、正文和任务elapsed/duration。中文Canvas/WebGL×film/
short/long六项浏览器保存/刷新通过，SDK驻留预算维持64MiB。

实际命令：

- pnpm exec tsx tooling/verify-realtime-third-evidence.ts
- pnpm exec tsx tooling/verify-realtime-cleared-delta.ts all
- pnpm exec tsx tooling/verify-realtime-cleared-upgrades.ts en,fr,it,jp,ko,pt-br,ru,zh
- pnpm exec playwright test --config playwright.realtime-cleared-main.config.ts
- FATA_NATIVE_ROOT=generated/realtime-cleared-connected pnpm exec tsx tooling/verify-native-menus.ts all --third-handoff
- pnpm exec tsx --test tests/raster-upgrade-guard.test.ts tests/history-scrollbar-source.test.ts
- pnpm check

最后一项主Program衔接正在执行：十二原章节入口/冷恢复、完整序章→第一门、
完整第三门→第一次调查及其冷恢复；中英另含两个真实旧终点接下一章。
stage-realtime-cleared先核对父版验收、当前精确差异、独立全文、主包衔接、
旧档和实际浏览器的release/SDK身份，再复制发布目录；cuts永不入发布树。

本批同时交付[历史滑块](HISTORY_SCROLLBAR.md)。线上更新以本报告后续记录的
实际版本与网络检查为准；当前候选未发布。原作随机噪点像素一致性、F-16
书签继承、glyph/音轨seek及原档codec继续留档，整作goal仍active。
