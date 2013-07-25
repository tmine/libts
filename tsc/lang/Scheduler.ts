/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.lang{

	export class Scheduler{
		private threads : tsc.util.Queue<tsc.lang.Runnable> = new tsc.util.Queue<tsc.lang.Runnable>();
		
		constructor(){
			setInterval(() => { this.run(); }, 0);
		}
		
		private run() : void {
			var runnable : tsc.lang.Runnable = this.threads.dequeue();
			if(runnable != null){
				if(runnable.run() == null){
					this.threads.enqueue(runnable);
				}
			}
		}
		
		public add(runnable : tsc.lang.Runnable){
			this.threads.enqueue(runnable);
			runnable.init();
		}
		
	}
}