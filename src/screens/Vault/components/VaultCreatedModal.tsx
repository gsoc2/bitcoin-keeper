import React, { useCallback } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import Success from 'src/assets/images/Success.svg';
import Text from 'src/components/KeeperText';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { useColorMode, Box } from 'native-base';

function VaultCreatedModal({
  vault,
  vaultCreated,
  close,
}: {
  vault: Vault;
  vaultCreated: boolean;
  close: () => void;
}) {
  const { colorMode } = useColorMode();
  const subtitle = vault.scheme.n > 1 ? `Vault with a ${vault.scheme.m} of ${vault.scheme.n} setup will be created` : `Vault with ${vault.scheme.m} of ${vault.scheme.n} setup will be created`;
  const NewVaultContent = useCallback(
    () => (
      <Box>
        <Success />
        <Text fontSize={13} letterSpacing={0.65} color="light.greenText" marginTop={3}>
          For sending out of the vault you will need the signing devices. This means no one can
          steal your bitcoin in the vault unless they also have the signing devices
        </Text>
      </Box>
    ),
    []
  );

  return (
    <KeeperModal
      visible={vaultCreated}
      title="New Vault Created"
      subTitle={subtitle}
      buttonText="View Vault"
      textColor={`${colorMode}.primaryText`}
      subTitleColor={`${colorMode}.secondaryText`}
      buttonCallback={close}
      close={close}
      Content={NewVaultContent}
    />
  );
}

export default VaultCreatedModal;
