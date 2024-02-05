import {
	configureChains,
	createConfig,
	type CreateConfigParameters,
	type Config,
} from "wagmi";
import { crossbell } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { w3mProvider } from "@web3modal/ethereum";

import compact from "lodash.compact";

import {
	CoinbaseWalletConnector,
	OKXConnector,
	WalletConnectConnector,
	JoyIdConnector,
	JoyIdConnectorOptions,
} from "./wallets";

export type GetDefaultClientConfigOptions = Omit<
	CreateConfigParameters,
	"connectors" | "publicClient" | "webSocketPublicClient"
> & {
	appName: string;
	walletConnectV2ProjectId?: string;
	joyIdOptions?: JoyIdConnectorOptions["options"];
};

export function createWagmiConfig({
	appName,
	walletConnectV2ProjectId,
	joyIdOptions,
	...restConfig
}: GetDefaultClientConfigOptions): Config {
	const { chains, publicClient, webSocketPublicClient } = configureChains(
		[crossbell],
		[
			walletConnectV2ProjectId
				? w3mProvider({ projectId: walletConnectV2ProjectId })
				: publicProvider(),
		],
		{ pollingInterval: 1_000 },
	);

	const connectors = compact([
		new InjectedConnector({
			chains,
			options: {
				shimDisconnect: true,
				name: (detectedName) =>
					`Injected (${
						typeof detectedName === "string"
							? detectedName
							: detectedName.join(", ")
					})`,
			},
		}),
		new MetaMaskConnector({
			chains,
			options: {
				shimDisconnect: true,
			},
		}),
		new OKXConnector({
			chains,
			options: { shimDisconnect: true },
		}),
		new CoinbaseWalletConnector({
			chains,
			options: {
				appName,
				headlessMode: true,
			},
		}),
		joyIdOptions &&
			new JoyIdConnector({
				chains,
				options: joyIdOptions,
			}),
		walletConnectV2ProjectId
			? new WalletConnectConnector({
					options: {
						showQrModal: false,
						projectId: walletConnectV2ProjectId,
					},
				})
			: null,
	]);

	return createConfig({
		autoConnect: true,
		connectors,
		publicClient,
		webSocketPublicClient,
		...restConfig,
	}) as Config;
}
