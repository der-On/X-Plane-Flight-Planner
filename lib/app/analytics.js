import toArray from 'lodash/toArray';

const analytics = {
  tracker: typeof window.Piwik !== 'undefined' ? Piwik.getAsyncTracker() : null,
  trackEvent() {
    var args = toArray(arguments);
    var self = this;
    return function () {
      return self.tracker ? self.tracker.trackEvent.apply(self.tracker, args) : null;
    };
  },
  trackSiteSearch() {
    var args = toArray(arguments);
    return function () {
      return self.tracker ? self.tracker.trackSiteSearch.apply(self.tracker, args) : null;
    };
  }
};

export default analytics;
