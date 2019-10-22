"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("@actions/github");
const fs = __importStar(require("fs"));
class GithubApi {
    constructor(params) {
        this.repoOwner = params.repoOwner;
        this.repoName = params.repoName;
        this.logger = params.logger;
        this.octokit = new github_1.GitHub(params.repoToken);
    }
    getRelease(releaseId) {
        return this.octokit.repos.getRelease({
            owner: this.repoOwner,
            repo: this.repoName,
            release_id: releaseId
        });
    }
    async removeAssetsWithName(name, assets) {
        var _a, _b;
        const matchingAssets = assets.filter(asset => asset.name === name);
        for (const asset of matchingAssets) {
            (_b = (_a = this).logger) === null || _b === void 0 ? void 0 : _b.call(_a, `Removing asset "${asset.name}" due to name conflict.`);
            const assetToDelete = {
                repo: this.repoName,
                owner: this.repoOwner,
                asset_id: asset.id,
            };
            await this.octokit.repos.deleteReleaseAsset(assetToDelete);
        }
    }
    async uploadReleaseAsset(params) {
        const headers = {
            'content-type': params.contentType,
            'content-length': fs.statSync(params.assetPath).size,
        };
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
exports.GithubApi = GithubApi;
