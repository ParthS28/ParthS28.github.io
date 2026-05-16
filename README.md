# GitHub Pages Deployment

This app is set up to deploy to GitHub Pages as a personal site at `https://<username>.github.io/`.

## Requirements

- The repository name must be exactly `<username>.github.io`.
- The default branch should be `main`.
- In GitHub, go to `Settings -> Pages` and set:
  - `Source`: `GitHub Actions`

## Deploy flow

Once the repo is pushed to GitHub, every push to `main` will:

1. Install dependencies
2. Run `npm run build`
3. Deploy the `dist/` output to GitHub Pages

## Local commands

```bash
npm install
npm run dev
npm run build
```

## Notes

- This project uses Vite and currently targets the root domain, so no subpath/base-path changes are needed for a `username.github.io` deployment.
- If you later deploy this same app to a project site like `https://github.com/<username>/<repo>`, you will need to add a Vite `base` path for that repository name.
