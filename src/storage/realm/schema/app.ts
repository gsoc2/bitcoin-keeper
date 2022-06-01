import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const KeeperAppSchema: ObjectSchema = {
  name: RealmSchema.KeeperApp,
  properties: {
    appId: 'string',
    appName: 'string?',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    walletShellInstances: `${RealmSchema.VaultShellInstances}?`,
    vaultShellInstances: `${RealmSchema.VaultShellInstances}?`,
    twoFADetails: `${RealmSchema.TwoFADetails}?`,
    nodeConnect: `${RealmSchema.NodeConnect}?`,
    uai: `${RealmSchema.UAI}?`,
    userTier: RealmSchema.UserTier,
    version: 'string',
  },
  primaryKey: 'appId',
};
