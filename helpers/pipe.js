/**
 * Вызывает функции поочередно, вызывая их с результатом вызова каждой предыдущей, начиная со значения initialValue
 * @example
 * pipe(value, aFn, bFn, cFn) // то же что и cFn(bFn(aFn(value)))
 * Calling functions one by one, starting with initial value
 * @param {any} initialValue Initial value
 * @param {(function(param: any): any)} fns
 * @return {any}
 */
export const pipe = (initialValue, ...fns) => (
    fns.reduce((acc, fn) => fn(acc), initialValue)
)
