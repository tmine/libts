
class Observable {
    private observers : Array<Observer>;
 
    constructor() {
        this.observers = new Array<Observer>();
    }
 
    public registerObserver (observer : Observer) : void {
        this.observers.push(observer);
    }
 
    public removeObserver (observer : Observer) : void {
        this.observers.splice(this.observers.indexOf(observer), 1);
    }
 
    public notifyObservers (arg : any) : void {
        this.observers.forEach((observer : Observer) => {
            observer.update(arg);
        });
    }
}
