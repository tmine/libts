all: yeti

tsc:
	tsc libts.ts  -d -out libts.js
	cp ts/lang/WorkerSource.js WorkerSource.js

test: tsc
	tsc test/tests/*.ts -out test/test.js
	cat test/nodeXMLHttpRequest.js libts.js > test/unittestlibts.js.tmp && mv test/unittestlibts.js.tmp test/unittestlibts.js
	cat test/unittestlibts.js test/exports.js > test/unittestlibts.js.tmp && mv test/unittestlibts.js.tmp test/unittestlibts.js
	qunit -c test/unittestlibts.js -t test/test.js

yeti:
	tsc test/tests/*.ts -out test/test.js
	yeti test/test.html

.PHONY: tsc test