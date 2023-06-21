import React from "react";
import { DynamicContainerContent } from "@crossbell/ui";

import { Congrats } from "../../components";

import { SceneKind } from "./types";
import { useScenesStore, useCsbDetailModal, StoresProvider } from "./stores";

import { Balance } from "./scenes/balance";
import { ClaimCSB } from "./scenes/claim-csb";
import { Transfer } from "./scenes/transfer";
import { TransferSuccess } from "./scenes/transfer-success";

export default function CsbDetailModal() {
	const storeKey = useResetStore();

	return (
		<StoresProvider key={storeKey}>
			<Main />
		</StoresProvider>
	);
}

function Main() {
	const currentScene = useScenesStore(({ computed }) => computed.currentScene);

	return (
		<DynamicContainerContent id={currentScene.kind}>
			{((): JSX.Element => {
				switch (currentScene.kind) {
					case SceneKind.balance:
						return <Balance />;
					case SceneKind.claimCSB:
						return <ClaimCSB />;
					case SceneKind.congrats:
						return <Congrats {...currentScene} />;
					case SceneKind.transfer:
						return <Transfer />;
					case SceneKind.transferSuccess:
						return <TransferSuccess />;
				}
			})()}
		</DynamicContainerContent>
	);
}

function useResetStore() {
	const { isActive } = useCsbDetailModal();
	const keyRef = React.useRef(0);

	React.useMemo(() => {
		if (isActive) {
			keyRef.current += 1;
		}
	}, [isActive]);

	return keyRef.current;
}
