# bulk-clean-repos

This project is to showcase how to clean all the forked repos from a git repository using shell and node

## Delete all forked repos

1. Open `.bulkrc` and update your repos url
1. `npm start or npm run start or npm run-script start`
1. Generate a Authorization Token for repo delete access [token](https://github.com/settings/tokens/new)
1. Copy the token and assgin a variable called `token` to the token in `index.sh`
1. `sh index.sh`

> You can also not delete some repos by removing its name from `repos.txt` if you want to keep those projects.

### Requirements

1. You on mac
2. Your github repo link
3. Node Js installed on system
4. Git Authorization token

### Related

- [Peripona/bulk-clean-repos](https://github.com/Peripona/bulk-clean-repos)

- [is-it-possible-to-remove-a-remote-repository-on-github-through-the-command-line](https://stackoverflow.com/questions/25381329/is-it-possible-to-remove-a-remote-repository-on-github-through-the-command-line)

- [How to delete a GitHub repo using the API](https://stackoverflow.com/questions/19319516/how-to-delete-a-github-repo-using-the-api)

### Troubleshooting

- [Only the first 1000 search results are available](https://stackoverflow.com/questions/37602893/github-search-limit-results)
- [API rate limit exceeded](https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications)