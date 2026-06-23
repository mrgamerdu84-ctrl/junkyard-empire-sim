
CREATE TABLE public.mp_elo (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL DEFAULT 1000,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mp_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','finished','cancelled')),
  seed bigint NOT NULL,
  duration_sec integer NOT NULL DEFAULT 300,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE public.mp_match_players (
  match_id uuid NOT NULL REFERENCES public.mp_matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudo text NOT NULL DEFAULT 'Chauffeur',
  score integer NOT NULL DEFAULT 0,
  missions_completed integer NOT NULL DEFAULT 0,
  elo_before integer NOT NULL DEFAULT 1000,
  elo_after integer,
  last_event_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (match_id, user_id)
);

CREATE TABLE public.mp_match_events (
  id bigserial PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.mp_matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  missions_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mp_match_events_match_idx ON public.mp_match_events(match_id, created_at);

CREATE TABLE public.mp_queue (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_sec integer NOT NULL DEFAULT 300,
  rating integer NOT NULL DEFAULT 1000,
  joined_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mp_elo TO authenticated, anon;
GRANT ALL ON public.mp_elo TO service_role;
GRANT SELECT ON public.mp_matches TO authenticated;
GRANT ALL ON public.mp_matches TO service_role;
GRANT SELECT ON public.mp_match_players TO authenticated;
GRANT ALL ON public.mp_match_players TO service_role;
GRANT SELECT ON public.mp_match_events TO authenticated;
GRANT ALL ON public.mp_match_events TO service_role;
GRANT SELECT, DELETE ON public.mp_queue TO authenticated;
GRANT ALL ON public.mp_queue TO service_role;

ALTER TABLE public.mp_elo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "elo readable" ON public.mp_elo FOR SELECT USING (true);

CREATE POLICY "match players see self rows" ON public.mp_match_players FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.mp_match_players me
    WHERE me.match_id = mp_match_players.match_id AND me.user_id = auth.uid()
  ));

CREATE POLICY "players see their matches" ON public.mp_matches FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mp_match_players p WHERE p.match_id = mp_matches.id AND p.user_id = auth.uid()));

CREATE POLICY "see own match events" ON public.mp_match_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mp_match_players p WHERE p.match_id = mp_match_events.match_id AND p.user_id = auth.uid()));

CREATE POLICY "see own queue" ON public.mp_queue FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "leave queue" ON public.mp_queue FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.mp_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mp_match_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mp_match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mp_queue;

CREATE OR REPLACE FUNCTION public.mp_join_matchmaking(_duration_sec integer DEFAULT 300)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  my_rating integer;
  my_pseudo text;
  opp record;
  new_match_id uuid;
  new_seed bigint;
  existing_match uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _duration_sec NOT IN (180, 300, 600) THEN _duration_sec := 300; END IF;

  SELECT m.id INTO existing_match
  FROM public.mp_matches m
  JOIN public.mp_match_players p ON p.match_id = m.id
  WHERE p.user_id = uid AND m.status = 'active'
    AND m.started_at + (m.duration_sec || ' seconds')::interval > now()
  LIMIT 1;
  IF existing_match IS NOT NULL THEN RETURN existing_match; END IF;

  INSERT INTO public.mp_elo (user_id) VALUES (uid) ON CONFLICT DO NOTHING;
  SELECT rating INTO my_rating FROM public.mp_elo WHERE user_id = uid;
  SELECT COALESCE(pseudo, 'Chauffeur') INTO my_pseudo FROM public.profiles WHERE id = uid;
  IF my_pseudo IS NULL THEN my_pseudo := 'Chauffeur'; END IF;

  SELECT * INTO opp FROM public.mp_queue
  WHERE user_id <> uid AND duration_sec = _duration_sec
  ORDER BY abs(rating - my_rating) ASC, joined_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF opp.user_id IS NOT NULL THEN
    DELETE FROM public.mp_queue WHERE user_id IN (opp.user_id, uid);
    new_seed := (floor(random() * 9007199254740992))::bigint;
    INSERT INTO public.mp_matches (seed, duration_sec) VALUES (new_seed, _duration_sec) RETURNING id INTO new_match_id;
    INSERT INTO public.mp_match_players (match_id, user_id, pseudo, elo_before)
      VALUES (new_match_id, uid, my_pseudo, my_rating);
    INSERT INTO public.mp_match_players (match_id, user_id, pseudo, elo_before)
      VALUES (new_match_id, opp.user_id, COALESCE((SELECT pseudo FROM public.profiles WHERE id = opp.user_id), 'Chauffeur'), opp.rating);
    RETURN new_match_id;
  ELSE
    INSERT INTO public.mp_queue (user_id, duration_sec, rating)
    VALUES (uid, _duration_sec, my_rating)
    ON CONFLICT (user_id) DO UPDATE SET duration_sec = _duration_sec, rating = my_rating, joined_at = now();
    RETURN NULL;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.mp_leave_queue()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.mp_queue WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.mp_submit_event(_match_id uuid, _amount integer)
RETURNS TABLE(total_score integer, missions_completed integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  m public.mp_matches;
  p public.mp_match_players;
  max_missions integer;
  elapsed integer;
  new_score integer;
  new_missions integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount IS NULL OR _amount < 5 OR _amount > 500 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  SELECT * INTO m FROM public.mp_matches WHERE id = _match_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Match not found'; END IF;
  IF m.status <> 'active' THEN RAISE EXCEPTION 'Match not active'; END IF;
  IF m.started_at + (m.duration_sec || ' seconds')::interval < now() THEN
    RAISE EXCEPTION 'Match expired';
  END IF;

  SELECT * INTO p FROM public.mp_match_players WHERE match_id = _match_id AND user_id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Not a player'; END IF;

  elapsed := GREATEST(1, EXTRACT(EPOCH FROM (now() - m.started_at))::integer);
  max_missions := GREATEST(1, elapsed / 8);
  IF p.missions_completed + 1 > max_missions THEN
    RAISE EXCEPTION 'Too fast';
  END IF;

  UPDATE public.mp_match_players
     SET score = score + _amount,
         missions_completed = missions_completed + 1,
         last_event_at = now()
   WHERE match_id = _match_id AND user_id = uid
   RETURNING score, missions_completed INTO new_score, new_missions;

  INSERT INTO public.mp_match_events (match_id, user_id, event_type, amount, total_score, missions_completed)
  VALUES (_match_id, uid, 'ride', _amount, new_score, new_missions);

  total_score := new_score;
  missions_completed := new_missions;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.mp_finish_match(_match_id uuid)
RETURNS public.mp_matches
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m public.mp_matches;
  p1 public.mp_match_players;
  p2 public.mp_match_players;
  k integer := 32;
  expected1 numeric;
  s1 numeric;
  s2 numeric;
  new_r1 integer;
  new_r2 integer;
  winner uuid;
BEGIN
  SELECT * INTO m FROM public.mp_matches WHERE id = _match_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Match not found'; END IF;
  IF m.status = 'finished' THEN RETURN m; END IF;

  SELECT * INTO p1 FROM public.mp_match_players WHERE match_id = _match_id ORDER BY user_id LIMIT 1;
  SELECT * INTO p2 FROM public.mp_match_players WHERE match_id = _match_id ORDER BY user_id OFFSET 1 LIMIT 1;
  IF p1.user_id IS NULL OR p2.user_id IS NULL THEN RAISE EXCEPTION 'Incomplete match'; END IF;

  IF p1.score > p2.score THEN s1 := 1; s2 := 0; winner := p1.user_id;
  ELSIF p2.score > p1.score THEN s1 := 0; s2 := 1; winner := p2.user_id;
  ELSE s1 := 0.5; s2 := 0.5; winner := NULL;
  END IF;

  expected1 := 1.0 / (1.0 + power(10, (p2.elo_before - p1.elo_before) / 400.0));
  new_r1 := p1.elo_before + round(k * (s1 - expected1))::integer;
  new_r2 := p2.elo_before + round(k * (s2 - (1.0 - expected1)))::integer;

  UPDATE public.mp_match_players SET elo_after = new_r1 WHERE match_id = _match_id AND user_id = p1.user_id;
  UPDATE public.mp_match_players SET elo_after = new_r2 WHERE match_id = _match_id AND user_id = p2.user_id;

  INSERT INTO public.mp_elo (user_id, rating, wins, losses, draws)
  VALUES (p1.user_id, new_r1, CASE WHEN s1=1 THEN 1 ELSE 0 END, CASE WHEN s1=0 THEN 1 ELSE 0 END, CASE WHEN s1=0.5 THEN 1 ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE SET
    rating = EXCLUDED.rating,
    wins = public.mp_elo.wins + EXCLUDED.wins,
    losses = public.mp_elo.losses + EXCLUDED.losses,
    draws = public.mp_elo.draws + EXCLUDED.draws,
    updated_at = now();

  INSERT INTO public.mp_elo (user_id, rating, wins, losses, draws)
  VALUES (p2.user_id, new_r2, CASE WHEN s2=1 THEN 1 ELSE 0 END, CASE WHEN s2=0 THEN 1 ELSE 0 END, CASE WHEN s2=0.5 THEN 1 ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE SET
    rating = EXCLUDED.rating,
    wins = public.mp_elo.wins + EXCLUDED.wins,
    losses = public.mp_elo.losses + EXCLUDED.losses,
    draws = public.mp_elo.draws + EXCLUDED.draws,
    updated_at = now();

  UPDATE public.mp_matches SET status = 'finished', ended_at = now(), winner_id = winner
   WHERE id = _match_id RETURNING * INTO m;
  RETURN m;
END;
$$;

CREATE OR REPLACE FUNCTION public.mp_leaderboard(_limit integer DEFAULT 100)
RETURNS TABLE(user_id uuid, pseudo text, rating integer, wins integer, losses integer, draws integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.user_id, COALESCE(p.pseudo, 'Chauffeur'), e.rating, e.wins, e.losses, e.draws
  FROM public.mp_elo e
  LEFT JOIN public.profiles p ON p.id = e.user_id
  ORDER BY e.rating DESC, e.wins DESC
  LIMIT LEAST(GREATEST(_limit, 1), 200);
$$;
