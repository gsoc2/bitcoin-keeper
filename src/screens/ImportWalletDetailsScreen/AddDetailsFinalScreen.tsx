import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Box, Text, View, useColorMode } from 'native-base';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { DerivationPurpose, EntityKind, WalletType } from 'src/core/wallets/enums';
import config from 'src/core/config';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { DerivationConfig, NewWalletInfo } from 'src/store/sagas/wallets';
import { parseInt } from 'lodash';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { v4 as uuidv4 } from 'uuid';

function AddDetailsFinalScreen({ route }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const [arrow, setArrow] = useState(false);
  const [showPurpose, setShowPurpose] = useState(false);
  const [purposeList, setPurposeList] = useState([
    { label: 'P2PKH: legacy, single-sig', value: DerivationPurpose.BIP44 },
    { label: 'P2SH-P2WPKH: wrapped segwit, single-sg', value: DerivationPurpose.BIP49 },
    { label: 'P2WPKH: native segwit, single-sig', value: DerivationPurpose.BIP84 },
  ]);
  const [purpose, setPurpose] = useState(`${DerivationPurpose.BIP84}`);
  const [purposeLbl, setPurposeLbl] = useState('P2PKH: legacy, single-sig');
  const [path, setPath] = useState(
    route.params?.path
      ? route.params?.path
      : WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );
  const [walletType, setWalletType] = useState(route.params?.type);
  const [importedSeed, setImportedSeed] = useState(route.params?.seed);
  const [walletName, setWalletName] = useState(route.params?.name);
  const [walletDescription, setWalletDescription] = useState(route.params?.description);
  const [transferPolicy, setTransferPolicy] = useState(route.params?.policy);
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError } = useAppSelector(
    (state) => state.bhr
  );
  const [walletLoading, setWalletLoading] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    const path = WalletUtilities.getDerivationPath(
      EntityKind.WALLET,
      config.NETWORK_TYPE,
      0,
      Number(purpose)
    );
    setPath(path);
  }, [purpose]);

  const createNewWallet = useCallback(() => {
    setWalletLoading(true);
    //TODO: remove this timeout once the crypto is optimised
    setTimeout(() => {
      const derivationConfig: DerivationConfig = {
        path,
        purpose: Number(purpose),
      };

      const newWallet: NewWalletInfo = {
        walletType,
        walletDetails: {
          name: walletName,
          description: walletDescription,
          derivationConfig: walletType === WalletType.DEFAULT ? derivationConfig : null,
          transferPolicy: {
            id: uuidv4(),
            threshold: parseInt(transferPolicy),
          },
        },
        importDetails: {
          derivationConfig,
          mnemonic: importedSeed,
        },
      };
      dispatch(addNewWallets([newWallet]));
    }, 200);
  }, [walletName, walletDescription, transferPolicy, path]);

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setWalletLoading(false);
      if (walletType === WalletType.DEFAULT) {
        showToast('New wallet created!', <TickIcon />);
        navigation.goBack();
      } else {
        showToast('Wallet imported', <TickIcon />);
        navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: 'Home' }] }));
      }
    }
    if (relayWalletError) {
      showToast('Wallet creation failed!', <ToastErrorIcon />);
      setWalletLoading(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError]);

  const onDropDownClick = () => {
    if (showPurpose) {
      setShowPurpose(false);
      setArrow(false);
    } else {
      setShowPurpose(true);
      setArrow(true);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <HeaderTitle
          title={home.ImportWallet}
          subtitle="Add details"
          headerTitleColor={Colors.TropicalRainForest}
          paddingTop={hp(5)}
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={[styles.textInputWrapper]}>
              <TextInput
                placeholder="Derivation Path"
                style={styles.textInput}
                placeholderTextColor={Colors.Feldgrau} // TODO: change to colorMode and use native base component
                value={path}
                onChangeText={(value) => setPath(value)}
                // width={wp(260)}
                autoCorrect={false}
                // marginY={2}
                // borderWidth="0"
                maxLength={20}
              />
            </Box>
            <TouchableOpacity onPress={onDropDownClick} style={styles.dropDownContainer}>
              <Text style={styles.balanceCrossesText}>{purposeLbl}</Text>
              <Box
                style={[
                  styles.icArrow,
                  {
                    transform: [{ rotate: arrow ? '-90deg' : '90deg' }],
                  },
                ]}
              >
                <RightArrowIcon />
              </Box>
            </TouchableOpacity>
          </Box>
          {showPurpose && (
            <ScrollView style={styles.langScrollViewWrapper}>
              {purposeList.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setShowPurpose(false);
                    setArrow(false);
                    setPurpose(item.value);
                    setPurposeLbl(item.label);
                  }}
                  style={styles.flagWrapper1}
                >
                  <Text style={styles.purposeText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ScrollView>
        <View style={styles.dotContainer}>
          <View style={{ flexDirection: 'row', marginTop: hp(15) }}>
            {[1, 2, 3].map((item, index) => (
              <View
                key={item.toString()}
                style={index === 2 ? styles.selectedDot : styles.unSelectedDot}
              />
            ))}
          </View>
          <Box style={styles.ctaBtnWrapper}>
            <Box ml={windowWidth * -0.09}>
              <Buttons
                secondaryText="Cancel"
                secondaryCallback={() => {
                  navigation.goBack();
                }}
                primaryText="Import"
                primaryDisable={!walletName || !walletDescription}
                primaryCallback={createNewWallet}
                primaryLoading={walletLoading || relayWalletUpdateLoading}
              />
            </Box>
          </Box>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  qrContainer: {
    alignSelf: 'center',
    marginVertical: hp(40),
    flex: 1,
  },
  scrollViewWrapper: {
    flex: 1,
  },
  textInput: {
    width: '100%',
    backgroundColor: Colors.Isabelline,
    borderRadius: 10,
    padding: 20,
  },
  dropDownContainer: {
    backgroundColor: Colors.Isabelline,
    borderRadius: 10,
    paddingVertical: 20,
    marginTop: 10,
    flexDirection: 'row',
  },
  cameraView: {
    height: hp(250),
    width: wp(375),
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: hp(25),
    alignItems: 'center',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(100),
    width: wp(330),
    borderRadius: hp(10),
    marginHorizontal: wp(12),
    paddingHorizontal: wp(25),
    marginTop: hp(5),
  },
  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: 40,
    height: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteWrapper: {
    marginTop: hp(35),
    // position: 'absolute',
    // bottom: windowHeight > 680 ? hp(20) : hp(8),
    width: '100%',
  },
  sendToWalletWrapper: {
    marginTop: windowHeight > 680 ? hp(20) : hp(10),
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(20),
  },
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.DimGray,
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.GrayX11,
    marginEnd: 5,
  },
  textInputWrapper: {
    flexDirection: 'row',
    marginTop: hp(15),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferText: {
    width: '100%',
    color: Colors.Feldgrau,
    marginHorizontal: 20,
    fontSize: 12,
    marginTop: hp(22),
    letterSpacing: 0.6,
  },
  amountWrapper: {
    marginHorizontal: 20,
    marginTop: hp(10),
  },
  balanceCrossesText: {
    color: Colors.Feldgrau,
    marginHorizontal: 20,
    fontSize: 12,
    marginTop: hp(10),
    letterSpacing: 0.96,
    flex: 1,
  },
  ctaBtnWrapper: {
    // marginBottom: hp(5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  langScrollViewWrapper: {
    borderWidth: 1,
    borderColor: Colors.Platinum,
    borderRadius: 10,
    margin: 15,
    width: '90%',
    zIndex: 10,
    backgroundColor: '#FAF4ED',
  },
  flagWrapper1: {
    flexDirection: 'row',
    height: wp(40),
    // alignSelf: 'center',
    alignItems: 'center',
  },
  purposeText: {
    fontSize: 13,
    marginLeft: wp(10),
    letterSpacing: 0.6,
  },
  icArrow: {
    marginLeft: wp(10),
    marginRight: wp(20),
    alignSelf: 'center',
  },
});
export default AddDetailsFinalScreen;
