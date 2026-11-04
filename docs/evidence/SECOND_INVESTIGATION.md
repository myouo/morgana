# 第二次调查推进（2026-11-04）

八语source search2.ks已经整理为正式PO/控制目录。独立片段由标准SDK
ProgramModule执行，3个原菜单：四项对话循环、四种年龄回答、三条探索选择。
安全顺序为先庭园再仓库；直接仓库产生deadend1，条件未满足进入台球室产生
同一deadend2，正常路线到scenario7。来源条件与跳转均静态核验，不执行TJS。

独立八语编译/路线已通过。每语5条测试路线覆盖四种年龄回答、两种问题顺序、
两个失败结局及正常交接；源码正文实际覆盖1650–1656页，最大45对象/22任务。
保存/冷恢复章首、三菜单及结局切点共8类；媒体回执来自显式虚拟Host。
原图菜单label支持日/韩原bold宏；英文NVL tab按原宏瞬时六空格转换。
中文原源唯一多余endif限定在台球室失败条件后并报告SOURCE_REDUNDANT_ENDIF；
其他七语无此标签，分别保留来源结构。

使用原生模块UI、条件表达式和call/return，没有另一套剧情解释器。循环外
源autosave在首次UI等待单独建立合法点，额外SDK全局只记录首次经过，避免
每问一次都重复触发循环外保存。文字绝对位置映射和原生glyph差异已记清单。

整合候选generated/search2-connected从冻结sixth-public继续，现有一至六门
代码/素材保留。新片段69函数，加入现有253–254函数后超过旧256目录边界。
SDK f79a230已经加入显式v3目录（1024函数/256模块/8辅助资产目录），453单元、
2浏览器与独立实包通过，实例真实依赖645e94c8b602。

真实整合又触发4M元数据限制，正在完成SDK ADR0115：只有tree-v1标记的v3
目录使用独立16M/512000节点元数据包和组件提交，存档/Profile/执行/图像/
活动闭包预算不变；旧未标记v3和v1/v2保持原承诺/4M限制。新5项专项、455全
单元、严格检查及2浏览器已通过，隔离实包正在收尾，尚未打包回实例。

当前整合脚本tooling/compile-search2-connected.ts和迁移search2-migration已写；
第一次实际整合在compositionDigest的旧4M边界拒绝，不能当已通过。
下一步：完成SDK ADR0115实包并消费，重跑中文整合/真实六门终点继续；
再八语整合、必要中英浏览器切点，随后与第七门一起推进预览。

预览仍是六门版本9cae95e8，第七门及badend5 PO已开始整理，原第七门计时器
为1000ms tick且time>2：3000ms超时跳“諦めない”，点击“諦める”进入badend5。
非阻塞细节归REPLICA_GAPS；整作持续目标保持active。

## 大目录阻塞已解除

SDK ADR0115已完成：455单元/92文件、2浏览器、独立实包通过。代码9314156，
报告补充321507d，均已正常推SDK main。实例实包82b70b5754e30e44ce1698b99a0b463de29f3872e1d08cf1bd581eb71150a71c
已从321507d重现。源旧未标记v3也仍通过独立身份核验。

八语独立路线现均完成，1650–1656源码页全部运行覆盖；中文整合已成功
生成doors6-search2-zh-048aaac245542498da16：292函数/52模块/1340资产。
输入固定sixth-public；输出search2-connected，所有旧文件保留；先不提升
integrated或重发预览。命令`pnpm exec tsx tooling/compile-search2-connected.ts zh`
通过；`pnpm exec tsx tooling/verify-search2-connected.ts zh`正在从真实六门
终点验证5路线。正常终点release:scenario7-entry，失败仍release:return-title。

metadata由prepare-search2-metadata.ts从已核对源/PO和标准模块生成；新规则
灰度图从已生成PNG按完整SHA核验，不复制游戏脚本。namespaceFragment已
补齐ui.wait按钮target重定位，真实SDK冷恢复/提交4项专项通过。

接续：完成中文真实旧终点路线，批量八语连接/验证；补中英必要浏览器
关键切点。原章节书的第二调查入口在第七门原页面统一接入，不加实验按钮。
随后复用已检查的3000ms七门计时源，把点击放弃/超时继续接入标准SDK。

2026-11-04 15:22接续：六门预览与Git main1a7a625稳定；整作goal active。
新Root SDK321507d/82b70b5754e3。八语第二调查独立5路线全部通过，中文
真实六门终点整合5路线也通过（1650源码页）。八语连接批次进程14411正在
运行，日志search2-connect-all.log目前完成en/fr/it；完成后自动执行
verify-search2-connected.ts all，日志search2-connected-drive-all.log。
不要因日志短时无输出重启；用工具句柄或进程状态确认。

第七门lower-seventh/compile-seventh-door已写，3000ms超时是正常继续，点击
放弃才进入badend5；严查三段源计时文本，不执行脚本。中文正在逐项转换，
已支持align=default及报告原开发者debugLabel；新position只接受固定800x600
视口内合法整数边距。当前构建日志seventh-build-zh.log，尚未宣称可玩。
下一步完成中文第七门编译，复用六门驱动独立源码oracle验证2999ms点击坏结局、
3000ms超时继续和存档剩余时间；再八语编译/整合，并在原章节页接入第二调查。

当前八语整合运行验证已完成zh/en/fr/it/jp/ko，pt-br/ru仍由同一批次继续；
以artifacts/search2-connected/*-verified.json实际结果为准。第七门中文完整
两路已通过，详见SEVENTH_DOOR_PROGRESS.md。
