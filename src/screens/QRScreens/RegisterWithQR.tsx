import React, { useContext } from 'react';

import { Box } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getWalletConfig } from 'src/hardware';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import Buttons from 'src/components/Buttons';
import DisplayQR from './DisplayQR';

function RegisterWithQR({ route, navigation }: any) {
  const { signer }: { signer: VaultSigner } = route.params;
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);
  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const walletConfig = getWalletConfig({ vault });
  const qrContents = Buffer.from(walletConfig, 'ascii').toString('hex');
  const markAsregistered = () => {
    dispatch(updateSignerDetails(signer, 'registered', true));
    navigation.navigate('VaultDetails');
  };
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Register Signing Device"
        subtitle="Register the vault with any of the QR based signing devices"
      />
      <Box style={styles.center}>
        <DisplayQR qrContents={qrContents} toBytes type="hex" />
      </Box>
      <Buttons primaryText="Done" primaryCallback={markAsregistered} />
    </ScreenWrapper>
  );
}

export default RegisterWithQR;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    marginTop: '20%',
  },
});
