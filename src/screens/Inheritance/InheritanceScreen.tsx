import React, { Fragment, useCallback, useRef } from 'react';
import Header from 'src/components/Header';
import { Heading, Text, VStack } from 'native-base';
import InheritanceModes from './InheritanceModes';
import HexaBottomSheet from 'src/components/BottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import BenificiaryList from './BenificiaryList';
import DeclarationForm from './DeclarationForm';

const InheritanceScreen = () => {
  const assignRef = useRef<BottomSheet>(null);
  const declarationRef = useRef<BottomSheet>(null);
  const closeDecalarationSheet = useCallback(() => {
    declarationRef.current?.close();
  }, []);
  const openDecalarationSheet = useCallback(() => {
    declarationRef.current?.expand();
  }, []);
  const closeBeneficiarySheet = useCallback(() => {
    assignRef.current?.close();
  }, []);
  const closeDecalarationAndBeneficiary = useCallback(() => {
    declarationRef.current?.close();
    assignRef.current?.close();
  }, []);
  return (
    <Fragment>
      <Header />
      <VStack marginX={10}>
        <VStack>
          <Heading fontFamily={'body'} fontWeight={'200'} size={'md'}>
            Setup Inheritance
          </Heading>
          <Text fontFamily={'body'} fontWeight={'100'} size={'sm'} h={'auto'}>
            Bequeath your bitcoin
          </Text>
        </VStack>
        <Text
          fontFamily={'body'}
          fontWeight={'100'}
          size={'xs'}
          noOfLines={2}
          marginY={12}
          h={'auto'}
        >
          Make sure your legacy would be alive and glorious. Choose your beneficiary carefully.
        </Text>
        <InheritanceModes assignRef={assignRef} declarationRef={declarationRef} />
      </VStack>
      <HexaBottomSheet
        title={'Assign Benificiary'}
        subTitle={'Select who receives your bitcoin inheritance'}
        snapPoints={['90%']}
        bottomSheetRef={assignRef}
        primaryText={'Proceed'}
        secondaryText={'Setup Later'}
        secondaryCallback={closeBeneficiarySheet}
        primaryCallback={openDecalarationSheet}
      >
        <BenificiaryList />

      </HexaBottomSheet>
      <HexaBottomSheet
        title={'Sign Declaration'}
        subTitle={'Read the text below before signing'}
        snapPoints={['90%']}
        bottomSheetRef={declarationRef}
        primaryText={'Sign'}
        secondaryText={'Cancel'}
        secondaryCallback={closeDecalarationSheet}
        primaryCallback={closeDecalarationAndBeneficiary}
      >
        <DeclarationForm />
      </HexaBottomSheet>
    </Fragment>
  );
};

export default InheritanceScreen;
