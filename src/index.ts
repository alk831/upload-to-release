import * as core from '@actions/core';
import { GithubApi } from './api';

async function run() {
  const payload: ActionPayload = process.env.GITHUB_EVENT_PATH
    ? require(process.env.GITHUB_EVENT_PATH)
    : {}; 

  console.log({ payload });
  core.debug(process.env.GITHUB_EVENT_PATH);
  core.debug('process.env.GITHUB_EVENT_PATH');

  console.log(process.env.GITHUB_EVENT_PATH, process.env.GITHUB_REPOSITORY)

  const { release, action: actionName } = payload;

  if (!release) {
    return core.setFailed(`No release has been found. Skipping action (${actionName}).`);
  }

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  const releaseData = { owner, repo, release_id: release.id };

  const assetName = core.getInput('name', { required: true });
  const assetPath = core.getInput('path', { required: true });
  const repoToken = core.getInput('repo-token', { required: true });
  const contentType = core.getInput('content-type', { required: true });

  const releaseId = Number(release.id);

  if (Number.isNaN(releaseId)) {
    return core.setFailed(``);
  }

  const githubApi = new GithubApi(
    repo,
    owner,
    repoToken,
    core.debug,
  );

  const releaseResponse = await githubApi.getRelease(releaseId);

  await githubApi.removeAssetsWithName(
    assetName,
    releaseResponse.data.assets,
  );

  const uploadResponse = await githubApi.uploadReleaseAsset({
    assetName,
    assetPath,
    contentType,
    uploadUrl: releaseResponse.data.upload_url,
  });

  // invalid type
  // create PR in octokit repo
  const downloadUrl_ = uploadResponse.data.browser_download_url;
  core.debug(`Download URL: ${downloadUrl_}`);
}

async function main() {
  try {
    await run();
  } catch(error) {
    core.setFailed(error.message);
  }
}

main();

interface ActionPayload {
  action?: string
  release?: {
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