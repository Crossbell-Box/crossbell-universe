import React from "react";
import { Button, Text } from "@mantine/core";

import Image from "@/components/common/Image";

import { ModalHeader, BaseModal } from "../../components";

import { useClaimCSBModal } from "./stores";

export { useClaimCSBModal };

export function ClaimCSBModal() {
	const { isActive, hide, msg } = useClaimCSBModal();

	return (
		<BaseModal isActive={isActive} onClose={hide}>
			<div className="sm:w-360px">
				<ModalHeader
					title="Claim"
					rightNode={
						<Button
							className="h-auto p-5px text-22px"
							variant="subtle"
							color="gray"
							compact
							onClick={hide}
						>
							<Text className="i-csb:close" />
						</Button>
					}
				/>

				<div className="px-24px flex flex-col items-center gap-15px">
					<div className="w-74px">
						<div className="aspect-74/111 relative">
							<Image fill src="/images/connect-kit/saving-money.png" />
						</div>
					</div>

					<p className="m-0 text-14px font-400 text-[#49454F] mb-24px">{msg}</p>
				</div>
			</div>
		</BaseModal>
	);
}