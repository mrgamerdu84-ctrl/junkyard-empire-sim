import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MpMatch = {
  id: string;
  status: "active" | "finished" | "cancelled";
  seed: number;
  duration_sec: number;
  started_at: string;
  ended_at: string | null;
  winner_id: string | null;
};

export type MpPlayer = {
  match_id: string;
  user_id: string;
  pseudo: string;
  score: number;
  missions_completed: number;
  elo_before: number;
  elo_after: number | null;
};

export type LeaderboardRow = {
  user_id: string;
  pseudo: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
};

export const joinMatchmaking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { durationSec?: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: matchId, error } = await context.supabase.rpc("mp_join_matchmaking", {
      _duration_sec: data.durationSec ?? 300,
    });
    if (error) throw new Error(error.message);
    return { matchId: (matchId as string | null) ?? null };
  });

export const leaveQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.rpc("mp_leave_queue");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitMatchEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { matchId: string; amount: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("mp_submit_event", {
      _match_id: data.matchId,
      _amount: Math.max(5, Math.min(500, Math.floor(data.amount))),
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(res) ? res[0] : res;
    return row as { total_score: number; missions_completed: number };
  });

export const finishMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { matchId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: m, error } = await context.supabase.rpc("mp_finish_match", {
      _match_id: data.matchId,
    });
    if (error) throw new Error(error.message);
    return m as MpMatch;
  });

export const getMatchState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { matchId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: match, error: e1 } = await context.supabase
      .from("mp_matches")
      .select("*")
      .eq("id", data.matchId)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!match) throw new Error("Match introuvable");

    const { data: players, error: e2 } = await context.supabase
      .from("mp_match_players")
      .select("*")
      .eq("match_id", data.matchId);
    if (e2) throw new Error(e2.message);

    return {
      match: match as MpMatch,
      players: (players ?? []) as MpPlayer[],
    };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .handler(async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const supa = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supa.rpc("mp_leaderboard", { _limit: 100 });
    if (error) throw new Error(error.message);
    return (data ?? []) as LeaderboardRow[];
  });

export const getMyElo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mp_elo")
      .select("rating, wins, losses, draws")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? { rating: 1000, wins: 0, losses: 0, draws: 0 };
  });
