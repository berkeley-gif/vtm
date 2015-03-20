angular.module('services.debounce', []).factory('$debounce', [
  '$rootScope',
  '$browser',
  '$q',
  '$exceptionHandler',
  function ($rootScope, $browser, $q, $exceptionHandler) {
    var deferreds = {}, methods = {}, uuid = 0;
    function debounce(fn, delay, invokeApply) {
      var deferred = $q.defer(), promise = deferred.promise, skipApply = angular.isDefined(invokeApply) && !invokeApply, timeoutId, cleanup, methodId, bouncing = false;
      angular.forEach(methods, function (value, key) {
        if (angular.equals(methods[key].fn, fn)) {
          bouncing = true;
          methodId = key;
        }
      });
      if (!bouncing) {
        methodId = uuid++;
        methods[methodId] = { fn: fn };
      } else {
        deferreds[methods[methodId].timeoutId].reject('bounced');
        $browser.defer.cancel(methods[methodId].timeoutId);
      }
      var debounced = function () {
        delete methods[methodId];
        try {
          deferred.resolve(fn());
        } catch (e) {
          deferred.reject(e);
          $exceptionHandler(e);
        }
        if (!skipApply) {
          $rootScope.$apply();
        }
      };
      timeoutId = $browser.defer(debounced, delay);
      methods[methodId].timeoutId = timeoutId;
      cleanup = function (reason) {
        delete deferreds[promise.$$timeoutId];
      };
      promise.$$timeoutId = timeoutId;
      deferreds[timeoutId] = deferred;
      promise.then(cleanup, cleanup);
      return promise;
    }
    debounce.cancel = function (promise) {
      if (promise && promise.$$timeoutId in deferreds) {
        deferreds[promise.$$timeoutId].reject('canceled');
        return $browser.defer.cancel(promise.$$timeoutId);
      }
      return false;
    };
    return debounce;
  }
]);
;