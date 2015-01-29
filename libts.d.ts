declare module ts.lang {
    interface Runnable {
        init(): void;
        run(): number;
    }
}
declare module ts.util {
    class Queue<T> {
        private elements;
        enqueue(element: T): void;
        dequeue(): T;
    }
}
declare module ts.lang {
    class Scheduler {
        private threads;
        constructor();
        private run();
        add(runnable: ts.lang.Runnable): void;
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
        load(path: string, callback?: Function): string;
        loadXML(path: string, callback?: Function): Document;
        private _load(xml, path, callback?);
    }
}
declare module ts.ui {
    class TemplateElementLoader {
        static getTemplateNode(name: string): HTMLElement;
    }
}
declare class XSLTProcessor {
    importStylesheet(xsl: any): any;
    transformToFragment(xml: any, doc: any): any;
}
declare module ts.ui {
    class View {
        private instance;
        constructor(template: any, onload?: Function, data?: Object, match?: string);
        getDom(): HTMLElement;
        append(parent: HTMLElement): void;
        deinit(): void;
        supplant(o: any): void;
        getHTMLElementsByName(name: string): Array<HTMLElement>;
        getHTMLElementsByAttribute(attribute: string, value: string): Array<HTMLElement>;
        private _traversAllChildNodes(visitor, instance);
        traversAllChildNodes(visitor: Function, instance: HTMLElement): void;
        getHTMLElementById(id: string): HTMLElement;
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
        add(item: T): void;
        get(index: number): T;
    }
}
declare module ts.util {
    class Dictionary<V> {
        private array;
        put(key: any, value: V): void;
        get(key: any): V;
        elements(): Array<V>;
        isEmpty(): boolean;
        keys(): Array<any>;
        remove(key: any): V;
        size(): number;
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
    class LinkedList<T> implements ts.util.List<T> {
        private first;
        private listsize;
        add(item: T): void;
        remove(item: T): void;
        get(index: number): T;
        size(): number;
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
        registerObserver(observer: ts.util.Observer): void;
        removeObserver(observer: ts.util.Observer): void;
        notifyObservers(arg: any): void;
    }
}
declare module ts.util {
    class RingBuffer<T> {
        private array;
        private itemCount;
        private index;
        constructor(itemCount: number);
        add(item: T): void;
        get(index: number): T;
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
        constructor(in_array?: Array<T>);
        push(item: T): void;
        pop(): T;
        peek(): T;
        size(): number;
        empty(): boolean;
        toArray(): Array<T>;
    }
}
