import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';

import { LocalizationContext } from 'src/common/content/LocContext';
import { wp, hp } from 'src/common/data/responsiveness/responsive';

import QRCode from 'react-native-qrcode-svg';
import CopyIcon from 'src/assets/images/icon_copy.svg';
import Note from '../Note/Note';

function ShowXPub({
  data,
  copy = () => { },
  subText,
  noteSubText,
  copyable = true,
}: {
  data: string;
  copy: Function;
  subText: string;
  noteSubText: string;
  copyable: boolean;
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return (
    <>
      <Box justifyContent="center" alignItems="center" width={wp(275)}>
        <Box>
          <QRCode value={data} logoBackgroundColor="transparent" size={hp(200)} />
          <Box
            backgroundColor={`${colorMode}.QrCode`}
            alignItems="center"
            justifyContent="center"
            padding={1}
            width={hp(200)}
          >
            <Text fontSize={12} color={`${colorMode}.recieverAddress`}>
              {subText}
            </Text>
          </Box>
        </Box>
        <Box padding={2}>
          {copyable ? (
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(data);
                copy();
              }}
              style={{
                flexDirection: 'row',
                backgroundColor: `${colorMode}.textInputBackground`,
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
                width: wp(220),
                marginTop: hp(30),
                marginBottom: hp(30),
              }}
            >
              <Box py={2} alignItems="center">
                <Text fontSize={12} numberOfLines={1} px={3}>
                  {data}
                </Text>
              </Box>

              <Box
                style={{
                  width: '15%',
                  paddingVertical: 3,
                  backgroundColor: '#CDD8D6',
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box>
                  <CopyIcon />
                </Box>
              </Box>
            </TouchableOpacity>
          ) : null}
        </Box>
      </Box>
      <Box width={wp(280)}>
        <Note title={common.note} subtitle={noteSubText} subtitleColor="GreyText" />
      </Box>
    </>
  );
}
export default ShowXPub;
