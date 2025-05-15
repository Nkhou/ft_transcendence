declare module "three/examples/jsm/loaders/OBJLoader" {
    import { Loader, LoadingManager, Group } from "three";

    export class OBJLoader extends Loader {
        constructor(manager?: LoadingManager);
        load(
            url: string,
            onLoad: (object: Group) => void,
            onProgress?: (event: ProgressEvent) => void,
            onError?: (event: ErrorEvent) => void
        ): void;
        parse(data: string): Group;
    }
}

declare module "three/examples/jsm/loaders/MTLLoader" {
    import { Loader, LoadingManager, Material } from "three";

    export class MTLLoader extends Loader {
        constructor(manager?: LoadingManager);
        load(
            url: string,
            onLoad: (materials: Material[]) => void,
            onProgress?: (event: ProgressEvent) => void,
            onError?: (event: ErrorEvent) => void
        ): void;
        parse(text: string): Material[];
    }
}