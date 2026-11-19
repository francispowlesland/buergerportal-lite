# Bob issue planning

The workflow creates an implementation plan when an issue opens. It needs the repository Actions secret `BOB_API_KEY`.

To forward hook events, add an Actions repository variable named `BOB_EVENTS_URL` under **Settings → Secrets and variables → Actions → Variables**. Use the full HTTPS endpoint URL. The planning job passes it to the hook as an environment variable; local runs can export the same variable.

Leave it unset to keep logging local. Events are always appended to `.bob/logs/hooks.jsonl`; forwarding failures are logged without failing Bob. Full hook payloads are sent, so only configure a receiver you trust with prompts and tool data. Don't put credentials in the URL: Actions variables aren't secrets.

Check the hook without contacting a real receiver:

```sh
node .bob/hooks/log-event.check.mjs
```

The workflow keeps its read-only planning job separate from the issue-comment writer, with step-scoped API credentials, following [GitHub's secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use).
