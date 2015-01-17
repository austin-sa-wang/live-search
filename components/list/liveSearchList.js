'use strict';
/*global $:false */

angular
  .module('liveSearchList', [])

  .controller('LiveSearchListCtrl', function () {
    this.filterExpr = '';
    this.display = true;
    this.icon = 'octicon octicon-chevron-down';
    this.toggleList = function () {
      if (this.display) {
        this.display = false;
        this.icon = 'octicon octicon-chevron-right';
      } else {
        this.display = true;
        this.icon = 'octicon octicon-chevron-down';
      }
    };
  })

  .directive('liveSearchList', ['ListExtractionFactory', function (ListExtractionFactory) {
    return {
      scope: {
        // Expect srcMarkup to be ready before being added during runtime
        listNumber: '@'
      },
      templateUrl: 'components/list/live-search-list.html',
      controller: 'LiveSearchListCtrl',
      controllerAs: 'ctrl',
      link: function (scope, element) {
        var domContainerNode = element.children('div')[0];
        var list = ListExtractionFactory.lists[scope.listNumber];
        var separatedList = ListExtractionFactory.separateTableIntoContainerAndContent(list);
        var header = separatedList.container;
        var listContent = separatedList.content;

        header.classList.add('table');
        header.classList.add('table-condensed');

        // If present, move <th> in <tbody> to <thead>
        var firstRow = listContent.children[0];
        if (firstRow.children[0].tagName === 'TH') {
          var thead = header.appendChild(document.createElement('thead'));
          thead.appendChild(firstRow);
        }

        domContainerNode.appendChild(header);
        header.appendChild(listContent);

        /**
         * Run callback with the element removed from the DOM (and thus being
         * out-of-the-flow).  Upon returning, the element will be inserted at its
         * original position even if callback rises an exception.
         * @source https://developers.google.com/speed/articles/javascript-dom
         *
         * @param {!Element} element The element to be temporarily removed.
         * @param {function(): T} callback The function to call.
         * @return {T} Value returned by the callback function.
         * @template T
         */
        var updateDomWithElementRemoved = function (element, callback) {
          var parentNode = element.parentNode;
          var nextSibling = element.nextSibling;
          parentNode.removeChild(element);
          var retval;
          try {
            retval = callback();
          }
          finally {
            parentNode.insertBefore(element, nextSibling);
          }
          return retval;
        };

        var updateListWithHTMLDisplay = function (element) {
          updateDomWithElementRemoved(element, function () {
            var regex = new RegExp(scope.ctrl.filterExpr, 'i');
            var listChildren = element.children;
            var currentNode;

            // Remove filtered nodes
            for (var i = 0; i < listChildren.length; i++) {
              currentNode = $(listChildren[i]);
              if (!regex.exec(currentNode.text())) {
                currentNode.css('display', 'none');
              } else {
                currentNode.css('display', '');
              }
            }
          });
        };

        scope.$watch('ctrl.filterExpr', function () {
          updateListWithHTMLDisplay(listContent);
        });
      }
    };
  }]);