import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import STL from './short-timeline.json';
import {Pose} from '../engine/Stickman';
import {env, gesture, idle, reach} from '../kit/actions';
import {Actor, Line, ShotCtx, TalkOverride} from '../kit/core';
import {clamp, ease} from '../kit/kit';
import {FONT} from '../kit/ui';
import {GL_L, GL_Z} from './cast';
import {BoardTop, Clocks, fen, GOLD, guardP, jab, NAVY, sit, sitReach, tw} from './lib';
import {Needles, Phone} from './places';

/* 9:16 short (recut): own vertical scenes, nothing is cropped from the 16:9 video.
   Canvas 1080x1920. Text and plates live in the upper half (below the top 150 px), the lower third is floor,
   figures stay left of x = 990 (the platform's buttons sit on the right below the middle). */
const SL = STL.lines as Line[];
const W = 1080;
const H = 1920;
const FLOOR = 1500;
const S = 1.3;
const at = (n: string) => SL.find((l) => l.id.startsWith(n))!;
const k01 = (f: number, a: number, len = 10) => interpolate(f, [a, a + len], [0, 1], {...clamp, easing: ease});
export const SHORT_TOTAL = STL.total as number;
const CARD_AT = at('010').from + at('010').dur + 8;
export const SHORT_WHIPS = [...['002', '003', '004', '006', '008', '010'].map((n) => at(n).from - 5), CARD_AT];

const talkV = (sp: string, gf: number) => {
	for (const l of SL) if (l.sp === sp && gf >= l.from && gf < l.from + l.dur) return l.env[gf - l.from] ?? 0;
	return 0;
};
/* plate in the upper half: centre (540, y) */
const P: React.FC<{y: number; lines: string[]; size?: number; c?: string; k?: number; sub?: string}> = ({y, lines, size: size0 = 72, c = GOLD, k = 1, sub}) => {
	if (k < 0.01) return null;
	// the text shrinks to fit a plate of at most 880 px
	const longest = Math.max(...lines.map((l) => l.length));
	const size = Math.min(size0, 790 / (longest * 0.78));
	const subSize = sub ? Math.min(size * 0.66, 790 / (sub.length * 0.78)) : 0;
	const w = Math.max(longest * size * 0.78, sub ? sub.length * subSize * 0.78 : 0) + 90;
	void tw;
	const lh = size * 1.2;
	const h = lines.length * lh + (sub ? size * 0.9 : 0) + 44;
	return (
		<g transform={`translate(540,${y}) scale(${0.7 + 0.3 * k})`} opacity={Math.min(1, k * 1.6)}>
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill={NAVY} stroke={c} strokeWidth={6} />
			{lines.map((l, i) => (
				<text key={i} x={0} y={-h / 2 + 22 + lh * (i + 0.78)} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill="#fff">
					{l}
				</text>
			))}
			{sub ? (
				<text x={0} y={h / 2 - 30} textAnchor="middle" fontSize={subSize} fontFamily={FONT} fontWeight={800} fill={c}>
					{sub}
				</text>
			) : null}
		</g>
	);
};
/* backdrop: wall above, floor from y = 1280 down (the lower third) */
const Back: React.FC<{wall: string; floor: string; wall2?: string; kind?: 'hall' | 'arena' | 'gym' | 'club' | 'felt'; f: number}> = ({wall, floor, wall2, kind, f}) => (
	<g>
		<rect x={-60} y={-60} width={W + 120} height={H + 120} fill={wall} />
		{wall2 ? <rect x={540} y={-60} width={600} height={H} fill={wall2} /> : null}
		{kind === 'arena'
			? [0, 1, 2].map((r) => (
					<g key={r}>
						{Array.from({length: 15}).map((_, i) => (
							<g key={i}>
								<rect x={-20 + i * 78 + (r % 2) * 39 - 17} y={900 + r * 86} width={34} height={90} rx={12} fill={['#f2b21c', '#d94a3a', '#3aa37a', '#8b5cf6', '#e86aa0', '#3fc1c9'][Math.floor(random(`v${r}${i}`) * 6)]} opacity={0.4 + r * 0.1} />
								<circle cx={-20 + i * 78 + (r % 2) * 39} cy={888 + r * 86 + Math.sin(f / 9 + i) * 2} r={19} fill="#f4f1e6" opacity={0.45 + r * 0.1} />
							</g>
						))}
					</g>
				))
			: null}
		{kind === 'arena' ? (
			<g>
				{[1150, 1250, 1350].map((y, i) => (
					<line key={i} x1={-60} y1={y} x2={W + 60} y2={y} stroke={i === 1 ? '#f4f4f4' : '#d9372b'} strokeWidth={10} />
				))}
			</g>
		) : null}
		{kind === 'hall' ? [0, 1, 2].map((i) => <rect key={i} x={70 + i * 340} y={980} width={240} height={300} rx={120} fill="#e9f3ff" stroke="#9fb0c8" strokeWidth={12} />) : null}
		{kind === 'club' ? <rect x={-60} y={1180} width={W + 120} height={340} fill="#a9794d" /> : null}
		<rect x={-60} y={FLOOR} width={W + 120} height={H - FLOOR + 60} fill={floor} />
		<rect x={-60} y={FLOOR} width={W + 120} height={16} fill="#000" opacity={0.18} />
		{Array.from({length: 7}).map((_, i) => (
			<line key={i} x1={i * 180} y1={FLOOR + 16} x2={i * 260 - 240} y2={H + 60} stroke="#000" strokeWidth={4} opacity={0.12} />
		))}
	</g>
);
const Table: React.FC<{x: number}> = ({x}) => (
	<g>
		<rect x={x - 150} y={FLOOR - 250} width={300} height={26} rx={6} fill="#8a5a34" stroke="#1b1e2a" strokeWidth={5} />
		<rect x={x - 124} y={FLOOR - 224} width={16} height={224} fill="#3a2a1e" />
		<rect x={x + 108} y={FLOOR - 224} width={16} height={224} fill="#3a2a1e" />
		<rect x={x - 110} y={FLOOR - 266} width={220} height={18} rx={4} fill="#ecd9b0" stroke="#1b1e2a" strokeWidth={4} />
		{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
			<g key={i}>
				<rect x={x - 98 + i * 26} y={FLOOR - 266 - 26 - (i % 3) * 8} width={12} height={26 + (i % 3) * 8} rx={4} fill={i < 4 ? '#fffaf0' : '#2a2d44'} stroke="#1b1e2a" strokeWidth={3} />
				<circle cx={x - 92 + i * 26} cy={FLOOR - 298 - (i % 3) * 8} r={8} fill={i < 4 ? '#fffaf0' : '#2a2d44'} stroke="#1b1e2a" strokeWidth={3} />
			</g>
		))}
	</g>
);
const Stool: React.FC<{x: number}> = ({x}) => (
	<g>
		<rect x={x - 50} y={FLOOR - 196} width={100} height={20} rx={6} fill="#c99a62" stroke="#1b1e2a" strokeWidth={4} />
		<rect x={x - 40} y={FLOOR - 176} width={12} height={176} fill="#2c2f38" />
		<rect x={x + 28} y={FLOOR - 176} width={12} height={176} fill="#2c2f38" />
	</g>
);
const SEAT = FLOOR - 204;

type SP = {f: number; t: number; d: number};
/* 001: Lev at a simul board, the opponent clutches his head */
const V1: React.FC<SP> = ({f, t, d}) => {
	const mv = env(t, d * 0.35, d * 0.6, 8, 10);
	return (
		<>
			<Back wall="#cfd9e6" floor="#8a6a4a" kind="hall" f={f} />
			<Stool x={760} />
			<Actor who="ded" x={760} seat={SEAT} s={S} facing={-1} pose={gesture('handsOnHead', sit(f, 3), k01(t, d * 0.6, 10), f)} expr="wide" uid="v1o" />
			<Table x={540} />
			<Actor who="lev" x={300} floor={FLOOR} s={S} facing={1} pose={reach(idle(f, 1), 'F', [120, -86], mv)} look={[0.3, -0.4]} uid="v1l" />
			<P y={420} lines={['ЛЕВ АРСКИЙ']} sub="ГРОССМЕЙСТЕР · 2700" size={84} k={k01(t, 6, 12)} />
		</>
	);
};
/* 002: Zakhar drops a man: 30–0 */
const V2: React.FC<SP> = ({f, t, d}) => {
	const hitAt = Math.round(d * 0.32);
	const pk = env(t, hitAt - 5, hitAt + 3, 4, 8);
	const fall = k01(t, hitAt + 1, 16);
	return (
		<>
			<Back wall="#0d1028" floor="#e3e8f2" kind="arena" f={f} />
			<Actor who="foe" x={700 + fall * 40} seat={FLOOR - 157 * S + fall * 150} s={S} facing={-1} glove="#e9eef5" pose={fall > 0.1 ? {lean: -18, head: 14, armB: [-30, 20], armF: [-20, 24], legB: [80, 8], legF: [86, 14]} : guardP(f, 3)} expr={fall > 0.1 ? 'sad' : 'angry'} uid="v2f" />
			<Actor who="zakhar" x={400 + pk * 30} floor={FLOOR} s={S} facing={1} glove={GL_Z} pose={jab(guardP(f, 1), pk, -112)} expr="angry" uid="v2z" />
			<P y={420} lines={['30–0']} sub="ЗАХАР «МОЛОТ» РУДИН" size={130} k={k01(t, d * 0.5, 12)} />
		</>
	);
};
/* 003 (long 004): the teaser: one board, Lev's clock at 0:04, the result hidden */
const V3: React.FC<SP> = ({f, t, d}) => {
	const pressAt = d - 8;
	const press = Math.min(0.9, k01(t, pressAt - 26, 24));
	const sec = t < pressAt - 60 ? 7 : t < pressAt - 30 ? 6 : t < pressAt - 6 ? 5 : 4;
	const fl = t - pressAt;
	return (
		<>
			<Back wall="#143a2c" floor="#0f2e23" f={f} />
			<Clocks x={540} y={520} lev={sec} zak={90} run="lev" s={1.58} />
			<BoardTop x={540} y={1150} S={76} pieces={fen('r5rk/ppp2Npp/1q3p2/8/8/8/PPP2PPP/4R1K1')} />
			<g transform="translate(540,1150)">
				<rect x={-270} y={-270} width={540} height={540} rx={30} fill={NAVY} stroke={GOLD} strokeWidth={8} />
				<text x={0} y={130} textAnchor="middle" fontSize={380} fontFamily={FONT} fontWeight={900} fill={GOLD}>
					?
				</text>
			</g>
			<g transform={`translate(${interpolate(press, [0, 1], [-80, 322])},${interpolate(press, [0, 1], [160, 372])})`}>
				<line x1={-520} y1={-260} x2={0} y2={0} stroke="#2f6fd8" strokeWidth={70} strokeLinecap="round" />
				<circle cx={0} cy={0} r={44} fill="#0b0b0d" />
			</g>
			{fl > 0 ? <rect x={-60} y={-60} width={W + 120} height={H + 120} fill="#fff" opacity={0.5 * Math.exp(-fl / 4)} /> : null}
		</>
	);
};
/* 004 (long 013): the swap: Lev in the gym, Zakhar at the board */
const V4: React.FC<SP> = ({f, t}) => (
	<>
		<Back wall="#3b4a5e" wall2="#dccba6" floor="#6b523c" f={f} />
		<rect x={534} y={-60} width={12} height={FLOOR + 60} fill="#fff" />
		<g transform={`rotate(${Math.sin(f / 16) * 2} 140 700)`}>
			<line x1={140} y1={700} x2={140} y2={940} stroke="#9aa3b5" strokeWidth={8} />
			<rect x={80} y={940} width={120} height={330} rx={40} fill="#b3402e" stroke="#1b1e2a" strokeWidth={6} />
		</g>
		<Actor who="lev" x={370} floor={FLOOR} s={S} facing={-1} outfit="tee" glove={GL_L} pose={jab(guardP(f, 1, 0.7), Math.max(0, Math.sin(f / 7)) ** 3)} expr="worried" uid="v4l" />
		<Stool x={700} />
		<Actor who="zakhar" x={700} seat={SEAT} s={S} facing={1} outfit="suit" pose={gesture('scratch', sitReach(f, 0.4, 2), 1, f)} expr="worried" look={[0.5, 0.6]} uid="v4z" />
		<g transform="translate(330,0)">
			<Table x={540} />
		</g>
		<P y={420} lines={['30 ДНЕЙ']} sub="ПОМЕНЯЛИСЬ МЕСТАМИ" size={120} k={k01(t, 6, 12)} />
	</>
);
/* 005 (long 014): the stake */
const V5: React.FC<SP> = ({f, t}) => (
	<>
		<Back wall="#3b4a5e" wall2="#dccba6" floor="#6b523c" f={f} />
		<rect x={534} y={-60} width={12} height={FLOOR + 60} fill="#fff" />
		<Actor who="lev" x={300} floor={FLOOR} s={S} facing={1} outfit="tee" glove={GL_L} pose={reach(idle(f, 1), 'F', [60, -110], 1)} handItem={<Phone />} look={[0.4, -0.2]} uid="v5l" />
		<Actor who="zakhar" x={760} floor={FLOOR} s={S} facing={-1} outfit="suit" pose={reach(reach(idle(f, 2), 'F', [60, -110], 1), 'B', [100, -150], env(t, 20, 50, 8, 8))} handItem={<Phone />} look={[0.8, -0.1]} expr="angry" uid="v5z" />
		<P y={430} lines={['ПРОИГРАЛ —', 'СКАЖИ ПРИ ВСЕХ:']} sub="«ТВОЁ ДЕЛО ТРУДНЕЕ»" size={78} c="#ff7a5c" k={k01(t, 4, 12)} />
	</>
);
/* 006–007 (long 088, 090): day 25: the flag is down with an extra knight; time is a piece too */
const V6: React.FC<SP & {ada?: boolean}> = ({f, t, ada}) => {
	const blink = Math.floor(f / 8) % 2;
	return (
		<>
			<Back wall="#dccba6" floor="#7a3b3b" kind="club" f={f} />
			<g transform="translate(540,470) scale(1.58)">
				<rect x={-268} y={-70} width={536} height={186} rx={24} fill={NAVY} stroke="#59607e" strokeWidth={4} />
				{[
					{dx: -128, v: '2:41', name: 'ТИМОФЕЙ', z: false},
					{dx: 128, v: '0:00', name: 'ЗАХАР', z: true},
				].map((c) => (
					<g key={c.name} transform={`translate(${c.dx},0)`}>
						<rect x={-118} y={-52} width={236} height={104} rx={16} fill={c.z && blink ? '#5e2320' : '#1b1e2a'} stroke={c.z ? '#ff4b3a' : '#59607e'} strokeWidth={4} />
						<text x={0} y={24} textAnchor="middle" fontSize={76} fontFamily={FONT} fontWeight={900} fill={c.z ? '#ff6a5a' : '#fff'}>
							{c.v}
						</text>
						<text x={0} y={96} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={800} fill="#ffe9ad">
							{c.name}
						</text>
					</g>
				))}
			</g>
			<Stool x={260} />
			<Actor who="zakhar" x={260} seat={SEAT} s={S} facing={1} outfit="suit" pose={ada ? {...sit(f, 2), lean: 12, head: 18} : reach(reach(sit(f, 2), 'F', [70, -96 + Math.sin(f / 2) * 10], 1), 'B', [56, -92 - Math.sin(f / 2) * 10], 1)} expr={ada ? 'sad' : 'wide'} uid="v6z" />
			{ada ? (
				<Actor who="ada" x={820} floor={FLOOR} s={S} facing={-1} pose={reach(idle(f, 7), 'F', [90, -110], 1)} handItem={<Needles f={0} />} look={[0.7, 0.2]} uid="v6a" />
			) : (
				<>
					<Stool x={800} />
					<Actor who="tim" x={800} seat={SEAT - 50} s={S} facing={-1} pose={reach(sit(f, 5), 'F', [110, -40], 1)} uid="v6t" />
				</>
			)}
			<Table x={530} />
			<P y={800} lines={ada ? ['ВРЕМЯ —', 'ТОЖЕ ФИГУРА'] : ['ФЛАЖОК УПАЛ']} sub={ada ? undefined : 'С ЛИШНИМ КОНЁМ'} size={80} c="#ff7a5c" k={k01(t, ada ? 4 : 16, 12)} />
		</>
	);
};
/* 008–009 (long 148, 149): round 9 of the final: 0:40 against 2:20; Zakhar waits for the flag */
const V8: React.FC<SP & {wait?: boolean}> = ({f, t, d, wait}) => (
	<>
		<Back wall="#0d1028" floor="#e3e8f2" kind="arena" f={f} />
		<Clocks x={540} y={470} lev={wait ? 40 - (t / Math.max(1, d)) * 3 : 40} zak={140} run="lev" s={1.58} />
		<Stool x={260} />
		<Stool x={800} />
		<Actor who="lev" x={260} seat={SEAT} s={S} facing={1} outfit="tee" pose={wait ? gesture('rubChin', sit(f, 1), 1, f) : {...sit(f, 1), head: -16}} look={wait ? [0.5, 0.5] : [0.3, -0.9]} expr="worried" uid="v8l" />
		<Actor who="zakhar" x={800} seat={SEAT} s={S} facing={-1} pose={wait ? gesture('armsCrossed', sit(f, 2), 1, f) : sit(f, 2)} look={wait ? [0.2, -0.9] : [0.7, 0]} mouth={wait ? 'smirk' : undefined} uid="v8z" />
		<Table x={530} />
		<P y={800} lines={wait ? ['ЗАХАР ЖДЁТ ФЛАЖОК'] : ['РАУНД 9 ИЗ 11']} sub={wait ? 'НЕ МАТ И НЕ НОКАУТ' : 'ШАХБОКС'} size={72} c={wait ? '#ff7a5c' : GOLD} k={k01(t, 6, 12)} />
	</>
);
/* 010 (long 190) and the end card */
const V10: React.FC<SP> = ({f, t, d}) => {
	const card = k01(t, d + 8, 14);
	return (
		<>
			<Back wall="#2a1f55" floor="#191238" f={f} />
			<Actor who="lev" x={320} floor={FLOOR} s={S} facing={1} pose={idle(f, 1)} uid="v10l" />
			<Actor who="zakhar" x={760} floor={FLOOR} s={S} facing={-1} pose={idle(f, 2)} uid="v10z" />
			<P y={470} lines={['А С КЕМ', 'ПОМЕНЯЛСЯ', 'БЫ ТЫ?']} sub="НА 30 ДНЕЙ" size={104} k={k01(t, 2, 12) * (1 - card)} />
			<P y={470} lines={['ПОЛНАЯ ИСТОРИЯ', 'НА КАНАЛЕ']} sub="ЧЕМ КОНЧИЛИСЬ 4 СЕКУНДЫ?" size={88} c="#ff7a5c" k={card} />
		</>
	);
};

export const ShortV: React.FC = () => {
	const f = useCurrentFrame();
	// the plan of this frame: a line owns the picture from 5 frames before it starts
	let cur = SL[0];
	for (const l of SL) {
		if (l.from - 5 > f) break;
		cur = l;
	}
	const n = cur.id.slice(0, 3);
	const t = f - cur.from;
	const d = cur.dur;
	const next = SL[SL.indexOf(cur) + 1];
	const len = (next ? next.from - 5 : SHORT_TOTAL) - (cur.from - 5);
	const z = 1 + 0.05 * Math.max(0, Math.min(1, (t + 5) / len));
	const sp: SP = {f, t, d};
	const ctx = {f: t, gf: f, dur: len, start: cur.from - 5, at: () => 0, end: () => 0};
	const scene =
		n === '001' ? <V1 {...sp} /> : n === '002' ? <V2 {...sp} /> : n === '003' ? <V3 {...sp} /> : n === '004' ? <V4 {...sp} /> : n === '005' ? <V5 {...sp} /> : n === '006' ? <V6 {...sp} /> : n === '007' ? <V6 {...sp} ada /> : n === '008' ? <V8 {...sp} /> : n === '009' ? <V8 {...sp} wait /> : <V10 {...sp} />;
	return (
		<ShotCtx.Provider value={ctx}>
			<TalkOverride.Provider value={talkV}>
				<AbsoluteFill style={{background: '#0c0e22'}}>
					<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{transform: `scale(${z})`, transformOrigin: '50% 38%'}}>
						{scene}
					</svg>
				</AbsoluteFill>
			</TalkOverride.Provider>
		</ShotCtx.Provider>
	);
};
