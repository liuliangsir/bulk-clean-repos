const fetch = require('node-fetch');
const fs = require('fs');

const path = 'repos.txt';
const user = 'liuliangsir';
const per_page = 50;

const forkRepositoryQueryUrl = `https://api.github.com/search/repositories?q=user:${user}+fork:true&order=desc&per_page=${per_page}`;
const ownerRepositoryQueryUrl = `https://api.github.com/search/repositories?q=user:${user}&order=desc&per_page=${per_page}`;

const logger = fs.createWriteStream(path, {
  flags: 'a',
});

const flip = func => (first, ...rest) => func(...rest, first);

const filterResponseData = (response, isPassTotalCount = false) => {
  const {
    total_count = 0,
    incomplete_results = false,
    items = []
  } = response || {};

  const realResponse = {};

  if (isPassTotalCount) {
    realResponse.total_count = total_count;
  }

  realResponse.items = items.map(item => item.full_name);

  return realResponse;
}

const promiseCreator = (url, callback) => {
  return fetch(url)
    .then(response => response.json())
    .then(callback);
};

promiseCreator(`${forkRepositoryQueryUrl}&page=1`, flip(filterResponseData).bind(null, true))
.then(response => {
  const {total_count, items = []} = response || {};
  const length = Math.ceil(total_count / per_page) - 1;
  const offset = 2;

  return Object
    .keys(Array.apply(null, {length}))
    .map(value => value - 0 + offset)
    .map(page => promiseCreator(`${forkRepositoryQueryUrl}&page=${page}`, filterResponseData))
    .reduce(
      (sequence, dataQueryPromise) => sequence.then(list => dataQueryPromise.then(response => [...list, ...response.items])),
      Promise.resolve([...items])
    );
}).then(list => {

}).catch(error => {
  console.log(error);
});
