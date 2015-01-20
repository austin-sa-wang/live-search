'use strict';

angular
  .module('listExtractionFactory', [])

  .factory('ListExtractionFactory', ['$http', '$rootScope', function ListExtractionFactory($http, $rootScope) {
    ListExtractionFactory.TIMEOUT_TIME = 2000;
    ListExtractionFactory.EVENT_NAME = 'lists:ready';
    ListExtractionFactory.MIN_CHILD_COUNT_TO_QUALITY = 10;

    ListExtractionFactory.lists = [];

    var corsUrl = function (url) {
      return 'http://whateverorigin.org/get?url=' + encodeURIComponent(url) + '&callback=JSON_CALLBACK';
    };

    var pushListResource = function (tableElement) {
      ListExtractionFactory.lists.push(tableElement);
    };

    ListExtractionFactory.broadcast = function (data) {
      $rootScope.$broadcast(ListExtractionFactory.EVENT_NAME, data);
    };

    ListExtractionFactory.listen = function (callback) {
      $rootScope.$on(ListExtractionFactory.EVENT_NAME, callback);
    };

    ListExtractionFactory.fixRelativeLinks = function (url, markup) {
      var link = document.createElement('a');
      link.href = url;
      var hostname = link.hostname;

      var httpPrefix = '';
      if (url.search('https://') !== -1) {
        httpPrefix = 'https://';
      } else if (url.search('http://') !== -1) {
        httpPrefix = 'http://';
      }

      var aRegex = /href="\//g;
      var a = 'href=\"' + httpPrefix + hostname + '/';
      var imgRegex = /src="\//g;
      var img = 'src=\"' + httpPrefix + hostname + '/';
      var newMarkup = markup.replace(aRegex, a);
      newMarkup = newMarkup.replace(imgRegex, img);

      return newMarkup;
    };

    ListExtractionFactory.getTables = function (markup) {
      var tableCount = 0;

      var domHead = document.createElement('div');
      domHead.innerHTML = markup;
      var tableList = domHead.getElementsByTagName('table');

      ListExtractionFactory.lists = [];

      // Find table with qualifying child count, remove it from dom, and push it onto lists
      var currentTable, childCount, detachedTable;
      for (var i = 0; i < tableList.length;) {
        currentTable = tableList[i];
        childCount = currentTable.getElementsByTagName('tbody')[0].children.length;
        if (childCount > ListExtractionFactory.MIN_CHILD_COUNT_TO_QUALITY) {
          detachedTable = currentTable.parentNode.removeChild(currentTable);
          pushListResource(detachedTable);
          tableCount++;
        } else {
          // Dynamic HTML node list. Avoid increment when an item is removed
          i++;
        }
      }

      return tableCount;
    };

    ListExtractionFactory.extract = function (url) {
      var promise = $http.jsonp(corsUrl(url), {timeout: ListExtractionFactory.TIMEOUT_TIME})
        .success(function (data) {
          var markup = ListExtractionFactory.fixRelativeLinks(url, data.contents);
          var tableCount = ListExtractionFactory.getTables(markup);
          ListExtractionFactory.broadcast(tableCount);
        });
      return promise;
    };

    ListExtractionFactory.breakTableBodyIntoFragments = function (tableBody, fragmentSize) {
      var childrenList = tableBody.children;
      var splits = [];
      var currentSplit, count;
      while(childrenList.length > 0) {
        currentSplit = document.createDocumentFragment();

        if (childrenList.length > fragmentSize) {
          count = fragmentSize;
        } else {
          count = childrenList.length;
        }

        while (count > 0) {
          currentSplit.appendChild(childrenList[0]);
          count--;
        }

        splits.push(currentSplit);
      }
      return splits;
    };

    return ListExtractionFactory;
  }]);
