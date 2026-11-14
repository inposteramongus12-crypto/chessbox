import React from 'react';
import {AgeBadge} from '../kit/ui';

// ЗАГЛУШКА: места и реквизит роликa появятся вместе со сценарием.
// Нужна, чтобы собирались общие файлы (story/common.tsx берёт отсюда Tag).
export {SafeBox, SAFE, useSafeShift} from '../kit/safebox';

export const Tag: React.FC<{x: number; y: number; value: number; f: number; s?: number; warn?: boolean; ok?: boolean; grey?: boolean; bpm?: number; label?: string; pop?: number; heart?: boolean; auto?: boolean; showBpm?: boolean; heartK?: number}> = ({x, y, value, s = 0.8, pop = 1, label = 'ДЕНЬ'}) => (
	<g>
		<AgeBadge x={x} y={y} value={value} s={s} pop={pop} label={label} c="#ffc94a" />
	</g>
);
