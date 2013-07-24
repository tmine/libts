class Stack<T>{
	private array : Array<T> = new Array<T>();
	
	public push(item : T) : void{
		this.array.push(item);
	}
	
	public pop() : T {
		return this.array.pop();
	}
}
