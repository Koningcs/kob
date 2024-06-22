import { AcGameObject } from "./AcGameObjects";
import { Cell } from "./Cell";

// 枚举类， 表示蛇的状态
export const SnakeStatusEnum = {
    IDLE : "idle",
    MOVE : "move",
    DIE : "die"
}

export class Snake extends AcGameObject {

    
    constructor(info, gamemap) {
        super();

        this.id = info.id;
        this.color = info.color;
        this.gamemap = gamemap;        

        this.cells = [new Cell(info.r, info.c)]; // 存放蛇的身体，cells[0]存放蛇头
        this.next_cell = null // 下一步的目标位置

        this.speed = 5; // 每秒走5个格子
        this.direction = -1; //-1 表示没有指令， 0，1，2，3表上上右下左
    
        this.status = SnakeStatusEnum.IDLE;
        
        this.dr = [-1, 0, 1, 0];
        this.dc = [0, 1, 0, -1];
        this.step = 0;

        this.eps = 1e-2;

        this.eye_direction = 0;
        if(this.id === 1) this.eye_direction = 2;

        this.eye_dx = [
            [-1, 1],
            [1, 1],
            [1, -1],
            [-1, -1],
        ];

        this.eye_dy = [
            [-1, -1],
            [-1, 1],
            [1, 1],
            [-1, 1],
        ];
    }

    start() {

    }

    update() {
        if(this.status === SnakeStatusEnum.MOVE) {
            this.update_move();
        }
        this.render();
    }

    render() {
        const L = this.gamemap.L;
        const ctx = this.gamemap.ctx;

        ctx.fillStyle = this.color;
        if(this.status === SnakeStatusEnum.DIE) {
            ctx.fillStyle = "white";
        }
        for(const cell of this.cells) {
            ctx.beginPath();
            ctx.arc(cell.x * L, cell.y * L, L / 2 * 0.8, 0, Math.PI * 2);
            ctx.fill();
        } 
        // 这个地方要好好想想
        for (let i = 1; i < this.cells.length; i ++) {
            const a = this.cells[i - 1], b = this.cells[i];
            if (Math.abs(a.x - b.x) < this.eps && Math.abs(a.y - b.y) < this.eps)
                continue;
            if (Math.abs(a.x - b.x) < this.eps) {
                ctx.fillRect((a.x - 0.5 + 0.1) * L, Math.min(a.y, b.y) * L, L * 0.8, Math.abs(a.y - b.y) * L); 
            } else {
                ctx.fillRect(Math.min(a.x, b.x) * L, (a.y - 0.5 + 0.1) * L, Math.abs(a.x - b.x) * L, L * 0.8); 
            }
        }

        ctx.fillStyle = "black";
        for (let i = 0; i < 2; i ++) {
            const eye_x = (this.cells[0].x + this.eye_dx[this.eye_direction][i] * 0.15) * L;
            const eye_y = (this.cells[0].y + this.eye_dy[this.eye_direction][i] * 0.15) * L;
            ctx.beginPath();
            ctx.arc(eye_x, eye_y, L * 0.06, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    set_direction(d) {
        this.direction = d;
    }

    /**
     * 检测当前回合， 蛇的长度是否增加
     * 蛇长度增加的方案： 小于等于10的时候每回合增加1
     *                  大于10的时候每3回合增加1
     */
    check_tail_increasing() {
        if(this.step <= 10) return true;
        else if(this.step % 3 === 1) return true;
        return false;
    }

    next_step() {
        const d = this.direction;
        this.next_cell = new Cell(this.cells[0].r + this.dr[d], this.cells[0].c + this.dc[d]);
        this.direction = -1;
        this.eye_direction = d;
        this.status = SnakeStatusEnum.MOVE;
        this.step ++;

        const k = this.cells.length;
        for( let i = k; i > 0; i --) {
            this.cells[i] = JSON.parse(JSON.stringify(this.cells[i - 1]));
        }

        if(!this.gamemap.check_valid(this.next_cell)) {
            this.status = SnakeStatusEnum.DIE;
        }
    }

    update_move() {
        // dx dy 表示移到下一个格子的x,y的增量
        // 这里计算的时候是按照斜线计算的，但实际上这里不会出现斜线， so: dx dy 总有一个是0
        const dx = this.next_cell.x - this.cells[0].x;
        const dy = this.next_cell.y - this.cells[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < this.eps) {
            this.status = SnakeStatusEnum.IDLE;
            // 想想这里x,y坐标已经变了，为什么还要赋值？
            this.cells[0] = this.next_cell;
            this.next_cell = null;
            
            // 蛇不变长
            if(!this.check_tail_increasing())
                this.cells.pop();
        } else {
            const move_distance = this.speed * this.timedelta / 1000;
            this.cells[0].x += move_distance * dx / distance;
            this.cells[0].y += move_distance * dy / distance;
            console.log(this.cells[0]);

            if(!this.check_tail_increasing()) {
                const k = this.cells.length;
                const tail = this.cells[k - 1], tail_target = this.cells[k - 2];
                const tail_dx = tail_target.x - tail.x;
                const tail_dy = tail_target.y - tail.y;
                tail.x += move_distance * tail_dx / distance;
                tail.y += move_distance * tail_dy / distance;
            }
        }
    }

}