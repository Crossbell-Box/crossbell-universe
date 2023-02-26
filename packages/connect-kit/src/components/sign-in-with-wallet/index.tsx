import React from "react";
import classNames from "classnames";
import { LoadingOverlay } from "@crossbell/ui";
import compact from "lodash.compact";

import { useIsWalletSignedIn, useWalletSignIn } from "../../hooks";
import { BottomTips } from "../bottom-tips";

import { Selections } from "../../modals/connect-modal/components/selections";

import styles from "./index.module.css";

export type SignInWithWalletProps = {
	afterSignIn?: () => void;
	onSkip?: () => void;
	signInText?: React.ReactNode;
	skipText?: React.ReactNode;
};

export function SignInWithWallet({
	afterSignIn,
	onSkip,
	signInText,
	skipText,
}: SignInWithWalletProps) {
	const signIn = useWalletSignIn();
	const isWalletSignedIn = useIsWalletSignedIn();

	React.useEffect(() => {
		if (isWalletSignedIn) {
			afterSignIn?.();
		}
	}, [isWalletSignedIn]);

	return (
		<div className={styles.main}>
			<div className={styles.tips}>
				By clicking Sign In, you will sign a message and prove you have your
				private key.
			</div>

			<LoadingOverlay visible={signIn.isLoading} />

			<Selections
				items={compact([
					{
						id: "sign-in",
						icon: null,
						title: signInText ?? "Sign In",
						className: classNames(styles.item, styles.signInItem),
						onClick: () => signIn.mutate(),
					},
					!!onSkip && {
						id: "skip",
						icon: null,
						title: skipText ?? "Skip",
						className: classNames(styles.item),
						onClick: onSkip,
					},
				])}
			/>

			<a
				href="https://eips.ethereum.org/EIPS/eip-4361"
				target="_blank"
				rel="noreferrer"
			>
				<BottomTips className={styles.bottomTips}>
					Learn more about Sign In
				</BottomTips>
			</a>
		</div>
	);
}
