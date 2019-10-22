import { ActionPayload, RepositoryInfo } from './types';

export const getCurrentActionPayload = (): ActionPayload => {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath?.length) {
    const payload: ActionPayload = require(eventPath);
    if (
      typeof payload === 'object' &&
      payload.release != null
    ) {
      return payload;
    }
  }
  throw new Error(
    `No release data has been found "${eventPath}".`
  );
}

export const getRepositoryInfo = (): RepositoryInfo => {
  const repositoryPath = process.env.GITHUB_REPOSITORY;
  if (repositoryPath?.length) {
    const [owner, repo] = repositoryPath.split('/');
    if (owner && repo) {
      return { owner, repo };
    }
  }
  throw new Error(
    `No repository info has been found "${repositoryPath}".`
  );
}