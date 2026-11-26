# Android 采集中的已知问题

## 等待页面启动

- `startActivitySync()` 与 `waitForIdleSync()` 在部分设备或持续渲染的页面上可能长时间不返回。先查看前台 Activity、截图和相关日志，判断是路由、锁屏还是等待机制问题，不要先改生产页面。
- 必要时通过主线程 `startActivity()` 启动，结合应用已有的 Activity 跟踪或生命周期回调，限时等待目标 Activity 和控件可见，再给布局与图片加载合理的稳定时间。`singleTask` 页面可能收到 `onNewIntent`，不能假设每次都是新实例。
- 轮询需要总超时。图片转换等异步任务等待真实完成条件；仅依靠固定休眠可能拍到加载占位。

## 返回和前台窗口

- 某些设备的同步按键注入也会等待。可以尝试 `uiAutomation.performGlobalAction(GLOBAL_ACTION_BACK)`，随后检查前台状态，或显式关闭已知对话框。
- 操作前确认目标对话框实际出现。`performClick()` 返回不代表弹窗已经打开，隐藏、禁用的控件尤其如此。
- 设置自定义颜色、工具切换等控件的类型可能从 ChipGroup 改为普通 ViewGroup；以当前代码和实际层级为准。
- 全屏预览可能隐藏工具栏或处于独立窗口；通过所属包与实际截图判断，不能只凭 Activity 名。

## 两阶段处理与保存

“处理完成”可能只生成缓存。分别采集待保存、保存成功和展开详情等真实状态；不要把一次点击主按钮当成完成保存。
批量状态用至少两份不同文件或不同 URI；重复导入同一 URI 可能被去重。多页 PDF 的合并与分页效果也要核对。

## 持久化与恢复

建议先把历史文件、将修改的 SharedPreferences 和必要状态备份到应用私有的独立采集备份目录，写入恢复清单，再开始准备样例。只在成功恢复后清理备份。安装/重装测试 APK、强停应用会中断 `finally`；重跑前先检查遗留备份。
清理样例导出时按本次生成的准确 URI 清理，名称前缀只能用于辅助核对，不能用于删除用户同名文件。

## 二进制截图导出

原图由 `UiAutomation.takeScreenshot()` 或 `adb exec-out screencap -p` 生成，不压缩重绘后当作原始 PNG。
从私有目录导出时，可对可调试包使用 `run-as` 与 tar：

```powershell
# PowerShell 7.4+ 原生程序重定向保留二进制；先确认运行版本。
adb -s <serial> exec-out run-as <package> tar -cf - -C files/<capture-dir> . > captures.tar
tar -tf captures.tar
```

旧 PowerShell 不应把二进制输出送入文本管道、Out-File 或 Set-Content；改用进程标准输出字节流复制或其他可靠传输方式。解包前确认 tar 条目是预期相对截图路径，不含绝对路径或 `..`。

## 本次 App 之外的通用性

不要固定 Image Converter、某次日期、设备型号、包名、截图数量、格式枚举、View ID 或桌面路径。旧版独立页面、隐藏 Pro 页面、网页加载失败和第三方系统界面，要按目标 App 的实际情况记录，不能沿用之前项目的说明。
