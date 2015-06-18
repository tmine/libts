module ch.ts.util {

    export interface Action {
        execute(done: Function): void;
    }

    export class ActionList {
        private actions = new Array<Action>();

        public add(action: Action): void {
            this.actions.push(action);
        }

        public executeSync(done?: Function): void {
            if(this.actions.length == 0 && done) done();

            var i = 0;
            var _this = this;
            var callback = function(){
                i++;
                if(i == _this.actions.length){
                    if(done) setTimeout(done, 0);
                } else {
                    setTimeout(function(){
                        _this.actions[i].execute(callback);
                    }, 0);
                }
            };

            setTimeout(function(){
                _this.actions[i].execute(callback);
            }, 0);
        }

        public executeAsync(done?: Function): void {
            if(this.actions.length == 0 && done) done();

            var waiting = 0;
            var callback = function(){
                waiting--;
                if(waiting==0 && done) setTimeout(done, 0);
            };
            this.actions.forEach(function(action, index, array){
                waiting++;
                setTimeout(function(){
                    action.execute(callback);
                }, 0);
            });
        }
    }
}