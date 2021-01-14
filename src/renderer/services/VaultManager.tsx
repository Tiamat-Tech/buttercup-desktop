import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  VaultManager as ButtercupVaultManager,
  LocalStorageInterface,
  VaultSource,
  Credentials
} from 'buttercup/web';

interface AddVaultPayload {
  initialise?: boolean;
  masterPassword: string;
  name: string;
  path?: string;
  type: DatasourceType;
}

export enum DatasourceType {
  Dropbox = 'dropbox',
  File = 'file',
  GoogleDrive = 'googledrive',
  MyButtercup = 'mybuttercup',
  Memory = 'memory',
  LocalStorage = 'localstorage',
  WebDAV = 'webdav'
}

interface VaultManagerContextType {
  sources: VaultSource[];
  addSource: (payload: AddVaultPayload) => Promise<VaultSource>;
}

const VaultManagerContext = createContext<VaultManagerContextType>(null);

const manager = new ButtercupVaultManager({
  cacheStorage: new LocalStorageInterface(),
  sourceStorage: new LocalStorageInterface()
});

const VaultManager: React.FunctionComponent = ({ children }) => {
  const [sources, setSources] = useState<VaultSource[]>([]);

  useEffect(() => {
    const handler = () => {
      setSources([...manager.sources]);
    };
    manager.rehydrate();
    manager.on('sourcesUpdated', handler);

    return () => manager.off('sourcesUpdated', handler);
  }, []);

  const addSource = useCallback(async (payload: AddVaultPayload): Promise<
    VaultSource
  > => {
    const { type, masterPassword, name, initialise } = payload;
    let source: VaultSource = null;
    if (type === DatasourceType.File) {
      const { path: vaultPath } = payload;
      const creds = Credentials.fromDatasource(
        {
          type,
          path: vaultPath
        },
        masterPassword
      );
      const credStr = await creds.toSecureString();
      source = new VaultSource(name, type, credStr);
      await manager.addSource(source);
      await source.unlock(creds, {
        initialiseRemote: initialise
      });
    } else if (type === DatasourceType.LocalStorage) {
      const creds = Credentials.fromDatasource(
        {
          type,
          property: 'test'
        },
        masterPassword
      );
      const credStr = await creds.toSecureString();
      source = new VaultSource(name, type, credStr);
      await manager.addSource(source);
      await source.unlock(creds, {
        initialiseRemote: initialise
      });
    } else if (type === DatasourceType.WebDAV) {
      const creds = Credentials.fromDatasource(
        {
          type,
          endpoint: "https://webdav.yandex.ru",
          path: "/test-desktop.bcup",
          username: "",
          password: ""
        },
        masterPassword
      );
      const credStr = await creds.toSecureString();
      source = new VaultSource(name, type, credStr);
      await manager.addSource(source);
      await source.unlock(creds, {
        initialiseRemote: initialise
      });
    } else {
      throw new Error(`Invalid datasource type: ${type}`);
    }
    return source;
  }, []);

  const removeAllSources = useCallback(async () => {
    for (const source of manager.sources) {
      await manager.removeSource(source.id);
    }
  }, []);

  const value = useMemo(
    () => ({
      sources,
      addSource,
      removeAllSources
    }),
    [sources]
  );

  return (
    <VaultManagerContext.Provider value={value}>
      {children}
    </VaultManagerContext.Provider>
  );
};

export default VaultManager;

export const useManager = () => {
  return React.useContext(VaultManagerContext);
};
