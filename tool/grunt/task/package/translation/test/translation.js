/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

module.exports = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },

  getTranslationFor: function (test) {
    var translation = require('../lib/translation.js');
    var transPaths = [
      "../../../../../framework/source/translation",
      "./test/data"
    ];

    console.log(translation.getTranslationFor("de", transPaths));

    test.ok(true);
    test.done();
  }
};
