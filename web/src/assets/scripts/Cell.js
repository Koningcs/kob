/**
 * 蛇里边的一个小方格
 */

export class Cell {

    constructor(r, c) {
        this.r = r;
        this.c = c;
        this.x = c + 0.5;
        this.y = r + 0.5;
    }

}