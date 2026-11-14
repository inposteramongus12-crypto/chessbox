// Shared key pool for eleven-voice.mjs / eleven-voice-en.mjs: keys ELEVENLABS_API_KEY, _2 .. _8 (env only, never printed or stored).
//   --keys N     use keys 1..N (default 8; --key1-only = --keys 1)
//   --skip 2,5   do not use these key numbers
// Credits left per key = min(API counter, local ledger). The ledger (public/vo/.eleven-ledger.json) stores key NUMBERS only.
// A line goes whole to ONE key that has enough credits; keys with the biggest remainder go first; empty keys are skipped.
import fs from 'node:fs';
import path from 'node:path';
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
export const arg = (args, name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

export const createPool = (args, root) => {
	const key1Only = args.includes('--key1-only');
	const maxKeys = key1Only ? 1 : Number(arg(args, '--keys') ?? 8);
	const skip = (arg(args, '--skip') ?? '').split(',').filter(Boolean).map(Number);
	const keys = [];
	for (let n = 1; n <= Math.min(maxKeys, 8); n++) {
		const k = process.env[n === 1 ? 'ELEVENLABS_API_KEY' : `ELEVENLABS_API_KEY_${n}`];
		if (k && !skip.includes(n)) keys.push({n, k, sent: 0, start: null});
	}
	if (!keys.length) throw new Error('no ElevenLabs keys selected (ELEVENLABS_API_KEY .. _8 missing, or all skipped)');
	const ledgerFile = path.join(root, 'public/vo/.eleven-ledger.json');
	fs.mkdirSync(path.dirname(ledgerFile), {recursive: true});
	const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : {};

	// read the subscription of one key (retries on 429, otherwise trusts the local count)
	const refresh = async (key) => {
		let r;
		for (let t = 0; t < 4; t++) {
			r = await fetch('https://api.elevenlabs.io/v1/user/subscription', {headers: {'xi-api-key': key.k}});
			if (r.status !== 429) break;
			await sleep(2000 * 2 ** t);
		}
		if (r.status === 429 && key.start !== null) return;
		if (!r.ok) {
			key.error = `key ${key.n}: subscription ${r.status} ${(await r.text()).slice(0, 160)}`;
			key.left = 0;
			return;
		}
		key.error = null;
		const j = await r.json();
		if (key.start === null) {
			const L = ledger[key.n];
			const est = L && L.base + L.sent > j.character_count ? L.base + L.sent : j.character_count;
			if (!L || j.character_count >= L.base + L.sent) ledger[key.n] = {base: j.character_count, sent: 0};
			key.start = j.character_limit - est;
			key.used0 = est;
		}
		key.limit = j.character_limit;
		key.tier = j.tier;
		key.used = Math.max(j.character_count, key.used0 + key.sent);
		key.left = Math.min(j.character_limit - j.character_count, key.start - key.sent);
	};
	const refreshAll = async () => {
		for (const key of keys) {
			await refresh(key);
			await sleep(1200); // pause between keys: avoid 429
		}
	};
	const book = (key, chars) => {
		key.sent += chars;
		key.left -= chars;
		ledger[key.n].sent += chars;
		fs.writeFileSync(ledgerFile, JSON.stringify(ledger));
	};
	// keys able to take `chars` whole, biggest remainder first
	const candidates = (chars) => keys.filter((k) => !k.error && k.left >= chars).sort((a, b) => b.left - a.left);
	// dry run: can every line go whole to one key? returns lines that do not fit anywhere
	const simulate = (sizes) => {
		const left = new Map(keys.filter((k) => !k.error).map((k) => [k.n, k.left]));
		const unfit = [];
		for (const s of [...sizes].sort((a, b) => b.chars - a.chars)) {
			const best = [...left.entries()].filter(([, v]) => v >= s.chars).sort((a, b) => b[1] - a[1])[0];
			if (best) left.set(best[0], best[1] - s.chars);
			else unfit.push(s.id);
		}
		return unfit;
	};
	return {keys, refresh, refreshAll, book, candidates, simulate};
};
