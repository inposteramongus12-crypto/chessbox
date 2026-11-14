// ENGLISH track: voices src/story/lines.en.json with ElevenLabs (flash v2.5, 0.5 credit/char) -> public/vo_en/<id>.mp3.
//   node tools/eleven-voice.mjs --plan              count characters still to voice, show credits on all keys, no voicing
//   node tools/eleven-voice.mjs [--only 077,078]     voice (skips lines already voiced with the same text)
//   node tools/eleven-voice.mjs ... --keys 8 --skip 2,5   use keys 1..8 (default), skip key numbers; --key1-only = --keys 1
//   node tools/eleven-voice.mjs ... --force          re-voice even if already done
// Voices come from src/story/voices.json: {"N": {"name": "George", "eleven": "<voice_id>"}, ...}.
// Keys only from the environment (ELEVENLABS_API_KEY, _2 .. _7); never printed or stored. See tools/eleven-keys.mjs.
// Each line goes whole to one key with enough credits, biggest remainder first.
// The subscription counter on ElevenLabs lags behind, so the remaining credits are also tracked locally
// (credits at start minus characters sent) and the smaller of the two numbers is trusted.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createPool, sleep} from './eleven-keys.mjs';
if (!process.env.NODE_USE_ENV_PROXY && process.env.HTTPS_PROXY) {
	const r = spawnSync(process.execPath, process.argv.slice(1), {stdio: 'inherit', env: {...process.env, NODE_USE_ENV_PROXY: '1'}});
	process.exit(r.status ?? 1);
}
const MODEL = 'eleven_flash_v2_5'; // English track: half a credit per character (the budget does not cover 11.6k chars at 1:1)
const FACTOR = 0.5;
const args = process.argv.slice(2);
const plan = args.includes('--plan');
const force = args.includes('--force');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : [];
const root = process.cwd();
const lines = JSON.parse(fs.readFileSync(path.join(root, 'src/story/lines.en.json'), 'utf8'));
const voices = JSON.parse(fs.readFileSync(path.join(root, 'src/story/voices.json'), 'utf8'));
const outDir = path.join(root, 'public/vo_en');
fs.mkdirSync(outDir, {recursive: true});
const madeFile = path.join(outDir, '.made-eleven.json');
const made = fs.existsSync(madeFile) ? JSON.parse(fs.readFileSync(madeFile, 'utf8')) : {};

const pool = createPool(args, root); // shared ledger: public/vo/.eleven-ledger.json (all keys, both tracks)
const KEYS = pool.keys;
const todo = lines.filter((l) => !(only.length && !only.some((o) => l.id.startsWith(o))) && (force || made[l.id] !== l.t));
const need = Math.ceil(todo.reduce((a, l) => a + [...l.t].length, 0) * FACTOR);
const all = lines.reduce((a, l) => a + [...l.t].length, 0);
console.log(`lines: ${lines.length}, characters in all lines: ${all}`);
console.log(`to voice now: ${todo.length} lines, ${need} characters (not selected or already voiced: ${lines.length - todo.length} lines)`);
await pool.refreshAll();
let have = 0;
for (const key of KEYS) {
	if (key.error) console.log(key.error);
	else {
		have += key.left;
		console.log(`key ${key.n}: ${key.tier}, used ${key.used} of ${key.limit}, left ${key.left}`);
	}
}
console.log(`credits available: ${have}, needed: ${need}, reserve: ${have - need}`);
const unfit = pool.simulate(todo.map((l) => ({id: l.id, chars: Math.ceil([...l.t].length * FACTOR)})));
if (unfit.length) console.log(`lines that fit no single key: ${unfit.join(', ')}`);
if (plan) process.exit(0);
if (have < need || unfit.length) {
	console.log('NOT ENOUGH CREDITS for everything (or a line fits no single key): nothing voiced. Shorten the text or voice part of it with --only.');
	process.exit(1);
}

const failed = [];
for (const l of todo) {
	const v = voices[l.sp]?.eleven;
	if (!v) {
		failed.push(`${l.id} (no voice for ${l.sp})`);
		continue;
	}
	const chars = Math.ceil([...l.t].length * FACTOR);
	let done = false;
	for (const key of pool.candidates(chars)) {
		let r;
		for (let t = 0; t < 5; t++) {
			r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v}?output_format=mp3_44100_128`, {
				method: 'POST',
				headers: {'xi-api-key': key.k, 'content-type': 'application/json'},
				body: JSON.stringify({text: l.t, model_id: MODEL}),
			});
			if (r.status !== 429) break;
			await sleep(3000 * 2 ** t);
		}
		if (!r.ok) {
			const msg = (await r.text()).slice(0, 200);
			console.log(`key ${key.n} refused ${l.id}: ${r.status} ${msg}`);
			if (/quota|credits|limit/i.test(msg)) {
				key.left = 0; // empty after all: skip it from now on
				continue;
			}
			break;
		}
		const buf = Buffer.from(await r.arrayBuffer());
		if (buf.length < 2000) {
			console.log(`${l.id}: empty audio`);
			break;
		}
		fs.writeFileSync(path.join(outDir, l.id + '.mp3'), buf);
		pool.book(key, chars);
		made[l.id] = l.t;
		fs.writeFileSync(madeFile, JSON.stringify(made, null, 1));
		console.log(`voiced ${l.id} ${l.sp} (${voices[l.sp].name}) ${chars} chars, key ${key.n}`);
		done = true;
		await sleep(1200); // stay under the request rate limit
		break;
	}
	if (!done) failed.push(l.id);
}
for (const key of KEYS) console.log(`key ${key.n}: characters sent this run ${key.sent}`);
if (failed.length) console.log('FAILED: ' + failed.join(', ') + ' — run the same command again: finished lines are kept.');
