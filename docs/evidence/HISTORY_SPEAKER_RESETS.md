# 第四门明确角色重置显示（2026-11-06）

已提升本地默认入口，未部署。本批只更新显示目录和皮肤；八语Program清单、
代码、资源及存档身份逐SHA保持，未新增SDK能力或另一套剧情解释器。

原reset_speaker清空f.speakingPerson并置dispSpeakingPersonFlg=true；随后同一
角色也会重输出名字。旧皮肤按相邻正文key去重，既没有明确重置信号，又把
追加历史中的自动名字全部隐藏，导致部分明确重置处缺名字。

只为“字面重置→立即已知角色宏→无分支首条可记录正文/历史注释”生成只读
显示提示。reset、ctrlSpeakingPerson及三种draw_name模板按token化数据指纹
锁定，名字/格式/字号来自原字面量及formatHistoryName；不执行TJS。提示精确
绑定实际Program的rich.at，不能仅靠相同角色文字或TextId猜测；非线性边界、
未知表达式和模板变化明确拒绝。名称换行遵循已核实模板和相邻hr。

|语言|普通/通关提示总数|记录类型|
|---|---:|---|
|en/fr/it/pt-br|每语4|正文|
|ko|10|4个正文、6个历史注释|
|ru|2|正文|
|jp/zh|0|原源无这些重置；title也逐字节保持|

共28个精确地址提示。格式传输保存原整数fontSize/baseSize，读取时才计算
比例；没有放宽JsonValue Schema接受未声明的浮点对象。名字样式使用现有
历史字体，原字体族和原作像素仍未认证。

SDK标准Core从真实已验证旧第四门状态实际推进到英韩普通/通关14个重置
切点，全部可达并存成合法切点。Node使用虚拟媒体，不能代替实机声画。
英韩普通/通关4项真实浏览器通过（83秒用例时间，完整命令约1.5分钟）：
覆盖正文同名再次显示、韩文历史追加记录前的名字、保存/刷新/再次显示，
不改变正文、帧、历史正文、变量和完整已读；公共Store读取的旧槽字节/
revision保持。韩文通关仍是原已声明的局部解锁夹具，不称全作累计认证。
截图已实看，没有额外实验界面。

实际命令：

- `pnpm exec tsx tooling/compile-history-speakers.ts --clone`；`... all`：八语目录生成，28个目标地址逐指令检查，Program/资源不改。
- `pnpm exec tsx tooling/verify-history-speakers.ts all`：英韩14切点实际Core路线到达，来源/SDK身份写入ignored报告。
- `pnpm exec tsx --test tests/source-speaker-resets.test.ts tests/history-speaker-hints.test.ts tests/history-content.test.ts tests/history-parts.test.ts`：12项通过，含八语双状态、模板篡改/分支拒绝、wire、未知/重复地址/越界/坏样式、显示不写回及普通/追加记录的名字缓存。
- `pnpm check`：严格类型、PO控制和独立SDK/载荷边界通过。
- `pnpm exec playwright test --config playwright.history-speakers.config.ts`：4通过、0失败/0跳过。
- `pnpm exec tsx tooling/promote-history-speakers.ts`：先验证全部父清单/目录差异、切点和浏览器实际显示摘要/SDK，再只替换title数据。
- `pnpm build`：通过；2520个protobuf压缩完成（原始1523471000字节，编码159042625字节）。

这不是完整f.speakingPerson动态状态或原行缓冲实现。仅在已保留/已揭示的
记录匹配源地址时补明确名字；跨分支缓存、零字揭示前时序、500/2000行
计量/自动折行/保留及字体族继续列F-05。存档历史未补造已丢内容。原KS/TJS、
生成目录、包、切点、截图/trace/日志/JSON仍全部ignore，尚未推送或部署。
