import deployments from "../deployments.json"

const openseaChainMapping: Record<string, string> = {
  "1": "",
  "5": "goerli",
  "80001": "mumbai",
}

export function getOpenSeaLink(collectionAddress: string, tokenId: string | number) {
  return `https://${(deployments.chainId as unknown) !== "1" ? "testnets." : ""}opensea.io/assets/${
    openseaChainMapping[deployments.chainId]
  }/${collectionAddress}/${tokenId}`
}
