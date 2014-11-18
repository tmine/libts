module ts.util{
	export class Dictionary<V>{
		private array : Array<V> = new Array<V>();
		
		public put(key : any, value : V) : void{
			this.array[key] = value;
		}
		
		public get(key : any) : V {
			return this.array[key];
		}
		
		public elements() : Array<V> {
			var elements = new Array<V>();
			for(var key in this.array){
				elements.push(this.array[key]);
			}
			return elements;
		}
		
		public isEmpty() : boolean{
			return (this.size() == 0);
		}
		
		public keys() : Array<any> {
			var keys = new Array<any>();
			for(var key in this.array){
				keys.push(key);
			}
			return keys;
		}
		
		public remove(key : any) : V {
			var value : V = this.array[key];
			this.array[key] = null;
			return value;
		}
		
		public size() : number {
			var size : number = 0;
			for(var item in this.array){
				size++;
			}
			return size;
		}
	}
}