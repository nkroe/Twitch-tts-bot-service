// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitemap = require('nextjs-sitemap-generator');

sitemap({
  baseUrl: 'https://fakebot.pro/',
  pagesDirectory: __dirname + '\\pages',
  targetDirectory: 'static/',
  nextConfigPath: __dirname + '\\next.config.js',
});
