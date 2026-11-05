# 历史专用文本运行接续（2026-11-05）

本轮完成SDK W1-23与中英完整第四门隔离候选。F-05保持未完成；尚未合并整作
或更新线上。SDK实际来源239ef68c917ed0295324aa48fbd15ebab261b457，实包SHA256
1216747da2fc4194c6fe01d855dcd97350a1c998218d9fe0ed51ced1b2162d15，实例只经
实际tarball/公开exports消费。SDK470单元、类型/生成/边界、跨模块冷恢复、
真实图文保存刷新、7项原历史浏览器与隔离安装消费通过，见SDK ADR0122报告。

historyText写完整的源绑定历史记录，不替换正文/窗口、不产生等待或已读，
不绑定语音或制造回溯切点。支持标准文字/ruby/换行及静态样式，拒绝输入/
时间控制、动画样式与矛盾录入模式；保存恢复校验来源、追加标记与合法位置。
默认SDK历史面板支持追加记录和独立注释的呈现，原存储/模块预算保持。

作品转换器增加显式historyNotes选项，默认路径保持原行为。readDoorText在原
位置解析hisout/hisname，保存当前输出开关、角色、居中、字体样式及resetfont。
关闭的注释不生成操作；使用独立稳定地址，不消耗旧绘制地址序号。历史专用
字符加入字体子集。原文/原素材/生成物仍ignore；不执行TJS/eval，不加剧情解释器。

实际命令：

- pnpm sdk:update
- pnpm exec tsx --test tests/source-history-profile.test.ts tests/history-annotation-ir.test.ts
- pnpm exec tsx tooling/compile-history-fourth.ts zh；同命令en
- pnpm exec tsx tooling/verify-history-fourth.ts zh,en
- pnpm exec tsx tooling/prepare-history-fourth-cuts.ts zh,en
- pnpm exec playwright test --config playwright.history-fourth.config.ts
- pnpm check

中英完整第四门均通过正常与badend1/2/3、两种明确入场回忆标志夹具，共每语6路。
每指令预算观察全部可见正文并从源/PO独立比对：中文2049、英文2064片段；
332/367个历史专用操作全部实际观察。英文开场源关闭的6条注释保持关闭。
每语10个合法切点冷恢复相同正文/调用栈/历史，最大Snapshot JSON分别454263/
372583字符。媒体为明确虚拟Host结果，不冒称所有音轨实机认证。

中英实际切点浏览器两项通过（7.1/5.9秒）：独立显示注释、真实图文保存及刷新。
已查看中英截图，正文之外的中文记录与英文红字/居中确实可见。旧SDK历史无
historyId的记录使用实际兼容行ID定位；未确认正文在新会话取得新的historyId，
测试对正文内容/揭示/来源/窗口/帧与已确认历史精确比较，不把分支ID当剧情差异。
测试清单初次漏声明原3个自动存档点，SDK正确拒绝MODULE_POINT；已补声明并
从真实Core重做切点。没有移除校验，也没有手工重写Snapshot来源签名。

当前范围限制：generated/history-fourth是隔离普通周目候选；明确跳过只支持旧
已知差异的第四门历史迁移打包器，不能据此声称旧槽兼容。主包组合、通关变体、
旧调用返回位置/字体/历史来源映射以及源500/2000行保留仍需验收；显示仍64条。
当前已确认历史恢复不编造旧程序已裁掉的内容。源字体族与原作逐像素还未认证，
源码转换器显式保留HISTORY_NOTE_FONT_FACE_NOT_CERTIFIED，字号/颜色/强调已映射。
不将这轮隔离验收等同整作或F-05完成，线上仍ca5086fd/原2eb4包。

收尾：新1216747da2fc实包下，原主包中英旧槽/历史滑块2浏览器通过（53.3/
30.2秒），pnpm check与两项源解析/IR测试通过。跨段追加、未确认正文、角色重置
与原行缓冲仍须一起完成，不因本候选通过而删除对应剩余要求。
