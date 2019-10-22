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
const api_1 = require("./api");
const utils_1 = require("./utils");
async function run() {
    const assetName = core.getInput('name', { required: true });
    const assetPath = core.getInput('path', { required: true });
    const repoToken = core.getInput('repo-token', { required: true });
    const contentType = core.getInput('content-type', { required: true });
    const allowSkip = Boolean(core.getInput('allow-skip', { required: true }));
    const payload = process.env.GITHUB_EVENT_PATH
        ? require(process.env.GITHUB_EVENT_PATH)
        : {};
    console.log({ payload });
    const ciPayload = utils_1.getCurrentActionPayload();
    const { owner, repo } = utils_1.getRepositoryInfo();
    if (ciPayload.release == null) {
        if (allowSkip) {
            return core.debug("No release data could be found. " +
                "Action has been skipped since \"allow-skip\" option is set to true.");
        }
        throw new Error("No release data could be found. " +
            "This action is meant to be run on release pipelines. " +
            "You can allow to skip this action when no release has been found, " +
            "by setting \"allow-skip\" to true.");
    }
    const releaseId = Number(ciPayload.release.id);
    if (Number.isNaN(releaseId)) {
        throw new Error(`Invalid release id. Couldn't parse "${ciPayload.release.id}" to a number.`);
    }
    const repository = new api_1.GithubApi({
        repoName: repo,
        repoOwner: owner,
        logger: core.debug,
        repoToken,
    });
    const releaseResponse = await repository.getRelease(releaseId);
    await repository.removeAssetsWithName(assetName, releaseResponse.data.assets);
    const uploadResponse = await repository.uploadReleaseAsset({
        assetName,
        assetPath,
        contentType,
        uploadUrl: releaseResponse.data.upload_url,
    });
    // invalid type
    // create PR in octokit repo
    const uploadData = uploadResponse.data;
    const downloadUrl = uploadData.browser_download_url;
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
