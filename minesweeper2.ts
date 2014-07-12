/// <reference path="c:/Users/zminic/.WebStorm8/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_jquery_jquery.d.ts" />

interface DifficultyDefinition
{
    [name: string]: { d:number; m: number }
}

class Game
{
    private isActive: boolean = false;
    private timerElement: JQuery;
    private gameElement: JQuery;
    private time: number = 0;
    private timer: number;

    private difficulty: DifficultyDefinition = {
        'easy': { d: 7, m: 5 },
        'beginner': { d: 9, m: 10 },
        'intermediate': { d: 12, m: 24 },
        'advanced': { d: 16, m: 60 }
    }

    constructor(gameElement: JQuery)
    {
        this.gameElement = gameElement;
        this.timerElement = gameElement.find('.timer');
        gameElement.find('button.newGame').on('click', this.start);
        gameElement.on('contextmenu', () => false);
    }

    start()
    {
        var level = this.difficulty[$('.level').val()];
        this.gameElement.width((level.d * 42) + 2);

        this.stopTimer();
        this.resetTimer();

        this.isActive = true;

        alert('started');
    }

    private startTimer()
    {
        this.stopTimer();

        this.timer = setInterval(()=>{
            this.time += 0.1;
            this.timerElement.text(this.time);
        },100);

        this.timerElement.text(this.time);
    }

    private stopTimer()
    {
        clearInterval(this.timer);
    }

    private resetTimer()
    {
        this.time = 0;
        this.timerElement.text(this.time);
    }
}

$(()=>{
    var game = new Game($('#game'));
    game.start();
});