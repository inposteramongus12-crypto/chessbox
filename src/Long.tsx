import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ShotCtx, TOTAL} from './kit/core';
import {EdgeCtx} from './kit/kit';
import {EdgeProbe} from './kit/edgeprobe';
import {StubScene} from './stub';

// ЗАГЛУШКА лонга: одна сцена. Настоящий Long (ShotHost, whip, озвучка) подключается вместе со сценарием.
export const Long: React.FC<{sound?: boolean; edge?: boolean}> = ({edge = false}) => (
	<EdgeCtx.Provider value={edge}>
		{edge ? <EdgeProbe /> : null}
		<AbsoluteFill style={{background: '#000'}}>
			<ShotCtx.Provider value={{f: 0, gf: 0, dur: TOTAL, start: 0, at: () => 0, end: () => TOTAL}}>
				<StubScene />
			</ShotCtx.Provider>
		</AbsoluteFill>
	</EdgeCtx.Provider>
);
export const LONG_FRAMES = TOTAL;
