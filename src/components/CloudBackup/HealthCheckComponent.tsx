import React, { useContext, useState, useEffect } from 'react';
import { Box, Text, Input } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';
import CustomGreenButton from '../CustomButton/CustomGreenButton';
import { BackupType } from 'src/common/data/enums/BHR';
import Buttons from '../Buttons';

const HealthCheckComponent = (props) => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];
  const common = translations['common'];
  const type: BackupType = props.type;
  const [seedWord, setSeedWord] = useState('');
  const [strongPassword, setStrongPassword] = useState('');
  const { words } = props;
  const [index] = useState(Math.floor(Math.random() * words.length));
  const [invalid, setInvalid] = useState(false);
  console.log(props.password);

  const getSeedNumber = (seedNumber) => {
    switch (seedNumber + 1) {
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

  const getHint = (seedNumber) => {
    switch (seedNumber + 1) {
      case 1:
        return 'first';
      case 2:
        return 'second';
      case 3:
        return 'third';
      case 4:
        return 'fourth';
      case 5:
        return 'fifth';
      case 6:
        return 'sixth';
      case 7:
        return 'seventh';
      case 8:
        return 'eighth';
      case 9:
        return 'ninth';
      case 10:
        return 'tenth';
      case 11:
        return 'eleventh';
      case 12:
        return 'twelfth';
    }
  };

  const onPressConfirm = () => {
    if (type === BackupType.SEED) {
      if (seedWord === words[index]) {
        props.onConfirmed('');
      } else {
        setInvalid(true);
      }
    } else {
      if (strongPassword === props.password) {
        props.onConfirmed(strongPassword);
      } else {
        setInvalid(true);
      }
    }
  };

  return (
    <Box bg={'light.ReceiveBackground'} p={10} borderRadius={10}>
      <Box>
        <Text fontSize={RFValue(19)} color={'light.lightBlack'}>
          {BackupWallet.healthCheck}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack2'} mb={10}>
          For the Recovery Phrase
        </Text>
      </Box>
      <Box>
        <Text fontSize={RFValue(13)} ml={3}>
          {type === BackupType.SEED
            ? `Enter the ${getSeedNumber(index)} word`
            : `Hint: ${props.hint}`}
        </Text>
        <Input
          placeholder={type === BackupType.SEED ? `Enter ${getHint(index)} word` : 'Enter Password'}
          placeholderTextColor={'light.lightBlack2'}
          backgroundColor={'light.lightYellow'}
          value={type === BackupType.SEED ? seedWord : strongPassword}
          onChangeText={(value) =>
            type === BackupType.SEED ? setSeedWord(value) : setStrongPassword(value)
          }
          style={{
            fontSize: RFValue(13),
            letterSpacing: 0.96,
            height: 50,
          }}
          borderRadius={10}
          marginY={2}
          borderWidth={'0'}
        />
      </Box>
      {invalid && (
        <Text color="red.400" fontSize={RFValue(13)} ml={1}>
          {'Invalid word'}
        </Text>
      )}
      <Box my={5}>
        <Text fontSize={RFValue(13)}>{BackupWallet.healthCheckNote}</Text>
      </Box>
      {/* <Box alignItems={'center'} flexDirection={'row'} w={'90%'}>
        <TouchableOpacity onPress={() => props.closeBottomSheet()} style={{ width: '60%' }}>
          <Text fontSize={RFValue(14)} textAlign={'center'}>
            {common.skip}
          </Text>
        </TouchableOpacity>
        <Box>
          <CustomGreenButton onPress={onPressConfirm} value={common.confirm} />
        </Box> 
         </Box>*/}
      <Buttons
        secondaryText={common.skip}
        secondaryCallback={() => {
          props.closeBottomSheet();
        }}
        primaryText={common.confirm}
        primaryCallback={onPressConfirm}
      />
    </Box>
  );
};
export default HealthCheckComponent;
