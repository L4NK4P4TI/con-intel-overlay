# Chrome Web Store listing copy

Paste these fields into https://chrome.google.com/webstore/devconsole

This extension is **unofficial** and must stay that way in the listing. Do not use Conflict of Nations, Bytro, or Dorado logos.

## Item ID / package

Upload `dist/con-intel-overlay-1.3.1.zip` after running `.\store\pack.ps1`.

## Product name (max 45 characters)

```
CoN Intel Overlay
```

## Summary (max 132 characters)

```
Unofficial Conflict of Nations overlay. Draw intel on the map — marks stay put when you pan, zoom, or share a file with your team.
```

## Category

Fun

## Language

English

## Detailed description

```
CoN Intel Overlay is an unofficial fan-made tool for Conflict of Nations. It is not affiliated with, endorsed by, or associated with Bytro Labs or Dorado Games.

Mark enemies, headings, and notes directly on the live map. Your strokes are locked to the terrain, so they stay in place when you pan or zoom. The game keeps full control of the mouse unless you hold Alt.

HOW TO USE
1. Install the extension and open a match on conflictnations.com
2. Refresh the tab once so the overlay can attach
3. Pick Pen, Arrow, Marker, Text, Range, or Eraser
4. Hold Alt and drag or click to mark — release Alt to play as usual
5. Export a JSON file to share with teammates; they Import it in the same match

TOOLS
• Pen — freehand strokes
• Arrow — heading with Word-style Heads and Line dropdowns, route waypoints, and solid/dash/dot/dash-dot lines
• Marker — pin a point, or stamp a short CoN icon set (flag, strike, armor, air, navy, city, threat, star, recon)
• Text — multiline notes on the map (Enter for a new line, Ctrl+Enter or Save to place). Alt-click an existing note to edit it; drag to move
• Range — Reach (combat + radar/sight hub stays inside combat) or Radar+Sight; type km in C/R/S fields or Alt-click a label; drag rings to resize; one R and one S label; combat also shows C at the center when in view
• Measure — Alt-drag two points to read distance in km. Drag the ends or the line to edit. Route mode clicks waypoints and sums the path
• Eraser — Alt-click a mark to delete it
• Color palette — switch colors in one click, or Custom (dropper) for any color. Alt-click a mark, then a color to recolor it
• Export / Import — send sketches as a file; import merges and skips duplicates

WORKS ON
Modern desktop client and the older HTML5 client.

PRIVACY
Sketches stay on your computer. Nothing is uploaded to a server. Export only creates a file you choose to send.
```

## Privacy practices (dashboard)

**Single purpose**

```
Let Conflict of Nations players draw geo-locked intel marks on the match map and share those sketches with teammates.
```

**Permission: storage**

```
Stores the player's intel strokes (coordinates, color, width, optional labels) locally so they reload in the same match.
```

**Host permission: conflictnations.com**

```
Required to inject a transparent drawing overlay into the Conflict of Nations game client. The extension does not run on other sites.
```

**Remote code**

Select: No, I am not using remote code.

**Data use**

- Does not collect personally identifiable information
- Does not collect user activity / website content beyond the sketches the user draws
- Check that you do not sell personal data
- Check limited use / only to provide the listed features
- Certify that you are not using the data for unrelated purposes

**Privacy policy URL**

Host `store/privacy.html` on a public HTTPS URL (GitHub Pages is fine), then paste that URL here. Chrome will reject the listing without a reachable policy.

## Images to upload

From the `store/` folder:

| Asset | File | Notes |
| --- | --- | --- |
| Store icon | `../icons/icon128.png` | Also inside the zip |
| Small promo (required) | `promo-440x280.png` | Original art, no game assets |
| Marquee (optional) | `promo-1400x560.png` | Original art |
| Screenshot 1 | `screenshot-overlay-1280x800.png` | Placeholder mock |
| Screenshot 2 | `screenshot-toolbar-1280x800.png` | Placeholder mock |

Replace the two screenshots with real 1280×800 captures from your match before submit if you can. Chrome prefers actual product shots. Do not paste official CoN / Bytro marketing art.

## Visibility

Start with **Unlisted** if you only want teammates with the link. Switch to **Public** when you want store search.

## Account

Chrome Web Store developer signup is a one-time $5 fee. 2-step verification is required.
