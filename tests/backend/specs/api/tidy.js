'use strict';

const assert = require('assert');
const os = require('os');
const fs = require('fs');
const path = require('path');
let TidyHtml;
let Settings;
const npm = require('ep_etherpad-lite/node_modules/npm/lib/npm.js');
const nodeify = require('ep_etherpad-lite/node_modules/nodeify');

describe(__filename, function () {
  describe('tidyHtml', function () {
    before(function (done) {
      npm.load({}, (err) => {
        assert.ok(!err);
        TidyHtml = require('ep_etherpad-lite/node/utils/TidyHtml');
        Settings = require('ep_etherpad-lite/node/utils/Settings');
        return done();
      });
    });

    const tidy = (file, callback) => nodeify(TidyHtml.tidy(file), callback);

    it('Tidies HTML', function (done) {
      // If the user hasn't configured Tidy, we skip this tests as it's required for this test
      if (!Settings.tidyHtml) {
        this.skip();
      }

      // Try to tidy up a bad HTML file
      const tmpDir = os.tmpdir();

      const tmpFile = path.join(tmpDir, `tmp_${Math.floor(Math.random() * 1000000)}.html`);
      fs.writeFileSync(tmpFile, '<html><body><p>a paragraph</p><li>List without outer UL</li>trailing closing p</p></body></html>');
      tidy(tmpFile, (err) => {
        assert.ok(!err);

        // Read the file again
        const cleanedHtml = fs.readFileSync(tmpFile).toString();

        const expectedHtml = [
          '<title></title>',
          '</head>',
          '<body>',
          '<p>a paragraph</p>',
          '<ul>',
          '<li>List without outer UL</li>',
          '<li style="list-style: none">trailing closing p</li>',
          '</ul>',
          '</body>',
          '</html>',
        ].join('\n');
        assert.notStrictEqual(cleanedHtml.indexOf(expectedHtml), -1);
        done();
      });
    });

    it('can deal with errors', function (done) {
      // If the user hasn't configured Tidy, we skip this tests as it's required for this test
      if (!Settings.tidyHtml) {
        this.skip();
      }

      tidy('/some/none/existing/file.html', (err) => {
        assert.ok(err);
        done();
      });
    });
  });
});
