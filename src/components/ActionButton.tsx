// components
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

type ActionButtonProps = {
    onClick: () => void;
    loading?: boolean;
}

function ActionButton({ onClick, loading }: ActionButtonProps) {

    const handleTask = () => {
        onClick();
    }

    return (
        <Button onClick={ handleTask } disabled={loading} className="w-full">
            { loading ? "Running Analysis..." : "Run Analysis"}
            <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
    )
}

export default ActionButton;