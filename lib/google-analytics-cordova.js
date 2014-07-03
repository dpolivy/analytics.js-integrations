
/**
 * Module dependencies.
 */

var each = require('each');
var integration = require('integration');
var Track = require('facade').Track;
var keys = require('object').keys;
var dot = require('obj-case');
var user;

/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(GAC);
  user = analytics.user();
};


/**
 * Expose `GAC` integration.
 *
 * https://github.com/danwilson/google-analytics-plugin
 */

var GAC = exports.Integration = integration('Google Analytics Cordova')
  .readyOnInitialize()
  .option('debug', false)
  .option('dimensions', {})
  .option('sendUserId', false)
  .option('trackingId', '');


/**
 * Initialize.
 *
 */

GAC.prototype.initialize = function () {
  var opts = this.options;

  if (opts.debug) ga.debugMode();

  ga.startTrackerWithId(opts.trackingId);

  if (opts.sendUserId && user.id()) ga.setUserId(user.id());

  // custom dimensions
  setDimensions(user.traits(), opts);
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

GAC.prototype.loaded = function () {
  return !! window.ga;
};


/**
 * Page.
 *
 * @param {Page} page
 */

GAC.prototype.page = function (page) {
  var props = page.properties();

  this._category = page.category(); // store for later

  ga.trackView(props.url);
};

/**
 * Identify.
 *
 *
 * @param {String} id (optional)
 */

GAC.prototype.identify = function(identify){
  var id = identify.userId();
  if (this.options.sendUserId && id) ga.setUserId(id);
};

/**
 * Track.
 *
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/events
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
 *
 * @param {Track} event
 */

GAC.prototype.track = function (track, options) {
  var opts = options || track.options(this.name);
  var props = track.properties();
  var category = props.category || this._category || 'All';

  ga.trackEvent(category, track.event(), props.label, formatValue(props.value || track.revenue()));
};

/**
 * Completed order.
 *
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce
 *
 * @param {Track} track
 * @api private
 */

GAC.prototype.completedOrder = function(track){
  var total = track.total() || track.revenue() || 0;
  var orderId = track.orderId();
  var products = track.products();
  var props = track.properties();

  // orderId is required.
  if (!orderId) return;

  // add transaction
  ga.addTransaction(orderId, props.affiliation, total, track.tax(), track.shipping());
  
  // add products
  each(products, function(product){
    var track = new Track({ properties: product });

    ga.addTransactionItem(orderId, track.name(), track.sku(), track.category(), track.price(), track.quantity());
  });
};


/**
 * Return the path based on `properties` and `options`.
 *
 * @param {Object} properties
 * @param {Object} options
 */

function path (properties, options) {
  if (!properties) return;
  var str = properties.path;
  if (options.includeSearch && properties.search) str += properties.search;
  return str;
}


/**
 * Format the value property to Google's liking.
 *
 * @param {Number} value
 * @return {Number}
 */

function formatValue (value) {
  if (!value || value < 0) return 0;
  return Math.round(value);
}

/**
 * Map google's custom dimensions with `obj`.
 *
 * Example:
 *
 *      setDimensions({ revenue: 1.9 }, { { dimensions : { revenue: 'dimension8' } });
 *      // => { dimension8: 1.9 }
 *
 *      setDimensions({ revenue: 1.9 }, {});
 *      // => {}
 *
 * @param {Object} obj
 * @param {Object} data
 * @api private
 */

function setDimensions(obj, data){
  var dimensions = data.dimensions;
  var names = keys(dimensions);

  for (var i = 0; i < names.length; ++i) {
    var name = names[i];
    var key = dimensions[name];
    var value = dot(obj, name);
    if (null == value) continue;
    ga.addCustomDimension(key, value);
  }
}
