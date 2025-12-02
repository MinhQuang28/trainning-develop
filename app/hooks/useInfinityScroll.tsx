import React from "react";
import { useFetcher } from "react-router";
import { findArrayByKey } from "~/utils";

type UseInfinityScrollProps<T> = {
    initialData: T[];
    initialCursor: string | null;
    initialHasMore: boolean;
    endpoint?: string;
    dataKey: string;
};

type UseInfinityScrollReturn<T> = {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
    observerRef: React.RefObject<HTMLDivElement | null>;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    isLoading: boolean;
    loadMore: () => void;
    reset: () => void;
};

function useInfinityScroll<T>({
    initialData,
    initialCursor,
    initialHasMore,
    endpoint,
    dataKey
}: UseInfinityScrollProps<T>): UseInfinityScrollReturn<T> {
    const fetcher = useFetcher<{
        data: {
            [key: string]: any;
            nextCursor: string | null;
            hasMore: boolean;
        };
    }>();

    const [data, setData] = React.useState<T[]>(initialData);
    const [nextCursor, setNextCursor] = React.useState<string | null>(initialCursor);
    const [hasMore, setHasMore] = React.useState<boolean>(initialHasMore);

    const scrollRef = React.useRef(null);
    const observerRef = React.useRef(null);

    const loadMore = () => {
        if (!hasMore || fetcher.state !== "idle") return;

        const url = endpoint ? `${endpoint}?cursor=${nextCursor}` : `?cursor=${nextCursor}`;

        fetcher.load(url);
    };

    const reset = () => {
        setData(initialData);
        setNextCursor(initialCursor);
        setHasMore(initialHasMore);
    };
    
    React.useEffect(() => {
        if (fetcher.data && fetcher.state === "idle") {
            const newData = findArrayByKey(fetcher.data.data, dataKey);
            setData((prev) => [...prev, ...newData]);
            setNextCursor(fetcher.data.data.nextCursor);
            setHasMore(fetcher.data.data.hasMore);
        }
    }, [fetcher.data, fetcher.state, dataKey]);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];

                if (target.isIntersecting && fetcher.state === "idle" && hasMore) {
                    loadMore();
                }
            },
            {
                root: scrollRef.current,
                rootMargin: "10px",
                threshold: 0.1
            }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [hasMore, fetcher.state, nextCursor]);

    return {
        data,
        hasMore,
        nextCursor,
        scrollRef,
        observerRef,
        isLoading: fetcher.state !== "idle",
        loadMore,
        reset
    };
}

export default useInfinityScroll;
