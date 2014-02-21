module ts.util{
    export interface Serializable {
        serialize(): string;
        deserialize(input: string);
    }
}