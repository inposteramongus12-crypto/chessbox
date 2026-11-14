import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Layer, Svg} from './engine/camera';
import {Stage, camOn} from './kit/kit';
import {SafeBox} from './kit/safebox';
import {AgeBadge} from './kit/ui';
import {Actor, useShot} from './kit/core';
import {idle} from './kit/actions';

// ЗАГЛУШКА сцены: один герой и плашка в безопасной зоне. По ней проверяются сборка, пробный кадр и check-edges.
export const StubScene: React.FC = () => {
	const {gf} = useShot();
	return (
		<Stage cam={camOn(960, 540, 1)} bg="#101216" still>
			<Layer depth={1}>
				<Svg>
					<rect x={0} y={900} width={1920} height={180} fill="#1b1f2a" />
					<Actor who="hero" x={960} s={1.2} pose={idle(gf)} />
					<SafeBox x={960} y={330} left={200} right={200} top={60} bottom={60}>
						<AgeBadge x={960} y={330} value={1} label="ЗАГЛУШКА" />
					</SafeBox>
				</Svg>
			</Layer>
		</Stage>
	);
};
export const Stub: React.FC = () => <AbsoluteFill />;
