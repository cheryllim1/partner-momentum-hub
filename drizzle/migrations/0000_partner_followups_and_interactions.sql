CREATE TABLE public.partner_followups (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), partner_id text NOT NULL,
 action text NOT NULL CHECK (length(trim(action)) BETWEEN 1 AND 200),
 owner_name text NOT NULL CHECK (length(trim(owner_name)) BETWEEN 1 AND 120),
 due_date date NOT NULL, notes text NOT NULL DEFAULT '' CHECK (length(notes) <= 4000),
 status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Completed')),
 created_by uuid NOT NULL DEFAULT auth.uid(), updated_by uuid NOT NULL DEFAULT auth.uid(),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_followups TO authenticated;
GRANT ALL ON public.partner_followups TO service_role;
ALTER TABLE public.partner_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project members read followups" ON public.partner_followups FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL AND auth.jwt()->>'project_id' = '33b491b0-c416-4cf7-8fb2-463393d5afb9');
CREATE POLICY "Project members create followups" ON public.partner_followups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by AND auth.uid() = updated_by AND auth.jwt()->>'project_id' = '33b491b0-c416-4cf7-8fb2-463393d5afb9');
CREATE POLICY "Project members update followups" ON public.partner_followups FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL AND auth.jwt()->>'project_id' = '33b491b0-c416-4cf7-8fb2-463393d5afb9') WITH CHECK (auth.uid() = updated_by AND auth.jwt()->>'project_id' = '33b491b0-c416-4cf7-8fb2-463393d5afb9');
CREATE FUNCTION public.stamp_partner_followup() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.created_by = OLD.created_by; NEW.created_at = OLD.created_at; NEW.partner_id = OLD.partner_id; NEW.updated_at = now(); NEW.updated_by = auth.uid(); RETURN NEW; END; $$;
CREATE TRIGGER stamp_partner_followup BEFORE UPDATE ON public.partner_followups FOR EACH ROW EXECUTE FUNCTION public.stamp_partner_followup();
CREATE INDEX partner_followups_partner_due ON public.partner_followups (partner_id, due_date);
CREATE TABLE public.partner_interactions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), partner_id text NOT NULL,
 occurred_on date NOT NULL, channel text NOT NULL CHECK (channel IN ('Meeting', 'Email', 'Call', 'Slack', 'Other')),
 participants text NOT NULL CHECK (length(trim(participants)) BETWEEN 1 AND 500),
 summary text NOT NULL CHECK (length(trim(summary)) BETWEEN 1 AND 4000),
 outcome text NOT NULL CHECK (length(trim(outcome)) BETWEEN 1 AND 2000),
 next_steps text NOT NULL DEFAULT '' CHECK (length(next_steps) <= 2000),
 created_by uuid NOT NULL DEFAULT auth.uid(), recorded_by text NOT NULL CHECK (length(trim(recorded_by)) BETWEEN 1 AND 200),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_interactions TO authenticated;
GRANT ALL ON public.partner_interactions TO service_role;
ALTER TABLE public.partner_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project members read interactions" ON public.partner_interactions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL AND auth.jwt()->>'project_id' = '33b491b0-c416-4cf7-8fb2-463393d5afb9');
CREATE POLICY "Project members record interactions" ON public.partner_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by AND auth.jwt()->>'project_id' = '33b491b0-c416-4cf7-8fb2-463393d5afb9');
CREATE INDEX partner_interactions_partner_date ON public.partner_interactions (partner_id, occurred_on DESC);