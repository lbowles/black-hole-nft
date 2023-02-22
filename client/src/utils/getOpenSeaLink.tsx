import deployments from "../deployments.json"

const openseaChainMapping: Record<string, string> = {
  "1": "",
  "5": "goerli",
  "80001": "mumbai",
}

export function getOpenSeaLink(chainId: string, tokenId: string | number) {
  return `https://${chainId !== "1" ? "testnets." : ""}opensea.io/assets/${openseaChainMapping[chainId]}${
    deployments.contracts.BlackHoles.address
  }/${tokenId}`
}
