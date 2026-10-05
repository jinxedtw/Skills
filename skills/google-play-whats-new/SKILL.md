---
name: google-play-whats-new
description: >-
  Draft Google Play release “What’s new” / update changelog text in the exact
  multi-locale tagged format Play Console expects. Use when the user says
  更新日志, 帮我写更新日志, GP 更新日志, Play what’s new, or release notes.
disable-model-invocation: true
---

# Google Play 更新日志

根据版本改动，写出 Google Play「该版本的新内容 / What’s new」文案。

## 规则

1. 先弄清本版改动（用户说明、git log、版本号均可）。信息不够再问，不要空写。
2. 只输出下方 **9 种语言** 的标签块，不要加标题、说明、markdown 代码围栏或其它包裹。
3. **标签名与顺序必须与模板完全一致**，Google 才能识别。不要改成别的 locale、不要缺语言、不要调换顺序。
4. 每种语言 2–5 条要点，每条一行，以 `• `（项目符号 + 空格）开头。
5. 文案按各语言自然表达，不要整段机翻硬套；专有名词（如 Google Play、RAM、Wi‑Fi）可保留常见写法。
6. 不要写内部实现细节（类名、PR、厂商 ROM bug 排查过程）；面向普通用户。

## 输出模板（格式禁止改动）

尖括号标签必须原样保留；标签内换成当次更新内容。

```
<en-US>
• First release on Google Play
• Test phone hardware and system features in one app
• Auto test, manual checks, device info, RAM status, and app uninstall
</en-US>
<hi-IN>
• Google Play पर पहली रिलीज़
• एक ऐप में फ़ोन हार्डवेयर और सिस्टम सुविधाओं की जाँच करें
• ऑटो टेस्ट, मैन्युअल जाँच, डिवाइस जानकारी, RAM स्थिति और ऐप अनइंस्टॉल
</hi-IN>
<ja-JP>
• Google Play に初公開
• スマホのハードウェアとシステム機能を1つのアプリでテスト
• 自動テスト、手動テスト、端末情報、RAM 状態、アプリのアンインストールに対応
</ja-JP>
<ko-KR>
• Google Play 첫 출시
• 한 앱에서 휴대폰 하드웨어와 시스템 기능을 테스트하세요
• 자동 테스트, 수동 테스트, 기기 정보, RAM 상태, 앱 삭제 지원
</ko-KR>
<zh-TW>
• 應用程式首次上架 Google Play
• 一站式檢測手機軟硬體是否正常
• 支援自動測試、手動測試、裝置資訊、記憶體狀態與解除安裝應用程式
</zh-TW>
<th>
• เปิดตัวครั้งแรกบน Google Play
• ทดสอบฮาร์ดแวร์และฟีเจอร์ระบบของมือถือในแอปเดียว
• ทดสอบอัตโนมัติ ทดสอบด้วยตนเอง ข้อมูลอุปกรณ์ สถานะ RAM และถอนการติดตั้งแอป
</th>
<vi>
• Phát hành lần đầu trên Google Play
• Kiểm tra phần cứng và tính năng hệ thống của điện thoại trong một ứng dụng
• Hỗ trợ kiểm tra tự động, kiểm tra thủ công, thông tin thiết bị, trạng thái RAM và gỡ cài đặt ứng dụng
</vi>
<zh-CN>
• 应用首次上架 Google Play
• 一站式检测手机软硬件是否正常
• 支持自动测试、手动测试、设备信息、内存状态与卸载应用
</zh-CN>
<it-IT>
• Prima pubblicazione su Google Play
• Testa hardware e funzioni di sistema del telefono in un’unica app
• Test automatici, test manuali, info dispositivo, stato della RAM e disinstallazione app
</it-IT>
```

语言与标签顺序固定为：`en-US` → `hi-IN` → `ja-JP` → `ko-KR` → `zh-TW` → `th` → `vi` → `zh-CN` → `it-IT`。
