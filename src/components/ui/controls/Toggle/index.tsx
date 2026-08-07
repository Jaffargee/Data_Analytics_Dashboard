import { cn } from '../../../lib/utils';
import { ToggleProps } from './types';
import { Field, Switch } from '@fluentui/react-components';

export default function Toggle({
      checked,
      onChange,
      label,
      description,
      className
}: ToggleProps) {
      return (
            <div className={cn("flex items-center justify-between w-full gap-4", className)}>
                  {/* Toggle pill — sole interactive element */}
                  <Field
                        label={label}
                        hint={description}
                        // disabled={disabled}
                        // Positions the label and hint text on the left, Switch on the right
                        orientation="vertical" 
                  >
                  </Field>
                  <Switch
                        checked={checked}
                        // Triggers Fluent UI's internal change handler properly
                        onChange={(e, data) => onChange(data.checked)}
                        // Aligns the switch indicator natively to the far right
                        labelPosition="before"
                  />
            </div>
      );
}