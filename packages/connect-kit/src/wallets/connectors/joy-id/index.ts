import { JoyIdConnector as BaseConnector } from "@joyid/wagmi";

export type JoyIdConnectorOptions = ConstructorParameters<
	typeof BaseConnector
>[0];

export class JoyIdConnector extends BaseConnector {
	async isAuthorized() {
		return !!(await this.getAccount());
	}

	async getProvider(config?: { chainId?: number }) {
		const provider = await super.getProvider(config);
		const account = await this.getAccount();

		if (!("on" in provider)) {
			Object.defineProperty(provider, "on", {
				value: (key: string, callback: (...params: any[]) => void) => {
					console.warn(
						`JoyIdConnector: \`provider.on("${key}", callback)\` not implemented`,
					);

					if (key === "accountsChanged" && account) {
						callback([account]);
					}
				},
			});
		}

		return provider;
	}
}
