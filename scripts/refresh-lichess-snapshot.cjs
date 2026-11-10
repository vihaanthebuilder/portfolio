#!/usr/bin/env node
/* node scripts/refresh-lichess-snapshot.cjs [--from-dir /path/to/raw-evidence] */
'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const Model = require('../gameroom-model.js');
const base = 'https://lichess.org/api/';
const endpoints = {
  profile: base + 'user/vihaan_67', history: base + 'user/vihaan_67/rating-history',
  activity: base + 'user/vihaan_67/activity', games: base + 'games/user/vihaan_67?max=200&rated=true&opening=true&moves=true'
};
async function request(url, accept = 'application/json') {
  const response = await fetch(url, { headers: { Accept: accept }, signal: AbortSignal.timeout(12000) });
  return response;
}
async function collect() {
  const sourceIndex = process.argv.indexOf('--from-dir');
  const sources = {};
  const raw = {};
  if (sourceIndex !== -1) {
    const dir = process.argv[sourceIndex + 1];
    if (!dir) throw new Error('--from-dir requires a directory');
    const metadata = JSON.parse(await fs.readFile(path.join(dir, 'retrieval-metadata.json'), 'utf8'));
    const files = { profile: 'profile.json', history: 'rating-history.json', activity: 'activity.json', games: 'games.ndjson' };
    for (const [key, file] of Object.entries(files)) {
      const meta = metadata.find(item => item.file === file);
      if (!meta || meta.status !== 200) throw new Error('Missing successful metadata for ' + file);
      const text = await fs.readFile(path.join(dir, file), 'utf8');
      raw[key] = key === 'games' ? text.trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) : JSON.parse(text);
      sources[key] = { url: meta.url, retrievedAt: meta.retrievedAt, requestedMax: key === 'games' ? Number(new URL(meta.url).searchParams.get('max')) : undefined };
    }
  } else {
    // Sequential public requests keep rate-limit pressure small. Exactly one smaller retry on 429.
    for (const [key, sourceURL] of Object.entries(endpoints)) {
      let url = sourceURL;
      const accept = key === 'games' ? 'application/x-ndjson' : 'application/json';
      let response = await request(url, accept);
      if (key === 'games' && response.status === 429) { url = url.replace('max=200', 'max=50'); response = await request(url, accept); }
      if (!response.ok) throw new Error(key + ': HTTP ' + response.status + '; existing snapshot preserved');
      const body = await response.text();
      raw[key] = key === 'games' ? body.trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) : JSON.parse(body);
      sources[key] = { url, retrievedAt: new Date().toISOString(), requestedMax: key === 'games' ? Number(new URL(url).searchParams.get('max')) : undefined };
    }
  }
  if (String(raw.profile?.id).toLowerCase() !== Model.USER || ![raw.history, raw.activity, raw.games].every(Array.isArray)) throw new Error('Invalid endpoint data; existing snapshot preserved');
  const retrievedAt = new Date(Math.max(...Object.values(sources).map(source => Date.parse(source.retrievedAt)))).toISOString();
  const target = path.join(__dirname, '../data/vihaan-lichess-snapshot.json');
  let previous = {};
  try { previous = JSON.parse(await fs.readFile(target, 'utf8')); } catch {}
  const summary = Model.summarize(raw.games, Date.parse(retrievedAt));
  const snapshot = { schemaVersion: 1, username: Model.USER, retrievedAt, sources,
    bounds: { requestedMax: sources.games.requestedMax, completedRatedGames: summary.total, oldestStart: summary.from, newestStart: summary.to, lifetime: false },
    quest: Model.quest(raw.activity, raw.games, Date.parse(retrievedAt), previous.quest), raw };
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target + '.tmp', JSON.stringify(snapshot, null, 2) + '\n');
  await fs.rename(target + '.tmp', target);
  console.log('Saved ' + summary.total + ' completed rated games; ' + summary.wins + ' wins. Sources retrieved ' + retrievedAt);
}
collect().catch(error => { console.error(error.message); process.exitCode = 1; });
