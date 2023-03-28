import React from 'react';
import { Box } from 'native-base';
import { StyleSheet, FlatList } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import WhirlpoolLoader from 'src/assets/images/whirlpool_loader.svg'; // Actual assert was missing in XD link
import GradientIcon from '../WalletDetailScreen/components/GradientIcon';

export const enum MixStatus {
  COMPLETED = 'COMPLETED',
  INPROGRESS = 'INPROGRESS',
  NOTSTARTED = 'NOTSTARTED',
  CANCELED = 'CANCELED',
}

const DATA = [
  {
    id: '1',
    title: 'Connecting to Whirlpool',
    status: MixStatus.COMPLETED,
  },
  {
    id: '2',
    title: 'Waiting for a mix',
    status: MixStatus.COMPLETED,
  },
  {
    id: '3',
    title: 'Trying to join a mix',
    status: MixStatus.COMPLETED,
  },
  {
    id: '4',
    title: 'Registering output',
    status: MixStatus.INPROGRESS,
  },
  {
    id: '5',
    title: 'Signing',
    status: MixStatus.NOTSTARTED,
  },
  {
    id: '6',
    title: 'Signed',
    status: MixStatus.NOTSTARTED,
  },
  {
    id: '7',
    title: 'Mix completed successfully',
    status: MixStatus.NOTSTARTED,
    isLast: true,
  },
];

const getBackgroungColor = (status: MixStatus) => {
  switch (status) {
    case MixStatus.NOTSTARTED:
      return 'light.dustySageGreen';
    case MixStatus.COMPLETED:
      return 'light.forestGreen';
    case MixStatus.INPROGRESS:
      return null;
    default:
      return null;
  }
};

const TimeLine = ({ title, isLast, status }) => {
  return (
    <>
      {status === MixStatus.INPROGRESS ? (
        <Box style={styles.whirlpoolLoaderMainWrapper}>
          <Box style={styles.dottedBorderContainer}>
            <Box style={styles.whirlpoolLoaderSolidBorder}>
              <GradientIcon
                height={hp(30)}
                gradient={['#00836A', '#073E39']}
                Icon={WhirlpoolLoader}
              />
            </Box>
            <Box style={styles.verticalBorderWrapper}>
              <Box backgroundColor={'light.fadedblue'} style={styles.verticalBorder} />
              <Box backgroundColor={'light.fadedblue'} style={styles.verticalBorder} />
              <Box backgroundColor={'light.fadedblue'} style={styles.verticalBorder} />
            </Box>
          </Box>
          <Text color="light.secondaryText" style={[styles.timeLineTitle, styles.settingUpTitle]}>
            {title}
          </Text>
        </Box>
      ) : (
        <Box style={styles.contentWrapper}>
          <Box style={styles.timeLineWrapper}>
            <Box style={styles.circularborder}>
              <Box backgroundColor={getBackgroungColor(status)} style={styles.greentDot} />
            </Box>
            {isLast ? null : (
              <Box style={styles.verticalBorderWrapper}>
                <Box backgroundColor={'light.fadedblue'} style={styles.verticalBorder} />
                <Box backgroundColor={'light.fadedblue'} style={styles.verticalBorder} />
                <Box backgroundColor={'light.fadedblue'} style={styles.verticalBorder} />
              </Box>
            )}
          </Box>
          <Text color="light.secondaryText" style={styles.timeLineTitle}>
            {title}
          </Text>
        </Box>
      )}
    </>
  );
};

const MixProgress = () => {
  const renderItem = ({ item }) => (
    <TimeLine title={item.title} status={item.status} isLast={item?.isLast} />
  );
  return (
    <Box style={styles.container}>
      <ScreenWrapper>
        <HeaderTitle
          enableBack={false}
          paddingTop={hp(30)}
          headerTitleColor=""
          titleFontSize={20}
          title="Mix Progress"
          subtitle="Donot exit this app, this may take upto 2min Lorem ipsum"
        />
        <Box style={styles.timeLineContainer}>
          <FlatList
            data={DATA}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatList}
          />
        </Box>
      </ScreenWrapper>
      <Box backgroundColor={'light.mainBackground'} style={styles.note}>
        <Note title="Note:" subtitle="Make sure your phone is sufficiently charged" />
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeLineContainer: {
    paddingHorizontal: wp(10),
  },
  flatList: {
    marginTop: hp(50),
    paddingBottom: 70,
  },
  circularborder: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.Black,
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
    width: hp(25),
    height: hp(25),
    zIndex: 999,
  },
  whirlpoolLoaderSolidBorder: {
    borderWidth: 1,
    borderColor: Colors.Black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: 3,
  },
  dottedBorderContainer: {
    alignItems: 'center',
  },
  whirlpoolLoaderMainWrapper: {
    flexDirection: 'row',
  },
  greentDot: {
    width: hp(19),
    height: hp(19),
    borderRadius: 50,
  },
  verticalBorderWrapper: {
    marginVertical: hp(5),
  },
  verticalBorder: {
    width: hp(5),
    height: hp(5),
    marginVertical: hp(5),
  },
  timeLineWrapper: {
    alignItems: 'center',
    marginHorizontal: wp(10),
  },
  contentWrapper: {
    flexDirection: 'row',
  },
  timeLineTitle: {
    fontSize: 17,
    letterSpacing: 0.5,
    marginLeft: wp(25),
    marginTop: hp(3),
  },
  settingUpTitle: {
    marginTop: hp(12),
  },
  note: {
    position: 'absolute',
    bottom: hp(0),
    left: wp(40),
    width: '100%',
    height: hp(70),
  },
});

export default MixProgress;
