/* eslint-disable */
/**
    NOTE: Do not set style to elements explicitly (like element.setAttribute('style', '...')).
    Browser doesn't allow to change style attribute due to security reason.
    Use element.classList.add/remove instead.    
 */

const sendMessageToParent = data => {
    // Send a message to the parent window (ask for a redirect, or inform it whether the user is authorized)
    window.top.postMessage(
        JSON.stringify({
            name: 'invity-authentication',
            ...data,
        }),
        '*',
    );
};

const disableForm = () => {
    const email = document.getElementById('auth_email');
    if (email) {
        email.getElementsByTagName('input')[0].disabled = true;
    }
    const password = document.getElementById('auth_password');
    if (password) {
        password.getElementsByTagName('input')[0].disabled = true;
    }
    const submitButton = document.getElementById('submit') as HTMLButtonElement;
    submitButton.disabled = true;
};

const showMessage = (type: string, message: string, _disableForm = false) => {
    if (_disableForm) {
        disableForm();
    }
    if (type === 'info') {
        const element = document.getElementById(type);
        element.innerText = message;
        return;
    }

    document.getElementById('error-message').innerText = message;
};

const getVerificationCookie = () => {
    const match = document.cookie.match(new RegExp('(^| )invity_verification_email=([^;]+)'));
    if (match) {
        return match[2];
    }
    return null;
};

const inIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};

const getUrls = (flowType: string) => {
    const urlSearchParameters = new URLSearchParams(window.location.search);
    const returnToUrl = urlSearchParameters.get('return_to');
    const afterVerificationReturnToUrl = urlSearchParameters.get('after_verification_return_to');
    // TODO: check second click on verification link in email

    const authServerUrl = window.location.hash.replace('#', '');
    let flowUrl = `${authServerUrl}/self-service/${flowType}/flows`;
    let redirectUrl = `/account/${flowType}`;
    switch (flowType) {
        case 'verification':
            redirectUrl = '/accounts/invity/registration'; // Trezor Suite relative URL hardcoded
            break;
        case 'settings':
            redirectUrl = '/accounts/invity/settings'; // Trezor Suite relative URL hardcoded
            break;
        case 'recovery':
            redirectUrl = redirectUrl.replace('recovery', 'reset');
            break;
        case 'error':
            flowUrl = `${authServerUrl}/self-service/errors`;
            break;
        // TODO: try remove identity schema json
        default:
            break;
    }
    const browserUrl = new URL(`${authServerUrl}/self-service/${flowType}/browser`);
    if (returnToUrl) {
        browserUrl.searchParams.append('return_to', returnToUrl);
    }
    if (afterVerificationReturnToUrl) {
        // Make sure user is redirected back to correct URL after registration and verification link in email was clicked.
        browserUrl.searchParams.append(
            'after_verification_return_to',
            afterVerificationReturnToUrl,
        );
    }

    return { authServerUrl, flowUrl, redirectUrl, browserUrl: browserUrl.toString() };
};

const exit = () => {
    // Used to stop this script's execution, for example right after requesting a redirect
    // eslint-disable-next-line no-throw-literal
    throw 'exit';
};

const die = message => {
    // Same as exit, but will also print error details to console.error
    if (typeof message === 'object' && message !== null) {
        throw new Error(JSON.stringify(message));
    } else {
        throw new Error(message);
    }
};

const getFlowId = (urls, flowType) => {
    const urlParams = new URLSearchParams(window.location.search);
    const flowId = urlParams.get('flow');
    if (flowType === 'error') {
        sendMessageToParent({ action: 'resize', data: document.body.scrollHeight });
        return urlParams.get('error');
    }

    if (!flowId) {
        // Flow id not found, redirect to kratos browser, get a new flow ID and return back to this pageconsole.log('checkIsIframe');
        window.location.replace(urls.browserUrl);
        exit();
    }
    sendMessageToParent({ action: 'resize', data: document.body.scrollHeight });
    return flowId;
};

const getFlowInfo = async (urls, flowType) => {
    // Get flow Id from URL params
    const flowId = getFlowId(urls, flowType);
    // Request form info for the flow ID, or get redirected
    let url = `${urls.flowUrl}?id=${flowId}`;
    if (flowType === 'error') {
        url = `${urls.flowUrl}?error=${flowId}`;
    }
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
        },
        credentials: 'include',
    });
    const json = await response.json();
    if (json.error) {
        if (json?.error?.details?.redirect_to) {
            // Flow has expired - reload an iframe & get a new flow ID
            window.location.replace(json.error.details.redirect_to);
            return exit();
        }
        showMessage('error', 'An unexpected error has occured.');
        die(json.error);
    }
    return json;
};

const prefillEmail = (email = '', flowType) => {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    if (email && flowType === 'settings') {
        emailInput.placeholder = email;
        return true;
    }
    // Prefill the verification email field using either whoami data, or a cookie
    if (!['verification', 'recovery'].includes(flowType)) {
        return null;
    }
    if (!email) {
        email = getVerificationCookie();
    }
    if (email) {
        emailInput.value = email;
        return true;
    }
    return false;
};

const setLogoutOnSubmit = () => {
    const form = document.getElementById('form');
    form.onsubmit = () => {
        sendMessageToParent({ action: 'logout' }); // Log out the user, then redirect to /account/login
        return false; // do not submit the form
    };
};

const reloadAfterTimeout = (urls, flowType) => {
    // One minute before the flow ID is about to expire, reload the form to get a new one
    let expirationTimeMinutes;
    switch (flowType) {
        case 'login':
        case 'registration':
        case 'settings':
            expirationTimeMinutes = 30;
            break;

        case 'verification':
        case 'recovery':
            expirationTimeMinutes = 120;
            break;

        default:
            die(`Unexpected flowType: ${flowType}`);
            break;
    }
    if (expirationTimeMinutes) {
        setTimeout(() => {
            window.location.replace(urls.browserUrl);
        }, expirationTimeMinutes * 60 * 1000);
    }
};

const checkPrivilegedSession = (authenticatedAt: number, flowType) => {
    if (flowType !== 'settings') {
        return;
    }
    const maxPrivilegedSessionTimeMinutes = 5; // This value corresponds to flows.settings.privileged_session_max_age from Kratos config
    const timeDiff = new Date().valueOf() - authenticatedAt;
    const minutesSinceAuthentication = Math.floor(timeDiff / 1000 / 60);
    if (minutesSinceAuthentication > maxPrivilegedSessionTimeMinutes) {
        setLogoutOnSubmit(); // Session already expired, make the submit button log out the user
    } else {
        // After the privileged session expires, make the submit button log out the user
        setTimeout(() => {
            setLogoutOnSubmit();
        }, maxPrivilegedSessionTimeMinutes * 60 * 1000 - timeDiff);
    }
};

const checkWhoami = async (flowType, urls) => {
    try {
        const response = await fetch(`${urls.authServerUrl}/sessions/whoami`, {
            credentials: 'include',
        });
        const data = await response.json();
        if (data.error) {
            // Unauthorized, prefill e-mail from cookie (only for verification & recovery flows)
            if (!prefillEmail(null, flowType)) {
                exit();
            }
        } else {
            checkPrivilegedSession(new Date(data.authenticated_at).valueOf(), flowType); // If privileged session expired, log out on submit
            const verifiableAddress = data.identity.verifiable_addresses[0];
            if (
                ['registration', 'login'].includes(flowType) ||
                (flowType === 'verification' && verifiableAddress.verified)
            ) {
                sendMessageToParent({ action: 'login-successful' });
                exit();
            } else if (flowType === 'recovery') {
                if (verifiableAddress.verified) {
                    sendMessageToParent({ action: 'settings' });
                } else {
                    sendMessageToParent({ action: 'verification' });
                }
                exit();
            }
            prefillEmail(verifiableAddress.value, flowType); // pre-fill email from user info (if needed)
        }
    } catch (error) {
        if (error !== 'exit') {
            die(error.message);
        }
    }
};

const parseFlowAttributes = (flowData, flowType) => {
    if (flowData.errors) {
        const message = 'An unexpected error has occured.';
        // TODO: correct action and message
        sendMessageToParent({ action: { type: 'showMessage', variant: 'danger', text: message } });
        console.error(flowData.errors[0].message);
        exit();
    }

    const form = document.getElementById('form') as HTMLFormElement;
    form.action = flowData.ui.action;
    form.method = flowData.ui.method;

    if (flowData.error) {
        showMessage('error', 'An unexpected error has occured.');
        die(flowData.error);
    }

    for (let i = 0; i < flowData.ui.nodes.length; i++) {
        const node = flowData.ui.nodes[i];
        if (node.attributes.name === 'csrf_token') {
            const csrfTokenHiddenInput = document.getElementById('csrf_token') as HTMLInputElement;
            csrfTokenHiddenInput.value = node.attributes.value;
        } else if (
            ['password_identifier', 'traits.email', 'email'].includes(node.attributes.name) &&
            flowType !== 'settings'
        ) {
            const element = document.getElementById('email') as HTMLInputElement;
            element.setAttribute('name', node.attributes.name);
            if (node.attributes.value) {
                element.value = node.attributes.value;
            }
        } else if (node.attributes.name === 'password') {
            const element = document.getElementById('password');
            element.setAttribute('name', node.attributes.name);
        } else if (node.attributes.name === 'method' && node.attributes.value) {
            const submitButton = document.getElementById('submit') as HTMLButtonElement;
            submitButton.value = node.attributes.value;
        }
        // Attribute-specific messages
        if (node.messages.length > 0) {
            const message = node.messages[0];
            // Field-specific messages
            if (message.id === 4000005) {
                // data breach message has the same ID :(
                if (message.text.includes('data breaches')) {
                    // The password can not be used because the password has been found in data breaches and must no longer be used.
                    // TODO
                    // message.text = translate(
                    //     translations,
                    //     'accounts.insecure_password',
                    //     message.text,
                    // );
                } else if (message.text.includes('too similar')) {
                    // The password can not be used because the password is too similar to the user identifier.
                    // message.text = translate(
                    //     translations,
                    //     'accounts.password_too_similar_to_email',
                    //     message.text,
                    // );
                } else {
                    // The password can not be used because password length must be at least 6 characters but only got N.
                    // message.text = translate(
                    //     translations,
                    //     'accounts.password_too_short',
                    //     message.text,
                    // );
                }
            }
            showMessage(message.type, message.text);
        }
    }

    // General messages
    if (flowData.ui.messages) {
        const message = flowData.ui.messages[0];
        switch (message.id) {
            case 4000007:
                // User already registered - redirect to verification anyway
                disableForm();
                sendMessageToParent({ action: 'registration-successful' });
                exit();
                break;

            case 4000006:
                message.text =
                    'The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number.';
                break;

            case 1060002:
                // Password recovery email sent.
                disableForm();
                sendMessageToParent({ action: 'recovery-sent' }); // "recovery mail sent" page
                exit();
                break;

            case 1050001:
                // Your changes have been saved!
                const { text } = message;
                if (flowType === 'settings') {
                    sendMessageToParent({ action: 'settings-successful' });
                    exit();
                } else {
                    message.text = text;
                }
                break;

            case 4060005:
                // The flow has expired - reload the page
                sendMessageToParent({ action: 'reload' });
                exit();
                break;

            case 1070001:
                message.text =
                    'An email containing a recovery link has been sent to the email address you provided.';
                break;

            default:
                console.error(`Unexpected message id: ${message.id}`);
                break;
        }
        showMessage(message.type, message.text);
    }
    sendMessageToParent({ action: 'resize', data: document.body.scrollHeight });
};

const checkIsIframe = urls => {
    if (!inIframe()) {
        window.location.replace(urls.redirectUrl);
        exit();
    } else {
        window.document.body.classList.remove('hidden');
    }
};

const checkPasswordLength = password => {
    if (password.length < 5) {
        showMessage('error', 'You password should be at least 5 characters long!');
        sendMessageToParent({ action: 'resize', data: document.body.scrollHeight });
        return false;
    }
    return true;
};

const checkFlowType = flowType => {
    if (!['registration', 'recovery', 'settings'].includes(flowType)) {
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (flowType === 'registration' && urlParams.get('state') === 'success') {
        // User successfully registered - redirect to verification
        disableForm();
        sendMessageToParent({ action: 'verification' });
        exit();
    } else if (flowType === 'settings') {
        const form = document.getElementById('form');
        form.onsubmit = () => {
            sendMessageToParent({ action: 'loading' });
            return true;
        };
        return;
    } else if (flowType === 'recovery') {
        const form = document.getElementById('form');
        form.onsubmit = () => {
            sendMessageToParent({ action: 'loading' });
            return true;
        };
        document.getElementById('verification').remove();
    }
    const form = document.getElementById('form');
    form.onsubmit = () => {
        const passwordDiv = document.getElementById('auth_password');
        let password = '';
        if (passwordDiv) {
            // Kratos expects password input to be of type "password" (can be toggled to "text" by user to reveal it)
            passwordDiv.getElementsByTagName('input')[0].type = 'password';
            password = passwordDiv.getElementsByTagName('input')[0].value;
            if (checkPasswordLength(password) === false) {
                return false;
            }
        }
        const email = document.getElementById('auth_email').getElementsByTagName('input')[0].value;
        if (email) {
            // Save email to a temporary cookie, so we can pre-fill the email verification form field for unauthorized users.
            // This cookie will be removed in the post-vefirication page
            document.cookie = `invity_verification_email=${email}; SameSite=Lax; path=/`;
        }
        return true;
    };
};

const onEmailChange = event => {
    const submit = document.getElementById('submit') as HTMLButtonElement;
    const emailWrapper = document.getElementById('email').parentElement;
    const emailErrorDiv = document.getElementById('error-email');
    const passwordErrorDiv = document.getElementById('error-password');
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(event.target.value).toLowerCase())) {
        emailWrapper.classList.add('valid');
        emailWrapper.classList.remove('invalid');
        emailErrorDiv.innerText = '';
        submit.disabled = false;
        if (passwordErrorDiv && passwordErrorDiv.textContent) {
            submit.disabled = true;
        }
    } else {
        emailWrapper.classList.add('invalid');
        emailWrapper.classList.remove('valid');
        emailErrorDiv.innerText = 'Please, enter a valid email address';
        submit.disabled = true;
    }
    sendMessageToParent({ action: 'resize', data: document.body.scrollHeight });
};

const onPasswordChange = event => {
    const submit = document.getElementById('submit') as HTMLButtonElement;
    const passwordWrapper = document.getElementById('password').parentElement;
    const emailErrorDiv = document.getElementById('error-email');
    const passwordErrorDiv = document.getElementById('error-password');
    if (event.target.value.length >= 8) {
        passwordWrapper.classList.add('valid');
        passwordWrapper.classList.remove('invalid');
        passwordErrorDiv.innerText = '';
        submit.disabled = false;
        if (emailErrorDiv && emailErrorDiv.textContent) {
            submit.disabled = true;
        }
    } else {
        passwordWrapper.classList.add('invalid');
        passwordWrapper.classList.remove('valid');
        passwordErrorDiv.innerText = 'Your password is too short!';
        submit.disabled = true;
    }
    sendMessageToParent({ action: 'resize', data: document.body.scrollHeight });
};

const addInputValidation = flowType => {
    if (!['login', 'registration', 'settings', 'recovery'].includes(flowType)) {
        return;
    }
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('keydown', onEmailChange);
        emailInput.addEventListener('paste', onEmailChange);
        emailInput.addEventListener('input', onEmailChange);
    }
    const passwordInput = document.getElementById('password');
    if (flowType !== 'login' && passwordInput) {
        passwordInput.addEventListener('keydown', onPasswordChange);
        passwordInput.addEventListener('paste', onPasswordChange);
        passwordInput.addEventListener('input', onPasswordChange);
    }
};

const runFlow = async flowType => {
    sendMessageToParent({ action: 'loading' });
    sendMessageToParent({ action: 'resize', data: document.body.scrollHeight });
    try {
        const urls = getUrls(flowType);
        reloadAfterTimeout(urls, flowType);
        checkIsIframe(urls); // If not an iframe, redirect to react UI
        checkFlowType(flowType); // Do registration & recovery-specific form changes
        addInputValidation(flowType);
        await checkWhoami(flowType, urls); // Get user info and redirect if needed
        const flowData = await getFlowInfo(urls, flowType); // Get flowID from URL params & request form info (or get redirected)
        parseFlowAttributes(flowData, flowType); // Fill the form or show messages according to flow info
        sendMessageToParent({ action: 'loaded' });
    } catch (error) {
        if (error !== 'exit') {
            console.error(error);
        }
    }
};

window.addEventListener('resize', () =>
    sendMessageToParent({ action: 'resize', data: document.body.scrollHeight }),
);
