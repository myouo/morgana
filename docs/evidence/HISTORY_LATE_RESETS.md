# 第五、八章明确角色重置名字

2026-11-06，本地补齐英法意葡俄第五章12处、第八章3处 reset_speaker
名字输出，共75个新地址；显式重置提示累计28→103。两章在当前主 Program
中由早期普通／通关后流程共享，不生成两份重复提示。中日韩源无这些重置，
三语 title 字节保持不变。

源 reset_speaker 强制清空角色缓存，随后立即调用两标签字面角色宏，所以
这些名字不依赖进入前的角色缓存。复用已有 reset/ctrl/draw 源指纹和
formatHistoryName；逐个绑定正式 rich 指令地址、段落 ID、字面 speaker 及
可记录状态。第五章按正式章节 namespace；八章按编译地址后缀定位实际
分支函数，不按剧情行号猜 PC，也没有执行 TJS 或另建剧情运行器。

本轮同时记录角色宏调用时的字体样式。此前通用提取器用首段正文样式作
近似，遇到随后 [i]/[big]/[accent] 会把名字误作正文样式。新规则要求从
紧邻的 cm/闪光块证明调用入口为白色、正常字，并取入口字体；名字仍按
16/default 缩放，正文的斜体和放大保留。旧第四章提示继续使用原路径，
其28条值逐项保持；新提示仍在原32项/语言的容量内，最大19项。

验收与范围：

- 19项针对性测试：八语源计数、五语每章位置、正文斜体/放大与名字分离、
  缺失入口字体及源宏变更拒绝，旧第四章重置/注释、元数据/只读渲染回归。
- 75处全部通过源节点与已生成正式指令核对。仅追加 historyResets，原530条
  名字格式、168条注释名字提示、其它元数据、程序/媒体保持不变。
- 七个实际主线旧点经公开迁移：五语第五章暂停 BGM 后进入六段连续村民
  对话；英语再从第五章中段进入六段后期喊话，从第八章第八个原选择走
  正常分支进入三段欢呼。共39个新增地址实际渲染、只读/冷恢复和继续通过。
  未改 PC、未强开禁存策略，均不是临时回放。原资料/夹具范围保留，未
  宣称其它四语累计游玩；其它36个地址仅有源码/正式指令核验。
- 九项浏览器：七个上述点的名字精确文字、正常14px/23px样式、源换行数、
  不重复自动名字，正文斜体/放大保留，原槽字节/修订与栈/历史/已读不变，
  图文保存刷新恢复；英韩第四章注释名字另做两项回归。

实际命令：

```sh
pnpm exec tsx tooling/compile-history-late-resets.ts --clone
pnpm exec tsx tooling/compile-history-late-resets.ts all
pnpm exec tsx --test tests/source-late-resets.test.ts tests/source-speaker-resets.test.ts tests/history-content.test.ts tests/source-note-names.test.ts tests/history-speaker-hints.test.ts
pnpm exec tsx tooling/verify-history-late-resets.ts en,jp,ko,zh
pnpm exec tsx tooling/verify-history-late-resets.ts fr,it,pt-br,ru
pnpm exec playwright test --config playwright.history-late-resets.config.ts
pnpm check
pnpm exec tsx tooling/promote-history-late-resets.ts
pnpm build
pnpm exec tsx artifacts/history-late-resets/default-smoke.ts
```

候选 generated/history-late-resets 与收据/存档/截图/日志所在
artifacts/history-late-resets 全部 ignore。headless 媒体模拟完成，浏览器使用
本地素材；无原作运行录制，不声称逐像素认证。SDK仍实包 d222adf212da，
来源 bd2cab2。仅本地正常追加提交，未推送/部署。

任意入口角色缓存、其它包装/名字宏隐式换行、字体 face/完整历史行内对齐、
原500/2000行缓冲仍开放；本轮只解决明确重置，不把它等同于缓存全面兼容。

最终 build 通过：3478个 PB、2188916940解码字节、209381294压缩字节。
4184默认入口核对六个第五章重复名字的14px/23px正常样式，正文斜体保留，
旧槽/历史/已读不变，图文保存刷新通过，无 pageerror。
