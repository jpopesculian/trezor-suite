import React from 'react';
import styled from 'styled-components';

import { Input, Textarea, Select, Checkbox, RadioButton, Switch, Button } from '../../index';
import { StoryColumn } from '../../support/Story';

const Heading = styled.h2``;

const SubHeading = styled.h4`
    margin: 10px 0;
`;

const Label = styled.div``;

const SELECT_OPTIONS = [
    {
        label: 'Option one',
        value: 'value-one',
    },
    {
        label: 'Option two',
        value: 'value-two',
    },
    {
        label: 'Option tree',
        value: 'value-tree',
    },
];

export default {
    title: 'Form/Form Elements Summary',
};

export const Basic = ({ ...args }) => (
    <>
        <StoryColumn minWidth={520}>
            <Heading>Input</Heading>
            <SubHeading>Default</SubHeading>
            <Input value="Default input with select" dataTest="input-default" />
            <Input
                value="Input with select"
                dataTest="input-select"
                innerAddon={
                    <Select
                        isClean
                        value={{ label: 'BTC', value: 'BTC' }}
                        options={[
                            { label: 'ETH', value: 'ETH' },
                            { label: 'XRP', value: 'XRP' },
                            { label: 'BCT', value: 'BCT' },
                            { label: 'UAN', value: 'UAN' },
                        ]}
                    />
                }
            />
            <Input variant="small" value="Small input" dataTest="input-default-small" />
            <Input inputState="error" value="Input with error" dataTest="input-default-error" />
            <Input
                inputState="warning"
                value="Input with warning"
                dataTest="input-default-warning"
            />
            <Input
                inputState="success"
                value="Input with success"
                dataTest="input-default-success"
            />
            <Input disabled value="Disabled input" dataTest="input-default-disabled" />
            <SubHeading>Monospace with button</SubHeading>
            <Input
                value="0x3Ebf31732F5A987b4f130Eb359B0975EBcbd68c8"
                dataTest="input-block-monospace-button"
            />
            <SubHeading>Partially hidden</SubHeading>
            <Input
                value="0x3Ebf31732F5A987b4f130Eb359B0975EBcbd68c8"
                dataTest="input-block-monospace-hidden"
                isPartiallyHidden
            />
            <SubHeading>With label &amp; bottom text</SubHeading>
            <Input value="Input label" dataTest="input-label" bottomText="bottom text" />
            <Input
                variant="small"
                value="Small input label"
                dataTest="input-small-label"
                bottomText="bottom text"
            />
            <Input
                inputState="error"
                value="Input label with error"
                dataTest="input-error-label"
                bottomText="bottom text"
            />
            <Input
                inputState="warning"
                value="Input label with warning"
                dataTest="input-warning-label"
                bottomText="bottom text"
                labelAddon={
                    <Button variant="tertiary" icon="QR" onClick={() => {}}>
                        Scan QR code
                    </Button>
                }
            />
            <Input
                inputState="success"
                value="Input label with success"
                dataTest="input-success-label"
                bottomText="bottom text"
                labelAddonIsVisible
                label={<Label>Label left</Label>}
                labelRight={<Label>Label right</Label>}
                labelAddon={
                    <Button
                        variant="tertiary"
                        icon="QR"
                        onClick={() => {
                            console.log('aaa');
                        }}
                    >
                        Scan QR code
                    </Button>
                }
            />
            <Input
                disabled
                value="Disabled input label"
                dataTest="input-disabled-label"
                label={<Label>label</Label>}
                bottomText="bottom text"
            />
        </StoryColumn>
        <StoryColumn minWidth={300} maxWidth={400}>
            <Heading>Textarea</Heading>
            <SubHeading>Default</SubHeading>
            <Textarea value="test value" wrapperProps={{ 'data-test': 'textarea-default' }} />
            <Textarea
                value="test value"
                inputState="success"
                wrapperProps={{ 'data-test': 'textarea-success' }}
                label="Top label"
                bottomText="bottom text"
            />
            <Textarea
                value="test value"
                inputState="warning"
                wrapperProps={{ 'data-test': 'textarea-warning' }}
                label="Top label"
                bottomText="bottom text"
            />
            <Textarea
                value="test value"
                inputState="error"
                wrapperProps={{ 'data-test': 'textarea-error' }}
                label="Top label"
                bottomText="bottom text"
            />
            <Textarea
                wrapperProps={{ 'data-test': 'textarea-label' }}
                label="Top label"
                bottomText="bottom text"
            />
            <Textarea
                value="test value"
                disabled
                wrapperProps={{ 'data-test': 'textarea-disabled' }}
            />
        </StoryColumn>
        <StoryColumn maxWidth={200}>
            <Heading>Switch</Heading>

            <SubHeading>Off</SubHeading>
            <Switch dataTest="switch-off" onChange={() => {}} isChecked={false} />

            <SubHeading>Off disabled</SubHeading>
            <Switch
                dataTest="switch-off-disabled"
                isDisabled
                onChange={() => {}}
                isChecked={false}
            />

            <SubHeading>On</SubHeading>
            <Switch isChecked onChange={() => {}} isDisabled dataTest="switch-on" />

            <SubHeading>On disabled</SubHeading>
            <Switch dataTest="switch-on-disabled" isDisabled onChange={() => {}} isChecked />

            <SubHeading>Off small</SubHeading>
            <Switch onChange={() => {}} isChecked={false} isSmall dataTest="switch-off-small" />

            <SubHeading>Off small disabled</SubHeading>
            <Switch
                isDisabled
                onChange={() => {}}
                isChecked={false}
                isSmall
                dataTest="switch-off-small-disabled"
            />

            <SubHeading>On small</SubHeading>
            <Switch onChange={() => {}} isChecked isSmall dataTest="switch-on-small" />

            <SubHeading>On small disabled</SubHeading>
            <Switch
                isDisabled
                onChange={() => {}}
                isChecked
                isSmall
                dataTest="switch-on-small-disabled"
            />
        </StoryColumn>
        <StoryColumn maxWidth={200}>
            <Heading>Checkbox</Heading>
            <SubHeading>Unchecked</SubHeading>
            <Checkbox onClick={() => {}} data-test="checkbox">
                Label
            </Checkbox>
            <SubHeading>Checked</SubHeading>
            <Checkbox onClick={() => {}} isChecked data-test="checkbox-checked">
                Label
            </Checkbox>
        </StoryColumn>
        <StoryColumn maxWidth={200}>
            <Heading>Radio Buttons</Heading>
            <SubHeading>Unchecked</SubHeading>
            <RadioButton onClick={() => {}} data-test="radio-button">
                Label
            </RadioButton>
            <SubHeading>Checked</SubHeading>
            <RadioButton onClick={() => {}} isChecked data-test="radio-button-checked">
                Label
            </RadioButton>
        </StoryColumn>
        <StoryColumn maxWidth={200}>
            <Heading>Select</Heading>
            <Select
                options={SELECT_OPTIONS}
                topLabel="Not selected"
                wrapperProps={{
                    'data-test': 'select',
                }}
            />
            <Select
                options={SELECT_OPTIONS}
                value={{
                    label: 'Option one',
                    value: 'value-one',
                }}
                topLabel="Selected"
                wrapperProps={{
                    'data-test': 'select-selected',
                }}
            />
            <Select
                options={SELECT_OPTIONS}
                value={{
                    label: 'Option one',
                    value: 'value-one',
                }}
                topLabel="Selected"
                wrapperProps={{
                    'data-test': 'select-small',
                }}
                variant="small"
            />

            <Select
                isDisabled
                topLabel="Disabled"
                wrapperProps={{
                    'data-test': 'select-disabled',
                }}
            />
        </StoryColumn>
    </>
);
