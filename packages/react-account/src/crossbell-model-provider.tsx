import React from "react";
import { ContextModelProvider, useLocalModel } from "@orch/react";
import {
	CrossbellModel,
	CrossbellModelDelegate,
	StateStorage,
	ContractProvider,
} from "@crossbell/store";
import { useRefCallback } from "@crossbell/util-hooks";

export type CrossbellModelProviderProps = {
	children: React.ReactNode;
	getStorage: () => StateStorage | null;
	provider: ContractProvider | null;
} & CrossbellModelDelegate;

export const CrossbellModelProvider = ({
	children,
	getStorage,
	provider,
	...props
}: CrossbellModelProviderProps) => {
	const openFaucetHintModel = useRefCallback(props.openFaucetHintModel);
	const openMintNewCharacterModel = useRefCallback(
		props.openMintNewCharacterModel,
	);
	const openConnectModal = useRefCallback(props.openConnectModal);
	const showSwitchNetworkModal = useRefCallback(props.showSwitchNetworkModal);
	const showClaimCSBTipsModal = useRefCallback(props.showClaimCSBTipsModal);
	const showErrorMsg = useRefCallback(props.showErrorMsg);
	const getIndexer = useRefCallback(props.getIndexer);

	const delegate = React.useMemo(
		(): CrossbellModelDelegate => ({
			openFaucetHintModel,
			openMintNewCharacterModel,
			openConnectModal,
			showSwitchNetworkModal,
			showClaimCSBTipsModal,
			showErrorMsg,
			getIndexer,
		}),
		[
			openFaucetHintModel,
			openMintNewCharacterModel,
			openConnectModal,
			showSwitchNetworkModal,
			showClaimCSBTipsModal,
			showErrorMsg,
			getIndexer,
		],
	);

	const storage = React.useMemo(getStorage, [getStorage]);
	const model = useLocalModel(CrossbellModel, [delegate, storage]);

	React.useEffect(() => {
		if (provider) {
			model.contract.setProvider(provider);
		}
	}, [provider, model]);

	return (
		<ContextModelProvider value={[model]}>{children}</ContextModelProvider>
	);
};
