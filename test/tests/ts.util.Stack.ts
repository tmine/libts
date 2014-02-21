/// <reference path="../../libts.d.ts"/>

test("ts.util.Stack constructor", function() {
	var stack = new ts.util.Stack<Number>();
    ok(stack.empty(), "empty should return true");

    var stack = new ts.util.Stack<Number>([1,2]);
    ok(stack.empty() === false, "empty should return false");
    deepEqual(stack.size(), 2, "size should be 2");
    deepEqual(stack.toArray(), [1,2], "after constructor([1,2]), toArray should return [1 ,2]");
});

test("ts.util.Stack empty", function() {
	var stack = new ts.util.Stack<Number>();

    ok(stack.empty(), "empty should return true");
	stack.peek();
	ok(stack.empty(), "after peek, empty should still return true");
    stack.push(1);
	ok(stack.empty() === false, "after 1 push, empty should return false");
});

test("ts.util.Stack size", function() {
	var stack = new ts.util.Stack<Number>();

    deepEqual(stack.size(), 0, "size should be 0");
    stack.push(1)
	deepEqual(stack.size(), 1, "after 1 push, size should be 1");
	stack.peek();
	deepEqual(stack.size(), 1, "after 1 peek, size should still be 1");
	stack.pop();
	deepEqual(stack.size(), 0, "after 1 pop, size should be 0");
	stack.push(1);
	stack.push(2);
	deepEqual(stack.size(), 2, "after 2 push, size should be 2");
	stack.pop();
	stack.pop();
	deepEqual(stack.size(), 0, "after 2 pop, size should be 0");

	stack.pop();
	deepEqual(stack.size(), 0, "after 1 pop, size should be 0");
});

test("ts.util.Stack peek", function() {
	var stack = new ts.util.Stack<Number>();

    deepEqual(stack.peek(), undefined, "peek should return undefined");
	ok(stack.empty(), "after peek empty should still return true");

	stack.push(1);
	deepEqual(stack.peek(), 1, "after 1 push, peek should return 1");
	
	stack.push(2);
	deepEqual(stack.peek(), 2, "after another push, peek should return 2");

	stack.pop();
	deepEqual(stack.peek(), 1, "after 1 pop, peek should return 1");
});

test("ts.util.Stack push", function() {
	var stack = new ts.util.Stack<Number>();

	stack.push(1);
	deepEqual(stack.size(), 1, "after 1 push, size should be 1");
	deepEqual(stack.peek(), 1, "after push(1), peek should return 1");

	stack.push(2);
	deepEqual(stack.size(), 2, "after another push, size should be 2");
	deepEqual(stack.peek(), 2, "after push(2), peek should return 2");
});

test("ts.util.Stack pop", function() {
	var stack = new ts.util.Stack<Number>();

	stack.push(1);
	stack.push(2);
	deepEqual(stack.pop(), 2, "after push(1) and push(2), pop should return 2");
	deepEqual(stack.pop(), 1, "after push(1) and push(2), pop pop should return 1");
	deepEqual(stack.pop(), undefined, "after push(1) and push(2), pop pop pop should return undefined");
});

test("ts.util.Stack toArray", function() {
	var stack = new ts.util.Stack<Number>();

	stack.push(1);
	stack.push(2);
	deepEqual(stack.toArray(), [1,2], "after push(1) and push(2), toArray should return [1 ,2]");
});
















