import toArray from 'lodash/toArray';

const analytics = {
  tracker: Piwik.getAsyncTracker(),
  trackEvent() {
    var args = toArray(arguments);
    return function () {
      return tracker.trackEvent.apply(tracker, args);
    };
  },
  trackSiteSearch() {
    var args = toArray(arguments);
    return function () {
      return tracker.trackSiteSearch.apply(tracker, args);
    };
  }
};

export default analytics;
