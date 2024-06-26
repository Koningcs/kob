import { AcGameObject } from "./AcGameObjects";
import { Snake } from "./Snake";
import { Wall } from "./Wall";
import {SnakeStatusEnum} from "./Snake";
export class GameMap extends AcGameObject {

    constructor(ctx, parent) {

        super();

        this.ctx = ctx;
        this.parent = parent;
        this.L = 0;

        this.rows = 13;
        this.cols = 14;
        
        this.inner_wall_count = 20;
        this.walls = [];

        this.snakes = [
            new Snake({id : 0, color : "#4876EC", r : this.rows - 2, c : 1} , this),
            new Snake({id : 1, color : "#F94848", r : 1, c : this.cols - 2} , this)
        ];


    }

    check_connectivity(g, sx, sy, tx, ty) {
        if(sx == tx && sy == ty) return true;
        g[sx][sy] = true;

        let dx = [-1, 0, 1, 0], dy = [0, 1, 0, -1];
        for(let i = 0; i < 4; i ++) {
            let x = sx + dx[i], y = sy + dy[i];
            if (!g[x][y] && this.check_connectivity(g, x, y, tx, ty))
                return true;
        }
        return false;
    }

    create_wall() {
        const g = [];
        // 不能在开始处
        const isStartPos = (r, c) => {
            if(r == this.rows - 2 && c == 1) return true;
            if(r == 1 && c == this.cols - 2) return true;
            return false;
        }

        for( let r = 0; r < this.rows; r ++) {
            g[r] = [];
            for(let c = 0; c < this.cols; c ++) {
                g[r][c] = false;
            }
        }

        // 给四周加上障碍物
        for(let r = 0; r < this.rows; r ++) {
            g[r][0] = g[r][this.cols - 1] = true;
        } 
        for(let c = 0; c < this.cols; c ++) {
            g[0][c] = g[this.rows - 1][c] = true;
        } 
        
        // 创建随机障碍物
        for(let i = 0; i < this.inner_wall_count / 2; i ++) {
            let r = 0, c = 0;
            while(g[r][c] === true || isStartPos(r, c)) {
                r = parseInt(Math.random() * this.rows);
                c = parseInt(Math.random() * this.cols);    
            }
            //console.log(r, c);
            g[r][c] = g[this.rows - 1 - r][this.cols - 1 - c]= true;
        }

        const copy_g = JSON.parse(JSON.stringify(g));
        if(!this.check_connectivity(copy_g, this.rows - 2, 1, 1, this.cols - 2) ) return false;
        for(let r = 0; r < this.rows; r ++) {
            for(let c = 0; c < this.cols; c ++) {
                if(g[r][c]) {
                    this.walls.push(new Wall(r, c, this));
                }
            }
        }

        return true;
    }

    add_listening_events() {
        this.ctx.canvas.focus();

        const [snake0, snake1] = this.snakes;
        this.ctx.canvas.addEventListener("keydown", e => {
            if (e.key === 'w') snake0.set_direction(0);
            else if(e.key === 'd') snake0.set_direction(1);
            else if(e.key === 's') snake0.set_direction(2);
            else if(e.key === 'a') snake0.set_direction(3);
            else if(e.key === 'ArrowUp') snake1.set_direction(0);
            else if(e.key === 'ArrowRight') snake1.set_direction(1);
            else if(e.key === 'ArrowDown') snake1.set_direction(2);
            else if(e.key === 'ArrowLeft') snake1.set_direction(3);
        });
    }
 
    start() {
        let c = this.create_wall();
        while(c !== true) {
            c = this.create_wall();
        }
        this.add_listening_events();
    }

    update_size() {
        this.L = parseInt(Math.min(this.parent.clientHeight / this.cols, this.parent.clientWidth / this.rows));
        this.ctx.canvas.width = this.L * this.cols;
        this.ctx.canvas.height = this.L * this.rows;

    }

    check_ready() { // 判断两条蛇是否准备好了
        for (const snake of this.snakes) {
            if(snake.status !== SnakeStatusEnum.IDLE) return false;
            if(snake.direction === -1) return false
        }  
        return true;
    }

    next_step() {
        for (const snake of this.snakes) {
            console.log(snake)
            snake.next_step();
        }

    }

    check_valid(cell) { // 检测目标位置是否合法， 没有撞到两条蛇的身体和墙壁
        for (const wall of this.walls) {
            if(cell.r === wall.r && cell.c === wall.c) {
                return false;
            }
        }
        
        for (const snake of this.snakes) {
            let k = snake.cells.length;
            if (!snake.check_tail_increasing()) {
                k --;
            }
            for (let i = 0; i < k; i ++) {
                if (snake.cells[i].r === cell.r && snake.cells[i].c === cell.c) {
                    return false;
                }
            }
        }
        return true;
    }

    update() {
        this.update_size();
        if(this.check_ready()) {
            this.next_step();
        }
        this.render();
    }

    render() {
        const color_even = "#AAD751", color_odd = "#A2D149";
        
        for (let r = 0; r < this.rows; r ++) {
            for(let c = 0; c < this.cols; c ++) {
                if((r + c) % 2 == 0) {
                    this.ctx.fillStyle = color_even;
                } else {
                    this.ctx.fillStyle = color_odd;
                }
                this.ctx.fillRect(c * this.L, r * this.L, this.L, this.L);
            }
        }
    }
}