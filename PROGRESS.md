# PROGRESS: chessbox

## Правила работы
- Ничего не озвучивать и не рендерить без явного «да» от пользователя.
- Раскадровок и пробы рендера в этом ролике нет.
- Состояние держать в PROGRESS.md.
- Ничего не помечать «декорацией», чтобы пройти check-edges.

## Состояние
- Проект создан копией шаблона Boxer-streak (package.json, lock, tools/, render.yml, Root.tsx, render.json, .gitignore, CLOUD-NOTES.md, cast.ts, common.tsx).
- `npm ci`, `chmod +x` на ffmpeg/ffprobe Remotion, `npm run check` (чисто), пробный кадр `remotion still Long --frame=30` сделан.

### Перенесено из github.com/inposteramongus12-crypto/ufc (только общий код)
- `src/engine/`, `src/kit/` (в т.ч. edgeprobe.tsx, whip.ts), `src/reference/PauseTime.tsx`, `src/Sheet.tsx`, `src/index.ts`, `public/fonts/` (Rubik, Caveat).
- `tools/check-edges.mjs` (версия с проверками under и panel-over-actor), `tools/storyboard-range.mjs`.
- SafeBox + useSafeShift + SAFE вынесены из ufc `places.tsx` в `src/kit/safebox.tsx`. Помощники камеры (camOn, mixCam, usePush, Stage) и плашка AgeBadge лежат в `kit/`.
- Не перенесено: script.md, lines.json, public/vo, timeline.json, sound.json, auto-cues.json, shots*.tsx, places*.tsx, config.ts ufc, cast.ts ufc, shortV, short-pick, hook, props.tsx (планшет Ирмы), Cast.tsx, gaps.json, edge-scan.py, verify-chunks.mjs.

### Заглушки (заменить вместе со сценарием)
`src/Long.tsx`, `src/Short.tsx`, `src/stub.tsx`, `src/story/{places.tsx,shots.tsx,short.ts,config.ts,timeline.json,short-timeline.json}`.
- check-edges на кадрах 0, 30, 60 заглушки: 0 замечаний. Контроль: навесил тёмную панель на героя, нашёл `panel-over-actor hero`. Правку откатил.
- check-edges для `--comp Short` не проверен: нужны short-pick.json и настоящий Short.

### ElevenLabs (`--plan`, пустой текст, 7 ключей)
| ключ | осталось из 10 000 |
|---|---|
| 1 | 2 |
| 2 | 1 |
| 3 | 1 |
| 4 | 2 |
| 5 | 1 |
| 6 | 45 |
| 7 | 10000 |
Итого 10 052. Озвучку не запускали. Реплика целиком идёт на один ключ, сначала ключи с большим остатком; учёт в `public/vo/.eleven-ledger.json`. Для EN (flash, 0.5 кредита за знак) та же логика и тот же журнал.
