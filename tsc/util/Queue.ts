class Queue{
	private elements = new Array();
	
	public enqueue(element) : void {
		this.elements.reverse();
		this.elements.push(element);
		this.elements.reverse();
	}
	
	public dequeue(){
		return this.elements.pop();
	}
}

/*
class Queue<T>{
	private elements = new Array<T>();
	
	public enqueue(element : T) : void {
		this.elements.reverse();
		this.elements.push(element);
		this.elements.reverse();
	}
	
	public dequeue() : T{
		return this.elements.pop();
	}
}
*/