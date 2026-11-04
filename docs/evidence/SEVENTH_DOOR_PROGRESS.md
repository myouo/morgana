# 第七门推进记录（2026-11-04）

八语独立整章/正常和badend5两路/8个冷恢复切点全部通过。中文4475段/4481片段，
83函数/6模块/346资产；各语实际报告为artifacts/door7/*-runtime.json。
3000ms超时继续scenario8，2999ms点击放弃进入badend5，迟到输入不能覆盖结果。
媒体完成回执为显式虚拟Host，不等于全曲实机听验。

八语主线整合已编译完成，源为已验收的第二次调查候选；中文359函数/61模块/1534资产，
release doors7-zh-7c0f88765d1ed6c1ef8e。正式SDK v3目录容纳整作函数/描述符；
每个模块、执行、存档及资源预算不增加。

实际命令与已完成证据：

- `pnpm door7:build all`、`pnpm door7:verify all`：八语独立完整路线与8切点通过。
- `pnpm door7:connect all`：八语主线候选生成成功，保留此前所有已发布来源文件。
- `pnpm door7:verify:main zh`、`pnpm door7:verify:main en`：从第二次调查的实际正常终点
  继续，整章两路、8切点、原chapter.ks暖炉+search2:*fromchapter7回放前导通过。
- `pnpm door7:verify:main fr,it,jp,ko,pt-br,ru --entry-only`：其余语言实际旧终点→首段源文本
  与冷恢复全部通过。它们的完整路线使用已通过的独立八语矩阵，不冒充整合后全路线重跑。
- `pnpm test:door7`：本地6项通过，见artifacts/seventh-connected/local-browser.json。
  旧第六门终点→第二次调查、原存档UI保存/刷新、计时放弃/超时、750ms剩余时间恢复、
  原章节书第五页回放并返回主进度、完整已读的带图存档/冷刷新均验证。
- `pnpm exec tsx --test tests/second-investigation.test.ts tests/seventh-timer.test.ts`：相关6项通过。
- `pnpm check`：类型、277515个PO/控制身份、独立SDK依赖/ignore边界通过。

实际完整进度在第七门超过SDK旧20000条read上限。SDK提交3f58294将数量上限改为50000，
保留原4M/100000节点envelope；457单元、真实IndexedDB保存刷新专项、隔离消费者通过。
实例消费681c1ee4a58cafe409a1beee21484818f5287aac9c97fc8db487106bf941219c实际tarball。
本地并发构建期间，20079条实际read的一次带图保存1079.9ms/冷读3029.1ms，结果只是
受并发负载影响的单样本，不能当公网或秒级性能保证；长期延迟仍由F-08跟踪。

源适配：带graph的7系列说话者、合法固定800×600边距、align=default、等待非循环角色
运动；零时长且终点重复的无效运动点剔除，改变位置仍拒绝；选项qmenu显隐与恢复。
背景独立转场期间继续文字，再启动转场前等待剩余旧转场，差异F-11。
源debugLabel只入报告。原章节第五页使用原图和真实flag，新增search2/door7回放入口。
八语资源已stage（3288个对象，不含测试cuts），正在发布候选；其余非阻塞差异与后续全线验收见REPLICA_GAPS.md。

补充验收：`pnpm test`全125 Node及7 Python通过；`pnpm build`的类型、
八语277515条PO/控制和独立依赖边界通过。保存书签按发布章范围补到scenario7/badend5，
`refresh-save-bookmarks.ts generated/seventh-connected 7 --copy-to-public`只在模块manifest
完全相同的候选/public/integrated目录更新有SHA的元数据片段；不重编已验证故事。
