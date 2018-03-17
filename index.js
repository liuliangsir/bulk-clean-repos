const fetch = require('node-fetch');
const fs = require('fs');
var del = require('del');

const {
  path,
  user
} = require('./.bulkrc');

const per_page = 50;
const MAXIMUM_FIRST_SEARCH_RESULTS = 1e3;
const created = '2014-07-02T16:39:23Z';
const pages = [];
const pageRegexp = /(?<=&page=)[^&]+/g;

const forkRepositoryQueryUrl = `https://api.github.com/search/repositories?q=user:${user}+fork:true+created:>=${created}&sort=created&order=asc&per_page=${per_page}`;
const ownerRepositoryQueryUrl = `https://api.github.com/search/repositories?q=user:${user}&order=desc&per_page=${per_page}`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const flip = func => (first, ...rest) => func(...rest, first);

const filterResponseData = (response, {isPassTotalCount = false, url} = {}) => {
  const {
    total_count = 0,
    incomplete_results = false,
    items = [],
    message,
    documentation_url
  } = response || {};

  if (message) {
    pages.push(+url.match(pageRegexp));
    console.error(url, message, documentation_url);
  }

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
const promiseCreatorWrapper = (urlPrefix, page, config = {isPassTotalCount: false}) => {
  const pageQueryUrl = `${urlPrefix}&page=${page}`;
  const callback = flip(filterResponseData).bind(null, {url: pageQueryUrl, ...config});

  return promiseCreator(pageQueryUrl, callback);
};

promiseCreatorWrapper(forkRepositoryQueryUrl, 1, {isPassTotalCount: true})
.then(response => {
  const {total_count, items = []} = response || {};
  const length = Math.ceil(total_count / per_page) - 1;
  const offset = 2;

  return Object
    .keys(Array.apply(null, {length}))
    .map(value => value - 0 + offset)
    .map(page => promiseCreatorWrapper(forkRepositoryQueryUrl, page))
    .reduce(
      (sequence, dataQueryPromise) => sequence.then(list => dataQueryPromise.then(response => [...list, ...response.items])),
      Promise.resolve([...items])
    ).then(list => (list.totalCount = total_count, list));
}).then(list => {
  const {
    length,
    totalCount
  } = list;
  const pageCount = Math.ceil((totalCount - length) / per_page);

  switch (true) {
    case !list.length: {
      return list;
    }
    case totalCount - length >= MAXIMUM_FIRST_SEARCH_RESULTS || pageCount > pages.length: {
      return new Error(`the page count should less than 1 and the left result should less than ${MAXIMUM_FIRST_SEARCH_RESULTS}`);
    }
  }

  const page = length / per_page + pageCount;

  return wait(5000).then(() => promiseCreatorWrapper(forkRepositoryQueryUrl, page).then(response => [...list, ...response.items]));
}).then(list => promiseCreatorWrapper(ownerRepositoryQueryUrl, 1).then(response => list.filter(item => !response.items.includes(item)))
).then(results => {
  del([`${path}`]).then(paths => {
    const logger = fs.createWriteStream(path, {
      flags: 'a',
    });

    results.map(result => (logger.write(`${result}\n`), true));
  });
})
.catch(error => {
  console.log(error);
});
