import * as React from "react";
import type { SVGProps } from "react";
import { Ref, forwardRef } from "react";
const SvgCircleHelp = (
	props: SVGProps<SVGSVGElement>,
	ref: Ref<SVGSVGElement>,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		fill="none"
		viewBox="0 0 16 16"
		ref={ref}
		{...props}
	>
		<path
			fill="currentColor"
			d="M8.067 11.883a.612.612 0 0 0 .45-.183c.122-.122.183-.272.183-.45s-.061-.328-.183-.45a.612.612 0 0 0-.45-.183.612.612 0 0 0-.45.183c-.123.122-.184.272-.184.45s.061.328.184.45a.612.612 0 0 0 .45.183zM7.483 9.45h.984c0-.289.036-.553.108-.792s.297-.514.675-.825c.344-.289.589-.572.733-.85.145-.278.217-.583.217-.916 0-.59-.192-1.062-.575-1.417-.383-.356-.892-.533-1.525-.533-.545 0-1.025.136-1.442.408-.416.272-.72.647-.908 1.125l.883.333c.122-.31.306-.553.55-.725.245-.172.534-.258.867-.258.378 0 .683.103.917.308.233.206.35.47.35.792 0 .244-.073.475-.217.692a3.32 3.32 0 0 1-.633.675c-.334.288-.581.575-.742.858-.161.283-.242.658-.242 1.125zM8 14.667a6.45 6.45 0 0 1-2.583-.525 6.763 6.763 0 0 1-2.125-1.434 6.763 6.763 0 0 1-1.434-2.125A6.451 6.451 0 0 1 1.333 8c0-.922.175-1.789.525-2.6s.828-1.517 1.434-2.117a6.834 6.834 0 0 1 2.125-1.425A6.45 6.45 0 0 1 8 1.333c.922 0 1.789.175 2.6.525.811.35 1.517.825 2.117 1.425S13.792 4.59 14.142 5.4s.525 1.678.525 2.6c0 .911-.175 1.772-.525 2.583a6.835 6.835 0 0 1-1.425 2.125 6.664 6.664 0 0 1-2.117 1.434 6.492 6.492 0 0 1-2.6.525zm0-1c1.578 0 2.917-.553 4.017-1.659 1.1-1.105 1.65-2.441 1.65-4.008 0-1.578-.55-2.917-1.65-4.017S9.577 2.333 8 2.333c-1.567 0-2.903.55-4.008 1.65C2.886 5.083 2.333 6.423 2.333 8c0 1.567.553 2.903 1.659 4.008C5.097 13.114 6.433 13.667 8 13.667z"
		/>
	</svg>
);
const ForwardRef = forwardRef(SvgCircleHelp);
export default ForwardRef;
