import React, { ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { styled } from 'styles/stitches/stitches.config';

const StyledContent = styled(TooltipPrimitive.Content, {
	backgroundColor: '$primary800',
	p: '$8',
	borderRadius: '$12',
	maxWidth: '260px',
	fontSize: '$12',
	lineHeight: '$16',
	textAlign: 'center',
	color: '$white',
	border: 'none',
	minWidth: '141px'
});

const StyledArrow = styled(TooltipPrimitive.Arrow, { fill: '$primary800' });

const Tooltip: React.FC<{ content: string | ReactNode; children: ReactNode }> = ({
	children,
	content
}) => {
	return (
		<TooltipPrimitive.Root delayDuration={200}>
			<TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
			<StyledContent avoidCollisions side="top" align="center">
				{content}
				<StyledArrow width={16} height={5} />
			</StyledContent>
		</TooltipPrimitive.Root>
	);
};

export default Tooltip;
