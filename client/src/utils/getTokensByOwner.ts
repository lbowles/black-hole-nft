import { BigNumber, ethers } from "ethers"
import { Address } from "wagmi"
import deployments from "../deployments.json"
import { BlackHoleStruct } from "../../../backend/types/BlackHoles"
import { BlackHoles__factory } from "../../../backend/types"
import { gql, request } from "graphql-request"

const chains = {
  "1": "eth",
  "5": "goerli",
  "80001": "mumbai",
}

const { REACT_APP_MORALIS_API_KEY } = process.env

export type BlackHoleMetadata = Omit<BlackHoleStruct, "size"> & { image?: string }

export interface ITokenSearch {
  provider?: ethers.providers.Provider
  address: Address
  tokenAddress: Address
}

async function getTokensByOwnerLocal({ provider, address, tokenAddress }: ITokenSearch): Promise<BlackHoleMetadata[]> {
  const contractABI = ["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"]

  const contract = new ethers.Contract(tokenAddress, contractABI, provider)
  let filter = contract.filters.Transfer(null, address, null)
  let events = await contract.queryFilter(filter)

  const tokenIds = events
    .filter((event) => event.args![2] !== ethers.constants.AddressZero) // exclude burned tokens
    .map((event) => event.args![2].toString())

  // TODO: Query contract in batches of 500 instead
  const batchSize = 500
  const batches = Math.ceil(tokenIds.length / batchSize)
  const tokens: BlackHoleMetadata[] = []
  for (let i = 0; i < batches; i++) {
    const batch = tokenIds.slice(i * batchSize, (i + 1) * batchSize)
    const batchTokens: BlackHoleMetadata[] = await BlackHoles__factory.connect(
      tokenAddress,
      provider!,
    ).blackHolesForTokenIds(batch)
    tokens.push(...batchTokens)
  }

  filter = contract.filters.Transfer(address, ethers.constants.One, null)
  events = await contract.queryFilter(filter)

  const burnedIds = events.map((event) => event.args![2].toString())

  return tokens.filter((token) => !burnedIds.includes(token.tokenId.toString()))
}

async function getTokensByOwnerMainnet({ address, tokenAddress }: ITokenSearch): Promise<BlackHoleMetadata[]> {
  const tokens: BlackHoleMetadata[] = []

  const query = gql`
    query ListCollections($address: [String!], $tokenAddress: [String!], $cursor: String) {
      tokens(
        where: { ownerAddresses: $address, collectionAddresses: $tokenAddress }
        pagination: { limit: 500, after: $cursor }
      ) {
        nodes {
          token {
            tokenId
            image {
              url
            }
            metadata
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  `

  let cursor = null

  while (true) {
    const variables: any = {
      address: [address],
      tokenAddress: [tokenAddress],
      cursor: cursor,
    }

    const res = await request("https://api.zora.co/graphql", query, variables)

    const nodes = res.tokens.nodes
    const pageInfo = res.tokens.pageInfo
    // const {
    //   tokens: { nodes, pageInfo },
    // } = res

    const newTokens: BlackHoleMetadata[] = nodes.map((node: any) => {
      const { attributes } = node.token.metadata
      return {
        tokenId: ethers.BigNumber.from(node.token.tokenId),
        level: ethers.BigNumber.from(attributes.find((attr: any) => attr.trait_type === "Level").value),
        name: attributes.find((attr: any) => attr.trait_type === "Name").value,
        mass: ethers.BigNumber.from(attributes.find((attr: any) => attr.trait_type === "Mass").value),
        image: node.token.image?.url,
      }
    })

    tokens.push(...newTokens)

    if (!pageInfo.hasNextPage) {
      break
    }

    cursor = pageInfo.endCursor
  }

  return tokens
}

async function getTokensByOwnerTestnet({ address, tokenAddress }: ITokenSearch) {
  // https://deep-index.moralis.io/api/v2/0xd8da6bf26964af9d7eed9e03e53415d37aa96045/nft?chain=eth&format=decimal&token_addresses%5B0%5D=0x123
  const chain: string = (chains as any)[deployments.chainId]

  const tokens: BlackHoleMetadata[] = []

  // Fetch with cursor
  const baseUrl = `https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chain}&format=decimal&token_addresses%5B0%5D=${tokenAddress}`
  let url = baseUrl
  while (true) {
    const response = await fetch(url, {
      headers: {
        "x-api-key": REACT_APP_MORALIS_API_KEY!,
      },
    })
    const json = await response.json()
    const newTokens: BlackHoleMetadata[] = json.result.map((token: any) => {
      const { attributes, image } = JSON.parse(token.metadata)
      return {
        tokenId: BigNumber.from(token.token_id),
        level: BigNumber.from(attributes.find((attr: any) => attr.trait_type === "Level").value),
        name: attributes.find((attr: any) => attr.trait_type === "Name").value,
        mass: BigNumber.from(attributes.find((attr: any) => attr.trait_type === "Mass").value),
        image: image,
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

  if ((deployments.chainId as string) === "31337") {
    return getTokensByOwnerLocal({ provider, address, tokenAddress })
  } else if ((deployments.chainId as string) === "1") {
    // return getTokensByOwnerMainnet({ address, tokenAddress })
    return getTokensByOwnerTestnet({ address, tokenAddress })
  }
  return getTokensByOwnerTestnet({ address, tokenAddress })
}
