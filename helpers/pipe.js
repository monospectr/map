/**
 * Calling functions one by one, starting with initial value
 * @param {*} initialValue Initial value
 * @param {(function(param: *): *)[]} fns
 * @return {*}
 */
export const pipe = (initialValue, ...fns) => (
    fns.reduce((acc, fn) => fn(acc), initialValue)
)
