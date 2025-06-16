import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Scenes =
    | "home"
    | "intro_prison"
    | "hub_1"
    | "dream_3"
    | "hub_2"
    | "falling"
    | "dark_world";

type TransitionContextProps = {
    displayedPage: Scenes;
    isFadingOut: boolean;
    changePage: (page: Scenes) => void;
    handleTransitionEnd: () => void;
};

const TransitionContext = createContext<TransitionContextProps | null>(null);

export function TransitionProvider({ children }: { children: ReactNode }) {
    const [currentPage, setCurrentPage] = useState<Scenes>("hub_1");
    const [displayedPage, setDisplayedPage] = useState<Scenes>("hub_1");
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const changePage = (newPage: Scenes) => {
        if (newPage === currentPage || isFadingOut) return; // Prevent change if fading out.
        setIsFadingOut(true); // Trigger fade-out
        setCurrentPage(newPage);
        setIsLoading(true);
    };

    const handleTransitionEnd = () => {
        console.log("handleTransitionEnd");
        if (isFadingOut) {
            setDisplayedPage(currentPage); // Set new page after fading out
            setIsFadingOut(false);
        }
    };

    return (
        <TransitionContext.Provider
            value={{
                displayedPage,
                isFadingOut,
                changePage,
                handleTransitionEnd,
            }}
        >
            {children}
        </TransitionContext.Provider>
    );
}

export const useTransitionContext = (): TransitionContextProps => {
    const context = useContext(TransitionContext);

    if (!context) {
        throw new Error("useTransitionContext must be used within a NavigationProvider");
    }

    return context;
};
