import React from "react";
import { LoadMore, Loading } from "@crossbell/ui";
import { isAddressEqual } from "viem";
import { CharacterOperatorEntity } from "crossbell";
import {
	X_SYNC_OPERATOR_ADDRESS,
	NEWBIE_VILLA_OPERATOR_ADDRESS,
	useGetCharacterOperators,
	useOpSignConfig,
	type OpSignConfig,
} from "@crossbell/react-account";

import styles from "./list.module.css";
import { Item, ItemTag } from "./item";

export type ListProps = {
	characterId: number;
};

export function List({ characterId }: ListProps) {
	const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
		useGetCharacterOperators({
			characterId,
		});
	const opSignConfig = useOpSignConfig();

	const list = React.useMemo(
		() =>
			data?.pages
				.flatMap((page) =>
					page.list.map((characterOperator) => ({
						characterOperator: characterOperator,
						tags: getTags(characterOperator, { opSignConfig }),
						description: getDescription(characterOperator, { opSignConfig }),
					})),
				)
				.filter(
					({ characterOperator }) => characterOperator.permissions.length > 0,
				)
				.sort((a, b) => (a.description ? (b.description ? 0 : -1) : 1)) ?? [],
		[data, opSignConfig],
	);

	return (
		<div className={styles.container}>
			{list.length === 0 && (
				<div className={styles.emptyTips}>
					{isLoading ? <Loading className={styles.loading} /> : "No operators"}
				</div>
			)}

			<div className={styles.list}>
				{list.map(({ characterOperator, tags, description }) => (
					<Item
						key={characterOperator.operator}
						characterId={characterId}
						characterOperator={characterOperator}
						description={description}
						tags={tags}
					/>
				))}
			</div>

			<LoadMore
				onLoadMore={fetchNextPage}
				isLoading={isFetchingNextPage}
				hasMore={!!hasNextPage}
			/>
		</div>
	);
}

function getTags(
	characterOperator: CharacterOperatorEntity,
	{ opSignConfig }: { opSignConfig: OpSignConfig },
): ItemTag[] | null {
	if (isAddressEqual(characterOperator.operator, X_SYNC_OPERATOR_ADDRESS)) {
		return [
			{
				title: "xSync",
				style: {
					background: "rgb(var(--color-91_137_247))",
					color: "rgb(var(--color-255_255_255))",
				},
			},
		];
	}

	if (isAddressEqual(characterOperator.operator, opSignConfig.address)) {
		return [
			{
				title: "Op Sign",
				style: {
					background: "rgb(var(--color-106_217_145))",
					color: "rgb(var(--color-255_255_255))",
				},
			},
		];
	}

	if (
		isAddressEqual(characterOperator.operator, NEWBIE_VILLA_OPERATOR_ADDRESS)
	) {
		return [
			{
				title: "Newbie Villa",
				style: {
					background: "rgb(var(--color-246_197_73))",
					color: "rgb(var(--color-255_255_255))",
				},
			},
		];
	}

	return [
		{
			title: "Unknown",
			style: {
				background: "rgb(var(--color-169_170_171))",
				color: "rgb(var(--color-255_255_255))",
			},
		},
	];
}

function getDescription(
	characterOperator: CharacterOperatorEntity,
	{ opSignConfig }: { opSignConfig: OpSignConfig },
): string | null {
	if (isAddressEqual(characterOperator.operator, X_SYNC_OPERATOR_ADDRESS)) {
		return "For syncing other platforms' content";
	}

	if (isAddressEqual(characterOperator.operator, opSignConfig.address)) {
		return "For liking, commenting, and minting";
	}

	return null;
}
