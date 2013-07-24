/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>

class Scheduler{
	private threads : Queue = new Queue();
	
	constructor(){
		setInterval(() => { this.run(); }, 0);
	}
	
	private run() : void {
		var runnable : Runnable = this.threads.dequeue();
		if(runnable != null){
			if(runnable.run() == null){
				this.threads.enqueue(runnable);
			}
		}
	}
	
	public add(runnable : Runnable){
		this.threads.enqueue(runnable);
		runnable.init();
	}
	
}


/*
class Scheduler{
	private threads : Queue<Runnable> = new Queue<Runnable>();
	
	constructor(){
		setInterval(() => { this.run(); }, 0);
	}
	
	private run() : void {
		var runnable : Runnable = this.threads.dequeue();
		if(runnable != null){
			if(runnable.run() == null){
				this.threads.enqueue(runnable);
			}
		}
	}
	
	public add(runnable : Runnable){
		this.threads.enqueue(runnable);
		runnable.init();
	}
	
}
*/