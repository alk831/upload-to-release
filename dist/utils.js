"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentActionPayload = () => {
    var _a;
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if ((_a = eventPath) === null || _a === void 0 ? void 0 : _a.length) {
        const payload = require(eventPath);
        if (typeof payload === 'object' &&
            payload.release != null) {
            return payload;
        }
    }
    throw new Error(`No release data has been found "${eventPath}".`);
};
exports.getRepositoryInfo = () => {
    var _a;
    const repositoryPath = process.env.GITHUB_REPOSITORY;
    if ((_a = repositoryPath) === null || _a === void 0 ? void 0 : _a.length) {
        const [owner, repo] = repositoryPath.split('/');
        if (owner && repo) {
            return { owner, repo };
        }
    }
    throw new Error(`No repository info has been found "${repositoryPath}".`);
};
