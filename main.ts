/// <reference path="interfaces/require.d.ts" />

require.config({
    paths: {
        'ko': 'libs/knockout.debug',
        'knockout-es5': 'libs/knockout-es5',
        'jquery': 'libs/jquery'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'knockout-es5': {
            deps: ['knockout'],
            exports: 'ko'
        }
    }
});

// force knockout to become global variable. This fixes dependency problem for knockout-es5 library which requires global variable 'ko'
define("knockout", ['ko'], function (ko) {
    window['ko'] = ko;
    return ko;
});

require(['game'], (g) => new g.Game().start());