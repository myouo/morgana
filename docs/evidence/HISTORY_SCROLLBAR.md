# 历史文本滑块（2026-11-05）

已随主包上线preview ca5086fd-12a2-4110-8ffd-b208ba8c4c97；regression为
0e34664e-fa5e-4b65-9718-b92409e7dcb4。范围为原皮肤与滚动输入同步，历史内容
容量/注释及逐像素认证另列F-05，整作goal保持active。最终preview全部4872文件/
2366968102解码字节核对通过，匿名/Range/鉴权隔离正常。

实际入口Override.tjs加载ExtendedHistoryLayer/ScrollBar。八语只读源核对：
x604、y100、宽15；中文/日文高420，其余440；底色1c1f2d、滑块/按钮000000，
普通亮边由基色加128得到808080。替换浏览器默认细条，保留SDK HistoryText。

拖动按变换后的实际矩形换算，滚轮/键盘Home/End/方向/翻页与内容scroll同步。
ResizeObserver跟随正文/容器高度，内容不足时隐藏；既有末尾向下滚动返回正文
行为保留。历史菜单允许内部pointer处理，同时隔离正文输入。

实际命令及证据：

- pnpm exec tsx --test tests/history-scrollbar-source.test.ts：源参数1项/八语通过。
- pnpm exec playwright test --config playwright.history-scrollbar.config.ts：初次中英2项通过。
- MORGANA_RUN=realtime-history pnpm exec playwright test --config playwright.history-scrollbar.remote.config.ts：当前版本中英2项通过，30.5/33.5秒，0失败/0跳过。
- pnpm check；pnpm build：通过。线上测试核对当前release/SDK身份。

浏览器从真实旧回忆档经已注册迁移恢复；正常播放后进入历史，系统自动暂停。
验证顶部拖动、滚轮同步、End到底、800×600缩放后中段拖动，剧情frames/text/
wait不变。短历史隐藏滚条也通过。补查初次误要求菜单保持非暂停，2项预期
失败；按SDK真实自动暂停行为纠正测试后，最终线上两项全部通过。

八语Config均为everypage=false；中日韩maxLines=2000，其余500。当前应用显示
最近64条记录，计量尚未对齐；SDK公开HistoryPolicy.maxEntries上限也是64。
后续需在SDK补通用有界历史能力，再调整转换器state.collect及存档/刷新保留，
不在实例复制历史引擎。与hisout/hisname注释一起列F-05。源参数临时记录为
artifacts/history-scrollbar/source-retention.json。按钮按住连发、平台高亮及完整
逐像素/换行对照亦未认证，不因此阻塞主流程交付。
