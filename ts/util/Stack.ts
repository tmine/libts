module ts.util{
	export class Stack<T>{
		private array : Array<T>;
		
		constructor(in_array?: Array<T>){
			if(in_array) this.array = in_array;
			else this.array = new Array<T>();
		}

		public push(item : T) : void{
			this.array.push(item);
		}
		
		public pop() : T {
			return this.array.pop();
		}

		public peek() : T {
			if(this.empty()) return;
			return this.array[this.array.length - 1];
		}

		public size() : number {
			return this.array.length;
		}

		public empty() : boolean {
			return this.array.length == 0;
		}

		public toArray(): Array<T> {
			return this.array;
		}
	}
}