# no_newline 包装后明确换行的正文名字

2026-11-06，本地补齐六语第四门 `s_michel` / `s_whitehair` 的正文历史
名字格式，增加12条规则，累计518→530。仅覆盖源宏后直接跟随 `[hr]` 的
可记录正文；保留原格式函数的缩进、16/default 字号比例和行高。

`no_newline=true` 只跳过 draw_name 末尾的 hr，不能据此把所有使用点都改成
同行。英法意韩葡俄普通／通关后两套源流程，各有8个可记录正文段落，全部
直接写有一条 hr；共96个分支位置、48个语言内段落绑定。历史专用注释还有不带
hr 的调用，涉及原 speakingPerson 缓存，本轮没有补造这类名字。

生成前验证 draw_name、ctrlSpeakingPerson、格式函数及独立历史对齐的源
语义；直接宏→hr→首段正文必须匹配，跨标签/其它指令、缺失 hr 会拒绝。
再遍历正式清单所有 rich 指令，以段落 ID、宏键及字面 speaker 匹配源证明。
只追加 title.historyNames；原518条逐字段保持，程序/媒体/其它元数据不变，
中日 title 字节不变。没有执行 TJS，也没有增加剧情解释器。

验收：

- 15项针对性测试通过：六语两套源证明、缺失 hr/跨边界拒绝、显式选项、
  原格式不变、只读渲染及注释专用记录不多出名字或换行。
- 八个实际主线切点：六语普通分支、英韩通关后分支。从真实旧章节/重置
  切点经已有公开迁移进入标准 Core，不改 PC、不强开禁存策略；两种名字
  同时可见，只读渲染、冷恢复及继续通过。英语切点保留15388/40175条已读，
  使用已有普通/累计通关资料；其它语言保留原菜单/资料夹具范围，不冒充
  整作累计游玩。
- 八项浏览器：原文字、字号、行高、换行布局、历史/栈/已读不变、旧槽字节
  与修订不变，图文保存后刷新恢复通过。

实际命令：

```sh
pnpm exec tsx tooling/compile-history-no-newline.ts --clone
pnpm exec tsx tooling/compile-history-no-newline.ts all
pnpm exec tsx --test tests/history-name-formats.test.ts tests/source-no-newline-body.test.ts tests/history-content.test.ts tests/history-speaker-hints.test.ts tests/source-speaker-resets.test.ts
pnpm exec tsx tooling/verify-history-no-newline.ts en,ko,jp,zh
pnpm exec tsx tooling/verify-history-no-newline.ts fr,it,pt-br,ru
# 前述遍历优化后，其余三语重新运行：
pnpm exec tsx tooling/verify-history-no-newline.ts it,pt-br,ru
pnpm exec playwright test --config playwright.history-no-newline.config.ts
pnpm check
pnpm exec tsx tooling/promote-history-no-newline.ts
pnpm build
pnpm exec tsx artifacts/history-no-newline/default-smoke.ts
```

生成目录 `generated/history-no-newline` 与 `artifacts/history-no-newline` 的
原载荷、收据、切点、截图和日志全部 ignore。headless 媒体模拟完成，浏览器
使用本地实际素材；无原作运行录制，不声称逐像素认证。SDK保持实包
`d222adf212da`，来源 `bd2cab2`。仅本地追加提交，未推送/部署。

真正同行的注释名字、跨分支角色缓存、复杂名字包装、字体 face/继承色及
原生500/2000行缓冲继续开放；此次不代表 no_newline 全部语义完成。

最终 `pnpm build` 通过：3478个 PB、2188862408解码字节、209378697压缩字节。
4184默认入口核对 `s_michel` 原格式、14px/23px行高、历史对齐 start，
无 pageerror。剧情程序、前端渲染器和 SDK 未改。
