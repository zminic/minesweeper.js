/// <reference path="c:/Users/zminic/.WebStorm8/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_jquery_jquery.d.ts" />

var Game = (function () {
    function Game(gameElement) {
        this.isActive = false;
        this.time = 0;
        this.difficulty = {
            'easy': { d: 7, m: 5 },
            'beginner': { d: 9, m: 10 },
            'intermediate': { d: 12, m: 24 },
            'advanced': { d: 16, m: 60 }
        };
        this.gameElement = gameElement;
        this.timerElement = gameElement.find('.timer');
        gameElement.find('button.newGame').on('click', this.start);
        gameElement.on('contextmenu', function () {
            return false;
        });
    }
    Game.prototype.start = function () {
        var level = this.difficulty[$('.level').val()];
        this.gameElement.width((level.d * 42) + 2);

        this.stopTimer();
        this.resetTimer();

        this.isActive = true;

        alert('started');
    };

    Game.prototype.startTimer = function () {
        var _this = this;
        this.stopTimer();

        this.timer = setInterval(function () {
            _this.time += 0.1;
            _this.timerElement.text(_this.time);
        }, 100);

        this.timerElement.text(this.time);
    };

    Game.prototype.stopTimer = function () {
        clearInterval(this.timer);
    };

    Game.prototype.resetTimer = function () {
        this.time = 0;
        this.timerElement.text(this.time);
    };
    return Game;
})();

$(function () {
    var game = new Game($('#game'));
    game.start();
});
//# sourceMappingURL=minesweeper2.js.map
