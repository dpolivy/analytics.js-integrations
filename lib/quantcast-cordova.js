
/**
 * Module dependencies.
 */

var integration = require('integration');

/**
 * User reference.
 */

var user;

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(QuantcastCordova);
  user = analytics.user(); // store for later
};

/**
 * Expose `Quantcast` integration.
 *
 * https://github.com/quantcast/phonegap-measurement
 */

var QuantcastCordova = exports.Integration = integration('Quantcast Cordova')
  .assumesPageview()
  .readyOnInitialize()
  .option('key', null)
  .option('debug', false)
  .option('enableGeo', false)
  .option('globalLabels', []);


/**
 * Initialize. Setup the measurement session.
 *
 * https://www.quantcast.com/help/cross-platform-audience-measurement-guide/
 *
 * @param {Page} page
 */

QuantcastCordova.prototype.initialize = function(page){
  var settings = { 
    key: this.options.key
  };
  
  if (user.id()) settings.uid = user.id();

  if (this.options.globalLabels) settings.labels = this.options.globalLabels;

  QuantcastMeasurement.setUpQuantcastMeasurement(settings.key, settings.uid, settings.labels);

  if (this.options.debug) QuantcastMeasurement.setDebugLogging(this.options.debug);
  if (this.options.enableGeo) QuantcastMeasurement.setGeoLocation(this.options.enableGeo);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

QuantcastCordova.prototype.loaded = function(){
  return !! window.QuantcastMeasurement;
};

/**
 * Identify.
 *
 * https://www.quantcast.com/help/cross-platform-audience-measurement-guide/
 *
 * @param {String} id (optional)
 */

QuantcastCordova.prototype.identify = function(identify){
  var id = identify.userId();
  if (id) QuantcastMeasurement.recordUserIdentifier(null, id, this.options.globalLabels);
};

/**
 * Track.
 *
 * Logs an event that occurs in the app.
 *
 * @param {Track} track
 */

QuantcastCordova.prototype.track = function(track){
  QuantcastMeasurement.logEvent(track.event(), this.options.globalLabels);
};
