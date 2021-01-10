import { VaultProvider, VaultUI } from '@buttercup/ui';
import '@buttercup/ui/dist/styles.css';
import {
  consumeVaultFacade,
  createVaultFacade,
  Vault,
  VaultFacade,
  VaultSource
} from 'buttercup/web';
import React, { useCallback } from 'react';

function createArchiveFacade(vault: Vault) {
  return JSON.parse(JSON.stringify(createVaultFacade(vault)));
}

function processVaultUpdate(vault: Vault, facade: VaultFacade) {
  consumeVaultFacade(vault, facade);
  const out = createVaultFacade(vault);
  return out;
}

interface VaultProps {
  source: VaultSource;
}

const AppVault: React.FunctionComponent<VaultProps> = ({ source }) => {
  const facade = createArchiveFacade(source.vault);

  const handleSaveSource = useCallback((facade: VaultFacade) => {
    // @TODO: PERRY- how to save this back to archive?
    console.log('Saving vault...', processVaultUpdate(source.vault, facade));
    // source.something?
  }, []);

  return (
    <VaultProvider
      icons
      iconsPath="../resources/icons"
      vault={facade}
      onUpdate={handleSaveSource}
    >
      <VaultUI />
    </VaultProvider>
  );
};

export default AppVault;
