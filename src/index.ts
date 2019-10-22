import * as core from '@actions/core';
import { GithubApi } from './api';
import { getCurrentActionPayload, getRepositoryInfo } from './utils';

async function run() {
  const assetName = core.getInput('name', { required: true });
  const assetPath = core.getInput('path', { required: true });
  const repoToken = core.getInput('repo-token', { required: true });
  const contentType = core.getInput('content-type', { required: true });

  const payload: ActionPayload = process.env.GITHUB_EVENT_PATH
    ? require(process.env.GITHUB_EVENT_PATH)
    : {}; 

  console.log({ payload });

  const ciPayload = getCurrentActionPayload();
  const { owner, repo } = getRepositoryInfo();
  const releaseId = Number(ciPayload.release.id);

  if (Number.isNaN(releaseId)) {
    throw new Error(
      `Invalid release id. Couldn't parse "${ciPayload.release.id}" to a number.`
    );
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