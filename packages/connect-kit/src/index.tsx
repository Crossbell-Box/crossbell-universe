import type {} from "wagmi/window";
import React from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Notifications, showNotification } from "@mantine/notifications";
import {
	UseWeb2UrlContext,
	GetWeb2Url,
	UrlComposerContext,
	UrlComposerContextValue,
} from "@crossbell/ui";
import { MantineProvider } from "@mantine/core";
import {
	ReactAccountProvider,
	useCrossbellModel,
} from "@crossbell/react-account";
import { useRefCallback } from "@crossbell/util-hooks";
import { useColorScheme } from "@mantine/hooks";
import { indexer } from "@crossbell/indexer";
import { BaseSigner, ContractProvider } from "@crossbell/store";

import { usePreloadAllImgs } from "./utils";
import {
	ClaimCSBTipsModal,
	showClaimCSBTipsModal,
} from "./modals/claim-csb-tips-modal";
import { ConnectModal, showConnectModal } from "./modals/connect-modal";
import { DisconnectModal } from "./modals/disconnect-modal";
import { CsbDetailModal } from "./modals/csb-detail-modal";
import { WalletClaimCSBModal } from "./modals/wallet-claim-csb-modal";
import { OpSignSettingsModal } from "./modals/op-sign-settings-modal";
import { TransferCSBToOperatorModal } from "./modals/transfer-csb-to-operator-modal";
import {
	NoEnoughCSBModal,
	showNoEnoughCSBModal,
} from "./modals/no-enough-csb-modal";
import {
	showWalletMintNewCharacterModal,
	WalletMintNewCharacter,
} from "./modals/wallet-mint-new-character";
import { SelectCharactersModal } from "./modals/select-characters-modal";
import { DynamicScenesModal } from "./components/dynamic-scenes-modal";
import { SentryPrivacyModal } from "./modals/sentry-privacy-modal";
import {
	showSwitchNetworkModal,
	SwitchNetworkModal,
} from "./modals/switch-network-modal";
import { TipModal } from "./modals/tip-modal";
import { SetupSentry } from "./scenes/for-dynamic-modal/privacy-and-security";
import { XSettingsConfig, XSettingsConfigContext } from "./x-settings-config";
import {
	ConnectKitConfig,
	ConnectKitConfigContext,
} from "./connect-kit-config";
import { setupReactAccount } from "./setup-react-account";

export * from "@crossbell/react-account";
export * from "@crossbell/react-account/utils";
export * from "./modals/public";
export * from "./hooks";
export * from "./modules";
export * from "./create-wagmi-config";
export * from "./components/public";
export type { XSettingsConfig } from "./x-settings-config";

export type ConnectKitProviderProps = {
	children: React.ReactNode;
	ipfsLinkToHttpLink?: GetWeb2Url;
	withoutNotificationsProvider?: boolean;
	urlComposer?: UrlComposerContextValue;
	xSettings?: Partial<XSettingsConfig>;
	disableOPSign?: boolean;
	// Used for the case when we want to keep the user logged in even if the user disconnects from the wallet
	ignoreWalletDisconnectEvent?: boolean;
} & Partial<ConnectKitConfig>;

setupReactAccount();

export function ConnectKitProvider({
	children,
	ipfsLinkToHttpLink,
	withoutNotificationsProvider,
	urlComposer,
	xSettings,
	ignoreWalletDisconnectEvent,
	disableOPSign,
	...connectKitConfig
}: ConnectKitProviderProps) {
	const account = useAccount();
	const { disconnect } = useDisconnect();
	const getSigner = useRefCallback(
		async (): Promise<BaseSigner | undefined> => {
			return {
				async signMessage(message) {
					return (await account.connector?.getWalletClient())?.signMessage({
						message,
					});
				},
			};
		},
	);

	usePreloadAllImgs();
	const colorScheme = useColorScheme();
	const provider = useProvider();

	const node = (
		<UseWeb2UrlContext.Provider value={ipfsLinkToHttpLink ?? null}>
			<UrlComposerContext.Provider value={urlComposer ?? null}>
				<ReactAccountProvider
					disableOPSign={disableOPSign}
					getSigner={getSigner}
					onDisconnect={disconnect}
					getStorage={() => (typeof window === "object" ? localStorage : null)}
					getIndexer={() => indexer}
					openConnectModal={showConnectModal}
					openFaucetHintModel={() => showNoEnoughCSBModal("claim-csb")}
					openMintNewCharacterModel={showWalletMintNewCharacterModal}
					openSwitchNetworkModal={showSwitchNetworkModal}
					showClaimCSBTipsModal={showClaimCSBTipsModal}
					showErrorMsg={(err) =>
						showNotification({ color: "red", message: `${err}` })
					}
					provider={provider}
				>
					<ConnectKitConfigContext.Provider value={connectKitConfig}>
						<XSettingsConfigContext.Provider value={xSettings ?? null}>
							<MantineProvider theme={{ colorScheme }}>
								<ConnectModal />
								<DisconnectModal />
								<ClaimCSBTipsModal />
								<CsbDetailModal />
								<WalletClaimCSBModal />
								<OpSignSettingsModal />
								<TransferCSBToOperatorModal />
								<NoEnoughCSBModal />
								<WalletMintNewCharacter />
								<SelectCharactersModal />
								<DynamicScenesModal />
								<SetupSentry />
								<SentryPrivacyModal />
								<TipModal />
								<SwitchNetworkModal />
							</MantineProvider>
							<SyncConnectStatus
								ignoreWalletDisconnectEvent={ignoreWalletDisconnectEvent}
							/>
							{children}
						</XSettingsConfigContext.Provider>
					</ConnectKitConfigContext.Provider>
				</ReactAccountProvider>
			</UrlComposerContext.Provider>
		</UseWeb2UrlContext.Provider>
	);

	return withoutNotificationsProvider ? (
		node
	) : (
		<>
			{node}
			<Notifications position="bottom-center" zIndex={99999} />
		</>
	);
}

function SyncConnectStatus({
	ignoreWalletDisconnectEvent,
}: {
	ignoreWalletDisconnectEvent?: boolean;
}) {
	const model = useCrossbellModel();
	const account = useAccount();

	React.useEffect(() => {
		if (account.status === "connected") {
			model.wallet.connect(account.address);
		}

		if (account.status === "disconnected") {
			if (ignoreWalletDisconnectEvent) {
				model.wallet.refresh();
			} else {
				model.wallet.disconnect();
			}
		}
	}, [account.address, account.status]);

	React.useEffect(() => {
		model.email.refresh();
	}, [model]);

	return <></>;
}

function useProvider() {
	const { connector } = useAccount();
	const [provider, setProvider] = React.useState<ContractProvider>();

	React.useEffect(() => {
		connector?.getProvider().then(setProvider);
	}, [connector]);

	return provider ?? null;
}
