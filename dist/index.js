"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const fs = __importStar(require("fs"));
async function run() {
    const payload = process.env.GITHUB_EVENT_PATH
        ? require(process.env.GITHUB_EVENT_PATH)
        : {};
    console.log({ payload });
    core.debug(process.env.GITHUB_EVENT_PATH);
    core.debug('process.env.GITHUB_EVENT_PATH');
    console.log(process.env.GITHUB_EVENT_PATH, process.env.GITHUB_REPOSITORY);
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
    const octokit = new github_1.GitHub(repoToken);
    octokit.repos.getRelease(releaseData);
    const releaseResponse = await octokit.repos.getRelease(releaseData);
    releaseResponse.data.id;
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
    };
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
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
main();
