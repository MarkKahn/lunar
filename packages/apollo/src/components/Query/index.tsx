import React from 'react';
import {
  Query as BaseQuery,
  QueryComponentOptions,
  QueryResult,
  OperationVariables,
} from 'react-apollo';
import { ApolloError } from 'apollo-client';
import { Omit } from 'utility-types';
import ErrorMessage from '@airbnb/lunar/lib/components/ErrorMessage';
import Loader from '@airbnb/lunar/lib/components/Loader';
import renderElementOrFunction, {
  RenderableProp,
} from '@airbnb/lunar/lib/utils/renderElementOrFunction';
import clone from '../../utils/clone';
import { hasNoNullValues, NonNullableKeys } from '../../utils/filters';
import ErrorCache from '../ErrorCache';

export type Props<Data, Vars, T extends RenderableProp | undefined> = Omit<
  QueryComponentOptions<Data, Vars>,
  'children' | 'client'
> & {
  /** Child function to render when the data has been received. */
  children: (
    data: T extends undefined ? Data | null : NonNullableKeys<Data>,
    result: QueryResult<Data, Vars>,
  ) => React.ReactNode;
  /**
   * Render an element or a function that returns an element when an error occurs.
   * The function is passed the `ApolloError` as an argument.
   * When not defined, this defaults to `ErrorMessage`.
   */
  error?: RenderableProp<ApolloError>;
  /**
   * Render an element or a function that returns an element while loading.
   * When not defined, this defaults to `Loader`.
   */
  loading?: RenderableProp;
  /**
   * Allow graphql errors to be passed to the render function.  If this is true the render function
   * may receive partial data and is expected to be able to handle `result.error.graphQLErrors`
   */
  ignoreGraphQLErrors?: boolean;
  /**
   * An empty data response is considered to be an error and will be passed to the `error` function.
   */
  onEmptyData: T;
};

/**
 * A declarative component to make GraphQL queries.
 * Based on Apollo's [Query](https://www.apollographql.com/docs/react/essentials/queries.html#props) component.
 */
export default class Query<
  Data = any,
  Vars = OperationVariables,
  T extends RenderableProp | undefined = undefined
> extends React.Component<Props<Data, Vars, T>> {
  static defaultProps = {
    ignoreGraphQLErrors: false,
    notifyOnNetworkStatusChange: false,
    partialRefetch: false,
    pollInterval: 0,
    skip: false,
    ssr: false,
    variables: {},
  };

  private handleRender = (result: QueryResult<Data, Vars>) => {
    const { loading, ignoreGraphQLErrors, onEmptyData, error } = this.props;

    if (result.loading) {
      return renderElementOrFunction(loading) || <Loader static />;
    }

    if (onEmptyData && !result.data) {
      return onEmptyData();
    } else {
      result.data;
    }

    if (result.error && (!ignoreGraphQLErrors || result.error.networkError)) {
      return renderElementOrFunction(error, result.error) || <ErrorMessage error={result.error} />;
    }

    const clonedResult = clone(result);
    ErrorCache.processResult(clonedResult);

    return this.props.children(clonedResult.data || null, clonedResult);
  };

  render() {
    const { children, loading, error, ...props } = this.props;

    return <BaseQuery<Data, Vars> {...(props as any)}>{this.handleRender}</BaseQuery>;
  }
}

const foo = (
  <Query<{ x: string }, null, () => string> onEmptyData={() => '123'}>
    {(data, result) => 'test'}
  </Query>
);
