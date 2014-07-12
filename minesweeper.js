(function ($) {
    var Game = function (gameElement) {
        var obj = {}, isActive = false, board, time = 0, timer, timerElement, difficulty = {
            'easy': { d: 7, m: 5 },
            'beginner': { d: 9, m: 10 },
            'intermediate': { d: 12, m: 24 },
            'advanced': { d: 16, m: 60 }
        };

        function startTimer() {
            stopTimer();

            timer = window.setInterval(function () {
                time += 0.1;
                timerElement.text(time.toFixed(1));
            }, 100);

            timerElement.text(time);
        }

        function resetTimer() {
            time = 0;
            timerElement.text(time);
        }

        function stopTimer() {
            window.clearInterval(timer);
        }

        obj.start = function () {
            var difficultyLevel = difficulty[$('.level').val()];

            // set game width
            gameElement.width((difficultyLevel.d * 42) + 2);

            // create board
            board = Board(gameElement.find('.board').empty(), difficultyLevel.d, difficultyLevel.m);
            board.draw();

            $(board).one('win', function () {
                obj.stop();
                window.setTimeout(function () {
                    window.alert('You Win!');
                }, 100);
            }).one('gameover', function () {
                obj.stop();
                window.setTimeout(function () {
                    window.alert('Game Over!');
                }, 100);
            }).one('fieldSelected', startTimer).on('fieldSelected', obj.reveal);

            stopTimer();
            resetTimer();

            isActive = true;
        };

        obj.stop = function () {
            stopTimer();
            isActive = false;
        };

        obj.reveal = function (e, mousedownEvent, field) {
            if (!isActive) {
                return;
            }

            if (mousedownEvent.which === 1) {
                board.reveal(field);
            } else {
                board.flag(field);
            }
        };

        // constructor
        (function init() {
            timerElement = gameElement.find('.timer');

            gameElement.find('button.newGame').on('click', obj.start);

            gameElement.on('contextmenu', function () {
                return false;
            });

            obj.start();
        }());

        return obj;
    };

    var Field = function (element, x, y) {
        var obj = {};

        obj.isMine = false;
        obj.isRevealed = false;
        obj.isEmpty = false;
        obj.isFlagged = false;
        obj.x = x;
        obj.y = y;
        obj.mineCount = 0;

        obj.setFlagged = function (value) {
            element.toggleClass('flag', value);
            obj.isFlagged = value;
        };

        obj.setRevealed = function (value) {
            element.toggleClass('hidden', !value);
            obj.isRevealed = value;
        };

        obj.setEmpty = function (value) {
            obj.isEmpty = value;
        };

        obj.setMine = function (value) {
            obj.isMine = value;
            element.toggleClass('mine', value);
        };

        obj.setMineCount = function (value) {
            obj.mineCount = value;
            obj.setText(value);
        };

        obj.setText = function (value) {
            $('<span />').text(value).appendTo(element);
        };

        return obj;
    };

    var Board = function (element, dimension, mines) {
        var obj = {}, boardData = [];

        function drawBoard() {
            var i, j, fieldElement;

            for (i = 0; i < dimension; i++) {
                boardData[i] = [];

                for (j = 0; j < dimension; j++) {
                    fieldElement = $('<div class="field hidden" />').appendTo(element);

                    boardData[i][j] = Field(fieldElement, i, j);

                    fieldElement.data('location', { x: i, y: j });
                }

                $('<div class="clear" />').appendTo(element);
            }
        }

        function getRandomNumber(max) {
            return Math.floor((Math.random() * 1000) + 1) % max;
        }

        function plantMines() {
            var i, minesPlanted = 0, x, y;

            while (minesPlanted < mines) {
                x = getRandomNumber(dimension);
                y = getRandomNumber(dimension);

                if (!boardData[x][y].isMine) {
                    boardData[x][y].setMine(true);
                    minesPlanted++;
                }
            }
        }

        function calculateDistance() {
            var i, j;

            for (i = 0; i < dimension; i++)
                for (j = 0; j < dimension; j++) {
                    var field = boardData[i][j];

                    if (!field.isMine) {
                        var mines = traverseBoard(field, function (f) {
                            return !!f.isMine;
                        });

                        if (mines.length > 0) {
                            field.setMineCount(mines.length);
                        } else {
                            field.setEmpty(true);
                        }
                    }
                }
        }

        function traverseBoard(fromField, condition) {
            var result = [];

            condition = condition || function () {
                return true;
            };

            // traverse up
            if (fromField.x > 0) {
                result.push(boardData[fromField.x - 1][fromField.y]);
            }

            // traverse down
            if (fromField.x < dimension - 1) {
                result.push(boardData[fromField.x + 1][fromField.y]);
            }

            // traverse left
            if (fromField.y > 0) {
                result.push(boardData[fromField.x][fromField.y - 1]);
            }

            // traverse right
            if (fromField.y < dimension - 1) {
                result.push(boardData[fromField.x][fromField.y + 1]);
            }

            // traverse upper left
            if (fromField.x > 0 && fromField.y > 0) {
                result.push(boardData[fromField.x - 1][fromField.y - 1]);
            }

            // traverse lower left
            if (fromField.x < dimension - 1 && fromField.y > 0) {
                result.push(boardData[fromField.x + 1][fromField.y - 1]);
            }

            // traverse upper right
            if (fromField.x > 0 && fromField.y < dimension - 1) {
                result.push(boardData[fromField.x - 1][fromField.y + 1]);
            }

            // traverse lower right
            if (fromField.x < dimension - 1 && fromField.y < dimension - 1) {
                result.push(boardData[fromField.x + 1][fromField.y + 1]);
            }

            return $.grep(result, condition);
        }

        function revealBoard() {
            for (var i = 0; i < dimension; i++)
                for (var j = 0; j < dimension; j++)
                    boardData[i][j].setRevealed(true);
        }
        ;

        function isGameOver() {
            var hiddenCount = 0;

            for (var i = 0; i < dimension; i++)
                for (var j = 0; j < dimension; j++)
                    if (!boardData[i][j].isRevealed) {
                        hiddenCount++;
                    }

            return hiddenCount === mines;
        }
        ;

        function locateField(fieldElement) {
            var l = fieldElement.data('location');
            return field = boardData[l.x][l.y];
        }

        obj.draw = function () {
            drawBoard();
            plantMines();
            calculateDistance();
        };

        obj.reveal = function (field, auto) {
            // do not reveal flagged and revealed fields in auto mode
            if (field.isFlagged || (auto && field.isRevealed)) {
                return;
            }

            if (field.isMine) {
                revealBoard();
                $(obj).trigger('gameover');
                return;
            } else if (field.isRevealed && !auto) {
                var flaggedMines = traverseBoard(field, function (f) {
                    return f.isFlagged;
                });

                if (field.mineCount === flaggedMines.length) {
                    var hiddenFields = traverseBoard(field, function (f) {
                        return !f.isRevealed && !f.isFlagged;
                    });

                    for (var i = 0; i < hiddenFields.length; i++) {
                        obj.reveal(hiddenFields[i], true);
                    }
                }
            } else {
                field.setRevealed(true);
                field.setFlagged(false);

                if (field.isEmpty) {
                    var area = traverseBoard(field);

                    for (var i = 0; i < area.length; i++) {
                        if (area[i].isEmpty || !area[i].isMine) {
                            obj.reveal(area[i], true);
                        }
                    }
                }

                if (isGameOver()) {
                    $(obj).trigger('win');
                    return;
                }
            }
        };

        obj.flag = function (field) {
            if (!field.isRevealed) {
                field.setFlagged(!field.isFlagged);
            }
        };

        // constructor
        (function init() {
            // expose fieldSelected event
            element.off('mousedown', '.field').on('mousedown', '.field', function (e) {
                $(obj).trigger('fieldSelected', [e, locateField($(this))]);
            });
        }());

        return obj;
    };

    // export jquery plugin
    $.fn.minesweeper = function () {
        Game(this);

        return this;
    };
}(jQuery));
//# sourceMappingURL=minesweeper.js.map
