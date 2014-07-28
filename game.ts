/// <amd-dependency path="knockout-es5" />

import $ = require("jquery");
import ko = require("knockout");
import b = require('board');

export interface DifficultyLevel
{
    name: string;
    dimension: number;
    mineCount: number;
    width: number;
}

export class Game
{
    private isActive: boolean = false;
    private gameElement: JQuery;
    private boardElement: JQuery;
    private timer: number;
    private board: b.Board;

    timeElapsed: number = 0;

    difficultyLevels: DifficultyLevel[] = [
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

    level: DifficultyLevel = this.difficultyLevels[0];

    constructor()
    {
        this.gameElement = $('#game');
        this.boardElement = $('#board');

        ko.track(this);
        ko.applyBindings(this);
    }

    start()
    {
        this.isActive = true;
        this.stopTimer();
        this.resetTimer();

        this.gameElement.width(this.level.width);

        this.board = new b.Board(this.level.dimension, this.level.mineCount, this.boardElement.empty());
        this.board.draw();

        this.board.OnReveal.on((a) => this.reveal(a));
        this.board.OnReveal.one(() => this.startTimer());

        this.board.OnWin.one(() =>{
            this.isActive = false;
            this.stopTimer();
            alert('You win!')
        });

        this.board.OnGameOver.one(() => {
            this.isActive = false;
            this.stopTimer();
            alert('Game over!');
        });
    }

    private reveal(args: b.RevealEventArgs)
    {
        if (!this.isActive) return;

        if (args.mouseButton == 0)
            this.board.revealField(args.field);
        else
            this.board.flag(args.field);
    }

    private startTimer()
    {
        this.stopTimer();

        this.timer = setInterval(()=>{ this.timeElapsed += 0.1; },100);
    }

    private stopTimer = () => clearInterval(this.timer);

    private resetTimer =() => this.timeElapsed = 0;
}