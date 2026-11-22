# QuickDeck themes (`.qdtheme`)

A QuickDeck theme is one text file ending in `.qdtheme`. Inside is plain JSON, so you can write one by hand or ask ChatGPT (or Claude, Gemini and so on) to write it for you.

**Install a theme:** double-click the `.qdtheme` file, or drag it onto QuickDeck. You can also copy the AI's answer and click **🎨 Themes → 📥 Paste theme**.

## Make one with ChatGPT in 1 minute

1. In QuickDeck, open **🎨 Themes** and click **📋 Copy prompt**.
2. Paste it into ChatGPT, then describe the look you want at the end. For example: *"Dark red lava, keys glowing like embers, slow fire animation in the background"*.
3. Copy ChatGPT's answer and click **📥 Paste theme**. That's it.

If the theme uses its own GIF, image or video (for example `"value": "bg.gif"`), save the answer as `my-theme.qdtheme` in the same folder as `bg.gif` and double-click the file. QuickDeck copies the media in with it.

## What you can control

| Part | Field | Options |
|---|---|---|
| Device housing | `device.body`, `device.border`, `device.glow`, `device.radius`, `device.bezel` | any CSS color or gradient |
| Background | `background.type` | `css`, `svg` (inline, can be animated), `image` (GIF/PNG/JPG/WebP), `video` (MP4/WebM) |
| Background effect | `background.effect` | `none`, `aurora`, `stars`, `grid`, `bubbles`, `scanlines`, `snow`, `fireflies` |
| Key look | `keys.style` | `lcd` (black cap with a screen, like real hardware), `glass`, `neon`, `metal`, `flat` |
| Key colors | `keys.colorMode` | `tile` (each key's own color), `theme` (same for all keys, from `keys.background`), `wallpaper` (one picture spread across all keys) |
| Live key effect | `keys.effect` | `none`, `shine`, `pulse`, `rainbow`, `breathe`, `float`, `flow`, `glitch` |
| Press / hover | `keys.press`, `keys.hover` | `sink`, `glow`, `ripple` / `lift`, `glow`, `none` |
| Empty keys | `keys.empty` | `key`, `dashed`, `hidden` |
| Text | `keys.labelColor`, `keys.labelFont` | CSS color / font-family |
| Anything else | `css` | extra CSS. Selectors: `.panel`, `.deck`, `.tile`, `.tile .screen`, `.tile .ico`, `.tile .lbl`, `#bg`, `#bgFx` |

Every key can also have its own **GIF, image or video**, its own effect, and a hidden name. Right-click a key, or drop a GIF straight onto it in edit mode.

## Example

```json
{
  "qdtheme": 1,
  "name": "Lava",
  "author": "you",
  "description": "Glowing embers",
  "accent": "#ff6a00",
  "device": { "body": "linear-gradient(#2b0d00, #0d0300)", "border": "rgba(255,106,0,.4)", "glow": "#ff6a00", "radius": 24 },
  "background": { "type": "css", "value": "radial-gradient(circle at 50% 120%, #ff3d00, #1a0500 70%)", "effect": "fireflies" },
  "keys": { "style": "neon", "colorMode": "tile", "effect": "pulse", "press": "glow", "hover": "glow", "empty": "dashed" }
}
```

The 7 built-in themes in [`src/themes`](src/themes) are good starting points. The full prompt, which also documents every field, is in [`src/renderer/i18n.js`](src/renderer/i18n.js) under `THEME_PROMPT`.

---

## בעברית

ערכת נושא היא קובץ טקסט אחד עם הסיומת `.qdtheme`, ובתוכו JSON. אפשר לכתוב אותו ביד או לבקש מ-ChatGPT.

1. ב-QuickDeck פותחים **🎨 ערכות נושא** ולוחצים **📋 העתק פרומפט**.
2. מדביקים ב-ChatGPT ומוסיפים בסוף תיאור של העיצוב שרוצים.
3. מעתיקים את התשובה ולוחצים **📥 הדבק ערכה**. או שומרים אותה כקובץ `.qdtheme` ולוחצים עליו פעמיים.

אפשר גם לגרור GIF, תמונה או וידאו ישר על כפתור במצב עריכה, ולבחור רקע משלך לכל הלוח.
