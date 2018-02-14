import {
  GraphQLInt,
  GraphQLScalarType,
  GraphQLFloat,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';

export const ScalarInt = GraphQLInt;
export const ScalarFloat = GraphQLFloat;
export const ScalarID = GraphQLID;
export const ScalarString = GraphQLString;
export const ScalarBool = GraphQLBoolean;
export const ScalarDate = GraphQLDate;
export const ScalarTime = GraphQLTime;
export const ScalarDateTime = GraphQLDateTime;
