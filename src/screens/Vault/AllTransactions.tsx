import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import HeaderTitle from 'src/components/HeaderTitle';
import { RealmSchema } from 'src/storage/realm/enum';
import StatusBarComponent from 'src/components/StatusBarComponent';
import TransactionElement from 'src/components/TransactionElement';
import VaultIcon from 'src/assets/images/icon_vault_brown.svg';
import LinkedWallet from 'src/assets/images/walletUtxos.svg';
import CollaborativeIcon from 'src/assets/images/icon_collaborative.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import useVault from 'src/hooks/useVault';
import { useQuery } from '@realm/react';
import { EntityKind } from 'src/core/wallets/enums';
import { Transaction } from 'src/core/wallets/interfaces';

function AllTransactions({ route }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const title = route?.params?.title;
  const entityKind = route?.params?.entityKind;
  const subtitle = route?.params?.subtitle;
  const collaborativeWalletId = route?.params?.collaborativeWalletId;
  const { activeVault: vault } = useVault(collaborativeWalletId);

  const wallet: Wallet = useQuery(RealmSchema.Wallet)
    .map(getJSONFromRealmObject)
    .filter((wallet) => !wallet.archived)[0];

  const [pullRefresh, setPullRefresh] = useState(false);

  const vaultTrans: Transaction[] = vault?.specs?.transactions || [];
  const walletTrans: Transaction[] = wallet?.specs.transactions || [];
  const renderTransactionElement = ({ item }) => <TransactionElement transaction={item} />;

  const pullDownRefresh = () => {
    setPullRefresh(true);
    refreshVault();
    setPullRefresh(false);
  };

  const refreshVault = () => {
    dispatch(refreshWallets([vault], { hardRefresh: true }));
  };

  return (
    <Box style={[styles.Container, { backgroundColor: `${colorMode}.secondaryBackground` }]}>
      <StatusBarComponent padding={50} />
      <Box marginX={3}>
        <Box width={wp(200)}>
          <HeaderTitle onPressHandler={() => navigation.goBack()} />
        </Box>
        <Box flexDirection="row" alignItems="center">
          {entityKind === EntityKind.WALLET ? (
            <LinkedWallet />
          ) : collaborativeWalletId ? (
            <CollaborativeIcon />
          ) : (
            <VaultIcon />
          )}
          <Box marginX={5}>
            <Text fontSize={16} letterSpacing={0.8} color="light.headerText">
              {title}
            </Text>
            <Text fontSize={12} letterSpacing={0.6} color={`${colorMode}.greenText`}>
              {subtitle}
            </Text>
          </Box>
        </Box>
        <Box marginTop={hp(10)} paddingBottom={hp(300)}>
          <FlatList
            data={entityKind === EntityKind.WALLET ? walletTrans : vaultTrans}
            refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
            renderItem={renderTransactionElement}
            keyExtractor={(item: Transaction) => item.txid}
            showsVerticalScrollIndicator={false}
          />
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
  },
});
export default AllTransactions;