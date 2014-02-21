all: tsc

tsc:
	tsc libts.ts  -d -out libts.js
	cp ts/lang/WorkerSource.js WorkerSource.js

test:
	tsc test/*.ts -out test/test.js
	cat test/nodeXMLHttpRequest.js libts.js > test/unittestlibts.js.tmp && mv test/unittestlibts.js.tmp test/unittestlibts.js
	qunit -c test/unittestlibts.js -t test/test.js

.PHONY: tsc test