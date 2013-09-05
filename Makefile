all: tsc ThreadingTest ViewTest

ThreadingTest:
	tsc ThreadingTest/main.ts -out ThreadingTest/main.js
	cp tsc/lang/WorkerSource.js ThreadingTest/WorkerSource.js

ViewTest:
	tsc ViewTest/main.ts -out ViewTest/main.js

tsc:
	tsc tsc/tsc.ts -out tsc/tsc.js
	cp tsc/lang/WorkerSource.js tsc/WorkerSource.js
	cat tsc/*/*.ts >> tsc/tsc.lib.ts
	tsc tsc/tsc.ts -d -out tsc/tsc.d.ts

.PHONY: tsc ViewTest ThreadingTest