/// <reference path="../tsc/lang/Thread.ts"/>
var Thread = tsc.main.Thread;

/* main */
var MyThread = (function () {
    function MyThread(id) {
        this.id = id;
    }
    MyThread.prototype.init = function () {
        // initialise all vars here
        this.i = 0;
    };

    MyThread.prototype.run = function () {
        if (this.i <= 10) {
            //console.log(this.id + " " + this.i);
            this.i++;
        } else {
            // return something != null to terminate
			console.log("Thread " + this.id + " terminated");
            return 0;
        }
    };
    return MyThread;
})();

var id = 0;
for(var i=0; i<10;i++){
	Thread.create(new MyThread(id++));
}
/* end main */
