import React, { useContext, useRef, createContext } from 'react';

type ModalContextData = {
    isDisabled?: boolean;
    modalTarget: React.RefObject<HTMLDivElement> | null;
};

type ModalContextProviderProps = {
    isDisabled?: boolean;
    children: React.ReactNode;
};

const ModalContext = createContext<ModalContextData>({
    modalTarget: null,
});

const useModalDisabled = () => useContext(ModalContext).isDisabled;

export const useModalTarget = () => useContext(ModalContext).modalTarget?.current ?? null;

export const ModalContextProvider = ({ isDisabled, children }: ModalContextProviderProps) => {
    const target = useRef<HTMLDivElement>(null);
    const disabled = useModalDisabled() || isDisabled;
    return (
        <ModalContext.Provider
            value={{
                modalTarget: !disabled ? target : null,
                isDisabled: disabled,
            }}
        >
            <div ref={target} />
            {children}
        </ModalContext.Provider>
    );
};
