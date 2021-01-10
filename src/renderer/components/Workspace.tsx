import { Credentials, VaultSource, VaultSourceStatus } from 'buttercup/web';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { DatasourceType, useManager } from '../services/VaultManager';
import Vault from './Vault';

const TemporarySidebar = styled.div`
  width: 100px;
  padding-top: 100px;
`;

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
`;

const Workspace = () => {
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>();
  const { sources, addSource } = useManager();

  const handleTestAddButtonClick = () => {
    addSource({
      type: DatasourceType.LocalStorage,
      name: 'Sallar',
      initialise: true,
      masterPassword: 'sallar'
    });
  };

  const handleSelectSource = useCallback(
    (index: number) => {
      if (sources[index].status === VaultSourceStatus.Locked) {
        sources[index].unlock(Credentials.fromPassword('sallar')).then(() => {
          console.log('unlocked!', index, sources[index]);
          setSelectedSourceIndex(index);
        });
      } else if (sources[index].status === VaultSourceStatus.Unlocked) {
        setSelectedSourceIndex(index);
      }
    },
    [sources]
  );

  return (
    <Wrapper>
      <TemporarySidebar>
        {sources.map((source, index) => (
          <button onClick={() => handleSelectSource(index)} key={index}>
            Unlock {source.name}
          </button>
        ))}
        <hr />
        <button onClick={handleTestAddButtonClick} style={{ marginTop: 100 }}>
          Add Test Source
        </button>
      </TemporarySidebar>
      {selectedSourceIndex !== undefined && (
        <Vault source={sources[selectedSourceIndex]} />
      )}
    </Wrapper>
  );
};

export default Workspace;
