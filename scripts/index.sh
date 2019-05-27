#!/usr/bin/env bash
chmod +x index.sh

filename="repos.txt"
token=""

while read -r line;
do
    name="$line"
    curl -X "DELETE" -H "Authorization: token $token" "https://api.github.com/repos/$name ";
done < "$filename"
