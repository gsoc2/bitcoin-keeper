import React, { useState, useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box, Input } from 'native-base';
import { TouchableOpacity } from 'react-native';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import { useAppSelector } from 'src/store/hooks';
import { LocalizationContext } from 'src/common/content/LocContext';
import { hash512 } from 'src/core/services/operations/encryption';
import Close from 'src/assets/icons/modal_close.svg';

function FogotPassword(props) {
  const [passwordText, setPasswordText] = useState('');
  const { resetCred } = useAppSelector((state) => state.storage);
  const [invalid, setInvalid] = useState(false);

  const { translations } = useContext(LocalizationContext);
  const { login } = translations;

  const getSeedIndexText = (seedNumber) => {
    switch (seedNumber) {
      case 1:
        return 'first (01)';
      case 2:
        return 'second (02)';
      case 3:
        return 'third (03)';
      case 4:
        return 'fourth (04)';
      case 5:
        return 'fifth (05)';
      case 6:
        return 'sixth (06)';
      case 7:
        return 'seventh (07)';
      case 8:
        return 'eighth (08)';
      case 9:
        return 'ninth (09)';
      case 10:
        return 'tenth (10)';
      case 11:
        return 'eleventh (11)';
      case 12:
        return 'twelfth (12)';
    }
  };

  function onPressProceed() {
    if (props.type === 'seed') {
      const textHash = hash512(passwordText.toLowerCase());
      if (textHash === resetCred.hash) {
        props.onVerify();
      } else {
        setInvalid(true);
      }
    } else {
      // TODO
    }
  }

  return (
    <Box backgroundColor="light.secondaryBackground" padding={5}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          backgroundColor="light.lightAccent"
          borderRadius={32}
          h={8}
          width={8}
          alignItems="center"
          justifyContent="center"
          alignSelf="flex-end"
        >
          <Close />
        </Box>
      </TouchableOpacity>
      <Text fontSize={19} letterSpacing={1}>
        {login.ForgotPasscode}
      </Text>
      <Text fontSize={12}>{login.forgotPasscodeDesc}</Text>
      {props.type === 'seed' ? (
        <Box>
          <Text fontSize={13} mt={10}>
            Enter the
            <Text fontWeight={500} fontSize={13}>
              {` ${getSeedIndexText(resetCred.index + 1)} `}
            </Text>
            word
          </Text>
          <Input
            onChangeText={(text) => {
              setPasswordText(text.trim());
              setInvalid(false);
            }}
            borderWidth={0}
            borderRightRadius={10}
            placeholder="Enter Seed Word"
            placeholderTextColor="#2F2F2F"
            fontSize={13}
            fontWeight="bold"
            color="#000000"
            backgroundColor="light.primaryBackground"
            pl={5}
            py={4}
            my={6}
            value={passwordText}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            autoFocus
            secureTextEntry
          />

          {invalid && (
            <Text color="#FF0000" margin={2}>
              {login.Invalidword}
            </Text>
          )}
        </Box>
      ) : (
        <Box>
          <Input
            onChangeText={(text) => setPasswordText(text)}
            borderWidth={0}
            borderRightRadius={10}
            placeholder="Enter Encryption Password"
            placeholderTextColor="#2F2F2F"
            fontSize={13}
            fontWeight="bold"
            color="#000000"
            backgroundColor="light.primaryBackground"
            pl={5}
            py={4}
            my={6}
            value={passwordText}
          />
        </Box>
      )}
      <Box alignSelf="flex-end">
        <CustomGreenButton
          onPress={onPressProceed}
          value="Proceed"
          disabled={passwordText.trim() === ''}
        />
      </Box>
    </Box>
  );
}
export default FogotPassword;
