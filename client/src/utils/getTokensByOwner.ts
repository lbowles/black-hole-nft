import { BigNumber, ethers } from "ethers"
import { Address } from "wagmi"
import deployments from "../deployments.json"
import { BlackHoleStruct } from "../../../backend/types/BlackHoles"
import { BlackHoles__factory } from "../../../backend/types"

const chains = {
  "1": "eth",
  "5": "goerli",
}

export type BlackHoleMetadata = Omit<BlackHoleStruct, "size">

export interface ITokenSearch {
  provider?: ethers.providers.Provider
  address: Address
  tokenAddress: Address
}

async function getTokensByOwnerLocal({ provider, address, tokenAddress }: ITokenSearch) {
  const contractABI = ["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"]

  const contract = new ethers.Contract(tokenAddress, contractABI, provider)
  let filter = contract.filters.Transfer(null, address, null)
  let events = await contract.queryFilter(filter)

  const tokenIds = events
    .filter((event) => event.args![2] !== ethers.constants.AddressZero) // exclude burned tokens
    .map((event) => event.args![2].toString())

  // TODO: Query contract in batches of 500
  const tokens: BlackHoleMetadata[] = await BlackHoles__factory.connect(tokenAddress, provider!).blackHolesForTokenIds(
    tokenIds,
  )

  filter = contract.filters.Transfer(address, ethers.constants.AddressZero, null)
  events = await contract.queryFilter(filter)

  const burnedIds = events.map((event) => event.args![2].toString())

  return tokens.filter((token) => !burnedIds.includes(token.tokenId.toString()))
}

async function getTokensByOwnerProd({ address, tokenAddress }: ITokenSearch) {
  // https://deep-index.moralis.io/api/v2/0xd8da6bf26964af9d7eed9e03e53415d37aa96045/nft?chain=eth&format=decimal&token_addresses%5B0%5D=0x123
  const chain: string = (chains as any)[deployments.chainId]

  const tokens: BlackHoleMetadata[] = []

  // Fetch with cursor
  const baseUrl = `https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chain}&format=decimal&token_addresses%5B0%5D=${tokenAddress}`
  let url = baseUrl
  while (true) {
    const response = await fetch(url)
    const json = await response.json()
    const newTokens: BlackHoleMetadata[] = json.result.map((token: any) => {
      const { Level: level, Name: name, Mass: mass } = JSON.parse(token.metadata).attributes
      return {
        tokenId: BigNumber.from(token.token_id),
        level: BigNumber.from(level),
        name: BigNumber.from(name),
        mass: BigNumber.from(mass),
      }
    })
    tokens.push(...newTokens)

    if (!json.cursor) {
      break
    }

    url = `${baseUrl}&cursor=${json.cursor}`
  }

  return tokens
}

export async function getTokensByOwner({ provider, address, tokenAddress }: ITokenSearch) {
  const balance = await BlackHoles__factory.connect(tokenAddress, provider!).balanceOf(address)

  if (balance.eq(0)) {
    return []
  }

  if (deployments.chainId === "31337") {
    return getTokensByOwnerLocal({ provider, address, tokenAddress })
  }
  return getTokensByOwnerProd({ address, tokenAddress })
}
