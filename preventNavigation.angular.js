angular.module('preventNavigation', [])
    .service( '$preventNavigation', function($rootScope, $location) {

        var unbind_cb, obu;

        function clear() {
            if (unbind_cb) {
                unbind_cb();
                unbind_cb = null;
                window.onbeforeunload = obu;
                obu = null;
            }
        }

        return {
            permit: function(check_cb, text) {
                if(!text) text = "Page has unsaved data";
                clear();
                if(check_cb && check_cb instanceof Function) {
                    obu = window.onbeforeunload;
                    window.onbeforeunload = onbeforeunload;

                    unbind_cb = $rootScope.$on('$locationChangeStart', function(event, to_url) {
                        event.preventDefault();
                        check_cb(function allow_navigation() {
                            clear();
                            setTimeout(function() {
                                $location.url(to_url.replace(location.origin, ''));
                                $rootScope.$$phase || $rootScope.$apply();
                            }, 0);
                        });
                    });
                } else if(!check_cb) {
                    obu = window.onbeforeunload;
                    window.onbeforeunload = onbeforeunload;
                    unbind_cb = $rootScope.$on('$locationChangeStart', function(event, to_url) { event.preventDefault()});
                }

                function onbeforeunload() {
                    try {
                        obu && obu()
                    }
                    catch(e) {
                        console.error(e)
                    }
                    check_cb instanceof Function && check_cb(function(){});
                    return text;
                }
            }
        }
    })
    .directive('ngPreventNavigation', function($preventNavigation) {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                scope.$watch(attr.ngPreventNavigation, function(result) {
                    $preventNavigation.permit(!result, attr.ngPreventNavigationText);
                });

                scope.$on('$destroy', function() {
                    $preventNavigation.permit(true);
                })
            }
        }
    })
;
