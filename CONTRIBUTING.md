# Contributing

Thanks for helping improve PromptOS. You can do everything on github.com.

## Report a bug or suggest a prompt

[Open an issue](https://github.com/babatundeawo/ai-prompt-library/issues/new/choose) and pick a form. For a prompt, credit the original creator and only share prompts you have the right to share.

## Change something yourself

1. Open the file you want to change and click the pencil icon.
2. Make your edit and click **Commit changes**, then choose **Create a new branch and start a pull request**.
3. Fill in the short pull request form. The automatic checks run; a green tick means they passed.

## Ground rules

- Prompts live in `js/data.js`; see [docs/CUSTOMIZING.md](docs/CUSTOMIZING.md#prompts) for the format.
- Keep the site free of tracking, accounts and third-party scripts.
- Keep it usable by keyboard and screen reader, and check any visual change at phone width.

## For developers

The site has no build step: the files in this repository are the site. Checks (`scripts/check.mjs`, ESLint, html-validate, Lighthouse) are defined in `package.json` and `.github/workflows/deploy.yml`. To preview locally, serve the folder with any static file server.
