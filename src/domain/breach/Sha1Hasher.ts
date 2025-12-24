export interface Sha1HasherProtocol {
  sha1HexUpper(input: string): Promise<string>;
}

export class Sha1Hasher implements Sha1HasherProtocol {
  async sha1HexUpper(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const buffer = await crypto.subtle.digest("SHA-1", data);
    return this.toHexUpper(buffer);
  }

  private toHexUpper(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let out = "";
    for (const b of bytes) out += b.toString(16).padStart(2, "0");
    return out.toUpperCase();
  }
}
