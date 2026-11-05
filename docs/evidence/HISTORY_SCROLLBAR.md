# 原历史滚条功能修补（2026-11-05）

用户要求以整作主流程拼接为准，并点名历史文本滑块。本次范围限于历史界面
的滚条皮肤与输入同步，不推进剧情或另造引擎，主流程组合验证继续独立执行。

实际入口Override.tjs加载ExtendedHistoryLayer/ScrollBar。八语源核对：x604、
y100、宽15，中文/日文高420，其余高440；底色1c1f2d、按钮/滑块000000，原
ScrollBar普通边框由基色加128得到808080。替换当前浏览器默认细条，保留原
history滚动容器和SDK HistoryText，轨道/拇指/上下行按钮为作品皮肤。

拖动按实际变换后轨道矩形换算，缩放不改变映射；滚轮、键盘Home/End/方向/
翻页和内容scroll事件同步位置。ResizeObserver跟随容器/正文高度，溢出不足
时不显示。既有滚轮在末尾返回正文行为保持。历史菜单只在冒泡阶段阻止
pointer事件，允许内部拖动处理，同时不会将操作传给正文。

实际命令：pnpm exec tsx --test tests/history-scrollbar-source.test.ts；
pnpm exec tsc --noEmit；pnpm exec playwright test --config
playwright.history-scrollbar.config.ts。源参数1项（8语）与中英2浏览器均通过。
浏览器载入真实旧回忆选择档，经正式迁移恢复后打开长历史；验证最顶部拖动、
滚轮同步、End到底、改800×600后中段拖动及剧情frames/text/wait不变。短历史
隐藏滚条也验证。查看中文拖动截图，轨道/黑滑块在原历史背景对应位置可见。

尚未发布这项前端变更。按钮按住连发、平台高亮颜色及原作逐像素/换行完整
对照不在本次功能断言中，不以此阻塞整作主包接续，也不称100%像素还原。
