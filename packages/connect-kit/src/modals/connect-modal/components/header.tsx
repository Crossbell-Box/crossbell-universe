import React from "react";

import { ModalHeaderProps, ModalHeader } from "../../../components";

import { useConnectModal, useScenesStore } from "../stores";

export type HeaderProps = ModalHeaderProps;

export function Header({ title, leftNode, rightNode }: HeaderProps) {
	const isAbleToGoBack = useScenesStore(
		({ computed }) => computed.isAbleToGoBack,
	);
	const goBack = useScenesStore(({ goBack }) => goBack);
	const { hide } = useConnectModal();

	return (
		<ModalHeader
			title={title}
			isAbleToGoBack={isAbleToGoBack}
			onGoBack={goBack}
			onClose={hide}
			leftNode={leftNode}
			rightNode={rightNode}
		/>
	);
}
