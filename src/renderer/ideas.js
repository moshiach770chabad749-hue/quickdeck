// Ready-made button ideas. `ask` = part of the target the user should replace (gets selected).
window.IDEAS = [
  {
    cat: 'אתרים', items: [
      { label: 'KSP', icon: '🖥️', color: '#ef4444', type: 'url', target: 'https://ksp.co.il', d: 'מחשבים ואלקטרוניקה' },
      { label: 'זאפ', icon: '🛒', color: '#3b82f6', type: 'url', target: 'https://www.zap.co.il', d: 'השוואת מחירים' },
      { label: 'Ivory', icon: '💻', color: '#6366f1', type: 'url', target: 'https://www.ivory.co.il', d: 'מחשבים וגיימינג' },
      { label: 'ynet', icon: '📰', color: '#ef4444', type: 'url', target: 'https://www.ynet.co.il', d: 'חדשות' },
      { label: 'כאן 11', icon: '📺', color: '#0ea5e9', type: 'url', target: 'https://www.kan.org.il/live/', d: 'שידור חי' },
      { label: 'Waze', icon: '🚗', color: '#0ea5e9', type: 'url', target: 'https://www.waze.com/live-map', d: 'ניווט ופקקים' },
      { label: 'מפות', icon: '🗺️', color: '#22c55e', type: 'url', target: 'https://maps.google.com', d: 'Google Maps' },
      { label: 'Gmail', icon: '📧', color: '#ea4335', type: 'url', target: 'https://mail.google.com', d: 'דואר' },
      { label: 'Drive', icon: '☁️', color: '#f5a524', type: 'url', target: 'https://drive.google.com', d: 'קבצים בענן' },
      { label: 'תרגום', icon: '🌍', color: '#3b82f6', type: 'url', target: 'https://translate.google.com/?sl=auto&tl=iw', d: 'Google Translate' },
      { label: 'Claude', icon: '✳️', color: '#d97757', type: 'url', target: 'https://claude.ai', d: 'עוזר AI' },
      { label: 'WhatsApp', icon: '💬', color: '#25d366', type: 'url', target: 'https://web.whatsapp.com', d: 'וואטסאפ ווב' },
      { label: 'YouTube', icon: '▶️', color: '#ff0033', type: 'url', target: 'https://www.youtube.com', d: 'וידאו' },
      { label: 'Spotify', icon: '🎧', color: '#1db954', type: 'url', target: 'https://open.spotify.com', d: 'מוזיקה' },
      { label: 'Netflix', icon: '🎬', color: '#b20710', type: 'url', target: 'https://www.netflix.com', d: 'סדרות וסרטים' },
      { label: 'Wolt', icon: '🍔', color: '#00c2e8', type: 'url', target: 'https://wolt.com/he/isr', d: 'משלוחי אוכל' },
      { label: 'AliExpress', icon: '📦', color: '#f97316', type: 'url', target: 'https://he.aliexpress.com', d: 'קניות' },
      { label: 'מזג אוויר', icon: '⛅', color: '#0ea5e9', type: 'url', target: 'https://ims.gov.il/he/Forecasts', d: 'השירות המטאורולוגי' },
      { label: 'gov.il', icon: '🏛️', color: '#1e40af', type: 'url', target: 'https://www.gov.il', d: 'שירותי ממשלה' }
    ]
  },
  {
    cat: 'פקודות מחשב', items: [
      { label: 'כיבוי', icon: '⏻', color: '#ef4444', type: 'command', target: 'shutdown /s /t 0', d: 'כיבוי מיידי' },
      { label: 'הפעלה מחדש', icon: '🔄', color: '#f97316', type: 'command', target: 'shutdown /r /t 0', d: 'ריסטארט' },
      { label: 'כיבוי בעוד שעה', icon: '⏲️', color: '#a855f7', type: 'command', target: 'shutdown /s /t 3600', d: 'טיימר כיבוי' },
      { label: 'ביטול כיבוי', icon: '✋', color: '#64748b', type: 'command', target: 'shutdown /a', d: 'מבטל טיימר כיבוי' },
      { label: 'שינה', icon: '🌙', color: '#6366f1', type: 'command', target: 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0', d: 'מצב שינה' },
      { label: 'נעילה', icon: '🔒', color: '#ef4444', type: 'command', target: 'rundll32.exe user32.dll,LockWorkStation', d: 'נעילת המחשב' },
      { label: 'כיבוי מסך', icon: '🖥️', color: '#1f2937', type: 'command', target: 'powershell -NoProfile -WindowStyle Hidden -Command "(Add-Type \'[DllImport(\\"user32.dll\\")]public static extern int SendMessage(int h,int m,int w,int l);\' -Name M -PassThru)::SendMessage(-1,0x0112,0xF170,2)"', d: 'מכבה רק את המסך' },
      { label: 'ריקון סל מחזור', icon: '🗑️', color: '#78716c', type: 'command', target: 'powershell -NoProfile -WindowStyle Hidden -Command "Clear-RecycleBin -Force"', d: 'בלי לשאול' },
      { label: 'ניקוי דיסק', icon: '🧹', color: '#10b981', type: 'command', target: 'cleanmgr.exe', d: 'פינוי מקום' },
      { label: 'מנהל התקנים', icon: '🔌', color: '#475569', type: 'command', target: 'start devmgmt.msc', d: 'דרייברים וחומרה' },
      { label: 'ניהול דיסקים', icon: '💽', color: '#475569', type: 'command', target: 'start diskmgmt.msc', d: 'כוננים ומחיצות' },
      { label: 'לוח הבקרה', icon: '🎛️', color: '#3b82f6', type: 'command', target: 'control', d: 'לוח בקרה קלאסי' },
      { label: 'שורת פקודה', icon: '⌨️', color: '#1f2937', type: 'app', target: 'cmd.exe', d: 'CMD' },
      { label: 'PowerShell', icon: '🟦', color: '#1e40af', type: 'app', target: 'powershell.exe', d: 'מסוף' },
      { label: 'תיקיית הפעלה', icon: '🚀', color: '#f5a524', type: 'url', target: 'shell:startup', d: 'תוכנות שעולות עם ווינדוס' },
      { label: 'תיקיית Temp', icon: '🧺', color: '#78716c', type: 'command', target: 'explorer.exe %TEMP%', d: 'קבצים זמניים' }
    ]
  },
  {
    cat: 'הגדרות ווינדוס', items: [
      { label: 'Wi-Fi', icon: '📶', color: '#0ea5e9', type: 'url', target: 'ms-settings:network-wifi', d: 'רשתות אלחוטיות' },
      { label: 'Bluetooth', icon: '🔵', color: '#3b82f6', type: 'url', target: 'ms-settings:bluetooth', d: 'אוזניות ומכשירים' },
      { label: 'צג', icon: '🖥️', color: '#6366f1', type: 'url', target: 'ms-settings:display', d: 'רזולוציה ובהירות' },
      { label: 'שמע', icon: '🔊', color: '#a855f7', type: 'url', target: 'ms-settings:sound', d: 'רמקולים ומיקרופון' },
      { label: 'עדכונים', icon: '⬆️', color: '#10b981', type: 'url', target: 'ms-settings:windowsupdate', d: 'Windows Update' },
      { label: 'אפליקציות', icon: '🧩', color: '#64748b', type: 'url', target: 'ms-settings:appsfeatures', d: 'הסרת תוכנות' },
      { label: 'אחסון', icon: '💾', color: '#f5a524', type: 'url', target: 'ms-settings:storagesense', d: 'מקום בכוננים' },
      { label: 'מדפסות', icon: '🖨️', color: '#475569', type: 'url', target: 'ms-settings:printers', d: 'מדפסות וסורקים' },
      { label: 'רקע', icon: '🖼️', color: '#ec4899', type: 'url', target: 'ms-settings:personalization-background', d: 'תמונת רקע' },
      { label: 'סוללה', icon: '🔋', color: '#22c55e', type: 'url', target: 'ms-settings:batterysaver', d: 'חשמל וסוללה' },
      { label: 'מצלמה', icon: '📷', color: '#1f2937', type: 'url', target: 'microsoft.windows.camera:', d: 'אפליקציית מצלמה' },
      { label: 'צילום מסך', icon: '✂️', color: '#ec4899', type: 'url', target: 'ms-screenclip:', d: 'חיתוך מסך' }
    ]
  },
  {
    cat: 'אנשים', items: [
      { label: 'וואטסאפ ל...', icon: '💬', color: '#25d366', type: 'url', target: 'https://wa.me/972500000000', ask: '972500000000', d: 'צ\'אט ישיר לאיש קשר' },
      { label: 'מייל ל...', icon: '📧', color: '#ea4335', type: 'url', target: 'mailto:name@example.com', ask: 'name@example.com', d: 'פותח מייל חדש' },
      { label: 'מייל עם נושא', icon: '✉️', color: '#f97316', type: 'url', target: 'mailto:name@example.com?subject=שלום', ask: 'name@example.com', d: 'מייל עם נושא מוכן' },
      { label: 'שיחה ל...', icon: '📞', color: '#10b981', type: 'url', target: 'tel:+972500000000', ask: '+972500000000', d: 'דרך קישור לטלפון' },
      { label: 'Teams ל...', icon: '👥', color: '#6264a7', type: 'url', target: 'https://teams.microsoft.com/l/chat/0/0?users=name@example.com', ask: 'name@example.com', d: 'צ\'אט ב-Teams' },
      { label: 'זום', icon: '🎥', color: '#2d8cff', type: 'url', target: 'https://zoom.us/j/0000000000', ask: '0000000000', d: 'פגישת זום קבועה' },
      { label: 'Google Meet', icon: '📹', color: '#00897b', type: 'url', target: 'https://meet.google.com/new', d: 'פגישה חדשה' },
      { label: 'פייסבוק של...', icon: '👤', color: '#1877f2', type: 'url', target: 'https://facebook.com/username', ask: 'username', d: 'פרופיל של מישהו' },
      { label: 'אינסטגרם של...', icon: '📸', color: '#e1306c', type: 'url', target: 'https://instagram.com/username', ask: 'username', d: 'פרופיל של מישהו' }
    ]
  }
];
