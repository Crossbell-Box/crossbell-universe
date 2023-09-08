import { OrchModel } from "@orch/core";

import { StateStorage } from "./storage";
import {
	EmailAccount,
	emailActions,
	EmailActionsDelegate,
	EmailState,
} from "./features/email";
import {
	walletActions,
	WalletState,
	WalletAccount,
	WalletActionsDelegate,
} from "./features/wallet";
import { markSSRReady, SSRReadyState } from "./features/ssr-ready";
import { tipsActions } from "./features/tips";
import { contractActions, ContractDelegate } from "./features/contract";
import { persist } from "./features/persist";
import { getCurrentAccount } from "./features/account-action";

export type CrossbellModelDelegate = Omit<EmailActionsDelegate, "getContract"> &
	Omit<WalletActionsDelegate, "getContract"> &
	ContractDelegate;

export type CrossbellModelState = SSRReadyState & WalletState & EmailState;

export class CrossbellModel extends OrchModel<CrossbellModelState> {
	readonly email: ReturnType<typeof emailActions>;
	readonly wallet: ReturnType<typeof walletActions>;
	readonly contract: ReturnType<typeof contractActions>;
	readonly tips: ReturnType<typeof tipsActions>;

	constructor(delegate: CrossbellModelDelegate, storage: StateStorage | null) {
		super({ ssrReady: false, wallet: null, email: null, _siwe: {} });

		const getContract = () => this.contract.get();
		const getIndexer = delegate.getIndexer;

		this.email = emailActions(this, { ...delegate, getContract });
		this.wallet = walletActions(this, { getIndexer, getContract });
		this.tips = tipsActions(this, { refreshMiraBalance: () => this.refresh() });

		this.contract = contractActions({
			getCurrentAddress: () => {
				return this.getState().wallet?.address ?? null;
			},
			getCurrentCharacterId: () => {
				return this.getState().wallet?.character?.characterId ?? null;
			},
			delegate,
		});

		markSSRReady(this);
		persist(this, { key: "crossbell:store", storage });
	}

	getCurrentAccount(): EmailAccount | WalletAccount | null {
		const { ssrReady } = this.getState();

		if (ssrReady) {
			return getCurrentAccount(this);
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
