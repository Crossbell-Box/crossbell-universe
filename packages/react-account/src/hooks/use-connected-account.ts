import { useCrossbellModelState } from "./crossbell-model";
import { EmailAccount, WalletAccount } from "@crossbell/store";

export function useConnectedAccount(type: "email"): EmailAccount | null;
export function useConnectedAccount(type: "wallet"): WalletAccount | null;
export function useConnectedAccount(
	type?: "email" | "wallet",
): EmailAccount | WalletAccount | null;
export function useConnectedAccount(
	type?: "email" | "wallet",
): EmailAccount | WalletAccount | null {
	return useCrossbellModelState((s, m) => {
		switch (type) {
			case "email":
				return s.email;
			case "wallet":
				return s.email ? null : s.wallet;
			default:
				return m.getCurrentAccount();
		}
	}, []);
}
