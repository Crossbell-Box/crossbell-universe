import React from "react";
import {
	ContextModelProvider,
	useLocalModel,
	useModelState,
} from "@orch/react";
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
	const openSwitchNetworkModal = useRefCallback(props.openSwitchNetworkModal);
	const showClaimCSBTipsModal = useRefCallback(props.showClaimCSBTipsModal);
	const showErrorMsg = useRefCallback(props.showErrorMsg);
	const getIndexer = useRefCallback(props.getIndexer);

	const delegate = React.useMemo(
		(): CrossbellModelDelegate => ({
			openFaucetHintModel,
			openMintNewCharacterModel,
			openConnectModal,
			openSwitchNetworkModal,
			showClaimCSBTipsModal,
			showErrorMsg,
			getIndexer,
		}),
		[
			openFaucetHintModel,
			openMintNewCharacterModel,
			openConnectModal,
			openSwitchNetworkModal,
			showClaimCSBTipsModal,
			showErrorMsg,
			getIndexer,
		],
	);

	const storage = React.useMemo(getStorage, [getStorage]);
	const model = useLocalModel(CrossbellModel, [delegate, storage]);
	const address = useModelState(model, (s) => s.wallet?.address, []);

	React.useEffect(() => {
		if (provider && address) {
			model.contract.setProvider({ address, provider });
		}
	}, [provider, address, model]);

	return (
		<ContextModelProvider value={[model]}>{children}</ContextModelProvider>
	);
};
