import { GitHub } from '@actions/github';
import Octokit from '@octokit/rest';
import * as fs from 'fs';
import { UploadReleaseAssetParams, GithubApiParams } from './types';

export class GithubApi {
  private octokit: GitHub;
  private repoOwner: string;
  private repoName: string;
  private logger?: (message: string) => void;

  constructor(params: GithubApiParams) {
    this.repoOwner = params.repoOwner;
    this.repoName = params.repoName;
    this.logger = params.logger;
    this.octokit = new GitHub(params.repoToken);
  }

  getRelease(releaseId: number) {
    return this.octokit.repos.getRelease({
      owner: this.repoOwner,
      repo: this.repoName,
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
        repo: this.repoName,
        owner: this.repoOwner,
        asset_id: asset.id,
      }
      await this.octokit.repos.deleteReleaseAsset(assetToDelete);
    }
  }

  async uploadReleaseAsset(params: UploadReleaseAssetParams) {
    const headers = {
      'content-type': params.contentType,
      'content-length': fs.statSync(params.assetPath).size,
    }
    const file = fs.createReadStream(params.assetPath);

    const uploadResponse = await this.octokit.repos.uploadReleaseAsset({
      url: params.uploadUrl,
      name: params.assetName,
      headers, 
      file,
    });

    return uploadResponse;
  }
}

