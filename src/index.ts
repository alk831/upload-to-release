import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import * as fs from 'fs';

async function run() {
  const payload: ActionPayload = process.env.GITHUB_EVENT_PATH
    ? require(process.env.GITHUB_EVENT_PATH)
    : {};

  core.debug(process.env.GITHUB_EVENT_PATH);
  return core.setFailed(process.env.GITHUB_EVENT_PATH);
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

  const octokit = new GitHub(repoToken);
  octokit.repos.getRelease(releaseData);

  const releaseResponse = await octokit.repos.getRelease(releaseData);

  for (const asset of releaseResponse.data.assets) {
    if (asset.name === name) {
      core.debug(`Removing asset "${asset.name}" due to name conflict.`);
      
      const assetToDelete = { owner, repo, asset_id: asset.id };
      await octokit.repos.deleteReleaseAsset(assetToDelete);
    }
  }

  const headers = {
    'content-type': contentType,
    'content-length': fs.statSync(assetPath).size,
  }
  const file = fs.createReadStream(assetPath);

  const uploadResponse = await octokit.repos.uploadReleaseAsset({
    url: releaseResponse.data.upload_url,
    name: assetName,
    headers, 
    file,
  });

  const downloadUrl = uploadResponse.data.value.browser_download_url;

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

interface ActionPayload {
  action?: string
  release?: {
    id: number
  }
}