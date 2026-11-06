# 居中名牌包装的历史名字

2026-11-06，本地收尾。英法意葡俄各14条center=true包装新增历史名字规则，
共70条、生成时核对8959个结构化段落；累计规则448→518。沿用已有字号、
行高、原显示名匹配和只读名字格式系统，不改剧情指令/资源/存档身份。

原draw_name的center控制正文名牌定位/消息层style；历史仍写入独立的
formatHistoryName，居中由hc切换historyLayer.isCentered。MainWindow.style
实际只调用消息层setStyle，其源片段SHA锁定为
`312396c145ab52c22233108c30269bb9759613c24ab9daa48e7e405b8969d5d2`；
hc与/hc的单条字面赋值也校验。未把正文居中选项直接赋给历史。

SDK记录中的speaker仍是已有转换器产生的显示名，规则以该值作匹配门槛，
历史文本则使用原格式函数；本轮不声称修复正文名牌本身的全部差异。

## 验收与边界

- 15项针对性测试：原普通规则保持、居中包装源格式、源style/hc变更拒绝、
  no_newline仍排除，以及既有精确文本、字号、宏键/重置、分片回归。
- 五种西文第七门实际主线旧章节入口，经已有正式源映射和标准Core取得
  7antonin样本，均未隔离回放或手改PC；只读渲染不动Snapshot/进度，冷恢复、
  继续通过。英语为32634条已读的普通结局记录；其它四语沿用原菜单夹具，
  样本60条已读，不冒充累计游玩。
- 7项浏览器：五语原历史名字文本、字号/行高、独立历史对齐、原槽字节/
  修订/进度及图文保存刷新；英韩普通名字两项回归不变。实际七门样本的历史
  对齐为非居中，即使源角色宏带center=true。
- 仅追加historyNames数组；旧448条逐字段保持，正文/注释/字号其它元数据
  不改。提升校验父title/清单SHA、全部代码体SHA、源规则、切点与浏览器身份。
  中日及韩语没有新增可绑定包装，三语title字节保持不变。

后台maskedwoman与其它共享包装在本轮只核对源宏和已有字面rich指令，没有
实际后台存刷认证。首轮误用的bonus-connected切点属于隐藏序章，进入菜单
禁存阶段后不能作为后台证据，已移除该路线断言；未强开saveAllowed过验。
日志保留initial-route.log。no_newline、复杂包装、字体face/继承色、动态
角色缓存和原生行缓冲仍另验。

实际命令：

```sh
pnpm exec tsx tooling/compile-history-centered-names.ts --clone
pnpm exec tsx tooling/compile-history-centered-names.ts all
pnpm exec tsx --test tests/history-name-formats.test.ts tests/history-content.test.ts tests/history-parts.test.ts
pnpm exec tsx tooling/verify-history-centered-names.ts all
pnpm exec playwright test --config playwright.history-centered-names.config.ts
pnpm check
pnpm exec tsx tooling/promote-history-centered-names.ts
pnpm build
pnpm exec tsx artifacts/history-centered-names/default-smoke.ts
```

收据/切点/截图/trace仅在artifacts/history-centered-names，候选
generated/history-centered-names均ignore。headless媒体模拟完成，浏览器用
真实本地资源；无原作运行录制，不作逐像素认证。SDK仍d222adf212da/bd2cab2。
正常追加本地提交，未推送/部署。

最终build通过：3478个PB、2188860236解码字节、209378535压缩字节。
4184默认入口以英语七门实际切点核对7antonin名字格式、14px/23px行高及
独立历史对齐start；无pageerror。前端源码/SDK未改，只有展示规则追加。
