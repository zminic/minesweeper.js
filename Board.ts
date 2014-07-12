/// <reference path="interfaces/jquery.d.ts" />
/// <reference path="interfaces/knockout.d.ts" />
/// <reference path="interfaces/knockout.es5.d.ts" />
/// <reference path="Common.ts" />

module Minesweeper
{
    export interface Field
    {
        isRevealed: boolean;
        isFlagged: boolean;
        isMine: boolean;
        mineCount: number;
        index: number;
    }

    export interface RevealEventArgs
    {
        field: Field;
        mouseButton: number;
    }

    export class Board
    {
        fields: Field[];

        private eventReveal = new Common.Event<RevealEventArgs>();
        private eventWin = new Common.Event();
        private eventGameOver = new Common.Event();

        public get OnReveal(): Common.IEvent<RevealEventArgs> { return this.eventReveal; }
        public get OnWin(): Common.IEvent<string> { return this.eventWin; }
        public get OnGameOver(): Common.IEvent<string> { return this.eventGameOver; }

        constructor(private dimension: number, private mineCount: number, private boardElement: JQuery)
        {
            this.fields = [];

            ko.cleanNode(this.boardElement[0]);

            boardElement.append($('#boardTemplate').html());
            boardElement.on('contextmenu', () => false);

            ko.track(this);
            ko.applyBindings(this, this.boardElement[0]);
        }

        private getRandomNumber(max)
        {
            return Math.floor((Math.random() * 1000) + 1) % max;
        }

        draw()
        {
            this.drawFields();
            this.plantMines();
            this.calculateDistances();
        }

        private drawFields()
        {
            for (var i=0; i < this.dimension * this.dimension; i++)
            {
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
        }

        private plantMines()
        {
            var minesPlanted: number = 0;

            while (minesPlanted < this.mineCount)
            {
                var index = this.getRandomNumber(this.dimension * this.dimension);

                if (!this.fields[index].isMine)
                {
                    this.fields[index].isMine = true;
                    minesPlanted++;
                }
            }
        }

        private calculateDistances()
        {
            for (var i=0; i < this.dimension * this.dimension; i++)
            {
                if (!this.fields[i].isMine)
                {
                    var field = this.fields[i],
                        mines = this.getNearFields(field, (f) => f.isMine);

                    field.mineCount = mines.length;
                }
            }
        }

        private getNearFields(from: Field, filter: (field: Field) => boolean = () => true): Field[]
        {
            var result = [],
                dim = this.dimension,
                len = this.fields.length,
                ind = from.index,
                isFirstColumn = (i) => i % dim == 0 && i != 0,
                isLastColumn = (i) => (i + 1) % dim == 0 && i != len - 1;

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
        }

        private onRevealField = (field: Field, event: any) => {
            this.eventReveal.trigger({
                field: field,
                mouseButton: event.button
            });
        }

        revealField = (field: Field, auto: boolean = false) =>
        {
            // do not reveal flagged and revealed fields in auto mode
            if (field.isFlagged || auto && field.isRevealed) return;

            if (field.isMine)
            {
                this.revealBoard();
                this.eventGameOver.trigger();
            }
            else if (field.isRevealed && !auto)
            {
                var flagged = this.getNearFields(field, (f) => f.isFlagged);

                if (field.mineCount == flagged.length)
                {
                    this.getNearFields(field, (f) => !f.isRevealed && !f.isFlagged).forEach((f) => this.revealField(f, true));
                }
            }
            else
            {
                field.isRevealed = true;
                field.isFlagged = false;

                // auto reveal
                if (field.mineCount == 0)
                {
                    this.getNearFields(field).forEach((f) => this.revealField(f, true));
                }

                if (this.isGameOver()) this.eventWin.trigger();
            }
        }

        private revealBoard()
        {
            for(var i=0; i < this.fields.length; i++)
            {
                this.fields[i].isRevealed = true;
            }
        }

        private isGameOver()
        {
            return this.fields.filter((f) => !f.isRevealed).length == this.mineCount;
        }

        flag(field: Field)
        {
            if (!field.isRevealed) field.isFlagged = !field.isFlagged;
        }
    }
}