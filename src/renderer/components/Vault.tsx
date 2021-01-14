import { VaultProvider, VaultUI } from '@buttercup/ui';
import '@buttercup/ui/dist/styles.css';
import {
  consumeVaultFacade,
  createVaultFacade,
  Vault,
  VaultFacade,
  VaultSource
} from 'buttercup/web';
import React, { useCallback, useRef } from 'react';

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
  const facadeRef = useRef(createArchiveFacade(source.vault));

  const handleSaveSource = useCallback(async (facade: VaultFacade) => {
    facadeRef.current = processVaultUpdate(source.vault, facade);
    await source.save();
    console.log("Source saved");
  }, []);

  return (
    <VaultProvider
      icons
      iconsPath="../resources/icons"
      vault={facadeRef.current}
      onUpdate={handleSaveSource}
    >
      <VaultUI />
    </VaultProvider>
  );
};

export default AppVault;
