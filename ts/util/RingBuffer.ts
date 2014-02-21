module ts.util{
	export class RingBuffer<T>{
		private array : Array<T> = new Array<T>();
		private itemCount : number = 0;
		private index : number = 0;
		
		constructor(itemCount : number){
			this.itemCount = itemCount;
		}
		
		public add(item : T){
			this.array[this.index] = item;
			this.index = (this.index + 1) % this.itemCount;
		}
		
		public get(index : number) : T{
			if(index < 0 || index > this.itemCount) return null;
			return this.array[index];
		}
	}
}