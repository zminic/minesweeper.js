/// <reference path="interfaces/jquery.d.ts" />
/// <reference path="interfaces/knockout.d.ts" />
/// <reference path="interfaces/knockout.es5.d.ts" />
/// <amd-dependency path="knockout-es5" />
define(["require", "exports", "utils", "jquery", "knockout", "knockout-es5"], function(require, exports, utils, $, ko) {
    var Board = (function () {
        function Board(dimension, mineCount, boardElement) {
            var _this = this;
            this.dimension = dimension;
            this.mineCount = mineCount;
            this.boardElement = boardElement;
            this.eventReveal = new utils.Event();
            this.eventWin = new utils.Event();
            this.eventGameOver = new utils.Event();
            this.onRevealField = function (field, event) {
                _this.eventReveal.trigger({
                    field: field,
                    mouseButton: event.button
                });
            };
            this.revealField = function (field, auto) {
                if (typeof auto === "undefined") { auto = false; }
                // do not reveal flagged and revealed fields in auto mode
                if (field.isFlagged || auto && field.isRevealed)
                    return;

                if (field.isMine) {
                    _this.revealBoard();
                    _this.eventGameOver.trigger();
                } else if (field.isRevealed && !auto) {
                    var flagged = _this.getNearFields(field, function (f) {
                        return f.isFlagged;
                    });

                    if (field.mineCount == flagged.length) {
                        _this.getNearFields(field, function (f) {
                            return !f.isRevealed && !f.isFlagged;
                        }).forEach(function (f) {
                            return _this.revealField(f, true);
                        });
                    }
                } else {
                    field.isRevealed = true;
                    field.isFlagged = false;

                    // auto reveal
                    if (field.mineCount == 0) {
                        _this.getNearFields(field).forEach(function (f) {
                            return _this.revealField(f, true);
                        });
                    }

                    if (_this.isGameOver())
                        _this.eventWin.trigger();
                }
            };
            this.fields = [];

            ko.cleanNode(this.boardElement[0]);

            boardElement.append($('#boardTemplate').html());
            boardElement.on('contextmenu', function () {
                return false;
            });

            ko.track(this);
            ko.applyBindings(this, this.boardElement[0]);
        }
        Object.defineProperty(Board.prototype, "OnReveal", {
            get: function () {
                return this.eventReveal;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Board.prototype, "OnWin", {
            get: function () {
                return this.eventWin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Board.prototype, "OnGameOver", {
            get: function () {
                return this.eventGameOver;
            },
            enumerable: true,
            configurable: true
        });

        Board.prototype.getRandomNumber = function (max) {
            return Math.floor((Math.random() * 1000) + 1) % max;
        };

        Board.prototype.draw = function () {
            this.drawFields();
            this.plantMines();
            this.calculateDistances();
        };

        Board.prototype.drawFields = function () {
            for (var i = 0; i < this.dimension * this.dimension; i++) {
                var newField = {
                    isRevealed: false,
                    isFlagged: false,
                    isMine: false,
                    mineCount: 0,
                    index: i
                };

                ko.track(newField);

                this.fields.push(newField);
            }
        };

        Board.prototype.plantMines = function () {
            var minesPlanted = 0;

            while (minesPlanted < this.mineCount) {
                var index = this.getRandomNumber(this.dimension * this.dimension);

                if (!this.fields[index].isMine) {
                    this.fields[index].isMine = true;
                    minesPlanted++;
                }
            }
        };

        Board.prototype.calculateDistances = function () {
            for (var i = 0; i < this.dimension * this.dimension; i++) {
                var field = this.fields[i];

                if (!field.isMine) {
                    field.mineCount = this.getNearFields(field, function (f) {
                        return f.isMine;
                    }).length;
                }
            }
        };

        Board.prototype.getNearFields = function (from, filter) {
            if (typeof filter === "undefined") { filter = function () {
                return true;
            }; }
            var result = [], dim = this.dimension, len = this.fields.length, ind = from.index, isFirstColumn = function (i) {
                return i % dim == 0 && i != 0;
            }, isLastColumn = function (i) {
                return (i + 1) % dim == 0 && i != len - 1;
            };

            // up
            if (ind - dim >= 0)
                result.push(this.fields[ind - dim]);

            // down
            if (ind + dim < len)
                result.push(this.fields[ind + dim]);

            // left
            if (ind - 1 >= 0 && !isFirstColumn(ind))
                result.push(this.fields[ind - 1]);

            // right
            if (ind + 1 < len && !isLastColumn(ind))
                result.push(this.fields[ind + 1]);

            // up left
            if (ind - dim - 1 >= 0 && !isFirstColumn(ind - dim))
                result.push(this.fields[ind - dim - 1]);

            // up right
            if (ind - dim + 1 >= 0 && !isLastColumn(ind - dim))
                result.push(this.fields[ind - dim + 1]);

            // bottom left
            if (ind + dim - 1 < len && !isFirstColumn(ind + dim))
                result.push(this.fields[ind + dim - 1]);

            // bottom right
            if (ind + dim + 1 < len && !isLastColumn(ind - dim))
                result.push(this.fields[ind + dim + 1]);

            return result.filter(filter);
        };

        Board.prototype.revealBoard = function () {
            for (var i = 0; i < this.fields.length; i++) {
                this.fields[i].isRevealed = true;
            }
        };

        Board.prototype.isGameOver = function () {
            return this.fields.filter(function (f) {
                return !f.isRevealed;
            }).length == this.mineCount;
        };

        Board.prototype.flag = function (field) {
            if (!field.isRevealed)
                field.isFlagged = !field.isFlagged;
        };
        return Board;
    })();
    exports.Board = Board;
});
//# sourceMappingURL=board.js.map
