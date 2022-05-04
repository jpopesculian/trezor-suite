import { DeviceMode } from 'trezor-connect';

import { AppUpdateEvent } from '@suite-utils/analytics';

import type { AppState } from '@suite-types';
import type { Account, Network } from '@wallet-types';
import type { OnboardingAnalytics } from '@onboarding-types';
import type { BackendOption } from '@settings-hooks/backends';

export type AnalyticsEvent =
    | {
          /**
         suite-ready
         Triggers on application start. Logs part of suite setup that might have been loaded from storage
         but it might also be suite default setup that is loaded when suite starts for the first time.
         */
          type: 'suite-ready';
          payload: {
              language: AppState['suite']['settings']['language'];
              enabledNetworks: AppState['wallet']['settings']['enabledNetworks'];
              customBackends: Network['symbol'][];
              localCurrency: AppState['wallet']['settings']['localCurrency'];
              discreetMode: AppState['wallet']['settings']['discreetMode'];
              screenWidth: number;
              screenHeight: number;
              // added in 1.2
              tor: boolean;
              // added in 1.4
              rememberedStandardWallets: number;
              rememberedHiddenWallets: number;
              // added in 1.5
              theme: string;
              // added in 1.6
              suiteVersion: string;
              // added in 1.15
              earlyAccessProgram: boolean;
              // added in 1.8
              browserName: string;
              browserVersion: string;
              osName: string;
              osVersion: string;
              windowWidth: number;
              windowHeight: number;
              // added in 1.9
              platformLanguages: string;
              // added in 1.17
              autodetectLanguage: boolean;
              autodetectTheme: boolean;
          };
      }
    | { type: 'transport-type'; payload: { type: string; version: string } }
    | {
          /**
         device-connect
         is logged when user connects device
         - if device is not in bootloader, some of its features are logged
         */
          type: 'device-connect';
          payload: {
              mode?: DeviceMode;
              firmware: string;
              pin_protection: boolean | null;
              passphrase_protection: boolean | null;
              totalInstances: number | null;
              backup_type: string;
              // added in 1.6
              isBitcoinOnly: boolean;
              // added in 1.7
              totalDevices: number;
              // added in 1.9
              language: string | null;
              model: string;
              // added in 1.18
              firmwareRevision: string;
              bootloaderHash: string;
          };
      }
    | {
          /** if device is in bootloader, only this event is logged */
          type: 'device-connect';
          payload: {
              mode: 'bootloader';
              // added in 1.18
              firmware: string;
              bootloader: string;
          };
      }
    | {
          /**
           * accounts/status
           * - logged when discovery is completed (app start, coin added, account added)
           * - sends number of accounts having at least 1 transaction grouped by '[symbol]_[accountType]' (e.g. 'btc_segwit')
           */
          type: 'accounts/status';
          payload: {
              [key: string]: number;
          };
      }
    | {
          type: 'device-disconnect';
      }
    | {
          /**
         device-update-firmware
         is log after firmware update call to device is finished.
         */
          type: 'device-update-firmware';
          payload: {
              /** version of bootloader before update started. */
              fromBlVersion: string;
              /** version of firmware before update started. */
              fromFwVersion: string;
              /** version of the new firmware e.g 1.2.3, or omitted when installing custom fw */
              toFwVersion?: string;
              /** is new firmware bitcoin only variant?, or omitted when installing custom fw */
              toBtcOnly?: boolean;
              /** if finished with error, field error contains error string, otherwise is empty */
              error: string;
          };
      }
    | {
          type: 'device-setup-completed';
          payload: Partial<Omit<OnboardingAnalytics, 'startTime'>> & {
              duration: number;
              device: 'T' | '1';
          };
      }
    | {
          type: 'create-backup';
          payload: {
              status: 'finished' | 'error';
              error: string;
          };
      }
    | {
          type: 'accounts/empty-account/buy';
          payload: {
              symbol: string;
          };
      }
    | {
          type: 'accounts/empty-account/receive';
          payload: {
              symbol: string;
          };
      }
    | { type: 'dashboard/security-card/create-backup' }
    | { type: 'dashboard/security-card/seed-link' }
    | { type: 'dashboard/security-card/set-pin' }
    | { type: 'dashboard/security-card/change-pin' }
    | { type: 'dashboard/security-card/enable-passphrase' }
    | { type: 'dashboard/security-card/create-hidden-wallet' }
    | { type: 'dashboard/security-card/enable-discreet' }
    | {
          type: 'dashboard/security-card/toggle-discreet';
          payload: {
              value: boolean;
          };
      }
    | { type: 'menu/goto/switch-device' }
    | { type: 'menu/goto/suite-index' }
    | { type: 'menu/goto/wallet-index' }
    | { type: 'menu/goto/notifications-index' }
    | {
          type: 'menu/notifications/toggle';
          payload: {
              value: boolean;
          };
      }
    | { type: 'menu/goto/settings-index' }
    | {
          type: 'menu/settings/toggle';
          payload: {
              value: boolean;
          };
      }
    | {
          type: 'menu/settings/dropdown';
          payload: { option: 'all' | 'general' | 'device' | 'coins' | 'guide' };
      }
    | {
          type: 'menu/toggle-discreet';
          payload: {
              value: boolean;
          };
      }
    | {
          type: 'menu/goto/tor';
      }
    | {
          type: 'menu/toggle-tor';
          payload: {
              value: boolean;
          };
      }
    | {
          type: 'menu/toggle-onion-links';
          payload: {
              value: boolean;
          };
      }
    | {
          type: 'menu/goto/early-access';
      }
    | {
          type: 'menu/guide';
      }
    | {
          type: 'guide/header/navigation';
          payload: {
              type: 'back' | 'close' | 'category';
              id?: string;
          };
      }
    | {
          type: 'guide/node/navigation';
          payload: {
              type: 'page' | 'category';
              id: string;
          };
      }
    | {
          type: 'guide/feedback/navigation';
          payload: {
              type: 'overview' | 'bug' | 'suggestion';
          };
      }
    | {
          type: 'guide/feedback/submit';
          payload: {
              type: 'bug' | 'suggestion';
          };
      }
    | {
          type: 'guide/tooltip-link/navigation';
          payload: {
              id: string;
          };
      }
    | {
          type: 'wallet/add-account';
          payload: {
              /** normal, segwit, legacy */
              type: Account['accountType'];
              /** index of account  */
              path: Account['path'];
              /** network (btc, eth, etc.) */
              symbol: Account['symbol'];
          };
      }
    | { type: 'switch-device/add-wallet' }
    | { type: 'switch-device/add-hidden-wallet' }
    // todo: check if forget remember works as expected
    | { type: 'switch-device/forget' }
    | { type: 'switch-device/remember' }
    | { type: 'switch-device/eject' }
    | { type: 'settings/device/goto/backup' }
    | { type: 'settings/device/goto/recovery' }
    | { type: 'settings/device/goto/firmware' }
    | {
          type: 'settings/device/change-pin-protection';
          payload: {
              remove: boolean | null;
          };
      }
    | {
          type: 'settings/device/change-pin';
      }
    | { type: 'settings/device/change-label' }
    | {
          type: 'settings/device/update-auto-lock';
          payload: {
              value: number;
          };
      }
    | {
          type: 'settings/device/goto/background';
          payload: {
              // added in 1.9
              custom: boolean;
          };
      }
    | {
          type: 'settings/device/background';
          payload: {
              // added in 1.9
              image?: string;
              format?: string;
              size?: number;
              resolutionWidth?: number;
              resolutionHeight?: number;
          };
      }
    | {
          type: 'settings/device/change-orientation';
          payload: {
              value: 0 | 90 | 180 | 270;
          };
      }
    | { type: 'settings/device/goto/wipe' }
    | {
          type: 'settings/device/change-passphrase-protection';
          payload: {
              use_passphrase: boolean;
          };
      }
    | {
          type: 'settings/general/change-language';
          payload: {
              previousLanguage: AppState['suite']['settings']['language'];
              previousAutodetectLanguage: boolean;
              language: AppState['suite']['settings']['language'];
              autodetectLanguage: boolean;
              platformLanguages: string;
          };
      }
    | {
          type: 'settings/general/change-theme';
          payload: {
              previousTheme: AppState['suite']['settings']['theme']['variant'];
              previousAutodetectTheme: boolean;
              theme: AppState['suite']['settings']['theme']['variant'];
              autodetectTheme: boolean;
              platformTheme: AppState['suite']['settings']['theme']['variant'];
          };
      }
    | {
          type: 'settings/general/change-fiat';
          payload: {
              fiat: string;
          };
      }
    | {
          type: 'settings/general/early-access';
          payload: {
              allowPrerelease: boolean;
          };
      }
    | {
          type: 'settings/general/early-access/check-for-updates';
          payload: {
              checkNow: boolean;
          };
      }
    | {
          type: 'settings/general/early-access/download-stable';
      }
    | {
          type: 'settings/general/goto/early-access';
          payload: {
              allowPrerelease: boolean;
          };
      }
    | {
          type: 'router/location-change';
          payload: {
              prevRouterUrl: string;
              nextRouterUrl: string;
          };
      }
    | {
          type: 'session-end';
          payload: {
              // unix timestamp when session started
              start: number;
              // unix timestamp when session ended
              end: number;
          };
      }
    | {
          // fired when user manually enables analytics later in the app
          type: 'analytics/enable';
      }
    | {
          // fired when user manually disables analytics later in the app
          type: 'analytics/dispose';
      }
    | {
          // failed dry-run recovery any error ranging from disconnected device to wrong seed input
          type: 'check-seed/error';
          error?: string;
      }
    | {
          // successful dry-run
          type: 'check-seed/success';
      }
    | {
          type: 'select-wallet-type';
          payload: {
              type: 'hidden' | 'standard';
          };
      }
    | {
          type: 'transaction-created';
          payload: {
              // added in 1.9
              action: 'sent' | 'copied' | 'downloaded' | 'replaced';
              symbol: Account['symbol'];
              tokens: string;
              outputsCount: number;
              broadcast: boolean;
              bitcoinRbf: boolean;
              bitcoinLockTime: boolean;
              ethereumData: boolean;
              ethereumNonce: boolean;
              rippleDestinationTag: boolean;
              selectedFee: string;
          };
      }
    | {
          type: 'add-token';
          payload: {
              networkSymbol: Account['symbol'];
              addedNth: number; // if the user added 1st, 2nd,... token in his account
              // added in 1.9
              token: string;
          };
      }
    | {
          type: 'send-raw-transaction';
          payload: {
              networkSymbol: Account['symbol'];
          };
      }
    | {
          type: 'app-update';
          payload: AppUpdateEvent;
      }
    | {
          type: 'settings/coin-backend';
          payload: {
              symbol: Account['symbol'];
              type: BackendOption;
              totalRegular: number;
              totalOnion: number;
          };
      };
