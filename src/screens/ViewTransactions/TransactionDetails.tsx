import Text from 'src/components/KeeperText';
import { TouchableOpacity } from 'react-native';
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
import { getAmount, getUnit } from 'src/common/constants/Bitcoin';
import { useNavigation } from '@react-navigation/native';

function TransactionDetails({ route }) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { transactions } = translations;
  const { transaction } = route.params;

  function InfoCard({ title, describtion, width = 320, icon }) {
    return (
      <Box
        backgroundColor="light.primaryBackground"
        style={{
          height: hp(65),
          width: wp(width),
          marginVertical: hp(7),
          justifyContent: 'center',
          paddingLeft: wp(15),
          borderRadius: 10,
          padding: 3,
        }}
      >
        <Box style={[icon && { flexDirection: 'row', width: '100%', alignItems: 'center' }]}>
          <Box width={icon ? '90%' : '100%'}>
            <Text
              fontSize={14}
              letterSpacing={1.12}
              color="light.headerText"
              width="90%"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              fontSize={12}
              letterSpacing={2.4}
              color="light.GreyText"
              width={icon ? '60%' : '90%'}
              numberOfLines={1}
            >
              {describtion}
            </Text>
          </Box>
          {icon && <Link />}
        </Box>
      </Box>
    );
  }
  return (
    <Box style={styles.Container}>
      <StatusBarComponent padding={50} />
      <Box width={wp(250)}>
        <HeaderTitle
          onPressHandler={() => navigation.goBack()}
          title={transactions.TransactionDetails}
          subtitle=""
          paddingTop={hp(20)}
        />
        <Box
          flexDirection="row"
          alignItems="center"
          marginTop={hp(40)}
          width={wp(320)}
          justifyContent="space-between"
        >
          <Box flexDirection="row">
            {transaction.transactionType === 'Received' ? <IconRecieve /> : <IconSend />}
            <Box
              style={{
                marginLeft: wp(10),
                width: wp(100),
              }}
            >
              <Text
                fontSize={14}
                letterSpacing={0.7}
                color="light.headerText"
                numberOfLines={1}
                width={wp(120)}
              >
                {transaction.address}
              </Text>
              <Text fontSize={10} letterSpacing={0.5} color="light.dateText">
                {transaction.date}
              </Text>
            </Box>
          </Box>
          <Box>
            <Text fontSize={19} letterSpacing={0.95}>
              {`${getAmount(transaction.amount)} `}
              <Text color="light.dateText" letterSpacing={0.6} fontSize={hp(12)}>
                {getUnit()}
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box alignItems="center" marginTop={hp(44)} justifyContent="center" marginX={3}>
          <InfoCard title="To Address" describtion={transaction.recipientAddresses} icon={false} />
          <InfoCard title="From Address" describtion={transaction.senderAddresses} icon={false} />
          <TouchableOpacity onPress={() => openLink('https://explorer.btc.com/')}>
            <InfoCard title="Transaction ID" describtion={transaction.txid} icon={true} />
          </TouchableOpacity>
          {transaction.notes && (
            <InfoCard title="Note" describtion={transaction.notes} icon={false} />
          )}
          <InfoCard title="Fee" describtion={transaction.fee + ' btc'} icon={false} />
          <InfoCard
            title="Confirmations"
            describtion={transaction.confirmations > 6 ? '6+' : transaction.confirmations}
            icon={false}
          />
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
});
export default TransactionDetails;
