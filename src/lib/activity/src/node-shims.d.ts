declare const process: any;
declare const console: any;

declare module "node:fs/promises" {
  export function readFile(path: string, encoding: string): Promise<string>;
  export function writeFile(path: string, data: string, encoding: string): Promise<void>;
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function readdir(path: string, options?: { withFileTypes?: boolean }): Promise<any[]>;
}

declare module "node:path" {
  export function join(...parts: string[]): string;
  export function basename(path: string): string;
  export function dirname(path: string): string;
}
