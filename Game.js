/// <amd-dependency path="knockout-es5" />
define(["require", "exports", "jquery", "knockout", 'board', "knockout-es5"], function(require, exports, $, ko, b) {
    var Game = (function () {
        function Game() {
            var _this = this;
            this.isActive = false;
            this.timeElapsed = 0;
            this.difficultyLevels = [
                {
                    name: 'Easy',
                    dimension: 7,
                    mineCount: 5,
                    width: 296
                },
                {
                    name: 'Beginner',
                    dimension: 9,
                    mineCount: 10,
                    width: 380
                },
                {
                    name: 'Intermediate',
                    dimension: 12,
                    mineCount: 24,
                    width: 506
                },
                {
                    name: 'advanced',
                    dimension: 16,
                    mineCount: 60,
                    width: 674
                }
            ];
            this.level = this.difficultyLevels[0];
            this.stopTimer = function () {
                return clearInterval(_this.timer);
            };
            this.resetTimer = function () {
                return _this.timeElapsed = 0;
            };
            this.gameElement = $('#game');
            this.boardElement = $('#board');

            ko.track(this);
            ko.applyBindings(this);
        }
        Game.prototype.start = function () {
            var _this = this;
            this.isActive = true;
            this.stopTimer();
            this.resetTimer();

            this.gameElement.width(this.level.width);

            this.board = new b.Board(this.level.dimension, this.level.mineCount, this.boardElement.empty());
            this.board.draw();

            this.board.OnReveal.on(function (a) {
                return _this.reveal(a);
            });
            this.board.OnReveal.one(function () {
                return _this.startTimer();
            });

            this.board.OnWin.one(function () {
                _this.isActive = false;
                _this.stopTimer();
                alert('You win!');
            });

            this.board.OnGameOver.one(function () {
                _this.isActive = false;
                _this.stopTimer();
                alert('Game over!');
            });
        };

        Game.prototype.reveal = function (args) {
            if (!this.isActive)
                return;

            if (args.mouseButton == 0)
                this.board.revealField(args.field);
            else
                this.board.flag(args.field);
        };

        Game.prototype.startTimer = function () {
            var _this = this;
            this.stopTimer();

            this.timer = setInterval(function () {
                _this.timeElapsed += 0.1;
            }, 100);
        };
        return Game;
    })();
    exports.Game = Game;
});
//# sourceMappingURL=game.js.map
