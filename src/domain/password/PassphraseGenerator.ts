export interface PassphraseGeneratorProtocol {
  generate(count: number): string[];
}

export class PassphraseGenerator implements PassphraseGeneratorProtocol {
  private readonly wordsA = [
    "orbit",
    "bamboo",
    "saffron",
    "velvet",
    "comet",
    "ember",
    "ridge",
    "cipher",
    "spruce",
    "kettle",
    "galaxy",
    "cobalt",
    "atlas",
    "prairie",
    "harbor",
    "signal",
    "drift",
    "puzzle",
    "lumen",
    "aurora",
    "quartz",
    "maple",
    "fable",
    "marble",
    "echo",
    "hazel",
    "river",
    "summit",
    "pepper",
    "sailor",
    "opal",
    "nova",
    "pioneer",
    "sierra",
    "violet",
    "zenith",
    "wander",
    "rocket",
    "thunder",
    "whisper",
    "ranger",
    "lantern",
    "rocketship",
    "paper",
    "bronze",
    "silver",
    "tangerine",
    "midnight",
    "sunrise",
    "meadow",
    "forest",
    "island",
    "oasis",
    "canopy",
    "monsoon",
    "cascade",
    "canyon",
    "glacier",
    "voltage",
    "matrix",
    "kernel",
    "polygon",
    "vector",
    "paradox",
    "spectrum",
  ] as const;

  private readonly wordsB = [
    "tiger",
    "falcon",
    "otter",
    "lynx",
    "panda",
    "wolf",
    "eagle",
    "shark",
    "whale",
    "gecko",
    "badger",
    "phoenix",
    "dragon",
    "sparrow",
    "panther",
    "orca",
    "raven",
    "manta",
    "bison",
    "yak",
    "koala",
    "rabbit",
    "gopher",
    "turtle",
    "beetle",
    "spider",
    "lion",
    "zebra",
    "lemur",
    "ferret",
    "salmon",
    "sturgeon",
    "hummingbird",
    "heron",
    "weasel",
    "cougar",
    "puma",
    "rhino",
    "hippo",
    "gazelle",
    "dolphin",
    "octopus",
    "penguin",
    "caribou",
    "buffalo",
    "kangaroo",
    "wombat",
    "seal",
    "walrus",
    "alpaca",
    "monkey",
    "gorilla",
    "chameleon",
    "armadillo",
    "jaguar",
    "cheetah",
    "coyote",
    "lizard",
    "stingray",
    "eel",
    "narwhal",
    "peacock",
    "crane",
    "swallow",
  ] as const;

  generate(count: number): string[] {
    const safeCount = Math.max(0, Math.min(5, Math.floor(count)));
    return Array.from({ length: safeCount }).map(() => this.generateOne());
  }

  private generateOne(): string {
    const a = this.pick(this.wordsA);
    const b = this.pick(this.wordsB);
    const c = this.pick(this.wordsA);
    const d = this.pick(this.wordsB);
    const digits = this.randomInt(10, 99);
    return `${a}-${b}-${c}-${d}-${digits}`;
  }

  private pick<T>(items: readonly T[]): T {
    return items[this.randomInt(0, items.length - 1)];
  }

  private randomInt(min: number, max: number): number {
    const safeMin = Math.ceil(min);
    const safeMax = Math.floor(max);
    if (safeMax <= safeMin) return safeMin;

    const range = safeMax - safeMin + 1;
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    return safeMin + (bytes[0] % range);
  }
}
