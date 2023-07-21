import { useContextModel, useModelState } from "@orch/react";
import {
	CrossbellModel,
	CrossbellModelState,
	EmailAccount,
	WalletAccount,
} from "@crossbell/store";
import React from "react";

export type { EmailAccount, WalletAccount };
export type GeneralAccount = EmailAccount | WalletAccount;

export function useCrossbellModel() {
	return useContextModel(CrossbellModel);
}

export function useCrossbellModelState<T>(
	selector: (state: CrossbellModelState, account: CrossbellModel) => T,
	deps: React.DependencyList,
): T {
	const model = useCrossbellModel();

	return useModelState(model, selector, deps);
}
