/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import Text from 'src/components/KeeperText';
import { TouchableOpacity, View } from 'react-native';
import { Box, ScrollView } from 'native-base';
import React, { useContext } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { ScaledSheet } from 'react-native-size-matters';
// components, interfaces
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { LocalizationContext } from 'src/common/content/LocContext';
import openLink from 'src/utils/OpenLink';
// asserts
import IconRecieve from 'src/assets/images/icon_received_lg.svg';
import IconSend from 'src/assets/images/icon_send_lg.svg';
import Link from 'src/assets/images/link.svg';
import Edit from 'src/assets/images/edit.svg';
import useBalance from 'src/hooks/useBalance';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import config from 'src/core/config';
import { NetworkType } from 'src/core/wallets/enums';
import { Transaction } from 'src/core/wallets/interfaces';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import useLabelsNew from 'src/hooks/useLabelsNew';
import useTransactionLabels from 'src/hooks/useTransactionLabels';
import LabelItem from '../UTXOManagement/components/LabelItem';

function TransactionDetails({ route }) {
  const navigation = useNavigation();
  const { getSatUnit, getBalance } = useBalance();
  const { translations } = useContext(LocalizationContext);
  const { transactions } = translations;
  const { transaction, wallet }: { transaction: Transaction; wallet: Wallet } = route.params;
  const { labels } = useLabelsNew({ txid: transaction.txid, wallet });
  const { labels: txnLabels } = useTransactionLabels({ txid: transaction.txid, wallet });

  function InfoCard({
    title,
    describtion = '',
    width = 320,
    showIcon = false,
    letterSpacing = 1,
    numberOfLines = 1,
    Icon = null,
    Content = null,
  }) {
    return (
      <Box
        backgroundColor="light.mainBackground"
        width={wp(width)}
        style={styles.infoCardContainer}
      >
        <Box style={[showIcon && { flexDirection: 'row', width: '100%', alignItems: 'center' }]}>
          <Box width={showIcon ? '90%' : '100%'}>
            <Text color="light.headerText" style={styles.titleText}>
              {title}
            </Text>
            {Content ? (
              <Content />
            ) : (
              <Text
                style={styles.descText}
                letterSpacing={letterSpacing}
                color="light.GreyText"
                width={showIcon ? '60%' : '90%'}
                numberOfLines={numberOfLines}
              >
                {describtion}
              </Text>
            )}
          </Box>
          {showIcon && Icon}
        </Box>
      </Box>
    );
  }
  const redirectToBlockExplorer = () => {
    openLink(
      `https://mempool.space${config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''}/tx/${
        transaction.txid
      }`
    );
  };
  return (
    <Box style={styles.Container}>
      <StatusBarComponent padding={50} />
      <Box width={wp(250)}>
        <HeaderTitle
          onPressHandler={() => navigation.goBack()}
          title={transactions.TransactionDetails}
          subtitle="Detailed information for this Transaction"
          paddingTop={hp(20)}
          paddingLeft={25}
        />
        <Box style={styles.transViewWrapper}>
          <Box flexDirection="row">
            {transaction.transactionType === 'Received' ? <IconRecieve /> : <IconSend />}
            <Box style={styles.transView}>
              <Text color="light.headerText" numberOfLines={1} style={styles.transIDText}>
                {transaction.txid}
              </Text>
              <Text style={styles.transDateText} color="light.dateText">
                {moment(transaction?.date).format('DD MMM YY  •  hh:mma')}
              </Text>
            </Box>
          </Box>
          <Box>
            <Text style={styles.amountText}>
              {`${getBalance(transaction.amount)} `}
              <Text color="light.dateText" style={styles.unitText}>
                {getSatUnit()}
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.infoCardsWrapper}>
          <InfoCard
            title="Tags"
            Content={() => (
              <View style={styles.listSubContainer}>
                {txnLabels.map((item, index) => (
                  <LabelItem
                    item={item}
                    index={index}
                    key={`${item.name}:${item.isSystem}`}
                    editable={false}
                  />
                ))}
              </View>
            )}
            showIcon={false}
            letterSpacing={2.4}
          />
          <InfoCard
            title="Confirmations"
            describtion={transaction.confirmations > 3 ? '3+' : transaction.confirmations}
            showIcon={false}
            letterSpacing={2.4}
          />
          <TouchableOpacity onPress={redirectToBlockExplorer}>
            <InfoCard
              title="Transaction ID"
              describtion={transaction.txid}
              showIcon
              letterSpacing={2.4}
              Icon={<Link />}
            />
          </TouchableOpacity>
          <InfoCard
            title="Fees"
            describtion={`${transaction.fee} sats`}
            showIcon={false}
            letterSpacing={2.4}
          />
          <InfoCard
            title="Inputs"
            describtion={transaction.senderAddresses.toString().replace(/,/g, '\n')}
            showIcon={false}
            numberOfLines={transaction.senderAddresses.length}
          />
          <InfoCard
            title="Outputs"
            describtion={transaction.recipientAddresses.toString().replace(/,/g, '\n')}
            showIcon={false}
            numberOfLines={transaction.recipientAddresses.length}
          />
          {labels[transaction.txid].length && (
            <InfoCard
              title="Note"
              describtion={labels[transaction.txid][0].name}
              showIcon
              letterSpacing={2.4}
              Icon={<Edit />}
            />
          )}
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    backgroundColor: 'light.secondaryBackground',
  },
  transViewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(40),
    width: wp(320),
    justifyContent: 'space-between',
    paddingBottom: hp(25),
  },
  transView: {
    marginLeft: wp(10),
    width: wp(120),
  },
  infoCardContainer: {
    marginVertical: hp(7),
    justifyContent: 'center',
    paddingLeft: wp(15),
    borderRadius: 10,
    paddingHorizontal: 3,
    paddingVertical: 10,
  },
  infoCardsWrapper: {
    alignItems: 'center',
    marginTop: hp(20),
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  titleText: {
    fontSize: 14,
    letterSpacing: 1.12,
    width: '90%',
    numberOfLines: 1,
  },
  descText: {
    fontSize: 12,
  },
  transDateText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  transIDText: {
    fontSize: 14,
  },
  amountText: {
    fontSize: 19,
    letterSpacing: 0.95,
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
  listSubContainer: {
    flexWrap: 'wrap',
    marginBottom: 20,
    flexDirection: 'row',
  },
});
export default TransactionDetails;
