# 等待与转场中的历史正文前缀

2026-11-06，本地收尾。实际第六、七门在段落中进入控制等待时，正文前缀
已显示且源允许写历史，但旧SDK仅从当前文本输入提示投影未确认文字，历史页
暂时缺少这段。现由SDK W1-27补齐，实例接实包d222adf212da，来源bd2cab2。

仅支持delay/group等待中的已显完continue前缀，按当前实际代码的at、文字
身份及完整rich签名匹配。源recordHistory=false、清页、已确认/结束或其它
等待不投影；原文字对象冻结，只读，不确认/标读/写journal，不授予回退或
语音重放。显示仍最多512条并包含当前行；Snapshot/protobuf与存储预算不变。

这补齐了F-05的一项控制等待缺口。原作按写入文字计量，西文/韩文逻辑换行
与中日增量折行不同；500/2000行缓冲、其它执行/资源等待阶段、动态名字缓存
和零字时序仍另验。没有用段落数冒充行数，没有恢复旧程序已经丢掉的历史。

## 实际验证

- SDK：493单元/104文件、strict/headless/check、4相关浏览器、隔离实包消费
  及294项浏览器分片覆盖通过。真实工厂覆盖delay/group、预算1/8/100、已返回
  callee与跨模块冷恢复、共享样式及源替换拒绝。默认策略仍关闭，实例沿用此前
  已启用的includeCurrentText。
- 实例中英第六、七门4个实际主线切点：从旧原章节菜单切点，经正式源映射
  与标准Core运行取得；不是SDK独立回放，不手改PC。使用已记录的普通结局
  进度（英32634/中32664条已读），不扩大为这次重验七结局累计路线。
- 在旧9d74包上记录缺失、冷恢复及继续到完整段落的参考快照/进度。新包4点
  冷恢复的完整叙事Snapshot与旧参考一致；只读投影重复查询不改状态/进度，
  不写journal；随后2次驱动步骤后的完整快照与进度逐字段一致。
- 中英4项浏览器：前缀实际出现在原历史页，原槽字节/修订号不变，完整已读
  保留；图文保存、刷新、冷读后仍为同一等待/同一前缀，未提前确认。首轮断言
  漏算DOM的br，改为按实际br节点还原换行后重跑，未删文字/时序/存档断言。
- 八语清单、展示及1073个代码模块逐SHA不变，素材文件未改；不重新转换
  游戏数据，不为这次SDK升级新增游戏发行身份。

实际命令：

```sh
# 旧包取得实际主线切点并记录参考：
pnpm exec tsx artifacts/history-prefix/find-mainline.ts
pnpm exec tsx tooling/verify-history-prefix.ts --baseline
# 新包运行：
pnpm sdk:update
pnpm exec tsx tooling/verify-history-prefix.ts
pnpm exec tsx tooling/verify-history-prefix-publication.ts
pnpm exec tsx --test tests/history-content.test.ts tests/reading-history-policy.test.ts
pnpm exec playwright test --config playwright.history-prefix.config.ts
pnpm check
pnpm build
pnpm exec tsx artifacts/history-prefix/default-smoke.ts
```

`tooling/verify-history-prefix.ts --capture`提供相同主线切点的重建入口；baseline
必须在仍可复现缺失的旧包记录，不能把新结果改标签当作旧参考。切点、原日志、
截图/trace和SDK来源收据在artifacts/history-prefix/，不提交。headless媒体由
驱动模拟完成，浏览器使用真实本地资源；不据此认证原作逐像素或全部路线。

只正常追加本地提交，未推送或部署；原生行缓冲仍是下一项独立验收。

最终build通过，PB文件仍为3478个、2188729356解码字节/209358230压缩字节，
与上一轮数据完全相同；只更新前端SDK包。4184默认入口刷新依赖后，以中文七门实际切点冒烟通过：同一游戏发行身份、
512条策略、前缀仍为UNCONFIRMED_TEXT，无pageerror。
