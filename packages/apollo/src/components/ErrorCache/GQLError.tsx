import { GraphQLError } from 'graphql';

export default class GQLError {
  error: GraphQLError;

  path: string;

  stacktrace: string[];

  constructor(error: GraphQLError, path: string, stacktrace: string[]) {
    this.error = error;
    this.path = path;
    this.stacktrace = stacktrace;
  }
}
