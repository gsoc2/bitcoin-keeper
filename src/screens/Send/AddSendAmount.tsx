import Text from 'src/components/KeeperText';
import {
  Box,
  HStack,
  Input,
  KeyboardAvoidingView,
  Pressable,
  useColorMode,
  VStack,
} from 'native-base';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { calculateSendMaxFee, sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import { hp, windowWidth, wp } from 'src/constants/responsive';

import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';
import BitcoinInput from 'src/assets/images/btc_input.svg';

import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { sendPhaseOneReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { TransferType } from 'src/models/enums/TransferType';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { BtcToSats, SATOSHIS_IN_BTC, SatsToBtc } from 'src/constants/Bitcoin';
import useBalance from 'src/hooks/useBalance';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Satoshis } from 'src/models/types/UnitAliases';
import BTCIcon from 'src/assets/images/btc_black.svg';
import { UTXO } from 'src/core/wallets/interfaces';
import config from 'src/core/config';
import { EntityKind, TxPriority } from 'src/core/wallets/enums';
import idx from 'idx';
import useLabelsNew from 'src/hooks/useLabelsNew';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import WalletSendInfo from './WalletSendInfo';
import LabelItem from '../UTXOManagement/components/LabelItem';

function AddSendAmount({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    sender,
    recipient,
    address,
    amount: prefillAmount,
    transferType,
    selectedUTXOs = [],
  }: {
    sender: Wallet | Vault;
    recipient: Wallet | Vault;
    address: string;
    amount: string;
    transferType: TransferType;
    selectedUTXOs: UTXO[];
  } = route.params;

  const [amount, setAmount] = useState(prefillAmount || '');
  const [amountToSend, setAmountToSend] = useState('');
  const [note, setNote] = useState('');
  const [label, setLabel] = useState('');
  const [labelsToAdd, setLabelsToAdd] = useState([]);

  const [errorMessage, setErrorMessage] = useState(''); // this state will handle error
  const recipientCount = 1;
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);
  const { averageTxFees } = useAppSelector((state) => state.network);

  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const minimumAvgFeeRequired = averageTxFees[config.NETWORK_TYPE][TxPriority.LOW].averageTxFee;
  const { getBalance, getCurrencyIcon } = useBalance();
  const { labels } = useLabelsNew({ wallet: sender, utxos: selectedUTXOs });

  function convertFiatToSats(fiatAmount: number) {
    return exchangeRates && exchangeRates[currencyCode]
      ? (fiatAmount / exchangeRates[currencyCode].last) * SATOSHIS_IN_BTC
      : 0;
  }

  function convertSatsToFiat(amount: Satoshis) {
    return exchangeRates && exchangeRates[currencyCode]
      ? (amount / SATOSHIS_IN_BTC) * exchangeRates[currencyCode].last
      : 0;
  }

  useEffect(() => {
    // sets amount to send(based on currency selection)
    if (currentCurrency === CurrencyKind.BITCOIN) {
      if (satsEnabled) setAmountToSend(amount);
      else setAmountToSend(BtcToSats(parseFloat(amount)).toString());
    } else setAmountToSend(convertFiatToSats(parseFloat(amount)).toFixed(0).toString());
  }, [currentCurrency, satsEnabled, amount]);

  useEffect(() => {
    // error handler
    let availableToSpend = idx(sender, (_) => _.specs.balances.confirmed);
    const haveSelectedUTXOs = selectedUTXOs && selectedUTXOs.length;
    if (haveSelectedUTXOs) availableToSpend = selectedUTXOs.reduce((a, c) => a + c.value, 0);

    if (haveSelectedUTXOs) {
      if (availableToSpend < Number(amountToSend))
        setErrorMessage('Please select enough UTXOs to send');
      else if (availableToSpend < Number(amountToSend) + Number(SatsToBtc(minimumAvgFeeRequired)))
        setErrorMessage('Please select enough UTXOs to accommodate fee');
      else setErrorMessage('');
    } else if (availableToSpend < Number(amountToSend))
      setErrorMessage('Amount entered is more than available to spend');
    else setErrorMessage('');
  }, [amountToSend, selectedUTXOs.length]);

  const onSendMax = (sendMaxFee, selectedUTXOs) => {
    // send max handler
    if (!sendMaxFee) return;

    let availableToSpend = idx(sender, (_) => _.specs.balances.confirmed);
    const haveSelectedUTXOs = selectedUTXOs && selectedUTXOs.length;
    if (haveSelectedUTXOs) availableToSpend = selectedUTXOs.reduce((a, c) => a + c.value, 0);

    if (availableToSpend) {
      const sendMaxBalance = Math.max(availableToSpend - sendMaxFee, 0);
      if (currentCurrency === CurrencyKind.BITCOIN) {
        if (satsEnabled) setAmount(sendMaxBalance.toString());
        else setAmount(`${SatsToBtc(sendMaxBalance)}`);
      } else setAmount(convertSatsToFiat(sendMaxBalance).toString());
    }
  };

  useEffect(() => {
    onSendMax(sendMaxFee, selectedUTXOs.length);
  }, [sendMaxFee, selectedUTXOs.length]);

  const navigateToNext = () => {
    navigation.dispatch(
      CommonActions.navigate('SendConfirmation', {
        sender,
        recipient,
        address,
        amount: parseInt(amountToSend, 10),
        transferType,
        note,
        label: labelsToAdd.filter(
          (item) => !(item.name === idx(recipient, (_) => _.presentationData.name) && item.isSystem) // remove wallet labels are they are internal refrerences
        ),
      })
    );
  };
  const { showToast } = useToastMessage();

  const executeSendPhaseOne = () => {
    const recipients = [];
    if (!amountToSend) {
      showToast('Please enter a valid amount');
      return;
    }
    recipients.push({
      address,
      amount: amountToSend, // should be denominated in sats
      name: recipient ? recipient.presentationData.name : '',
    });
    dispatch(
      sendPhaseOne({
        wallet: sender,
        recipients,
        selectedUTXOs,
      })
    );
  };

  useEffect(() => {
    if (sendPhaseOneState.isSuccessful) {
      navigateToNext();
    } else if (sendPhaseOneState.hasFailed) {
      if (sendPhaseOneState.failedErrorMessage === 'Insufficient balance')
        showToast('You have insufficient balance at this time.', null, 1000);
      else showToast(sendPhaseOneState.failedErrorMessage, null, 1000);
    }
  }, [sendPhaseOneState]);
  useEffect(
    () => () => {
      dispatch(sendPhaseOneReset());
    },
    []
  );
  useEffect(() => {
    const initialLabels = [];
    if (recipient && recipient.presentationData) {
      const name =
        recipient.entityKind === EntityKind.VAULT
          ? sender.presentationData.name
          : recipient.presentationData.name;
      const isSystem = true;
      initialLabels.push({ name, isSystem });
    }
    selectedUTXOs.forEach((utxo) => {
      if (labels[`${utxo.txId}:${utxo.vout}`]) {
        const useLabels = labels[`${utxo.txId}:${utxo.vout}`].filter((item) => !item.isSystem);
        initialLabels.push(...useLabels);
      }
    });
    setLabelsToAdd(initialLabels);
  }, []);

  const onAdd = () => {
    if (label) {
      labelsToAdd.push({ name: label, isSystem: false });
      setLabelsToAdd(labelsToAdd);
      setLabel('');
    }
  };
  const onCloseClick = (index) => {
    labelsToAdd.splice(index, 1);
    setLabelsToAdd([...labelsToAdd]);
  };
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 500 })}
        style={styles.Container}
      >
        <Box style={styles.HeaderContainer}>
          <Box style={styles.headerWrapper}>
            <KeeperHeader
              title={
                transferType === TransferType.WALLET_TO_WALLET
                  ? `Sending to Wallet`
                  : `Enter the Amount`
              }
            />
          </Box>
          <Box style={styles.currentTypeSwitchWrapper}>
            <CurrencyTypeSwitch />
          </Box>
        </Box>
        <Box
          style={{
            marginVertical: hp(5),
          }}
        >
          <WalletSendInfo
            selectedUTXOs={selectedUTXOs}
            availableAmt={sender?.specs.balances.confirmed}
            walletName={sender?.presentationData.name}
            currencyIcon={getCurrencyIcon(BTCIcon, 'dark')}
            isSats={satsEnabled}
          />
        </Box>

        <ScrollView style={styles.Container} showsVerticalScrollIndicator={false}>
          <Box
            style={{
              paddingHorizontal: 5,
            }}
          >
            {errorMessage && (
              <Text
                color="light.indicator"
                style={{
                  fontSize: 10,
                  letterSpacing: 0.1,
                  fontStyle: 'italic',
                  textAlign: 'right',
                  paddingRight: wp(10),
                  width: '100%',
                }}
              >
                {errorMessage}
              </Text>
            )}
            <Box
              backgroundColor={`${colorMode}.seashellWhite`}
              borderColor={errorMessage ? 'light.indicator' : 'transparent'}
              style={styles.inputWrapper}
            >
              <Box flexDirection="row" alignItems="center" style={{ width: '70%' }}>
                <Box marginRight={2}>
                  {getCurrencyIcon(BitcoinInput, colorMode === 'light' ? 'dark' : 'light')}
                </Box>
                <Box
                  marginLeft={2}
                  width={0.5}
                  backgroundColor={`${colorMode}.divider`}
                  opacity={0.3}
                  height={7}
                />
                <Input
                  backgroundColor={`${colorMode}.seashellWhite`}
                  placeholder="Enter Amount"
                  placeholderTextColor={`${colorMode}.greenText`}
                  width="90%"
                  fontSize={14}
                  fontWeight={300}
                  opacity={amount ? 1 : 0.5}
                  color={`${colorMode}.greenText`}
                  letterSpacing={1.04}
                  borderWidth="0"
                  value={amount}
                  onChangeText={(value) => {
                    if (!isNaN(Number(value))) {
                      setAmount(
                        value
                          .split('.')
                          .map((el, i) => (i ? el.split('').join('') : el))
                          .join('.')
                      );
                    }
                  }}
                  keyboardType="decimal-pad"
                />
              </Box>
              <Pressable
                onPress={() => {
                  const confirmBalance = sender.specs.balances.confirmed;
                  if (confirmBalance) {
                    if (sendMaxFee) {
                      onSendMax(sendMaxFee, selectedUTXOs);
                      return;
                    }
                    dispatch(
                      calculateSendMaxFee({
                        numberOfRecipients: recipientCount,
                        wallet: sender,
                        selectedUTXOs,
                      })
                    );
                  }
                }}
                backgroundColor={`${colorMode}.accent`}
                style={styles.sendMaxWrapper}
              >
                <Text color={`${colorMode}.sendMax`} style={styles.sendMaxText}>
                  Send Max
                </Text>
              </Pressable>
            </Box>

            <Box
              backgroundColor={`${colorMode}.seashellWhite`}
              borderColor={errorMessage ? 'light.indicator' : 'transparent'}
              style={styles.inputWrapper}
            >
              <Input
                backgroundColor={`${colorMode}.seashellWhite`}
                placeholder="Add a note"
                autoCapitalize="sentences"
                placeholderTextColor={`${colorMode}.greenText`}
                color={`${colorMode}.greenText`}
                opacity={note ? 1 : 0.5}
                width="90%"
                fontSize={14}
                fontWeight={300}
                letterSpacing={1.04}
                borderWidth="0"
                value={note}
                onChangeText={(value) => {
                  setNote(value);
                }}
              />
            </Box>
            <VStack
              backgroundColor={`${colorMode}.seashellWhite`}
              borderColor={errorMessage ? 'light.indicator' : 'transparent'}
              style={[
                styles.inputWrapper,
                { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' },
              ]}
            >
              <HStack style={styles.tagsWrapper}>
                {labelsToAdd.map((item, index) => (
                  <LabelItem
                    item={item}
                    index={index}
                    key={`${item.name}:${item.isSystem}`}
                    editingIndex={null}
                    onCloseClick={onCloseClick}
                    onEditClick={null}
                  />
                ))}
              </HStack>
              <Input
                backgroundColor={`${colorMode}.seashellWhite`}
                autoCapitalize="sentences"
                placeholder="Add a label"
                placeholderTextColor={`${colorMode}.greenText`}
                opacity={label ? 1 : 0.5}
                width="90%"
                fontSize={14}
                fontWeight={300}
                letterSpacing={1.04}
                borderWidth="0"
                value={label}
                onChangeText={(value) => {
                  setLabel(value);
                }}
                onSubmitEditing={onAdd}
              />
            </VStack>
            <Box style={styles.ctaBtnWrapper}>
              <Box ml={windowWidth * -0.09}>
                <Buttons
                  secondaryText="Select UTXOs"
                  secondaryCallback={() => {
                    navigation.dispatch(
                      CommonActions.navigate('UTXOSelection', { sender, amount, address })
                    );
                  }}
                  secondaryDisable={Boolean(!amount || errorMessage)}
                  primaryText="Send"
                  primaryDisable={Boolean(!amount || errorMessage)}
                  primaryCallback={executeSendPhaseOne}
                />
              </Box>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  textInput: {
    width: '100%',
    backgroundColor: Colors.Isabelline,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  transWrapper: {
    marginVertical: hp(5),
  },
  transBorderWrapper: {
    alignItems: 'center',
    marginVertical: hp(20),
  },
  transborderView: {
    borderBottomWidth: 1,
    width: wp(280),
    opacity: 0.1,
  },
  inputWrapper: {
    marginVertical: hp(5),
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  sendMaxWrapper: {
    paddingHorizontal: hp(10),
    paddingVertical: hp(3),
    borderRadius: 5,
  },
  sendMaxText: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  addNoteWrapper: {
    flexDirection: 'row',
    marginVertical: hp(2),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaBtnWrapper: {
    marginTop: hp(10),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  appNumPadWrapper: {
    width: '110%',
    marginLeft: '-5%',
  },
  infoNoteWrapper: {
    position: 'absolute',
    bottom: hp(20),
    alignSelf: 'center',
    backgroundColor: Colors.Bisque,
    opacity: 0.8,
    paddingHorizontal: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  infoNoteText: {
    fontSize: 12,
    opacity: 1,
  },
  infoText: {
    color: Colors.Black,
    fontWeight: 'bold',
    opacity: 1,
  },
  tagsWrapper: {
    marginLeft: 5,
    flexWrap: 'wrap',
  },
  HeaderContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  headerWrapper: {
    width: '75%',
  },
  currentTypeSwitchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
  },
});
export default AddSendAmount;
