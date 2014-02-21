declare module ts.lang {
    interface Runnable {
        init(): void;
        run(): number;
    }
}
declare module ts.util {
    class Queue<T> {
        private elements;
        public enqueue(element: T): void;
        public dequeue(): T;
    }
}
declare module ts.lang {
    class Scheduler {
        private threads;
        constructor();
        private run();
        public add(runnable: lang.Runnable): void;
    }
}
declare module ts.main {
    class Thread {
        private static worker;
        private static scheduler;
        static init(): void;
        static create(runnable: ts.lang.Runnable): void;
    }
}
declare module ts.ui {
    class ResourceLoader {
        public load(path: string, callback?: Function): string;
        public loadXML(path: string, callback?: Function): Document;
        private _load(xml, path, callback?);
    }
}
declare module ts.ui {
    class TemplateElementLoader {
        static getTemplateNode(name: string): HTMLElement;
    }
}
declare class XSLTProcessor {
    public importStylesheet(xsl: any): any;
    public transformToFragment(xml: any, doc: any): any;
}
declare module ts.ui {
    class View {
        private instance;
        constructor(template: any, onload?: Function, data?: Object, match?: string);
        public getDom(): HTMLElement;
        public append(parent: HTMLElement): void;
        public deinit(): void;
        public supplant(o: any): void;
        public getHTMLElementsByName(name: string): HTMLElement[];
        public getHTMLElementsByAttribute(attribute: string, value: string): HTMLElement[];
        private _traversAllChildNodes(visitor, instance);
        public traversAllChildNodes(visitor: Function, instance: HTMLElement): void;
        public getHTMLElementById(id: string): HTMLElement;
        private _getHTMLElementById(id, instance);
        private static toXML;
    }
}
declare module ts.util {
    class Buffer<T> {
        private array;
        private size;
        private index;
        constructor(size: number);
        public add(item: T): void;
        public get(index: number): any;
    }
}
declare module ts.util {
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
declare module ts.util {
    interface List<T> {
        add(item: T): any;
        remove(item: T): any;
        get(index: number): T;
        size(): number;
    }
}
declare module ts.util {
    class LinkedList<T> implements util.List<T> {
        private first;
        private listsize;
        public add(item: T): void;
        public remove(item: T): void;
        public get(index: number): T;
        public size(): number;
    }
}
declare module ts.util {
    interface Observer {
        update(arg: any): any;
    }
}
declare module ts.util {
    class Observable {
        private observers;
        constructor();
        public registerObserver(observer: util.Observer): void;
        public removeObserver(observer: util.Observer): void;
        public notifyObservers(arg: any): void;
    }
}
declare module ts.util {
    class RingBuffer<T> {
        private array;
        private itemCount;
        private index;
        constructor(itemCount: number);
        public add(item: T): void;
        public get(index: number): T;
    }
}
declare module ts.util {
    interface Serializable {
        serialize(): string;
        deserialize(input: string): any;
    }
}
declare module ts.util {
    class Stack<T> {
        private array;
        constructor(in_array?: T[]);
        public push(item: T): void;
        public pop(): T;
        public peek(): T;
        public size(): number;
        public empty(): boolean;
        public toArray(): T[];
    }
}
