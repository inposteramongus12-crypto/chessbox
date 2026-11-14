import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {Pose, rigPoints} from '../engine/Stickman';
import {Cam} from '../engine/camera';
import {idle, reach, SIT} from '../kit/actions';
import {L, LINES, useShot} from '../kit/core';
import {LEAD} from '../kit/coverage';
import {camOn, clamp, ease, mixCam} from '../kit/kit';
import {SafeBox} from '../kit/safebox';
import {FONT} from '../kit/ui';

/* Shared pieces of «30 дней обмена»: timing helpers, plates, clouds, the chess board seen from above, clocks. */

export const FL = 900;
export const NAVY = '#11142c';
export const CREAM = '#fbf8ef';
export const GOLD = '#ffc94a';

/* ---------------------------------------------------------------- timing */
export const useT = () => {
	const s = useShot();
	const gf = s.gf;
	return {
		...s,
		t: (n: string) => gf - L(n).from, // frames since line n started
		e: (n: string) => gf - (L(n).from + L(n).dur), // frames since line n ended
		d: (n: string) => L(n).dur,
		id: lineAt(gf),
	};
};
/* id prefix of the line whose shot owns this frame (a shot starts LEAD frames before its line) */
export const lineAt = (gf: number) => {
	let cur = LINES[0];
	for (const l of LINES) {
		if (l.from - LEAD > gf) break;
		cur = l;
	}
	return cur.id.slice(0, 3);
};
export const k01 = (f: number, a: number, len = 10) => interpolate(f, [a, a + len], [0, 1], {...clamp, easing: ease});
export const seg = (f: number, a: number, b: number) => f >= a && f < b;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/* camera of one line: slow push from a to b over the shot */
export const usePushK = (a: Cam, b: Cam) => {
	const {f, dur} = useShot();
	return mixCam(a, b, interpolate(f, [0, dur], [0, 1], {...clamp, easing: ease}));
};
/* per-line camera table with a fallback cycle (wide / left / right), so every line is a new framing */
export type CamPair = [Cam, Cam];
export const C = (x: number, y: number, z: number, x2?: number, y2?: number, z2?: number): CamPair => [camOn(x, y, z), camOn(x2 ?? x, y2 ?? y, z2 ?? z * 1.08)];
export const useLineCam = (table: Record<string, CamPair>, cycle: CamPair[]) => {
	const {id} = useT();
	const idx = LINES.findIndex((l) => l.id.startsWith(id));
	const pair = table[id] ?? cycle[idx % cycle.length];
	return usePushK(pair[0], pair[1]);
};

/* ---------------------------------------------------------------- text */
export const tw = (s: string, size: number) => s.length * size * 0.66; // generous width of bold Rubik caps

/* dark plate with one or several lines (world or HUD space). (x, y) = centre. */
export const Plate: React.FC<{x: number; y: number; lines: string[]; size?: number; c?: string; k?: number; fill?: string; ink?: string; pad?: number; safe?: boolean; sub?: string}> = ({
	x,
	y,
	lines,
	size = 48,
	c = GOLD,
	k = 1,
	fill = NAVY,
	ink = '#fff',
	pad = 30,
	safe = true,
	sub,
}) => {
	if (k <= 0.01) return null;
	const all = sub ? [...lines, sub] : lines;
	const w = Math.max(...lines.map((l) => tw(l, size)), sub ? tw(sub, size * 0.7) : 0) + pad * 2;
	const lh = size * 1.22;
	const h = lines.length * lh + (sub ? size * 0.95 : 0) + pad * 1.2;
	const body = (
		<g transform={`translate(${x},${y}) scale(${0.6 + 0.4 * k})`} opacity={Math.min(1, k * 1.6)}>
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill={fill} stroke={c} strokeWidth={5} />
			{all.map((l, i) => {
				const isSub = !!sub && i === all.length - 1;
				return (
					<text key={i} x={0} y={-h / 2 + pad * 0.6 + lh * (i + 0.76) - (isSub ? size * 0.1 : 0)} textAnchor="middle" fontSize={isSub ? size * 0.7 : size} fontFamily={FONT} fontWeight={800} fill={isSub ? c : ink}>
						{l}
					</text>
				);
			})}
		</g>
	);
	return safe ? (
		<SafeBox x={x} y={y} left={w / 2 + 6} right={w / 2 + 6} top={h / 2 + 6} bottom={h / 2 + 6}>
			{body}
		</SafeBox>
	) : (
		body
	);
};

/* speech cloud of a silent character or a voice message. (x, y) = centre, tail = point (relative) it points at. */
export const Cloud: React.FC<{x: number; y: number; lines: string[]; t: number; hold?: number; size?: number; tail?: [number, number]; fill?: string; ink?: string; stroke?: string; label?: string}> = ({
	x,
	y,
	lines,
	t,
	hold,
	size = 44,
	tail,
	fill = CREAM,
	ink = '#1b1e2a',
	stroke = '#1b1e2a',
	label,
}) => {
	const {fps} = useVideoConfig();
	if (t < 0 || (hold !== undefined && t > hold + 8)) return null;
	const k = spring({frame: t, fps, config: {damping: 11, stiffness: 170}});
	const o = hold !== undefined ? interpolate(t, [hold, hold + 8], [1, 0], clamp) : 1;
	const lh = size * 1.2;
	const w = Math.max(...lines.map((l) => tw(l, size)), label ? tw(label, size * 0.62) : 0) + 56;
	const h = lines.length * lh + 40 + (label ? size * 0.8 : 0);
	const top = -h / 2 + 20 + (label ? size * 0.8 : 0);
	return (
		<SafeBox x={x} y={y} left={w / 2 + 8} right={w / 2 + 8} top={h / 2 + 8} bottom={h / 2 + 8}>
			<g transform={`translate(${x},${y}) scale(${k})`} opacity={Math.min(1, k * 1.5) * o}>
				{tail ? <path d={`M-22,${h / 2 - 6} L${tail[0]},${tail[1]} L22,${h / 2 - 6} Z`} fill={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" /> : null}
				<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill={fill} stroke={stroke} strokeWidth={5} />
				{tail ? <path d={`M-18,${h / 2 - 8} L${tail[0] * 0.8},${tail[1] * 0.8 + 2} L18,${h / 2 - 8} Z`} fill={fill} /> : null}
				{label ? (
					<text x={0} y={-h / 2 + 14 + size * 0.62} textAnchor="middle" fontSize={size * 0.62} fontFamily={FONT} fontWeight={800} fill={stroke} opacity={0.85}>
						{label}
					</text>
				) : null}
				{lines.map((l, i) => (
					<text key={i} x={0} y={top + lh * (i + 0.78)} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={800} fill={ink}>
						{l}
					</text>
				))}
			</g>
		</SafeBox>
	);
};

/* screen-space overlay (HUD): day plate, round plate, clocks. Not moved by the scene camera. */
export const Hud: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
			{children}
		</svg>
	</AbsoluteFill>
);
/* «ДЕНЬ 7» in the top-left corner (HUD). `since` = frames since it appeared (pop). */
export const DayPlate: React.FC<{day: number; since?: number; label?: string}> = ({day, since = 99, label = 'ДЕНЬ'}) => {
	const pop = 1 + 0.25 * Math.exp(-Math.max(0, since) / 5);
	const txt = String(day);
	const w = 60 + tw(label, 44) + 22 + txt.length * 44;
	return (
		<g transform={`translate(${84 + w / 2},${118}) scale(${pop})`}>
			<rect x={-w / 2} y={-44} width={w} height={88} rx={44} fill={NAVY} stroke={GOLD} strokeWidth={5} />
			<text x={-w / 2 + 32} y={15} fontSize={44} fontFamily={FONT} fontWeight={800} fill="#ffe9ad" letterSpacing={2}>
				{label}
			</text>
			<text x={w / 2 - 30} y={21} textAnchor="end" fontSize={62} fontFamily={FONT} fontWeight={900} fill="#fff">
				{txt}
			</text>
		</g>
	);
};
/* HUD line in the top-left: «РАУНД 3 · ШАХМАТЫ» */
export const RoundPlate: React.FC<{n: number; kind: 'ШАХМАТЫ' | 'БОКС' | 'ПЕРЕРЫВ'; since?: number}> = ({n, kind, since = 99}) => {
	const pop = 1 + 0.22 * Math.exp(-Math.max(0, since) / 5);
	const a = `РАУНД ${n}`;
	const w = 64 + tw(a, 44) + 26 + tw(kind, 40);
	const c = kind === 'БОКС' ? '#ff7a5c' : kind === 'ПЕРЕРЫВ' ? '#9fb0d8' : GOLD;
	return (
		<g transform={`translate(${84 + w / 2},${118}) scale(${pop})`}>
			<rect x={-w / 2} y={-44} width={w} height={88} rx={44} fill={NAVY} stroke={c} strokeWidth={5} />
			<text x={-w / 2 + 32} y={16} fontSize={44} fontFamily={FONT} fontWeight={900} fill="#fff">
				{a}
			</text>
			<text x={w / 2 - 32} y={15} textAnchor="end" fontSize={40} fontFamily={FONT} fontWeight={800} fill={c}>
				{kind}
			</text>
		</g>
	);
};
export const mmss = (sec: number) => `${Math.floor(Math.max(0, sec) / 60)}:${String(Math.floor(Math.max(0, sec) % 60)).padStart(2, '0')}`;
/* two chess clocks: Lev (white) left, Zakhar (black) right. Values in seconds. (x, y) = centre. HUD or world. */
export const Clocks: React.FC<{x: number; y: number; lev: number; zak: number; run?: 'lev' | 'zak' | null; s?: number; flagL?: boolean; flagZ?: boolean; labels?: boolean}> = ({x, y, lev, zak, run = null, s = 1, flagL, flagZ, labels = true}) => {
	const face = (dx: number, v: number, name: string, on: boolean, flag?: boolean, c = '#fff') => (
		<g transform={`translate(${dx},0)`}>
			<rect x={-118} y={-52} width={236} height={104} rx={16} fill={on ? '#23305e' : '#1b1e2a'} stroke={on ? GOLD : '#59607e'} strokeWidth={4} />
			<text x={0} y={24} textAnchor="middle" fontSize={76} fontFamily={FONT} fontWeight={900} fill={v <= 40 ? '#ff6a5a' : c}>
				{mmss(v)}
			</text>
			{labels ? (
				<text x={0} y={-66} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={800} fill="#ffe9ad">
					{name}
				</text>
			) : null}
			{flag ? <polygon points="92,-52 92,-92 132,-72" fill="#ff4b3a" stroke="#0b0d1e" strokeWidth={3} /> : null}
		</g>
	);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<rect x={-268} y={labels ? -112 : -70} width={536} height={labels ? 182 : 140} rx={24} fill={NAVY} stroke="#59607e" strokeWidth={4} />
			{face(-128, lev, 'ЛЕВ', run === 'lev', flagL)}
			{face(128, zak, 'ЗАХАР', run === 'zak', flagZ)}
		</g>
	);
};

/* ---------------------------------------------------------------- chess board from above */
export type PT = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type Piece = {id: string; t: PT; w: boolean; f: number; r: number; o?: number; lift?: number};
/* FEN board part -> pieces. Files a..h = 0..7, ranks 1..8 = 0..7. */
export const fen = (s: string): Piece[] => {
	const out: Piece[] = [];
	s.split(' ')[0]
		.split('/')
		.forEach((row, ri) => {
			let f = 0;
			for (const ch of row) {
				if (/\d/.test(ch)) f += Number(ch);
				else {
					const w = ch === ch.toUpperCase();
					out.push({id: `${ch}${f}${7 - ri}`, t: ch.toUpperCase() as PT, w, f, r: 7 - ri});
					f++;
				}
			}
		});
	return out;
};
const sq = (a: string): [number, number] => [a.charCodeAt(0) - 97, Number(a[1]) - 1];
export type Move = [number, string, number?]; // [frame, 'e2e4', length]; a capture removes the piece standing on the target
/* position at frame `now`: pieces slide, captured ones fade */
export const boardAt = (start: Piece[], moves: Move[], now: number): Piece[] => {
	let ps = start.map((p) => ({...p}));
	for (const [at, mv, len = 9] of moves) {
		if (now < at) break;
		const [ff, fr] = sq(mv.slice(0, 2));
		const [tf, tr] = sq(mv.slice(2, 4));
		const k = k01(now, at, len);
		const p = ps.find((q) => Math.round(q.f) === ff && Math.round(q.r) === fr && (q.o ?? 1) > 0.5);
		if (!p) continue;
		const victim = ps.find((q) => q !== p && Math.round(q.f) === tf && Math.round(q.r) === tr && (q.o ?? 1) > 0.5);
		if (k >= 1) {
			if (victim) ps = ps.filter((q) => q !== victim);
			p.f = tf;
			p.r = tr;
		} else {
			if (victim) victim.o = 1 - k * 0.6;
			p.f = lerp(ff, tf, k);
			p.r = lerp(fr, tr, k);
			p.lift = Math.sin(k * Math.PI);
		}
	}
	return ps;
};
const PieceShape: React.FC<{t: PT; w: boolean}> = ({t, w}) => {
	const fill = w ? '#fffaf0' : '#2a2d44';
	const st = w ? '#1b1e2a' : '#0b0d1e';
	const hi = w ? '#d9cfb8' : '#565b80';
	const base = <path d="M-30,40 L30,40 L26,28 L-26,28 Z" fill={fill} stroke={st} strokeWidth={5} strokeLinejoin="round" />;
	const P = {fill, stroke: st, strokeWidth: 5, strokeLinejoin: 'round' as const};
	switch (t) {
		case 'P':
			return (
				<g>
					<path d="M-16,28 C-14,6 -8,0 -8,-8 L8,-8 C8,0 14,6 16,28 Z" {...P} />
					<circle cx={0} cy={-18} r={15} {...P} />
					{base}
				</g>
			);
		case 'R':
			return (
				<g>
					<path d="M-20,28 L-18,-14 L-26,-14 L-26,-38 L-14,-38 L-14,-28 L-6,-28 L-6,-38 L6,-38 L6,-28 L14,-28 L14,-38 L26,-38 L26,-14 L18,-14 L20,28 Z" {...P} />
					{base}
				</g>
			);
		case 'N':
			return (
				<g>
					<path d="M-20,28 C-20,4 -2,0 -6,-16 L-22,-6 L-28,-16 L-10,-36 L-6,-46 L4,-38 C22,-30 26,0 20,28 Z" {...P} />
					<circle cx={-6} cy={-26} r={3.5} fill={st} />
					{base}
				</g>
			);
		case 'B':
			return (
				<g>
					<path d="M-16,28 C-22,6 -18,-14 0,-36 C18,-14 22,6 16,28 Z" {...P} />
					<line x1={-3} y1={-14} x2={8} y2={-26} stroke={st} strokeWidth={5} strokeLinecap="round" />
					<circle cx={0} cy={-42} r={7} {...P} />
					{base}
				</g>
			);
		case 'Q':
			return (
				<g>
					<path d="M-22,28 L-30,-24 L-14,-6 L-8,-34 L0,-8 L8,-34 L14,-6 L30,-24 L22,28 Z" {...P} />
					{[-30, -8, 8, 30].map((x, i) => (
						<circle key={i} cx={x} cy={i === 0 || i === 3 ? -28 : -38} r={6.5} fill={hi} stroke={st} strokeWidth={4} />
					))}
					{base}
				</g>
			);
		case 'K':
			return (
				<g>
					<path d="M-20,28 C-30,4 -24,-16 0,-18 C24,-16 30,4 20,28 Z" {...P} />
					<path d="M-5,-18 L-5,-30 L-15,-30 L-15,-40 L-5,-40 L-5,-50 L5,-50 L5,-40 L15,-40 L15,-30 L5,-30 L5,-18 Z" {...P} />
					{base}
				</g>
			);
	}
};
/* The board, drawn square by square. (x, y) = centre, S = square size. `box` = squares outlined as «коробочка»
   ([f0, r0, f1, r1] inclusive), boxC its colour, boxK 0..1 how much of it is shown. `flip`: black at the bottom. */
export const BoardTop: React.FC<{
	x: number;
	y: number;
	S?: number;
	pieces: Piece[];
	box?: [number, number, number, number];
	boxC?: string;
	boxK?: number;
	flip?: boolean;
	marks?: {f: number; r: number; c: string; o?: number}[];
	shake?: number;
}> = ({x, y, S = 104, pieces, box, boxC = GOLD, boxK = 1, flip, marks, shake = 0}) => {
	const X = (f: number) => (flip ? 7 - f : f) * S - 4 * S;
	const Y = (r: number) => (flip ? r : 7 - r) * S - 4 * S;
	const sorted = [...pieces].sort((a, b) => (a.lift ?? 0) - (b.lift ?? 0) || Y(a.r) - Y(b.r));
	return (
		<g transform={`translate(${x + shake},${y})`}>
			<rect x={-4 * S - 26} y={-4 * S - 26} width={8 * S + 52} height={8 * S + 52} rx={18} fill="#4a2f1c" stroke="#1b1e2a" strokeWidth={6} />
			{Array.from({length: 64}).map((_, i) => {
				const f = i % 8;
				const r = Math.floor(i / 8);
				return <rect key={i} x={X(f)} y={Y(r)} width={S} height={S} fill={(f + r) % 2 ? '#ecd9b0' : '#b9854f'} />;
			})}
			{marks?.map((m, i) => <rect key={'m' + i} x={X(m.f)} y={Y(m.r)} width={S} height={S} fill={m.c} opacity={m.o ?? 0.55} />)}
			{sorted.map((p) => (
				<g key={p.id} transform={`translate(${X(p.f) + S / 2},${Y(p.r) + S / 2 - (p.lift ?? 0) * S * 0.28}) scale(${(S / 104) * (1 + 0.12 * (p.lift ?? 0))})`} opacity={p.o ?? 1}>
					<PieceShape t={p.t} w={p.w} />
				</g>
			))}
			{box && boxK > 0.01
				? (() => {
						const x0 = Math.min(X(box[0]), X(box[2]));
						const y0 = Math.min(Y(box[1]), Y(box[3]));
						const w = (Math.abs(box[2] - box[0]) + 1) * S;
						const h = (Math.abs(box[3] - box[1]) + 1) * S;
						const per = 2 * (w + h);
						return (
							<g>
								<rect x={x0 - 5} y={y0 - 5} width={w + 10} height={h + 10} rx={12} fill={boxC} opacity={0.18 * boxK} />
								<rect x={x0 - 5} y={y0 - 5} width={w + 10} height={h + 10} rx={12} fill="none" stroke={boxC} strokeWidth={12} strokeDasharray={`${per * boxK} ${per}`} style={{filter: `drop-shadow(0 0 12px ${boxC})`}} />
							</g>
						);
					})()
				: null}
		</g>
	);
};

/* ---------------------------------------------------------------- poses */
export const sit = (gf: number, seed = 0): Pose => ({...SIT, lean: -3 + Math.sin(gf / 26 + seed) * 1.2, head: Math.sin(gf / 33 + seed) * 2.5});
/* seated, front hand on the table at local point (default: forward and a bit down) */
export const sitReach = (gf: number, k: number, seed = 0, t: [number, number] = [86, -62]): Pose => reach({...sit(gf, seed), lean: -3 + 9 * k}, 'F', t, k);
export const guardP = (gf: number, seed = 0, k = 1): Pose => {
	const b = idle(gf, seed);
	const p: Pose = {...b, lean: b.lean + 8 * k, legF: [16 * k + 4, 14 * k + 2], legB: [-14 * k - 3, 10 * k + 2]};
	return reach(reach(p, 'F', [50, -128 + Math.sin(gf / 5 + seed) * 4], k), 'B', [34, -108 + Math.cos(gf / 5 + seed) * 4], k);
};
/* punch with the front hand: k 0..1 extension */
export const jab = (p: Pose, k: number, h = -104): Pose => reach({...p, lean: p.lean + 8 * k}, 'F', [112, h], k);
export const sitFloor = (gf: number, seed = 0): Pose => ({lean: -16 + Math.sin(gf / 28 + seed) * 1.5, head: 8, armB: [-30, 20], armF: [-20, 24], legB: [80, 8], legF: [86, 14]});
/* world position of the head centre of a figure standing on `floor` (or with hip at `hipY`) */
export const headXY = (pose: Pose, x: number, s: number, facing: 1 | -1, floor = FL, hipY?: number): [number, number] => {
	const h = rigPoints(pose).head;
	const y0 = hipY ?? floor - 157 * s;
	return [x + h[0] * s * facing, y0 - h[1] * s * -1];
};
/* boxing helmet drawn over the head (the face stays open) */
export const Helmet: React.FC<{at: [number, number]; s?: number; c: string; facing?: 1 | -1}> = ({at, s = 1, c, facing = 1}) => (
	<g transform={`translate(${at[0]},${at[1]}) scale(${s * facing},${s})`}>
		<path d="M30,-46 C6,-70 -44,-62 -56,-22 C-64,6 -54,34 -34,48 L-22,30 C-36,18 -40,2 -36,-14 C-28,-38 0,-44 18,-30 Z" fill={c} stroke="#0b0d1e" strokeWidth={5} strokeLinejoin="round" />
		<path d="M-34,48 C-20,60 4,62 22,52 L16,38 C2,44 -12,42 -22,30 Z" fill={c} stroke="#0b0d1e" strokeWidth={5} strokeLinejoin="round" />
		<path d="M30,-46 C38,-40 44,-30 46,-18 L30,-14 C28,-22 24,-26 18,-30 Z" fill={c} stroke="#0b0d1e" strokeWidth={5} strokeLinejoin="round" />
	</g>
);
