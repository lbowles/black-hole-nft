import { BlackHoleMetadata } from "./getTokensByOwner"

// sort by SM (largest first) and then by tokenId (smallest first) if SM is the same
export function compareBlackHoles(a: BlackHoleMetadata, b: BlackHoleMetadata) {
  if (b.mass.toString() !== a.mass.toString()) {
    return parseInt(b.mass.toString()) - parseInt(a.mass.toString())
  } else {
    return parseInt(a.tokenId.toString()) - parseInt(b.tokenId.toString())
  }
}
