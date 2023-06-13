import { Button, Tooltip } from "@nextui-org/react";

interface PowerButtonProps {
    icon: React.ReactNode;
    color: string;
    ariaLabel: string;
    onPress?: () => void;
    render?: boolean;
    tooltip?: string;
    tooltipColor?: string;
}
const PowerButton: React.FC<PowerButtonProps> = ({ icon, color, ariaLabel, tooltip, tooltipColor, onPress, render = true }) => {
    if (!render) {
        return <></>;
    }
    if (tooltip) {
        return (
            <Tooltip content={tooltip} placement="top" color={tooltipColor as any}>
                <Button
                    light
                    auto
                    color={color as any}
                    aria-label={ariaLabel}
                    css={{
                        borderRadius: "$3xl",
                        padding: "0.25rem",
                    }}
                    onPress={onPress}
                >
                    {icon}
                </Button>
            </Tooltip>
        );
    }

    return (
        <Button
            light
            auto
            color={color as any}
            css={{
                borderRadius: "$3xl",
                padding: "0.25rem",
            }}
        >
            {icon}
        </Button>
    );
}

export default PowerButton;