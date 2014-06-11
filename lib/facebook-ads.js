
/**
 * Module dependencies.
 */

var push = require('global-queue')('_fbq');
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Facebook);
};

/**
 * HOP
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `Facebook`
 */

var Facebook = exports.Integration = integration('Facebook Ads')
  .readyOnInitialize()
  .global('_fbq')
  .option('currency', 'USD')
  .option('events', {});

/**
 * Initialize Facebook Ads.
 *
 * https://developers.facebook.com/docs/ads-for-websites/conversion-pixel-code-migration
 *
 * @param {Object} page
 */

Facebook.prototype.initialize = function(page){
  window._fbq = window._fbq || [];
  this.load();
};

/**
 * Load the Facebook Ads library.
 *
 * @param {Function} fn
 */

Facebook.prototype.load = function(fn){
  load('//connect.facebook.net/en_US/fbds.js', fn);
  window._fbq.loaded = true;
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Facebook.prototype.loaded = function(){
  return !!window._fbq.loaded;
};

/**
 * Track.
 *
 * https://developers.facebook.com/docs/reference/ads-api/custom-audience-website-faq/#fbpixel
 *
 * @param {Track} track
 */

Facebook.prototype.track = function(track){
  var events = this.options.events;
  var traits = track.traits();
  var event = track.event();
  var revenue = track.revenue() || 0;
  var data = track.properties();
  if (has.call(events, event)) {
    // conversion flow
    event = events[event];
    data = {
      value: String(revenue.toFixed(2)),
      currency: this.options.currency
    };
  }
  push('track', event, data);
};