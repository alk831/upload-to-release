import * as core from '@actions/core';
import { GithubApi } from './api';
import { getCurrentActionPayload, getRepositoryInfo } from './utils';
import Octokit from '@octokit/rest';

async function run() {
  const assetName = core.getInput('name', { required: true });
  const assetPath = core.getInput('path', { required: true });
  const repoToken = core.getInput('repo-token', { required: true });
  const contentType = core.getInput('content-type', { required: true });
  const allowSkip = core.getInput('allow-skip', { required: true });

  const payload = process.env.GITHUB_EVENT_PATH
    ? require(process.env.GITHUB_EVENT_PATH)
    : {}; 

  console.log({ payload });

  const ciPayload = getCurrentActionPayload();
  const { owner, repo } = getRepositoryInfo();
  const isSkipAllowed = allowSkip === 'true';

  if (ciPayload.release == null) {
    if (isSkipAllowed) {
      console.log(
        "No release data could be found. " +
        "Action has been skipped since \"allow-skip\" option is set to true."
      );
      return;
    }
    throw new Error(
      "No release data could be found. " +
      "This action is meant to be run on release pipelines. " +
      "You can allow to skip this action when no release has been found, " +
      "by setting \"allow-skip\" to true."
    );
  }

  const releaseId = Number(ciPayload.release.id);
  const assetFileName = `${assetName}-${ciPayload.release.tag_name}`;

  if (Number.isNaN(releaseId)) {
    throw new Error(
      `Invalid release id. Couldn't parse "${ciPayload.release.id}" to a number.`
    );
  }

  const repository = new GithubApi({
    repoName: repo,
    repoOwner: owner,
    logger: console.log,
    repoToken,
  });

  const releaseResponse = await repository.getRelease(releaseId);

  await repository.removeAssetsWithName(
    assetName,
    releaseResponse.data.assets,
  );

  const uploadResponse = await repository.uploadReleaseAsset({
    assetName: assetFileName,
    assetPath,
    contentType,
    uploadUrl: releaseResponse.data.upload_url,
  });

  // invalid type
  // create PR in octokit repo
  const uploadData: Octokit.ReposUploadReleaseAssetResponseValue = uploadResponse.data as any;
  const downloadUrl = uploadData.browser_download_url;
  core.debug(`Download URL: ${downloadUrl}`);
}

async function main() {
  try {
    await run();
  } catch(error) {
    core.setFailed(error.message);
  }
}

main();