import React from 'react';
import {interpolate} from 'remotion';
import {Pose} from '../engine/Stickman';
import {Layer, Svg} from '../engine/camera';
import {env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, L, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn, clamp, Stage} from '../kit/kit';
import {Board, FONT} from '../kit/ui';
import {GL_L, GL_Z} from './cast';
import {BoardTop, boardAt, C, CamPair, Clocks, Cloud, CREAM, DayPlate, fen, FL, GOLD, guardP, headXY, Helmet, Hud, jab, k01, lerp, Move, NAVY, Piece, Plate, RoundPlate, sit, sitFloor, sitReach, tw, useLineCam, usePushK, useT} from './lib';
import {Arena, ChessTable, FactHead, Needles, Phone, Ring, RingFloor, Stool} from './places';
import {GhostClock, slap} from './shots1';
import {BOX} from './shots2';

/* Parts 7–9 (lines 108–155) and the arena itself for the whole final (up to 190). */
const p01 = (x: number) => Math.max(0, Math.min(1, x));
const mk = (ids: string[], Cmp: React.FC, whipFirst = false): ShotDef[] => ids.map((at, i) => ({at, C: Cmp, whip: whipFirst && i === 0}));

/* ------------------------------------------------------------ clocks and rounds of the match */
const st = (n: string) => L(n).from;
const en = (n: string) => L(n).from + L(n).dur;
const KEYS = (): [number, number, number][] => [
	[st('123'), 540, 540],
	[en('125'), 420, 480],
	[st('130'), 420, 480],
	[en('131'), 300, 420],
	[st('136'), 300, 420],
	[en('139'), 200, 340],
	[st('144'), 200, 340],
	[en('144'), 110, 250],
	[st('147'), 110, 250],
	[st('148'), 40, 140],
	[st('168'), 40, 140],
	[en('168'), 20, 140],
	[st('169'), 20, 140],
	[en('169'), 17, 140],
	[st('170'), 17, 140],
	[en('170'), 14, 140],
	[st('171'), 14, 140],
	[en('171'), 14, 90],
	[st('175'), 14, 90],
	[en('175'), 6, 90],
	[st('179'), 6, 90],
	[en('179') - 20, 4, 90],
];
let _K: [number, number, number][] | null = null;
export const clockAt = (gf: number): {lev: number; zak: number} => {
	const K = (_K ??= KEYS());
	if (gf <= K[0][0]) return {lev: K[0][1], zak: K[0][2]};
	for (let i = 1; i < K.length; i++) {
		if (gf <= K[i][0]) {
			const k = (gf - K[i - 1][0]) / Math.max(1, K[i][0] - K[i - 1][0]);
			return {lev: lerp(K[i - 1][1], K[i][1], k), zak: lerp(K[i - 1][2], K[i][2], k)};
		}
	}
	return {lev: 4, zak: 90};
};
export const roundOf = (n: number): {n: number; kind: 'ШАХМАТЫ' | 'БОКС' | 'ПЕРЕРЫВ'; first: string} | null => {
	const R: [number, number, number, 'ШАХМАТЫ' | 'БОКС' | 'ПЕРЕРЫВ'][] = [
		[123, 125, 1, 'ШАХМАТЫ'],
		[126, 129, 2, 'БОКС'],
		[130, 131, 3, 'ШАХМАТЫ'],
		[132, 135, 4, 'БОКС'],
		[136, 140, 5, 'ШАХМАТЫ'],
		[141, 143, 6, 'БОКС'],
		[144, 144, 7, 'ШАХМАТЫ'],
		[145, 146, 8, 'БОКС'],
		[147, 155, 9, 'ШАХМАТЫ'],
		[156, 164, 10, 'БОКС'],
		[165, 167, 10, 'ПЕРЕРЫВ'],
		[168, 180, 11, 'ШАХМАТЫ'],
	];
	const r = R.find((x) => n >= x[0] && n <= x[1]);
	return r ? {n: r[2], kind: r[3], first: String(r[0]).padStart(3, '0')} : null;
};
/* HUD of the match: round plate (top-left) and the two clocks (top-right) */
export const MatchHud: React.FC<{clocks?: boolean}> = ({clocks = true}) => {
	const {gf, t, id} = useT();
	const r = roundOf(Number(id));
	if (!r) return null;
	const c = clockAt(gf);
	return (
		<Hud>
			<RoundPlate n={r.n} kind={r.kind} since={t(r.first) - 6} />
			{clocks && r.kind === 'ШАХМАТЫ' ? <Clocks x={1560} y={150} lev={c.lev} zak={c.zak} s={0.72} run={r.kind === 'ШАХМАТЫ' ? (Number(id) === 171 ? 'zak' : 'lev') : null} /> : null}
		</Hud>
	);
};

/* ------------------------------------------------------------ the arena, side view (all lines of the final) */
type Ex = 'normal' | 'angry' | 'sad' | 'wide' | 'worried' | 'sleepy';
export const ArenaScene: React.FC = () => {
	const {gf, t, d, id} = useT();
	const n = Number(id);
	const T = t(id);
	const D = d(id);
	const sp = L(id).sp;
	const r = roundOf(n);
	const chess = !r ? n >= 181 && n <= 183 : r.kind === 'ШАХМАТЫ';
	const box = !!r && r.kind === 'БОКС';
	const brk = !!r && r.kind === 'ПЕРЕРЫВ';
	const pre = n < 123; // day 30 before the bell
	const after = n >= 184;
	// default cameras: speaker close-ups, narration cycles
	const cyc: CamPair[] = [C(960, 600, 1.04, 960, 590, 1.16), C(950, 620, 1.14, 945, 610, 1.22), C(970, 620, 1.14, 975, 610, 1.22)];
	const bySp: Record<string, CamPair> = {LEV: C(740, 620, 1.42, 735, 615, 1.52), ZAKHAR: C(1180, 620, 1.42, 1185, 615, 1.52), PALYCH: C(440, 610, 1.6, 436, 605, 1.68), ADA: C(1480, 640, 1.6, 1484, 635, 1.68)};
	const table: Record<string, CamPair> = {
		'108': C(960, 580, 1.0, 960, 600, 1.14),
		'122': C(960, 620, 1.3, 940, 620, 1.42),
		'132': C(940, 640, 1.2, 900, 660, 1.34),
		'133': C(650, 640, 1.3, 645, 640, 1.38),
		'134': C(900, 650, 1.18, 890, 630, 1.26),
		'146': C(900, 610, 1.14, 890, 605, 1.22),
		'147': C(960, 600, 1.04, 960, 600, 1.1),
		'157': C(960, 620, 1.3, 960, 610, 1.46),
		'165': C(560, 620, 1.3, 540, 615, 1.44),
		'177': C(960, 520, 1.0, 960, 480, 1.08),
		'187': C(960, 600, 1.16, 960, 590, 1.28),
		'188': C(960, 600, 1.2, 960, 590, 1.0),
	};
	const preSp: Record<string, CamPair> = {LEV: C(470, 620, 1.5, 465, 615, 1.58), ZAKHAR: C(1370, 620, 1.5, 1375, 615, 1.58)};
	if (sp !== 'N' && !table[id]) table[id] = pre ? preSp[sp] : bySp[sp];
	const cam = useLineCam(table, cyc);

	let lx = 800;
	let zx = 1120;
	let lp: Pose = chess ? sit(gf, 1) : idle(gf, 1);
	let zp: Pose = chess ? sit(gf, 2) : idle(gf, 2);
	let lex: Ex = 'normal';
	let zex: Ex = 'normal';
	let lseat: number | undefined = chess ? 737 : undefined;
	let zseat: number | undefined = chess ? 737 : undefined;
	let lblink: number | undefined;
	let gloves = box || brk || (pre && n >= 118) || n === 184;
	let helm = box || brk;
	let sl = 0;
	let fx: React.ReactNode = null;
	let lrot = 0;
	let crowdUp = 0;
	let tableOn = chess || pre || n === 188;
	let lItem: React.ReactNode;
	let zItem: React.ReactNode;
	let px = 400;
	let pp: Pose = gesture('armsCrossed', idle(gf, 4), 1, gf);
	let ap: Pose = reach(reach(sit(gf, 5), 'F', [56, -74], 1), 'B', [44, -70], 1);
	let needles = true;
	let refOn = box || n === 122 || n === 147 || n === 187;
	let rx = 1330;
	let rp: Pose = idle(gf, 8);

	if (pre) {
		// both walk in from the sides and freeze at the sight of the ring with a table in it
		const wl = walkTo(t('108'), 0, 60, 300, 540, 1, 0.3);
		const wz = walkTo(t('108'), 6, 66, 1540, 1300, 2, 0.3);
		lx = n === 108 ? wl.x : 540;
		zx = n === 108 ? wz.x : 1300;
		lp = n === 108 ? wl.pose : idle(gf, 1);
		zp = n === 108 ? wz.pose : idle(gf, 2);
		if (n === 109) {
			zp = gesture('scratch', zp, 1, gf);
			zex = 'worried';
		}
		if (n === 110) lex = 'worried';
		if (n === 113) zp = reach(zp, 'F', [80, -60], 1);
		if (n === 114) lp = reach(lp, 'F', [-60, -120], 1);
		if (n === 120) {
			lex = 'sad';
			helm = true;
		}
		if (n === 121) {
			zx = 1200;
			zp = reach(zp, 'F', [90, -40], 1);
		}
		if (n === 122) {
			rx = 700;
			rp = reach(idle(gf, 8), 'F', [-90, -110], k01(T, 10, 12));
			fx = (
				<g transform={`translate(${610},${FL - 157 - 130}) scale(${k01(T, 16, 10) * 1.4})`}>
					<path d="M-16,28 C-14,6 -8,0 -8,-8 L8,-8 C8,0 14,6 16,28 Z" fill="#fffaf0" stroke="#1b1e2a" strokeWidth={5} />
					<circle cx={0} cy={-18} r={15} fill="#fffaf0" stroke="#1b1e2a" strokeWidth={5} />
				</g>
			);
		}
		px = 120;
	}
	if (chess && !after) {
		const think = gesture('rubChin', sit(gf, 1), 1, gf);
		if (n === 124) ap = reach(sit(gf, 5), 'F', [70, -120], 1);
		if (n === 125) lp = think;
		if (n === 130) {
			lp = sitReach(gf, 1, 1, [96 + Math.sin(gf * 1.7) * 7, -58 + Math.cos(gf * 2.1) * 6]);
			lex = 'worried';
		}
		if (n === 131) zp = reach(sitReach(gf, 1, 2, [96, -58]), 'B', [40, -130], 1);
		if (n === 137) {
			zp = sitReach(gf, 1, 2, [100, -70]);
			zex = 'wide';
		}
		if (n === 138) needles = true;
		if (n === 140) {
			needles = false;
			ap = {...sit(gf, 5), armF: [30, 60], armB: [24, 60], lean: 8};
		}
		if (n >= 136 && n <= 155 && n !== 137) lex = 'worried';
		if (n === 147) {
			lp = think;
			rx = 1310;
			rp = reach(idle(gf, 8), 'F', [20, -210], k01(T, D * 0.5, 10));
			fx = <Cloud x={960} y={410} t={T - D - 2} lines={['ПРЕДУПРЕЖДЕНИЕ', 'ЗА ЗАТЯГИВАНИЕ']} size={54} fill="#ffe3ef" stroke="#8a2a1c" ink="#3a120c" tail={[300, 110]} />;
		}
		if (n === 149) zp = {...zp, head: -8};
		if (n === 151) zp = sitReach(gf, 1, 2, [90 + Math.sin(gf / 6) * 8, -60]);
		if (n === 153) lex = 'wide';
		if (n === 154) zp = reach(zp, 'F', [-40, -150], 1);
		if (n === 155) lp = reach(reach(sit(gf, 1), 'F', [50, -150], 1), 'B', [40, -140], 1);
		if (n === 168) {
			const br = Math.sin((T / D) * Math.PI * 6);
			lp = {...sit(gf, 1), lean: -6 - br * 4, armF: [20, 50], armB: [14, 50]};
			lblink = 1;
			pp = gesture('handsOnHead', idle(gf, 4), k01(T, D * 0.5, 10), gf);
		}
		if (n === 171) {
			zp = gesture('scratch', sit(gf, 2), 1, gf);
			zex = 'worried';
		}
		if (n === 172) zp = sitReach(gf, 1, 2, [104, -62]);
		if (n === 173) {
			needles = false;
			ap = gesture('facepalm', sit(gf, 5), 1, gf);
		}
		if (n === 177) {
			crowdUp = k01(T, D * 0.45, 12);
			zp = sitReach(gf, 1, 2, [100, -100]);
			zex = 'wide';
		}
		if (n === 180) pp = reach(idle(gf, 4), 'F', [20, -220 + k01(T, 8, 14) * 90], 1);
	}
	if (n >= 181 && n <= 183) {
		zp = n === 181 ? sitReach(gf, k01(T, 10, 12), 2, [104, -60]) : reach(sit(gf, 2), 'F', [70, -110], 1);
		if (n === 182) zItem = <Phone />;
		zex = 'normal';
	}
	if (box) {
		const g1 = guardP(gf, 1, 0.9);
		const g2 = guardP(gf, 2, 1);
		lp = g1;
		zp = g2;
		lx = 760;
		zx = 1060;
		const body = (k: number) => jab(g2, k, -84);
		if (r!.n === 2) {
			// Zakhar goes forward, Lev steps off the line
			const cyc3 = (T % 44) / 44;
			const pk = env(cyc3, 0.3, 0.45, 0.1, 0.15);
			zp = body(pk);
			lx = 760 - pk * 110 - (n >= 127 ? 60 : 0);
			zx = 1060 - (n >= 127 ? 60 : 0) + pk * 20;
			if (n === 128) {
				zx = 1240;
				zp = reach(idle(gf, 2), 'F', [90, -150], 1);
				lx = 640;
				zex = 'angry';
			}
			if (n === 129) {
				const jk = env(T, 16, 22, 4, 8);
				sl = env(T, Math.round(D * 0.3), Math.round(D * 0.62), 6, 10);
				lp = sl > 0.02 ? slap(idle(gf, 1), sl) : jab(g1, jk);
				zp = g2;
				lx = 800;
				zx = 1080;
				rp = gesture('shrug', idle(gf, 8), k01(T, D * 0.6, 10), gf);
				pp = gesture('shrug', idle(gf, 4), k01(T, D * 0.75, 10), gf);
			}
		}
		if (r!.n === 4) {
			const hit = n === 132 ? env(T, D * 0.4, D * 0.4 + 6, 4, 8) : 0;
			const down = n === 132 ? k01(T, D * 0.4 + 4, 10) : n === 133 ? 1 : n === 134 ? 1 - k01(T, D * 0.62, 12) : 0;
			zp = n === 132 ? body(hit) : g2;
			lx = 860;
			zx = n === 132 ? 1080 : n === 133 ? 1420 : 1260;
			if (down > 0.02) {
				lp = sitFloor(gf, 1);
				lseat = FL - 157 + down * 120;
				lex = 'sad';
			}
			if (n === 132) fx = <Cloud x={1180} y={300} t={T - D - 2} lines={['РАЗ… ДВА… ТРИ…']} size={58} tail={[0, 150]} />;
			if (n === 134) fx = T > D * 0.56 ? <Cloud x={1180} y={300} t={T - Math.round(D * 0.56)} lines={['ВОСЕМЬ']} size={64} tail={[0, 150]} /> : null;
			if (n === 133) pp = {...idle(gf, 4), armF: [150, 20], armB: [-150, 20]};
			if (n === 135) {
				rp = reach(idle(gf, 8), 'F', [-90, -90], 1);
				lx = 860;
				zx = 1240;
			}
			rx = n === 135 ? 1000 : 1250;
			if (n === 132 || n === 134) rp = reach(idle(gf, 8), 'F', [-70, -150 + Math.sin(gf / 5) * 20], 1);
		}
		if (r!.n === 6 || r!.n === 8) {
			const pk = Math.max(0, Math.sin(gf / 3.2)) ** 2 * 0.8;
			zp = n === 141 ? {...g2, armF: [20, 30], armB: [10, 30]} : body(pk);
			lx = 800 - Math.sin(gf / 20) * 20;
			zx = 1010 + Math.sin(gf / 26) * 30;
			lp = {...g1, lean: -6 + Math.sin(gf / 7) * 4};
			lex = 'worried';
			if (n === 146) pp = reach(idle(gf, 4), 'F', [80, -150], 1);
			rx = 1300;
		}
		if (r!.n === 10) {
			if (n === 156) {
				lx = 760;
				zx = 1160;
				lp = {...idle(gf, 1), head: -10};
			} else {
				// the clinch: Lev hangs on Zakhar and shuts his eyes
				const k = n === 157 ? k01(T, D * 0.3, 16) : 1;
				lx = lerp(760, 930, k);
				zx = 1030;
				lp = reach(reach({...idle(gf, 1), lean: 14 * k}, 'F', [96, -110], k), 'B', [90, -84], k);
				zp = n === 163 ? reach(reach(idle(gf, 2), 'F', [60, -150 + Math.sin(gf / 2) * 14], 1), 'B', [50, -70], 1) : {...idle(gf, 2), armF: [60, 60], armB: [-50, 50], lean: -6};
				lblink = k > 0.9 ? 1 : undefined;
				zex = 'worried';
				rx = 1320;
				if (n === 158) fx = <Cloud x={960} y={250} t={T - 10} lines={['БОКС ДАВАЙ!']} size={62} />;
			}
		}
	}
	if (brk) {
		// the minute of rest: Lev on a stool in his corner, eyes shut, Palych with a towel
		lx = 470;
		lp = {...sit(gf, 1), armF: [20, 50], armB: [14, 50]};
		lseat = 737;
		lblink = 1;
		zx = 1500;
		zp = sit(gf, 2);
		zseat = 737;
		px = 250;
		pp = reach(idle(gf, 4), 'F', [70, -150 + Math.sin(gf / 3) * 26], 1);
		refOn = false;
		const aK = k01(t('165'), d('165') * 0.6, 14);
		fx = (
			<g opacity={aK}>
				{[0, 1, 2].map((i) => (
					<g key={i} transform={`translate(${390 + i * 90},${470})`}>
						<circle r={34} fill={NAVY} stroke={GOLD} strokeWidth={5} />
						<text x={0} y={18} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
							{i + 1}
						</text>
					</g>
				))}
			</g>
		);
	}
	if (after) {
		tableOn = n === 188;
		lx = 860;
		zx = 1060;
		lp = idle(gf, 1);
		zp = idle(gf, 2);
		if (n === 185 || n === 186) {
			const k = n === 185 ? k01(T, 4, 12) : 1;
			zp = reach(zp, 'F', [100, -70 + (n === 186 ? Math.sin(gf / 2.6) * 6 : 0)], k);
			if (n === 186) lp = reach(lp, 'F', [100, -70 + Math.sin(gf / 2.6) * 6], 1);
		}
		if (n === 187) {
			rx = 720;
			lx = 860;
			zx = 1010;
			rp = reach(idle(gf, 8), 'F', [100, -210], 1);
			lp = reach(reach(idle(gf, 1), 'B', [-40, -230], 1), 'F', [110, -220], k01(T, D * 0.55, 12));
			zp = reach(idle(gf, 2), 'F', [-30, -230], k01(T, D * 0.55, 12));
			crowdUp = 1;
			fx = <Plate x={960} y={250} lines={['МАТ. РАУНД 11']} sub="ПОБЕДИЛ ЛЕВ АРСКИЙ" size={70} k={k01(T, 8, 12)} />;
		}
		if (n === 186) crowdUp = 0.6;
	}
	const show = n !== 188;
	const lhip = lseat ?? FL - 157;
	const zhip = zseat ?? FL - 157;
	const lh = headXY(lp, lx, 1, 1, FL, lhip);
	const zh = headXY(zp, zx, 1, -1, FL, zhip);
	const air = n >= 142 && n <= 143 ? 1 - 0.6 * p01((gf - st('142')) / Math.max(1, en('143') - st('142'))) : 0;
	return (
		<Stage cam={cam} bg="#0d1028" light={{night: true, o: 0.34}} dust="#aebcff">
			<Layer depth={1.6}>
				<Svg>
					<Arena f={gf} crowdUp={crowdUp} />
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
					{show && n >= 123 ? <Stool x={1520} /> : null}
					{show && n >= 123 ? <Actor who="ada" x={1520} seat={742} facing={-1} pose={ap} look={[0.6, 0.2]} handItem={needles ? <Needles f={gf} /> : undefined} uid="adaA" /> : null}
					{show && n >= 123 ? <Actor who="palych" x={px} facing={1} pose={pp} look={[0.7, 0]} uid="palA" /> : null}
					{chess || brk ? <Stool x={lx} /> : null}
					{chess || brk ? <Stool x={zx} /> : null}
					{refOn && show ? <Actor who="ref" x={rx} facing={rx > 1000 ? -1 : 1} pose={rp} look={[0.6, 0]} uid="refA" /> : null}
					{show ? (
						<g transform={lrot ? `rotate(${lrot} ${lx} ${FL})` : undefined}>
							<Actor who="lev" x={lx} seat={lseat} facing={1} outfit="tee" glove={gloves ? GL_L : undefined} pose={lp} expr={lex} look={[0.7, 0]} blink={lblink} handItem={lItem} uid="levA" />
							{helm ? <Helmet at={lh} c={GL_L} facing={1} /> : null}
						</g>
					) : null}
					{show ? (
						<>
							<Actor who="zakhar" x={zx} seat={zseat} facing={-1} glove={gloves ? GL_Z : undefined} pose={zp} expr={zex} look={[0.7, 0]} handItem={zItem} uid="zakA" />
							{helm ? <Helmet at={zh} c={GL_Z} facing={-1} /> : null}
						</>
					) : null}
					<GhostClock x={lx + 88} y={FL - 157 - 46} k={sl} />
					{tableOn ? <ChessTable x={960} seed="fin" clock /> : null}
					{air > 0 ? (
						<g transform={`translate(${lx - 120},${lh[1] - 150})`}>
							<rect x={-20} y={-26} width={280} height={92} rx={16} fill={NAVY} stroke="#8fd3ff" strokeWidth={5} />
							<rect x={-6} y={42} width={252 * air} height={14} rx={7} fill="#8fd3ff" />
							<text x={120} y={26} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={800} fill="#fff">
								ВОЗДУХ
							</text>
						</g>
					) : null}
					{fx}
				</Svg>
			</Layer>
			{pre || after ? (
				<Hud>
					<DayPlate day={30} since={n === 108 ? T - 6 : 99} />
				</Hud>
			) : (
				<MatchHud />
			)}
		</Stage>
	);
};

/* ------------------------------------------------------------ the board from above during the match */
const R5 = 'r4rk1/ppp2ppp/1q3n2/8/4R3/1Q3N2/PPP2PPP/R5K1';
const R7 = 'r4rk1/ppp2ppp/1q6/8/2Q5/5N2/PPP2PPP/4R1K1';
export const PRE = 'r4rk1/ppp2Npp/1q3p2/8/2Q5/8/PPP2PPP/4R1K1';
const D7 = 'rnbq1rk1/ppp1bppp/3p1n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1';
export const FinalBoard: React.FC = () => {
	const {gf} = useShot();
	const {t, d, id} = useT();
	const n = Number(id);
	const T = t(id);
	const D = d(id);
	let ps: Piece[] = fen(PRE);
	let boxK = 0;
	let boxC = GOLD;
	let marks: {f: number; r: number; c: string; o?: number}[] | undefined;
	let shake = 0;
	let note: React.ReactNode = null;
	let blur = 0;
	if (n === 123) {
		ps = fen(D7);
		boxK = k01(T, D * 0.45, 20);
	}
	if (n === 136 || n === 139) {
		const mv: Move[] = n === 139 ? [[st('139') + 10, 'f6e4', 12]] : [];
		ps = boardAt(fen(R5), mv, gf);
		marks = n === 136 ? [{f: 4, r: 3, c: '#ff5a4a', o: 0.35 + 0.3 * Math.abs(Math.sin(gf / 5)) * k01(T, D * 0.6, 10)}] : undefined;
		blur = n === 136 ? 1 : 0;
		if (n === 139) note = <Plate x={1500} y={600} lines={['+ ЛАДЬЯ']} sub="У ЗАХАРА" size={72} c="#ff7a5c" k={k01(T, 26, 10)} />;
	}
	if (n === 144) {
		ps = boardAt(fen(R7), [[st('144') + Math.round(D * 0.6), 'f7f6', 12]], gf);
		boxK = 1;
	}
	if (n === 161 || n === 162) {
		boxK = 1;
		const red = n === 162 ? 1 : k01(T, D * 0.5, 30);
		boxC = red > 0.5 ? '#ff5a4a' : GOLD;
	}
	if (n >= 169 && n <= 176) {
		const mv: Move[] = [
			[st('169') + 4, 'f7h6', 10],
			[en('169') + 12, 'g8h8', 10],
			[st('170') + 4, 'c4g8', 10],
			[st('172') + 6, 'f8g8', 10],
			[st('175') + 4, 'h6f7', 10],
		];
		ps = boardAt(fen(PRE), mv, gf);
		boxK = 1;
		boxC = gf >= st('172') + 16 ? '#ff5a4a' : GOLD;
		if (gf >= st('169') + 14 && gf < en('169') + 12) marks = [{f: 6, r: 7, c: '#ff5a4a'}];
		if (gf >= st('170') + 14 && gf < st('172') + 6) marks = [{f: 7, r: 7, c: '#ff5a4a'}];
		if (gf >= st('175') + 14) marks = [{f: 7, r: 7, c: '#ff5a4a', o: 0.5 + 0.3 * Math.sin(gf / 4)}];
		shake = [st('170') + 14, st('175') + 14].map((x) => (gf >= x ? Math.exp(-(gf - x) / 4) : 0)).reduce((a, b) => a + b, 0);
		const word = n === 169 ? 'РАЗ' : n === 170 || n === 171 || n === 172 || n === 174 ? 'ДВА' : 'ТРИ';
		note = <Plate x={1500} y={620} lines={[n === 176 ? 'МАТ' : word]} size={n === 176 ? 130 : 110} c={n === 176 ? '#ff5a4a' : GOLD} k={1} />;
	}
	const head = n === 161 || n === 162;
	const cam = usePushK(camOn(960, 560, 1.0), n === 123 || head || n >= 174 ? camOn(1000, 520, 1.1) : camOn(980, 550, 1.06));
	// flashbacks over the board in the head (161: the gap after the line)
	const fb = n === 161 ? T - D : -1;
	return (
		<Stage cam={cam} bg={head ? '#101a44' : '#143a2c'} light={{x: 60, y: 0, o: 0.3}}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-200} width={2720} height={1500} fill={head ? '#101a44' : '#143a2c'} />
					<ellipse cx={960} cy={540} rx={1100} ry={640} fill={head ? '#182a66' : '#1c5240'} />
					<g style={blur ? {filter: `blur(${1.5 + Math.sin(gf / 7) * 1.5}px)`} : undefined}>
						<BoardTop x={800} y={590} S={88} pieces={ps} box={BOX} boxK={boxK} boxC={boxC} marks={marks} shake={Math.sin(gf * 2.3) * 8 * shake} />
					</g>
					{note}
					{head ? <Plate x={1500} y={420} lines={['В ГОЛОВЕ', 'ЛЬВА']} size={62} c="#8fd3ff" k={1} /> : null}
					{n === 162 ? (
						<g opacity={k01(T, 10, 16)}>
							<path d="M1118,206 L1118,600 M1118,206 L760,206" stroke="#e9eef5" strokeWidth={16} strokeLinecap="round" />
							<rect x={1096} y={184} width={44} height={44} rx={8} fill="#d9372b" stroke="#1b1e2a" strokeWidth={5} />
						</g>
					) : null}
					{fb >= 0 && fb < 50 ? <Cloud x={1420} y={760} t={fb} hold={46} lines={['ЕЁ ГОТОВЯТ', 'В УГЛУ']} label="ПАЛЫЧ, ДЕНЬ 15" size={54} fill={CREAM} stroke="#2f7d45" ink="#12301c" /> : null}
					{fb >= 52 ? <Cloud x={1420} y={760} t={fb - 52} lines={['В УГЛУ ДОБИВАЮТ.', 'ВЫХОДА ТАМ НЕТ.']} label="ЗАХАР, ДЕНЬ 15" size={50} fill="#ffe3ef" stroke="#8a2a1c" ink="#3a120c" /> : null}
				</Svg>
			</Layer>
			<MatchHud />
		</Stage>
	);
};

/* ------------------------------------------------------------ cards of part 7 and 9 */
const Row: React.FC<{y: number; text: string; k: number; c?: string; size?: number; icon?: React.ReactNode}> = ({y, text, k, c = GOLD, size = 78, icon}) => {
	const w = tw(text, size) + 120 + (icon ? 90 : 0);
	return (
		<g transform={`translate(${960 - (1 - k) * 80},${y})`} opacity={k}>
			<rect x={-w / 2} y={-size * 0.86} width={w} height={size * 1.72} rx={24} fill={NAVY} stroke={c} strokeWidth={5} />
			{icon ? <g transform={`translate(${-w / 2 + 70},0)`}>{icon}</g> : null}
			<text x={icon ? 45 : 0} y={size * 0.35} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill="#fff">
				{text}
			</text>
		</g>
	);
};
const Glove: React.FC<{c?: string}> = ({c = '#d9372b'}) => (
	<g>
		<rect x={-22} y={-26} width={44} height={52} rx={20} fill={c} stroke="#0b0d1e" strokeWidth={5} />
		<rect x={-18} y={22} width={36} height={16} rx={5} fill="#fff" stroke="#0b0d1e" strokeWidth={4} />
	</g>
);
const Pawn: React.FC = () => (
	<g>
		<path d="M-16,28 C-14,6 -8,0 -8,-8 L8,-8 C8,0 14,6 16,28 Z" fill="#fffaf0" stroke="#1b1e2a" strokeWidth={5} />
		<circle cx={0} cy={-18} r={15} fill="#fffaf0" stroke="#1b1e2a" strokeWidth={5} />
	</g>
);
export const RuleCards: React.FC = () => {
	const {t, d, id} = useT();
	const T = t(id);
	const D = d(id);
	const k = k01(T, 0, 12);
	const at = (u: number) => k01(T, Math.round(D * u), 12);
	if (id === '111')
		return (
			<Board tint="#2a1f55">
				<FactHead title="ШАХБОКС" year="1992 → 2003" k={k} />
				<Row y={470} text="1992: КОМИКС ЭНКИ БИЛАЛА" k={at(0.25)} />
				<Row y={650} text="2003: ПЕРВЫЙ НАСТОЯЩИЙ БОЙ" k={at(0.62)} c="#ff7a5c" />
				<Row y={830} text="ЕГО ПРОВЁЛ ИПЕ РУБИНГ" k={at(0.78)} c="#ff7a5c" size={70} />
			</Board>
		);
	if (id === '112')
		return (
			<Board tint="#1a2150">
				<FactHead title="11 РАУНДОВ" year="6 + 5" k={k} />
				{Array.from({length: 11}).map((_, i) => {
					const kk = k01(T, 14 + i * Math.max(3, Math.round((D * 0.6) / 11)), 8);
					const chess = i % 2 === 0;
					return (
						<g key={i} transform={`translate(${200 + i * 152},${560 - (1 - kk) * 60})`} opacity={kk}>
							<rect x={-66} y={-90} width={132} height={180} rx={18} fill={chess ? '#ecd9b0' : '#8a2a1c'} stroke="#1b1e2a" strokeWidth={6} />
							<g transform="translate(0,-14) scale(1.5)">{chess ? <Pawn /> : <Glove c="#ffd34a" />}</g>
							<text x={0} y={76} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill={chess ? '#1b1e2a' : '#fff'}>
								{i + 1}
							</text>
						</g>
					);
				})}
				<Row y={860} text="ОДНА ПАРТИЯ НА ВЕСЬ МАТЧ" k={at(0.78)} size={72} />
			</Board>
		);
	if (id === '115')
		return (
			<Board tint="#143a2c">
				<FactHead title="ПО ДЕЙСТВУЮЩИМ ПРАВИЛАМ" year="" k={k} />
				<Row y={430} text="РАУНД — 3 МИНУТЫ" k={at(0.2)} />
				<Row y={600} text="ПЕРЕРЫВ — 1 МИНУТА" k={at(0.42)} c="#9fb0d8" />
				<g opacity={at(0.62)}>
					<Clocks x={960} y={850} lev={540} zak={540} s={1.1} />
				</g>
			</Board>
		);
	if (id === '116')
		return (
			<Board tint="#1a2150">
				<FactHead title="КАК ПОБЕДИТЬ" year="" k={k} />
				{['НОКАУТ', 'МАТ', 'ВРЕМЯ', 'СДАЧА'].map((s, i) => (
					<g key={s} transform={`translate(${330 + i * 420},470)`} opacity={at(0.05 + i * 0.13)}>
						<rect x={-180} y={-80} width={360} height={160} rx={26} fill={NAVY} stroke={GOLD} strokeWidth={5} />
						<text x={0} y={24} textAnchor="middle" fontSize={66} fontFamily={FONT} fontWeight={900} fill="#fff">
							{s}
						</text>
					</g>
				))}
				<Row y={780} text="НИЧЬЯ НА ДОСКЕ → ОЧКИ В БОКСЕ" k={at(0.72)} c="#ff7a5c" size={70} />
			</Board>
		);
	if (id === '117')
		return (
			<Board tint="#3a1d2a">
				<FactHead title="ТЯНУТЬ ВРЕМЯ НЕЛЬЗЯ" year="" k={k} />
				<Row y={480} text="ЗА ДОСКОЙ И В РИНГЕ" k={at(0.2)} c="#9fb0d8" />
				<Row y={660} text="СНАЧАЛА — ПРЕДУПРЕЖДЕНИЯ" k={at(0.5)} />
				<Row y={840} text="ПОТОМ — СНИМАЮТ" k={at(0.75)} c="#ff5a4a" />
			</Board>
		);
	if (id === '118')
		return (
			<Board tint="#2a1f55">
				<FactHead title="ПОКАЗАТЕЛЬНЫЙ БОЙ" year="" k={k} />
				<Row y={470} text="ШЛЕМЫ" k={at(0.42)} />
				<Row y={640} text="БОЛЬШИЕ ПЕРЧАТКИ" k={at(0.56)} icon={<Glove />} />
				<Row y={810} text="УДАРЫ В ГОЛОВУ ЗАПРЕЩЕНЫ" k={at(0.7)} c="#ff5a4a" />
			</Board>
		);
	if (id === '119')
		return (
			<Board tint="#1a2150">
				<FactHead title="ПРОФЕССИОНАЛЬНАЯ ЛИГА" year="" k={k} />
				<Row y={450} text="РЕЙТИНГ ОТ 1600" k={at(0.2)} />
				<Row y={620} text="50 ЛЮБИТЕЛЬСКИХ БОЁВ" k={at(0.42)} />
				<Row y={830} text="У ЭТИХ ДВОИХ — 30 ДНЕЙ" k={at(0.74)} c="#ff5a4a" size={84} />
			</Board>
		);
	if (id === '150')
		return (
			<Board tint="#143a2c">
				<g opacity={k}>
					<rect x={150} y={250} width={760} height={620} rx={30} fill={NAVY} stroke="#9fb0d8" strokeWidth={6} />
					<text x={530} y={350} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#9fb0d8">
						ДЕНЬ 1
					</text>
					<g transform="translate(530,600) scale(4.2)">
						<path d="M-22,28 L-30,-24 L-14,-6 L-8,-34 L0,-8 L8,-34 L14,-6 L30,-24 L22,28 Z" fill="#fffaf0" stroke="#1b1e2a" strokeWidth={4} strokeLinejoin="round" />
					</g>
					<text x={530} y={832} textAnchor="middle" fontSize={66} fontFamily={FONT} fontWeight={900} fill="#fff">
						БИЛ ФЕРЗЁМ
					</text>
				</g>
				<g opacity={at(0.45)}>
					<rect x={1010} y={250} width={760} height={620} rx={30} fill={NAVY} stroke={GOLD} strokeWidth={6} />
					<text x={1390} y={350} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill={GOLD}>
						ДЕНЬ 30
					</text>
					<circle cx={1390} cy={590} r={140} fill="#fffaf0" stroke="#1b1e2a" strokeWidth={10} />
					<rect x={1382} y={480} width={16} height={116} rx={8} fill="#1b1e2a" transform={`rotate(${T * 6} 1390 590)`} />
					<text x={1390} y={832} textAnchor="middle" fontSize={66} fontFamily={FONT} fontWeight={900} fill="#fff">
						БЬЁТ ЧАСАМИ
					</text>
				</g>
			</Board>
		);
	// 152: the judges' cards
	return (
		<Board tint="#3a1d2a">
			<FactHead title="ОЧКИ В БОКСЕ" year="" k={k} />
			{[0, 1, 2].map((i) => (
				<g key={i} transform={`translate(${460 + i * 500},${620 - (1 - at(0.2 + i * 0.15)) * 60}) rotate(${(i - 1) * 4})`} opacity={at(0.2 + i * 0.15)}>
					<rect x={-200} y={-230} width={400} height={460} rx={20} fill="#fffaf0" stroke="#1b1e2a" strokeWidth={7} />
					<text x={0} y={-130} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#1b1e2a">
						СУДЬЯ {i + 1}
					</text>
					<text x={0} y={36} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill="#d9372b">
						ЗАХАР
					</text>
					<text x={0} y={160} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#1b1e2a">
						ВПЕРЕДИ
					</text>
				</g>
			))}
		</Board>
	);
};

/* 148: Lev looks up at the clocks: 0:40 against 2:20; in the gap the boy's flag flashes back */
const ClockLook: React.FC = () => {
	const {t, d} = useT();
	const T = t('148');
	const fb = T - d('148');
	const cam = usePushK(camOn(960, 540, 0.96), camOn(960, 540, 1.08));
	return (
		<Stage cam={cam} bg="#0d1028" light={{night: true, o: 0.3}}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-200} width={2720} height={1500} fill="#0d1028" />
					{fb < 0 ? <Clocks x={960} y={430} lev={40} zak={140} s={2.2} run="lev" /> : null}
					{fb >= 0 ? (
						<g opacity={interpolate(fb, [0, 6], [0, 1], clamp)}>
							<rect x={-400} y={-200} width={2720} height={1500} fill="#3a2f1c" />
							<Actor who="tim" x={760} floor={900} s={1.5} facing={1} pose={reach(idle(fb, 3), 'F', [110, -90], 1)} look={[0.8, -0.2]} uid="timfb" shadow={false} />
							<Cloud x={1200} y={440} t={fb - 4} lines={['ДЯДЯ, У ВАС', 'ФЛАЖОК УПАЛ']} label="ДЕНЬ 25" size={64} tail={[-300, 150]} />
							<polygon points="1010,860 1010,760 1110,810" fill="#ff4b3a" stroke="#0b0d1e" strokeWidth={6} transform="rotate(70 1010 860)" />
						</g>
					) : null}
				</Svg>
			</Layer>
			{fb < 0 ? <MatchHud clocks={false} /> : null}
		</Stage>
	);
};

export const SHOTS3: ShotDef[] = [
	...mk(['108', '109', '110'], ArenaScene, true),
	...mk(['111', '112'], RuleCards),
	...mk(['113', '114'], ArenaScene),
	...mk(['115', '116', '117', '118', '119'], RuleCards),
	...mk(['120', '121', '122'], ArenaScene),
	...mk(['123'], FinalBoard),
	...mk(['124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135'], ArenaScene),
	...mk(['136'], FinalBoard),
	...mk(['137', '138'], ArenaScene),
	...mk(['139'], FinalBoard),
	...mk(['140', '141', '142', '143'], ArenaScene),
	...mk(['144'], FinalBoard),
	...mk(['145', '146', '147'], ArenaScene),
	...mk(['148'], ClockLook),
	...mk(['149'], ArenaScene),
	...mk(['150'], RuleCards),
	...mk(['151'], ArenaScene),
	...mk(['152'], RuleCards),
	...mk(['153', '154', '155'], ArenaScene),
];
