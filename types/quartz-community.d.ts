declare module "@quartz-community/types" {
  export type QuartzComponentProps = {
    ctx: any;
    externalResources: any;
    fileData: any;
    cfg: any;
    children: any;
    tree: any;
    allFiles: any[];
    displayClass?: "mobile-only" | "desktop-only";
  } & Record<string, any>;

  export type QuartzComponent = ((props: QuartzComponentProps) => any) & {
    css?: string | string[] | undefined;
    beforeDOMLoaded?: string | string[] | undefined;
    afterDOMLoaded?: string | string[] | undefined;
  };

  export type QuartzComponentConstructor<Options extends object | undefined = undefined> = (
    opts?: Options,
  ) => QuartzComponent;

  export interface FileTrieNode {
    slugSegments: string[];
    data: any | null;
    children: FileTrieNode[];
    isFolder: boolean;
    fileSegmentHint?: string;
    slugSegment?: string;
    displayName?: string;
  }

  export interface ExplorerOptions {
    title?: string;
    folderDefaultState: "collapsed" | "open";
    folderClickBehavior: "collapse" | "link";
    useSavedState: boolean;
    sortFn?: (a: FileTrieNode, b: FileTrieNode) => number;
    filterFn?: (node: FileTrieNode) => boolean;
    mapFn?: (node: FileTrieNode) => void;
    order?: Array<"filter" | "map" | "sort">;
  }
}
