all: tsc ThreadingTest ViewTest

ThreadingTest:
	tsc ThreadingTest/main.ts -out ThreadingTest/main.js
	cp tsc/lang/WorkerSource.js ThreadingTest/WorkerSource.js

ViewTest:
	tsc ViewTest/main.ts -out ViewTest/main.js

tsc:
	tsc tsc/tsc.ts -out tsc/tsc.js
	cp tsc/lang/WorkerSource.js tsc/WorkerSource.js

.PHONY: tsc ViewTest ThreadingTest