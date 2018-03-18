chmod +x index.sh

while read repo; do curl -i -H 'Authorization: token {xxx}' -X 'DELETE' 'https://api.github.com/repos/$repo'; done < repos.txt