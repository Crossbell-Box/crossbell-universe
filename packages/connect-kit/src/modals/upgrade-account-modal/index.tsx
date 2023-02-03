import React from "react";
import { DynamicContainer, DynamicContainerContent } from "@crossbell/ui";

import { BaseModal } from "../../components";

import { SceneKind } from "./types";
import {
	useScenesStore,
	useUpgradeAccountModal,
	StoresProvider,
} from "./stores";

import { ConnectKindDifferences } from "./scenes/connect-kind-differences";
import { SelectOptions } from "./scenes/select-options";
import { UpgradeToWallet } from "./scenes/upgrade-to-wallet";

export { useUpgradeAccountModal };

export function UpgradeAccountModal() {
	const { isActive, hide } = useUpgradeAccountModal();
	const storeKey = useResetStore();

	return (
		<BaseModal isActive={isActive} onClose={hide}>
			<DynamicContainer>
				<StoresProvider key={storeKey}>
					<Main />
				</StoresProvider>
			</DynamicContainer>
		</BaseModal>
	);
}

function Main() {
	const currentScene = useScenesStore(({ computed }) => computed.currentScene);

	return (
		<DynamicContainerContent id={currentScene.kind}>
			{((): JSX.Element => {
				switch (currentScene.kind) {
					case SceneKind.selectOptions:
						return <SelectOptions />;
					case SceneKind.connectKindDifferences:
						return <ConnectKindDifferences />;
					case SceneKind.upgradeToWallet:
						return <UpgradeToWallet />;
				}
			})()}
		</DynamicContainerContent>
	);
}

function useResetStore() {
	const { isActive } = useUpgradeAccountModal();
	const keyRef = React.useRef(0);

	React.useMemo(() => {
		if (isActive) {
			keyRef.current += 1;
		}
	}, [isActive]);

	return keyRef.current;
}
