import React from "react";
import { LoadMore, Loading } from "@crossbell/ui";
import { isAddressEqual } from "@crossbell/util-ethers";
import { CharacterOperatorEntity } from "crossbell.js";
import {
	OP_SIGN_OPERATOR_ADDRESS,
	X_SYNC_OPERATOR_ADDRESS,
	useGetCharacterOperators,
	NEWBIE_VILLA_OPERATOR_ADDRESS,
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

	const list = React.useMemo(
		() =>
			data?.pages
				.flatMap((page) =>
					page.list.map((characterOperator) => ({
						characterOperator: characterOperator,
						tags: getTags(characterOperator),
						description: getDescription(characterOperator),
					}))
				)
				.filter(
					({ characterOperator }) => characterOperator.permissions.length > 0
				)
				.sort((a, b) => (a.description ? (b.description ? 0 : -1) : 1)) ?? [],
		[data]
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

function getTags(characterOperator: CharacterOperatorEntity): ItemTag[] | null {
	if (isAddressEqual(characterOperator.operator, X_SYNC_OPERATOR_ADDRESS)) {
		return [
			{ title: "xSync", style: { background: "#5B89F7", color: "#fff" } },
		];
	}

	if (isAddressEqual(characterOperator.operator, OP_SIGN_OPERATOR_ADDRESS)) {
		return [
			{ title: "Op Sign", style: { background: "#6AD991", color: "#fff" } },
		];
	}

	if (
		isAddressEqual(characterOperator.operator, NEWBIE_VILLA_OPERATOR_ADDRESS)
	) {
		return [
			{
				title: "Newbie Villa",
				style: { background: "#F6C549", color: "#fff" },
			},
		];
	}

	return [
		{ title: "Unknown", style: { background: "#A9AAAB", color: "#fff" } },
	];
}

function getDescription(
	characterOperator: CharacterOperatorEntity
): string | null {
	if (isAddressEqual(characterOperator.operator, X_SYNC_OPERATOR_ADDRESS)) {
		return "For syncing other platforms' content";
	}

	if (isAddressEqual(characterOperator.operator, OP_SIGN_OPERATOR_ADDRESS)) {
		return "For liking, commenting, and minting";
	}

	return null;
}
