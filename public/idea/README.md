# DBS Studio · Idea Lab

Static public archive: [dbsstudio.ir/idea/](https://dbsstudio.ir/idea/).

This is an isolated static subdirectory of the React/Vite portfolio, **not WordPress**. The page at `index.html` fetches **one file**: `ideas.json`. No password, database, webhook, PHP, encryption, Issues, or additional GitHub Actions are needed.

## Automatic publication

The existing ChatGPT automation runs daily at **11:00 and 20:00 Asia/Tehran**:

1. Research one concrete opportunity for an independent developer/designer serving the Iranian market.
2. Fetch `public/idea/ideas.json` from the **main** branch of `sanyzrn/DbsWebsite_2` through the GitHub connector.
3. Preserve all existing entries. Prepend a new idea, update `updatedAt`, and commit **only** this JSON file to `main` using its latest blob SHA.
4. GitHub's existing CI → verified artifact → FTPS deployment publishes the changed JSON to the host. **A successful commit is not proof that deployment completed.** No workflow manually dispatches a deployment.
5. Report if GitHub access, content validation, CI, or deployment fails. Do not claim site publication until verified.

The repo is public and so is `ideas.json`. Never put credentials, private client information or unapproved confidential material in it. The previous host-only `.ideas.php` file, if present, is not read or deleted by the archive; old private ideas must be exported separately if desired.

## File format

```json
{
  "schemaVersion": 1,
  "updatedAt": null,
  "ideas": []
}
```

Each idea includes `id`, `date` (YYYY-MM-DD), `title`, `category`, `audience`, `problem`, `evidence`, `product`, `pricing`, `mvp`, `risk`, `acquisition`, `validation`, `notes`, and six integer `scores`: demand, differentiation, build, reach, revenue, scale. The UI calculates the average and displays progress bars. The archive order is newest first. The UI treats JSON content as untrusted, uses DOM text nodes, and only links validated HTTP(S) URLs.

No other site routes, components, source data, styles or deployment workflows need modification.
