import _ from 'lodash';

type RecordType = Record<string, any>; // 定义一个通用的对象类型

export function mergeArrays<T extends RecordType, U extends RecordType>(
    a: T[],
    b: U[],
    sourceField: keyof T,
    targetField: keyof U,
): Array<T & Partial<U>> {
    return _.map(a, itemA => ({
        ...itemA,
        ..._.find(b, [targetField, itemA[sourceField]]) as Partial<U>
    }));
}