import { ethers } from "ethers"
import { BlackHoleStruct } from "../../../backend/types/BlackHoles"

export type BlackHoleMetadata = Omit<BlackHoleStruct, "size"> & { image?: string }

export async function getTokensByOwnerLocal({
  provider,
  address,
  tokenAddress,
}: {
  provider: ethers.providers.Provider
  address: string
  tokenAddress: string
}) {
  const contractABI = [
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "function blackHolesForTokenIds(uint256[] calldata tokenIds) view returns (BlackHoleStruct[] memory)",
  ]

  const contract = new ethers.Contract(tokenAddress, contractABI, provider)
  let filter = contract.filters.Transfer(null, address, null)
  let events = await contract.queryFilter(filter)

  const tokenIds = events
    .filter((event) => event.args![2] !== ethers.constants.AddressZero) // exclude burned tokens
    .map((event) => event.args![2].toString())

  filter = contract.filters.Transfer(address, ethers.constants.AddressZero, null)
  events = await contract.queryFilter(filter)

  const burnedIds = events.map((event) => event.args![2].toString())

  return tokenIds.filter((tokenId) => !burnedIds.includes(tokenId.toString()))
}
