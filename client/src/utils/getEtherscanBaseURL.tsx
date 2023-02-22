const openseaChainMapping: Record<string, string> = {
  "1": "etherscan.io",
  "5": "goerli.etherscan.io",
  "80001": "mumbai.polygonscan.io",
}

export function getEtherscanBaseURL(chainId: string) {
  return `https://${openseaChainMapping[chainId]}`
}
