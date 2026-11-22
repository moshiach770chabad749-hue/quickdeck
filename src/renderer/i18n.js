// UI text. English is the default; Hebrew can be picked in Settings.
window.I18N = {
  en: {
    dir: 'ltr',
    searchPh: 'Type an app, folder or website…',
    editModeTitle: 'Edit mode (Ctrl+E)', settingsTitle: 'Settings', themesTitle: 'Themes',
    fRun: 'Run', fNav: 'Navigate', fPage: 'Switch page', fRight: 'Right-click', fEditKey: 'Edit key', fEsc: 'Close',
    editBanner: 'Edit mode · Click a key to edit · Drag to move · Drop a file, GIF or video on a key',
    editKey: 'Edit key', newKey: 'New key', ideasBtn: '💡 Ready-made ideas',
    name: 'Name', actionType: 'Action', tApp: 'App / file', tFolder: 'Folder', tUrl: 'Website', tCommand: 'Command',
    tgApp: 'Path to an app or file', tgFolder: 'Path to a folder', tgUrl: 'Website address', tgCommand: 'Command to run',
    browse: 'Browse…', page: 'Page', current: '(current)',
    iconField: 'Icon (pick one or type any emoji)', fileIcon: "File's icon", noIcon: 'No icon',
    color: 'Color', mediaField: 'Live key background (GIF, image or video)', pickFile: 'Choose file…',
    mediaCover: 'Full background', mediaIcon: 'As icon', remove: 'Remove', mediaNone: 'None yet',
    effect: 'Live effect', fxTheme: 'Theme default', fxNone: 'None', fxShine: 'Shine', fxPulse: 'Pulse', fxRainbow: 'Rainbow',
    fxBreathe: 'Breathe', fxFloat: 'Float', fxFlow: 'Flow', fxGlitch: 'Glitch',
    aiGifBtn: '🤖 Make with ChatGPT', aiTitle: '🤖 Make a live GIF with ChatGPT',
    aiIntro: 'Describe the animation you want. QuickDeck writes a detailed prompt, and ChatGPT draws the GIF with code and gives you a download link.',
    aiWhat: 'What should the key show?', aiWhatPh: 'e.g. a lightning bolt striking with blue sparks', aiStyle: 'Style',
    aiUseColor: 'Use this key\'s color ({c})',
    aiStep1: 'Click "Copy and open ChatGPT", then paste (Ctrl+V) and send.',
    aiStep2: 'Download the file it makes (key.webp is the sharpest).',
    aiStep3: 'Come back and click "Choose file…", or drag the file onto the key.',
    aiCopyOnly: 'Copy only', aiCopyOpen: '📋 Copy and open ChatGPT', aiCopied: 'Prompt copied. Paste it into ChatGPT with Ctrl+V', aiNeedWhat: 'Write what the key should show',
    ringField: 'Frame around the key', ringNone: 'No frame', ringColor: 'Color', ringRgb: '🌈 RGB', ringGlow: 'Glow',
    ringAll: 'Use this frame on every key on this page', ringAllDone: 'Frame set on {n} keys',
    hideLabel: 'Hide the name on the key', del: 'Delete', cancel: 'Cancel', save: 'Save', close: 'Close', untitled: 'Untitled',
    settings: 'Settings', hotkey: 'Shortcut to open', hotkeyPh: 'Click here, then press the keys',
    cols: 'Columns', rows: 'Rows', accent: 'Accent color', language: 'Language',
    login: 'Start with Windows', refreshApps: 'Refresh app list', resetAll: 'Reset to defaults',
    ideasTitle: '💡 Ready-made ideas', ideasHint: 'Click an idea to fill in the key', back: 'Back',
    confirmDelete: 'Confirm delete', themes: '🎨 Themes', themesHint: 'Click a theme to apply it',
    customBg: 'Your own background (image, GIF or video). It replaces the theme background.',
    makeTitle: 'Make your own theme with ChatGPT',
    makeText: 'Copy the prompt, paste it into ChatGPT and describe the look you want. Then copy its answer and click "Paste theme", or save it as a .qdtheme file and double-click it.',
    copyPrompt: '📋 Copy prompt', pasteTheme: '📥 Paste theme', importFile: 'Import file…', themesFolder: 'Themes folder', exportTheme: 'Export current',
    newPage: '+ New page', pageN: 'Page {n}', deletePageTitle: 'Delete page',
    kOpen: 'Open', kOpenPath: 'Open path', kSite: 'Website', kOpenBrowser: 'Open in browser', kKey: 'Key', kApp: 'App', kSearch: 'Search',
    searchGoogle: 'Search "{q}" on Google', pin: '📌 Add to deck',
    noSpace: 'No free spot on this page', movedTo: 'Moved to "{p}"', added: 'Added: {n}', error: 'Error: {e}',
    pageFull: 'This page is full. Switch page or add a new one', pageFullShort: 'The page is full', addedTo: '"{n}" added to "{p}"',
    deleted: 'Key deleted', saved: 'Settings saved', needTarget: 'Fill in a path or address', typeDetails: 'Type your details over the highlighted text',
    pageFullNamed: 'Page "{p}" is full', keyMoved: 'Key moved to "{p}"',
    askDeletePage: 'Delete page "{p}" and all its keys?', askDeleteKey: 'Delete the key "{n}"?',
    askReset: 'Reset all keys, pages and settings to defaults? This cannot be undone.', resetTitle: 'Reset', resetBtn: 'Reset',
    needMod: 'Use at least one of Ctrl / Alt / Shift / Win', claudeKey: 'That shortcut belongs to Claude, pick another one',
    hotkeyTaken: 'Another app uses that shortcut, try a different one', appsFound: 'Found {n} apps',
    themeApplied: 'Theme: {n}', themeImported: 'Theme imported: {n}', themeError: "Couldn't read the theme: {e}",
    promptCopied: 'Prompt copied. Paste it into ChatGPT', themeDeleted: 'Theme deleted', askDeleteTheme: 'Delete the theme "{n}"?',
    bgSet: 'Background set', bgCleared: 'Background removed', mediaSet: 'Live background added to the key', exported: 'Theme saved',
    mine: 'Mine', builtin: 'Built-in',
    defMain: 'Main', defWork: 'Work'
  },
  he: {
    dir: 'rtl',
    searchPh: 'הקלד שם תוכנה, תיקייה או אתר…',
    editModeTitle: 'מצב עריכה (Ctrl+E)', settingsTitle: 'הגדרות', themesTitle: 'ערכות נושא',
    fRun: 'הפעלה', fNav: 'ניווט', fPage: 'מעבר דף', fRight: 'קליק ימני', fEditKey: 'עריכת כפתור', fEsc: 'סגירה',
    editBanner: 'מצב עריכה · לחץ על כפתור לעריכה · גרור להזזה · גרור קובץ, GIF או וידאו לכפתור',
    editKey: 'עריכת כפתור', newKey: 'כפתור חדש', ideasBtn: '💡 רעיונות מוכנים',
    name: 'שם', actionType: 'סוג פעולה', tApp: 'תוכנה / קובץ', tFolder: 'תיקייה', tUrl: 'אתר', tCommand: 'פקודה',
    tgApp: 'נתיב לתוכנה או קובץ', tgFolder: 'נתיב לתיקייה', tgUrl: 'כתובת אתר', tgCommand: 'פקודה להרצה',
    browse: 'עיון…', page: 'דף', current: '(נוכחי)',
    iconField: "אייקון (בחר מהרשימה או הקלד אימוג'י)", fileIcon: 'אייקון של הקובץ', noIcon: 'ללא אייקון',
    color: 'צבע', mediaField: 'רקע חי לכפתור (GIF, תמונה או וידאו)', pickFile: 'בחר קובץ…',
    mediaCover: 'רקע מלא', mediaIcon: 'כאייקון', remove: 'הסר', mediaNone: 'עדיין אין',
    effect: 'אפקט חי', fxTheme: 'לפי הערכה', fxNone: 'ללא', fxShine: 'ברק', fxPulse: 'פעימה', fxRainbow: 'קשת',
    fxBreathe: 'נשימה', fxFloat: 'ריחוף', fxFlow: 'זרימה', fxGlitch: "גליץ'",
    aiGifBtn: '🤖 צור עם ChatGPT', aiTitle: '🤖 יצירת GIF חי עם ChatGPT',
    aiIntro: 'מתארים איזו אנימציה רוצים. QuickDeck כותב פרומפט מפורט, ו-ChatGPT מצייר את ה-GIF בקוד ונותן קישור להורדה.',
    aiWhat: 'מה הכפתור יראה?', aiWhatPh: 'למשל: ברק שמכה עם ניצוצות כחולים', aiStyle: 'סגנון',
    aiUseColor: 'השתמש בצבע של הכפתור ({c})',
    aiStep1: 'לוחצים "העתק ופתח את ChatGPT", מדביקים (Ctrl+V) ושולחים.',
    aiStep2: 'מורידים את הקובץ שהוא יוצר (key.webp הכי חד).',
    aiStep3: 'חוזרים ולוחצים "בחר קובץ…", או גוררים את הקובץ על הכפתור.',
    aiCopyOnly: 'העתק בלבד', aiCopyOpen: '📋 העתק ופתח את ChatGPT', aiCopied: 'הפרומפט הועתק. הדביקו ב-ChatGPT עם Ctrl+V', aiNeedWhat: 'כתבו מה הכפתור יראה',
    ringField: 'מסגרת מסביב לכפתור', ringNone: 'בלי מסגרת', ringColor: 'צבע', ringRgb: '🌈 RGB', ringGlow: 'זוהר',
    ringAll: 'החל את המסגרת על כל הכפתורים בדף', ringAllDone: 'המסגרת הוגדרה ל-{n} כפתורים',
    hideLabel: 'הסתר את השם על הכפתור', del: 'מחק', cancel: 'ביטול', save: 'שמור', close: 'סגור', untitled: 'ללא שם',
    settings: 'הגדרות', hotkey: 'קיצור מקשים לפתיחה', hotkeyPh: 'לחץ כאן ואז על צירוף המקשים',
    cols: 'עמודות', rows: 'שורות', accent: 'צבע ראשי', language: 'שפה',
    login: 'הפעל אוטומטית עם עליית ווינדוס', refreshApps: 'רענן רשימת תוכנות', resetAll: 'איפוס לברירת מחדל',
    ideasTitle: '💡 רעיונות מוכנים', ideasHint: 'לחץ על רעיון כדי למלא את הכפתור', back: 'חזרה',
    confirmDelete: 'אישור מחיקה', themes: '🎨 ערכות נושא', themesHint: 'לחיצה על ערכה מחליפה אותה מיד',
    customBg: 'רקע משלך (תמונה, GIF או וידאו). הוא מחליף את רקע הערכה.',
    makeTitle: 'צור ערכה משלך עם ChatGPT',
    makeText: 'מעתיקים את הפרומפט, מדביקים ב-ChatGPT ומתארים איזה עיצוב רוצים. אחר כך מעתיקים את התשובה ולוחצים "הדבק ערכה", או שומרים אותה כקובץ ‎.qdtheme ופותחים בלחיצה כפולה.',
    copyPrompt: '📋 העתק פרומפט', pasteTheme: '📥 הדבק ערכה', importFile: 'ייבוא קובץ…', themesFolder: 'תיקיית ערכות', exportTheme: 'ייצוא הנוכחית',
    newPage: '+ דף חדש', pageN: 'דף {n}', deletePageTitle: 'מחק דף',
    kOpen: 'פתח', kOpenPath: 'פתח נתיב', kSite: 'אתר', kOpenBrowser: 'פתח בדפדפן', kKey: 'כפתור', kApp: 'תוכנה', kSearch: 'חיפוש',
    searchGoogle: 'חפש "{q}" בגוגל', pin: '📌 הוסף ללוח',
    noSpace: 'אין מקום פנוי בדף הזה', movedTo: 'הועבר לדף "{p}"', added: 'נוסף: {n}', error: 'שגיאה: {e}',
    pageFull: 'הדף מלא. עבור לדף אחר או הוסף דף', pageFullShort: 'הדף מלא', addedTo: '"{n}" נוסף לדף "{p}"',
    deleted: 'הכפתור נמחק', saved: 'ההגדרות נשמרו', needTarget: 'צריך למלא נתיב / כתובת', typeDetails: 'הקלד את הפרטים במקום הטקסט המסומן',
    pageFullNamed: 'הדף "{p}" מלא', keyMoved: 'הכפתור עבר לדף "{p}"',
    askDeletePage: 'למחוק את הדף "{p}" וכל הכפתורים שבו?', askDeleteKey: 'למחוק את הכפתור "{n}"?',
    askReset: 'לאפס את כל הכפתורים, הדפים וההגדרות לברירת המחדל? אי אפשר לבטל את זה.', resetTitle: 'איפוס', resetBtn: 'אפס',
    needMod: 'צריך לפחות מקש אחד מ-Ctrl / Alt / Shift / Win', claudeKey: 'הצירוף הזה שמור ל-Claude, בחר צירוף אחר',
    hotkeyTaken: 'הקיצור תפוס ע"י תוכנה אחרת, נסה צירוף אחר', appsFound: 'נמצאו {n} תוכנות',
    themeApplied: 'ערכה: {n}', themeImported: 'הערכה יובאה: {n}', themeError: 'לא הצלחתי לקרוא את הערכה: {e}',
    promptCopied: 'הפרומפט הועתק. הדבק אותו ב-ChatGPT', themeDeleted: 'הערכה נמחקה', askDeleteTheme: 'למחוק את הערכה "{n}"?',
    bgSet: 'הרקע הוגדר', bgCleared: 'הרקע הוסר', mediaSet: 'רקע חי נוסף לכפתור', exported: 'הערכה נשמרה',
    mine: 'שלי', builtin: 'מובנית',
    defMain: 'ראשי', defWork: 'עבודה'
  }
};

// Quick ideas and styles for the "Make a GIF with ChatGPT" window. Text is [English, Hebrew].
window.GIF_IDEAS = [
  ['⚡', 'A lightning bolt striking down with electric sparks and a blue-white glow', 'ברק שמכה למטה עם ניצוצות חשמל וזוהר כחול-לבן'],
  ['🔥', 'Dancing fire flames with embers floating up', 'להבות אש מרקדות עם גחלים שעולות למעלה'],
  ['🎵', 'A music equalizer with bars jumping to the beat in RGB colors', 'אקולייזר מוזיקה עם פסים שקופצים לקצב בצבעי RGB'],
  ['🔴', 'A red recording dot blinking with expanding rings', 'נקודת הקלטה אדומה שמהבהבת עם טבעות שמתרחבות'],
  ['🌀', 'A swirling glowing portal', 'פורטל זוהר שמסתובב'],
  ['🎮', 'A game controller with pulsing neon buttons', 'שלט משחק עם כפתורי ניאון שפועמים'],
  ['💬', 'A chat bubble that bounces with little sparkles', 'בועת צ\'אט שקופצת עם נצנוצים קטנים'],
  ['🌧️', 'Rain falling on a window with soft city lights behind', 'גשם שיורד על חלון עם אורות עיר רכים מאחור'],
  ['❤️', 'A beating heart with a soft pulse glow', 'לב פועם עם הילה רכה'],
  ['🌌', 'A slowly rotating galaxy with twinkling stars', 'גלקסיה שמסתובבת לאט עם כוכבים מנצנצים']
];
window.GIF_STYLES = [
  ['neon glow, dark background, vivid colors', 'Neon', 'ניאון'],
  ['realistic, cinematic lighting', 'Realistic', 'מציאותי'],
  ['cute cartoon, bold outlines', 'Cartoon', 'מצויר'],
  ['retro pixel art, crisp pixels', 'Pixel art', 'פיקסל ארט'],
  ['clean minimal flat design, smooth motion', 'Minimal', 'מינימליסטי'],
  ['shiny 3D, soft shadows', '3D', 'תלת-ממד']
];
// Prompt for an animated key GIF. {WHAT} {STYLE} {COLOR} are filled in by the app.
window.GIF_PROMPT = `You are an animation designer. Create an animated key icon for QuickDeck, a Windows launcher that looks like a physical stream deck with LCD keys.

WHAT I WANT:
{WHAT}

STYLE: {STYLE}{COLOR}

Technical requirements:
- Build it yourself with Python (Pillow + numpy) in your code tool. Draw every frame with code; don't use a still image.
- Size: 256x256 square. Draw at 512x512 and scale down for smooth edges.
- Perfect seamless loop: 30-40 frames, ~60 ms per frame. Drive all motion with t = frame / total_frames and periodic functions (sin/cos), so the last frame flows into the first with no jump.
- Make it feel alive: glow (layers blurred with GaussianBlur and added on top), light flicker, particles or sparks, slight pulse where it fits.
- Background that fills the whole square (dark unless the style says otherwise), so it looks good on a key. Keep the bottom 20% a little calmer, because the key's name may appear there.
- No text in the image unless I ask for it.
- Save 2 files:
  1. key.gif: loop=0, disposal=2, optimize=True, adaptive 256-color palette, under 2 MB.
  2. key.webp: animated WebP, same frames, quality 90 (sharper colors).
- Give me download links to both files and show a preview of one frame.
- If you can't run code, give me the full Python script and how to run it.

Then ask if I want changes (speed, colors, more effects).`;

// Prompt the user pastes into ChatGPT (or any AI) to get a theme file back.
window.THEME_PROMPT = `You are a theme designer for QuickDeck, a Windows launcher that looks like a physical stream deck (a device with a grid of LCD keys).
Create a theme file in QuickDeck's .qdtheme format. Reply with ONE json code block and nothing else.

Rules:
- Valid JSON only: double quotes, no comments, no trailing commas.
- Every color/background value is plain CSS (hex, rgba(), linear-gradient(), radial-gradient(), conic-gradient()).
- For an animated/live picture use "background.type": "svg" and put a full inline SVG string in "value". Use single quotes for SVG attributes so the JSON stays valid. Animate with <animate>, <animateTransform> or a <style> with @keyframes inside the SVG. No <script>, no external links inside the SVG.
- "background.type": "image" or "video" may point to an https:// URL, or to a file name (e.g. "bg.gif") that the user will place next to the .qdtheme file.
- Keep text readable: labelColor must contrast with the key background.

Format (all fields except "name" are optional):
{
  "qdtheme": 1,
  "name": "Theme name",
  "nameHe": "optional Hebrew name",
  "author": "your name",
  "description": "one short line",
  "accent": "#hex                       (buttons, highlights)",
  "device": {
    "body": "CSS background of the device housing",
    "border": "CSS color of the housing edge",
    "glow": "CSS color of the LED underglow around the device",
    "radius": 26,
    "bezel": "CSS background of the recessed area around the keys, e.g. rgba(0,0,0,.45)"
  },
  "background": {
    "type": "css | svg | image | video",
    "value": "CSS background, inline <svg ...>, or URL / file name",
    "fit": "cover | contain | repeat",
    "opacity": 1,
    "blur": 0,
    "overlay": "optional CSS color drawn over the background, e.g. rgba(0,0,0,.3)",
    "effect": "none | aurora | stars | grid | bubbles | scanlines | snow | fireflies"
  },
  "keys": {
    "style": "lcd | glass | neon | metal | flat",
    "radius": 14,
    "gap": 12,
    "colorMode": "tile | theme | wallpaper",
    "background": "CSS background for every key (used when colorMode is theme)",
    "tint": 20,
    "border": "CSS color of the key edge",
    "labelColor": "#ffffff",
    "labelFont": "CSS font-family",
    "effect": "none | shine | pulse | breathe | float | flow | glitch",
    "ring": "none | rainbow | #hex      (frame around every key: moving RGB or one color)",
    "ringGlow": true,
    "press": "sink | glow | ripple",
    "hover": "lift | glow | none",
    "empty": "key | dashed | hidden"
  },
  "css": "optional extra CSS for advanced looks"
}

Meaning:
- style lcd = black plastic key cap with a glowing screen inside (most like a real stream deck). glass = frosted transparent keys. neon = dark keys with a glowing outline. metal = brushed metal caps. flat = simple colored squares.
- colorMode tile = each key keeps the color the user picked. theme = every key uses keys.background. wallpaper = the background picture is spread across all keys like one big screen (tint = how much of each key's own color is mixed in, 0-100).
- effect = an animation that runs on every key. background.effect = an animation layer over the device background.
- In "css" you may style: .panel (device), .deck (key area), .tile (key cap), .tile .screen (key screen), .tile .ico (icon), .tile .lbl (label), #bg (background layer), #bgFx (effect layer). Use @keyframes for extra motion.

Design the theme I describe here: `;
