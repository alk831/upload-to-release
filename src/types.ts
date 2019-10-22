
export interface ActionPayload {
  action: string
  release: {
    id: number
    name: string
    tag_name: string
    prerelease: boolean
    draft: boolean
    assets: unknown[]
    created_at: string
    published_at: string
    /** Branch name? */
    target_commitish: string
    url: string
    assets_url: string
  }
}

export interface RepositoryInfo {
  owner: string
  repo: string
}

export type UploadReleaseAssetParams = {
  uploadUrl: string
  assetName: string
  assetPath: string
  contentType: string
}

export type GithubApiParams = {
  repoName: string
  repoOwner: string
  repoToken: string
  logger?: (message: string) => void
}