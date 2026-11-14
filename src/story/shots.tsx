import type {ShotDef} from '../kit/coverage';
import {SHOTS1} from './shots1';
import {SHOTS2} from './shots2';

/* All shots of the long video in order. Parts: shots1 (1–3), shots2 (4–6), shots3 (7–9), shots4 (10–12). */
export const SHOTS: ShotDef[] = [...SHOTS1, ...SHOTS2];
