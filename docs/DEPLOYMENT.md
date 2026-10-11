# Publishing and updating the site

This guide is for the site owner. You never need a terminal: everything is done on github.com.

## How publishing works

The site is hosted free on **GitHub Pages**. Whenever a change is merged into the `main` branch, a robot called **GitHub Actions** checks the files and publishes them. A few minutes later the live site shows the change.

## One-time setup

1. Open the repository on github.com and click **Settings**.
2. In the left menu click **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Still in **Settings**, click **Code security** (or **Security**), then turn on **Secret scanning** and **Push protection**. This warns you if a password or key is ever added by mistake.

You will see: the Pages screen shows your site address (`https://babatundeawo.github.io/ai-prompt-library/`) after the first successful publish.

## Review and publish the redesign (pull request)

The redesign arrives as a **pull request**: a proposed change that does nothing to the live site until you approve it.

1. Click the **Pull requests** tab and open the one titled *Rebrand and rebuild*.
2. Click **Checks** to see the automatic tests. A green tick means they passed. Warnings (yellow) about style or speed are normal and do not stop publishing.
3. To look at the new site before merging, open the **Checks** tab, click the **Deploy** workflow, scroll to **Artifacts** and download `github-pages`. It is a zip of the finished site. (GitHub Pages cannot show live previews of pull requests.)
4. When you are happy, click the green **Merge pull request** button, then **Confirm merge**.
5. Click the **Actions** tab. The newest *Deploy* run should show a green tick within a few minutes. Open your live site and refresh.

To **discard** the redesign, click **Close pull request** instead. Nothing changes on the live site.

## Update prompts or text later

1. Open the file on github.com (for example `js/data.js`).
2. Click the pencil icon (**Edit this file**), make your change, then click **Commit changes**.
3. Choose **Create a new branch and start a pull request** if you want to review first, or commit straight to `main` to publish.

## Check that a publish worked

Click the **Actions** tab. The top row is the latest run.

- **Green tick**: published.
- **Yellow dot**: still running; wait a minute.
- **Red cross**: something is wrong. Click the run, then the red step, and read the message. Lines starting with `error` name the file and what to fix. The live site stays on the last good version.

## Go back to an earlier version

Every version is kept in Git history.

1. Open the **Pull requests** tab, then **Closed**, and open the pull request you want to undo.
2. Click **Revert** near the bottom. This creates a new pull request that undoes the change.
3. Merge it. The site returns to how it was.

## Use your own domain (optional)

1. Buy a domain from any registrar.
2. In **Settings > Pages** type it under **Custom domain** and click **Save**.
3. At your registrar, add the DNS records GitHub shows you (four `A` records for the main domain, or a `CNAME` record for `www`). Changes can take up to a day.
4. Tick **Enforce HTTPS** once it becomes available.
5. Update the site address in the files listed in [CUSTOMIZING.md](CUSTOMIZING.md#site-address).

## Automatic security updates

- **Dependabot** opens pull requests when a tool the checks use has an update. Merge them when the checks are green.
- **CodeQL** scans the code for security problems every week and on each change. Results appear under **Security > Code scanning**.
