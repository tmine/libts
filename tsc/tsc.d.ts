declare module tsc.lang {
    interface Runnable {
        init(): void;
        run(): number;
    }
}
declare module tsc.util {
    class Queue<T> {
        private elements;
        public enqueue(element: T): void;
        public dequeue(): T;
    }
}
declare module tsc.lang {
    class Scheduler {
        private threads;
        constructor();
        private run();
        public add(runnable: lang.Runnable): void;
    }
}
declare module tsc.main {
    class Thread {
        private static worker;
        private static scheduler;
        static init(): void;
        static create(runnable: tsc.lang.Runnable): void;
    }
}
declare module tsc.ui {
    class ResourceLoader {
        public load(path: string, callback?: Function): string;
        public loadXML(path: string, callback?: Function): Document;
        private _load(xml, path, callback?);
    }
}
declare module tsc.ui {
    class TemplateElementLoader {
        static getTemplateNode(name: string): HTMLElement;
    }
}
declare module tsc.ui {
    class View {
        private instance;
        constructor(template: any, onload?: Function);
        public getDom(): HTMLElement;
        public getHTMLElementsByName(name: string): HTMLElement[];
        private _traversAllChildNodes(visitor, instance);
        public getHTMLElementById(id: string): HTMLElement;
        private _getHTMLElementById(id, instance);
    }
}
declare module tsc.util {
    class Buffer<T> {
        private array;
        private size;
        private index;
        constructor(size: number);
        public add(item: T): void;
        public get(index: number): T;
    }
}
declare module tsc.util {
    class Dictionary<any, V> {
        private array;
        public put(key: any, value: V): void;
        public get(key: any): V;
        public elements(): V[];
        public isEmpty(): boolean;
        public keys(): any[];
        public remove(key: any): V;
        public size(): number;
    }
}
declare module tsc.util {
    interface List<T> {
        add(item: T);
        remove(item: T);
        get(index: number): T;
        size(): number;
    }
}
declare module tsc.util {
    class LinkedList<T> implements util.List<T> {
        private first;
        private listsize;
        public add(item: T): void;
        public remove(item: T): void;
        public get(index: number): T;
        public size(): number;
    }
}
declare module tsc.util {
    interface Observer {
        update(arg: any);
    }
}
declare module tsc.util {
    class Observable {
        private observers;
        constructor();
        public registerObserver(observer: util.Observer): void;
        public removeObserver(observer: util.Observer): void;
        public notifyObservers(arg: any): void;
    }
}
declare module tsc.util {
    class RingBuffer<T> {
        private array;
        private itemCount;
        private index;
        constructor(itemCount: number);
        public add(item: T): void;
        public get(index: number): T;
    }
}
declare module tsc.util {
    class Stack<T> {
        private array;
        public push(item: T): void;
        public pop(): T;
        public peek(): T;
        public size(): number;
        public empty(): boolean;
    }
}
