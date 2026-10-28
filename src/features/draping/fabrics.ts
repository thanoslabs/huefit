export type Fabric = "solid" | "linen" | "satin" | "cotton" | "denim" | "wool" | "silk";

export const FABRICS: readonly { id: Fabric; label: string; description: string }[] = [
  { id: "solid", label: "Solid", description: "Flat reference colour" },
  { id: "linen", label: "Linen", description: "Fine woven approximation" },
  { id: "satin", label: "Satin", description: "Smooth directional sheen" },
  { id: "cotton", label: "Cotton", description: "Soft matte woven approximation" },
  { id: "denim", label: "Denim", description: "Layered diagonal twill with fine warp and weft detail" },
  { id: "wool", label: "Wool", description: "Diffuse textured approximation" },
  { id: "silk", label: "Silk", description: "Soft reflective approximation" },
];

export function fabricPattern(finish: Fabric): string {
  switch (finish) {
    case "linen": return "repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.12) 1px, transparent 3px, transparent 7px)";
    case "satin": return "linear-gradient(115deg, rgba(255,255,255,0.35), transparent 35%, rgba(0,0,0,0.12) 65%, rgba(255,255,255,0.2))";
    case "cotton": return "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, transparent 1px, transparent 5px)";
    case "denim": return "repeating-linear-gradient(135deg, rgba(255,255,255,0.20) 0px, rgba(255,255,255,0.20) 1px, transparent 1px, transparent 4px, rgba(0,0,0,0.16) 4px, rgba(0,0,0,0.16) 5px, transparent 5px, transparent 8px), repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, transparent 1px, transparent 3px)";
    case "wool": return "repeating-linear-gradient(45deg, rgba(255,255,255,0.09) 0px, transparent 3px, rgba(0,0,0,0.08) 5px, transparent 9px)";
    case "silk": return "linear-gradient(110deg, rgba(255,255,255,0.28), transparent 28%, rgba(255,255,255,0.12) 52%, rgba(0,0,0,0.08) 75%, rgba(255,255,255,0.24))";
    default: return "none";
  }
}
