import toArray from 'lodash/toArray';

const analytics = {
  tracker: Piwik ? Piwik.getAsyncTracker() : null,
  trackEvent() {
    var args = toArray(arguments);
    return function () {
      return tracker ? tracker.trackEvent.apply(tracker, args) : null;
    };
  },
  trackSiteSearch() {
    var args = toArray(arguments);
    return function () {
      return tracker ? tracker.trackSiteSearch.apply(tracker, args) : null;
    };
  }
};

export default analytics;
