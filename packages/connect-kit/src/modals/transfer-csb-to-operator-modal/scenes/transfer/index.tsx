import React from "react";
import { useRefCallback } from "@crossbell/util-hooks";
import { useOpSignConfig } from "@crossbell/react-account";

import { TransferCSB as Main } from "../../../../components";

import { Header } from "../../components";
import { useScenesStore } from "../../stores";
import { SceneKind } from "../../types";

import styles from "./index.module.css";

export function Transfer() {
	const goTo = useScenesStore((s) => s.goTo);
	const onSuccess = useRefCallback(() => {
		goTo({ kind: SceneKind.transferSuccess });
	});
	const { address } = useOpSignConfig();

	return (
		<div className={styles.container}>
			<Header title="$CSB Transfer" />
			<Main toAddress={address} onSuccess={onSuccess} />
		</div>
	);
}
