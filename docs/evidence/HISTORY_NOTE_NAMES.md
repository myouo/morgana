# 注释角色名与相邻角色缓存

2026-11-06，本地继续。六语第四门普通／通关后新增168个按源地址绑定的
注释名字提示，恢复角色切换后的名字、字号和前后换行。原530条普通名字
格式不变。222处同角色调用保持抑制，韩语6处已有显式重置提示不重复。

每语每分支有33处 s_michel/s_whitehair 直接接注释的调用。西文14处切换、
19处重复；韩语另有3处显式 reset_speaker，已由原提示覆盖。所有实际输出
都带明确 hr；无 hr 的重复角色继续同行，不补造名字或分隔行。

证明限定于相邻源码块：前一个正文必须能追到已核验的字面角色宏，角色宏
到正文间不允许重置或其它未知状态变化；正文到注释间只允许本轮实际出现
的清屏/历史/显示标签和普通标签位置，显式重置必须紧邻目标宏。输出开关
也必须已知开启。ctrlSpeakingPerson/draw_name 源指纹、名字格式和独立历史
对齐沿用现有验证，没有执行 TJS 或建立第二套剧情运行器。

编译后还要求前一个字面正文与目标注释在同一函数，普通函数入口在正文
之前；函数不能有分支/跳转，二者之间不能有调用或其它控制转移。目标原
文字及已有尾换行逐项核对。共396个源调用通过源码和正式指令的对应检查。
这是有限静态证明，不是任意跳转/跨分支角色缓存模拟。

只增加 historyNoteNames 并移除其覆盖的168处既有前导 hr 提示，以名字前后
换行表达同一来源，避免重复。原28处显式重置、530条名字格式、其它展示
字段及八语程序/素材不变，中日 title 字节不变。新目录最多128项，旧重置
目录仍限制32项；名字提示与前导 hr/重置地址重叠会拒绝。名字前换行可以
建立历史对齐边界，段落边界吸收一次换行，避免额外空行。

验收：

- 25项针对性测试：六语两分支切换/抑制，源宏选项变更/正文前重置/未知跳转拒绝，编译入口
  绕过/分支/调用/错误字面正文拒绝，持久 wire、容量/重叠、只读/裁剪、
  名字同行及历史对齐换行去重，原普通/重置名字和分片回归。
- 八个实际主线旧切点：六语普通、英韩通关后。程序身份保持，不改 PC；
  旧注释立即显示4个缺失名字，再用标准 Core 前进到首个无 hr 的同角色
  注释，确认不产生名字/分隔行。只读 Snapshot/资料不变，冷恢复及继续通过。
  英语沿用原普通/累计资料，其它语言保留既有夹具范围；不冒充整作累计游玩。
- 10项浏览器：八个上述切点的原文字、字号/行高、精确换行次数、同角色
  注释原内容不变、旧槽字节/修订与已读/栈不变、图文保存刷新恢复；另有
  英韩普通名字两项回归。检查了英语实际历史截图，角色切换名字可见，
  相同角色的省略号与注释仍同行。

实际命令：

```sh
pnpm exec tsx tooling/compile-history-note-names.ts --clone
pnpm exec tsx tooling/compile-history-note-names.ts all
pnpm exec tsx --test tests/source-note-names.test.ts tests/history-content.test.ts tests/history-name-formats.test.ts tests/source-speaker-resets.test.ts tests/history-speaker-hints.test.ts tests/history-parts.test.ts
pnpm exec tsx tooling/verify-history-note-names.ts all
pnpm exec playwright test --config playwright.history-note-names.config.ts
pnpm check
pnpm exec tsc --noEmit
pnpm exec tsx tooling/promote-history-note-names.ts
pnpm build
pnpm exec tsx artifacts/history-note-names/default-smoke.ts
```

生成目录 generated/history-note-names、收据/存档/截图/trace/log所在
artifacts/history-note-names 全部 ignore；实际游戏载荷未纳入提交。headless
媒体模拟完成，浏览器使用本地素材；无原作运行录制，不声称逐像素认证。
SDK仍为实包 d222adf212da，来源 bd2cab2。本地正常追加提交，未推送/部署。

任意跨入口/跨分支缓存、其它名字包装、字体 face/继承色的完整映射、
原500/2000行缓冲继续开放。本轮不把有限相邻块证明扩展为整作缓存兼容。

最终 build 通过：3478个 PB、2188896588解码字节、209379497压缩字节。
4184默认入口以英语旧主线点验证4个名字的14px/23px字号/行高、同角色
注释精确内容与图文保存刷新，Snapshot/已读不变，无 pageerror。
