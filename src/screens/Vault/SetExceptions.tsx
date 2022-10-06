import { Box, Text } from 'native-base';
import React, { useCallback, useState } from 'react';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import Fonts from 'src/common/Fonts';
import Buttons from 'src/components/Buttons';
import AppNumPad from 'src/components/AppNumPad';
import { SignerException, SignerPolicy, VerificationType } from 'src/core/services/interfaces';
import { CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { registerWithSigningServer } from 'src/store/sagaActions/wallets';

const SetExceptions = ({ navigation, route }) => {
  const [maxTransaction, setMaxTransaction] = useState('0');
  const dispatch = useDispatch();

  const CheckOption = ({ title, subTitle, isChecked = false, showInput = false }) => {
    return (
      <Box flexDirection={'row'} alignItems={'center'} marginTop={hp(40)}>
        <Pressable>
          <Box
            height={hp(27)}
            width={wp(27)}
            marginRight={wp(15)}
            borderRadius={hp(20)}
            borderWidth={1}
            borderColor={'light.brown'}
            backgroundColor={isChecked && 'light.brown'}
          />
        </Pressable>
        <Box>
          <Text fontWeight={200} fontSize={14} letterSpacing={0.96} color={'light.lightBlack'}>
            {title}
          </Text>
          <Text color={'light.GreyText'} fontWeight={200} fontSize={11} letterSpacing={0.5}>
            {subTitle}
          </Text>
        </Box>
        {showInput && (
          <Box>
            <Box marginLeft={wp(20)}>
              <TextInput style={styles.textInput} value={maxTransaction} />
            </Box>
          </Box>
        )}
      </Box>
    );
  };
  return (
    <Box flex={1} position={'relative'}>
      <ScreenWrapper barStyle="dark-content">
        <Box
          style={{
            paddingLeft: wp(10),
          }}
        >
          <HeaderTitle
            title="Set Exceptions"
            subtitle="for the signing server"
            paddingTop={hp(20)}
            showToggler={true}
          />
          {/* {check options } */}
          <Box
            style={{
              paddingHorizontal: wp(15),
            }}
          >
            <CheckOption title={'No Exceptions'} subTitle={'Lorem ipsum dolor sit amet,'} />
            <CheckOption
              title={'Max Transaction amount'}
              subTitle={'Lorem ipsum dolor sit amet,'}
              showInput={true}
            />
          </Box>
          {/* {button} */}
          <Box marginTop={hp(80)}>
            <Buttons
              primaryText="Next"
              primaryCallback={() => {
                const maxAmount = Number(maxTransaction); // in sats
                const exceptions: SignerException = {
                  none: maxAmount === 0,
                  transactionAmount: maxAmount === 0 ? null : maxAmount,
                };

                const policy: SignerPolicy = {
                  verification: {
                    method: VerificationType.TWO_FA,
                    verifier: {},
                  },
                  restrictions: route.params.restrictions,
                  exceptions,
                };

                dispatch(registerWithSigningServer(policy));
                navigation.dispatch(
                  CommonActions.navigate({ name: 'SetupSigningServer', params: {} })
                );
              }}
            />
          </Box>
        </Box>
      </ScreenWrapper>
      {/* {keypad} */}
      <Box position={'absolute'} bottom={10}>
        <AppNumPad
          setValue={setMaxTransaction}
          ok={() => {
            console.log('ok');
          }}
          clear={() => {}}
          color={'#073E39'}
          height={windowHeight >= 850 ? 80 : 60}
          darkDeleteIcon={true}
        />
      </Box>
    </Box>
  );
};
const styles = StyleSheet.create({
  textInput: {
    width: wp(98),
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    padding: 15,
    fontSize: 20,
    letterSpacing: 0.23,
    fontFamily: Fonts.RobotoCondensedRegular,
  },
});
export default SetExceptions;
