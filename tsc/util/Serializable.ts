module tsc.util{
    export interface Serializable {
        serialize(): string;
        deserialize(input: string);
    }
}