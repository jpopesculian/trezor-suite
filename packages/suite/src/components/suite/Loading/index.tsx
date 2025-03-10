import React from 'react';
import styled from 'styled-components';
import { Image } from '@suite-components';

const LoaderWrapper = styled.div`
    margin: auto;
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const Loading = () => (
    <LoaderWrapper data-test="@suite/loading">
        <Image width={80} height={80} image="SPINNER" />
    </LoaderWrapper>
);

export default Loading;
