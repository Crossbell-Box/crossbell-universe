import { useCrossbellModel } from "@crossbell/react-account";
import React from "react";

export function useContract() {
	const model = useCrossbellModel();
	const [_, refresh] = React.useState(0);

	React.useEffect(
		() => model.contract.subscribe(() => refresh((num) => num + 1)),
		[model],
	);

	return model.contract.get();
}
