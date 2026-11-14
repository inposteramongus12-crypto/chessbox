import React from 'react';
import {useShot} from './core';
import {useCam} from './kit';
import {WHIP_SHIFT, WHIP_ZOOM, whipAt} from './whip';

/* Keeps a box inside the safe zone of the SCREEN (60 px from every edge) whatever the camera and the whip-pan do.
   (x, y) is the box anchor in the depth-1 layer, left/right/top/bottom its extent in world units around the anchor.
   Returns the correction in world units. Used by the day plate, wall signs and captions. */
export const SAFE = 60;
export const useSafeShift = (x: number, y: number, b: {left: number; right: number; top: number; bottom?: number}) => {
	const {gf} = useShot();
	const cam = useCam();
	const w = whipAt(gf);
	const S = w ? 1 + WHIP_ZOOM * w.k : 1;
	const shift = w ? w.dir * WHIP_SHIFT * w.k : 0;
	const m = cam.zoom * S; // screen pixels per world pixel
	const ax = 960 + S * (cam.zoom * (x - 960) - cam.x) + shift;
	const ay = 540 + S * (cam.zoom * (y - 540) - cam.y);
	let cx = 0;
	let cy = 0;
	if (ax - b.left * m < SAFE) cx = (SAFE - (ax - b.left * m)) / m;
	if (ax + b.right * m > 1920 - SAFE) cx = -(ax + b.right * m - (1920 - SAFE)) / m;
	if (ay - b.top * m < SAFE) cy = (SAFE - (ay - b.top * m)) / m;
	if (b.bottom !== undefined && ay + b.bottom * m > 1080 - SAFE) cy = -(ay + b.bottom * m - (1080 - SAFE)) / m;
	return {cx, cy};
};
export const SafeBox: React.FC<{x: number; y: number; left: number; right: number; top: number; bottom?: number; children: React.ReactNode}> = ({x, y, left, right, top, bottom, children}) => {
	const {cx, cy} = useSafeShift(x, y, {left, right, top, bottom});
	return <g transform={`translate(${cx},${cy})`}>{children}</g>;
};
