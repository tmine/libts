module ts.util{
	export class Stack<T>{
		private array : Array<T> = new Array<T>();
		
		public push(item : T) : void{
			this.array.push(item);
		}
		
		public pop() : T {
			return this.array.pop();
		}

		public peek() : T {
			var item : T = this.array.pop();	
			this.array.push(item);
			return item;
		}

		public size() : number {
			return this.array.length;
		}

		public empty() : boolean {
			return this.array.length == 0;
		}
	}
}