import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

export default function DefaultLoading({ text }: { text: string }) {
    return (
        <div className="flex bg-background h-screen items-center justify-center">
            <div className="text-foreground">
            <TextShimmer className='font-mono text-sm' duration={1}>
                {text}
            </TextShimmer>
            </div>
        </div>
    );
}