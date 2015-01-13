angular
  .module('lsSearchBar', [
    'listExtractionFactory',
    'ui.bootstrap'
  ])

  .controller('lsSearchBarCtrl', function ($scope, $timeout, ListExtractionFactory) {
    var ALERT_MSG = 'Try again. Extraction failed.';
    var NO_TABLE_ALERT_MSG = 'No table found on target page. If there IS a table, then the table implementation is not supported. This app finds tables by the HTML <table> element.';
    var SEVERE_ALERT_MSG = 'Try a different web page. The app is unable to retrieve source data due to cross-origin resource sharing restrictions.';

    this.srcUrl = 'http://bindingofisaacrebirth.gamepedia.com/Items';
    this.alert = {
      show: false,
      type: '',
      count: 0,
      msg: ALERT_MSG
    };
    var _alert = this.alert;

    var showAlert = function() {
      if (_alert.count > 1) {
        _alert.msg = SEVERE_ALERT_MSG;
        _alert.type = 'danger';
      } else {
        _alert.msg = ALERT_MSG;
        _alert.type = '';
      }
      _alert.show = true;
      _alert.count++;
    };

    var showNoTableFoundAlert = function () {
      _alert.show = true;
      _alert.type = '';
      _alert.msg = NO_TABLE_ALERT_MSG;
      _alert.count = 0;
    };

    ListExtractionFactory.listen(function (event, data) {
      if (data === 0) {
        $timeout(function() {
          showNoTableFoundAlert();
        });
      }
    });

    this.getTables = function () {
      _alert.show = false;
      ListExtractionFactory.extract(this.srcUrl)
        .success(function() {
          _alert.count = 0;
        })
        .error(showAlert);
    };

  })

  .directive('lsSearchBar', function () {
    return {
      scope: {},
      templateUrl: 'components/search_bar/ls-search-bar.html',
      controller: 'lsSearchBarCtrl',
      controllerAs: 'ctrl'
    }
  });
