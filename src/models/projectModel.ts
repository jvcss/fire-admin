interface IAppConfiguration {
  [version: string]: {
    [platform: string]: {
      [nickname: string]: string;
    };
  };
}

interface IAppInfo {
  nickname: string;
  packageName: string;
  appId: string;
}
