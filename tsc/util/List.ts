module tsc.util{
	export interface List<T> {
		add(item : T);
		remove(item : T);
		get(index : number) : T;
	}
}