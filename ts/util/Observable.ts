/// <reference path="Observer.ts"/>
module ts.util{

    export class Observable {
        private observers : Array<ts.util.Observer>;
     
        constructor() {
            this.observers = new Array<ts.util.Observer>();
        }
     
        public registerObserver (observer : ts.util.Observer) : void {
            this.observers.push(observer);
        }
     
        public removeObserver (observer : ts.util.Observer) : void {
            this.observers.splice(this.observers.indexOf(observer), 1);
        }
     
        public notifyObservers (arg : any) : void {
            this.observers.forEach((observer : ts.util.Observer) => {
                observer.update(arg);
            });
        }
    }
}