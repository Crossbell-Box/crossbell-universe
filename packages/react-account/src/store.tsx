import React from "react";
import { ContextModelProvider, useLocalModel } from "@orch/react";
import {
	CrossbellModel,
	CrossbellModelDelegate,
	StateStorage,
} from "@crossbell/store";
import { showNotification } from "@mantine/notifications";

import { modalConfig } from "./modal-config";

const accountDelegate: CrossbellModelDelegate = {
	showClaimCSBTipsModal: modalConfig.showClaimCSBTipsModal,

	showErrorMsg(message) {
		showNotification({ color: "red", message, title: "Account" });
	},
};

export const StoreProvider = ({
	children,
	getStorage,
}: {
	children: React.ReactNode;
	getStorage: () => StateStorage | null;
}) => {
	const storage = React.useMemo(getStorage, [getStorage]);
	const account = useLocalModel(CrossbellModel, [accountDelegate, storage]);

	return (
		<ContextModelProvider value={[account]}>{children}</ContextModelProvider>
	);
};
