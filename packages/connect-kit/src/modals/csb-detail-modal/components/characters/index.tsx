import React from "react";
import { LoadMore } from "@crossbell/ui";
import { useAccountCharacters } from "@crossbell/react-account";

import styles from "./index.module.css";
import { Item } from "./item";

export function Characters() {
	const { characters, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useAccountCharacters();

	return (
		<div className={styles.layout}>
			<div className={styles.container}>
				{characters.map((character) => (
					<Item key={character.characterId} character={character} />
				))}

				<LoadMore
					onLoadMore={fetchNextPage}
					hasMore={hasNextPage}
					isLoading={isFetchingNextPage}
				/>
			</div>
		</div>
	);
}
