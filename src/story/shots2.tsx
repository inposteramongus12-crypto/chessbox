import React from 'react';
import {Pose} from '../engine/Stickman';
import {Layer, Svg} from '../engine/camera';
import {Chair} from '../engine/props';
import {env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, L, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {camOn, Stage} from '../kit/kit';
import {Board, FONT} from '../kit/ui';
import {GL_L} from './cast';
import {BoardTop, boardAt, C, Clocks, Cloud, DayPlate, fen, FL, GOLD, guardP, Hud, jab, k01, lerp, Move, NAVY, Plate, sit, sitFloor, sitReach, useLineCam, usePushK, useT} from './lib';
import {Apple, Bag, Can, ChessTable, Club, FactHead, Gym, Mitt, Needles, Notebook, Ring, ShopSet, Street} from './places';
import {Evening, GhostClock, slap, START, Tree} from './shots1';

/* Parts 4–6 (lines 039–107): day 7, day 15, day 25. */
const p01 = (x: number) => Math.max(0, Math.min(1, x));
const mk = (ids: string[], Cmp: React.FC, whipFirst = true): ShotDef[] => ids.map((at, i) => ({at, C: Cmp, whip: whipFirst && i === 0}));

/* «коробочка»: Zakhar's set-up with Black (e5, d6, Be7, Nf6, 0-0). Box = f7..h8. */
export const BOX: [number, number, number, number] = [5, 7, 7, 6];
const boxMoves = (a: number, step: number): Move[] => [
	[a, 'e7e5', 6],
	[a + step, 'd7d6', 6],
	[a + step * 2, 'g8f6', 6],
	[a + step * 3, 'f8e7', 6],
	[a + step * 4, 'e8g8', 6],
	[a + step * 4, 'h8f8', 6],
];
const Felt: React.FC = () => (
	<g>
		<rect x={-400} y={-200} width={2720} height={1500} fill="#143a2c" />
		<ellipse cx={960} cy={540} rx={1100} ry={640} fill="#1c5240" />
	</g>
);
/* 041 and 044: the box from above; 044 repeats it faster and faster with a stopwatch */
const BoxTop: React.FC = () => {
	const {gf} = useShot();
	const {t, d, id} = useT();
	const a = L(id).from;
	let ps = fen(START);
	let boxK = 0;
	let sw = '';
	if (id === '041') {
		const n = d('041');
		const mv = boxMoves(a + 6, Math.round(n * 0.15));
		ps = boardAt(fen(START), mv, gf);
		boxK = k01(gf, a + Math.round(n * 0.72), 20);
	} else {
		const n = d('044');
		const runs = [
			{s: 4, len: Math.round(n * 0.36), label: '0:31'},
			{s: Math.round(n * 0.4), len: Math.round(n * 0.26), label: '0:17'},
			{s: Math.round(n * 0.7), len: Math.round(n * 0.18), label: '0:08'},
		];
		const tt = t('044');
		const r = [...runs].reverse().find((x) => tt >= x.s) ?? runs[0];
		ps = boardAt(fen(START), boxMoves(a + r.s, Math.max(2, Math.floor(r.len / 6))), gf);
		boxK = k01(tt, r.s + r.len - 4, 6);
		sw = r.label;
	}
	const cam = usePushK(camOn(1000, 560, 1.0), camOn(1040, 470, id === '041' ? 1.22 : 1.1));
	return (
		<Stage cam={cam} bg="#143a2c" light={{x: 60, y: 0, o: 0.3}}>
			<Layer depth={1}>
				<Svg>
					<Felt />
					<BoardTop x={860} y={540} S={98} pieces={ps} box={BOX} boxK={boxK} />
					{id === '044' ? <Plate x={1560} y={420} lines={[sw || '…']} sub="СЕКУНДОМЕР" size={100} k={1} /> : <Plate x={1560} y={420} lines={['КОРОЛЬ', 'В УГЛУ']} size={64} k={boxK} />}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* ------------------------------------------------------------------ the club on days 7, 15, 25 */
const ClubScene: React.FC = () => {
	const {gf, t, d, id} = useT();
	const n = Number(id);
	const day = n < 61 ? 7 : n < 83 ? 15 : 25;
	const opp = day === 7 ? 'ada' : day === 15 ? 'ded' : 'tim';
	const cam = useLineCam(
		{
			'039': C(960, 580, 1.08, 960, 590, 1.2),
			'040': C(1000, 630, 1.4, 980, 630, 1.5),
			'042': C(1040, 620, 1.4, 1050, 620, 1.5),
			'043': C(880, 620, 1.44, 870, 615, 1.54),
			'046': C(960, 610, 1.3, 940, 610, 1.42),
			'047': C(880, 620, 1.5, 870, 615, 1.6),
			'050': C(900, 560, 1.3, 880, 540, 1.44),
			'061': C(960, 560, 1.0, 960, 590, 1.16),
			'062': C(880, 680, 1.4, 870, 690, 1.52),
			'064': C(960, 620, 1.3, 1000, 620, 1.44),
			'065': C(720, 660, 1.5, 710, 660, 1.6),
			'066': C(1100, 600, 1.24, 1080, 600, 1.34),
			'067': C(960, 630, 1.4, 980, 630, 1.52),
			'068': C(1200, 520, 1.2, 1220, 500, 1.32),
			'069': C(980, 600, 1.2, 1000, 590, 1.34),
			'083': C(960, 580, 1.06, 980, 590, 1.2),
			'084': C(960, 560, 1.2, 960, 550, 1.3),
			'085': C(900, 630, 1.4, 880, 630, 1.52),
			'086': C(940, 640, 1.5, 950, 640, 1.6),
			'087': C(880, 620, 1.44, 900, 620, 1.56),
			'089': C(900, 610, 1.34, 890, 600, 1.44),
			'090': C(1000, 590, 1.24, 1020, 590, 1.36),
			'091': C(900, 600, 1.1, 860, 620, 1.3),
		},
		[],
	);
	const alone = id === '091';
	let zp: Pose = sit(gf, 2);
	let zexpr: 'normal' | 'angry' | 'sad' | 'wide' | 'worried' | 'sleepy' = 'normal';
	let zlook: [number, number] = [0.6, 0.25];
	let zseat = 737;
	let blind = 0;
	if (id === '039') zp = reach(zp, 'F', [60, -80], 1 - k01(t('039'), 40, 10));
	if (id === '040') zp = sitReach(gf, k01(t('040'), 10, 14), 2, [100, -58]);
	if (id === '043') zp = reach(reach(zp, 'F', [44, -128], 1), 'B', [30, -110], 1);
	if (id === '046' || id === '047') {
		blind = id === '046' ? k01(t('046'), Math.round(d('046') * 0.5), 12) : 1;
		zp = sitReach(gf, 0.5 + 0.5 * Math.sin(gf / 6), 2, [96, -58]);
	}
	if (id === '050') zp = gesture('rubChin', zp, 1, gf);
	if (id === '061') zp = {...zp, lean: 16, head: 14};
	if (id === '062') {
		const sl = k01(t('062'), 6, 40);
		zp = {...zp, lean: -22 * sl, head: -10 * sl};
		zseat = 737 + sl * 96;
		zexpr = 'sad';
	}
	if (id === '064') zlook = [1, -0.1];
	if (id === '065') zp = {...zp, armF: [20, 60], armB: [16, 58], lean: -2 + Math.sin(gf / 3) * 2};
	if (id === '067') {
		const a = env(t('067'), 24, 46, 6, 6);
		const b = env(t('067'), 50, 76, 6, 10);
		zp = b > 0.02 ? sitReach(gf, b, 2, [84, -56]) : sitReach(gf, a, 2, [118, -62]);
	}
	if (id === '069') zp = gesture('fist', zp, k01(t('069'), 20, 10), gf);
	if (id === '085') zp = gesture('rubChin', zp, 1, gf);
	if (id === '086') zp = sitReach(gf, env(t('086'), 14, 40, 8, 8), 2, [112, -60]);
	if (id === '087') zp = reach(zp, 'F', [10, -150], 1);
	if (id === '089') {
		zp = reach(reach(zp, 'F', [70, -96 + Math.sin(gf / 2) * 10], 1), 'B', [56, -92 - Math.sin(gf / 2) * 10], 1);
		zexpr = 'wide';
	}
	if (id === '090' || alone) {
		zp = {...zp, lean: 12, head: 18};
		zexpr = 'sad';
	}
	if (id === '087') zexpr = 'angry';
	const wet = day === 15 && n <= 62;
	// opponent
	const ox = opp === 'tim' ? 1120 : 1130;
	let op: Pose = sit(gf, 5);
	let oseat = opp === 'tim' ? 700 : 742;
	let oexpr: 'normal' | 'sleepy' | 'wide' = 'normal';
	let needles = opp === 'ada';
	if (opp === 'ada') op = reach(reach(op, 'F', [56, -74], 1), 'B', [44, -70], 1);
	if (id === '039') {
		const tk = env(t('039'), 30, 60, 8, 10);
		op = reach(op, 'F', [150, -70], tk);
		needles = tk < 0.1;
	}
	if (id === '040') {
		op = reach(op, 'F', [130, -52], 1);
		needles = false;
	}
	if (id === '042') op = reach(op, 'F', [120, -44 + Math.sin(gf / 3) * 6], 1);
	if (id === '046') {
		op = reach(op, 'F', [170, -150], blind);
		needles = false;
	}
	if (opp === 'ded') {
		if (id === '064' || id === '067') op = sitReach(gf, env(t(id), 30, 70, 14, 10), 5, [90, -58]);
		if (id === '067') oexpr = t('067') > 26 ? 'wide' : 'normal';
		if (id === '069') {
			op = gesture('touchFace', op, k01(t('069'), 40, 12), gf);
			oexpr = 'sleepy';
		}
	}
	if (opp === 'tim') {
		op = {...op, legF: [70 + Math.sin(gf / 5) * 20, 60], legB: [70 - Math.sin(gf / 5) * 20, 60]};
		if (id === '087' || id === '089') op = reach(op, 'F', [120, -60], 1);
	}
	// Ada standing by on days 15 and 25
	const adaX = 1420;
	let ap: Pose = reach(reach(idle(gf, 7), 'F', [56, -84], 1), 'B', [44, -80], 1);
	let adaN = true;
	if (id === '066') {
		ap = reach(idle(gf, 7), 'F', [100, -90], 1);
		adaN = false;
	}
	if (id === '068') {
		ap = reach(idle(gf, 7), 'F', [-60, -190], 1);
		adaN = false;
	}
	if (id === '090') {
		ap = reach(idle(gf, 7), 'F', [110, -70], 1);
		adaN = false;
	}
	const notice = n >= 68 && n <= 69 ? (id === '068' ? k01(t('068'), 20, 12) : 1) : 0;
	const flag = n >= 88 && n <= 90;
	const hours = id === '061' ? (t('061') / Math.max(1, d('061'))) * 4 : 0;
	return (
		<Stage cam={cam} bg={alone ? '#6f6452' : '#dccba6'} light={{x: 12, y: 20, o: alone ? 0.2 : 0.36}}>
			<Layer depth={1.5}>
				<Svg>
					<Club f={gf} night={alone} hours={hours} sign={['039', '061', '083'].includes(id)} notice={notice} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Chair x={790} y={748} facing={1} />
					{!alone ? <Chair x={ox} y={748} facing={-1} /> : null}
					<Actor who="zakhar" x={790} seat={zseat} facing={1} outfit="suit" pose={zp} look={zlook} expr={zexpr} uid="zakc2" />
					{blind > 0 ? <rect x={790 + 4} y={737 - 190 - (1 - blind) * 60} width={72} height={26} rx={8} fill="#e86aa0" stroke="#0b0d1e" strokeWidth={4} opacity={blind} /> : null}
					{wet ? [0, 1, 2].map((i) => <ellipse key={i} cx={760 + i * 34} cy={600 + ((gf * 3 + i * 40) % 110)} rx={6} ry={10} fill="#8fd3ff" stroke="#0b0d1e" strokeWidth={2} />) : null}
					{!alone ? <Actor who={opp} x={ox} seat={oseat} facing={-1} pose={op} look={[0.5, 0.4]} expr={oexpr} handItem={needles ? <Needles f={gf} /> : undefined} uid={'opp' + day} mouth={id === '069' && t('069') > 40 ? 'open' : undefined} /> : null}
					{day !== 7 && !alone ? <Actor who="ada" x={adaX} facing={-1} pose={ap} look={[0.6, 0.3]} handItem={adaN ? <Needles f={gf} /> : undefined} uid={'adas' + day} /> : null}
					<ChessTable x={960} seed={'c' + day} clock={day === 25} />
					{day === 15 && n >= 66 ? (
						<g transform="translate(900,688)">
							<rect x={-18} y={-30} width={36} height={30} rx={5} fill="#fffaf0" stroke="#1b1e2a" strokeWidth={3} />
						</g>
					) : null}
					{id === '050' ? (
						<g transform={`translate(600,${470 - Math.sin(gf / 20) * 6})`} opacity={k01(t('050'), 6, 12)}>
							<rect x={-70} y={-70} width={140} height={140} rx={14} fill={GOLD} opacity={0.25} />
							<rect x={-70} y={-70} width={140} height={140} rx={14} fill="none" stroke={GOLD} strokeWidth={12} />
						</g>
					) : null}
					{id === '069' ? <Plate x={960} y={985} lines={["1–0"]} sub="ПЕРВАЯ ПОБЕДА" size={80} k={k01(t('069'), 16, 12)} /> : null}
					{id === '084' ? (
						<>
							<Plate x={640} y={380} lines={['25 ДНЕЙ']} size={66} c="#ff7a5c" k={k01(t('084'), Math.round(d('084') * 0.55), 10)} />
							<Plate x={1280} y={380} lines={['6 ЛЕТ']} size={66} k={k01(t('084'), 8, 10)} />
						</>
					) : null}
					{id === '086'
						? [0, 1].map((i) => (
								<g key={i} transform={`translate(${846 + i * 30},688)`} opacity={k01(t('086'), 30 + i * 40, 8)}>
									<rect x={-6} y={-24} width={12} height={24} rx={3} fill="#2a2d44" stroke="#1b1e2a" strokeWidth={3} />
									<circle cx={0} cy={-30} r={7} fill="#2a2d44" stroke="#1b1e2a" strokeWidth={3} />
								</g>
							))
						: null}
					{id === '087' ? <Cloud x={1160} y={400} t={t('087') - d('087') - 4} lines={['ДЯДЯ, У ВАС', 'ФЛАЖОК УПАЛ']} size={56} tail={[-30, 190]} /> : null}
					{flag ? (
						<g transform="translate(960,722)">
							<polygon points="-34,-2 -34,-30 -8,-16" fill="#ff4b3a" stroke="#0b0d1e" strokeWidth={3} transform="rotate(80 -34 -2)" />
						</g>
					) : null}
				</Svg>
			</Layer>
			<Hud>
				<DayPlate day={day} since={['039', '061', '083'].includes(id) ? t(id) - 6 : 99} />
			</Hud>
		</Stage>
	);
};

/* 088: the clock close up: Zakhar's side shows zero, the flag is down */
const FlagCard: React.FC = () => {
	const {gf, t} = useT();
	const cam = usePushK(camOn(960, 540, 0.96), camOn(985, 540, 1.1));
	const blink = Math.floor(gf / 8) % 2;
	return (
		<Stage cam={cam} bg="#143a2c" light={{x: 60, y: 0, o: 0.3}}>
			<Layer depth={1}>
				<Svg>
					<Felt />
					<g transform="translate(960,560) scale(2.2)">
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
								<text x={0} y={96} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={800} fill="#ffe9ad">
									{c.name}
								</text>
							</g>
						))}
						<polygon points="220,-52 220,-96 262,-74" fill="#ff4b3a" stroke="#0b0d1e" strokeWidth={3} transform={`rotate(${k01(t('088'), 4, 8) * 100} 220 -52)`} />
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 045: the box on his knees in a bus, then with apples in a shop */
const BusShop: React.FC = () => {
	const {gf, t, d} = useT();
	const shop = t('045') > d('045') * 0.4;
	const cam = usePushK(shop ? camOn(960, 560, 1.1) : camOn(900, 600, 1.3), shop ? camOn(1000, 560, 1.24) : camOn(880, 620, 1.44));
	const ts = t('045') - Math.round(d('045') * 0.4);
	if (!shop)
		return (
			<Stage cam={cam} bg="#c9d6e2" light={{x: 20, y: 20, o: 0.3}}>
				<Layer depth={1.4}>
					<Svg>
						<rect x={-400} y={-200} width={2720} height={1300} fill="#9fb4c6" />
						{[0, 1, 2, 3].map((i) => (
							<rect key={i} x={-200 + i * 620 - ((gf * 0) % 1)} y={180} width={520} height={330} rx={30} fill="#d6f1ff" stroke="#5a6b7a" strokeWidth={12} />
						))}
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<rect key={i} x={((i * 520 - gf * 26) % 3000) - 500} y={380} width={200} height={130} fill="#7fa58a" opacity={0.6} />
						))}
						<rect x={-400} y={640} width={2720} height={500} fill="#6f8496" />
					</Svg>
				</Layer>
				<Layer depth={1}>
					<Svg>
						<rect x={720} y={560} width={60} height={340} rx={20} fill="#3f5f9a" stroke="#1b1e2a" strokeWidth={5} />
						<rect x={740} y={746} width={220} height={150} rx={20} fill="#4a6fb0" stroke="#1b1e2a" strokeWidth={5} />
						<Actor who="zakhar" x={830} seat={737} facing={1} outfit="suit" pose={sitReach(gf, 0.5 + 0.5 * Math.sin(gf / 4), 2, [70, -30])} look={[0.5, 0.8]} uid="zakbus" />
						{[0, 1, 2, 3].map((i) => (
							<g key={i} transform={`translate(${862 + i * 20},${724 - (i === 3 ? 0 : 0)})`}>
								<rect x={-5} y={-20} width={10} height={20} rx={3} fill="#2a2d44" stroke="#1b1e2a" strokeWidth={2.5} />
								<circle cx={0} cy={-24} r={6} fill="#2a2d44" stroke="#1b1e2a" strokeWidth={2.5} />
							</g>
						))}
					</Svg>
				</Layer>
				<Hud>
					<DayPlate day={7} />
				</Hud>
			</Stage>
		);
	return (
		<Stage cam={cam} bg="#e9dfc6" light={{x: 40, y: 10, o: 0.3}}>
			<Layer depth={1.3}>
				<Svg>
					<ShopSet />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="seller" x={1380} facing={-1} pose={gesture('stop', idle(gf, 3), k01(ts, 40, 8), gf)} expr="angry" uid="seller" hideLegs />
					<rect x={520} y={640} width={980} height={260} rx={10} fill="#4b8f80" stroke="#1b1e2a" strokeWidth={5} />
					<rect x={500} y={620} width={1020} height={34} rx={8} fill="#e9f4f1" stroke="#1b1e2a" strokeWidth={5} />
					<Actor who="zakhar" x={640} facing={1} outfit="suit" pose={reach(idle(gf, 2), 'F', [110, -120], 1)} look={[0.7, 0.4]} uid="zakshop" />
					{[0, 1, 2].map((i) => (
						<Apple key={i} x={900 + i * 70} y={620} k={k01(ts, 4 + i * 8, 8)} />
					))}
					<Apple x={1040} y={560} pear k={k01(ts, 30, 8)} />
					<Apple x={970} y={560} k={k01(ts, 36, 8)} />
					<Cloud x={1380} y={300} t={ts - 44} lines={['МУЖЧИНА!']} size={64} tail={[0, 150]} />
				</Svg>
			</Layer>
			<Hud>
				<DayPlate day={7} />
			</Hud>
		</Stage>
	);
};

/* 048–049: Chase & Simon, 1973: a real position is remembered whole, a random one is not */
const ChaseCard: React.FC = () => {
	const {gf, t, d, id} = useT();
	const second = id === '049';
	const tt = second ? t('049') : t('048');
	const k = k01(t('048'), 0, 12);
	const real = fen('r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1');
	const rnd = real.map((p, i) => ({...p, f: (i * 5 + 3) % 8, r: (i * 3 + (i % 2) * 4 + 1) % 8}));
	const shuffle = second ? k01(tt, 6, 20) : 0;
	const ps = real.map((p, i) => ({...p, f: lerp(p.f, rnd[i].f, shuffle), r: lerp(p.r, rnd[i].r, shuffle)}));
	const flashOn = !second && tt > d('048') * 0.3 && tt < d('048') * 0.62;
	const recall = second ? k01(tt, Math.round(d('049') * 0.3), 30) : k01(tt, Math.round(d('048') * 0.66), 30);
	const nR = second ? 4 : 22;
	return (
		<Board tint="#1a2150">
			<FactHead title="ЧЕЙЗ И САЙМОН" year="1973" k={k} />
			<g opacity={k}>
				<BoardTop x={560} y={600} S={64} pieces={!second && !flashOn && tt < d('048') * 0.3 ? [] : flashOn || second ? ps : []} shake={0} />
				<text x={560} y={962} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={800} fill="#aab3d6">
					{second ? 'ФИГУРЫ КАК ПОПАЛО' : 'ПОЗИЦИЯ ИЗ ПАРТИИ'}
				</text>
				<BoardTop x={1360} y={600} S={64} pieces={ps.slice(0, Math.round(recall * nR))} />
				<text x={1360} y={962} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={800} fill={second ? '#ff7a5c' : GOLD}>
					{second ? 'МАСТЕР ПОМНИТ МАЛО' : 'МАСТЕР ПОМНИТ ПОЧТИ ВСЁ'}
				</text>
				<text x={960} y={640} textAnchor="middle" fontSize={120} fontFamily={FONT} fontWeight={900} fill="#fff" opacity={0.5 + 0.5 * Math.sin(gf / 6)}>
					→
				</text>
			</g>
		</Board>
	);
};
/* 063: Karpov, the 1984–85 match: about ten kilos lost sitting on a chair */
const KarpovCard: React.FC = () => {
	const {gf, t, d} = useT();
	const tt = t('063');
	const k = k01(tt, 0, 12);
	const v = Math.round(10 * k01(tt, Math.round(d('063') * 0.4), 40));
	return (
		<Board tint="#3a1d2a">
			<FactHead title="АНАТОЛИЙ КАРПОВ" year="1984–85" k={k} />
			<g opacity={k}>
				<rect x={520} y={620} width={26} height={300} fill="#c9ced8" />
				<rect x={760} y={620} width={26} height={300} fill="#c9ced8" />
				<rect x={500} y={600} width={310} height={40} rx={10} fill="#c99a62" stroke="#1b1e2a" strokeWidth={6} />
				<rect x={500} y={360} width={40} height={260} rx={10} fill="#c99a62" stroke="#1b1e2a" strokeWidth={6} />
				{[0, 1, 2, 3, 4].map((i) => (
					<ellipse key={i} cx={560 + i * 52} cy={660 + ((gf * 4 + i * 60) % 240)} rx={10} ry={16} fill="#8fd3ff" stroke="#0b0d1e" strokeWidth={3} />
				))}
				<text x={1240} y={720} textAnchor="middle" fontSize={300} fontFamily={FONT} fontWeight={900} fill="#ff7a5c">
					−{v}
				</text>
				<text x={1240} y={860} textAnchor="middle" fontSize={90} fontFamily={FONT} fontWeight={900} fill="#fff">
					КИЛОГРАММОВ
				</text>
				<text x={1240} y={960} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={800} fill="#aab3d6">
					ЗА ОДИН МАТЧ. СИДЯ
				</text>
			</g>
		</Board>
	);
};

/* ------------------------------------------------------------------ the gym on days 7, 15, 25 */
const GymScene: React.FC = () => {
	const {gf, t, d, id} = useT();
	const n = Number(id);
	const day = n < 61 ? 7 : n < 83 ? 15 : 25;
	const spar = day === 25;
	const cam = useLineCam(
		{
			'051': C(960, 600, 1.16, 940, 610, 1.28),
			'052': C(860, 610, 1.4, 850, 600, 1.5),
			'053': C(1500, 590, 1.6, 1500, 585, 1.7),
			'054': C(1000, 640, 1.3, 980, 660, 1.42),
			'055': C(900, 680, 1.44, 920, 670, 1.54),
			'056': C(960, 600, 1.14, 940, 620, 1.26),
			'057': C(900, 610, 1.3, 880, 600, 1.42),
			'070': C(1000, 590, 1.14, 980, 590, 1.26),
			'071': C(900, 520, 1.24, 880, 560, 1.38),
			'072': C(640, 610, 1.56, 630, 605, 1.66),
			'073': C(1500, 590, 1.6, 1500, 585, 1.7),
			'074': C(1000, 590, 1.2, 1020, 590, 1.32),
			'075': C(900, 600, 1.3, 880, 600, 1.44),
			'076': C(940, 590, 1.3, 930, 580, 1.42),
			'077': C(1040, 580, 1.4, 1050, 575, 1.5),
			'078': C(1060, 580, 1.3, 1040, 580, 1.42),
			'093': C(960, 590, 1.1, 960, 600, 1.22),
			'094': C(940, 600, 1.3, 920, 610, 1.42),
			'095': C(1000, 590, 1.3, 1020, 590, 1.42),
			'096': C(880, 640, 1.3, 860, 600, 1.42),
			'097': C(660, 610, 1.5, 650, 605, 1.6),
			'098': C(1500, 590, 1.6, 1500, 585, 1.7),
		},
		[],
	);
	const lx0 = 800;
	let lx = lx0;
	let lp: Pose = guardP(gf, 1, 0.6);
	let lie = 0; // 0 standing .. 1 lying on the back
	let sitK = 0;
	let lexpr: 'normal' | 'sad' | 'wide' | 'worried' = 'normal';
	let sl = 0;
	let count = 0;
	// Palych
	let px = 1330;
	let pp: Pose = gesture('armsCrossed', idle(gf, 4), 1, gf);
	let item: React.ReactNode = undefined;
	let fx: React.ReactNode = null;
	const T = t(id);
	const D = d(id);
	if (id === '051') {
		const push = env(T, 20, 30, 6, 8);
		px = 1010;
		pp = reach(idle(gf, 4), 'F', [70 + push * 50, -100], 1);
		item = <Mitt />;
		lie = k01(T, 28, 10) * (1 - k01(T, 52, 8));
	}
	if (id === '052') {
		lp = {...idle(gf, 1), lean: Math.sin(gf / 3) * 10};
		lx = lx0 + Math.sin(gf / 4) * 14;
		lexpr = 'worried';
		px = 1010;
	}
	if (id === '053') pp = {...idle(gf, 4), armF: [150, 20], armB: [-150, 20]};
	if (id === '054') {
		px = 1010;
		pp = reach(idle(gf, 4), 'F', [100, -40], 1);
		item = <Mitt />;
		lie = k01(T, 6, 12);
	}
	if (id === '055') {
		px = 1010;
		lie = 1;
		pp = gesture('fist', idle(gf, 4), k01(T, D * 0.55, 8), gf);
	}
	if (id === '056') {
		px = 1010;
		const ph = (T % 36) / 36;
		lie = ph < 0.5 ? k01(ph, 0.1, 0.25) : 1 - k01(ph, 0.6, 0.3);
		count = Math.min(40, Math.round((T / D) * 44));
	}
	if (id === '057') {
		px = 1010;
		const upAt = Math.round(D * 0.36);
		lie = 1 - k01(T, upAt, 12);
		count = Math.min(8, 1 + Math.floor((T / upAt) * 8));
		sl = env(T, Math.round(D * 0.62), D + 20, 6, 10);
		if (lie < 0.05) lp = sl > 0.02 ? slap(idle(gf, 1), sl) : idle(gf, 1);
	}
	if (id === '070' || id === '071') {
		pp = reach(idle(gf, 4), 'F', [90 + 30 * Math.sin(gf / 4), -120], 1);
		lp = gesture('think', guardP(gf, 1, 0.5), id === '070' ? 1 : 1 - k01(T, D * 0.5, 8), gf);
		lexpr = 'worried';
		const dodge = id === '071' && T > D * 0.55;
		if (dodge) {
			lx = lx0 - 90 * k01(T, D * 0.55, 8);
			lp = guardP(gf, 1, 0.8);
			lexpr = 'normal';
		}
		fx = [0, 1, 2].map((i) => {
			const ph = ((gf * 0.045 + i / 3) % 1 + 1) % 1;
			const bx = lerp(px - 100, dodge ? lx0 - 380 : lx + 30, ph);
			return <circle key={i} cx={bx} cy={620 - Math.sin(ph * Math.PI) * 90 + i * 20} r={20} fill="#d8ef4a" stroke="#0b0d1e" strokeWidth={4} />;
		});
	}
	if (id === '072') {
		lp = {...idle(gf, 1), head: 16};
		lx = lx0 - 90;
	}
	if (id === '073') pp = gesture('point', idle(gf, 4), 1, gf);
	if (id === '074') {
		const th = k01(T, D * 0.4, 10);
		const ph = k01(T, D * 0.4 + 6, 22);
		pp = reach(idle(gf, 4), 'F', [100, -130 + th * 20], 1);
		lx = lx0 - 90 * k01(T, D * 0.4 + 14, 8);
		lp = guardP(gf, 1, 0.8);
		fx = th > 0 && ph < 1 ? <rect x={lerp(px - 110, lx0 - 420, ph)} y={520 - Math.sin(ph * Math.PI) * 60} width={70} height={26} rx={12} fill="#b5532f" stroke="#0b0d1e" strokeWidth={4} transform={`rotate(${ph * 500} ${lerp(px - 110, lx0 - 420, ph) + 35} ${533 - Math.sin(ph * Math.PI) * 60})`} /> : null;
	}
	if (id === '075') {
		lx = lx0 - 90 + 90 * k01(T, 10, 20);
		sl = env(T, Math.round(D * 0.4), D + 20, 6, 10);
		lp = sl > 0.02 ? slap(idle(gf, 1), sl) : guardP(gf, 1, 0.8);
		pp = gesture('facepalm', idle(gf, 4), k01(T, D * 0.6, 10), gf);
	}
	if (id === '076' || id === '077' || id === '078') {
		px = 1040;
		item = <Mitt />;
		pp = reach(reach(idle(gf, 4), 'F', [70, -124], 1), 'B', [60, -92], 1);
		const hitK = id === '076' ? env(T, D * 0.42, D * 0.42 + 6, 4, 6) : 0;
		const stuck = id === '076' && T > D * 0.55 ? 1 : 0;
		lp = stuck ? gesture('think', jab(guardP(gf, 1, 0.7), 1), 1, gf) : jab(guardP(gf, 1, 0.7), hitK);
		if (id === '077') pp = jab(jab(idle(gf, 4), Math.abs(Math.sin(gf / 4))), 0);
		if (id === '078') pp = gesture('point', idle(gf, 4), 1, gf);
		if (id !== '076') lp = idle(gf, 1);
		if (id === '077' || id === '078') item = undefined;
	}
	// day 25: sparring with a junior in the ring part of the gym
	let jx = 1010;
	let jp: Pose = guardP(gf, 6, 0.9);
	if (spar) {
		px = 1420;
		if (id === '093') jp = {...idle(gf, 6), head: 10 * env(T, D * 0.5, D, 8, 8)};
		if (id === '094') {
			const u = T / D;
			const k1 = env(T, D * 0.1, D * 0.1 + 5, 4, 6);
			const k2 = env(T, D * 0.3, D * 0.3 + 5, 4, 6);
			const k3 = u > 0.5 ? Math.abs(Math.sin((u - 0.5) * 26)) : 0;
			jp = jab(guardP(gf, 6, 0.9), Math.max(k1, k2, k3));
			lx = lx0 - 70 * Math.max(k1, k2);
			sitK = k01(T, D * 0.8, 8);
			lexpr = u > 0.5 ? 'wide' : 'normal';
		}
		if (id === '095') {
			sitK = 1;
			jp = gesture('shrug', idle(gf, 6), 1, gf);
			fx = <Cloud x={1080} y={330} t={T - 14} lines={['ИЗВИНИТЕ']} size={60} tail={[-30, 150]} />;
		}
		if (id === '096') {
			const upAt = Math.round(D * 0.3);
			lie = 1 - k01(T, upAt, 12);
			count = lie > 0.05 ? Math.min(8, 1 + Math.floor((T / upAt) * 8)) : 0;
			lp = {...idle(gf, 1), armF: [10, 14], armB: [-6, 12], head: 12};
			lexpr = 'sad';
			jp = idle(gf, 6);
			jx = 1160;
		}
		if (id === '097') {
			lx = 620;
			lp = {...idle(gf, 1), lean: -14, armF: [-70, 20], armB: [-90, 30], head: 10};
			lexpr = 'sad';
			jx = 1700;
		}
		if (id === '098') {
			pp = reach(idle(gf, 4), 'F', [60, -150], k01(T, 8, 12));
			lx = 620;
			jx = 1900;
		}
	}
	const hipY = FL - 157;
	return (
		<Stage cam={cam} bg="#3b4a5e" light={{x: 50, y: 6, o: 0.36}}>
			<Layer depth={1.5}>
				<Svg>
					<Gym f={gf} mats={day === 7} night={spar} />
				</Svg>
			</Layer>
			<Layer depth={1.12}>
				<Svg>{spar ? <Ring /> : <Bag x={px === 1330 ? 1060 : 1560} f={gf} />}</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					{sitK > 0.02 ? (
						<Actor who="lev" x={lx} seat={hipY + sitK * 120} facing={1} outfit="tee" glove={GL_L} pose={sitFloor(gf, 1)} expr="sad" look={[0.5, -0.3]} uid="levg2" />
					) : (
						<g transform={lie > 0.01 ? `rotate(${-86 * lie} ${lx - 40} ${FL})` : undefined}>
							<Actor who="lev" x={lx} facing={1} outfit="tee" glove={GL_L} pose={lie > 0.5 ? {...idle(gf, 1), armF: [20, 10], armB: [-10, 10]} : lp} expr={lie > 0.5 ? 'worried' : lexpr} look={lie > 0.5 ? [0, -0.8] : [0.7, 0]} uid="levg2" shadow={lie < 0.3} />
						</g>
					)}
					<GhostClock x={lx + 88} y={hipY - 46} k={sl} />
					{spar && jx < 1800 ? <Actor who="junior" x={jx} facing={-1} glove="#f4f4f4" pose={jp} look={[0.7, 0]} uid="junior" /> : null}
					<Actor who="palych" x={px} facing={-1} pose={pp} look={[0.7, 0.1]} handItem={item} uid="palg2" />
					{fx}
					{count > 0 ? <Plate x={id === '056' ? 1400 : spar ? 620 : 1320} y={340} lines={[String(count)]} sub={id === '056' ? 'ПАДЕНИЙ' : 'СЧЁТ'} size={110} k={1} /> : null}
					{id === '071' ? <Tree x={lx0 + 10} y={hipY - 250} k={1} fall={k01(T, D * 0.5, 20)} f={gf} /> : id === '070' ? <Tree x={lx0 + 10} y={hipY - 250} k={k01(T, D * 0.5, 20)} f={gf} /> : null}
				</Svg>
			</Layer>
			<Hud>
				<DayPlate day={day} since={id === '093' ? T - 6 : 99} />
			</Hud>
		</Stage>
	);
};

/* evenings: voice messages */
const Evening7: React.FC = () => {
	const {id} = useT();
	if (id === '059') return <Evening day={7} a="058" toLev={['УПАЛ —', 'НЕ ГЕРОЙСТВУЙ']} onlyLev />;
	if (id === '060') return <Evening day={7} a="058" toLev={[]} toZak={['ФЕРЗЯ ПЕРВЫМ', 'НЕ ВЫВОДИТЕ']} onlyZak />;
	return <Evening day={7} a="058" toLev={['УПАЛ —', 'НЕ ГЕРОЙСТВУЙ']} toZak={['ФЕРЗЯ ПЕРВЫМ', 'НЕ ВЫВОДИТЕ']} />;
};
const Evening15: React.FC = () => {
	const {id} = useT();
	if (id === '079' || id === '080') return <Evening day={15} a="079" toLev={['В УГОЛ НЕ ЛЕЗЬ.', 'В УГЛУ ДОБИВАЮТ.', 'ВЫХОДА ТАМ НЕТ.']} onlyLev levItem={id === '080' ? 'note' : undefined} />;
	return <Evening day={15} a="081" toLev={[]} toZak={['ВЫ ИГРАЕТЕ ЛУЧШЕ,', 'ЧЕМ ГОВОРИТЕ']} onlyZak />;
};
const Evening25: React.FC = () => {
	const {t, d} = useT();
	const u = Math.floor(p01(t('092') / d('092')) * 3);
	return <Evening day={25} a="092" toLev={[]} toZak={['ЗАПИСЬ УДАЛЕНА', '×' + Math.min(3, u + 1)]} onlyZak zakFrom />;
};

/* 099–107: night, the vending machine. They meet for the first time in 25 days. */
const StreetScene: React.FC = () => {
	const {gf, t, d, id} = useT();
	const n = Number(id);
	const cam = useLineCam(
		{
			'099': C(960, 580, 1.0, 960, 590, 1.14),
			'100': C(960, 570, 1.3, 960, 565, 1.42),
			'101': C(800, 660, 1.5, 790, 655, 1.6),
			'102': C(1120, 660, 1.5, 1130, 655, 1.6),
			'103': C(1000, 650, 1.4, 980, 650, 1.5),
			'104': C(920, 650, 1.4, 940, 650, 1.5),
			'105': C(800, 660, 1.5, 810, 655, 1.6),
			'106': C(1120, 660, 1.5, 1110, 655, 1.6),
			'107': C(960, 620, 1.2, 960, 600, 1.06),
		},
		[],
	);
	const wz = walkTo(t('099'), 10, d('099') - 10, 120, 760, 2, 0.3);
	const wl = walkTo(t('099'), 20, d('099') - 4, 1800, 1160, 1, 0.3);
	const sat = n >= 101;
	const zx = sat ? 780 : n === 100 ? 760 : wz.x;
	const lx = sat ? 1140 : n === 100 ? 1160 : wl.x;
	const shake = n === 103 || n === 104 ? 1 : 0;
	let zp: Pose = sat ? sitFloor(gf, 2) : n === 100 ? idle(gf, 2) : wz.pose;
	let lp: Pose = sat ? sitFloor(gf, 1) : n === 100 ? idle(gf, 1) : wl.pose;
	if (sat) {
		zp = {...zp, lean: -6, head: 4, legF: [70, 60], legB: [60, 70]};
		lp = {...lp, lean: -6, head: 4, legF: [70, 60], legB: [60, 70]};
	}
	if (n === 102) lp = reach(lp, 'F', [30, -90], 1);
	if (shake) {
		zp = reach(zp, 'F', [150, -70 + Math.sin(gf / 2.6) * 6], 1);
		lp = reach(lp, 'F', [150, -70 + Math.sin(gf / 2.6) * 6], 1);
	}
	const can = n === 107 ? p01(t('107') / d('107')) : -1;
	const holder = can > 0.5 ? 'l' : 'z';
	if (can >= 0 && holder === 'z') zp = reach(zp, 'F', [50, -150], 1);
	if (can >= 0 && holder === 'l') lp = reach(lp, 'F', [50, -150], 1);
	const seat = FL - 60;
	return (
		<Stage cam={cam} bg="#0e1330" light={{night: true, x: 50, y: 30, o: 0.3}}>
			<Layer depth={1.5}>
				<Svg>
					<Street f={gf} />
				</Svg>
			</Layer>
			<Layer depth={1}>
				<Svg>
					{sat ? <rect x={560} y={FL - 44} width={800} height={44} rx={8} fill="#3a4370" stroke="#1b1e2a" strokeWidth={5} /> : null}
					{sat ? (
						<>
							<Actor who="zakhar" x={zx} seat={seat} facing={1} pose={zp} look={[0.7, 0]} expr={n === 101 ? 'sad' : 'normal'} handItem={can >= 0 && holder === 'z' ? <Can /> : undefined} uid="zakst" />
							<Actor who="lev" x={lx} seat={seat} facing={-1} pose={lp} look={[0.7, 0]} expr={n === 102 ? 'sad' : 'normal'} handItem={can >= 0 && holder === 'l' ? <Can /> : undefined} uid="levst" />
						</>
					) : (
						<>
							<Actor who="zakhar" x={zx} facing={1} pose={zp} bob={n === 99 ? wz.bob : 0} look={[0.7, 0]} uid="zakst" />
							<Actor who="lev" x={lx} facing={-1} pose={lp} bob={n === 99 ? wl.bob : 0} look={[0.7, 0]} uid="levst" />
						</>
					)}
					{n === 100 ? (
						<>
							<Cloud x={620} y={330} t={t('100') - 6} hold={50} lines={['ОДНУ ВОДУ']} size={52} tail={[100, 150]} />
							<Cloud x={1300} y={330} t={t('100') - 6} hold={50} lines={['ОДНУ ВОДУ']} size={52} tail={[-100, 150]} />
						</>
					) : null}
				</Svg>
			</Layer>
			<Hud>
				<DayPlate day={25} label="НОЧЬ" since={n === 99 ? t('099') - 6 : 99} />
			</Hud>
		</Stage>
	);
};

void [Notebook, Clocks, Can, walkTo];
export const SHOTS2: ShotDef[] = [
	...mk(['039', '040'], ClubScene),
	...mk(['041'], BoxTop, false),
	...mk(['042', '043'], ClubScene, false),
	...mk(['044'], BoxTop, false),
	...mk(['045'], BusShop),
	...mk(['046', '047'], ClubScene),
	...mk(['048', '049'], ChaseCard, false),
	...mk(['050'], ClubScene, false),
	...mk(['051', '052', '053', '054', '055', '056', '057'], GymScene),
	...mk(['058', '059', '060'], Evening7),
	...mk(['061', '062'], ClubScene),
	...mk(['063'], KarpovCard, false),
	...mk(['064', '065', '066', '067', '068', '069'], ClubScene, false),
	...mk(['070', '071', '072', '073', '074', '075', '076', '077', '078'], GymScene),
	...mk(['079', '080', '081', '082'], Evening15),
	...mk(['083', '084', '085', '086', '087'], ClubScene),
	...mk(['088'], FlagCard, false),
	...mk(['089', '090', '091'], ClubScene, false),
	...mk(['092'], Evening25),
	...mk(['093', '094', '095', '096', '097', '098'], GymScene),
	...mk(['099', '100', '101', '102', '103', '104', '105', '106', '107'], StreetScene),
];
