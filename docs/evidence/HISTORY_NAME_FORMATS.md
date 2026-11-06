# 普通历史角色名格式

2026-11-06，本地收尾。西文/韩文原draw_name先以16号字写入历史名字，再恢复
正文默认字号18/22。此前普通自动名字沿用历史正文字号，且韩语名字缺少原
formatHistoryName的前导空格；明确reset名字已有独立提示，不受这次替换。

英法意葡俄各75条、韩73条规则，共448条源规则按宏共享。生成阶段逐条核对
180027个可记录的rich段落ID/原显示名匹配，发布数据不重复这些ID；运行时
仍须同时匹配既有历史宏键、结构化正文及原speaker字符串才应用。样式计算为
round(historyFontSize×16/baseSize)，行高补回原lineHeight-fontHeight差值。
文本完整采用原格式函数，不在已有缩进上再拼一次前缀。

去重采用匹配规则中的字面ctrlSpeakingPerson键。这里只改善可见记录内的
普通块，不冒充完整跨分支/隐藏写入的角色缓存。明确reset仍优先，既有28条
名字提示和前导hr元数据不改。中日历史不存这些样式，本轮title文件字节不变。

## 支持边界

只接入两个字面tag组成的普通ctrl/draw包装；source draw/control及配置默认
字号均校验。中心/no_newline/复杂包装、无名块保留旧处理，并在编译收据逐项
列出；韩语villager3的额外引号属性不归入新规则。六语重复girl定义完全相同，
核对后一份共享，遇到不同覆盖拒绝。字库face/继承色彩、特殊包装、动态缓存、
原作500/2000行缓冲仍另验。没有执行TJS、增加剧情解释器或猜测真人选择。

## 验收

- 14项针对性测试：真实protobuf的精确文本/整数比例、重复/非法规则拒绝、
  八语源包装与配置、未知源变更拒绝；显示名不匹配时保留旧显示；重复缩进、
  宏键去重、明确reset、历史分片和只读叙事状态回归。
- 六语实际主线第六门旧章节入口，经已有正式源映射、标准Core运行到命名
  段落，非SDK独立回放、不手改PC。只读渲染、冷恢复、继续通过。英语使用
  记录的普通结局进度（32634条已读）；其它五语沿用既有菜单解锁夹具的范围，
  样本时7条已读，不冒充其完整累计游玩。
- 10项浏览器：六语精确名字文本/前导空格、实际字号与行高、原槽字节/修订、
  完整进度及图文保存刷新；另英韩普通/通关4项明确重置仍只显示一次。
- 提升检查8份父清单/title身份、全部代码体SHA、仅新增historyNames字段、
  源规则/实测切点/浏览器SDK和展示身份；中日强制字节不变。程序、资源、
  存档和游戏发行身份不改。SDK仍d222adf212da（bd2cab2），无SDK新提交。

实际命令：

```sh
pnpm exec tsx tooling/compile-history-names.ts --clone
pnpm exec tsx tooling/compile-history-names.ts all
pnpm exec tsx --test tests/history-name-formats.test.ts tests/history-content.test.ts tests/history-parts.test.ts
pnpm exec tsx tooling/verify-history-names.ts all
pnpm exec playwright test --config playwright.history-names.config.ts
pnpm check
pnpm exec tsx tooling/promote-history-names.ts
pnpm build
pnpm exec tsx artifacts/history-names/default-smoke.ts
```

初次探查中发现重复宏/特殊属性并收紧范围；未放宽来源/存档断言。编译收据、
原始切点、截图/trace在artifacts/history-names，候选generated/history-names，
均ignore。headless媒体模拟完成，浏览器使用真实本地资源，不当原作运行录制。
仅正常追加本地提交，未推送或部署。

最终build通过：3478个PB，2188849026解码字节、209377489压缩字节；
相对上一轮展示数据只增75424原始字节/13146压缩字节。4184默认入口以英语
实际切点验证精确名字、14px/23px行高（源倍率计算），无pageerror。
