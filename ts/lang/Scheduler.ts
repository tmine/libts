/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>

module ts.lang{

	export class Scheduler{
		private threads : ts.util.Queue<ts.lang.Runnable> = new ts.util.Queue<ts.lang.Runnable>();
		
		constructor(){
			setInterval(() => { this.run(); }, 0);
		}
		
		private run() : void {
			var runnable : ts.lang.Runnable = this.threads.dequeue();
			if(runnable != null){
				if(runnable.run() == null){
					this.threads.enqueue(runnable);
				}
			}
		}
		
		public add(runnable : ts.lang.Runnable){
			this.threads.enqueue(runnable);
			runnable.init();
		}
		
	}
}