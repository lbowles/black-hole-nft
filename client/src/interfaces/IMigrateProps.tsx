import { BlackHoleMetadata } from "../utils/getTokensByOwner"

export interface IMigrateProps {
  tokens: (BlackHoleMetadata & { selected: boolean })[]
  tokenAddress: string
  migrateComplete: () => void
  usePrepareApprove: (config: any) => any
  useApprove: (config: any) => any
  useIsApprovedForAll: (config: any) => any
}
