<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Coordinate auth events in the root through the identity-deduplicating auth event handler; pages must not subscribe separately, to prevent competing redirects and repeated authenticated requests.
- Keep school feature screens in focused modules under `src/components/features` and authenticated leaf routes thin; this shares forms and data handling without duplicating page logic.
- Enforce school membership, record relationships, fee payment balances and timetable conflicts in database policies and functions; interface role gates only hide controls and are not authorization.
- Record payments through the locked payment function rather than directly updating balances; this preserves receipt history and prevents concurrent overpayment.
