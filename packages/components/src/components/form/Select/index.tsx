import React, { useCallback, useRef } from 'react';
import ReactSelect, {
    components as ReactSelectComponents,
    Props as ReactSelectProps,
    OptionsType,
    GroupedOptionsType,
    StylesConfig,
    ControlProps,
    OptionProps,
    NamedProps,
} from 'react-select';
import styled, { css } from 'styled-components';
import { NEUE_FONT_SIZE, FONT_WEIGHT, FONT_SIZE } from '../../../config/variables';
import { useTheme } from '../../../utils';
import { InputVariant, InputState, SuiteThemeColors } from '../../../support/types';
import { GroupHeadingProps } from 'react-select/src/components/Group';
import {
    Label,
    LabelLeft,
    INPUT_HEIGHTS,
    INPUT_BORDER_RADIUS,
    INPUT_BORDER_WIDTH,
    getInputStateTextColor,
} from '../InputStyles';
import { darken } from 'polished';

const selectStyle = (
    isSearchable: boolean,
    withDropdownIndicator = true,
    variant: InputVariant,
    hideTextCursor: boolean,
    isClean: boolean,
    minWidth: string,
    theme: SuiteThemeColors,
    inputState?: InputState,
): StylesConfig<Option, boolean> => ({
    singleValue: base => ({
        ...base,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 'initial',
        margin: 0,
        padding: '0 8px',
        color: isClean ? theme.TYPE_LIGHT_GREY : theme.TYPE_DARK_GREY,
        fontSize: NEUE_FONT_SIZE.SMALL,
        fontWeight: FONT_WEIGHT.MEDIUM,
        borderStyle: 'none',
        justifyContent: isClean ? 'flex-end' : 'flex-start',
        position: 'static',
        transform: 'none',
        '&:hover': {
            cursor: hideTextCursor || !isSearchable ? 'pointer' : 'text',
        },
    }),
    control: (base, { isDisabled }) => {
        const borderColor = inputState
            ? getInputStateTextColor(inputState, theme)
            : theme.STROKE_GREY;

        return {
            ...base,
            display: 'flex',
            alignItems: 'center',
            fontSize: FONT_SIZE.SMALL,
            height: isClean ? 22 : INPUT_HEIGHTS[variant],
            borderRadius: INPUT_BORDER_RADIUS,
            borderWidth: INPUT_BORDER_WIDTH,
            borderColor,
            borderStyle: isClean ? 'none' : 'solid',
            backgroundColor: isDisabled && !isClean ? theme.BG_GREY : 'transparent',
            boxShadow: 'none',
            flexWrap: 'nowrap',
            cursor: 'pointer',
            '&:hover': {
                borderColor: darken(
                    theme.HOVER_DARKEN_FILTER,
                    inputState ? getInputStateTextColor(inputState, theme) : theme.STROKE_GREY,
                ),
                '.react-select__dropdown-indicator': {
                    color: darken(theme.HOVER_DARKEN_FILTER, theme.STROKE_GREY),
                },
            },
            '&:focus-within': {
                borderColor: inputState
                    ? darken(theme.HOVER_DARKEN_FILTER, getInputStateTextColor(inputState, theme))
                    : theme.TYPE_LIGHT_GREY,
                '.react-select__dropdown-indicator': {
                    color: theme.TYPE_LIGHT_GREY,
                },
            },
        };
    },
    valueContainer: base => ({
        ...base,
        border: 0,
        padding: isClean ? '0 3px 0 0' : '2px 8px',
        fontWeight: isClean ? FONT_WEIGHT.MEDIUM : FONT_WEIGHT.REGULAR,
        minWidth,
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: isClean ? 'flex-end' : 'flex-start',
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: (base, { isDisabled, isFocused }) => ({
        ...base,
        display: !withDropdownIndicator || isDisabled ? 'none' : 'flex',
        alignItems: 'center',
        color: isClean ? theme.TYPE_LIGHTER_GREY : theme.STROKE_GREY,
        cursor: 'pointer',
        path: '',
        padding: isClean ? 0 : '10px 16px',
        transform: isFocused ? 'rotate(180deg)' : 'none',
        transition: `transform 0.15s cubic-bezier(0.68, -0.02, 0.21, 1.1)`,
    }),
    menu: base => ({
        ...base,
        width: 'max-content',
        minWidth: '100%',
        background: theme.BG_WHITE_ALT,
        margin: '5px 0',
        boxShadow: `box-shadow: 0 4px 10px 0 ${theme.BOX_SHADOW_BLACK_20}`,
        zIndex: 9,
    }),
    menuList: base => ({
        ...base,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        background: theme.BG_WHITE_ALT,
        borderRadius: 8,
        padding: 8,
    }),
    groupHeading: base => ({
        ...base,
        fontSize: NEUE_FONT_SIZE.TINY,
        textTransform: 'initial',
        margin: 0,
        padding: 8,
    }),
    group: base => ({
        ...base,
        padding: 0,
        '& + &': {
            borderTop: `1px solid ${theme.BG_WHITE_ALT_HOVER}`,
            paddingTop: 4,
            marginTop: 4,
        },
    }),
    option: (base, { isFocused }) => ({
        ...base,
        color: theme.TYPE_DARK_GREY,
        background: isFocused ? theme.BG_WHITE_ALT_HOVER : theme.BG_WHITE_ALT,
        borderRadius: 5,
        padding: 8,
        fontSize: NEUE_FONT_SIZE.SMALL,
        fontWeight: FONT_WEIGHT.MEDIUM,
        '&:hover': {
            cursor: 'pointer',
            background: theme.BG_WHITE_ALT_HOVER,
        },
        '&:active': {
            background: theme.BG_WHITE_ALT_HOVER,
        },
    }),
    input: (base, props) => ({
        ...base,
        paddingLeft: (props as any).value && 16,
        fontSize: NEUE_FONT_SIZE.NORMAL,
        color: hideTextCursor ? 'transparent' : theme.TYPE_DARK_GREY,
        '& input': {
            textShadow: hideTextCursor ? `0 0 0 ${theme.TYPE_DARK_GREY} !important` : 'none',
        },
        '&:focus': {
            paddingLeft: 16,
        },
    }),
    placeholder: base => ({
        ...base,
        fontWeight: FONT_WEIGHT.MEDIUM,
        fontSize: NEUE_FONT_SIZE.SMALL,
        padding: '0 6px',
    }),
});

const Wrapper = styled.div<Pick<SelectProps, 'width' | 'isClean'>>`
    width: ${({ width }) => (width ? `${width}px` : '100%')};

    ${({ isClean }) =>
        !isClean &&
        css`
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        `}
`;

const BottomText = styled.div<Pick<SelectProps, 'inputState'>>`
    display: flex;
    font-size: ${FONT_SIZE.TINY};
    color: ${({ inputState, theme }) => getInputStateTextColor(inputState, theme)};
    padding: 10px 10px 0 10px;
    min-height: 27px;
`;

/** Custom Type Guards to check if options are grouped or not */
const isOptionGrouped = (
    x: OptionsType<Option> | GroupedOptionsType<Option>,
): x is GroupedOptionsType<Option> => (x as GroupedOptionsType<Option>)[0]?.options !== undefined;

interface Option {
    value: string;
    label: string;
}

interface CommonProps extends Omit<ReactSelectProps, 'components' | 'isSearchable'> {
    withDropdownIndicator?: boolean;
    isClean?: boolean;
    label?: React.ReactNode;
    wrapperProps?: Record<string, any>;
    variant?: InputVariant;
    noError?: boolean;
    bottomText?: React.ReactNode;
    hideTextCursor?: boolean; // this prop hides blinking text cursor
    minWidth?: string;
    inputState?: InputState;
}

// Make sure isSearchable can't be defined if useKeyPressScroll===true
// If useKeyPressScroll is false or undefined, isSearchable is a boolean value
type KeyPressScrollProps =
    | { useKeyPressScroll: true; isSearchable?: never }
    | { useKeyPressScroll?: false; isSearchable?: boolean };

export type SelectProps = CommonProps & KeyPressScrollProps;

export const Select = ({
    hideTextCursor = false,
    withDropdownIndicator = true,
    className,
    wrapperProps,
    isClean = false,
    label,
    width,
    variant = 'large',
    noError = true,
    bottomText,
    useKeyPressScroll,
    isSearchable = false,
    minWidth = 'initial',
    inputState,
    onChange,
    'data-test': dataTest,
    ...props
}: SelectProps) => {
    const selectRef = useRef<ReactSelect<Option>>(null);

    const theme = useTheme();

    const lastKeyPressTimestamp = useRef(0);
    const searchedTerm = useRef('');

    const findOption = useCallback((options: OptionsType<Option>, query: string) => {
        let foundOption;
        let lowestIndexOfFirstOccurrence = Infinity;

        for (let i = 0; i < options.length; i++) {
            const indexOfFirstOccurrence = (options[i].label || '')
                .toLowerCase()
                .indexOf(query.toLowerCase());

            if (
                indexOfFirstOccurrence >= 0 &&
                indexOfFirstOccurrence < lowestIndexOfFirstOccurrence
            ) {
                lowestIndexOfFirstOccurrence = indexOfFirstOccurrence;
                foundOption = options[i];
            }
        }

        return foundOption;
    }, []);

    const scrollToOption = useCallback((option: Option) => {
        if (selectRef.current) {
            // As per https://github.com/JedWatson/react-select/issues/3648
            selectRef.current.select.scrollToFocusedOptionOnUpdate = true;
            selectRef.current.select.setState({
                focusedValue: null,
                focusedOption: option,
            });
        }
    }, []);

    const onKeyDown = useCallback(
        async (event: React.KeyboardEvent) => {
            if (!useKeyPressScroll || !selectRef.current) {
                return;
            }

            const charValue = event.key;

            const currentTimestamp = new Date().getTime();
            const timeSincePreviousKeyPress = currentTimestamp - lastKeyPressTimestamp.current;

            lastKeyPressTimestamp.current = currentTimestamp;

            if (timeSincePreviousKeyPress > 800) {
                searchedTerm.current = charValue;
            } else {
                searchedTerm.current += charValue;
            }

            const { options } = selectRef.current.select.props;

            if (options && options.length > 1) {
                let optionsToSearchThrough: OptionsType<Option> = [];

                if (isOptionGrouped(options)) {
                    options.forEach(o => {
                        optionsToSearchThrough = optionsToSearchThrough.concat(o.options);
                    });
                } else {
                    optionsToSearchThrough = options;
                }

                const optionToFocusOn = findOption(optionsToSearchThrough, searchedTerm.current);

                const lastOption = optionsToSearchThrough[optionsToSearchThrough.length - 1];

                if (optionToFocusOn && lastOption) {
                    /*
                        The reason why I want to scroll to the last option first is, that I want the focused item to
                        appear on the top of the list - I achieve that behavior by scrolling "from bottom-to-top".
                        The default scrolling behavior is "from top-to-bottom". In that case the focused option appears at the bottom
                        of options list, which is not a great UX.
                    */

                    await scrollToOption(lastOption);

                    scrollToOption(optionToFocusOn);
                }
            }
        },
        [findOption, scrollToOption, useKeyPressScroll],
    );

    const Control = useCallback(
        (controlProps: ControlProps<Option, boolean>) => (
            <ReactSelectComponents.Control
                {...controlProps}
                innerProps={
                    {
                        ...controlProps.innerProps,
                        'data-test': `${dataTest}/input`,
                    } as ControlProps<Option, boolean>['innerProps']
                }
            />
        ),
        [dataTest],
    );

    const Option = useCallback(
        (optionProps: OptionProps<Option, boolean> & { value: string }) => (
            <ReactSelectComponents.Option
                {...optionProps}
                innerProps={
                    {
                        ...optionProps.innerProps,
                        'data-test': `${dataTest}/option/${optionProps.value}`,
                    } as OptionProps<Option, boolean>['innerProps']
                }
            />
        ),
        [dataTest],
    );

    const GroupHeading = useCallback(
        (groupHeadingProps: GroupHeadingProps<Option, boolean> & { data: any }) =>
            groupHeadingProps?.data?.label ? (
                <ReactSelectComponents.GroupHeading {...groupHeadingProps} />
            ) : null,
        [],
    );

    const handleOnChange = useCallback<Required<NamedProps>['onChange']>(
        (value, { action }) => {
            if (action === 'select-option') {
                selectRef.current?.blur();
            }

            onChange?.(value);

            return null;
        },
        [onChange],
    );

    return (
        <Wrapper className={className} width={width} isClean={isClean} {...wrapperProps}>
            {label && (
                <Label>
                    <LabelLeft>{label}</LabelLeft>
                </Label>
            )}

            <ReactSelect
                ref={selectRef}
                onKeyDown={onKeyDown}
                classNamePrefix="react-select"
                openMenuOnFocus
                styles={selectStyle(
                    isSearchable,
                    withDropdownIndicator,
                    variant,
                    hideTextCursor,
                    isClean,
                    minWidth,
                    theme,
                    inputState,
                )}
                onChange={handleOnChange}
                isSearchable={isSearchable}
                {...props}
                components={{ Control, Option, GroupHeading, ...props.components }}
            />

            {!noError && <BottomText inputState={inputState}>{bottomText}</BottomText>}
        </Wrapper>
    );
};
