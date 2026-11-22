// Ready-made button ideas. Text is [English, Hebrew]. `ask` = part of the target the user should replace (gets selected).
window.IDEAS = [
  {
    cat: ['Websites', 'אתרים'], items: [
      { label: ['Google', 'Google'], icon: '🔍', color: '#ea4335', type: 'url', target: 'https://www.google.com', d: ['Search', 'חיפוש'] },
      { label: ['Gmail', 'Gmail'], icon: '📧', color: '#ea4335', type: 'url', target: 'https://mail.google.com', d: ['Email', 'דואר'] },
      { label: ['Drive', 'Drive'], icon: '☁️', color: '#f5a524', type: 'url', target: 'https://drive.google.com', d: ['Cloud files', 'קבצים בענן'] },
      { label: ['Maps', 'מפות'], icon: '🗺️', color: '#22c55e', type: 'url', target: 'https://maps.google.com', d: ['Google Maps', 'Google Maps'] },
      { label: ['Translate', 'תרגום'], icon: '🌍', color: '#3b82f6', type: 'url', target: 'https://translate.google.com', d: ['Google Translate', 'Google Translate'] },
      { label: ['Claude', 'Claude'], icon: '✳️', color: '#d97757', type: 'url', target: 'https://claude.ai', d: ['AI assistant', 'עוזר AI'] },
      { label: ['ChatGPT', 'ChatGPT'], icon: '🤖', color: '#10a37f', type: 'url', target: 'https://chatgpt.com', d: ['AI assistant', 'עוזר AI'] },
      { label: ['WhatsApp', 'WhatsApp'], icon: '💬', color: '#25d366', type: 'url', target: 'https://web.whatsapp.com', d: ['WhatsApp Web', 'וואטסאפ ווב'] },
      { label: ['YouTube', 'YouTube'], icon: '▶️', color: '#ff0033', type: 'url', target: 'https://www.youtube.com', d: ['Video', 'וידאו'] },
      { label: ['Twitch', 'Twitch'], icon: '🟣', color: '#9146ff', type: 'url', target: 'https://www.twitch.tv', d: ['Live streams', 'שידורים חיים'] },
      { label: ['Spotify', 'Spotify'], icon: '🎧', color: '#1db954', type: 'url', target: 'https://open.spotify.com', d: ['Music', 'מוזיקה'] },
      { label: ['Netflix', 'Netflix'], icon: '🎬', color: '#b20710', type: 'url', target: 'https://www.netflix.com', d: ['Shows and movies', 'סדרות וסרטים'] },
      { label: ['Reddit', 'Reddit'], icon: '👽', color: '#ff4500', type: 'url', target: 'https://www.reddit.com', d: ['Communities', 'קהילות'] },
      { label: ['X', 'X'], icon: '✖️', color: '#1f2937', type: 'url', target: 'https://x.com', d: ['Social', 'רשת חברתית'] },
      { label: ['Amazon', 'Amazon'], icon: '📦', color: '#f59e0b', type: 'url', target: 'https://www.amazon.com', d: ['Shopping', 'קניות'] },
      { label: ['AliExpress', 'AliExpress'], icon: '🛍️', color: '#f97316', type: 'url', target: 'https://www.aliexpress.com', d: ['Shopping', 'קניות'] },
      { label: ['GitHub', 'GitHub'], icon: '🐙', color: '#24292f', type: 'url', target: 'https://github.com', d: ['Code', 'קוד'] },
      { label: ['Weather', 'מזג אוויר'], icon: '⛅', color: '#0ea5e9', type: 'url', target: 'https://www.google.com/search?q=weather', d: ['Forecast', 'תחזית'] },
      { label: ['KSP', 'KSP'], icon: '🖥️', color: '#ef4444', type: 'url', target: 'https://ksp.co.il', d: ['Israel: computers', 'מחשבים ואלקטרוניקה'] },
      { label: ['Zap', 'זאפ'], icon: '🛒', color: '#3b82f6', type: 'url', target: 'https://www.zap.co.il', d: ['Israel: price compare', 'השוואת מחירים'] },
      { label: ['ynet', 'ynet'], icon: '📰', color: '#ef4444', type: 'url', target: 'https://www.ynet.co.il', d: ['Israel: news', 'חדשות'] },
      { label: ['Waze', 'Waze'], icon: '🚗', color: '#0ea5e9', type: 'url', target: 'https://www.waze.com/live-map', d: ['Traffic', 'ניווט ופקקים'] }
    ]
  },
  {
    cat: ['PC commands', 'פקודות מחשב'], items: [
      { label: ['Shut down', 'כיבוי'], icon: '⏻', color: '#ef4444', type: 'command', target: 'shutdown /s /t 0', d: ['Turn off now', 'כיבוי מיידי'] },
      { label: ['Restart', 'הפעלה מחדש'], icon: '🔄', color: '#f97316', type: 'command', target: 'shutdown /r /t 0', d: ['Reboot', 'ריסטארט'] },
      { label: ['Off in 1 hour', 'כיבוי בעוד שעה'], icon: '⏲️', color: '#a855f7', type: 'command', target: 'shutdown /s /t 3600', d: ['Shutdown timer', 'טיימר כיבוי'] },
      { label: ['Cancel shutdown', 'ביטול כיבוי'], icon: '✋', color: '#64748b', type: 'command', target: 'shutdown /a', d: ['Stops the timer', 'מבטל טיימר כיבוי'] },
      { label: ['Sleep', 'שינה'], icon: '🌙', color: '#6366f1', type: 'command', target: 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0', d: ['Sleep mode', 'מצב שינה'] },
      { label: ['Lock', 'נעילה'], icon: '🔒', color: '#ef4444', type: 'command', target: 'rundll32.exe user32.dll,LockWorkStation', d: ['Lock the PC', 'נעילת המחשב'] },
      { label: ['Screen off', 'כיבוי מסך'], icon: '🖥️', color: '#1f2937', type: 'command', target: 'powershell -NoProfile -WindowStyle Hidden -Command "(Add-Type \'[DllImport(\\"user32.dll\\")]public static extern int SendMessage(int h,int m,int w,int l);\' -Name M -PassThru)::SendMessage(-1,0x0112,0xF170,2)"', d: ['Only the monitor', 'מכבה רק את המסך'] },
      { label: ['Empty Recycle Bin', 'ריקון סל מחזור'], icon: '🗑️', color: '#78716c', type: 'command', target: 'powershell -NoProfile -WindowStyle Hidden -Command "Clear-RecycleBin -Force"', d: ['No confirmation', 'בלי לשאול'] },
      { label: ['Disk Cleanup', 'ניקוי דיסק'], icon: '🧹', color: '#10b981', type: 'command', target: 'cleanmgr.exe', d: ['Free up space', 'פינוי מקום'] },
      { label: ['Device Manager', 'מנהל התקנים'], icon: '🔌', color: '#475569', type: 'command', target: 'start devmgmt.msc', d: ['Drivers and hardware', 'דרייברים וחומרה'] },
      { label: ['Disk Management', 'ניהול דיסקים'], icon: '💽', color: '#475569', type: 'command', target: 'start diskmgmt.msc', d: ['Drives and partitions', 'כוננים ומחיצות'] },
      { label: ['Control Panel', 'לוח הבקרה'], icon: '🎛️', color: '#3b82f6', type: 'command', target: 'control', d: ['Classic control panel', 'לוח בקרה קלאסי'] },
      { label: ['Command Prompt', 'שורת פקודה'], icon: '⌨️', color: '#1f2937', type: 'app', target: 'cmd.exe', d: ['CMD', 'CMD'] },
      { label: ['PowerShell', 'PowerShell'], icon: '🟦', color: '#1e40af', type: 'app', target: 'powershell.exe', d: ['Terminal', 'מסוף'] },
      { label: ['Startup folder', 'תיקיית הפעלה'], icon: '🚀', color: '#f5a524', type: 'url', target: 'shell:startup', d: ['Apps that start with Windows', 'תוכנות שעולות עם ווינדוס'] },
      { label: ['Temp folder', 'תיקיית Temp'], icon: '🧺', color: '#78716c', type: 'command', target: 'explorer.exe %TEMP%', d: ['Temporary files', 'קבצים זמניים'] }
    ]
  },
  {
    cat: ['Windows settings', 'הגדרות ווינדוס'], items: [
      { label: ['Wi-Fi', 'Wi-Fi'], icon: '📶', color: '#0ea5e9', type: 'url', target: 'ms-settings:network-wifi', d: ['Wireless networks', 'רשתות אלחוטיות'] },
      { label: ['Bluetooth', 'Bluetooth'], icon: '🔵', color: '#3b82f6', type: 'url', target: 'ms-settings:bluetooth', d: ['Headphones and devices', 'אוזניות ומכשירים'] },
      { label: ['Display', 'צג'], icon: '🖥️', color: '#6366f1', type: 'url', target: 'ms-settings:display', d: ['Resolution and brightness', 'רזולוציה ובהירות'] },
      { label: ['Sound', 'שמע'], icon: '🔊', color: '#a855f7', type: 'url', target: 'ms-settings:sound', d: ['Speakers and mic', 'רמקולים ומיקרופון'] },
      { label: ['Updates', 'עדכונים'], icon: '⬆️', color: '#10b981', type: 'url', target: 'ms-settings:windowsupdate', d: ['Windows Update', 'Windows Update'] },
      { label: ['Apps', 'אפליקציות'], icon: '🧩', color: '#64748b', type: 'url', target: 'ms-settings:appsfeatures', d: ['Uninstall apps', 'הסרת תוכנות'] },
      { label: ['Storage', 'אחסון'], icon: '💾', color: '#f5a524', type: 'url', target: 'ms-settings:storagesense', d: ['Drive space', 'מקום בכוננים'] },
      { label: ['Printers', 'מדפסות'], icon: '🖨️', color: '#475569', type: 'url', target: 'ms-settings:printers', d: ['Printers and scanners', 'מדפסות וסורקים'] },
      { label: ['Wallpaper', 'רקע'], icon: '🖼️', color: '#ec4899', type: 'url', target: 'ms-settings:personalization-background', d: ['Desktop background', 'תמונת רקע'] },
      { label: ['Battery', 'סוללה'], icon: '🔋', color: '#22c55e', type: 'url', target: 'ms-settings:batterysaver', d: ['Power and battery', 'חשמל וסוללה'] },
      { label: ['Camera', 'מצלמה'], icon: '📷', color: '#1f2937', type: 'url', target: 'microsoft.windows.camera:', d: ['Camera app', 'אפליקציית מצלמה'] },
      { label: ['Screenshot', 'צילום מסך'], icon: '✂️', color: '#ec4899', type: 'url', target: 'ms-screenclip:', d: ['Snip the screen', 'חיתוך מסך'] }
    ]
  },
  {
    cat: ['People', 'אנשים'], items: [
      { label: ['WhatsApp to...', 'וואטסאפ ל...'], icon: '💬', color: '#25d366', type: 'url', target: 'https://wa.me/15550000000', ask: '15550000000', d: ['Direct chat with a contact', 'צ\'אט ישיר לאיש קשר'] },
      { label: ['Email to...', 'מייל ל...'], icon: '📧', color: '#ea4335', type: 'url', target: 'mailto:name@example.com', ask: 'name@example.com', d: ['Opens a new email', 'פותח מייל חדש'] },
      { label: ['Email with subject', 'מייל עם נושא'], icon: '✉️', color: '#f97316', type: 'url', target: 'mailto:name@example.com?subject=Hello', ask: 'name@example.com', d: ['Subject filled in', 'מייל עם נושא מוכן'] },
      { label: ['Call...', 'שיחה ל...'], icon: '📞', color: '#10b981', type: 'url', target: 'tel:+15550000000', ask: '+15550000000', d: ['Through a phone link', 'דרך קישור לטלפון'] },
      { label: ['Teams to...', 'Teams ל...'], icon: '👥', color: '#6264a7', type: 'url', target: 'https://teams.microsoft.com/l/chat/0/0?users=name@example.com', ask: 'name@example.com', d: ['Teams chat', 'צ\'אט ב-Teams'] },
      { label: ['Zoom', 'זום'], icon: '🎥', color: '#2d8cff', type: 'url', target: 'https://zoom.us/j/0000000000', ask: '0000000000', d: ['Your fixed meeting', 'פגישת זום קבועה'] },
      { label: ['Google Meet', 'Google Meet'], icon: '📹', color: '#00897b', type: 'url', target: 'https://meet.google.com/new', d: ['New meeting', 'פגישה חדשה'] },
      { label: ['Facebook of...', 'פייסבוק של...'], icon: '👤', color: '#1877f2', type: 'url', target: 'https://facebook.com/username', ask: 'username', d: ['Someone\'s profile', 'פרופיל של מישהו'] },
      { label: ['Instagram of...', 'אינסטגרם של...'], icon: '📸', color: '#e1306c', type: 'url', target: 'https://instagram.com/username', ask: 'username', d: ['Someone\'s profile', 'פרופיל של מישהו'] }
    ]
  }
];
