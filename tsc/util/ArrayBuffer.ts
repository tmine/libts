class ArrayBuffer<T>{
	private array : Array<T> = new Array<T>();
	private size : number = 0;
	private index : number = 0;
	
	constructor(size : number){
		this.size = size;
	}
	
	public add(item : T){
		if(this.index+1 < this.size){
			this.array[this.index] = item;
			this.index++;
		}else{
			for(var i=0; i<this.array.length-1; i++){
				this.array[i] = this.array[i+1];
			}
			this.array[this.index] = item;
		}
	}
	
	public get(index : number){
		if(index < 0 || index > this.size) return null;
		return this.array[index];
	}
}
