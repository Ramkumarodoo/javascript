import styled from "styled-components";
import colors from "yoast-components/style-guide/colors.json";

export const ListHeading = styled.h2`
	font-size: 1em;
	padding: 20px 40px;
	font-weight: 400;
	margin: 0;
	border-bottom: 1px solid ${ colors.$color_grey_medium };

	@media screen and ( max-width: 1355px ) {
		padding: 20px 24px;
	}

	@media screen and ( max-width: 800px ) {
		padding: 20px 18px;
	}
`;
