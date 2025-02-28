import { glob as globOriginal } from "glob";

export async function glob(pattern: string): Promise<string[]> {
  return globOriginal(pattern);
}
