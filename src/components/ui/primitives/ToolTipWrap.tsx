import { Tooltip } from '@fluentui/react-components';

export default function TooltipWrap({
      children,
      label,
}: {
      children: React.ReactElement;
      label: string;
}) {
      return (
            <Tooltip
                  content={label}
                  relationship="label"
                  showDelay={100}
                  positioning={{ offset: 5 }}
                  withArrow
            >
                  {children}
            </Tooltip>
      );
}
