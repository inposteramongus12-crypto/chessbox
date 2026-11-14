import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import {Pose} from '../engine/Stickman';
import {Layer, Svg} from '../engine/camera';
import {Chair} from '../engine/props';
import {env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, L, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn, clamp, Stage} from '../kit/kit';
import {Board, FONT} from '../kit/ui';
import {GL_L, GL_Z} from './cast';
import {Rope} from './common';
import {BoardTop, boardAt, C, Clocks, Cloud, CREAM, DayPlate, fen, FL, GOLD, guardP, headXY, Hud, jab, k01, lerp, Move, NAVY, Plate, seg, sit, sitFloor, sitReach, tw, useLineCam, usePushK, useT} from './lib';
import {Apple, Arena, Armchair, Bag, ChessTable, Club, FactHead, Gym, Locker, Mitt, Needles, Notebook, Phone, Ring, RingFloor, SimulHall, TvStudio} from './places';

/* Parts 1–3 (lines 001–038). Every line is its own shot; the scene components read the global frame,
   so a location keeps its state across lines. Day plate: 0 → 1. */

export const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const p01 = (x: number) => Math.max(0, Math.min(1, x));

/* ---- the running gag: after an action Lev slaps the air where a chess clock would stand ---- */
export const slap = (base: Pose, k: number): Pose => reach(base, 'F', [80, -66 + 30 * p01(k * 1.6 - 0.5)], Math.min(1, k * 2.2));
export const GhostClock: React.FC<{x: number; y: number; k: number; s?: number}> = ({x, y, k, s = 1}) =>
	k > 0.02 ? (
		<g transform={`translate(${x},${y}) scale(${s})`} opacity={Math.min(1, k * 1.4)}>
			<rect x={-58} y={-4} width={116} height={54} rx={8} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="12 9" />
			<circle cx={-26} cy={24} r={15} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="8 7" />
			<circle cx={26} cy={24} r={15} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="8 7" />
			{[-34, 0, 34].map((a, i) => (
				<line key={i} x1={Math.sin((a * Math.PI) / 180) * 26 - 26} y1={-18 - Math.cos((a * Math.PI) / 180) * 10} x2={Math.sin((a * Math.PI) / 180) * 52 - 26} y2={-18 - Math.cos((a * Math.PI) / 180) * 36} stroke={GOLD} strokeWidth={6} strokeLinecap="round" />
			))}
		</g>
	) : null;
/* tree of variants over a thinking head: root at (x, y), 9 leaves; `hi` leaf highlighted; `fall` 0..1 crumbles it */
export const Tree: React.FC<{x: number; y: number; k: number; hi?: number; fall?: number; f: number}> = ({x, y, k, hi = -1, fall = 0, f}) => {
	if (k <= 0.01) return null;
	const mid = [-150, 0, 150];
	const nodes: {a: [number, number]; b: [number, number]; i: number; leaf: boolean}[] = [];
	mid.forEach((mx, m) => {
		nodes.push({a: [0, 0], b: [mx, -110], i: m, leaf: false});
		[-50, 0, 50].forEach((lx, j) => nodes.push({a: [mx, -110], b: [mx + lx, -220], i: m * 3 + j, leaf: true}));
	});
	return (
		<g transform={`translate(${x},${y})`}>
			{nodes.map((n, q) => {
				const kk = p01(k * 2 - (n.leaf ? 0.9 : 0));
				const dy = fall * fall * (500 + random('tf' + q) * 400);
				const dx = fall * (random('tx' + q) - 0.5) * 240;
				const bx = lerp(n.a[0], n.b[0], kk) + dx;
				const by = lerp(n.a[1], n.b[1], kk) + dy;
				const on = n.leaf && n.i === hi;
				return (
					<g key={q} opacity={(1 - fall * 0.7) * Math.min(1, kk * 2)}>
						<line x1={n.a[0] + dx * 0.6} y1={n.a[1] + dy * 0.6} x2={bx} y2={by} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
						<circle cx={bx} cy={by} r={n.leaf ? 17 + (on ? 5 * Math.abs(Math.sin(f / 3)) : 0) : 13} fill={on ? '#ff6a5a' : n.leaf ? GOLD : '#fff'} stroke="#0b0d1e" strokeWidth={4} />
					</g>
				);
			})}
		</g>
	);
};

/* =============================================================== PART 1: HOOK */

/* 001: Lev walks along the boards of a simul, kings fall behind him */
const Hook1: React.FC = () => {
	const {gf, t, d} = useT();
	const k = p01(t('001') / d('001'));
	const w = walkTo(t('001'), -10, d('001') - 20, 240, 1500, 1, 0.34);
	const cam = camOn(lerp(930, 1010, k), 575, lerp(1.0, 1.07, k));
	const tables = [420, 900, 1380];
	return (
		<Stage cam={cam} bg="#cfd9e6" light={{x: 30, y: 10, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<SimulHall />
				</Svg>
			</Layer>
			<Layer depth={1.12}>
				<Svg>
					{tables.map((tx, i) => {
						const passed = p01((w.x - tx - 30) / 60);
						return (
							<g key={i}>
								<Chair x={tx + 170} y={748} facing={-1} />
								<Actor who="ded" x={tx + 170} seat={737} facing={-1} seed={i} uid={'sim' + i} color={['#6f8f9a', '#c9892f', '#5aa06a'][i]} hair={(['grey', 'bob', 'spiky'] as const)[i]} hairColor={['#d9d9d9', '#3a2a1e', '#2a1c14'][i]} pose={gesture('handsOnHead', sit(gf, i), passed, gf)} expr={passed > 0.5 ? 'wide' : 'normal'} />
								<ChessTable x={tx} seed={'s' + i} skip={[2]} w={300} />
								<g transform={`translate(${tx - 26},688) rotate(${passed * 90})`}>
									<rect x={-6} y={-40} width={12} height={40} rx={3} fill="#2a2d44" stroke="#1b1e2a" strokeWidth={3} />
									<path d="M-4,-40 L-4,-48 L-10,-48 L-10,-54 L-4,-54 L-4,-60 L4,-60 L4,-54 L10,-54 L10,-48 L4,-48 L4,-40 Z" fill="#2a2d44" stroke="#1b1e2a" strokeWidth={2.5} />
								</g>
							</g>
						);
					})}
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="lev" x={w.x} floor={FL + 40} s={1.12} facing={1} pose={reach(w.pose, 'B', [70, -70], 0.5 + 0.5 * Math.sin(gf / 5))} bob={w.bob} vx={w.vx} look={[0.8, -0.1]} uid="lev1" />
					<Plate x={960} y={290} lines={['ЛЕВ АРСКИЙ']} sub="ГРОССМЕЙСТЕР · РЕЙТИНГ 2700" size={58} k={k01(t('001'), 14, 12)} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 002: Zakhar knocks a man down, the board shows 30–0 */
const Hook2: React.FC = () => {
	const {gf, t, d} = useT();
	const tt = t('002');
	const hitAt = Math.round(d('002') * 0.32);
	const pk = env(tt, hitAt - 5, hitAt + 3, 4, 8);
	const fall = k01(tt, hitAt + 1, 16);
	const cam = usePushK(camOn(960, 580, 1.08), camOn(1010, 560, 1.3));
	const zp = jab(guardP(gf, 1), pk, -112);
	return (
		<Stage cam={cam} bg="#0d1028" light={{night: true, o: 0.34}} dust="#aebcff">
			<Layer depth={1.6}>
				<Svg>
					<Arena f={gf} crowdUp={fall} />
				</Svg>
			</Layer>
			<Layer depth={1.1}>
				<Svg>
					<Ring />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<RingFloor />
					<g transform={`rotate(${fall * 84} ${1120} ${FL})`}>
						<Actor who="foe" x={1060 + fall * 40} facing={-1} glove="#e9eef5" pose={fall > 0.1 ? {...idle(gf, 4), armF: [-60, 20], armB: [-80, 30], head: -20} : guardP(gf, 3)} expr={fall > 0.1 ? 'sad' : 'angry'} uid="foe" shadow={fall < 0.3} />
					</g>
					<Actor who="zakhar" x={850 + pk * 26} facing={1} glove={GL_Z} pose={zp} expr="angry" uid="zak2" />
					{pk > 0.6 ? <circle cx={1010} cy={640} r={50 * pk} fill="#fff" opacity={0.7 * (1 - fall)} /> : null}
					<Plate x={960} y={280} lines={['30–0']} sub="ЗАХАР «МОЛОТ» РУДИН" size={110} k={k01(tt, Math.round(d('002') * 0.55), 12)} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 003: the screen splits in two and the question appears (below the faces) */
const Hook3: React.FC = () => {
	const {f, gf, dur} = useShot();
	const k = k01(f, 0, 14);
	const tk = k01(f, 10, 14);
	const z = 1 + 0.04 * (f / dur);
	return (
		<AbsoluteFill style={{background: '#0c0e22'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{transform: `scale(${z})`}}>
				<g transform={`translate(${-(1 - k) * 1000},0)`}>
					<polygon points="0,0 1010,0 910,1080 0,1080" fill="#1f3f86" />
					<Actor who="lev" x={450} floor={800} s={1.7} facing={1} faceTurn={0.2} look={[0.6, 0]} pose={gesture('rubChin', idle(gf, 1), 1, gf)} uid="lev3" shadow={false} />
				</g>
				<g transform={`translate(${(1 - k) * 1000},0)`}>
					<polygon points="1010,0 1920,0 1920,1080 910,1080" fill="#8a2a1c" />
					<Actor who="zakhar" x={1470} floor={800} s={1.7} facing={-1} faceTurn={0.2} look={[0.6, 0]} glove={GL_Z} pose={guardP(gf, 2)} expr="angry" uid="zak3" shadow={false} />
				</g>
				<line x1={1010} y1={0} x2={910} y2={1080} stroke="#fff" strokeWidth={10} opacity={k} />
				<g transform={`translate(960,${880 + (1 - tk) * 60}) scale(${0.8 + 0.2 * tk})`} opacity={tk}>
					<rect x={-760} y={-112} width={1520} height={224} rx={30} fill={NAVY} stroke={GOLD} strokeWidth={6} />
					<text x={0} y={-18} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill="#fff">
						А ЧТО, ЕСЛИ ОНИ
					</text>
					<text x={0} y={76} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill={GOLD}>
						ПОМЕНЯЮТСЯ МЕСТАМИ?
					</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};

/* 004: teaser = the last second of the final: both at one board, Lev's clock at 0:04, the result hidden */
export const MATE_POS = 'r5rk/ppp2Npp/1q3p2/8/8/8/PPP2PPP/4R1K1';
export const Teaser: React.FC<{reveal?: number; lev?: number; zak?: number; press?: number; freeze?: number}> = ({reveal = 0, lev = 4, zak = 90, press = 0, freeze = 0}) => {
	const {gf} = useShot();
	return (
		<g>
			<rect x={-400} y={-200} width={2720} height={1500} fill="#143a2c" />
			<ellipse cx={960} cy={540} rx={1100} ry={640} fill="#1c5240" />
			<BoardTop x={620} y={548} S={96} pieces={fen(MATE_POS)} box={reveal > 0 ? [5, 7, 7, 6] : undefined} boxC="#ff5a4a" boxK={reveal} />
			{reveal < 0.99 ? (
				<g transform="translate(620,548)" opacity={1 - reveal}>
					<rect x={-330} y={-330} width={660} height={660} rx={30} fill={NAVY} stroke={GOLD} strokeWidth={8} />
					<text x={0} y={150} textAnchor="middle" fontSize={440} fontFamily={FONT} fontWeight={900} fill={GOLD}>
						?
					</text>
				</g>
			) : null}
			<Clocks x={1420} y={520} lev={lev} zak={zak} run={press > 0.9 ? null : 'lev'} s={1.5} />
			{/* the hand flying to the button of the left clock */}
			<g transform={`translate(${lerp(900, 1228, press)},${lerp(40, 330 + 22 * p01(press * 3 - 2), press)})`}>
				<line x1={-520} y1={-330} x2={0} y2={0} stroke="#2f6fd8" strokeWidth={62} strokeLinecap="round" />
				<line x1={-520} y1={-360} x2={-50} y2={-60} stroke="#5a8fe6" strokeWidth={14} strokeLinecap="round" opacity={0.6} />
				<circle cx={0} cy={0} r={38} fill="#0b0b0d" />
			</g>
			{freeze > 0 ? <rect x={-400} y={-200} width={2720} height={1500} fill="#fff" opacity={0.5 * Math.exp(-freeze / 4)} /> : null}
		</g>
	);
};
const Hook4: React.FC = () => {
	const {t, d} = useT();
	const tt = t('004');
	const pressAt = d('004') - 8;
	const press = k01(tt, pressAt - 26, 24);
	const sec = tt < pressAt - 60 ? 7 : tt < pressAt - 30 ? 6 : tt < pressAt - 6 ? 5 : 4;
	const cam = usePushK(camOn(960, 560, 1.0), camOn(1010, 550, 1.07));
	return (
		<Stage cam={cam} bg="#143a2c" light={{x: 60, y: 10, o: 0.3}}>
			<Layer depth={1}>
				<Svg>
					<Teaser lev={sec} press={Math.min(0.86, press)} freeze={tt - pressAt} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* =============================================================== PART 2: THE BET */

/* 005–006: the interview. Lev in an armchair, a microphone pokes at his face */
const Interview: React.FC = () => {
	const {gf, t, d} = useT();
	const cam = useLineCam({'005': C(940, 600, 1.2, 900, 600, 1.4), '006': C(860, 600, 1.6, 850, 595, 1.72)}, []);
	const talk = t('006');
	const mv = env(talk, 6, 30, 8, 8);
	const sl = env(talk, 36, 56, 6, 8);
	const base = sit(gf, 1);
	const pose = sl > 0.02 ? slap(base, sl) : reach(base, 'F', [92, -70 + mv * 8], mv);
	const mic = 1180 - k01(t('005'), 20, 16) * 150 + Math.sin(gf / 9) * 6;
	return (
		<Stage cam={cam} bg="#3a2a66" light={{x: 30, y: 8, o: 0.4}}>
			<Layer depth={1.5}>
				<Svg>
					<TvStudio f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Armchair x={780} />
					<Actor who="lev" x={800} seat={722} facing={1} pose={{...pose, legF: [60, 100], legB: [92, 90]}} look={[0.7, -0.1]} uid="lev5" mouth={t('006') > 0 ? 'smirk' : 'line'} />
					<GhostClock x={900} y={676} k={sl} />
					<g transform={`translate(${mic},560)`}>
						<line x1={0} y1={0} x2={900} y2={-80} stroke="#15121f" strokeWidth={14} strokeLinecap="round" />
						<rect x={-66} y={-26} width={86} height={52} rx={24} fill="#9aa3b5" stroke="#0b0d1e" strokeWidth={5} />
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* a view counter plate that rolls to its number */
const Views: React.FC<{x: number; y: number; n: number; t: number}> = ({x, y, n, t}) => {
	const v = Math.round((n * k01(t, 4, 30)) / 100000) * 100000;
	const s = v.toLocaleString('ru-RU').replace(/ | /g, ' ');
	return <Plate x={x} y={y} lines={[`▶ ${s}`]} sub="ПРОСМОТРОВ" size={72} k={k01(t, 0, 10)} />;
};
/* 007–009: the locker room. Zakhar replays the clip with a glove and records his answer */
const LockerRoom: React.FC = () => {
	const {gf, t} = useT();
	const cam = useLineCam({'007': C(1040, 580, 1.18, 1060, 580, 1.3), '008': C(940, 640, 1.5, 920, 640, 1.66), '009': C(900, 620, 1.7, 890, 615, 1.8)}, []);
	const poke = Math.max(0, Math.sin(gf / 5));
	const speak = t('009') > -4;
	const base = sit(gf, 2);
	const pose = speak ? reach(base, 'F', [44, -118], 1) : reach(reach(base, 'B', [70, -66], 1), 'F', [78 + poke * 14, -74 + poke * 10], 1);
	return (
		<Stage cam={cam} bg="#46566b" light={{x: 70, y: 10, o: 0.34}}>
			<Layer depth={1.4}>
				<Svg>
					<Locker f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="zakhar" x={900} seat={756} facing={1} glove={GL_Z} pose={pose} look={speak ? [0.8, -0.1] : [0.5, 0.5]} expr={speak ? 'angry' : 'normal'} handItem={speak ? <Phone /> : undefined} uid="zak7" />
					{!speak ? (
						<g transform={`translate(984,${690})`}>
							<Phone />
						</g>
					) : null}
					{t('008') < 0 ? <Views x={1340} y={400} n={4000000} t={t('007') - 6} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 010: Lev counts the digits of the second clip twice */
const LevCounts: React.FC = () => {
	const {gf, t} = useT();
	const cam = usePushK(camOn(760, 560, 1.16), camOn(740, 540, 1.34));
	const tap = Math.sin(gf / 4);
	return (
		<Stage cam={cam} bg="#3a2a66" light={{x: 30, y: 8, o: 0.4}}>
			<Layer depth={1.5}>
				<Svg>
					<TvStudio f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="lev" x={900} facing={1} pose={reach(reach(idle(gf, 2), 'B', [56, -96], 1), 'F', [70 + tap * 8, -92], 1)} look={[0.6, 0.3]} handF="point" uid="lev10" expr="worried" />
					<g transform="translate(962,650)">
						<Phone />
					</g>
					<Views x={560} y={330} n={5000000} t={t('010') - 4} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 011: the producer calls both. Two halves, the terms in a cloud between them */
const Producer: React.FC = () => {
	const {gf, t} = useT();
	const tt = t('011');
	const cam = usePushK(camOn(960, 560, 1.0), camOn(960, 540, 1.1));
	const ring = Math.sin(gf / 1.6) * 4 * (1 - k01(tt, 20, 10));
	return (
		<Stage cam={cam} bg="#101433" light={false}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-200} width={1360} height={1500} fill="#1f3f86" />
					<rect x={960} y={-200} width={1360} height={1500} fill="#8a2a1c" />
					<rect x={952} y={-200} width={16} height={1500} fill="#fff" />
					<Actor who="lev" x={470 + ring} floor={980} s={1.1} facing={1} pose={reach(idle(gf, 1), 'F', [-14, -176], 1)} handItem={<Phone />} look={[0.5, -0.2]} uid="lev11" shadow={false} />
					<Actor who="zakhar" x={1450 - ring} floor={980} s={1.1} facing={-1} pose={reach(idle(gf, 2), 'F', [-14, -176], 1)} handItem={<Phone />} look={[0.5, -0.2]} uid="zak11" shadow={false} />
					<Cloud x={960} y={300} t={tt - 34} lines={['30 ДНЕЙ. ЧУЖОЙ ЗАЛ.', 'ЧУЖОЙ ТРЕНЕР.', 'В КОНЦЕ — ЭКЗАМЕН.']} label="ПРОДЮСЕР" size={56} fill={CREAM} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 012: only the date: a calendar page, the 30th circled */
const Calendar: React.FC = () => {
	const {t} = useT();
	const tt = t('012');
	const k = k01(tt, 2, 12);
	const ring = k01(tt, 26, 20);
	return (
		<Board tint="#2a1f55">
			<g transform={`translate(960,${560 + (1 - k) * 80})`} opacity={k}>
				<rect x={-520} y={-420} width={1040} height={840} rx={30} fill="#fffaf0" stroke="#1b1e2a" strokeWidth={8} />
				<rect x={-520} y={-420} width={1040} height={150} rx={30} fill="#d9372b" stroke="#1b1e2a" strokeWidth={8} />
				<text x={0} y={-320} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill="#fff">
					ЭКЗАМЕН
				</text>
				{Array.from({length: 30}).map((_, i) => {
					const cx = -420 + (i % 6) * 168;
					const cy = -180 + Math.floor(i / 6) * 118;
					return (
						<text key={i} x={cx} y={cy + 22} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={800} fill={i === 29 ? '#d9372b' : '#1b1e2a'} opacity={i === 29 ? 1 : 0.45}>
							{i + 1}
						</text>
					);
				})}
				<circle cx={420} cy={292} r={74} fill="none" stroke="#d9372b" strokeWidth={14} strokeDasharray={`${470 * ring} 470`} transform="rotate(-90 420 292)" />
			</g>
		</Board>
	);
};
/* 013–015: the swap. Lev in the gym in gloves up to the elbows, Zakhar in a tight jacket at the board. Day 0. */
const SwapGym: React.FC<{who?: 'lev'}> = () => {
	const {gf, t} = useT();
	const speak = t('015') > -6;
	const cam = useLineCam({'013': C(960, 580, 1.14, 900, 580, 1.3), '015': C(830, 600, 1.4, 820, 590, 1.5)}, []);
	const fix = env(t('015'), 14, 40, 8, 8);
	const p = speak ? reach(reach(idle(gf, 1), 'F', [62, -104], 1), 'B', [40, -100 - fix * 20], fix) : {...idle(gf, 1), armF: [18, 30] as [number, number], armB: [-14, 28] as [number, number]};
	return (
		<Stage cam={cam} bg="#3b4a5e" light={{x: 50, y: 6, o: 0.36}}>
			<Layer depth={1.5}>
				<Svg>
					<Gym f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1.15}>
				<Svg>
					<Bag x={1240} f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="lev" x={800} facing={1} outfit="tee" glove={GL_L} pose={p} look={speak ? [0.8, -0.2] : [0.4, 0.5]} expr={speak ? 'normal' : 'worried'} handItem={speak ? <Phone /> : undefined} uid="lev13" />
				</Svg>
			</Layer>
			<Hud>
				<DayPlate day={0} since={t('013')} />
			</Hud>
		</Stage>
	);
};
const SwapClub: React.FC = () => {
	const {gf, t} = useT();
	const speak = t('014') > -6;
	const cam = useLineCam({'013': C(940, 620, 1.2, 900, 620, 1.34), '014': C(830, 630, 1.5, 820, 625, 1.6)}, []);
	const poke = env(t('014'), 22, 44, 6, 8);
	const p = speak ? reach(reach(sit(gf, 2), 'B', [40, -112], 1), 'F', [60 + poke * 50, -120], 1) : sitReach(gf, 0.6, 2);
	return (
		<Stage cam={cam} bg="#dccba6" light={{x: 12, y: 20, o: 0.36}}>
			<Layer depth={1.5}>
				<Svg>
					<Club f={gf} sign={false} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Chair x={790} y={748} facing={1} />
					<Actor who="zakhar" x={790} seat={737} facing={1} outfit="suit" pose={p} look={speak ? [0.9, 0] : [0.5, 0.6]} expr={speak ? 'angry' : 'worried'} uid="zak13" />
					{speak ? (
						<g transform="translate(832,628)">
							<Phone />
						</g>
					) : null}
					<ChessTable x={960} seed="c0" />
				</Svg>
			</Layer>
			<Hud>
				<DayPlate day={0} />
			</Hud>
		</Stage>
	);
};
const Swap13: React.FC = () => {
	const {t, d} = useT();
	return t('013') < d('013') * 0.46 ? <SwapGym /> : <SwapClub />;
};

/* =============================================================== PART 3: DAY 1 */

/* the club, day 1 (016, 017, 019, 021–026): Zakhar left, Ada right, the board between them */
const ClubDay1: React.FC = () => {
	const {gf, t, d, id} = useT();
	const cam = useLineCam(
		{
			'016': C(960, 560, 1.0, 960, 580, 1.12),
			'017': C(1040, 620, 1.36, 1060, 620, 1.46),
			'019': C(880, 620, 1.4, 870, 615, 1.5),
			'021': C(900, 600, 1.26, 880, 590, 1.36),
			'022': C(1040, 620, 1.4, 1050, 620, 1.5),
			'023': C(960, 640, 1.5, 980, 640, 1.62),
			'024': C(940, 630, 1.34, 960, 625, 1.46),
			'025': C(960, 600, 1.16, 940, 610, 1.28),
			'026': C(900, 650, 1.56, 890, 648, 1.66),
		},
		[],
	);
	const enter = walkTo(t('016'), 0, 50, 420, 700, 3, 0.32);
	const seated = t('017') > d('017') * 0.6;
	const up = id === '021' ? k01(t('021'), 0, 6) : 0;
	const grab = id === '023' ? env(t('023'), 16, 46, 10, 6) : 0;
	const smack = id === '023' ? env(t('023'), 44, 50, 2, 8) : 0;
	const stare = id === '024' ? env(t('024'), 6, 70, 12, 14) : 0;
	const down = id === '025' ? k01(t('025'), 50, 14) : id === '026' ? 1 : 0;
	let zp: Pose = sit(gf, 2);
	if (id === '019') zp = gesture('armsCrossed', zp, 1, gf);
	if (grab > 0) zp = reach({...zp, lean: zp.lean + 22 * grab}, 'F', [150, -70], grab);
	if (stare > 0) zp = {...zp, lean: zp.lean + 30 * stare, head: zp.head - 14 * stare};
	if (down > 0) zp = {...reach(reach({...zp, lean: 58 * down, head: 30 * down}, 'F', [120, -40], down), 'B', [100, -36], down)};
	const zx = seated ? 790 : enter.x;
	const ap0 = sit(gf, 5);
	const point = id === '017' ? env(t('017'), 4, 40, 8, 10) : 0;
	const hitK = smack;
	const ap = hitK > 0 ? reach(ap0, 'F', [130, -80], 1) : point > 0 ? reach(ap0, 'F', [110, -40], point) : reach(reach(ap0, 'F', [56, -74], 1), 'B', [44, -70], 1);
	const tea = id === '024' ? k01(t('024'), 60, 14) : id > '024' && id <= '026' ? 1 : 0;
	return (
		<Stage cam={cam} bg="#dccba6" light={{x: 12, y: 20, o: 0.36}}>
			<Layer depth={1.5}>
				<Svg>
					<Club f={gf} sign={id === '016'} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform={up > 0 ? `rotate(${-80 * up} 750 ${FL})` : undefined}>
						<Chair x={790} y={748} facing={1} />
					</g>
					<Chair x={1130} y={748} facing={-1} />
					{seated && up === 0 ? (
						<Actor who="zakhar" x={zx} seat={737} facing={1} outfit="suit" pose={zp} look={stare > 0 ? [1, 0] : [0.6, 0.2]} expr={stare > 0 || id === '019' ? 'angry' : down > 0 ? 'sad' : 'normal'} uid="zakc1" mouth={id === '019' ? 'smirk' : undefined} />
					) : (
						<Actor who="zakhar" x={up > 0 ? 800 : zx} facing={1} outfit="suit" pose={up > 0 ? gesture('shrug', idle(gf, 2), 1, gf) : enter.pose} bob={enter.bob} look={[0.7, 0.3]} expr={up > 0 ? 'wide' : 'normal'} uid="zakc1" />
					)}
					<Actor who="ada" x={1130} seat={742} facing={-1} pose={ap} look={[0.4, 0.5]} handItem={<Needles f={hitK > 0 || point > 0 ? 0 : gf} />} uid="adac1" />
					<ChessTable x={960} seed="c1" />
					{tea > 0 ? (
						<g transform={`translate(${1010 - tea * 60},688)`} opacity={tea}>
							<rect x={-18} y={-30} width={36} height={30} rx={5} fill="#fffaf0" stroke="#1b1e2a" strokeWidth={3} />
							<path d="M18,-24 C34,-24 34,-8 18,-8" fill="none" stroke="#1b1e2a" strokeWidth={4} />
							<circle cx={-46} cy={-8} r={11} fill="none" stroke="#d9a04a" strokeWidth={7} />
						</g>
					) : null}
					{smack > 0.2 ? (
						<g transform="translate(1000,640)">
							{[0, 60, 120, 180, 240, 300].map((a) => (
								<line key={a} x1={Math.cos((a * Math.PI) / 180) * 20} y1={Math.sin((a * Math.PI) / 180) * 20} x2={Math.cos((a * Math.PI) / 180) * 54} y2={Math.sin((a * Math.PI) / 180) * 54} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
							))}
						</g>
					) : null}
					{id === '025' ? <Plate x={960} y={400} lines={['0–11']} sub="ЗА ОДИН ДЕНЬ" size={104} k={k01(t('025'), 8, 12)} /> : null}
				</Svg>
			</Layer>
			<Hud>
				<DayPlate day={1} since={t('016') - 6} />
			</Hud>
		</Stage>
	);
};
/* 018 and 020: the board from above. 1.d4 d5 2.Qd3 e6 3.Qe3 Nf6 4.Qe4?? and the pawn takes the queen. */
const QueenTrap: React.FC = () => {
	const {t, d, id} = useT();
	const a = L('018').from;
	const b = L('020').from;
	const n18 = d('018');
	const moves: Move[] = [
		[a + 6, 'd2d4'],
		[a + 18, 'd7d5'],
		[a + Math.round(n18 * 0.36), 'd1d3', 7],
		[a + Math.round(n18 * 0.55), 'e7e6'],
		[a + Math.round(n18 * 0.72), 'd3e3', 7],
		[a + Math.round(n18 * 0.9), 'g8f6'],
		[b + 14, 'e3e4', 7],
		[b + Math.round(d('020') * 0.5), 'd5e4', 12],
	];
	const {gf} = useShot();
	const ps = boardAt(fen(START), moves, gf);
	const slam = [moves[2][0] + 7, moves[4][0] + 7, moves[6][0] + 7].map((x) => Math.exp(-Math.max(0, gf - x) / 3) * (gf >= x ? 1 : 0)).reduce((s, v) => s + v, 0);
	const taken = k01(gf, b + Math.round(d('020') * 0.5) + 12, 14);
	const cam = usePushK(id === '018' ? camOn(1000, 540, 1.0) : camOn(980, 540, 1.04), id === '018' ? camOn(960, 540, 1.1) : camOn(940, 520, 1.14));
	return (
		<Stage cam={cam} bg="#143a2c" light={{x: 50, y: 0, o: 0.3}}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-200} width={2720} height={1500} fill="#143a2c" />
					<ellipse cx={960} cy={540} rx={1100} ry={640} fill="#1c5240" />
					<BoardTop x={860} y={540} S={98} pieces={ps} shake={Math.sin(gf * 2.2) * 9 * slam} marks={taken > 0 ? [{f: 4, r: 3, c: '#ff5a4a', o: 0.5 * (1 - taken)}] : undefined} />
					{/* the box where the lost queen ends up */}
					<g transform="translate(1560,720)">
						<rect x={-110} y={-70} width={220} height={150} rx={14} fill="#6e4a2c" stroke="#1b1e2a" strokeWidth={6} />
						<rect x={-110} y={-70} width={220} height={34} rx={10} fill="#8a623c" stroke="#1b1e2a" strokeWidth={5} />
						<g transform={`translate(0,${-260 + taken * 250}) rotate(${taken * 80}) scale(1.5)`} opacity={taken > 0 ? 1 : 0}>
							<path d="M-22,28 L-30,-24 L-14,-6 L-8,-34 L0,-8 L8,-34 L14,-6 L30,-24 L22,28 Z" fill="#fffaf0" stroke="#1b1e2a" strokeWidth={5} strokeLinejoin="round" />
						</g>
					</g>
					{t('018') > 0 && id === '018' ? <Plate x={1560} y={300} lines={['ХОД', String(Math.min(3, 1 + Math.floor((gf - a) / Math.max(1, n18 / 3))))]} size={64} k={1} /> : null}
					{id === '020' ? <Plate x={1560} y={300} lines={['ХОД', '4']} size={64} c="#ff5a4a" k={1} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* the gym, day 1 (027–031, 033–036): Lev left, the bag in the middle, Palych right */
const GymDay1: React.FC = () => {
	const {gf, t, d, id} = useT();
	const cam = useLineCam(
		{
			'027': C(1040, 580, 1.14, 1060, 580, 1.26),
			'028': C(1500, 590, 1.6, 1500, 585, 1.7),
			'029': C(930, 590, 1.3, 910, 590, 1.44),
			'030': C(640, 600, 1.56, 630, 595, 1.66),
			'031': C(930, 480, 1.2, 920, 460, 1.32),
			'033': C(920, 500, 1.22, 920, 590, 1.36),
			'034': C(940, 600, 1.34, 930, 590, 1.44),
			'035': C(900, 590, 1.3, 910, 580, 1.42),
			'036': C(820, 600, 1.3, 800, 595, 1.44),
		},
		[],
	);
	const punchAt = 14;
	const pk = id === '029' ? env(t('029'), punchAt, punchAt + 5, 4, 8) : 0;
	const slAt = Math.round(d('029') * 0.34);
	const sl = id === '029' ? env(t('029'), slAt, d('029') + 14, 6, 10) : 0;
	const hide = id === '030' ? k01(t('030'), 0, 10) : 0;
	const tree = id === '031' ? k01(t('031'), Math.round(d('031') * 0.45), 40) : id === '033' ? 1 : 0;
	const mittAt = Math.round(d('033') * 0.45);
	const mitt = id === '033' ? k01(t('033'), mittAt - 8, 8) : 0;
	const sat = id === '033' ? k01(t('033'), mittAt, 10) : 0;
	const lift = id === '034' ? k01(t('034'), 8, 20) : 0;
	const note = id === '035' ? k01(t('035'), Math.round(d('035') * 0.3), 10) : 0;
	const fly = id === '035' ? k01(t('035'), Math.round(d('035') * 0.68), 14) : 0;
	const rope = id === '036';
	const jumpT = t('036') - Math.round(d('036') * 0.62);
	const jump = rope && jumpT > 0 && jumpT < 30 ? Math.abs(Math.sin((jumpT / 30) * Math.PI * 2)) : 0;
	const tangled = rope && jumpT >= 30;
	const lx = 800;
	let lp: Pose = idle(gf, 1);
	if (id === '027' || id === '028') lp = {...lp, armF: [14, 30], armB: [-10, 28]};
	if (id === '029') lp = sl > 0.02 ? slap(idle(gf, 1), sl) : jab(guardP(gf, 1, 0.7), pk);
	if (hide > 0) lp = {...lp, armF: [-40 * hide, 30], armB: [-34 * hide, 40]};
	if (id === '031') lp = gesture('think', guardP(gf, 1, 0.5), tree, gf);
	if (id === '033') lp = sat > 0 ? sitFloor(gf, 1) : gesture('think', guardP(gf, 1, 0.5), 1, gf);
	if (id === '035') lp = reach(reach(idle(gf, 1), 'B', [52, -96], note), 'F', [66, -92], note);
	if (rope) lp = tangled ? {...idle(gf, 1), armF: [40, 110], armB: [-30, 120], lean: 8} : {...idle(gf, 1), armF: [30, 70], armB: [-30, 70]};
	const lowered = id === '033' ? sat : id === '034' ? 1 - lift : 0;
	const hipY = FL - 157 + lowered * 120;
	const hd = headXY(lp, lx, 1, 1, FL, hipY);
	const pp0 = idle(gf, 4);
	let pp: Pose = gesture('armsCrossed', pp0, 1, gf);
	if (id === '027') pp = gesture('point', pp0, env(t('027'), Math.round(d('027') * 0.7), d('027') + 20, 8, 8), gf);
	if (id === '031' || id === '033') pp = reach(reach(pp0, 'F', [70, -120], 1), 'B', [60, -90], 1);
	if (id === '034') pp = reach(pp0, 'F', [110, -60 - lift * 40], 1);
	if (id === '035') pp = reach(pp0, 'F', [80 + fly * 40, -110], 1);
	const px = id === '031' || id === '033' || id === '034' || id === '035' ? 1040 : 1330;
	const mittX = id === '033' ? lerp(px - 80, lx + 60, mitt) : px - 90;
	return (
		<Stage cam={cam} bg="#3b4a5e" light={{x: 50, y: 6, o: 0.36}}>
			<Layer depth={1.5}>
				<Svg>
					<Gym f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1.12}>
				<Svg>{px === 1330 ? <Bag x={1010} f={gf} hit={Math.exp(-Math.max(0, t('029') - punchAt) / 20) * (id === '029' && t('029') >= punchAt ? 1 : 0)} /> : <Bag x={1560} f={gf} />}</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					{lowered > 0.02 ? (
						<Actor who="lev" x={lx} seat={hipY} facing={1} outfit="tee" glove={GL_L} pose={lp} expr="sad" look={[0.5, -0.4]} uid="levg1" />
					) : (
						<Actor who="lev" x={lx} facing={1} outfit="tee" glove={GL_L} pose={lp} bob={jump * 26} expr={id === '031' ? 'worried' : tangled ? 'sad' : 'normal'} look={id === '031' ? [0.2, -0.8] : [0.7, 0]} handItem={note > 0 && fly < 0.1 ? <Notebook /> : undefined} uid="levg1" />
					)}
					<GhostClock x={lx + 88} y={FL - 157 - 46} k={sl} />
					<Actor who="palych" x={px} facing={-1} pose={pp} look={[0.7, 0]} handItem={px === 1040 && id !== '034' ? <Mitt /> : undefined} uid="palg1" />
					{id === '033' && mitt > 0 && mitt < 1 ? (
						<g transform={`translate(${mittX},600)`}>
							<Mitt />
						</g>
					) : null}
					{fly > 0 ? (
						<g transform={`translate(${lx + 70 - fly * 620},${FL - 250 - Math.sin(fly * Math.PI) * 260}) rotate(${fly * 400})`}>
							<Notebook />
						</g>
					) : null}
					{tree > 0 ? <Tree x={hd[0] + 10} y={hd[1] - 70 - lowered * 0} k={tree} hi={id === '033' ? 2 : -1} fall={id === '033' ? k01(t('033'), mittAt, 22) : 0} f={gf} /> : null}
					{rope ? tangled ? (
						<g>
							{[0, 1, 2].map((i) => (
								<ellipse key={i} cx={lx} cy={FL - 250 + i * 70} rx={70 - i * 6} ry={18} fill="none" stroke="#ffd34a" strokeWidth={8} />
							))}
						</g>
					) : jumpT > 0 ? <Rope p={lp} x={lx} s={1} facing={1} a={(jumpT / 30) * Math.PI * 4} /> : (
						<g>
							<line x1={lx - 40} y1={FL - 200} x2={lx + 200} y2={FL - 200} stroke="#ffd34a" strokeWidth={8} strokeLinecap="round" />
							{[0, 1, 2, 3].map((i) => (
								<line key={i} x1={lx + i * 60} y1={FL - 224} x2={lx + i * 60} y2={FL - 204} stroke="#fff" strokeWidth={5} />
							))}
						</g>
					) : null}
				</Svg>
			</Layer>
			<Hud>
				<DayPlate day={1} />
			</Hud>
		</Stage>
	);
};

/* 032: Hick, 1952: the more options, the longer the choice */
const HickCard: React.FC = () => {
	const {t} = useT();
	const tt = t('032');
	const k = k01(tt, 0, 12);
	const grow = k01(tt, 30, 110);
	const pts = Array.from({length: 40}).map((_, i) => {
		const u = (i / 39) * grow;
		return `${460 + u * 1000},${820 - Math.log2(1 + u * 15) * 110}`;
	});
	return (
		<Board tint="#1a2150">
			<FactHead title="УИЛЬЯМ ХИК" year="1952" k={k} />
			<g transform="translate(0,-80)">
			<line x1={460} y1={820} x2={1520} y2={820} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={k} />
			<line x1={460} y1={820} x2={460} y2={330} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={k} />
			<polyline points={pts.join(' ')} fill="none" stroke={GOLD} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
			{[1, 3, 9].map((n, i) => {
				const u = [0.02, 0.2, 0.95][i];
				const on = grow > u ? 1 : 0;
				return (
					<g key={i} opacity={on}>
						<circle cx={460 + u * 1000} cy={820 - Math.log2(1 + u * 15) * 110} r={22} fill="#ff6a5a" stroke="#0b0d1e" strokeWidth={5} />
						<text x={460 + u * 1000} y={906} textAnchor="middle" fontSize={70} fontFamily={FONT} fontWeight={900} fill="#fff">
							{n}
						</text>
					</g>
				);
			})}
			<text x={1500} y={790} textAnchor="end" fontSize={60} fontFamily={FONT} fontWeight={800} fill="#aab3d6" opacity={k}>
				ВАРИАНТЫ
			</text>
			<text x={420} y={370} textAnchor="end" fontSize={60} fontFamily={FONT} fontWeight={800} fill="#aab3d6" opacity={k}>
				ВРЕМЯ
			</text>
			</g>
			<g opacity={k01(tt, 120, 14)}>
				<rect x={280} y={880} width={1360} height={100} rx={22} fill={NAVY} stroke={GOLD} strokeWidth={5} />
				<text x={960} y={950} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#fff">
					БОЛЬШЕ ВАРИАНТОВ — ДОЛЬШЕ ВЫБОР
				</text>
			</g>
		</Board>
	);
};

/* 037–038: evening, the first voice messages (text in clouds, not voiced) */
export const Evening: React.FC<{day: number; a: string; b?: string; toLev: string[]; toZak?: string[]; levItem?: 'ice' | 'mat' | 'note'; zakItem?: 'queen' | 'box' | 'none'; onlyLev?: boolean; onlyZak?: boolean; delZ?: number; lateZ?: string}> = ({day, a, b, toLev, toZak, levItem, zakItem, onlyLev, onlyZak, delZ, lateZ}) => {
	const {gf, t, id} = useT();
	const second = !!b && id >= b;
	const cam = usePushK(second ? camOn(960, 570, 1.05) : camOn(960, 540, 1.0), second ? camOn(960, 600, 1.1) : camOn(960, 560, 1.06));
	const tA = t(a) - 16;
	const tB = lateZ ? t(lateZ) - 10 : t(a) - 44;
	const ice = levItem === 'ice' && second;
	const lp = ice ? reach(reach(idle(gf, 1), 'F', [30, -196], 1), 'B', [44, -100], 1) : reach(idle(gf, 1), 'F', [40, -112], 1);
	const zp = zakItem === 'queen' && second ? reach(reach(idle(gf, 2), 'F', [50, -110], 1), 'B', [70, -80], 1) : reach(idle(gf, 2), 'F', [40, -112], 1);
	return (
		<Stage cam={cam} bg="#0f1330" light={false} vig={0.3}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-200} width={2720} height={1500} fill="#0f1330" />
					{!onlyZak ? <rect x={110} y={400} width={800} height={640} rx={40} fill="#27406e" stroke="#59607e" strokeWidth={6} /> : null}
					{!onlyLev ? <rect x={1010} y={400} width={800} height={640} rx={40} fill="#6e2f27" stroke="#59607e" strokeWidth={6} /> : null}
					{!onlyZak ? (
						<>
							<Actor who="lev"  x={onlyLev ? 960 : 510} floor={1010} s={1.25} facing={1} outfit="tee" pose={lp} look={[0.4, -0.3]} handItem={ice ? undefined : <Phone />} uid={'levE' + day} shadow={false} expr={ice ? 'sad' : 'normal'} armOver={ice} />
							{ice ? <rect x={(onlyLev ? 960 : 510) + 6} y={520} width={76} height={46} rx={12} fill="#8fd3ff" stroke="#0b0d1e" strokeWidth={4} /> : null}
							<Cloud x={onlyLev ? 960 : 510} y={236} t={tA} lines={toLev} label="ЗАХАР → ЛЬВУ" size={58} fill="#ffe3ef" stroke="#8a2a1c" ink="#3a120c" tail={[0, 170]} />
						</>
					) : null}
					{!onlyLev ? (
						<>
							<Actor who="zakhar"  x={onlyZak ? 960 : 1410} floor={1010} s={1.25} facing={-1} outfit="suit" pose={zp} look={[0.4, -0.3]} handItem={zakItem === 'queen' && second ? undefined : <Phone />} uid={'zakE' + day} shadow={false} />
							{toZak ? <Cloud x={onlyZak ? 960 : 1410} y={250} t={delZ !== undefined ? tA : tB} hold={delZ} lines={toZak} label="ЛЕВ → ЗАХАРУ" size={58} fill={CREAM} stroke="#1f3f86" ink="#0f1f48" tail={[0, 170]} /> : null}
							{zakItem === 'queen' && second ? (
								<g transform={`translate(${(onlyZak ? 960 : 1410) - 64},${1010 - 157 * 1.25 - 150}) scale(1.3)`}>
									<path d="M-22,28 L-30,-24 L-14,-6 L-8,-34 L0,-8 L8,-34 L14,-6 L30,-24 L22,28 Z" fill="#fffaf0" stroke="#1b1e2a" strokeWidth={5} strokeLinejoin="round" />
								</g>
							) : null}
						</>
					) : null}
				</Svg>
			</Layer>
			<Hud>
				<DayPlate day={day} label="ВЕЧЕР" />
			</Hud>
		</Stage>
	);
};
const Evening1: React.FC = () => <Evening day={1} a="037" b="038" toLev={['СОВЕТ:', 'НЕ ДУМАЙ']} toZak={['СОВЕТ:', 'ДУМАЙТЕ']} levItem="ice" zakItem="queen" />;

void [Apple, interpolate, clamp, tw, seg, Clocks];
const mk = (ids: string[], Cmp: React.FC, whipFirst = true): ShotDef[] => ids.map((at, i) => ({at, C: Cmp, whip: whipFirst && i === 0}));
export const SHOTS1: ShotDef[] = [
	{at: '001', C: Hook1},
	{at: '002', C: Hook2, whip: true},
	{at: '003', C: Hook3},
	{at: '004', C: Hook4},
	...mk(['005', '006'], Interview),
	...mk(['007', '008', '009'], LockerRoom),
	...mk(['010'], LevCounts),
	...mk(['011'], Producer, false),
	...mk(['012'], Calendar, false),
	...mk(['013'], Swap13),
	...mk(['014'], SwapClub, false),
	...mk(['015'], SwapGym, false),
	...mk(['016', '017'], ClubDay1),
	...mk(['018'], QueenTrap, false),
	...mk(['019'], ClubDay1, false),
	...mk(['020'], QueenTrap, false),
	...mk(['021', '022', '023', '024', '025', '026'], ClubDay1, false),
	...mk(['027', '028', '029', '030', '031'], GymDay1),
	...mk(['032'], HickCard, false),
	...mk(['033', '034', '035', '036'], GymDay1, false),
	...mk(['037', '038'], Evening1),
];
