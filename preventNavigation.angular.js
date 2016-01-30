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
            permit: function(check_cb) {
                clear();
                if(check_cb && check_cb instanceof Function) {
                    obu = window.onbeforeunload;
                    window.onbeforeunload=function() { try{ obu && obu() } catch(e) {console.error(e)}; check_cb(function(){}); return "Page has unsaved data";}

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
                    unbind_cb = $rootScope.$on('$locationChangeStart', function(event, to_url) { event.preventDefault()});
                }
            }
        }
    });
