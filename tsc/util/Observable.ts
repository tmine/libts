/// <reference path="Observer.ts"/>
module tsc.util{

    export class Observable {
        private observers : Array<tsc.util.Observer>;
     
        constructor() {
            this.observers = new Array<tsc.util.Observer>();
        }
     
        public registerObserver (observer : tsc.util.Observer) : void {
            this.observers.push(observer);
        }
     
        public removeObserver (observer : tsc.util.Observer) : void {
            this.observers.splice(this.observers.indexOf(observer), 1);
        }
     
        public notifyObservers (arg : any) : void {
            this.observers.forEach((observer : tsc.util.Observer) => {
                observer.update(arg);
            });
        }
    }
}