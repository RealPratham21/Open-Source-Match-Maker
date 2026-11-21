-- Recommendation rows must belong to a discovery run owned by the same user.

drop policy if exists "Users manage own recommendations" on public.recommendation_items;
create policy "Users manage own recommendations"
  on public.recommendation_items for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.discovery_runs
      where discovery_runs.id = recommendation_items.run_id
        and discovery_runs.user_id = auth.uid()
    )
  );

