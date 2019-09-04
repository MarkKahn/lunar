import idx from 'idx';
import { QueryResult } from 'react-apollo';
import GQLError from './GQLError';

type path = readonly (number | string)[];
type CacheKey = string;
type GQLResponseObject = { __typename: string; id?: string; _id?: string };

class ErrorCache {
  private cache: Map<CacheKey, Map<path, GQLError>> = new Map();

  private static getCacheKey(obj: GQLResponseObject) {
    const { __typename, id, _id } = obj;
    if (!__typename || !(id || _id)) {
      return null;
    }

    return `${__typename}:${id || _id}` as CacheKey;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  addErrorsToCache(result: QueryResult<any, any>) {
    const errors = idx(result, _ => _.error.graphQLErrors);
    if (!errors) return;

    errors.forEach(error => {
      const { path } = error;
      const dataObj = result.data[path[0]];

      if (!dataObj) {
        return;
      }

      const cacheKey = ErrorCache.getCacheKey(dataObj);
      if (!cacheKey) return;

      if (!this.cache.has(cacheKey)) {
        this.cache.set(cacheKey, new Map());
      }

      this.cache
        .get(cacheKey)!
        .set(
          path,
          new GQLError(error, path.join('.'), idx(error, _ => _.extensions.exception.stacktrace)),
        );
    });
  }

  addErrorsToQueryResult<
    D extends { [key: string]: T } & GQLResponseObject,
    T extends QueryResult<D>
  >(result: T, addErrorGetters: boolean = false): T {
    const { data, error } = result;

    if (data === undefined) return result;

    Object.entries(data).forEach(([, value]) => {
      const cacheKey = ErrorCache.getCacheKey(value);

      if (!cacheKey || !this.cache.has(cacheKey)) return;

      const errors = this.cache.get(cacheKey)!;

      [...errors.entries()].forEach(([path, gqlError]) => {
        let node = data;
        const lastPathIndex = path.length - 1;
        for (let i = 0; i < lastPathIndex; i += 1) {
          node = node[path[i]];

          if (!node) return;
        }

        if (node[path[lastPathIndex]] === null) {
          if (addErrorGetters) {
            Object.defineProperty(node, path[lastPathIndex], {
              get: () => {
                throw gqlError;
              },
            });
          }
        }
      });
    });

    return result;
  }

  processResult(result: QueryResult) {
    this.addErrorsToCache(result);
    this.addErrorsToQueryResult(result);
  }
}

export default new ErrorCache();
