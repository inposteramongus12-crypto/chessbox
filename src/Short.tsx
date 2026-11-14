import React from 'react';
import {AbsoluteFill} from 'remotion';

// ЗАГЛУШКА шортса (9:16): настоящий Short появится вместе со сценарием.
export const SHORT_FRAMES = 150;
export const Short: React.FC<{sound?: boolean; edge?: boolean}> = () => <AbsoluteFill style={{background: '#101216'}} />;
