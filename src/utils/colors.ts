import colors from 'colors';

export function success(content = 'success', {icon= '✅ '} = {}) {
    console.log(colors.green(icon+content));
}

export function error(content = 'error, please check the error message', {icon='❌ '} = {}) {
    console.log(colors.red(icon+content));
}

export function info(content = 'error, please check the error message', {icon='📣 '} = {}) {
    console.log(colors.black(icon+content));
}