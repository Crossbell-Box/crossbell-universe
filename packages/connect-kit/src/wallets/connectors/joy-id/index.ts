import { JoyIdConnector as BaseConnector } from "@joyid/wagmi";

export class JoyIdConnector extends BaseConnector {
	async getProvider(config?: { chainId?: number }) {
		const provider = await super.getProvider(config);

		if (!("on" in provider)) {
			Object.defineProperty(provider, "on", {
				value: (key: string) => {
					console.warn(
						`JoyIdConnector: \`provider.on("${key}", callback)\` not implemented`,
					);
				},
			});
		}

		return provider;
	}
}
