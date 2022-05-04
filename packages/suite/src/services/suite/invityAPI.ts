import { createHash } from 'crypto';
import {
    ExchangeListResponse,
    ExchangeTradeQuoteResponse,
    ExchangeTradeQuoteRequest,
    ConfirmExchangeTradeRequest,
    ExchangeTrade,
    WatchExchangeTradeResponse,
    ExchangeCoinInfo,
    BuyListResponse,
    BuyTradeQuoteRequest,
    BuyTradeQuoteResponse,
    BuyTradeRequest,
    BuyTradeResponse,
    BuyTradeFormResponse,
    BuyTrade,
    WatchBuyTradeResponse,
    CountryInfo,
    SellListResponse,
    SellVoucherTradeQuoteRequest,
    SellVoucherTradeQuoteResponse,
    SellVoucherTradeRequest,
    SellVoucherTrade,
    SellFiatTradeQuoteRequest,
    SellFiatTrade,
    SellFiatTradeQuoteResponse,
    SellFiatTradeRequest,
    SellFiatTradeResponse,
    WatchSellTradeResponse,
    BankAccount,
} from 'invity-api';
import { isDesktop } from '@suite-utils/env';
import type {
    AccountInfoResponse,
    AccountSettings,
    AccountUpdateResponse,
    InvityAuthentication,
    InvityServerEnvironment,
    InvityServers,
} from '@wallet-types/invity';
import { resolveStaticPath } from '@trezor/utils';
import { getPrefixedURL } from '@suite-utils/router';
import type { SuiteThemeColors } from '@trezor/components';
import { InvityAuthenticationThemeKey } from '@wallet-constants/coinmarket/metadata';

/** BEGIN: TEMPORARILY PLACED TYPES - Will be moved to @types/invity-api */
export type SavingsPaymentMethod = 'bankTransfer';
export interface SavingsErrorResponse {
    errorCode?: string;
    errorMessage?: string;
}

// starts after login to invity account
// 0 - external site
//      BTCD: nothing
//      Swan: redirect to OIDC // TODO: Isn't this a problem for Suite Desktop? Suite Desktop needs to allow open this link. Probably without the dialog about unknown site page load in browser?
// 1 - your credentials
//      BTCD: personal info (name+surname+phone+DOB?)
//      Swan: personal info (phone)
// 2 - your phone number
//      BTCD: sms verification
//      Swan: nothing
// 3 - KYC verification
//      BTCD: internal KYC, document type, KYC upload (we can move forward)
//      Swan: KYC status page (is it blocking until done?)
// 4 - AML
//      BTCD: AML
//      Swan: nothing
// 5 - Bank account
//      BTCD: nothing
//      Swan: enter bank account + server side validation on change
// 6 - Upload wallet screenshot for non-Trezor ClientApp?
//      BTCD: upload wallet screenshot only for non-Trezor ClientApp
//      Swan: ???
// 7 - DCA setup
//      BTCD: savings parameters, choose crypto address
//      Swan: savings parameters, choose crypto address(es)
// 8 - DCA setup
//      BTCD: confirmation
//      Swan: confirmation

type SavingsStepEnabled = {
    /** Indicates whether the step is enabled (meaning the flow process has to go through this step) or this step will be skipped. */
    isEnabled: boolean;
};

type SavingsStepAfterLogin = SavingsStepEnabled;

type SavingsStepCredentials = SavingsStepEnabled & {
    isFamilyNameEnabled: boolean;
    isGivenNameEnabled: boolean;
    isPhoneEnabled: boolean;
};

type SavingsStepPhoneVerification = SavingsStepEnabled & {
    /** Determines way of phone number verification.
     * - ClientApp - we verify the user's phone number
     * - External - we provide the phone number to partner to be verified by the partner or externally
     */
    phoneVerificationType: 'ClientApp' | 'External';
};

type SavingsStepKYC = SavingsStepEnabled & {
    /** Determines way KYC document upload.
     * - ClientApp - we handover the KYC documents to partner right from the user
     * - External - upload is managed fully by our partner
     */
    documentUploadType: 'ClientApp' | 'External';
    isWaitingForKYCResult: boolean;
};
type SavingsStepAML = SavingsStepEnabled;

type SavingsStepBankAccount = SavingsStepEnabled;
type SavingsStepCryptoWalletVerification = SavingsStepEnabled;

type SavingsStepParameters = SavingsStepEnabled & {
    receivingAddressCount: number;
};

type SavingsStepPaymentInfo = SavingsStepEnabled;

export interface SavingsProviderFlow {
    /** Defines what should happend after login. */
    afterLogin: SavingsStepAfterLogin;
    credentials: SavingsStepCredentials;
    phoneVerification: SavingsStepPhoneVerification;
    kyc: SavingsStepKYC;
    aml: SavingsStepAML;
    bankAccount: SavingsStepBankAccount;
    cryptoWalletVerification: SavingsStepCryptoWalletVerification;
    parameters: SavingsStepParameters;
    paymentInfo: SavingsStepPaymentInfo;
}

export interface SavingsProviderInfo {
    /** Name of provider as our identifier e.g.: btcdirect. */
    name: string;

    /** Official name of provider e.g.: BTC Direct. */
    companyName: string;

    /** Name of logo file. */
    logo: string;

    /** Indicates wheter the provider is marked as active or not. The setting comes from configuration. */
    isActive: boolean;

    /** Coins which user can save into. */
    tradedCoins: string[];

    /** Fiat currencies (3-letter ISO codes) with which can the savings be set up. */
    tradedFiatCurrencies: string[];

    /** Supported countries (2-letter ISO codes) of where provider offers the savings. */
    supportedCountries: string[];

    /** Provider's support URL. */
    supportUrl?: string;

    /** Defines methods of how a user can pay to save crypto. */
    paymentMethods?: SavingsPaymentMethod[];

    /** List of document types required by provider's KYC process. User has to choose one. */
    identityDocuments: SavingsProviderInfoIdentityDocument[];

    /** URL where a privacy policy of the provider is located. */
    privacyPolicyUrl: string;

    /** Defines a savings flow. Different providers might have different steps in the savings flow. */
    flow: SavingsProviderFlow;

    /** List of payment frequencies selectable by user during savings setup. */
    setupPaymentFrequencies: PaymentFrequency[];

    /** List of payment amounts selectable by user during savings setup. */
    setupPaymentAmounts: string[];

    minimumPaymentAmountLimit: number;

    maximumPaymentAmountLimit: number;

    defaultPaymentFrequency: PaymentFrequency;

    defaultPaymentAmount: number;
}

export interface SavingsProviderInfoIdentityDocument {
    documentType: SavingsTradeUserKYCStartDocumentType;
    documentImageSides: SavingsTradeUserKYCStartDocumentImageSide[];
    isRequired?: boolean;
}

export interface SavingsListResponse {
    country: string;
    providers: SavingsProviderInfo[];
}

export type SavingsSetupStatus =
    /** Show select options what kind of documents the will be KYC'ed. */
    | 'KYC'
    /** More like questionare - can't fail. */
    | 'AML'
    /** User needs to verify crypto wallet. */
    | 'WalletVerification'
    /** User needs to verify bank account. */
    | 'BankAccountVerification'
    /** User setups savings plan parameters (frequency, amount, etc.). */
    | 'SetSavingsParameters'
    /** Partner has generated payment info parameters. */
    | 'ConfirmPaymentInfo';

export type SavingsStatus = SavingsSetupStatus | 'Cancelled' | 'Active';
export type SavingsKYCStatus =
    /** KYC process didn't start yet. */
    | 'Open'
    /** KYC process is in progress. Might take some time to resolve. */
    | 'InProgress'
    /** KYC process passed successfully. */
    | 'Verified'
    /** KYC docs are invalid or anything could be wrong. Expecting reason from our partner to handover to the user. */
    | 'Failed';

export type SavingsAMLStatus =
    /** AML process didn't start yet. */
    | 'Open'
    /** AML process passed successfully. */
    | 'Verified';

export type PaymentFrequency = 'Weekly' | 'Biweekly' | 'Monthly' | 'Quarterly';

export interface SavingsTradePlannedPayment {
    /** Our id. */
    paymentId: string;
    fiatAmount?: string;
    cryptoAmount?: string;
    plannedPaymentAt: string;
    paymentInfo: SavingsPaymentInfo;
}

export interface SavingsTradeUserRegistration {
    /** Or first name as we are used to in most of the European countries. */
    givenName: string;

    /** Or last name as we are used to in most of the European countries. */
    familyName: string;

    /** Birth day in ISO format. For example: 2021-07-14T14:00:00.000Z - using date.toISOString() on client. */
    dateOfBirth: string;

    phoneNumber: string;
}

export type SavingsTradeUserKYCStartDocumentType =
    | 'Passport'
    | 'IdentityCard'
    | 'DrivingLicence'
    | 'Selfie'
    | 'WalletVerification';

export type SavingsTradeUserKYCStartDocumentImageSide =
    | 'Front'
    | 'Back'
    | 'Selfie'
    | 'SecondSelfie'
    | 'ProofOfResidency'
    | 'WalletVerification';

export interface SavingsTradeUserKYCStartDocumentImage {
    documentSide: SavingsTradeUserKYCStartDocumentImageSide;
    data: string;
}

export interface SavingsTradeUserKYCStart {
    documentType: SavingsTradeUserKYCStartDocumentType;
    documentImages: SavingsTradeUserKYCStartDocumentImage[];
}

export interface SavingsTradeAMLQuestion {
    key: string;
    label: string;
    answerOptions: string[];
}

export interface SavingsTrade {
    country?: string;
    status?: SavingsStatus;
    kycStatus?: SavingsKYCStatus;
    amlStatus?: SavingsAMLStatus;

    /** Customer's bank account from which payments should be paid to receive crypto. */
    bankAccount?: BankAccount;

    /** Amount of money to be paid recurrently. */
    fiatStringAmount?: string;

    /** Fiat currency of recurrent payment. */
    fiatCurrency?: string;

    /** Crypto currency of recurrent payment. */
    cryptoCurrency?: string;

    /** How often payment should be paid by customer. */
    paymentFrequency?: PaymentFrequency;

    paymentMethod?: SavingsPaymentMethod;

    /** Name of savings provider. */
    exchange: string;

    /** Crypto address where provider sends crypto. */
    receivingCryptoAddresses?: string[];

    /** Indicates whether the user is registred in partner's system. */
    isUserRegistredInPartnerSystem?: boolean;

    userRegistration?: SavingsTradeUserRegistration;

    userKYCStart?: SavingsTradeUserKYCStart[];

    amlQuestions?: SavingsTradeAMLQuestion[];

    amlAnswers?: SavingsTradeAMLAnswer[];

    paymentInfo?: SavingsPaymentInfo;

    tradeItems?: SavingsTradeItem[];

    // TODO: maybe encapsulate setup?
}

export interface SavingsPaymentInfo {
    name: string;
    iban: string;
    description: string;
    bic: string;
}

export interface SavingsTradeRequest {
    trade: SavingsTrade;
}

export interface SavingsTradeErrorResponse extends SavingsErrorResponse {
    errorCode?:
        | 'AppIDRequired'
        | 'ExchangeNotFound'
        | 'SavingsTradeCountryRequired'
        | 'SavingsTransactionNotFound'
        | 'GetUserInfoFailed'
        | 'FlowStepDisabled'
        | 'UnknownStatus';
}

export interface SavingsTradeResponse extends SavingsTradeErrorResponse {
    trade?: SavingsTrade;

    /** Payments in savings plan. */
    payments?: SavingsTradePlannedPayment[];
}

export interface SavingsKYCInfoSuccessResponse {
    status: 'Success';
    documentTypes: SavingsTradeUserKYCStartDocumentType[];
}

export type SavingsKYCInfoResponse = SavingsKYCInfoSuccessResponse | SavingsErrorResponse;

export interface SavingsTradeAMLAnswer {
    key: string;
    answer: string;
}
export interface SavingsTradeAMLAnswersRequest {
    answers: SavingsTradeAMLAnswer[];
}

export interface SavingsAMLAnswersSuccessResponse {
    status: 'Success';
}

export type SavingsAMLAnswersResponse = SavingsAMLAnswersSuccessResponse | SavingsErrorResponse;

export interface SavingsTradeKYCStatusSuccessfulResponse {
    kycStatus?: SavingsKYCStatus;
}

export type SavingsTradeKYCStatusResponse = SavingsTradeKYCStatusSuccessfulResponse &
    SavingsErrorResponse;

// TODO: cleanup
export type SavingsTradeItemStatus =
    | 'Cancelled'
    | 'Pending'
    | 'InProgress'
    | 'Blocked'
    | 'Completed'
    | 'Refunded'
    | 'Error';

export interface SavingsTradeItem {
    id: string;
    exchange: string;
    status: SavingsTradeItemStatus;
    receiveAddress: string;
    fiatStringAmount: string;
    fiatCurrency: string;
    receiveStringAmount: string;
    receiveCurrency: string;
    paymentMethod: SavingsPaymentMethod;
    created: string;
}

export interface WatchSavingTradeItemErrorResponse extends SavingsErrorResponse {
    errorCode?:
        | 'SavingsTradeItemIdRequired'
        | 'SavingsTradeItemNotFound'
        | 'AppIDRequired'
        | 'ExchangeNotFound'
        | 'SavingsTransactionNotFound';
}

export interface WatchSavingTradeItemResponse extends WatchSavingTradeItemErrorResponse {
    savingsTradeItem?: SavingsTradeItem;
}

export interface AfterLoginErrorResponse extends SavingsErrorResponse {
    errorCode?: 'ReturnUrlRequired' | 'ExchangeNotFound' | 'AfterLoginFailed';
}
export interface AfterLoginSuccessResponse {
    form?: {
        formMethod: 'GET';
        formAction: string;
        fields: Record<string, string>;
    };
}

export type AfterLoginResponse = AfterLoginSuccessResponse & AfterLoginErrorResponse;

export interface SubmitPhoneNumberResponse extends SavingsErrorResponse {
    errorCode?: 'ExchangeNotFound' | 'InternalError';
    form?: {
        formMethod: 'GET';
        formAction: string;
        fields: Record<string, string>;
    };
}

export interface VerifySmsCodeRequest {
    code: string;
    phoneNumber: string;
}

export interface VerifySmsCodeSuccessResponse {
    status: 'Verified';
}

export interface VerifySmsCodeInvalidResponse {
    status: 'VerificationCodeInvalid';
}

export interface VerifySmsCodeErrorResponse {
    status: 'Error';
    errorCode: 'VerificationCodeRequired' | 'PhoneNumberRequired' | 'InternalError';
    errorMessage: string;
}

export type VerifySmsCodeResponse =
    | VerifySmsCodeSuccessResponse
    | VerifySmsCodeInvalidResponse
    | VerifySmsCodeErrorResponse;

export interface SendVerificationSmsErrorResponse {
    status: 'Error';
    errorCode: 'InternalError' | 'SmsRequestLimitExceeded';
    errorMessage: string;
}

export interface SendVerificationSmsSuccessResponse {
    status: 'SmsQueued';
    verificationCodeExpirationInSeconds: number;
}

export type SendVerificationSmsResponse =
    | SendVerificationSmsSuccessResponse
    | SendVerificationSmsErrorResponse;

/** END: TEMPORARILY PLACED TYPES - Will be moved to @types/invity-api */

type BodyType =
    | BuyTrade
    | ExchangeTradeQuoteRequest
    | ConfirmExchangeTradeRequest
    | ExchangeTrade
    | BuyTradeQuoteRequest
    | BuyTradeRequest
    | SellVoucherTradeQuoteRequest
    | SellVoucherTradeRequest
    | SellFiatTradeRequest
    | SavingsTradeRequest
    | VerifySmsCodeRequest;

class InvityAPI {
    unknownCountry = 'unknown';

    authenticationServersForSuiteDesktop = {
        production: 'https://suite-desktop-auth.invity.io', // TODO: update the desktop URL accordingly, current value is just suggestion
        staging: 'https://suite-desktop-staging-auth.invity.io', // TODO: update the desktop URL accordingly, current value is just suggestion
        localhost: 'http://localhost:4633',
    } as const;

    servers = {
        production: {
            api: 'https://exchange.trezor.io',
            authentication: isDesktop()
                ? this.authenticationServersForSuiteDesktop.production
                : 'https://auth.trezor.io',
        },
        staging1: {
            api: 'https://staging-exchange1.sldev.cz',
            authentication: isDesktop()
                ? this.authenticationServersForSuiteDesktop.staging
                : 'https://staging-auth.sldev.cz/suite',
        },
        staging2: {
            api: 'https://staging-exchange2.sldev.cz',
            authentication: isDesktop()
                ? this.authenticationServersForSuiteDesktop.staging
                : 'https://staging-auth.sldev.cz/suite',
        },
        localhost: {
            api: 'http://localhost:3330',
            authentication: isDesktop()
                ? this.authenticationServersForSuiteDesktop.localhost
                : 'http://localhost:4533',
        },
    } as InvityServers;

    private protectedAPI = false;
    private serverEnvironment = 'production' as InvityServerEnvironment;

    // info service
    private DETECT_COUNTRY_INFO = '/info/country';
    private GET_COUNTRY_INFO = '/info/country/{{country}}';

    // exchange service
    private EXCHANGE_LIST = '/exchange/list';
    private EXCHANGE_COINS = '/exchange/coins';
    private EXCHANGE_QUOTES = '/exchange/quotes';
    private EXCHANGE_DO_TRADE = '/exchange/trade';
    private EXCHANGE_WATCH_TRADE = '/exchange/watch/{{counter}}';

    // buy service
    private BUY_LIST = '/buy/list';
    private BUY_QUOTES = '/buy/quotes';
    private BUY_DO_TRADE = '/buy/trade';
    private BUY_GET_TRADE_FORM = '/buy/tradeform';
    private BUY_WATCH_TRADE = '/buy/watch/{{counter}}';

    // sell service
    private SELL_LIST = '/sell/list';
    private VOUCHER_QUOTES = '/sell/voucher/quotes';
    private VOUCHER_REQUEST_TRADE = '/sell/voucher/trade';
    private VOUCHER_CONFIRM_TRADE = '/sell/voucher/confirm';
    private SELL_FIAT_QUOTES = '/sell/fiat/quotes';
    private SELL_FIAT_DO_TRADE = '/sell/fiat/trade';
    private SELL_FIAT_CONFIRM = '/sell/fiat/confirm';
    private SELL_FIAT_WATCH_TRADE = '/sell/fiat/watch/{{counter}}';

    private SAVINGS_LIST = '/savings/list';
    private SAVINGS_TRADE = '/account/savings/trade';
    private SAVINGS_WATCH_TRADE = '/account/savings/watch';
    private SAVINGS_WATCH_KYC = '/account/savings/watch-kyc';
    private SAVINGS_AFTER_LOGIN = '/account/savings/after-login';

    private ACCOUNT_INFO = '/account/info';
    private ACCOUNT_SETTINGS = '/account/settings';
    private PHONE_SEND_VERIFICATION_SMS = '/account/phone/send-verification-sms';
    private PHONE_VERIFY_SMS_CODE = '/account/phone/verify-sms-code';

    private static accountDescriptor: string;
    private static apiKey: string;

    private getInvityAPIKey() {
        if (!InvityAPI.apiKey) {
            throw Error('apiKey not created');
        }

        return InvityAPI.apiKey;
    }

    getAllApiServerUrls() {
        return [
            this.servers.production.api,
            this.servers.staging1.api,
            this.servers.staging2.api,
            this.servers.localhost.api,
        ];
    }

    getAllDesktopAuthenticationServerUrls() {
        return [
            this.authenticationServersForSuiteDesktop.production,
            this.authenticationServersForSuiteDesktop.staging,
            this.authenticationServersForSuiteDesktop.localhost,
        ];
    }

    getApiServerUrl() {
        return this.servers[this.serverEnvironment].api;
    }

    getAuthServerUrl() {
        return this.servers[this.serverEnvironment].authentication;
    }

    getCurrentAccountDescriptor() {
        return InvityAPI.accountDescriptor;
    }

    createInvityAPIKey(accountDescriptor: string) {
        if (accountDescriptor !== InvityAPI.accountDescriptor) {
            const hash = createHash('sha256');
            hash.update(accountDescriptor);
            InvityAPI.apiKey = hash.digest('hex');
            InvityAPI.accountDescriptor = accountDescriptor;
        }
    }

    setInvityServersEnvironment(serverEnvironment: InvityServerEnvironment) {
        if (serverEnvironment) {
            this.serverEnvironment = serverEnvironment;
        }
    }

    setProtectedAPI(protectedAPI: boolean) {
        this.protectedAPI = protectedAPI;
    }

    private options(body: BodyType = {}, method = 'POST', options: RequestInit = {}): any {
        const apiHeader = isDesktop() ? 'X-SuiteA-Api' : 'X-SuiteW-Api';
        if (this.protectedAPI) {
            options = {
                ...options,
                credentials: 'include',
            } as RequestInit;
        }
        if (method === 'POST') {
            return {
                ...options,
                method,
                mode: 'cors',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                    [apiHeader]: this.getInvityAPIKey(),
                },
                body: JSON.stringify(body),
            };
        }
        return {
            ...options,
            method,
            mode: 'cors',
            headers: {
                [apiHeader]: this.getInvityAPIKey(),
            },
        };
    }

    private requestApiServer(
        url: string,
        body: BodyType = {},
        method = 'POST',
        options: RequestInit = {},
        query: Record<string, string> = {},
    ): Promise<any> {
        let prefix: string;
        if (!this.protectedAPI || this.getApiServerUrl() === this.servers.localhost.api) {
            prefix = '/api';
        } else {
            prefix = '/auth/api';
        }
        const finalUrl = new URL(`${this.getApiServerUrl()}${prefix}${url}`);
        const queryEntities = Object.entries(query);
        if (queryEntities.length > 0) {
            queryEntities.forEach(([key, value]) => {
                finalUrl.searchParams.append(key, value);
            });
        }
        const opts = this.options(body, method, options);
        return fetch(finalUrl.toString(), opts).then(response => {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(output => {
                if (output.error) {
                    return output;
                }
                throw Error(`Request rejected with status ${response.status}`);
            });
        });
    }

    fetchCountryInfo = async (country: string): Promise<CountryInfo> => {
        try {
            const url =
                country && country !== this.unknownCountry
                    ? this.GET_COUNTRY_INFO.replace('{{country}}', country)
                    : this.DETECT_COUNTRY_INFO;
            const response: CountryInfo = await this.requestApiServer(url, {}, 'GET');
            return response;
        } catch (error) {
            console.log('[fetchCountryInfo]', error);
        }
        return { country: this.unknownCountry };
    };

    getExchangeList = async (): Promise<ExchangeListResponse | []> => {
        try {
            const response = await this.requestApiServer(this.EXCHANGE_LIST, {}, 'GET');
            if (!response || response.length === 0) {
                return [];
            }
            return response;
        } catch (error) {
            console.log('[getExchangeList]', error);
        }
        return [];
    };

    getExchangeCoins = async (): Promise<ExchangeCoinInfo[]> => {
        try {
            const response = await this.requestApiServer(this.EXCHANGE_COINS, {}, 'GET');
            if (!response || response.length === 0) {
                return [];
            }
            return response;
        } catch (error) {
            console.log('[getExchangeCoins]', error);
        }
        return [];
    };

    getExchangeQuotes = async (
        params: ExchangeTradeQuoteRequest,
    ): Promise<ExchangeTrade[] | undefined> => {
        try {
            const response: ExchangeTradeQuoteResponse = await this.requestApiServer(
                this.EXCHANGE_QUOTES,
                params,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[getExchangeQuotes]', error);
        }
    };

    doExchangeTrade = async (tradeRequest: ConfirmExchangeTradeRequest): Promise<ExchangeTrade> => {
        try {
            const response: ExchangeTrade = await this.requestApiServer(
                this.EXCHANGE_DO_TRADE,
                tradeRequest,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[doExchangeTrade]', error);
            return { error: error.toString(), exchange: tradeRequest.trade.exchange };
        }
    };

    watchExchangeTrade = async (
        trade: ExchangeTrade,
        counter: number,
    ): Promise<WatchExchangeTradeResponse> => {
        try {
            const response: WatchExchangeTradeResponse = await this.requestApiServer(
                this.EXCHANGE_WATCH_TRADE.replace('{{counter}}', counter.toString()),
                trade,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[watchExchangeTrade]', error);
            return { error: error.toString() };
        }
    };

    getBuyList = async (): Promise<BuyListResponse | undefined> => {
        try {
            const response = await this.requestApiServer(this.BUY_LIST, {}, 'GET');
            return response;
        } catch (error) {
            console.log('[getBuyList]', error);
        }
    };

    getBuyQuotes = async (params: BuyTradeQuoteRequest): Promise<BuyTrade[] | undefined> => {
        try {
            const response: BuyTradeQuoteResponse = await this.requestApiServer(
                this.BUY_QUOTES,
                params,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[getBuyQuotes]', error);
        }
    };

    doBuyTrade = async (tradeRequest: BuyTradeRequest): Promise<BuyTradeResponse> => {
        try {
            const response: BuyTradeResponse = await this.requestApiServer(
                this.BUY_DO_TRADE,
                tradeRequest,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[doBuyTrade]', error);
            return { trade: { error: error.toString(), exchange: tradeRequest.trade.exchange } };
        }
    };

    getBuyTradeForm = async (tradeRequest: BuyTradeRequest): Promise<BuyTradeFormResponse> => {
        try {
            const response: BuyTradeFormResponse = await this.requestApiServer(
                this.BUY_GET_TRADE_FORM,
                tradeRequest,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[getBuyTradeForm]', error);
            return { error: error.toString() };
        }
    };

    watchBuyTrade = async (trade: BuyTrade, counter: number): Promise<WatchBuyTradeResponse> => {
        try {
            const response: WatchBuyTradeResponse = await this.requestApiServer(
                this.BUY_WATCH_TRADE.replace('{{counter}}', counter.toString()),
                trade,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[watchBuyTrade]', error);
            return { error: error.toString() };
        }
    };

    getSellList = async (): Promise<SellListResponse | undefined> => {
        try {
            const response = await this.requestApiServer(this.SELL_LIST, {}, 'GET');
            return response;
        } catch (error) {
            console.log('[getSellList]', error);
        }
    };

    getVoucherQuotes = async (
        params: SellVoucherTradeQuoteRequest,
    ): Promise<SellVoucherTradeQuoteResponse | undefined> => {
        try {
            const response: SellVoucherTradeQuoteResponse = await this.requestApiServer(
                this.VOUCHER_QUOTES,
                params,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[getVoucherQuotes]', error);
        }
    };

    requestVoucherTrade = async (
        tradeRequest: SellVoucherTradeRequest,
    ): Promise<SellVoucherTrade> => {
        try {
            const response: SellVoucherTrade = await this.requestApiServer(
                this.VOUCHER_REQUEST_TRADE,
                tradeRequest,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[doVoucherTrade]', error);
            return { error: error.toString(), exchange: tradeRequest.exchange };
        }
    };

    confirmVoucherTrade = async (trade: SellVoucherTrade): Promise<SellVoucherTrade> => {
        try {
            const response: SellVoucherTrade = await this.requestApiServer(
                this.VOUCHER_CONFIRM_TRADE,
                trade,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[confirmVoucherTrade]', error);
            return { error: error.toString(), exchange: trade.exchange };
        }
    };

    getSellQuotes = async (
        params: SellFiatTradeQuoteRequest,
    ): Promise<SellFiatTrade[] | undefined> => {
        try {
            const response: SellFiatTradeQuoteResponse = await this.requestApiServer(
                this.SELL_FIAT_QUOTES,
                params,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[getSellQuotes]', error);
        }
    };

    doSellTrade = async (tradeRequest: SellFiatTradeRequest): Promise<SellFiatTradeResponse> => {
        try {
            const response: SellFiatTradeResponse = await this.requestApiServer(
                this.SELL_FIAT_DO_TRADE,
                tradeRequest,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[doSellTrade]', error);
            return { trade: { error: error.toString(), exchange: tradeRequest.trade.exchange } };
        }
    };

    doSellConfirm = async (trade: SellFiatTrade): Promise<SellFiatTrade> => {
        try {
            const response: SellFiatTrade = await this.requestApiServer(
                this.SELL_FIAT_CONFIRM,
                trade,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[doSellConfirm]', error);
            return { error: error.toString(), exchange: trade.exchange };
        }
    };

    watchSellTrade = async (
        trade: SellFiatTrade,
        counter: number,
    ): Promise<WatchSellTradeResponse> => {
        try {
            const response: WatchSellTradeResponse = await this.requestApiServer(
                this.SELL_FIAT_WATCH_TRADE.replace('{{counter}}', counter.toString()),
                trade,
                'POST',
            );
            return response;
        } catch (error) {
            console.log('[watchSellFiatTrade]', error);
            return { error: error.toString() };
        }
    };

    watchSavingsTrade = async (
        exchangeName: string,
        tradeItemId: string,
    ): Promise<WatchSavingTradeItemResponse> => {
        this.setProtectedAPI(true);
        try {
            const response: WatchSavingTradeItemResponse = await this.requestApiServer(
                `${this.SAVINGS_WATCH_TRADE}/${exchangeName}/${tradeItemId}`,
                {},
                'GET',
            );
            return response;
        } catch (error) {
            console.log('[watchSavingsTrade]', error);
            return { errorMessage: error.toString() };
        } finally {
            this.setProtectedAPI(false);
        }
    };

    getSavingsList = async (): Promise<SavingsListResponse | undefined> => {
        try {
            const response: SavingsListResponse = await this.requestApiServer(
                this.SAVINGS_LIST,
                {},
                'GET',
            );
            return response;
        } catch (error) {
            console.log('[getSavingsList]', error);
        }
    };

    getSavingsTrade = async (
        exchangeName: string,
        returnUrl: string,
    ): Promise<SavingsTradeResponse | undefined> => {
        this.setProtectedAPI(true);
        try {
            const response: SavingsTradeResponse = await this.requestApiServer(
                `${this.SAVINGS_TRADE}/${exchangeName}`,
                {},
                'GET',
                {},
                { returnUrl },
            );
            return response;
        } catch (error) {
            console.log('[getSavingsTrade]', error);
        } finally {
            this.setProtectedAPI(false);
        }
    };

    doSavingsTrade = async (
        requestBody: SavingsTradeRequest,
        returnUrl: string,
    ): Promise<SavingsTradeResponse | undefined> => {
        this.setProtectedAPI(true);
        try {
            const response: SavingsTradeResponse = await this.requestApiServer(
                `${this.SAVINGS_TRADE}/${requestBody.trade.exchange}`,
                requestBody,
                'POST',
                {},
                { returnUrl },
            );
            return response;
        } catch (error) {
            console.log('[doSavingsTrade]', error);
        } finally {
            this.setProtectedAPI(false);
        }
    };

    sendVerificationSms = async (): Promise<SendVerificationSmsResponse | undefined> => {
        this.setProtectedAPI(true);
        try {
            return await this.requestApiServer(this.PHONE_SEND_VERIFICATION_SMS, {}, 'POST');
        } catch (error) {
            console.log('[sendVerificationSms]', error);
        } finally {
            this.setProtectedAPI(false);
        }
    };

    saveAccountSettings = async (
        accountSettings: AccountSettings,
    ): Promise<AccountUpdateResponse | undefined> => {
        this.setProtectedAPI(true);
        try {
            return await this.requestApiServer(this.ACCOUNT_SETTINGS, accountSettings, 'POST');
        } catch (error) {
            console.log('[saveAccountSettings]', error);
        } finally {
            this.setProtectedAPI(false);
        }
    };

    verifySmsCode = async (
        code: string,
        phoneNumber: string,
    ): Promise<VerifySmsCodeResponse | undefined> => {
        this.setProtectedAPI(true);
        try {
            return await this.requestApiServer(
                this.PHONE_VERIFY_SMS_CODE,
                { code, phoneNumber } as VerifySmsCodeRequest,
                'POST',
            );
        } catch (error) {
            console.log('[verifySmsCode]', error);
        } finally {
            this.setProtectedAPI(false);
        }
    };

    watchKYCStatus = async (
        exchange: string,
        returnUrl: string,
    ): Promise<SavingsTradeKYCStatusResponse | undefined> => {
        this.setProtectedAPI(true);
        try {
            return await this.requestApiServer(
                `${this.SAVINGS_WATCH_KYC}/${exchange}`,
                {},
                'GET',
                {},
                { returnUrl },
            );
        } catch (error) {
            console.log('[watchKYCStatus]', error);
        } finally {
            this.setProtectedAPI(false);
        }
    };

    getLogoutUrl = async (): Promise<string | undefined> => {
        try {
            const response = await fetch(`${this.getAuthServerUrl()}/self-service/logout/browser`, {
                credentials: 'include',
            });
            const responseJsonBody = await response.json();
            return responseJsonBody.logout_url;
        } catch (error) {
            console.log('[logout]', error);
        }
    };

    getInvityAuthentication = async (): Promise<InvityAuthentication> => {
        try {
            const response = await fetch(`${this.getAuthServerUrl()}/sessions/whoami`, {
                credentials: 'include',
            });
            const result: InvityAuthentication = await response.json();
            return result;
        } catch (error) {
            console.log('[getInvityAuthentication]', error);
            const reason = error instanceof Object ? error.toString() : '';
            return {
                error: { code: 503, status: 'Error', reason },
            };
        }
    };

    private getInvityAuthenticationPageSrc(
        flow: 'login' | 'registration' | 'recovery' | 'settings' | 'verification',
        theme: SuiteThemeColors['THEME'],
        afterVerificationReturnToPath?: string,
    ) {
        // TODO: where to put the http://localhost:21335?
        const url = new URL(
            isDesktop()
                ? `http://localhost:21335/invity-${flow}`
                : `${window.location.origin}${resolveStaticPath(
                      `invity-authentication/${flow}.html`,
                  )}`,
        );
        const returnToUrl = isDesktop()
            ? `http://localhost:21335/invity-${flow}-success`
            : `${window.location.origin}${resolveStaticPath(
                  `invity-authentication/${flow}-success.html`,
              )}`;
        url.searchParams.append('return_to', returnToUrl);
        if (flow === 'registration' && afterVerificationReturnToPath) {
            // Handover URL where user should be redirected after registration and verification link in email was clicked.
            url.searchParams.append(
                'after_verification_return_to',
                `${window.location.origin}${getPrefixedURL(afterVerificationReturnToPath)}`,
            );
        }
        url.hash = this.getAuthServerUrl();
        url.searchParams.append(InvityAuthenticationThemeKey, theme);
        return url.toString();
    }

    getLoginPageSrc(theme: SuiteThemeColors['THEME']) {
        return this.getInvityAuthenticationPageSrc('login', theme);
    }

    getRegistrationPageSrc(
        afterVerificationReturnToPath: string,
        theme: SuiteThemeColors['THEME'],
    ) {
        return this.getInvityAuthenticationPageSrc(
            'registration',
            theme,
            afterVerificationReturnToPath,
        );
    }

    getRecoveryPageSrc(theme: SuiteThemeColors['THEME']) {
        return this.getInvityAuthenticationPageSrc('recovery', theme);
    }

    getSettingsPageSrc(theme: SuiteThemeColors['THEME']) {
        return this.getInvityAuthenticationPageSrc('settings', theme);
    }

    getVerificationPageSrc(theme: SuiteThemeColors['THEME']) {
        return this.getInvityAuthenticationPageSrc('verification', theme);
    }

    getAccountInfo = async (): Promise<AccountInfoResponse> => {
        try {
            const response: AccountInfoResponse = await this.requestApiServer(
                this.ACCOUNT_INFO,
                {},
                'GET',
            );
            return response;
        } catch (error) {
            console.log('[accountInfo]', error);
            return { error: error.toString() };
        }
    };

    getAfterLogin = async (
        exchangeName: string,
        returnUrl: string,
    ): Promise<AfterLoginResponse> => {
        this.setProtectedAPI(true);
        try {
            return await this.requestApiServer(
                `${this.SAVINGS_AFTER_LOGIN}/${exchangeName}`,
                {},
                'GET',
                {},
                { returnUrl },
            );
        } catch (error) {
            console.log('[getAfterLogin]', error);
            return { errorMessage: error.toString() };
        } finally {
            this.setProtectedAPI(false);
        }
    };
}

const invityAPI = new InvityAPI();

export default invityAPI;
