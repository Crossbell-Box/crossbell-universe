import { OrchModel } from "@orch/core";

import { StateStorage } from "./storage";
import {
	EmailAccount,
	emailActions,
	EmailActionsDelegate,
	EmailState,
} from "./features/email";
import { walletActions, WalletState, WalletAccount } from "./features/wallet";
import { markSSRReady, SSRReadyState } from "./features/ssr-ready";
import { persist } from "./features/persist";

export type CrossbellModelDelegate = EmailActionsDelegate;

export type CrossbellModelState = SSRReadyState & WalletState & EmailState;

export class CrossbellModel extends OrchModel<CrossbellModelState> {
	readonly email: ReturnType<typeof emailActions>;
	readonly wallet: ReturnType<typeof walletActions>;

	constructor(delegate: CrossbellModelDelegate, storage: StateStorage | null) {
		super({ ssrReady: false, wallet: null, email: null, _siwe: {} });

		this.email = emailActions(this, delegate);
		this.wallet = walletActions(this);

		markSSRReady(this);
		persist(this, { key: "crossbell:store", storage });
	}

	getCurrentAccount(): EmailAccount | WalletAccount | null {
		const { email, wallet, ssrReady } = this.getState();

		if (ssrReady) {
			return email ?? wallet ?? null;
		} else {
			return null;
		}
	}

	getCurrentCharacterId() {
		return this.getCurrentAccount()?.character?.characterId;
	}

	getIsWalletSignedIn() {
		const account = this.getCurrentAccount();
		return account?.type === "wallet" && !!account.siwe;
	}

	async refresh() {
		await this.email.refresh();
		await this.wallet.refresh();
	}
}
