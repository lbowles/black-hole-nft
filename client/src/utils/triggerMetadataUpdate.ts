import deployments from "../deployments.json"

const chains = {
  "1": "eth",
  "5": "goerli",
  "80001": "mumbai",
}

const { REACT_APP_MORALIS_API_KEY } = process.env

interface IMetadataUpdate {
  tokenAddress: string
  tokenId: number
}

async function triggerMetadataUpdateTestnet({ tokenAddress, tokenId }: IMetadataUpdate) {
  // https://deep-index.moralis.io/api/v2/nft/0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB/1/metadata/resync?chain=eth&flag=uri&mode=sync
  const chain: string = (chains as any)[deployments.chainId]

  const res = await fetch(
    `https://deep-index.moralis.io/api/v2/nft/${tokenAddress}/${tokenId}/metadata/resync?chain=${chain}&flag=uri&mode=sync`,
    {
      headers: {
        "x-api-key": REACT_APP_MORALIS_API_KEY!,
      },
    },
  )

  console.log(await res.json())
}

async function triggerMetadataUpdateMainnet({ tokenAddress, tokenId }: IMetadataUpdate) {}

export async function triggerMetadataUpdate({ tokenAddress, tokenId }: IMetadataUpdate) {
  if ((deployments.chainId as string) === "31337") {
    return
  } else if ((deployments.chainId as string) === "1") {
    await triggerMetadataUpdateMainnet({ tokenAddress, tokenId })
  }
  await triggerMetadataUpdateTestnet({ tokenAddress, tokenId })
}
