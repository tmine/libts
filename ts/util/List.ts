module ts.util{
	export interface List<T> {
		add(item : T);
		remove(item : T);
		get(index : number) : T;
		size() : number;
        toArray(): Array<T>;
	}
}