/// <reference path="List.ts"/>

module ts.util{
	class ListNode{
		public prev : ListNode;
		public next : ListNode;
		public item;
		
		constructor(item) {
			this.item = item;
		}
	}
	
	export class LinkedList<T> implements ts.util.List<T> {
		private first : ListNode;
		private listsize : number = 0;

		public add(item : T){
			if(this.first == null) this.first = new ListNode(item);
			
			var last : ListNode = this.first;
			while(last.next != null){
				last = last.next;
			}
			last.next = new ListNode(item);
			last.next.prev = last;

			this.listsize++;
		}
		public remove(item : T){
			if(this.first == null) return;
			
			var node : ListNode = this.first;
			while(node.next != null){
				if(node.item == item){
					if(node.prev) node.prev.next = node.next;
					if(node.next) node.next.prev = node.prev;
					break;
				}
				node = node.next;
			}

			this.listsize--;
		}
		public get(index : number) : T{
			index++;
			if(index == 0) return null;
			
			var node : ListNode = this.first;
			for(var i : number = 0; i<index; i++){
				if(node.next == null) return null;
				else node = node.next;
			}
			return node.item;
		}
		public size() : number {
			return this.listsize;
		}
	}
}