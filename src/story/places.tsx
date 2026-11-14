import React from 'react';
import {random} from 'remotion';
import {AgeBadge, FONT} from '../kit/ui';
import {FL, NAVY, GOLD} from './lib';

export {SafeBox, SAFE, useSafeShift} from '../kit/safebox';
/* kept for common.tsx (template helper) */
export const Tag: React.FC<{x: number; y: number; value: number; f: number; s?: number; warn?: boolean; ok?: boolean; grey?: boolean; bpm?: number; label?: string; pop?: number; heart?: boolean; auto?: boolean; showBpm?: boolean; heartK?: number}> = ({x, y, value, s = 0.8, pop = 1, label = 'ДЕНЬ'}) => (
	<g>
		<AgeBadge x={x} y={y} value={value} s={s} pop={pop} label={label} c="#ffc94a" />
	</g>
);

const O = '#1b1e2a'; // outline

/* small chess piece silhouettes on a table seen from the side */
const SidePieces: React.FC<{x: number; y: number; n?: number; seed?: string; w?: number; skip?: number[]}> = ({x, y, n = 10, seed = 'sp', w = 150, skip = []}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			if (skip.includes(i)) return null;
			const px = x - w / 2 + (w * (i + 0.5)) / n;
			const h = 16 + Math.floor(random(seed + i) * 3) * 7;
			const white = i < n / 2;
			return (
				<g key={i}>
					<rect x={px - 5} y={y - h} width={10} height={h} rx={3} fill={white ? '#fffaf0' : '#2a2d44'} stroke={O} strokeWidth={2.5} />
					<circle cx={px} cy={y - h - 4} r={6} fill={white ? '#fffaf0' : '#2a2d44'} stroke={O} strokeWidth={2.5} />
				</g>
			);
		})}
	</g>
);
/* chess table seen from the side: (x) centre, top at y. Board, pieces, optional clock under the near edge. */
export const ChessTable: React.FC<{x: number; y?: number; w?: number; clock?: boolean; pieces?: boolean; seed?: string; skip?: number[]; cloth?: string}> = ({x, y = 700, w = 330, clock, pieces = true, seed, skip, cloth = '#8a5a34'}) => (
	<g>
		<rect x={x - w / 2 + 22} y={y + 14} width={14} height={FL - y - 14} fill="#3a2a1e" />
		<rect x={x + w / 2 - 36} y={y + 14} width={14} height={FL - y - 14} fill="#3a2a1e" />
		<rect x={x - w / 2} y={y} width={w} height={22} rx={5} fill={cloth} stroke={O} strokeWidth={4} />
		<rect x={x - 96} y={y - 12} width={192} height={14} rx={3} fill="#ecd9b0" stroke={O} strokeWidth={3} />
		{Array.from({length: 8}).map((_, i) => (i % 2 ? <rect key={i} x={x - 96 + i * 24} y={y - 12} width={24} height={14} fill="#b9854f" /> : null))}
		{pieces ? <SidePieces x={x} y={y - 12} seed={seed} skip={skip} /> : null}
		{clock ? (
			<g transform={`translate(${x},${y + 22})`}>
				<rect x={-44} y={0} width={88} height={40} rx={6} fill="#23263a" stroke={O} strokeWidth={3} />
				<circle cx={-20} cy={20} r={12} fill="#fffaf0" stroke={O} strokeWidth={2.5} />
				<circle cx={20} cy={20} r={12} fill="#fffaf0" stroke={O} strokeWidth={2.5} />
				<rect x={-30} y={-8} width={20} height={9} rx={3} fill="#c9ced8" stroke={O} strokeWidth={2} />
				<rect x={10} y={-5} width={20} height={6} rx={3} fill="#c9ced8" stroke={O} strokeWidth={2} />
			</g>
		) : null}
	</g>
);
export const Stool: React.FC<{x: number; y?: number; c?: string}> = ({x, y = 748, c = '#c99a62'}) => (
	<g>
		<rect x={x - 40} y={y + 8} width={9} height={FL - y - 8} fill="#2c2f38" />
		<rect x={x + 31} y={y + 8} width={9} height={FL - y - 8} fill="#2c2f38" />
		<rect x={x - 52} y={y - 6} width={104} height={16} rx={6} fill={c} stroke={O} strokeWidth={3} />
	</g>
);

/* ------------------------------------------------------------ шахматный клуб «Белая ладья» */
export const Club: React.FC<{f: number; night?: boolean; hours?: number; sign?: boolean; notice?: number}> = ({f, night, hours = 0, sign = true, notice = 0}) => {
	const hh = (f / 3600 + hours) * 30;
	const mm = (f / 60 + hours * 60) * 6;
	return (
		<g>
			<rect x={-400} y={-200} width={2720} height={1100} fill={night ? '#6f6452' : '#dccba6'} />
			<rect x={-400} y={560} width={2720} height={340} fill={night ? '#5a4634' : '#a9794d'} />
			<rect x={-400} y={552} width={2720} height={14} fill="#6e4a2c" />
			{Array.from({length: 16}).map((_, i) => (
				<rect key={i} x={-380 + i * 170} y={590} width={130} height={280} rx={8} fill="none" stroke="#7d5632" strokeWidth={5} opacity={0.6} />
			))}
			<rect x={90} y={150} width={330} height={330} rx={10} fill={night ? '#1a2350' : '#bfe6ff'} stroke="#6e4a2c" strokeWidth={16} />
			<line x1={255} y1={150} x2={255} y2={480} stroke="#6e4a2c" strokeWidth={10} />
			<line x1={90} y1={315} x2={420} y2={315} stroke="#6e4a2c" strokeWidth={10} />
			{sign ? (
				<g transform="translate(960,262)">
					<rect x={-300} y={-58} width={600} height={116} rx={16} fill="#3a2a1e" stroke={O} strokeWidth={5} />
					<text x={34} y={18} textAnchor="middle" fontSize={54} fontFamily={FONT} fontWeight={900} fill="#f6e7c1" letterSpacing={2}>
						БЕЛАЯ ЛАДЬЯ
					</text>
					<path d="M-262,34 L-258,-6 L-270,-6 L-270,-36 L-256,-36 L-256,-24 L-246,-24 L-246,-36 L-232,-36 L-232,-24 L-222,-24 L-222,-36 L-208,-36 L-208,-6 L-220,-6 L-216,34 Z" fill="#fffaf0" stroke={O} strokeWidth={4} />
				</g>
			) : null}
			{[0, 1, 2].map((i) => (
				<g key={i}>
					<rect x={1330 + i * 120 - 640} y={350 + (i % 2) * 26} width={92} height={120} rx={4} fill="#fffaf0" stroke="#b08a3e" strokeWidth={7} />
					<circle cx={1376 + i * 120 - 640} cy={440 + (i % 2) * 26} r={12} fill="#d9372b" />
					<rect x={1346 + i * 120 - 640} y={370 + (i % 2) * 26} width={60} height={8} fill="#c9bfa6" />
					<rect x={1346 + i * 120 - 640} y={388 + (i % 2) * 26} width={44} height={8} fill="#c9bfa6" />
				</g>
			))}
			<g transform="translate(1560,210)">
				<circle r={74} fill="#fffaf0" stroke="#6e4a2c" strokeWidth={12} />
				{Array.from({length: 12}).map((_, i) => (
					<rect key={i} x={-3} y={-62} width={6} height={12} fill={O} transform={`rotate(${i * 30})`} />
				))}
				<rect x={-4} y={-40} width={8} height={44} rx={4} fill={O} transform={`rotate(${hh})`} />
				<rect x={-3} y={-58} width={6} height={62} rx={3} fill="#d9372b" transform={`rotate(${mm})`} />
			</g>
			{notice > 0.01 ? (
				<g transform={`translate(1290,${410 - (1 - notice) * 40}) rotate(${-4 + (1 - notice) * 10})`} opacity={notice}>
					<rect x={-170} y={-46} width={340} height={92} rx={6} fill="#fffaf0" stroke={O} strokeWidth={4} />
					<text x={0} y={16} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={900} fill="#d9372b">
						БЕЗ ФИНТОВ
					</text>
				</g>
			) : null}
			<g transform="translate(1760,900)">
				<rect x={-46} y={-96} width={92} height={96} rx={10} fill="#b5532f" stroke={O} strokeWidth={4} />
				{[-50, -20, 10, 40, -36, 26].map((a, i) => (
					<ellipse key={i} cx={Math.sin((a * Math.PI) / 180) * (90 + (i % 2) * 40)} cy={-170 - (i % 3) * 60 + Math.sin(f / 40 + i) * 3} rx={26} ry={56} fill={i % 2 ? '#3f9e58' : '#2f7d45'} stroke={O} strokeWidth={3} transform={`rotate(${a} ${Math.sin((a * Math.PI) / 180) * 90} ${-170 - (i % 3) * 60})`} />
				))}
			</g>
			<rect x={-400} y={FL} width={2720} height={400} fill={night ? '#3a2228' : '#7a3b3b'} />
			<rect x={220} y={FL + 14} width={1480} height={120} rx={8} fill="none" stroke="#c9975a" strokeWidth={6} opacity={0.6} />
		</g>
	);
};

/* ------------------------------------------------------------ боксёрский зал */
export const Bag: React.FC<{x: number; f: number; hit?: number; c?: string}> = ({x, f, hit = 0, c = '#b3402e'}) => {
	const a = Math.sin(f / 16) * 1.5 + hit * 11 * Math.cos(f / 3.2);
	return (
		<g transform={`rotate(${a} ${x} 80)`}>
			<line x1={x} y1={-200} x2={x} y2={300} stroke="#9aa3b5" strokeWidth={7} />
			<rect x={x - 62} y={300} width={124} height={360} rx={40} fill={c} stroke={O} strokeWidth={5} />
			<rect x={x - 62} y={350} width={124} height={22} fill="#7d2a1e" />
			<rect x={x - 62} y={560} width={124} height={22} fill="#7d2a1e" />
			<rect x={x - 40} y={320} width={12} height={300} rx={6} fill="#e06a52" opacity={0.6} />
		</g>
	);
};
export const Gym: React.FC<{f: number; night?: boolean; mats?: boolean}> = ({night, mats}) => (
	<g>
		<rect x={-400} y={-200} width={2720} height={1100} fill={night ? '#252c3d' : '#3b4a5e'} />
		{Array.from({length: 9}).map((_, r) => Array.from({length: 16}).map((__, i) => <rect key={r + '-' + i} x={-380 + i * 170 + (r % 2) * 85} y={-60 + r * 80} width={160} height={70} rx={4} fill="#000" opacity={0.07} />))}
		<rect x={-400} y={640} width={2720} height={260} fill={night ? '#1f2636' : '#2f3c4e'} />
		<rect x={120} y={90} width={420} height={170} rx={8} fill={night ? '#141a3a' : '#a9d8f5'} stroke="#1f2733" strokeWidth={14} />
		<line x1={330} y1={90} x2={330} y2={260} stroke="#1f2733" strokeWidth={8} />
		<g opacity={0.9}>
			<rect x={1300} y={470} width={18} height={270} fill="#c9ced8" stroke={O} strokeWidth={3} />
			<rect x={1840} y={470} width={18} height={270} fill="#c9ced8" stroke={O} strokeWidth={3} />
			{[500, 560, 620].map((y, i) => (
				<line key={i} x1={1309} y1={y} x2={1849} y2={y} stroke={i === 1 ? '#f4f4f4' : '#d9372b'} strokeWidth={8} />
			))}
			<rect x={1270} y={740} width={640} height={50} fill="#23305e" stroke={O} strokeWidth={4} />
		</g>
		<line x1={960} y1={-200} x2={960} y2={70} stroke="#111" strokeWidth={6} />
		<path d="M900,110 L1020,110 L990,60 L930,60 Z" fill="#1f2733" stroke={O} strokeWidth={4} />
		<polygon points="910,112 1010,112 1290,900 630,900" fill="#fff3d0" opacity={night ? 0.1 : 0.07} />
		<rect x={-400} y={FL} width={2720} height={400} fill={night ? '#3a2f26' : '#6b523c'} />
		{Array.from({length: 12}).map((_, i) => (
			<line key={i} x1={-380 + i * 240} y1={FL} x2={-520 + i * 280} y2={1300} stroke="#000" strokeWidth={3} opacity={0.15} />
		))}
		{mats ? <rect x={360} y={FL - 16} width={1200} height={34} rx={10} fill="#2f6fa8" stroke={O} strokeWidth={4} /> : null}
	</g>
);

/* ------------------------------------------------------------ телестудия и раздевалка */
export const TvStudio: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-400} y={-200} width={2720} height={1100} fill="#3a2a66" />
		{[0, 1, 2, 3, 4].map((i) => (
			<rect key={i} x={-200 + i * 520} y={-200} width={260} height={1100} fill="#4a3780" opacity={0.6} />
		))}
		<rect x={1120} y={180} width={560} height={330} rx={18} fill="#1a1433" stroke="#8f7fe0" strokeWidth={8} />
		{[0, 1, 2, 3, 4, 5].map((i) => {
			const h = 40 + ((i * 53 + Math.floor(f / 6) * 17) % 180);
			return <rect key={i} x={1160 + i * 82} y={470 - h} width={56} height={h} fill="#8f7fe0" opacity={0.5} />;
		})}
		{[300, 700].map((x, i) => (
			<g key={i}>
				<line x1={x} y1={-200} x2={x} y2={40} stroke="#111" strokeWidth={8} />
				<rect x={x - 44} y={30} width={88} height={62} rx={8} fill="#15121f" stroke={O} strokeWidth={4} />
				<polygon points={`${x - 36},92 ${x + 36},92 ${x + 260},900 ${x - 260},900`} fill="#fff3d0" opacity={0.08} />
			</g>
		))}
		<rect x={-400} y={FL} width={2720} height={400} fill="#241a40" />
		<ellipse cx={960} cy={FL + 60} rx={760} ry={70} fill="#32265a" />
	</g>
);
export const Armchair: React.FC<{x: number; c?: string}> = ({x, c = '#c94f7a'}) => (
	<g>
		<rect x={x - 96} y={560} width={56} height={320} rx={22} fill={c} stroke={O} strokeWidth={5} />
		<rect x={x - 70} y={740} width={200} height={130} rx={24} fill={c} stroke={O} strokeWidth={5} />
		<rect x={x - 50} y={724} width={170} height={40} rx={16} fill="#e07a9e" stroke={O} strokeWidth={4} />
		<rect x={x - 60} y={868} width={16} height={32} fill="#2c2f38" />
		<rect x={x + 100} y={868} width={16} height={32} fill="#2c2f38" />
	</g>
);
export const Locker: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-400} y={-200} width={2720} height={1100} fill="#46566b" />
		{Array.from({length: 13}).map((_, i) => (
			<g key={i}>
				<rect x={-360 + i * 200} y={120} width={184} height={640} rx={8} fill={i % 2 ? '#5f7896' : '#587190'} stroke={O} strokeWidth={5} />
				{[0, 1, 2].map((j) => (
					<rect key={j} x={-330 + i * 200} y={160 + j * 22} width={124} height={8} rx={4} fill="#34455a" />
				))}
				<rect x={-200 + i * 200} y={420} width={12} height={46} rx={5} fill="#c9ced8" />
			</g>
		))}
		<rect x={-400} y={FL} width={2720} height={400} fill="#2b3442" />
		<rect x={520} y={770} width={900} height={26} rx={8} fill="#c99a62" stroke={O} strokeWidth={4} />
		<rect x={560} y={796} width={16} height={104} fill="#2c2f38" />
		<rect x={1364} y={796} width={16} height={104} fill="#2c2f38" />
		<g transform={`rotate(${Math.sin(f / 18) * 2} 1560 60)`}>
			<line x1={1560} y1={-200} x2={1560} y2={250} stroke="#9aa3b5" strokeWidth={7} />
			<rect x={1504} y={250} width={112} height={330} rx={38} fill="#b3402e" stroke={O} strokeWidth={5} />
		</g>
	</g>
);

/* ------------------------------------------------------------ ночная улица и автомат с водой */
export const Street: React.FC<{f: number; glow?: number}> = ({f, glow = 1}) => (
	<g>
		<rect x={-400} y={-200} width={2720} height={1100} fill="#0e1330" />
		{Array.from({length: 26}).map((_, i) => (
			<circle key={i} cx={random('st' + i) * 2400 - 240} cy={random('sy' + i) * 380 - 120} r={1.5 + random('sr' + i) * 2} fill="#fff" opacity={0.3 + 0.4 * Math.abs(Math.sin(f / 30 + i))} />
		))}
		{[
			[-200, 340, 420],
			[260, 240, 360],
			[660, 400, 300],
			[1240, 300, 380],
			[1660, 380, 460],
		].map(([x, y, w], i) => (
			<g key={i}>
				<rect x={x} y={y} width={w} height={FL - y} fill={i % 2 ? '#1a2148' : '#151b3d'} />
				{Array.from({length: 4}).map((_, r) => Array.from({length: Math.floor(w / 90)}).map((__, c) => <rect key={r + '-' + c} x={x + 28 + c * 90} y={y + 36 + r * 96} width={44} height={56} fill={random(`w${i}${r}${c}`) > 0.72 ? '#ffd98a' : '#232b5c'} opacity={0.9} />))}
			</g>
		))}
		<rect x={380} y={300} width={14} height={600} fill="#2a3052" />
		<path d="M387,300 C387,250 470,250 500,270" stroke="#2a3052" strokeWidth={12} fill="none" />
		<ellipse cx={506} cy={278} rx={26} ry={12} fill="#ffe9ad" />
		<polygon points="486,286 526,286 700,900 330,900" fill="#ffe9ad" opacity={0.08} />
		<rect x={-400} y={FL} width={2720} height={400} fill="#232a4e" />
		<rect x={-400} y={FL} width={2720} height={18} fill="#3a4370" />
		<rect x={-400} y={FL + 96} width={2720} height={26} fill="#3a4370" />
		<g transform="translate(960,900)">
			<ellipse cx={0} cy={-200} rx={330} ry={300} fill="#7fd0ff" opacity={0.12 * glow} style={{filter: 'blur(30px)'}} />
			<rect x={-120} y={-470} width={240} height={470} rx={16} fill="#2f6fd8" stroke={O} strokeWidth={6} />
			<rect x={-98} y={-446} width={150} height={290} rx={8} fill="#d6f1ff" stroke={O} strokeWidth={4} opacity={0.75 + 0.25 * glow} />
			{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={r + '-' + c} x={-86 + c * 46} y={-432 + r * 92} width={30} height={62} rx={8} fill={['#ff6a5a', '#3fc1c9', '#ffd34a'][(r + c) % 3]} stroke={O} strokeWidth={3} />))}
			<rect x={66} y={-430} width={38} height={120} rx={6} fill="#1b2a55" stroke={O} strokeWidth={3} />
			<circle cx={85} cy={-270} r={10} fill="#ffd34a" stroke={O} strokeWidth={3} />
			<rect x={-90} y={-124} width={180} height={62} rx={8} fill="#132046" stroke={O} strokeWidth={4} />
		</g>
	</g>
);

/* ------------------------------------------------------------ арена и ринг */
export const Arena: React.FC<{f: number; lights?: number; crowdUp?: number}> = ({f, lights = 1, crowdUp = 0}) => (
	<g>
		<rect x={-400} y={-200} width={2720} height={1300} fill="#0d1028" />
		{[0, 1, 2].map((r) => (
			<g key={r}>
				<rect x={-400} y={330 + r * 80} width={2720} height={90} fill={['#181c40', '#1d2250', '#232960'][r]} />
				{Array.from({length: 34}).map((_, i) => {
					const up = crowdUp * (0.6 + 0.4 * random(`cu${r}${i}`)) * 46 + Math.abs(Math.sin(f / 6 + i * 1.7 + r)) * 10 * crowdUp;
					const cx = -360 + i * 80 + (r % 2) * 40;
					return (
						<g key={i}>
							<rect x={cx - 17} y={352 + r * 80 - up} width={34} height={70 + up} rx={12} fill={['#f2b21c', '#d94a3a', '#3aa37a', '#8b5cf6', '#e86aa0', '#3fc1c9', '#f08a3c'][Math.floor(random(`cc${r}${i}`) * 7)]} opacity={0.5 + r * 0.12} />
							<circle cx={cx} cy={338 + r * 80 - up} r={19} fill="#f4f1e6" opacity={0.55 + r * 0.12} />
						</g>
					);
				})}
			</g>
		))}
		<rect x={-400} y={570} width={2720} height={340} fill="#10132e" />
		{[420, 960, 1500].map((x, i) => (
			<polygon key={i} points={`${x - 30},-200 ${x + 30},-200 ${x + 380},900 ${x - 380},900`} fill="#fff6dc" opacity={0.07 * lights} />
		))}
	</g>
);
/* ring seen from the side: posts and ropes behind the fighters */
export const Ring: React.FC = () => (
	<g>
		{[240, 1680].map((x, i) => (
			<g key={i}>
				<rect x={x - 12} y={520} width={24} height={380} fill="#e9eef5" stroke={O} strokeWidth={4} />
				<rect x={x - 22} y={500} width={44} height={36} rx={8} fill={i ? '#2f6fd8' : '#d9372b'} stroke={O} strokeWidth={4} />
			</g>
		))}
		{[570, 660, 750].map((y, i) => (
			<line key={i} x1={240} y1={y} x2={1680} y2={y} stroke={i === 1 ? '#f4f4f4' : '#d9372b'} strokeWidth={9} />
		))}
	</g>
);
export const RingFloor: React.FC = () => (
	<g>
		<rect x={150} y={FL} width={1620} height={34} rx={6} fill="#e3e8f2" stroke={O} strokeWidth={5} />
		<rect x={170} y={FL + 34} width={1580} height={300} fill="#23305e" stroke={O} strokeWidth={5} />
		<rect x={170} y={FL + 70} width={1580} height={18} fill={GOLD} opacity={0.85} />
		<rect x={-400} y={FL + 150} width={2720} height={300} fill="#090b1d" />
	</g>
);

/* ------------------------------------------------------------ зал сеанса одновременной игры */
export const SimulHall: React.FC = () => (
	<g>
		<rect x={-400} y={-200} width={2720} height={1100} fill="#cfd9e6" />
		{[0, 1, 2, 3, 4].map((i) => (
			<g key={i}>
				<rect x={-160 + i * 480} y={80} width={260} height={420} rx={130} fill="#e9f3ff" stroke="#9fb0c8" strokeWidth={12} />
				<line x1={-30 + i * 480} y1={80} x2={-30 + i * 480} y2={500} stroke="#9fb0c8" strokeWidth={8} />
			</g>
		))}
		<rect x={-400} y={600} width={2720} height={300} fill="#b3c1d4" />
		<rect x={-400} y={FL} width={2720} height={400} fill="#8a6a4a" />
		{Array.from({length: 14}).map((_, i) => (
			<line key={i} x1={-380 + i * 200} y1={FL} x2={-520 + i * 240} y2={1300} stroke="#000" strokeWidth={3} opacity={0.12} />
		))}
	</g>
);

/* ------------------------------------------------------------ магазин: прилавок с яблоками */
export const ShopSet: React.FC = () => (
	<g>
		<rect x={-400} y={-200} width={2720} height={1100} fill="#e9dfc6" />
		{[0, 1, 2].map((r) => (
			<g key={r}>
				<rect x={-200} y={170 + r * 150} width={2320} height={18} fill="#a9794d" stroke={O} strokeWidth={3} />
				{Array.from({length: 22}).map((_, i) => (
					<rect key={i} x={-180 + i * 104} y={96 + r * 150} width={64} height={74} rx={8} fill={['#ff8f6a', '#7fc8a0', '#ffd34a', '#8fb8ff'][(i + r) % 4]} stroke={O} strokeWidth={3} opacity={0.8} />
				))}
			</g>
		))}
		<rect x={-400} y={FL} width={2720} height={400} fill="#b9a583" />
		<rect x={520} y={640} width={980} height={260} rx={10} fill="#4b8f80" stroke={O} strokeWidth={5} />
		<rect x={500} y={620} width={1020} height={34} rx={8} fill="#e9f4f1" stroke={O} strokeWidth={5} />
	</g>
);
export const Apple: React.FC<{x: number; y: number; pear?: boolean; k?: number}> = ({x, y, pear, k = 1}) => (
	<g transform={`translate(${x},${y - (1 - k) * 90})`} opacity={k}>
		{pear ? <path d="M0,-58 C-14,-44 -12,-30 -22,-18 C-34,0 -20,20 0,20 C20,20 34,0 22,-18 C12,-30 14,-44 0,-58 Z" fill="#c8d94a" stroke={O} strokeWidth={4} /> : <circle cx={0} cy={-8} r={27} fill="#d9372b" stroke={O} strokeWidth={4} />}
		<path d={pear ? 'M0,-58 L4,-72' : 'M0,-34 L5,-48'} stroke="#5a3a22" strokeWidth={5} strokeLinecap="round" />
		<circle cx={-9} cy={-16} r={6} fill="#fff" opacity={0.4} />
	</g>
);

/* ------------------------------------------------------------ мелкий реквизит (в руке: начало координат = кисть) */
export const Phone: React.FC<{c?: string}> = ({c = '#23263a'}) => (
	<g transform="rotate(-12)">
		<rect x={-13} y={-40} width={26} height={48} rx={6} fill={c} stroke="#0b0d1e" strokeWidth={3} />
		<rect x={-9} y={-35} width={18} height={34} rx={3} fill="#9fd8ff" />
	</g>
);
export const Needles: React.FC<{f: number}> = ({f}) => (
	<g>
		<line x1={-8} y1={8} x2={40 + Math.sin(f / 4) * 6} y2={-44} stroke="#d6d6de" strokeWidth={5} strokeLinecap="round" />
		<line x1={8} y1={8} x2={-30 - Math.sin(f / 4) * 6} y2={-40} stroke="#d6d6de" strokeWidth={5} strokeLinecap="round" />
		<path d="M-18,6 C-14,34 22,34 20,4 Z" fill="#e86aa0" stroke="#0b0d1e" strokeWidth={3} />
	</g>
);
export const Mitt: React.FC<{c?: string}> = ({c = '#7d4a2a'}) => <ellipse cx={4} cy={-6} rx={30} ry={38} fill={c} stroke="#0b0d1e" strokeWidth={4} />;
export const Notebook: React.FC = () => (
	<g transform="rotate(-10)">
		<rect x={-20} y={-34} width={40} height={50} rx={4} fill="#fffaf0" stroke="#0b0d1e" strokeWidth={3} />
		<line x1={-12} y1={-20} x2={12} y2={-20} stroke="#9aa3b5" strokeWidth={3} />
		<line x1={-12} y1={-8} x2={12} y2={-8} stroke="#9aa3b5" strokeWidth={3} />
	</g>
);
export const Can: React.FC<{x?: number; y?: number; c?: string}> = ({x = 0, y = 0, c = '#3fc1c9'}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-11} y={-34} width={22} height={40} rx={6} fill={c} stroke="#0b0d1e" strokeWidth={3} />
		<rect x={-11} y={-22} width={22} height={8} fill="#fff" opacity={0.6} />
	</g>
);
/* heading of a fact card: name and year on one dark plate */
export const FactHead: React.FC<{title: string; year: string; k: number; y?: number}> = ({title, year, k, y = 170}) => {
	const w = (title.length + year.length + 2) * 84 * 0.66 + 120;
	return (
		<g transform={`translate(960,${y - (1 - k) * 40})`} opacity={k}>
			<rect x={-w / 2} y={-76} width={w} height={152} rx={28} fill={NAVY} stroke={GOLD} strokeWidth={6} />
			<text x={-w / 2 + 50} y={30} fontSize={84} fontFamily={FONT} fontWeight={900} fill="#fff">
				{title}
			</text>
			<text x={w / 2 - 50} y={30} textAnchor="end" fontSize={84} fontFamily={FONT} fontWeight={900} fill={GOLD}>
				{year}
			</text>
		</g>
	);
};
