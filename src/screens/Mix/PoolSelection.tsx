import { Box } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useAppSelector } from 'src/store/hooks';
import { SatsToBtc } from 'src/common/constants/Bitcoin';
import PageIndicator from 'src/components/PageIndicator';
import Fonts from 'src/common/Fonts';
import WhirlpoolClient from 'src/core/services/whirlpool/client';
import { InputStructure, PoolData, Preview, TX0Data } from 'src/nativemodules/interface';
import useBalance from 'src/hooks/useBalance';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { captureError } from 'src/core/services/sentry';
import config from 'src/core/config';
import { NetworkType } from 'src/core/wallets/enums';
import Note from 'src/components/Note/Note';
import LearnMoreModal from './components/LearnMoreModal';
import UtxoSummary from './UtxoSummary';

const poolContent = (pools, onPoolSelectionCallback, satsEnabled) => (
  <Box style={styles.poolContent}>
    {pools &&
      pools.map((pool) => (
        <TouchableOpacity onPress={() => onPoolSelectionCallback(pool)}>
          <Box style={styles.poolItem}>
            <Text style={styles.poolItemText} color="#073e39">
              {satsEnabled ? pool?.denomination : SatsToBtc(pool?.denomination)}
            </Text>
            <Text style={styles.poolItemUnitText} color="#073e39">
              {satsEnabled ? 'sats' : 'btc'}
            </Text>
          </Box>
        </TouchableOpacity>
      ))}
  </Box>
);

export default function PoolSelection({ route, navigation }) {
  const { scode, premixFee, minerFee, utxos, utxoCount, utxoTotal, wallet } = route.params as any;
  const [showPools, setShowPools] = useState(false);
  const [availablePools, setAvailablePools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [poolSelectionText, setPoolSelectionText] = useState('');
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const [premixOutput, setPremixOutput] = useState(0);
  const [minMixAmount, setMinMixAmount] = useState(0);
  const [feeDiscountPercent, setFeeDiscountPercent] = useState(0);
  const [tx0Data, setTx0Data] = useState(null);
  const [tx0Preview, setTx0Preview] = useState(null);
  const [poolLoading, setPoolLoading] = useState(true);
  const [learnModalVisible, setLearnModalVisible] = useState(false);
  const { getSatUnit } = useBalance();
  const { showToast } = useToastMessage();

  useEffect(() => {
    setPoolLoading(true);
    initPoolData();
  }, []);

  const initPoolData = async () => {
    try {
      setPoolSelectionText('Fetching Pools...');
      const [pools, tx0Data] = await Promise.all([
        WhirlpoolClient.getPools(),
        WhirlpoolClient.getTx0Data(scode),
      ]);
      if (pools && tx0Data) {
        const sortedPools = pools?.sort((a, b) => a.denomination - b.denomination);
        const eligiblePools = sortedPools?.filter((pool) => pool.denomination <= utxoTotal);
        setAvailablePools(eligiblePools);
        setTx0Data(tx0Data);

        if (eligiblePools.length > 0) {
          const selectedPool =
            config.NETWORK_TYPE === NetworkType.TESTNET
              ? eligiblePools[0]
              : eligiblePools[eligiblePools.length - 1];
          setSelectedPool(selectedPool);
          onPoolSelectionCallback(selectedPool, tx0Data);
        } else {
          // case: no eligible pools
          const smallestPool = sortedPools[0];
          setSelectedPool(smallestPool);
          onPoolSelectionCallback(smallestPool, tx0Data);
        }
      } else {
        showToast('Error in fetching pools data', <ToastErrorIcon />, 3000);
      }
      setPoolLoading(false);
    } catch (error) {
      showToast('Error in fetching pools data', <ToastErrorIcon />, 3000);
      captureError(error);
    }
  };

  const closePoolSelectionModal = async () => {
    setShowPools(false);
  };

  const onPreviewMix = () => {
    navigation.navigate('BroadcastPremix', {
      utxos,
      utxoCount,
      utxoTotal,
      tx0Preview,
      tx0Data,
      selectedPool,
      wallet,
    });
  };

  const calculateMinimumMixAmount = async (pool: PoolData) => {
    const inputStructure: InputStructure = {
      nP2pkhInputs: 0,
      nP2shP2wpkhInputs: 0,
      nP2wpkhInputs: utxos.length,
    };
    let inputsValue = 0;
    utxos.forEach((input) => {
      inputsValue += input.value;
    });

    const approximateTx0Size = Number(
      await WhirlpoolClient.estimateTx0Size(
        inputStructure,
        Math.floor(inputsValue / pool.mustMixBalanceMin) + 2
      )
    );
    const tx0Fee = premixFee.fee * approximateTx0Size;
    const coordinatorFee = pool.feeValue;
    const minMixAmount = pool.mustMixBalanceCap + coordinatorFee + tx0Fee;
    return minMixAmount;
  };

  const onPoolSelectionCallback = async (pool: PoolData, tx0: TX0Data[]) => {
    try {
      setSelectedPool(pool);
      const minMixAmount = await calculateMinimumMixAmount(pool);
      setMinMixAmount(minMixAmount);
      if (utxoTotal < minMixAmount) return;

      // For some reason, tx0Data is undefined when called from initPoolData, so we need to get correct txoData
      const tx0ToFilter = tx0 || tx0Data;
      const correspondingTx0Data = tx0ToFilter?.filter((data) => data.poolId === pool.poolId)[0];
      setFeeDiscountPercent(correspondingTx0Data.feeDiscountPercent);

      const tx0Preview: Preview = await WhirlpoolClient.getTx0Preview(
        correspondingTx0Data,
        pool,
        premixFee.fee,
        minerFee.fee,
        utxos
      );
      if (tx0Preview) {
        setPremixOutput(tx0Preview?.nPremixOutputs);
        setTx0Preview(tx0Preview);
        setShowPools(false);
      } else {
        showToast('Error in creating Tx0 preview', <ToastErrorIcon />, 3000);
      }
    } catch (error) {
      showToast(`Tx0 preview error: ${error?.message || ''}`, <ToastErrorIcon />, 3000);
      captureError(error);
    }
  };

  const valueByPreferredUnit = (value) => {
    if (!value) return '';
    const valueInPreferredUnit = satsEnabled ? value : SatsToBtc(value);
    return valueInPreferredUnit;
  };

  return (
    <ScreenWrapper backgroundColor="light.mainBackground" barStyle="dark-content">
      <HeaderTitle
        paddingLeft={10}
        title="Selecting Pool"
        subtitle="Choose a pool based on total sats shown below"
        learnMore
        learnMorePressed={() => setLearnModalVisible(true)}
      />

      <UtxoSummary utxoCount={utxoCount} totalAmount={utxoTotal} />
      {poolLoading ? (
        <Box
          backgroundColor="light.primaryBackground"
          style={[styles.poolSelection, styles.poolErrorContainer]}
        >
          <ActivityIndicator size="small" />
          <Text style={styles.poolErrorText}>Fetching pools...</Text>
        </Box>
      ) : availablePools && availablePools.length > 0 && utxoTotal > minMixAmount ? (
        <Box backgroundColor="light.primaryBackground" style={styles.poolSelection}>
          <Text color="#017963">Pool</Text>
          <TouchableOpacity onPress={() => setShowPools(true)}>
            <Box style={{ flexDirection: 'row' }}>
              <Box style={styles.poolTextDirection}>
                <Text style={styles.poolText}>
                  {selectedPool
                    ? valueByPreferredUnit(selectedPool?.denomination)
                    : poolSelectionText}
                </Text>
                <Text style={styles.denominatorText}>{selectedPool ? getSatUnit() : ''}</Text>
              </Box>
              <Box style={styles.arrowIcon}>
                <RightArrowIcon />
              </Box>
            </Box>
          </TouchableOpacity>
        </Box>
      ) : (
        <Box
          backgroundColor="light.primaryBackground"
          style={[styles.poolSelection, styles.poolErrorContainer]}
        >
          <Text style={styles.poolErrorText}>
            Pools not available. Min{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {valueByPreferredUnit(minMixAmount)} {getSatUnit()}
            </Text>{' '}
            required
          </Text>
        </Box>
      )}
      <Box style={styles.textArea}>
        <Text color="#017963">Anonset</Text>
        <Text color="light.secondaryText">
          {selectedPool ? `${selectedPool?.minAnonymitySet} UTXOs` : '--'}
        </Text>
      </Box>

      <Box style={styles.textArea}>
        <Text color="#017963">Pool Fee</Text>
        <Box style={styles.poolTextDirection}>
          <Text color="light.secondaryText">
            {selectedPool ? valueByPreferredUnit(selectedPool?.feeValue) : ''}
          </Text>
          <Text color="light.secondaryText" style={{ paddingLeft: selectedPool ? 5 : 0 }}>
            {selectedPool ? getSatUnit() : '--'}
          </Text>
        </Box>
      </Box>

      {feeDiscountPercent !== 0 && (
        <Box style={styles.textArea}>
          <Text color="#017963">Fee Discount</Text>
          <Text color="light.secondaryText">{selectedPool ? `${feeDiscountPercent}%` : ''}</Text>
        </Box>
      )}

      <Box style={styles.textArea}>
        <Text color="#017963">Premix Outputs</Text>
        <Text color="light.secondaryText">
          {selectedPool ? premixOutput : ''} {selectedPool ? 'UTXOs' : '--'}
        </Text>
      </Box>

      <Box style={styles.footerContainer}>
        <Box style={styles.noteWrapper}>
          <Note title="Note" subtitle="Pool may take sometime to load" />
        </Box>
        <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box style={{ alignSelf: 'center', paddingBottom: 4, paddingLeft: 20 }}>
            <PageIndicator currentPage={1} totalPage={2} />
          </Box>
          <Box style={styles.footerItemContainer}>
            <Buttons
              primaryText="Preview Pre-Mix"
              primaryDisable={
                !(
                  availablePools &&
                  availablePools.length > 0 &&
                  utxoTotal > minMixAmount &&
                  tx0Preview
                )
              }
              secondaryText="Cancel"
              secondaryCallback={() => navigation.goBack()}
              primaryCallback={() => onPreviewMix()}
            />
          </Box>
        </Box>
      </Box>
      <LearnMoreModal visible={learnModalVisible} closeModal={() => setLearnModalVisible(false)} />
      <KeeperModal
        justifyContent="flex-end"
        visible={showPools}
        close={closePoolSelectionModal}
        title="Select Pool"
        subTitle="Determins the pool you want to mix your sats in. Bigger the pool, lesser the Doxxic"
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText=""
        buttonTextColor="#FAFAFA"
        buttonCallback={closePoolSelectionModal}
        closeOnOverlayClick={false}
        Content={() => poolContent(availablePools, onPoolSelectionCallback, satsEnabled)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  poolSelection: {
    marginLeft: 32,
    marginTop: 30,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: '85%',
  },
  textArea: {
    marginTop: 20,
    marginLeft: 40,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: wp(375),
    paddingHorizontal: 5,
  },
  footerItemContainer: {
    flexDirection: 'row',
    marginTop: windowHeight > 800 ? 5 : 5,
    marginBottom: windowHeight > 800 ? hp(10) : 0,
    paddingBottom: 15,
    justifyContent: 'flex-end',
    marginHorizontal: 16,
  },
  poolTextDirection: {
    flexDirection: 'row',
    width: '90%',
  },
  poolText: {
    paddingTop: 4,
    fontSize: 16,
    fontFamily: Fonts.RobotoCondensedRegular,
  },
  poolErrorContainer: {
    borderColor: '#F58E6F',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  poolErrorText: {
    color: '#F58E6F',
    padding: 5,
  },
  denominatorText: {
    fontSize: 12,
    paddingTop: 5,
    paddingLeft: 5,
  },
  arrowIcon: {
    width: 10,
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
    marginRight: 20,
  },
  poolContent: {
    marginBottom: 20,
    width: '100%',
  },
  poolItem: {
    fontSize: 18,
    padding: 15,
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    marginBottom: 5,
    flexDirection: 'row',
    width: '100%',
  },
  poolItemText: {
    fontSize: 18,
    textAlign: 'left',
  },
  poolItemUnitText: {
    fontSize: 12,
    width: '100%',
    paddingLeft: 5,
    paddingTop: 2,
    textAlign: 'left',
  },
  noteWrapper: {
    marginLeft: 25,
    marginBottom: 10,
  },
});
