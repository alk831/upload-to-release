import { GitHub } from '@actions/github';
import Octokit from '@octokit/rest';
import * as fs from 'fs';

export class GithubApi {
  private octokit: GitHub;

  constructor(
    private owner: string,
    private repo: string,
    repoToken: string,
    private logger?: (message: string) => void,
  ) {
    this.octokit = new GitHub(repoToken);
  }

  getRelease(releaseId: number) {
    return this.octokit.repos.getRelease({
      owner: this.owner,
      repo: this.repo,
      release_id: releaseId
    });
  }

  async removeAssetsWithName(
    name: string,
    assets: Octokit.ReposGetReleaseResponseAssetsItem[],
  ): Promise<void> {
    const matchingAssets = assets.filter(asset => asset.name === name);

    for (const asset of matchingAssets) {
      this.logger?.(`Removing asset "${asset.name}" due to name conflict.`);
      
      const assetToDelete = {
        repo: this.repo,
        owner: this.owner,
        asset_id: asset.id,
      }
      await this.octokit.repos.deleteReleaseAsset(assetToDelete);
    }
  }

  async uploadReleaseAsset({
    uploadUrl,
    assetName,
    assetPath,
    contentType,
  }: UploadReleaseAssetParam) {
    const headers = {
      'content-type': contentType,
      'content-length': fs.statSync(assetPath).size,
    }
    const file = fs.createReadStream(assetPath);

    const uploadResponse = await this.octokit.repos.uploadReleaseAsset({
      url: uploadUrl,
      name: assetName,
      headers, 
      file,
    });

    return uploadResponse;
  }
}

type UploadReleaseAssetParam = {
  uploadUrl: string
  assetName: string
  assetPath: string
  contentType: string
}