import ErrorCache from '../../src/components/ErrorCache';

function clone(obj: object) {
  return JSON.parse(JSON.stringify(obj));
}

const data = {
  foo: {
    __typename: 'type',
    id: '123',
    bar: {
      baz: null,
    },
  },
};

const error = {
  graphQLErrors: [
    {
      message: 'something broke',
      path: ['foo', 'bar', 'baz'],
    },
  ],
};

ErrorCache.addErrors({ data, error } as any);

describe('ErrorCache', () => {
  it('Creates error getters from response', () => {
    const dataClone = clone(data);
    ErrorCache.addErrorsToData(dataClone);

    expect(() => dataClone.foo.bar.baz).toThrow('something broke');
  });

  it('Does not error when populating paths that do not exist in the current result', () => {
    const dataClone = clone(data);
    delete dataClone.foo.bar;

    expect(() => ErrorCache.addErrorsToData(dataClone)).not.toThrow();
  });
});
