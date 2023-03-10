import React from "react";
import { DynamicContainer, DynamicContainerContent } from "@crossbell/ui";

import { BaseModal } from "../../components";

import { SceneKind } from "./types";
import {
	useScenesStore,
	useTransferCSBToOperatorModal,
	StoresProvider,
} from "./stores";

import { Transfer } from "./scenes/transfer";
import { TransferSuccess } from "./scenes/transfer-success";

export { useTransferCSBToOperatorModal };

export function TransferCSBToOperatorModal() {
	const { isActive, hide } = useTransferCSBToOperatorModal();
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
	const { isActive } = useTransferCSBToOperatorModal();
	const keyRef = React.useRef(0);

	React.useMemo(() => {
		if (isActive) {
			keyRef.current += 1;
		}
	}, [isActive]);

	return keyRef.current;
}
