/**
 * NEXORA — Supabase multiplayer config (group play)
 * ============================================================
 * SAFE TO COMMIT: `anonKey` is Supabase's PUBLIC client key — it is designed
 * to be shipped in the browser and is protected by Realtime settings, not by
 * secrecy. It is NOT your database password.
 *
 * NEVER put your Postgres/database password or the postgresql://… connection
 * string in this file (or anywhere client-side) — that is a server secret and
 * would be exposed to everyone who opens the page.
 *
 * To finish multiplayer setup: paste your anon public key below, from
 * Supabase → Project Settings → API → Project API keys → `anon` `public`.
 * Leaving anonKey empty keeps multiplayer OFF (single + local group still work).
 */
window.NEXORA_SUPABASE_CONFIG = {
  url: "https://hohufnddsvcnrhqrzgqh.supabase.co",
  anonKey: ""   // ← paste the anon PUBLIC key here (a long JWT starting with "eyJ...")
};
