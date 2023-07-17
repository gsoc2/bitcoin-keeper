import React, { useState } from 'react';
import { Box, ScrollView } from 'native-base';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { setInheritance } from 'src/store/reducers/settings';
import { useAppDispatch } from 'src/store/hooks';
import SafeguardingTips from 'src/assets/images/SafeguardingTips.svg';
import SetupIK from 'src/assets/images/SetupIK.svg'
import Letter from 'src/assets/images/LETTER.svg';
import Recovery from 'src/assets/images/recovery.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

import Text from 'src/components/KeeperText';
import Note from 'src/components/Note/Note';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import DownloadFile from 'src/utils/DownloadPDF';
import InheritanceSupportView from './components/InheritanceSupportView';
import InheritanceDownloadView from './components/InheritanceDownloadView';
import IKSetupSuccessModal from './components/IKSetupSuccessModal';

function InheritanceStatus() {
    const navigtaion = useNavigation();
    const dispatch = useAppDispatch();
    const [visibleModal, setVisibleModal] = useState(false);
    return (
        <ScreenWrapper>
            <HeaderTitle
                onPressHandler={() => navigtaion.goBack()}
                learnMore
                learnMorePressed={() => {
                    dispatch(setInheritance(true));
                }}
            />
            <InheritanceSupportView title='Inheritance Support' subtitle='Keeper provides you with the tips and tools you need to include the Vault in your estate planning' />
            <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
                <InheritanceDownloadView
                    icon={<SafeguardingTips />}
                    title='Key Security Tips'
                    subTitle='How to store your keys securely'
                    onPress={() => DownloadFile('Key Security Tips')}
                    isDownload
                />
                <InheritanceDownloadView
                    icon={<SetupIK />}
                    title='Setup Inheritance Key'
                    subTitle='Add a Keeper custodied key to create a 3-of-6 Vault'
                    onPress={() => console.log('press')}

                />
                <Box style={styles.signingDevicesView}>
                    <Text style={styles.signingDevicesText}>Signing Devices have been changed&nbsp;</Text>
                    <ToastErrorIcon />
                </Box>
                <InheritanceDownloadView
                    icon={<Letter />}
                    title='Letter to the attorney'
                    subTitle='A partly filled pdf template'
                    onPress={() => DownloadFile('Letter to the attorney')}
                    isDownload
                />
                <InheritanceDownloadView
                    icon={<Recovery />}
                    title='Recovery Instructions'
                    subTitle='A document for the heir only'
                    onPress={() => DownloadFile('Restoring Inheritance Vault')}
                    isDownload
                />
            </ScrollView>
            {/* <Box style={styles.note}> */}
            <Note
                title="Note"
                subtitle="Consult your estate planning company to ensure the documents provided here are suitable for your needs and are as per your jurisdiction"
                subtitleColor="GreyText"
            />
            {/* </Box> */}
            <IKSetupSuccessModal visible={visibleModal} closeModal={() => setVisibleModal(false)} />
        </ScreenWrapper>
    )
}
const styles = StyleSheet.create({
    signingDevicesView: {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        marginTop: hp(20),
        right: 3
    },
    scrollViewWrapper: {
        height: windowHeight > 800 ? '50%' : '40%'
    },
    signingDevicesText: {
        color: '#E07962',
        fontSize: 14
    },
    note: {
        bottom: hp(5),
        justifyContent: 'center',
        width: wp(320),
    },
})
export default InheritanceStatus