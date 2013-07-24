


class ListNode{
	public prev : ListNode;
	public next : ListNode;
	public item;
	
	constructor(item) {
		this.item = item;
	}
}

class LinkedList<T> implements List {
	private first : ListNode;
	
	public add(item : T){
		if(this.first == null) this.first = new ListNode(item);
		
		var last : ListNode = this.first;
		while(last.next != null){
			last = last.next;
		}
		last.next = new ListNode(item);
		last.next.prev = last;
	}
	public remove(item : T){
		if(this.first == null) return;
		
		var node : ListNode = this.first;
		while(node.next != null){
			if(node.item == item){
				node.prev.next = node.next;
				node.next.prev = node.prev;
				break;
			}
			node = node.next;
		}
	}
	public get(index : number) : T{
		if(index == 0) return null;
		
		var node : ListNode = this.first;
		for(var i : number = 0; i<index; i++){
			if(node.next == null) return null;
			else node = node.next;
		}
		return node.item;
	}
}