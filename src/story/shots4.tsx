import React from 'react';
import {Layer, Svg} from '../engine/camera';
import {idle} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn, Stage} from '../kit/kit';
import {Board, FONT} from '../kit/ui';
import {GL_L, GL_Z} from './cast';
import {BoardTop, fen, GOLD, guardP, Hud, jab, k01, NAVY, usePushK, useT} from './lib';
import {FactHead} from './places';
import {Teaser} from './shots1';
import {BOX} from './shots2';
import {ArenaScene, FinalBoard, MatchHud, PRE} from './shots3';

/* Parts 10–12 (lines 156–190): the corner, the mate, after the match. */
const mk = (ids: string[], Cmp: React.FC, whipFirst = false): ShotDef[] => ids.map((at, i) => ({at, C: Cmp, whip: whipFirst && i === 0}));
const QUEEN = 'M-22,28 L-30,-24 L-14,-6 L-8,-34 L0,-8 L8,-34 L14,-6 L30,-24 L22,28 Z';

/* 160: Gareyev, 2016: 48 boards blindfold. 47 go out, one stays. */
const GareevCard: React.FC = () => {
	const {t, d} = useT();
	const T = t('160');
	const k = k01(T, 0, 12);
	const out = k01(T, Math.round(d('160') * 0.72), 24);
	return (
		<Board tint="#101a44">
			<FactHead title="ТИМУР ГАРЕЕВ" year="2016" k={k} />
			{Array.from({length: 48}).map((_, i) => {
				const kk = k01(T, 10 + i * 1.2, 8);
				const keep = i === 29;
				return (
					<g key={i} transform={`translate(${260 + (i % 12) * 127},${400 + Math.floor(i / 12) * 127})`} opacity={kk * (keep ? 1 : 1 - out * 0.88)}>
						<rect x={-50} y={-50} width={100} height={100} rx={8} fill={keep && out > 0.5 ? GOLD : '#ecd9b0'} stroke="#1b1e2a" strokeWidth={5} />
						{[0, 1, 2, 3].map((q) => (
							<rect key={q} x={-50 + (q % 2) * 50 + (q > 1 ? 0 : 0)} y={-50 + (q > 1 ? 50 : 0)} width={50} height={50} fill="#b9854f" opacity={(q + (q > 1 ? 1 : 0)) % 2 ? 0.9 : 0} />
						))}
					</g>
				);
			})}
			<g opacity={k01(T, 30, 12)}>
				<rect x={420} y={880} width={1080} height={112} rx={24} fill={NAVY} stroke={GOLD} strokeWidth={5} />
				<text x={960} y={958} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
					48 ПАРТИЙ ВСЛЕПУЮ СРАЗУ
				</text>
			</g>
		</Board>
	);
};
/* 178: the smothered mate, described back in 1497 */
const OldCard: React.FC = () => {
	const {t} = useT();
	const T = t('178');
	const k = k01(T, 0, 12);
	return (
		<Board tint="#3a2a1c">
			<FactHead title="СПЁРТЫЙ МАТ" year="1497" k={k} />
			<g opacity={k} transform="translate(960,640)">
				<rect x={-560} y={-330} width={1120} height={660} rx={14} fill="#e8d8b0" stroke="#5a3a22" strokeWidth={10} />
				<line x1={0} y1={-330} x2={0} y2={330} stroke="#5a3a22" strokeWidth={6} />
				{Array.from({length: 9}).map((_, i) => (
					<rect key={i} x={-500} y={-270 + i * 62} width={i % 3 === 2 ? 300 : 420} height={16} rx={6} fill="#8a6a44" opacity={0.6} />
				))}
				<g transform="translate(280,0) scale(0.62)">
					<BoardTop x={0} y={0} S={104} pieces={fen('6rk/5Npp/8/8/8/8/8/6K1')} box={BOX} boxC="#b3261e" boxK={k01(T, 30, 30)} />
				</g>
			</g>
		</Board>
	);
};
/* 179: the frame from the hook: the hand lands on a real clock at 0:04, the question mark flies off */
const Press: React.FC = () => {
	const {t, d} = useT();
	const T = t('179');
	const pressAt = Math.round(d('179') * 0.5);
	const press = k01(T, pressAt - 22, 22);
	const cam = usePushK(camOn(960, 560, 1.0), camOn(1010, 550, 1.07));
	return (
		<Stage cam={cam} bg="#143a2c" light={{x: 60, y: 10, o: 0.3}}>
			<Layer depth={1}>
				<Svg>
					<Teaser lev={T < pressAt - 10 ? 5 : 4} zak={90} press={press} reveal={k01(T, pressAt + 6, 18)} freeze={T - pressAt} />
				</Svg>
			</Layer>
			<MatchHud clocks={false} />
		</Stage>
	);
};
/* 183: day 1: the queen lost into the box; today: the queen given away */
const QueensCard: React.FC = () => {
	const {t, d} = useT();
	const T = t('183');
	const k = k01(T, 0, 12);
	const b = k01(T, Math.round(d('183') * 0.45), 12);
	const half = (x: number, title: string, sub: string, c: string, kk: number, lost: boolean) => (
		<g opacity={kk}>
			<rect x={x} y={230} width={760} height={680} rx={30} fill={NAVY} stroke={c} strokeWidth={6} />
			<text x={x + 380} y={330} textAnchor="middle" fontSize={68} fontFamily={FONT} fontWeight={900} fill={c}>
				{title}
			</text>
			<g transform={`translate(${x + 380},${590}) rotate(${lost ? 70 : 0}) scale(4.4)`}>
				<path d={QUEEN} fill="#fffaf0" stroke="#1b1e2a" strokeWidth={4} strokeLinejoin="round" />
			</g>
			<text x={x + 380} y={860} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
				{sub}
			</text>
		</g>
	);
	return (
		<Board tint="#143a2c">
			{half(150, 'ДЕНЬ 1', 'ПОТЕРЯЛ ФЕРЗЯ', '#9fb0d8', k, true)}
			{half(1010, 'ДЕНЬ 30', 'ОТДАЛ ФЕРЗЯ САМ', GOLD, b, false)}
		</Board>
	);
};
/* 189: the last frame: Zakhar sees the ring as a board, Lev sees the pieces as fighters */
const LastSplit: React.FC = () => {
	const {gf} = useShot();
	const {t} = useT();
	const T = t('189');
	const k = k01(T, 0, 14);
	const cam = usePushK(camOn(960, 540, 1.0), camOn(960, 540, 1.08));
	return (
		<Stage cam={cam} bg="#0c0e22" light={false}>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-200} width={1360} height={1500} fill="#8a2a1c" />
					<rect x={960} y={-200} width={1360} height={1500} fill="#1f3f86" />
					{/* left: the ring floor ruled like a board, seen from above, ropes around */}
					<g transform={`translate(${470 - (1 - k) * 200},560)`} opacity={k}>
						<rect x={-330} y={-330} width={660} height={660} rx={10} fill="#e3e8f2" stroke="#1b1e2a" strokeWidth={8} />
						{Array.from({length: 64}).map((_, i) => ((i % 8) + Math.floor(i / 8)) % 2 ? <rect key={i} x={-280 + (i % 8) * 70} y={-280 + Math.floor(i / 8) * 70} width={70} height={70} fill="#9fb0d8" opacity={0.75} /> : null)}
						{[-312, -296].map((o, i) => (
							<rect key={i} x={o} y={o} width={-2 * o} height={-2 * o} rx={8} fill="none" stroke={i ? '#f4f4f4' : '#d9372b'} strokeWidth={8} />
						))}
						{[
							[-322, -322],
							[322, -322],
							[-322, 322],
							[322, 322],
						].map(([x, y], i) => (
							<rect key={i} x={x - 20} y={y - 20} width={40} height={40} rx={8} fill={i % 2 ? '#2f6fd8' : '#d9372b'} stroke="#1b1e2a" strokeWidth={5} />
						))}
						<circle cx={-70} cy={70} r={30} fill="#e0452e" stroke="#1b1e2a" strokeWidth={6} />
						<circle cx={105} cy={-105} r={30} fill="#2f6fd8" stroke="#1b1e2a" strokeWidth={6} />
					</g>
					{/* right: two pieces standing on a board edge in boxing stances */}
					<g opacity={k} transform={`translate(${(1 - k) * 200},0)`}>
						<rect x={1060} y={760} width={760} height={50} rx={8} fill="#ecd9b0" stroke="#1b1e2a" strokeWidth={6} />
						{Array.from({length: 8}).map((_, i) => (i % 2 ? <rect key={i} x={1060 + i * 95} y={760} width={95} height={50} fill="#b9854f" /> : null))}
						<Actor who="lev" x={1290} floor={760} s={1.0} facing={1} color="#fffaf0" outfit="tee" hair="none" acc={[]} glove={GL_L} rim="#1b1e2a" pose={jab(guardP(gf, 1), Math.max(0, Math.sin(gf / 6)) ** 4)} uid="pw" shadow={false} />
						<Actor who="zakhar" x={1590} floor={760} s={1.0} facing={-1} color="#3a3d5c" hair="none" glove={GL_Z} pose={guardP(gf, 2)} uid="pb" shadow={false} />
						<path d="M1264,446 L1264,432 L1252,432 L1252,420 L1264,420 L1264,408 L1280,408 L1280,420 L1292,420 L1292,432 L1280,432 L1280,446 Z" fill="#fffaf0" stroke="#1b1e2a" strokeWidth={5} transform={`translate(${Math.sin(gf / 23) * 2},0)`} />
						<path d="M1560,444 L1552,408 L1568,424 L1578,400 L1590,424 L1602,400 L1612,424 L1628,408 L1620,444 Z" fill="#3a3d5c" stroke="#1b1e2a" strokeWidth={5} />
					</g>
					<rect x={952} y={-200} width={16} height={1500} fill="#fff" />
				</Svg>
			</Layer>
			<Hud>
				<g opacity={k01(T, 20, 12)}>
					<rect x={160} y={930} width={620} height={90} rx={22} fill={NAVY} stroke={GOLD} strokeWidth={5} />
					<text x={470} y={992} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
						ЗАХАР ВИДИТ КЛЕТКИ
					</text>
					<rect x={1130} y={930} width={640} height={90} rx={22} fill={NAVY} stroke={GOLD} strokeWidth={5} />
					<text x={1450} y={992} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
						ЛЕВ ВИДИТ БОЙЦОВ
					</text>
				</g>
			</Hud>
		</Stage>
	);
};
/* 190: the one question to the viewer */
const Question: React.FC = () => {
	const {gf} = useShot();
	const {t} = useT();
	const T = t('190');
	const k = k01(T, 4, 14);
	return (
		<Board tint="#2a1f55">
			<g transform={`translate(960,${470 + (1 - k) * 60}) scale(${0.85 + 0.15 * k})`} opacity={k}>
				<rect x={-800} y={-190} width={1600} height={380} rx={36} fill={NAVY} stroke={GOLD} strokeWidth={7} />
				<text x={0} y={-30} textAnchor="middle" fontSize={120} fontFamily={FONT} fontWeight={900} fill="#fff">
					А С КЕМ
				</text>
				<text x={0} y={110} textAnchor="middle" fontSize={120} fontFamily={FONT} fontWeight={900} fill={GOLD}>
					ПОМЕНЯЛСЯ БЫ ТЫ?
				</text>
			</g>
			<g opacity={k01(T, 24, 14)}>
				<rect x={610} y={770} width={700} height={104} rx={24} fill={NAVY} stroke="#9fb0d8" strokeWidth={5} />
				<text x={960} y={842} textAnchor="middle" fontSize={62} fontFamily={FONT} fontWeight={900} fill="#9fb0d8">
					НА 30 ДНЕЙ
				</text>
			</g>
			<Actor who="lev" x={300} floor={1010} s={0.9} facing={1} pose={idle(gf, 1)} uid="q1" shadow={false} />
			<Actor who="zakhar" x={1620} floor={1010} s={0.9} facing={-1} pose={idle(gf, 2)} uid="q2" shadow={false} />
		</Board>
	);
};

export const SHOTS4: ShotDef[] = [
	...mk(['156', '157', '158'], ArenaScene),
	...mk(['159'], FinalBoard),
	...mk(['160'], GareevCard),
	...mk(['161', '162'], FinalBoard),
	...mk(['163', '164', '165', '166', '167', '168'], ArenaScene),
	...mk(['169', '170'], FinalBoard),
	...mk(['171'], ArenaScene),
	...mk(['172'], FinalBoard),
	...mk(['173'], ArenaScene),
	...mk(['174', '175', '176'], FinalBoard),
	...mk(['177'], ArenaScene),
	...mk(['178'], OldCard),
	...mk(['179'], Press),
	...mk(['180', '181', '182'], ArenaScene),
	...mk(['183'], QueensCard),
	...mk(['184', '185', '186', '187', '188'], ArenaScene),
	...mk(['189'], LastSplit),
	...mk(['190'], Question),
];
void PRE;
